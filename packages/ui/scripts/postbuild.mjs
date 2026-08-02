import fs from "node:fs";
import path from "node:path";
import { compileString } from "sass";
import { componentEntries, groupEntries } from "./component-manifest.mjs";

const root = process.cwd();
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
const preferredComponentPrefixes = new Map([
  ["Button", "tb"],
  ["InputGroup", "tig"],
]);
const componentPrefixMap = buildComponentPrefixMap();
const componentSlugMap = new Map(
  componentEntries.map((entry) => [entry.name, entry.slug])
);
const uiLayerPrelude =
  "@layer tavo-ui.theme,tavo-ui.components,tavo-ui.overrides;";
const componentCssOutputStyle = "compressed";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

for (const file of walk(srcDir)) {
  if (!file.endsWith(".module.scss")) {
    continue;
  }

  const relative = path.relative(srcDir, file);
  const target = path.join(distDir, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
}

function classNamesFromScss(source) {
  const names = new Set();
  const pattern = /\.([_a-zA-Z][-_a-zA-Z0-9]*)/g;
  let match;
  while ((match = pattern.exec(source))) {
    names.add(match[1]);
  }
  return [...names].sort();
}

function scopeNameForScss(relativePath) {
  const parts = relativePath.split(path.sep);
  const baseName =
    parts[0] === "components" && parts[1]
      ? parts[1]
      : path.basename(relativePath, ".module.scss");
  return componentPrefixMap.get(baseName) ?? shortPrefixForName(baseName);
}

function componentWords(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean);
}

function shortPrefixForName(name, length = 1) {
  const preferredPrefix = preferredComponentPrefixes.get(name);
  if (length === 1 && preferredPrefix) {
    return preferredPrefix;
  }

  const words = componentWords(name);
  if (words.length === 1) {
    return expandedPrefixForName(name, Math.max(length + 1, 2));
  }

  const initials = words
    .map((word) => word[0])
    .join("")
    .toLowerCase();
  if (initials.length >= length) {
    return `t${initials.slice(0, length)}`;
  }

  return `t${name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, Math.max(length, 1))}`;
}

function expandedPrefixForName(name, length) {
  return `t${name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, length)}`;
}

function buildComponentPrefixMap() {
  const used = new Set();
  const prefixes = new Map();

  for (const entry of componentEntries) {
    let length = 1;
    let prefix = shortPrefixForName(entry.name);
    while (used.has(prefix)) {
      length += 1;
      prefix = shortPrefixForName(entry.name, length);
    }
    used.add(prefix);
    prefixes.set(entry.name, prefix);
  }

  return prefixes;
}

function classMapForScss(file, source) {
  const relative = path.relative(distDir, file);
  const scope = scopeNameForScss(relative);
  return Object.fromEntries(
    classNamesFromScss(source).map((className) => [
      className,
      `${scope}_${className}`,
    ])
  );
}

function cssIdForScss(file) {
  const relative = path.relative(distDir, file);
  const parts = relative.split(path.sep);
  if (parts[0] === "components" && parts[1]) {
    return `tui.${scopeNameForScss(relative)}`;
  }
  return `tavo-ui.${relative
    .replace(/\.module\.scss$/, "")
    .replaceAll(path.sep, ".")
    .replace(/[^a-zA-Z0-9_.-]/g, "-")
    .toLowerCase()}`;
}

function scopeCssModule(css, classMap) {
  const globals = [];
  const protectedCss = css.replace(
    /:global\(([^)]*)\)/g,
    (_match, globalSelector) => {
      const index = globals.push(globalSelector) - 1;
      return `__TAVO_GLOBAL_${index}__`;
    }
  );

  const scopedCss = protectedCss.replace(
    /(?<!:)\.([_a-zA-Z][-_a-zA-Z0-9]*)/g,
    (match, className) => {
      return classMap[className] ? `.${classMap[className]}` : match;
    }
  );

  return scopedCss.replace(
    /__TAVO_GLOBAL_(\d+)__/g,
    (_match, index) => globals[Number(index)]
  );
}

function wrapComponentLayer(css) {
  return `${uiLayerPrelude}@layer tavo-ui.components{${css}}`;
}

const moduleCss = [];
for (const file of walk(distDir)) {
  if (!file.endsWith(".module.scss")) {
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(distDir, file);
  const result = compileString(source, {
    loadPaths: [srcDir],
    style: componentCssOutputStyle,
  });
  moduleCss.push(
    `/* ${relative} */\n${wrapComponentLayer(
      scopeCssModule(result.css, classMapForScss(file, source))
    )}\n`
  );
}
fs.writeFileSync(path.join(distDir, "components.css"), moduleCss.join("\n"));

function writeIdentityModule(file) {
  const source = fs.readFileSync(file, "utf8");
  const classMap = classMapForScss(file, source);
  const result = compileString(source, {
    loadPaths: [srcDir],
    style: componentCssOutputStyle,
  });
  const cssText = wrapComponentLayer(scopeCssModule(result.css, classMap));
  const targetFile = file.replace(/\.module\.scss$/, ".module.css.js");
  const styleRuntimeImport = toRelativeImport(
    targetFile,
    path.join(distDir, "style-runtime.js")
  );
  const entries = Object.entries(classMap)
    .map(([className, scopedClassName]) => {
      return `  ${JSON.stringify(className)}: ${JSON.stringify(
        scopedClassName
      )}`;
    })
    .join(",\n");
  const body = `import { useStyle as __tuiUseStyle } from ${JSON.stringify(
    styleRuntimeImport
  )};\n\nexport const cssId = ${JSON.stringify(
    cssIdForScss(file)
  )};\nexport const cssText = ${JSON.stringify(
    cssText
  )};\n\nconst classMap = {\n${entries}\n};\n\nconst styles = new Proxy(classMap, {\n  get(target, property) {\n    if (typeof property === "string" && Object.prototype.hasOwnProperty.call(target, property)) {\n      __tuiUseStyle(cssId, cssText);\n    }\n    return target[property];\n  }\n});\n\nexport default styles;\n`;
  fs.writeFileSync(targetFile, body);
}

function rewriteCssEntrypoint(directory) {
  for (const file of walk(directory)) {
    if (file.endsWith(".module.scss")) {
      writeIdentityModule(file);
      fs.rmSync(file, { force: true });
      continue;
    }

    if (file.endsWith(".js")) {
      const source = fs.readFileSync(file, "utf8");
      fs.writeFileSync(
        file,
        source.replace(/\.module\.scss/g, ".module.css.js")
      );
    }
  }
}

function copyThemeScssEntrypoints() {
  const entries = ["breakpoints.scss"];
  for (const entry of entries) {
    const source = path.join(srcDir, "theme", entry);
    if (!fs.existsSync(source)) {
      continue;
    }

    for (const targetDir of [
      path.join(distDir, "theme"),
      path.join(distDir, "css", "theme"),
    ]) {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.copyFileSync(source, path.join(targetDir, entry));
    }
  }
}

function writeBrowserWrapper(targetPath, sourcePath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const sourceImport = toRelativeImport(targetPath, sourcePath);
  fs.writeFileSync(
    targetPath,
    `export * from ${JSON.stringify(sourceImport)};\n`
  );
}

function writeBrowserEntrypoints() {
  const browserDir = path.join(distDir, "browser");
  fs.rmSync(browserDir, { recursive: true, force: true });
  writeBrowserWrapper(
    path.join(browserDir, "index.js"),
    path.join(distDir, "index.js")
  );

  for (const groupName of Object.keys(groupEntries)) {
    writeBrowserWrapper(
      path.join(browserDir, "groups", `${groupName}.js`),
      path.join(distDir, "groups", `${groupName}.js`)
    );
  }

  for (const entry of componentEntries) {
    writeBrowserWrapper(
      path.join(browserDir, "components", entry.name, "index.js"),
      path.join(distDir, "components", entry.name, "index.js")
    );
  }
}

function rewriteDeclarationEntrypoints(directory) {
  for (const file of walk(directory)) {
    if (!file.endsWith(".d.ts")) {
      continue;
    }

    const source = fs.readFileSync(file, "utf8");
    const rewritten = source.replace(
      /(["'])(\.{1,2}\/[^"']+)\.(?:ts|tsx)\1/g,
      "$1$2.js$1"
    );
    if (rewritten !== source) {
      fs.writeFileSync(file, rewritten);
    }
  }
}

function toRelativeImport(fromFile, targetPath) {
  let relative = path
    .relative(path.dirname(fromFile), targetPath)
    .replaceAll(path.sep, "/");
  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }
  return relative;
}

function resolveBuiltAlias(sourcePath) {
  const normalizedPath = sourcePath.replace(/\.(?:ts|tsx)$/, "");
  const fileTarget = path.join(distDir, `${normalizedPath}.js`);
  if (fs.existsSync(fileTarget)) {
    return fileTarget;
  }

  const directoryTarget = path.join(distDir, normalizedPath, "index.js");
  if (fs.existsSync(directoryTarget)) {
    return directoryTarget;
  }

  return fileTarget;
}

function rewriteSourceAliases(directory) {
  for (const file of walk(directory)) {
    if (!file.endsWith(".js") && !file.endsWith(".d.ts")) {
      continue;
    }

    const source = fs.readFileSync(file, "utf8");
    const rewritten = source.replace(
      /(["'])@\/([^"']+?)\1/g,
      (match, quote, sourcePath) => {
        const target = resolveBuiltAlias(sourcePath);
        return `${quote}${toRelativeImport(file, target)}${quote}`;
      }
    );

    if (rewritten !== source) {
      fs.writeFileSync(file, rewritten);
    }
  }
}

rewriteSourceAliases(distDir);
rewriteDeclarationEntrypoints(distDir);
rewriteCssEntrypoint(distDir);

const cssEntryDir = path.join(distDir, "css");
fs.rmSync(cssEntryDir, { recursive: true, force: true });
fs.mkdirSync(cssEntryDir, { recursive: true });
for (const entry of [
  "index.js",
  "index.js.map",
  "index.d.ts",
  "a11y",
  "components",
  "theme",
  "groups",
  "metadata.js",
  "metadata.js.map",
  "metadata.d.ts",
  "style-runtime.js",
  "style-runtime.js.map",
  "style-runtime.d.ts",
  "components.css",
]) {
  const source = path.join(distDir, entry);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(cssEntryDir, entry), { recursive: true });
  }
}
rewriteCssEntrypoint(cssEntryDir);
copyThemeScssEntrypoints();
writeBrowserEntrypoints();

const cliPath = path.join(distDir, "cli", "index.js");
if (fs.existsSync(cliPath)) {
  fs.chmodSync(cliPath, 0o755);
}

const cliTypesPath = path.join(distDir, "cli", "index.d.ts");
if (fs.existsSync(cliTypesPath)) {
  const source = fs.readFileSync(cliTypesPath, "utf8");
  fs.writeFileSync(cliTypesPath, source.replace(/^#!.*\n/, ""));
}
