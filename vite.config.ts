import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const API_URL = env.API_URL || env.VITE_API_URL || "http://localhost:8081";

  return {
    plugins: [
      tailwindcss(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true,
        },
        "/ws": {
          target: API_URL.replace(/^http/, "ws"),
          ws: true,
          rewrite: (path: string) => path.replace(/^\/ws/, "/api/v1/messages"),
        },
      },
    },
  };
});
