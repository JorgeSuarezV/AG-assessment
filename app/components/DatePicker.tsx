import {
    Modal,
    DatePicker as PolarisDatePicker,
    Button,
    Checkbox,
    Box,
    BlockStack,
    InlineStack,
    Text
} from "@shopify/polaris";
import { useEffect, useState } from "react";

// Define the Range type to match Polaris DatePicker's expected type
interface Range {
    start: Date;
    end: Date;
}

interface DatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    type: "single" | "range";
    onSave?: (selectedDates: Range) => void;
    initialSelectedDates?: Range;
    disabledDates?: Date[];
}

export default function DatePicker({
    isOpen,
    onClose,
    type,
    onSave,
    initialSelectedDates,
    disabledDates = []
}: DatePickerProps) {
    const today = new Date();
    const [{ month, year }, setDate] = useState({
        month: initialSelectedDates?.start.getMonth() ?? today.getMonth(),
        year: initialSelectedDates?.start.getFullYear() ?? today.getFullYear()
    });
    const [selectedDates, setSelectedDates] = useState<Range | undefined>(initialSelectedDates);
    const [allowRange, setAllowRange] = useState(type === "range");

    // Update selected dates when initialSelectedDates changes
    useEffect(() => {
        if (initialSelectedDates) {
            setSelectedDates(initialSelectedDates);
            setDate({
                month: initialSelectedDates.start.getMonth(),
                year: initialSelectedDates.start.getFullYear()
            });
        }
    }, [initialSelectedDates]);

    // Update allowRange when type changes
    useEffect(() => {
        setAllowRange(type === "range");
    }, [type]);

    const handleMonthChange = (month: number, year: number) => {
        setDate({ month, year });
    };

    function handleSave() {
        if (!selectedDates) return;

        if (onSave) {
            onSave(selectedDates);
            setSelectedDates(undefined);
            onClose();
        }
    }

    // Add a style tag with CSS for disabled dates
    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            .Polaris-DatePicker__Day--disabled {
                background-color: rgba(0, 0, 0, 0.05) !important;
                color: rgba(0, 0, 0, 0.5) !important;
                text-decoration: line-through !important;
                border-color: rgba(0, 0, 0, 0.2) !important;
            }
        `;
        document.head.appendChild(styleTag);
        
        return () => {
            try {
                if (styleTag && styleTag.parentNode) {
                    styleTag.parentNode.removeChild(styleTag);
                }
            } catch (error) {
                // Silently handle the error if the element can't be removed
                console.warn('Failed to remove style tag:', error);
            }
        };
    }, []);

    return (
        <Modal
            open={isOpen}
            onClose={() => {
                setSelectedDates(undefined);
                onClose();
            }}
            size="small"
            title="Select Date"
            titleHidden={true}
            primaryAction={{
                content: 'Save',
                onAction: handleSave,
                disabled: !selectedDates
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: () => {
                        setSelectedDates(undefined);
                        onClose();
                    },
                },
            ]}
        >
            <Modal.Section>
                <BlockStack gap="400">
                    <Box paddingBlockEnd="400">
                        <Checkbox
                            label="Allow Range Selection"
                            checked={allowRange}
                            onChange={() => setAllowRange(!allowRange)}
                        />
                    </Box>
                    <PolarisDatePicker
                        month={month}
                        year={year}
                        onChange={setSelectedDates}
                        onMonthChange={handleMonthChange}
                        selected={selectedDates}
                        allowRange={allowRange}
                        disableSpecificDates={disabledDates}
                    />
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}