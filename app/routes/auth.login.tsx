import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { login } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  
  if (url.searchParams.has("shop")) {
    return await login(request);
  }
  
  return json({ errors: null });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await login(request);
}; 