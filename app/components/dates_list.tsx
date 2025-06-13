import { BlockStack, InlineGrid, Card, IndexTable, ButtonGroup, Button, Text, Box } from "@shopify/polaris";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useEffect, useState, useMemo } from "react";
import DatePicker from "./DatePicker";
import ConfirmationModal from "./ConfirmationModal";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { loader } from "app/routes/app._index";

type DatePickerType = "single" | "range";
type DatePickerState = {
    isOpen: boolean;
    type: DatePickerType;
}

interface DateRange {
    start: Date;
    end: Date;
}

export default function DatesList() {
    const data = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const [datePickerState, setDatePickerState] = useState<DatePickerState>({
        isOpen: false,
        type: "single"
    });
    
    const [editingDateIndex, setEditingDateIndex] = useState<number | null>(null);
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
    
    // Parse the dates from the loader data - do this transformation once
    const blockedDates = useMemo(() => {
        try {
            if (!data?.dates) return [];
            
            const datesArray = JSON.parse(data.dates);
            return datesArray.map((item: { start: string, end: string }, index: number) => ({
                id: index + 1,
                start: new Date(item.start),
                end: new Date(item.end)
            }));
        } catch (error) {
            console.error("Error parsing dates:", error);
            return [];
        }
    }, [data?.dates]);
    
    // Calculate disabled dates for the DatePicker once
    const disabledDates = useMemo(() => {
        const allDisabledDates: Date[] = [];
        
        // Extract dates from each range, excluding the currently edited date range
        blockedDates.forEach((range: { start: Date, end: Date }, index: number) => {
            // Skip the date range we're currently editing
            if (editingDateIndex !== null && index === editingDateIndex) {
                return;
            }
            
            const current = new Date(range.start);
            const end = new Date(range.end);
            
            // Add each date in the range to the disabled dates array
            while (current <= end) {
                allDisabledDates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
        });
        
        return allDisabledDates;
    }, [blockedDates, editingDateIndex]);
    
    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString();
    };
    
    // Format date range for display
    const formatDateRange = (start: Date, end: Date) => {
        if (start.getTime() === end.getTime()) {
            return formatDate(start);
        }
        return `${formatDate(start)} - ${formatDate(end)}`;
    };
    
    // Show confirmation dialog before deleting
    const handleDeleteClick = (index: number) => {
        setConfirmDeleteIndex(index);
    };
    
    // Handle actual deletion after confirmation
    const handleConfirmDelete = () => {
        if (confirmDeleteIndex !== null) {
            const updatedDates = [...blockedDates];
            updatedDates.splice(confirmDeleteIndex, 1);
            saveDates(updatedDates);
            setConfirmDeleteIndex(null);
        }
    };
    
    // Handle editing a date
    const handleEditDate = (index: number) => {
        setEditingDateIndex(index);
        setDatePickerState({ 
            isOpen: true, 
            type: blockedDates[index].start.getTime() === blockedDates[index].end.getTime() ? "single" : "range" 
        });
    };
    
    // Handle saving a date from the DatePicker
    const handleSaveDate = (selectedDate: DateRange) => {
        if (editingDateIndex !== null) {
            // Editing existing date
            const updatedDates = [...blockedDates];
            updatedDates[editingDateIndex] = {
                ...updatedDates[editingDateIndex],
                start: selectedDate.start,
                end: selectedDate.end
            };
            saveDates(updatedDates);
            setEditingDateIndex(null);
        } else {
            // Adding new date
            const updatedDates = [...blockedDates, {
                id: blockedDates.length + 1,
                start: selectedDate.start,
                end: selectedDate.end
            }];
            saveDates(updatedDates);
        }
    };
    
    // Single function to handle saving dates to avoid duplication
    const saveDates = (dates: Array<{ id: number, start: Date, end: Date }>) => {
        const formData = new FormData();
        formData.append("intent", "updateDates");
        formData.append("shopId", data?.shopId || "");
        formData.append("dates", JSON.stringify(dates.map(date => ({
            start: date.start.toISOString(),
            end: date.end.toISOString()
        }))));
        submit(formData, { method: "post" });
    };
    
    // Close date picker and reset editing state
    const handleCloseDatePicker = () => {
        setDatePickerState({ isOpen: false, type: datePickerState.type });
        setEditingDateIndex(null);
    };
    
    const tableRowsDatesItems = blockedDates.map((date: { id: number, start: Date, end: Date }, index: number) => (
        <IndexTable.Row
            id={date.id.toString()}
            key={date.id}
            position={index}
        >
            <IndexTable.Cell>
                <Text as="span" variant="bodyMd">
                    {formatDateRange(date.start, date.end)}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ButtonGroup>
                        <Button
                            icon={EditIcon}
                            variant="monochromePlain"
                            onClick={() => handleEditDate(index)}
                            accessibilityLabel="Edit"
                        />
                        <Button
                            icon={DeleteIcon}
                            variant="monochromePlain"
                            onClick={() => handleDeleteClick(index)}
                            accessibilityLabel="Delete"
                        />
                    </ButtonGroup>
                </div>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <>
            <Card>
                <BlockStack gap="300">
                    <Box>
                        <InlineGrid columns="1fr auto">
                            <Text as="h6" variant="headingSm">
                                Select Dates
                            </Text>
                            <ButtonGroup>
                                <Button
                                    variant="primary"
                                    onClick={() => { setDatePickerState({ isOpen: true, type: "single" }) }}
                                    accessibilityLabel="Add"
                                >
                                    Add Date
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => { setDatePickerState({ isOpen: true, type: "range" }) }}
                                    accessibilityLabel="Add"
                                >
                                    Add Date Range
                                </Button>
                            </ButtonGroup>
                        </InlineGrid>
                        <Box maxWidth="200px">
                            <Text breakWord={true} as="span" variant="bodyMd" tone="subdued">Pick the dates you'd like to disable in the calendar.</Text>
                        </Box>
                    </Box>
                    <Card roundedAbove="sm" padding="0">
                        <IndexTable
                            selectable={false}
                            itemCount={blockedDates.length}
                            headings={[
                                { title: "Blocked Dates", alignment: "start" }, 
                                { title: "Action", alignment: "center" }
                            ]}
                            emptyState={
                                <Text as="p" alignment="center">No dates added yet</Text>
                            }
                        >
                            {tableRowsDatesItems}
                        </IndexTable>
                    </Card>
                </BlockStack>
            </Card>
            
            <DatePicker 
                isOpen={datePickerState.isOpen} 
                onClose={handleCloseDatePicker} 
                type={datePickerState.type} 
                onSave={handleSaveDate}
                initialSelectedDates={editingDateIndex !== null ? blockedDates[editingDateIndex] : undefined}
                disabledDates={disabledDates}
            />
            
            <ConfirmationModal
                isOpen={confirmDeleteIndex !== null}
                onClose={() => setConfirmDeleteIndex(null)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}