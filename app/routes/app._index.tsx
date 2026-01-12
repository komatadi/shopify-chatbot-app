/**
 * Admin Dashboard
 * Optional admin interface for managing chatbot settings
 */

import type { LoaderFunctionArgs } from "react-router";
import { json } from "~/lib/json";
import shopify from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await shopify.authenticate.admin(request);
  return json({ message: "Chatbot Admin Dashboard" });
}

export default function Index() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Shopify Chatbot Admin</h1>
      <p>Configure your chatbot settings here.</p>
      <p>This is a placeholder admin interface.</p>
    </div>
  );
}






