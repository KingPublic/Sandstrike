import { defineConfig, loadEnv } from "vite";

import { normalizeBasePath } from "./src/game/config/buildConfig";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "VITE_");

  return {
    base: normalizeBasePath(environment.VITE_BASE_PATH),
  };
});
