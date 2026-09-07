import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const workspaceRoot = path.resolve(root, "../..");
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tavo-ui-consumer-"));
const npmUserConfig = path.join(tmpRoot, ".npmrc");
fs.writeFileSync(npmUserConfig, "");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);
const corePeerRange =
  packageJson.peerDependencies?.["@tavojs/core"] ?? "^1.0.0";
const localCorePackageDir = path.resolve(
  workspaceRoot,
  "node_modules/@tavojs/core"
);
const corePackageDependency = fs.existsSync(
  path.join(localCorePackageDir, "package.json")
)
  ? `file:${localCorePackageDir}`
  : corePeerRange;
const localUiCorePackageDir = path.resolve(workspaceRoot, "packages/ui-core");
const uiCorePackageDependency = fs.existsSync(
  path.join(localUiCorePackageDir, "package.json")
)
  ? `file:${localUiCorePackageDir}`
  : packageJson.dependencies?.["@tavojs/ui-core"];
const localUiCliPackageDir = path.resolve(workspaceRoot, "packages/ui-cli");
const uiCliPackageDependency = fs.existsSync(
  path.join(localUiCliPackageDir, "package.json")
)
  ? `file:${localUiCliPackageDir}`
  : packageJson.dependencies?.["@tavojs/ui-cli"];
function run(command, args, options = {}) {
  const env = {
    HOME: tmpRoot,
    USERPROFILE: tmpRoot,
    npm_config_cache: path.join(tmpRoot, ".npm-cache"),
    npm_config_userconfig: npmUserConfig,
    npm_config_ignore_scripts: "true",
  };
  for (const key of [
    "PATH",
    "TMPDIR",
    "TMP",
    "TEMP",
    "SystemRoot",
    "COMSPEC",
    "PATHEXT",
    "TERM",
    "CI",
    "NO_COLOR",
    "FORCE_COLOR",
  ]) {
    if (process.env[key] !== undefined) {
      env[key] = process.env[key];
    }
  }

  execFileSync(command, args, {
    cwd: options.cwd ?? root,
    stdio: "inherit",
    env,
    ...options,
  });
}

function packagePath(name) {
  return path.join(workspaceRoot, "node_modules", name);
}

function writeApp(packageDir, source) {
  fs.mkdirSync(path.join(packageDir, "src"), { recursive: true });
  fs.writeFileSync(
    path.join(packageDir, "index.html"),
    `<!doctype html>
<html lang="en">
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );
  fs.writeFileSync(path.join(packageDir, "src", "main.tsx"), source);
}

function writePackage(packageDir, name, tarballPath, dependencies) {
  const appPackage = {
    name,
    private: true,
    type: "module",
    scripts: {
      build: "vite build",
    },
    dependencies: {
      "@tavojs/ui": `file:${tarballPath}`,
      "@tavojs/core": corePackageDependency,
      "@tavojs/ui-core": uiCorePackageDependency,
      "@tavojs/ui-cli": uiCliPackageDependency,
      ...dependencies,
    },
    devDependencies: {
      vite: `file:${packagePath("vite")}`,
      typescript: `file:${packagePath("typescript")}`,
    },
  };

  fs.writeFileSync(
    path.join(packageDir, "package.json"),
    `${JSON.stringify(appPackage, null, 2)}\n`
  );
}

function buildPackedConsumer({ name, tarballPath, dependencies = {}, source }) {
  const packageDir = path.join(tmpRoot, name);
  fs.mkdirSync(packageDir, { recursive: true });
  writePackage(packageDir, name, tarballPath, dependencies);
  writeApp(packageDir, source);

  run(
    "npm",
    [
      "install",
      "--offline",
      "--no-audit",
      "--legacy-peer-deps",
      "--ignore-scripts",
    ],
    { cwd: packageDir }
  );
  run("npm", ["run", "build"], { cwd: packageDir });
  console.log(`Consumer smoke test passed for ${name}`);
}

const defaultConsumerSource = `import { createRoot } from "@tavojs/core";
import { Button, Card, Field, SearchInput, Box, Text } from "@tavojs/ui";
import { Page, Stack, Toolbar } from "@tavojs/ui/layout";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tavojs/ui/table";
import { Toast } from "@tavojs/ui/feedback";
import { Button as CssButton } from "@tavojs/ui/css";
import { Button as CssSubpathButton } from "@tavojs/ui/css/button";
import { Page as CssPage } from "@tavojs/ui/css/layout";
import { buildTheme as cssBuildTheme } from "@tavojs/ui/css/theme";
import { auditThemeA11y } from "@tavojs/ui/a11y";
import { auditThemeA11y as cssAuditThemeA11y } from "@tavojs/ui/css/a11y";
import { componentMetadata, findComponentsForIntent, getAgentComponentGuide } from "@tavojs/ui/metadata";
import { componentMetadata as cssMetadata, getComponentsByCategory as getCssComponentsByCategory } from "@tavojs/ui/css/metadata";
import runtimeCatalog, { tavoUiRuntimeCatalog } from "@tavojs/ui/runtime-catalog";
import "@tavojs/ui/theme.css";

function App() {
  const audit = auditThemeA11y({ color: { light: { primary: "#7C5CFF" } } });
  const cssAudit = cssAuditThemeA11y({ color: { light: { primary: "#7C5CFF" } } });
  const theme = cssBuildTheme({ color: { light: { primary: "#7C5CFF" } } });
  const buttonGuide = getAgentComponentGuide("button");
  const intentMatch = findComponentsForIntent("modal dialog focus")[0]?.name;
  const cssFormCount = getCssComponentsByCategory("forms").length;
  const runtimeButton = runtimeCatalog.resolve("button");

  return (
    <Page>
      <CssPage>
        <Box>
          <Card title="Packed consumer" eyebrow={componentMetadata[0]?.name ?? cssMetadata[0]?.name}>
            <Stack data-audit-issues={audit.issues.length + cssAudit.issues.length} data-theme-length={theme.cssText.length} data-agent-guide={buttonGuide?.importPath} data-intent-match={intentMatch} data-css-form-count={cssFormCount} data-runtime-component={runtimeButton?.metadata.name} data-catalog-size={tavoUiRuntimeCatalog.list().length} data-catalog-default={runtimeCatalog === tavoUiRuntimeCatalog}>
              <Toolbar title="Imports" actions={<Toast tone="success">Ready</Toast>} />
              <Field label="Search">
                <SearchInput placeholder="Package import smoke" />
              </Field>
              <Table compact>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Path</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>root</TableCell>
                    <TableCell>ok</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>subpath/groups/css</TableCell>
                    <TableCell>ok</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Text color="muted">Packed tarball smoke test.</Text>
              <Button>Root Button</Button>
              <CssButton variant="outline">CSS Button</CssButton>
              <CssSubpathButton variant="ghost">CSS Subpath Button</CssSubpathButton>
            </Stack>
          </Card>
        </Box>
      </CssPage>
    </Page>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
`;

const cssAliasConsumerSource = `import { createRoot } from "@tavojs/core";
import { Button, Card, Field, Page, SearchInput, Stack, Box, Text } from "@tavojs/ui/css";
import { Button as FocusedButton } from "@tavojs/ui/css/button";
import { Dialog } from "@tavojs/ui/css/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tavojs/ui/css/table";
import { buildTheme } from "@tavojs/ui/css/theme";
import { auditThemeA11y } from "@tavojs/ui/css/a11y";
import { componentMetadata, getAgentComponentGuide } from "@tavojs/ui/css/metadata";
import "@tavojs/ui/theme.css";

function App() {
  const audit = auditThemeA11y({ color: { light: { primary: "#7C5CFF" }, method: "monochromatic" } });
  const theme = buildTheme({ color: { light: { primary: "#7C5CFF" }, method: "monochromatic" } });
  const buttonGuide = getAgentComponentGuide("button");

  return (
    <Page>
      <Box>
        <Card title="CSS alias consumer" eyebrow={componentMetadata.length}>
          <Stack data-audit-issues={audit.issues.length} data-theme-length={theme.cssText.length} data-agent-guide={buttonGuide?.cssImportPath}>
            <Field label="Search">
              <SearchInput placeholder="No Sass installed" />
            </Field>
            <Table compact>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Entrypoint</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>@tavojs/ui/css</TableCell>
                  <TableCell>ok</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>@tavojs/ui/css/button</TableCell>
                  <TableCell>ok</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Text color="muted">CSS alias imports also build without Sass.</Text>
            <Button>CSS Button</Button>
            <FocusedButton variant="outline">Focused CSS Button</FocusedButton>
            <Dialog open={false}>Closed</Dialog>
          </Stack>
        </Card>
      </Box>
    </Page>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
`;

try {
  run("npm", ["pack", "--pack-destination", tmpRoot]);
  const tarball = fs.readdirSync(tmpRoot).find((file) => file.endsWith(".tgz"));
  if (!tarball) {
    throw new Error("npm pack did not create a tarball.");
  }

  const tarballPath = path.join(tmpRoot, tarball);
  buildPackedConsumer({
    name: "default-consumer",
    tarballPath,
    source: defaultConsumerSource,
  });
  buildPackedConsumer({
    name: "css-alias-consumer",
    tarballPath,
    source: cssAliasConsumerSource,
  });
  console.log(`Consumer smoke tests passed in ${tmpRoot}`);
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}
