import { Modal, TextContainer, Button, ButtonGroup, Box, Text, BlockStack } from "@shopify/polaris";
import { useState } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure you want to Remove?",
    message = "By clicking on \"Yes\", you will remove the selected date/range.",
    confirmText = "Yes",
    cancelText = "No"
}: ConfirmationModalProps) {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title=""
            titleHidden
            size="small"
        >
            <Box padding="800">
                <BlockStack gap="300">
                    <Box>
                        <Text as="h1" variant="headingMd">{title}</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">{message}</Text>
                    </Box>

                    <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px" }}>
                        <Button variant="primary" onClick={onConfirm}>
                            {confirmText}
                        </Button>
                        <Button onClick={onClose} variant="secondary">
                            {cancelText}
                        </Button>
                    </div>
                </BlockStack>
            </Box>
        </Modal>
    );
} 