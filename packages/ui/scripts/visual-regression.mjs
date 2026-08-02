import fs from "node:fs";
import path from "node:path";
import { buildTheme } from "../dist/theme/index.js";

const root = process.cwd();
const outDir = path.join(root, "test-results", "visual-regression");
const config = JSON.parse(fs.readFileSync(path.join(root, "tavo-ui.config.json"), "utf8"));

const variants = [
  ["analogous", { ...config, color: { ...config.color, method: "analogous" } }],
  ["monochromatic", { ...config, color: { ...config.color, method: "monochromatic" } }],
  ["glass", { ...config, color: { ...config.color, method: "glass" } }]
];

function escapeStyleText(value) {
  return value.replace(/<\/style/gi, "<\\/style");
}

function htmlFor(name, theme) {
  const { cssText } = buildTheme(theme);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tavo UI visual fixture: ${name}</title>
  <style>${escapeStyleText(cssText)}</style>
  <style>
    main { min-height: 100vh; padding: var(--tui-space-6); color: var(--tui-color-text); font-family: var(--tui-font-family-text); }
    section { display: grid; gap: var(--tui-space-4); max-width: 960px; margin: 0 auto; }
    .row { display: flex; flex-wrap: wrap; gap: var(--tui-space-3); align-items: center; }
    .card { border: var(--tui-border-width) solid var(--tui-color-border); border-radius: var(--tui-radius-surface); background: var(--tui-color-surface); padding: var(--tui-space-5); box-shadow: var(--tui-shadow-md); }
    .button { min-height: var(--tui-size-md); border-radius: var(--tui-radius-control); border: var(--tui-border-width) solid transparent; padding-inline: var(--tui-space-4); font-weight: 800; }
    .primary { background: var(--tui-color-primary-bg); color: var(--tui-color-primary-text); }
    .secondary { background: var(--tui-color-secondary-bg); color: var(--tui-color-secondary-text); }
    input { min-height: var(--tui-size-md); border: var(--tui-border-width) solid var(--tui-color-border); border-radius: var(--tui-radius-control); background: var(--tui-color-surface-raised); color: var(--tui-color-text); padding-inline: var(--tui-space-3); }
  </style>
</head>
<body>
  <main>
    <section>
      <h1>${name}</h1>
      <div class="row"><button class="button primary">Primary</button><button class="button secondary">Secondary</button><input value="Input preview" /></div>
      <div class="card"><h2>Surface card</h2><p>Background, border, shadow, radius, and text tokens in one fixture.</p></div>
      <div class="card" data-tavo-theme="dark"><h2>Nested dark sample</h2><p>Useful for screenshots and visual diff tools.</p></div>
    </section>
  </main>
</body>
</html>`;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const links = [];
for (const [name, theme] of variants) {
  const fileName = `${name}.html`;
  fs.writeFileSync(path.join(outDir, fileName), htmlFor(name, theme));
  links.push(`<li><a href="./${fileName}">${name}</a></li>`);
}

fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html><html><body><h1>Tavo UI visual fixtures</h1><ul>${links.join("")}</ul></body></html>`);
console.log(`Generated visual regression fixtures at ${outDir}`);
