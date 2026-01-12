/**
 * App Proxy route for chat API
 * Accessible at: /apps/chatbot/chat
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { json } from "~/lib/json";
import { createSseStream, formatSSEMessage } from "~/services/streaming.server";
import { createOpenAIService } from "~/services/openai.server";
import MCPClient from "~/services/mcp-client.server";
import {
  saveMessage,
  getConversationHistory,
  getOrCreateConversation,
  getStoreSettings,
} from "~/db.server";

/**
 * Handle GET requests (for health checks, etc.)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("=== Chat API GET Request ===");
  console.log("URL:", request.url);
  return json({ status: "ok", message: "Chat API is running" });
}

/**
 * Handle POST requests for chat messages via app proxy
 */
export async function action({ request }: ActionFunctionArgs) {
  console.log("=== Chat API Request ===");
  console.log("Method:", request.method);
  console.log("URL:", request.url);
  console.log("Headers:", Object.fromEntries(request.headers.entries()));
  
  // Handle OPTIONS requests (CORS preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  // Get shop domain from request headers (app proxy provides this)
  // In development, try multiple header options
  const shopDomain = 
    request.headers.get("X-Shopify-Shop-Domain") ||
    request.headers.get("x-shopify-shop-domain") ||
    new URL(request.url).searchParams.get("shop") ||
    "";
  
  console.log("Shop Domain:", shopDomain);
  
  if (!shopDomain) {
    console.error("Missing shop domain header");
    return json({ error: "Missing shop domain" }, { status: 400 });
  }

  // Check if this is an SSE request
  const acceptHeader = request.headers.get("Accept");
  if (acceptHeader === "text/event-stream") {
    return handleChatStream(request, shopDomain);
  }

  // Handle regular POST request
  try {
    const body = await request.json();
    const { message, conversationId, customerId } = body;

    if (!message) {
      return json({ error: "Missing message" }, { status: 400 });
    }

    const shopId = shopDomain;

    // Get or create conversation
    const conversation = await getOrCreateConversation(shopId, customerId);

    // Save user message
    await saveMessage(conversation.id, "user", message);

    // Get conversation history
    const history = await getConversationHistory(conversation.id);

    // Get store settings
    const settings = await getStoreSettings(shopId);

    // Initialize OpenAI service
    const openaiService = createOpenAIService(
      settings.openaiKey || process.env.OPENAI_API_KEY
    );

    // Initialize MCP client
    // Pass full shop domain (e.g., "styledgenie-webshop.myshopify.com")
    // Get Storefront API access token from settings or environment
    const storefrontAccessToken = 
      settings.storefrontAccessToken || 
      process.env.STOREFRONT_ACCESS_TOKEN || 
      "";
    
    if (!storefrontAccessToken) {
      console.warn("⚠️  Storefront API access token not configured. Product search will fail.");
      console.warn("   To fix: Create a Storefront API access token in Shopify Admin and add it to StoreSettings");
    }
    
    const mcpClient = new MCPClient(
      shopDomain, // Keep full domain including .myshopify.com
      storefrontAccessToken
    );

    // Get available tools
    const tools = mcpClient.getAvailableTools();

    // Stream response
    let assistantMessage = "";
    let toolResults: any[] = [];

    const finalMessage = await openaiService.streamConversation(
      {
        messages: history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        promptType: "standardAssistant",
        tools,
      },
      {
        onText: (text) => {
          assistantMessage += text;
        },
        onToolUse: async (toolCall) => {
          try {
            const result = await mcpClient.executeTool({
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            });
            toolResults.push({
              tool: toolCall.function.name,
              result,
            });
          } catch (error) {
            console.error("Tool execution error:", error);
            toolResults.push({
              tool: toolCall.function.name,
              error: String(error),
            });
          }
        },
      }
    );

    // Save assistant message
    await saveMessage(conversation.id, "assistant", assistantMessage);

    return json({
      conversationId: conversation.id,
      message: assistantMessage,
      toolResults,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handle streaming chat requests (SSE)
 */
async function handleChatStream(request: Request, shopDomain: string) {
  try {
    console.log("=== Handling Chat Stream ===");
    const body = await request.json();
    console.log("Request body:", body);
    const { message, conversationId, customerId } = body;

    if (!message) {
      console.error("Missing message in request body");
      return new Response("Missing message", { status: 400 });
    }
    
    console.log("Processing message:", message);

    const shopId = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`;
    console.log("Shop ID:", shopId);

    // Get or create conversation
    const conversation = await getOrCreateConversation(shopId, customerId);
    console.log("Conversation ID:", conversation.id);

    // Save user message
    await saveMessage(conversation.id, "user", message);

    // Get conversation history
    const history = await getConversationHistory(conversation.id);

    // Get store settings
    const settings = await getStoreSettings(shopId);
    console.log("Store settings retrieved");

    // Initialize OpenAI service
    const openaiKey = settings.openaiKey || process.env.OPENAI_API_KEY;
    console.log("OpenAI API Key present:", !!openaiKey);
    
    if (!openaiKey) {
      console.error("OpenAI API key is missing!");
      return new Response("OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.", { status: 500 });
    }
    
    const openaiService = createOpenAIService(openaiKey);

    // Initialize MCP client
    // Pass full shop domain (e.g., "styledgenie-webshop.myshopify.com")
    // The MCP client will use it to construct API URLs
    // Get Storefront API access token from settings or environment
    const storefrontAccessToken = 
      settings.storefrontAccessToken || 
      process.env.STOREFRONT_ACCESS_TOKEN || 
      "";
    
    if (!storefrontAccessToken) {
      console.warn("⚠️  Storefront API access token not configured. Product search will fail.");
      console.warn("   To fix: Create a Storefront API access token in Shopify Admin and add it to StoreSettings");
    }
    
    const mcpClient = new MCPClient(
      shopDomain, // Keep full domain including .myshopify.com
      storefrontAccessToken
    );

    // Get available tools
    const tools = mcpClient.getAvailableTools();

    // Create SSE stream
    return createSseStream(async (send) => {
      let assistantMessage = "";

      await openaiService.streamConversation(
        {
          messages: history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          promptType: "standardAssistant",
          tools,
        },
        {
          onText: (text) => {
            assistantMessage += text;
            send(formatSSEMessage("text", { content: text }));
          },
          onToolUse: async (toolCall) => {
            send(
              formatSSEMessage("tool_call", {
                tool: toolCall.function.name,
                arguments: toolCall.function.arguments,
              })
            );

            try {
              const result = await mcpClient.executeTool({
                name: toolCall.function.name,
                arguments: toolCall.function.arguments,
              });
              send(
                formatSSEMessage("tool_result", {
                  tool: toolCall.function.name,
                  result,
                })
              );
            } catch (error) {
              console.error("Tool execution error:", error);
              send(
                formatSSEMessage("tool_error", {
                  tool: toolCall.function.name,
                  error: String(error),
                })
              );
            }
          },
          onMessage: async (message) => {
            // Save final assistant message
            try {
              if (assistantMessage) {
                await saveMessage(conversation.id, "assistant", assistantMessage);
              }
              // Send done message - send() will handle if stream is closed
              send(formatSSEMessage("done", { conversationId: conversation.id }));
            } catch (error) {
              console.error("Error in onMessage callback:", error);
              // Don't throw - stream might already be closed
            }
          },
        }
      );
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * Get CORS headers
 */
function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

