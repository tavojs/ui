import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicPackages = [
  ["@tavojs/ui-core", "packages/ui-core/package.json"],
  ["@tavojs/ui-cli", "packages/ui-cli/package.json"],
  ["@tavojs/ui", "packages/ui/package.json"],
];

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
const reactNativePath = path.join(
  root,
  "packages/ui-react-native/package.json"
);
const reactNative = fs.existsSync(reactNativePath)
  ? readJson("packages/ui-react-native/package.json")
  : undefined;
const lockfile = readJson("package-lock.json");

assert(
  satisfiesCaret(uiCore.version, ui.dependencies?.["@tavojs/ui-core"] ?? ""),
  "@tavojs/ui must depend on the current @tavojs/ui-core version."
);
assert(
  satisfiesCaret(uiCli.version, ui.dependencies?.["@tavojs/ui-cli"] ?? ""),
  "@tavojs/ui must depend on the current @tavojs/ui-cli version."
);
assert(
  ui.peerDependencies?.["@tavojs/core"] === "^1.0.0",
  "@tavojs/ui must peer on @tavojs/core@^1.0.0."
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
  !dependencyEntries(uiCli).some(
    ([name]) => name === "@tavojs/ui-react-native"
  ),
  "@tavojs/ui-cli must not expose the private React Native package."
);
if (reactNative) {
  assert(
    reactNative.private === true,
    "@tavojs/ui-react-native must remain private."
  );
  assert(
    reactNative.publishConfig === undefined,
    "@tavojs/ui-react-native must not define publishConfig."
  );
} else {
  assert(
    !fs.existsSync(path.join(root, "packages/ui-react-native")),
    "The public repository must not contain packages/ui-react-native."
  );
}

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
  `Web release manifest check passed: @tavojs/ui-core ${uiCore.version}, ` +
    `@tavojs/ui-cli ${uiCli.version}, and @tavojs/ui ${ui.version}.`
);
