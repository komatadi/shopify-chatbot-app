/**
 * Application configuration
 */

export default {
  api: {
    defaultModel: "gpt-4o-mini",
    maxTokens: 2000,
    defaultPromptType: "standardAssistant",
  },
  mcp: {
    storefrontServerUrl: process.env.STOREFRONT_MCP_SERVER_URL || "https://storefront-mcp.shopify.com",
  },
} as const;






