import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Allow external connections for proxy
    // Allow ngrok and other tunnel hosts for local development
    allowedHosts: [
      '.ngrok.io',
      '.ngrok-free.dev',
      '.ngrok.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  // Remove SSR config - let React Router handle it
  // The package should work fine in SSR context
  resolve: {
    // Ensure proper resolution of Shopify packages
    conditions: ["node", "import"],
    // Resolve path aliases (matches tsconfig.json paths)
    alias: {
      "~": path.resolve(__dirname, "./app"),
      // Map @shopify/shopify-app-react-router to its /server export
      "@shopify/shopify-app-react-router": "@shopify/shopify-app-react-router/server",
    },
  },
});
