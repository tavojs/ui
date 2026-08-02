import { definePluginPhase } from "@tavojs/core/plugin";
import type { TavoUiPluginOptions } from "./plugin";
import { createThemeCss, escapeStyleText, normalizeOptions } from "./plugin.runtime.js";

export function createTavoUiServerPhase(options: TavoUiPluginOptions) {
  const resolvedOptions = normalizeOptions(options);
  let themeCss: string | undefined;

  return definePluginPhase({
    head: {
      theme() {
        themeCss ??= createThemeCss(process.cwd(), resolvedOptions);
        if (!themeCss) {
          return "";
        }
        return `<style data-tavo-style="tavo-ui.theme">${escapeStyleText(themeCss)}</style>`;
      }
    }
  });
}
