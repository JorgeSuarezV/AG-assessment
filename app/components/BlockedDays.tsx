import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Card, Checkbox, IndexTable, Text, Box } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { loader } from "app/routes/app._index";

export default function BlockedDays() {
    const data = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const blockedDaysData = data?.blockedDays ? JSON.parse(data.blockedDays) : [];
    const [blockedDays, setBlockedDays] = useState(blockedDaysData);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const handleChange = (newChecked: boolean, id: string) => {
        let updatedBlockedDays = [...blockedDays];

        if (newChecked) {
            if (!blockedDays.includes(id)) {
                updatedBlockedDays = [...blockedDays, id];
            }
        } else {
            updatedBlockedDays = blockedDays.filter((day: string) => day !== id);
        }

        setBlockedDays(updatedBlockedDays);

        const formData = new FormData();
        formData.append("intent", "updateBlockedDays");
        formData.append("shopId", data?.shopId || "");
        formData.append("blockedDays", JSON.stringify(updatedBlockedDays));
        submit(formData, { method: "post" });
    };

    const tableRows = days.map((day, index) => (
        <IndexTable.Row
            id={day}
            key={index}
            position={index}
        >
            <IndexTable.Cell>
                <Text as="span" variant="bodyMd">{day}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Checkbox
                        checked={blockedDays.includes(day)}
                        onChange={(newChecked) => handleChange(newChecked, day)}
                        label="Enable"
                    />
                </div>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Card>
            <BlockStack gap="300">
                <BlockStack gap="200">
                    <Text as="h6" variant="headingSm">Select Days</Text>
                    <Text as="span" variant="bodyMd" tone="subdued">Pick the days of the week you'd like to enable or disable in the calendar.</Text>
                </BlockStack>
                <Card roundedAbove="sm" padding="0">
                    <IndexTable
                        selectable={false}
                        itemCount={days.length}
                        headings={[
                            { title: "Blocked Days", alignment: "start" },
                            { title: "Action", alignment: "center" }
                        ]}
                    >
                        {tableRows}
                    </IndexTable>
                </Card>
            </BlockStack>
        </Card>
    );
}