import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import CreateMetafieldDefinition from "./graphql/mutations/CreateMetafieldDefinition";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      try {
        const deliveryDateResponse = await admin.graphql(CreateMetafieldDefinition, {
          variables: {
            definition: {
              name: "Delivery Date",
              namespace: "custom",
              key: "delivery_date",
              description: "Customer selected delivery date from checkout",
              type: "date",
              ownerType: "ORDER"
            }
          }
        });
        
        const deliveryDateResult = await deliveryDateResponse.json();
        
        if (deliveryDateResult.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
          console.log("Delivery date metafield definition errors:", deliveryDateResult.data.metafieldDefinitionCreate.userErrors);
        } else {
          console.log("Delivery date metafield definition created successfully");
        }

        const blockedDaysResponse = await admin.graphql(CreateMetafieldDefinition, {
          variables: {
            definition: {
              name: "Blocked Days",
              namespace: "blockedDays",
              key: "blockedDays",
              description: "Days of the week that are blocked for delivery",
              type: "json",
              ownerType: "SHOP"
            }
          }
        });
        
        const blockedDaysResult = await blockedDaysResponse.json();
        
        if (blockedDaysResult.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
          console.log("Blocked days metafield definition errors:", blockedDaysResult.data.metafieldDefinitionCreate.userErrors);
        } else {
          console.log("Blocked days metafield definition created successfully");
        }

        const datesResponse = await admin.graphql(CreateMetafieldDefinition, {
          variables: {
            definition: {
              name: "Blocked Date Ranges",
              namespace: "dates",
              key: "dates",
              description: "Date ranges that are blocked for delivery",
              type: "json",
              ownerType: "SHOP"
            }
          }
        });
        
        const datesResult = await datesResponse.json();
        
        if (datesResult.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
          console.log("Dates metafield definition errors:", datesResult.data.metafieldDefinitionCreate.userErrors);
        } else {
          console.log("Dates metafield definition created successfully");
        }
        
      } catch (error) {
        console.error("Error creating metafield definitions:", error);
      }
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
