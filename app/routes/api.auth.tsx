/**
 * Authentication API route
 */

import { redirect, type LoaderFunctionArgs } from "react-router";
import shopify from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await shopify.authenticate.public.appProxy(request);
  return redirect("/");
}






