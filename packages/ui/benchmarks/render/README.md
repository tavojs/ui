# SSR render benchmarks

Run the benchmark with:

```sh
npm run benchmark
```

Compare the current run against the tracked baseline with:

```sh
npm run benchmark:report
```

Refresh the tracked baseline after intentional performance changes with:

```sh
npm run benchmark:baseline
```

The command rebuilds the library and then measures server-side rendering with
`@tavojs/core` `renderToString`. Each fixture renders through the Tavo.js style
registry, so the timing includes component markup and SSR style collection.

## Metrics

The runner prints per-fixture and aggregate tables with:

- mean, median, p95, min, and max render time in milliseconds
- operations per second
- rendered HTML bytes
- style tag count and style bytes
- heap delta for each fixture and for the full suite

The benchmark exits non-zero when a component listed in `componentMetadata` has
no fixture, when a fixture is unknown, or when any render throws. Baseline
comparison prints regression warnings, but it does not fail on timing or size
changes yet.

## Baselines and JSON output

`benchmark:report` reads `benchmarks/render/baseline.json` and prints the
fastest fixtures, slowest fixtures, p95 regressions, p95 improvements, and
HTML/style size changes.

The runner also supports:

- `BENCHMARK_BASELINE=path/to/baseline.json`
- `BENCHMARK_JSON=path/to/output.json`
- `BENCHMARK_UPDATE_BASELINE=1`
- `BENCHMARK_ITERATIONS=1000`
- `BENCHMARK_WARMUPS=100`

## Adding fixtures

Add one entry to `componentFixtures` for every public component in
`benchmarks/render/fixtures.mjs`. Use realistic props and children, especially
for components with accessibility labels, compound slots, or generated styles.

Add broader flows to `scenarioFixtures` when a composed UI path should be
tracked separately from individual component render cost.
