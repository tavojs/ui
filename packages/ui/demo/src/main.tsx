import { bootTavo } from "@tavojs/core";
import { configureDevDiagnostics } from "@tavojs/core/dev";
import { demoThemeController } from "./theme-controller.ts";
import { mountThemeController } from "@/theme/runtime";
import "./styles.css";

configureDevDiagnostics({
  enabled: import.meta.env.DEV,
  devMode: import.meta.env.DEV,
  onError(error) {
    console.error(error);
  },
});

mountThemeController(demoThemeController);

await bootTavo({
  rootSelector: "#app",
});
