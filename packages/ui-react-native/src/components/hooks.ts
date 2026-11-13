import { useTheme } from "../theme/runtime.js";

export function useNativeTheme() {
  return useTheme().theme;
}
