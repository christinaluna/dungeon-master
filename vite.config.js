import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => {
            const rewritten = path.replace(/^\/api/, "");
            const sep = rewritten.includes("?") ? "&" : "?";
            return `${rewritten}${sep}key=${env.GEMINI_API_KEY}`;
          },
        },
      },
    },
  };
});
