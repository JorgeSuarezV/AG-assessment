import { Layout, Page, BlockStack } from "@shopify/polaris";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import DatesList from "app/components/dates_list";
import BlockedDays from "app/components/BlockedDays";
import CreateAppDataMetafield from "app/graphql/mutations/CreateAppDataMetafield";
import { authenticate } from "app/shopify.server";
import shopMetafields from "app/graphql/queries/shopMetafields";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(shopMetafields);
    const data = await response.json();

    return json({
        shopId: data.data.shop?.id,
        dates: data.data.shop?.datesField?.value,
        blockedDays: data.data.shop?.blockedDaysField?.value
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const shopId = formData.get("shopId");

    const { authenticate } = await import("app/shopify.server");
    const { admin } = await authenticate.admin(request);

    if (intent === "updateBlockedDays") {
        const blockedDays = formData.get("blockedDays");
        await admin.graphql(CreateAppDataMetafield, {
            variables: {
                metafieldsSetInput: {
                    namespace: "blockedDays",
                    key: "blockedDays",
                    type: "json",
                    value: blockedDays,
                    ownerId: shopId
                }
            }
        });
    }

    if (intent === "updateDates") {
        const dates = formData.get("dates");
        await admin.graphql(CreateAppDataMetafield, {
            variables: {
                metafieldsSetInput: {
                    namespace: "dates",
                    key: "dates",
                    type: "json",
                    value: dates,
                    ownerId: shopId
                }
            }
        });
    }

    return null;
};

export default function AppIndex() {
    return (
        <Page title="Dashboard">
            <BlockStack gap="500">
                <Layout>
                    <Layout.Section variant="oneHalf">
                        <BlockedDays />
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <DatesList />
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
} 

