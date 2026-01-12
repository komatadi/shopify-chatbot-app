// React Router 7 file-based routing configuration
// Routes are automatically discovered from the app/routes/ directory
// File names in app/routes/ map to URL paths:
// - app._index.tsx -> /app
// - api.auth.tsx -> /api/auth
// - apps.chatbot.chat.tsx -> /apps/chatbot/chat
// etc.
import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Explicitly define routes for file-based routing
export default [
  index("routes/app._index.tsx"),
  route("api/auth", "routes/api.auth.tsx"),
  route("api/chat", "routes/api.chat.tsx"),
  route("apps/chatbot/chat", "routes/apps.chatbot.chat.tsx"),
  route("app/proxy/chat", "routes/app.proxy.chat.tsx"),
  route("auth/shopify/callback", "routes/auth.shopify.callback.tsx"),
] satisfies RouteConfig;
