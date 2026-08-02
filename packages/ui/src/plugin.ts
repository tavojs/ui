import { definePlugin, type TavoPlugin } from "@tavojs/core/plugin";

export type TavoUiPluginOptions = {
  config?: string;
  out?: string | false;
  watch?: boolean;
  silent?: boolean;
  required?: boolean;
  inject?: boolean;
};

/**
 * Creates the Tavo plugin descriptor for project theme generation.
 * Build and server implementations stay lazy so Node-only theme generation
 * code is not loaded while the framework compiles the plugin graph.
 */
export function tavoUi(options: TavoUiPluginOptions = {}): TavoPlugin {
  return definePlugin({
    id: "@tavojs/ui",
    version: "1.0.0",
    apiVersion: 1,
    manifest: {
      head: [
        {
          id: "theme",
          key: "@tavojs/ui:theme",
          cardinality: "singleton",
          unsafeHeadHtml: true,
        },
      ],
      build: {
        plugins: [{ id: "theme" }],
      },
      permissions: [
        {
          name: "unsafeHeadHtml",
          required: true,
          reason:
            "Injects generated theme CSS into the server-rendered document head.",
        },
      ],
    },
    server: async () => {
      const { createTavoUiServerPhase } = await import("./plugin.server.js");
      return createTavoUiServerPhase(options);
    },
    build: async () => {
      const { createTavoUiBuildPhase } = await import("./plugin.build.js");
      return createTavoUiBuildPhase(options);
    },
  });
}
