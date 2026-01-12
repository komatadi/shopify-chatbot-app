/**
 * Chat API Route
 * Handles chat interactions with OpenAI API and MCP tools
 */

import type { ActionFunctionArgs } from "react-router";
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
 * Handle POST requests for chat messages
 */
export async function action({ request }: ActionFunctionArgs) {
  // Handle OPTIONS requests (CORS preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  // Check if this is an SSE request
  const acceptHeader = request.headers.get("Accept");
  if (acceptHeader === "text/event-stream") {
    return handleChatStream(request);
  }

  // Handle regular POST request
  try {
    const body = await request.json();
    const { message, conversationId, shopId, customerId, shopDomain } = body;

    // Get shopId from shopDomain if not provided
    const finalShopId = shopId || shopDomain || 
      request.headers.get("X-Shopify-Shop-Domain") ||
      "";

    if (!message) {
      return json({ error: "Missing message" }, { status: 400 });
    }
    
    if (!finalShopId) {
      return json({ error: "Missing shop identifier" }, { status: 400 });
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(finalShopId, customerId);

    // Save user message
    await saveMessage(conversation.id, "user", message);

    // Get conversation history
    const history = await getConversationHistory(conversation.id);

    // Get store settings
    const settings = await getStoreSettings(finalShopId);

    // Initialize OpenAI service
    const openaiService = createOpenAIService(
      settings.openaiKey || process.env.OPENAI_API_KEY
    );

    // Initialize MCP client
    // Extract shop domain from shopId (format: shop.myshopify.com)
    const shopDomainForMCP = finalShopId.includes('.myshopify.com') 
      ? finalShopId.replace(".myshopify.com", "") 
      : (shopDomain || finalShopId);
    
    // For Storefront API, we need a public access token
    // This should be created via Admin API and stored per shop
    // For now, we'll use an empty token - this needs to be configured per shop
    const storefrontAccessToken = ""; // TODO: Get from shop settings or session
    const mcpClient = new MCPClient(shopDomainForMCP, storefrontAccessToken);

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
async function handleChatStream(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationId, shopId, customerId, shopDomain } = body;

    // Get shopId from shopDomain if not provided
    const finalShopId = shopId || shopDomain || 
      request.headers.get("X-Shopify-Shop-Domain") ||
      "";

    if (!message) {
      return new Response("Missing message", { status: 400 });
    }

    if (!finalShopId) {
      return new Response("Missing shop identifier", { status: 400 });
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(finalShopId, customerId);

    // Save user message
    await saveMessage(conversation.id, "user", message);

    // Get conversation history
    const history = await getConversationHistory(conversation.id);

    // Get store settings
    const settings = await getStoreSettings(finalShopId);

    // Initialize OpenAI service
    const openaiService = createOpenAIService(
      settings.openaiKey || process.env.OPENAI_API_KEY
    );

    // Initialize MCP client
    const shopDomainForMCP = finalShopId.includes('.myshopify.com') 
      ? finalShopId.replace(".myshopify.com", "") 
      : (shopDomain || finalShopId);
    
    // For Storefront API, we need a public access token
    const storefrontAccessToken = ""; // TODO: Get from shop settings or session
    const mcpClient = new MCPClient(shopDomainForMCP, storefrontAccessToken);

    // Get available tools
    const tools = mcpClient.getAvailableTools();

    // Create SSE stream
    return createSseStream(async (send) => {
      let assistantMessage = "";
      let pendingToolCalls: any[] = [];

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
            pendingToolCalls.push(toolCall);
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
            if (assistantMessage) {
              await saveMessage(conversation.id, "assistant", assistantMessage);
            }
            send(formatSSEMessage("done", { conversationId: conversation.id }));
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

