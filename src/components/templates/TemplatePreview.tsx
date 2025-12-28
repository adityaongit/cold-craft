"use client";

import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogBackdrop,
  DialogCloseTrigger,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
} from "@chakra-ui/react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  platform?: string;
  tone?: string;
}

export function TemplatePreview({
  isOpen,
  onClose,
  title,
  content,
  platform,
  tone,
}: TemplatePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogBackdrop />
      <DialogContent
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack align="stretch" gap={4}>
            {(platform || tone) && (
              <HStack gap={2}>
                {platform && (
                  <Badge variant="subtle" colorPalette="gray" size="sm">
                    {platform}
                  </Badge>
                )}
                {tone && (
                  <Badge variant="outline" colorPalette="gray" size="sm">
                    {tone}
                  </Badge>
                )}
              </HStack>
            )}

            <Box
              bg="bg.surface"
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              p={4}
              fontFamily="mono"
              fontSize="sm"
              whiteSpace="pre-wrap"
              maxH="400px"
              overflowY="auto"
            >
              {content || <Text color="fg.muted">No content to preview</Text>}
            </Box>

            <HStack justify="space-between">
              <Text fontSize="xs" color="fg.muted">
                {content.split(/\s+/).filter(Boolean).length} words
              </Text>
              <Button
                onClick={handleCopy}
                disabled={!content}
                bg={{ base: "white", _dark: "#f5f5f5" }}
                color={{ base: "gray.900", _dark: "gray.900" }}
                borderWidth="1px"
                borderColor={{ base: "gray.300", _dark: "gray.300" }}
                _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
                borderRadius="md"
                fontWeight="500"
                size="sm"
                gap={2}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Template"}
              </Button>
            </HStack>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
