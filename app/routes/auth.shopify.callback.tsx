/**
 * Shopify OAuth callback handler
 */

import { redirect, type LoaderFunctionArgs } from "react-router";
import shopify from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await shopify.authenticate.public.appProxy(request);
  return redirect("/");
}






