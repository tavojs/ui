import { performance } from "node:perf_hooks";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import {
  createStyleRegistry,
  renderStyleTags,
  renderToString,
  withStyleRegistry
} from "@tavojs/core";
import { componentMetadata } from "../../dist/metadata.js";
import { componentFixtures, scenarioFixtures } from "./fixtures.mjs";

const iterations = Number.parseInt(process.env.BENCHMARK_ITERATIONS ?? "100", 10);
const warmups = Number.parseInt(process.env.BENCHMARK_WARMUPS ?? "20", 10);
const defaultBaselinePath = "benchmarks/render/baseline.json";
const baselinePath = process.env.BENCHMARK_BASELINE;
const jsonOutputPath = process.env.BENCHMARK_JSON;
const updateBaseline = process.env.BENCHMARK_UPDATE_BASELINE === "1";

const p95RatioWarning = 2;
const p95DeltaWarning = 0.025;
const sizeRatioWarning = 1.25;

if (!Number.isFinite(iterations) || iterations <= 0) {
  throw new Error("BENCHMARK_ITERATIONS must be a positive integer.");
}

if (!Number.isFinite(warmups) || warmups < 0) {
  throw new Error("BENCHMARK_WARMUPS must be a non-negative integer.");
}

function bytes(value) {
  return Buffer.byteLength(value, "utf8");
}

function renderFixture(createVNode) {
  const registry = createStyleRegistry();
  const html = withStyleRegistry(registry, () => renderToString(createVNode()));
  const styles = renderStyleTags(registry);

  return {
    html,
    styles,
    output: `${styles}${html}`
  };
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const index = Math.ceil((p / 100) * values.length) - 1;
  return values[Math.max(0, Math.min(values.length - 1, index))];
}

function summarizeDurations(durations) {
  const sorted = [...durations].sort((a, b) => a - b);
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  const mean = total / durations.length;

  return {
    total,
    mean,
    median: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    ops: mean > 0 ? 1000 / mean : 0
  };
}

function formatMs(value) {
  return value.toFixed(3);
}

function formatOps(value) {
  return value.toFixed(1);
}

function formatBytes(value) {
  if (Math.abs(value) >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
  if (Math.abs(value) >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${Math.round(value)} B`;
}

function fixtureKey(record) {
  return `${record.type}:${record.name}`;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function metricRecord(record) {
  return {
    name: record.name,
    type: record.type,
    category: record.category,
    mean: Number(record.stats.mean.toFixed(6)),
    median: Number(record.stats.median.toFixed(6)),
    p95: Number(record.stats.p95.toFixed(6)),
    min: Number(record.stats.min.toFixed(6)),
    max: Number(record.stats.max.toFixed(6)),
    htmlBytes: record.htmlBytes,
    styleBytes: record.styleBytes,
    styleTags: record.styleTags
  };
}

function aggregateMetricRecord(record) {
  return {
    name: record.name,
    count: record.count,
    mean: Number(record.stats.mean.toFixed(6)),
    median: Number(record.stats.median.toFixed(6)),
    p95: Number(record.stats.p95.toFixed(6)),
    min: Number(record.stats.min.toFixed(6)),
    max: Number(record.stats.max.toFixed(6)),
    avgHtmlBytes: Math.round(record.avgHtmlBytes),
    avgStyleBytes: Math.round(record.avgStyleBytes)
  };
}

function reportPayload({ records, aggregateRecords, suiteHeapDelta }) {
  const fixtureRecords = records.map(metricRecord).sort((a, b) => fixtureKey(a).localeCompare(fixtureKey(b)));
  const fixtures = {};
  for (const record of fixtureRecords) {
    fixtures[fixtureKey(record)] = record;
  }

  const aggregates = {};
  for (const record of aggregateRecords.map(aggregateMetricRecord).sort((a, b) => a.name.localeCompare(b.name))) {
    aggregates[record.name] = record;
  }

  return {
    version: 1,
    benchmark: "ssr-render",
    iterations,
    warmups,
    thresholds: {
      p95RatioWarning,
      p95DeltaWarning,
      sizeRatioWarning
    },
    fixtures,
    aggregates,
    suiteHeapDelta
  };
}

function readBaseline(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ratio(current, baseline) {
  if (!baseline) {
    return current === 0 ? 1 : Number.POSITIVE_INFINITY;
  }
  return current / baseline;
}

function formatDelta(value) {
  return value >= 0 ? `+${formatMs(value)}` : formatMs(value);
}

function compareRecords(current, baseline) {
  const currentEntries = Object.entries(current.fixtures);
  const baselineEntries = Object.entries(baseline.fixtures ?? {});
  const baselineKeys = new Set(baselineEntries.map(([key]) => key));
  const currentKeys = new Set(currentEntries.map(([key]) => key));
  const shared = currentEntries
    .filter(([key]) => baselineKeys.has(key))
    .map(([key, record]) => {
      const previous = baseline.fixtures[key];
      const p95Delta = record.p95 - previous.p95;
      const htmlRatio = ratio(record.htmlBytes, previous.htmlBytes);
      const styleRatio = ratio(record.styleBytes, previous.styleBytes);
      return {
        key,
        name: record.name,
        type: record.type,
        current: record,
        previous,
        p95Delta,
        p95Ratio: ratio(record.p95, previous.p95),
        htmlDelta: record.htmlBytes - previous.htmlBytes,
        htmlRatio,
        styleDelta: record.styleBytes - previous.styleBytes,
        styleRatio
      };
    });

  const missing = baselineEntries.filter(([key]) => !currentKeys.has(key)).map(([key]) => key);
  const added = currentEntries.filter(([key]) => !baselineKeys.has(key)).map(([key]) => key);
  const warnings = shared.filter((item) => (
    item.p95Ratio >= p95RatioWarning ||
    item.p95Delta >= p95DeltaWarning ||
    item.htmlRatio >= sizeRatioWarning ||
    item.styleRatio >= sizeRatioWarning
  ));

  return { shared, missing, added, warnings };
}

function comparisonRow(item) {
  return {
    fixture: item.key,
    p95: `${formatMs(item.current.p95)}ms`,
    baseline: `${formatMs(item.previous.p95)}ms`,
    delta: `${formatDelta(item.p95Delta)}ms`,
    ratio: Number.isFinite(item.p95Ratio) ? `${item.p95Ratio.toFixed(2)}x` : "new",
    html: `${formatBytes(item.current.htmlBytes)} (${formatBytes(item.htmlDelta)})`,
    styles: `${formatBytes(item.current.styleBytes)} (${formatBytes(item.styleDelta)})`
  };
}

function printComparison(current, baseline, filePath) {
  const { shared, missing, added, warnings } = compareRecords(current, baseline);
  console.log(`\nBenchmark baseline comparison: ${filePath}`);

  if (missing.length > 0) {
    console.log(`Missing current fixtures from baseline: ${missing.join(", ")}`);
  }
  if (added.length > 0) {
    console.log(`New fixtures not in baseline: ${added.join(", ")}`);
  }

  const byCurrentP95 = [...shared].sort((a, b) => a.current.p95 - b.current.p95);
  printTable("Fastest fixtures", byCurrentP95.slice(0, 10).map((item) => ({
    fixture: item.key,
    p95: `${formatMs(item.current.p95)}ms`,
    mean: `${formatMs(item.current.mean)}ms`
  })));
  printTable("Slowest fixtures", byCurrentP95.slice(-10).reverse().map((item) => ({
    fixture: item.key,
    p95: `${formatMs(item.current.p95)}ms`,
    mean: `${formatMs(item.current.mean)}ms`
  })));
  printTable("Biggest p95 regressions", [...shared].sort((a, b) => b.p95Delta - a.p95Delta).slice(0, 10).map(comparisonRow));
  printTable("Biggest p95 improvements", [...shared].sort((a, b) => a.p95Delta - b.p95Delta).slice(0, 10).map(comparisonRow));
  printTable("Biggest size changes", [...shared].sort((a, b) => (
    Math.max(Math.abs(b.htmlDelta), Math.abs(b.styleDelta)) - Math.max(Math.abs(a.htmlDelta), Math.abs(a.styleDelta))
  )).slice(0, 10).map(comparisonRow));

  if (warnings.length === 0) {
    console.log("\nNo benchmark regression warnings.");
    return;
  }

  printTable("Benchmark regression warnings", warnings.sort((a, b) => b.p95Delta - a.p95Delta).map(comparisonRow));
}

function validateCoverage() {
  const expected = new Set(componentMetadata.map((component) => component.name));
  const actual = new Set(Object.keys(componentFixtures));
  const missing = [...expected].filter((name) => !actual.has(name)).sort();
  const unknown = [...actual].filter((name) => !expected.has(name)).sort();

  if (missing.length > 0 || unknown.length > 0) {
    const parts = [];
    if (missing.length > 0) parts.push(`Missing component fixtures: ${missing.join(", ")}`);
    if (unknown.length > 0) parts.push(`Unknown component fixtures: ${unknown.join(", ")}`);
    throw new Error(parts.join("\n"));
  }
}

function benchmarkFixture({ name, type, category, createVNode }) {
  for (let index = 0; index < warmups; index += 1) {
    renderFixture(createVNode);
  }

  const beforeHeap = process.memoryUsage().heapUsed;
  const durations = [];
  let lastRender;

  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    lastRender = renderFixture(createVNode);
    durations.push(performance.now() - start);
  }

  const afterHeap = process.memoryUsage().heapUsed;
  const stats = summarizeDurations(durations);

  return {
    name,
    type,
    category,
    durations,
    stats,
    htmlBytes: bytes(lastRender?.html ?? ""),
    styleBytes: bytes(lastRender?.styles ?? ""),
    outputBytes: bytes(lastRender?.output ?? ""),
    styleTags: (lastRender?.styles.match(/<style\b/g) ?? []).length,
    heapDelta: afterHeap - beforeHeap
  };
}

function buildFixtures() {
  const metadataByName = new Map(componentMetadata.map((component) => [component.name, component]));
  const componentEntries = Object.entries(componentFixtures)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, createVNode]) => ({
      name,
      type: "component",
      category: metadataByName.get(name)?.category ?? "unknown",
      createVNode
    }));

  const scenarioEntries = Object.entries(scenarioFixtures)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, createVNode]) => ({
      name,
      type: "scenario",
      category: "scenario",
      createVNode
    }));

  return [...componentEntries, ...scenarioEntries];
}

function aggregate(name, records) {
  const durations = records.flatMap((record) => record.durations);
  const stats = summarizeDurations(durations);
  const avgHtmlBytes = records.reduce((sum, record) => sum + record.htmlBytes, 0) / records.length;
  const avgStyleBytes = records.reduce((sum, record) => sum + record.styleBytes, 0) / records.length;

  return {
    name,
    count: records.length,
    stats,
    avgHtmlBytes,
    avgStyleBytes,
    mean: formatMs(stats.mean),
    median: formatMs(stats.median),
    p95: formatMs(stats.p95),
    min: formatMs(stats.min),
    max: formatMs(stats.max),
    ops: formatOps(stats.ops),
    avgHtml: formatBytes(avgHtmlBytes),
    avgStyles: formatBytes(avgStyleBytes),
    heapDelta: formatBytes(records.reduce((sum, record) => sum + record.heapDelta, 0))
  };
}

function printTable(title, rows) {
  console.log(`\n${title}`);
  console.table(rows);
}

validateCoverage();

console.log(`Tavo UI SSR render benchmark`);
console.log(`Iterations: ${iterations}; warmups: ${warmups}; fixtures: ${Object.keys(componentFixtures).length} components, ${Object.keys(scenarioFixtures).length} scenarios`);

const suiteHeapBefore = process.memoryUsage().heapUsed;
const records = [];

for (const fixture of buildFixtures()) {
  try {
    records.push(benchmarkFixture(fixture));
  } catch (error) {
    throw new Error(`Render benchmark failed for ${fixture.type} fixture "${fixture.name}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

const suiteHeapAfter = process.memoryUsage().heapUsed;

printTable("Per-fixture metrics", records.map((record) => ({
  fixture: record.name,
  type: record.type,
  category: record.category,
  mean: formatMs(record.stats.mean),
  median: formatMs(record.stats.median),
  p95: formatMs(record.stats.p95),
  min: formatMs(record.stats.min),
  max: formatMs(record.stats.max),
  ops: formatOps(record.stats.ops),
  html: formatBytes(record.htmlBytes),
  styleTags: record.styleTags,
  styles: formatBytes(record.styleBytes),
  heapDelta: formatBytes(record.heapDelta)
})));

const componentRecords = records.filter((record) => record.type === "component");
const scenarioRecords = records.filter((record) => record.type === "scenario");
const categories = [...new Set(componentRecords.map((record) => record.category))].sort();
const aggregateRecords = [
  aggregate("all fixtures", records),
  aggregate("all components", componentRecords),
  aggregate("all scenarios", scenarioRecords),
  ...categories.map((category) => aggregate(category, componentRecords.filter((record) => record.category === category)))
];

printTable("Aggregate metrics", aggregateRecords.map(({ stats, avgHtmlBytes, avgStyleBytes, ...record }) => record));

const suiteHeapDelta = suiteHeapAfter - suiteHeapBefore;
const report = reportPayload({ records, aggregateRecords, suiteHeapDelta });
const resolvedBaselinePath = baselinePath ?? (updateBaseline ? defaultBaselinePath : undefined);

if (jsonOutputPath) {
  writeJson(jsonOutputPath, report);
  console.log(`\nWrote benchmark JSON to ${jsonOutputPath}`);
}

if (updateBaseline) {
  writeJson(resolvedBaselinePath, report);
  console.log(`\nUpdated benchmark baseline at ${resolvedBaselinePath}`);
} else if (resolvedBaselinePath) {
  const baseline = readBaseline(resolvedBaselinePath);
  if (baseline) {
    printComparison(report, baseline, resolvedBaselinePath);
  } else {
    console.log(`\nBenchmark baseline not found at ${resolvedBaselinePath}; skipping comparison.`);
  }
}

console.log(`\nSuite heap delta: ${formatBytes(suiteHeapDelta)}`);
