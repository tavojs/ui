import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicPackages = [
  ["@tavojs/ui-core", "packages/ui-core/package.json"],
  ["@tavojs/ui-cli", "packages/ui-cli/package.json"],
  ["@tavojs/ui", "packages/ui/package.json"],
  ["@tavojs/ui-react-native", "packages/ui-react-native/package.json"],
];
const expectedAuthor = "Hrachya Martirosyan";
const expectedLicense = `MIT License

Copyright (c) 2026 Hrachya Martirosyan and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function dependencyEntries(packageJson) {
  return [
    ...Object.entries(packageJson.dependencies ?? {}),
    ...Object.entries(packageJson.optionalDependencies ?? {}),
    ...Object.entries(packageJson.peerDependencies ?? {}),
  ];
}

function parseStableVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return match
    ? {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
      }
    : undefined;
}

function satisfiesCaret(version, range) {
  const parsedVersion = parseStableVersion(version);
  const parsedBase = range.startsWith("^")
    ? parseStableVersion(range.slice(1))
    : undefined;
  if (!parsedVersion || !parsedBase) {
    return false;
  }
  if (parsedVersion.major !== parsedBase.major) {
    return false;
  }
  if (parsedBase.major === 0 && parsedVersion.minor !== parsedBase.minor) {
    return false;
  }
  if (parsedBase.major === 0 && parsedBase.minor === 0) {
    return parsedVersion.patch === parsedBase.patch;
  }
  if (parsedVersion.minor !== parsedBase.minor) {
    return parsedVersion.minor > parsedBase.minor;
  }
  return parsedVersion.patch >= parsedBase.patch;
}

for (const [expectedName, manifestPath] of publicPackages) {
  const packageJson = readJson(manifestPath);
  const version = parseStableVersion(packageJson.version);
  assert(
    packageJson.name === expectedName,
    `${manifestPath} must be ${expectedName}.`
  );
  assert(
    version?.major >= 1,
    `${expectedName} must use a stable version at or above 1.0.0.`
  );
  assert(packageJson.private !== true, `${expectedName} must be publishable.`);
  assert(
    packageJson.author === expectedAuthor,
    `${expectedName} must identify ${expectedAuthor} as its author.`
  );
  assert(packageJson.license === "MIT", `${expectedName} must use MIT.`);
  assert(
    packageJson.files?.includes("LICENSE") &&
      packageJson.files?.includes("TRADEMARKS.md"),
    `${expectedName} must publish LICENSE and TRADEMARKS.md.`
  );
  const packageRoot = path.posix.dirname(manifestPath);
  assert(
    fs.readFileSync(path.join(root, packageRoot, "LICENSE"), "utf8") ===
      expectedLicense,
    `${expectedName} must contain the canonical MIT license text.`
  );
  assert(
    fs.readFileSync(path.join(root, packageRoot, "TRADEMARKS.md"), "utf8") ===
      fs.readFileSync(path.join(root, "TRADEMARKS.md"), "utf8"),
    `${expectedName} must contain the canonical trademark policy.`
  );
  assert(
    packageJson.publishConfig?.access === "public",
    `${expectedName} must publish with public access.`
  );

  for (const [dependency, range] of dependencyEntries(packageJson)) {
    assert(
      !range.startsWith("file:") &&
        !range.startsWith("workspace:") &&
        !path.isAbsolute(range),
      `${expectedName} has a non-publishable range for ${dependency}: ${range}`
    );
  }
}

const uiCore = readJson("packages/ui-core/package.json");
const uiCli = readJson("packages/ui-cli/package.json");
const ui = readJson("packages/ui/package.json");
const reactNative = readJson("packages/ui-react-native/package.json");
const lockfile = readJson("package-lock.json");

assert(
  fs.readFileSync(path.join(root, "LICENSE"), "utf8") === expectedLicense,
  "The repository LICENSE must contain the canonical MIT license text."
);

assert(
  satisfiesCaret(uiCore.version, ui.dependencies?.["@tavojs/ui-core"] ?? ""),
  "@tavojs/ui must depend on the current @tavojs/ui-core version."
);
assert(
  satisfiesCaret(uiCli.version, ui.dependencies?.["@tavojs/ui-cli"] ?? ""),
  "@tavojs/ui must depend on the current @tavojs/ui-cli version."
);
assert(
  ui.peerDependencies?.["@tavojs/core"] === "^1.0.4",
  "@tavojs/ui must peer on @tavojs/core@^1.0.4."
);
assert(ui.bin === undefined, "@tavojs/ui must not publish the tavo-ui binary.");
assert(
  uiCli.bin?.["tavo-ui"] === "./dist/index.js",
  "@tavojs/ui-cli must own the tavo-ui binary."
);
assert(
  satisfiesCaret(ui.version, uiCli.peerDependencies?.["@tavojs/ui"] ?? ""),
  "@tavojs/ui-cli must peer on the current @tavojs/ui version."
);
assert(
  satisfiesCaret(
    reactNative.version,
    uiCli.peerDependencies?.["@tavojs/ui-react-native"] ?? ""
  ) && uiCli.peerDependenciesMeta?.["@tavojs/ui-react-native"]?.optional === true,
  "@tavojs/ui-cli must declare the current @tavojs/ui-react-native as an optional peer."
);
assert(
  satisfiesCaret(uiCore.version, reactNative.dependencies?.["@tavojs/ui-core"] ?? ""),
  "@tavojs/ui-react-native must depend on the current @tavojs/ui-core version."
);
assert(
  reactNative.bin === undefined,
  "@tavojs/ui-react-native must not publish a binary."
);
assert(
  reactNative.peerDependencies?.react && reactNative.peerDependencies?.["react-native"],
  "@tavojs/ui-react-native must declare React and React Native peers."
);
assert(
  dependencyEntries(reactNative).every(([name]) => !["@tavojs/ui", "@tavojs/ui-cli"].includes(name)),
  "@tavojs/ui-react-native must keep the web package and CLI out of its dependencies."
);
assert(
  ["react", "react-native"].every(
    (name) => !reactNative.dependencies?.[name] && !reactNative.optionalDependencies?.[name]
  ),
  "@tavojs/ui-react-native must use React and React Native from its peers."
);
assert(
  !dependencyEntries(ui).some(([name]) => name === "@tavojs/ui-react-native"),
  "@tavojs/ui must not depend on @tavojs/ui-react-native."
);

for (const [expectedName, manifestPath] of publicPackages) {
  const workspacePath = path.posix.dirname(manifestPath);
  const lockPackage = lockfile.packages?.[workspacePath];
  assert(
    lockPackage?.version === readJson(manifestPath).version,
    `${expectedName} lockfile version must match its manifest.`
  );
}

assert(
  uiCore.sideEffects === false,
  "@tavojs/ui-core must remain side-effect free."
);

console.log(
  `Release manifests verified for @tavojs/ui-core ${uiCore.version}, ` +
    `@tavojs/ui-cli ${uiCli.version}, @tavojs/ui ${ui.version}, ` +
    `and @tavojs/ui-react-native ${reactNative.version}.`
);
