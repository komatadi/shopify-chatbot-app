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
  let isClosed = false;
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        // Check if stream is already closed before enqueueing
        if (isClosed) {
          console.warn("Attempted to send data after stream was closed");
          return;
        }
        
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          // Controller might be closed, mark as closed and stop trying
          if (error instanceof TypeError && error.message.includes("closed")) {
            console.warn("Stream controller was closed, stopping sends");
            isClosed = true;
          } else {
            throw error;
          }
        }
      };

      try {
        await onStream(send);
        
        // Only send [DONE] if stream is still open
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (error) {
            console.warn("Could not send [DONE] marker, stream may be closed");
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
        if (!isClosed) {
          try {
            controller.error(error);
          } catch (err) {
            // Controller might already be closed
            console.warn("Could not send error to closed controller");
          }
        }
      } finally {
        if (!isClosed) {
          try {
            controller.close();
          } catch (error) {
            // Controller might already be closed
            console.warn("Could not close already-closed controller");
          }
        }
        isClosed = true;
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






