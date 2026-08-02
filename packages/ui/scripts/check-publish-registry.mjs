import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const peerRange = packageJson.peerDependencies?.["@tavojs/core"];

if (process.env.TAVO_UI_SKIP_REGISTRY_CHECK === "1") {
  console.log("Skipping npm registry preflight because TAVO_UI_SKIP_REGISTRY_CHECK=1.");
  process.exit(0);
}

if (!peerRange) {
  throw new Error("Expected @tavojs/core to be listed as a peer dependency.");
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return undefined;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

function compareVersions(left, right) {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

function satisfiesCaret(version, range) {
  const base = parseVersion(range.slice(1));
  const parsed = parseVersion(version);
  if (!base || !parsed || compareVersions(parsed, base) < 0) {
    return false;
  }

  if (base.major > 0) {
    return parsed.major === base.major;
  }

  if (base.minor > 0) {
    return parsed.major === 0 && parsed.minor === base.minor;
  }

  return parsed.major === 0 && parsed.minor === 0 && parsed.patch === base.patch;
}

function satisfies(version, range) {
  if (range.startsWith("^")) {
    return satisfiesCaret(version, range);
  }
  return version === range;
}

function readPublishedPackage(packageName) {
  const encodedPackageName = encodeURIComponent(packageName).replace("%40", "@");
  const url = `https://registry.npmjs.org/${encodedPackageName}`;

  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 15000 }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`npm returned ${response.statusCode} for ${packageName}: ${body.slice(0, 500)}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`npm returned invalid JSON for ${packageName}: ${error.message}`));
        }
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error(`Timed out after 15 seconds while reading ${packageName} from npm.`));
    });
    request.on("error", reject);
  });
}

const corePackage = await readPublishedPackage("@tavojs/core").catch((error) => {
  throw new Error(`Unable to read @tavojs/core from npm. Publish it first or check registry access.\n${error.message}`);
});
const coreVersion = corePackage["dist-tags"]?.latest;

if (!coreVersion || !satisfies(coreVersion, peerRange)) {
  throw new Error(
    `The published @tavojs/core version (${coreVersion ?? "none"}) does not satisfy ${peerRange}. ` +
      "Publish @tavojs/core first or update @tavojs/ui's peer dependency before publishing."
  );
}

console.log(`Registry preflight passed: @tavojs/core ${coreVersion} satisfies ${peerRange}.`);
