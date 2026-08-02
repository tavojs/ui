import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tavo-ui-pack-"));

try {
  execFileSync("npm", ["pack", "--dry-run"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_cache: path.join(tmpRoot, ".npm-cache")
    }
  });
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}
