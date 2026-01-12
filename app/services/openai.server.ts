/**
 * OpenAI Service
 * Manages interactions with the OpenAI API
 */

import OpenAI from "openai";
import AppConfig from "./config.server";
import systemPrompts from "../prompts/system-prompts.json";
import type { MCPTool } from "./mcp-client.server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StreamHandlers {
  onText?: (text: string) => void;
  onMessage?: (message: any) => void;
  onToolUse?: (toolCall: any) => void;
}

/**
 * Creates OpenAI service functions
 */
export function createOpenAIService(apiKey?: string) {
  const client = apiKey ? new OpenAI({ apiKey }) : openai;

  /**
   * Stream a conversation with OpenAI
   */
  const streamConversation = async (
    {
      messages,
      promptType = AppConfig.api.defaultPromptType,
      tools,
    }: {
      messages: Array<{ role: string; content: string }>;
      promptType?: string;
      tools?: MCPTool[];
    },
    streamHandlers: StreamHandlers
  ) => {
    // Get system prompt from configuration
    const systemInstruction = getSystemPrompt(promptType);

    // Convert MCP tools to OpenAI tool format
    const openaiTools = tools?.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    try {
      const stream = await client.chat.completions.create({
        model: AppConfig.api.defaultModel,
        max_tokens: AppConfig.api.maxTokens,
        messages: [
          { role: "system", content: systemInstruction },
          ...messages,
        ],
        tools: openaiTools && openaiTools.length > 0 ? openaiTools : undefined,
        stream: true,
      });

      let fullContent = "";
      let currentToolCalls: any[] = [];

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;

        const delta = choice.delta;

        // Handle text content
        if (delta.content) {
          fullContent += delta.content;
          if (streamHandlers.onText) {
            streamHandlers.onText(delta.content);
          }
        }

        // Handle tool calls
        if (delta.tool_calls) {
          for (const toolCallDelta of delta.tool_calls) {
            const index = toolCallDelta.index || 0;
            
            if (!currentToolCalls[index]) {
              currentToolCalls[index] = {
                id: toolCallDelta.id,
                type: "function",
                function: {
                  name: "",
                  arguments: "",
                },
              };
            }

            if (toolCallDelta.function?.name) {
              currentToolCalls[index].function.name += toolCallDelta.function.name;
            }
            if (toolCallDelta.function?.arguments) {
              currentToolCalls[index].function.arguments += toolCallDelta.function.arguments;
            }
          }
        }
      }

      // Process completed tool calls
      if (currentToolCalls.length > 0 && streamHandlers.onToolUse) {
        for (const toolCall of currentToolCalls) {
          try {
            const argumentsObj = JSON.parse(toolCall.function.arguments);
            await streamHandlers.onToolUse({
              id: toolCall.id,
              type: toolCall.type,
              function: {
                name: toolCall.function.name,
                arguments: argumentsObj,
              },
            });
          } catch (error) {
            console.error("Error parsing tool call arguments:", error);
          }
        }
      }

      // Return final message
      const finalMessage = {
        role: "assistant" as const,
        content: fullContent,
        tool_calls: currentToolCalls.length > 0 ? currentToolCalls : undefined,
      };

      if (streamHandlers.onMessage) {
        streamHandlers.onMessage(finalMessage);
      }

      return finalMessage;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  };

  /**
   * Get the system prompt content for a given prompt type
   */
  const getSystemPrompt = (promptType: string): string => {
    return (
      (systemPrompts.systemPrompts as any)[promptType]?.content ||
      (systemPrompts.systemPrompts as any)[AppConfig.api.defaultPromptType].content
    );
  };

  return {
    streamConversation,
    getSystemPrompt,
  };
}

export default {
  createOpenAIService,
};






