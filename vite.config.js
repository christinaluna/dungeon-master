import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/gemini": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: () => `/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        },
      },
    },
  };
});
