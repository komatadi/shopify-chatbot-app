/**
 * Shopify app configuration
 */

import "@shopify/shopify-app-react-router/adapters/node";
import { shopifyApp } from "@shopify/shopify-app-react-router";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

// Get configuration from environment or use defaults for development
const apiKey = process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID || "dev-api-key";
const apiSecretKey = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET || "dev-api-secret";
const scopes = process.env.SCOPES?.split(",") || ["unauthenticated_read_product_listings"];
const appUrl = process.env.SHOPIFY_APP_URL || process.env.APP_URL || "http://localhost:5173";
const hostName = appUrl.replace(/https?:\/\//, "").split("/")[0] || "localhost:5173";

const shopify = shopifyApp({
  apiKey,
  apiSecretKey,
  scopes,
  hostName,
  hostScheme: appUrl.startsWith("https") ? "https" : "http",
  appUrl: appUrl,
  apiVersion: "2025-04",
  isEmbeddedApp: true,
  sessionStorage: new PrismaSessionStorage(prisma),
});

export default shopify;






