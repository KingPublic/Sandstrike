import { defineConfig, loadEnv } from "vite";

import { normalizeBasePath } from "./src/game/config/buildConfig.ts";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "VITE_");

  return {
    base: normalizeBasePath(environment.VITE_BASE_PATH),
    define: {
      __SANDSTRIKE_ANALYTICS__: JSON.stringify(
        mode === "production" && process.env.VERCEL === "1",
      ),
      __SANDSTRIKE_E2E__: JSON.stringify(
        environment.VITE_ENABLE_TEST_BRIDGE === "true",
      ),
    },
  };
});
