import { defineConfig } from "@tavojs/core/config";
import { tavoUi } from "@tavojs/ui/plugin";

export default defineConfig({
  plugins: [
    tavoUi({
      config: "../tavo-ui.config.json",
      silent: true
    })
  ]
});
