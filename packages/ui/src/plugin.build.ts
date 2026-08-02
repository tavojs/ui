import { definePluginPhase } from "@tavojs/core/plugin";
import type { TavoUiPluginOptions } from "./plugin";
import { createTavoUiVitePlugin } from "./plugin.runtime.js";

export function createTavoUiBuildPhase(options: TavoUiPluginOptions) {
  return definePluginPhase({
    build: {
      plugins: {
        theme: createTavoUiVitePlugin(options)
      }
    }
  });
}
