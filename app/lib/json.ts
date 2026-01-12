/**
 * JSON response helper for React Router 7
 * Since json is not exported from react-router or @react-router/node,
 * we create our own helper
 */

export function json(data: any, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
