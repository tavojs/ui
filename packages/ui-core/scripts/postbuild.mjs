import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function toRelativeImport(fromFile, targetPath) {
  let relative = path.relative(path.dirname(fromFile), targetPath).replaceAll(path.sep, "/");
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

for (const file of walk(distDir)) {
  if (!file.endsWith(".js") && !file.endsWith(".d.ts")) {
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  const rewritten = source
    .replace(/(["'])@\/([^"']+?)\1/g, (_match, quote, sourcePath) => {
      const target = resolveBuiltAlias(sourcePath);
      return `${quote}${toRelativeImport(file, target)}${quote}`;
    })
    .replace(/(["'])(\.{1,2}\/[^"']+)\.(?:ts|tsx)\1/g, "$1$2.js$1");

  if (rewritten !== source) {
    fs.writeFileSync(file, rewritten);
  }
}
