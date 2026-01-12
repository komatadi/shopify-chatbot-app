/**
 * Server-Sent Events (SSE) streaming utilities
 */

/**
 * Create an SSE stream response
 */
export function createSseStream(
  onStream: (send: (data: string) => void) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        await onStream(send);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

/**
 * Format message for SSE
 */
export function formatSSEMessage(type: string, data: any): string {
  return JSON.stringify({ type, data });
}






