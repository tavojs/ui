const { existsSync } = require("node:fs");
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, "../..");
const workspaceRoot = path.resolve(packageRoot, "../..");
const uiCoreRoot = path.resolve(workspaceRoot, "packages/ui-core");

const config = getDefaultConfig(projectRoot);

if (
  packageRoot === path.join(workspaceRoot, "packages", "ui-react-native") &&
  existsSync(path.join(uiCoreRoot, "package.json"))
) {
  config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceRoot]));

  config.resolver.nodeModulesPaths = Array.from(
    new Set([path.resolve(projectRoot, "node_modules"), ...(config.resolver.nodeModulesPaths ?? [])])
  );

  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules ?? {}),
    "@tavojs/ui-react-native": packageRoot,
    "@tavojs/ui-core": uiCoreRoot,
    react: path.resolve(projectRoot, "node_modules/react"),
    "react-native": path.resolve(projectRoot, "node_modules/react-native")
  };
}

module.exports = config;
