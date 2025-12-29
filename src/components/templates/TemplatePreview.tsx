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
import React from "react";

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

// Function to render content with variables as badges
function renderContentWithBadges(content: string) {
  const variableRegex = /\{\{([^}:|]+)(?::([^}|]+))?(?:\|([^}]+))?\}\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = variableRegex.exec(content)) !== null) {
    // Capture match in a const to ensure TypeScript knows it's not null
    const currentMatch = match;

    // Add text before the variable
    if (currentMatch.index > lastIndex) {
      const text = content.substring(lastIndex, currentMatch.index);
      // Split by newlines to preserve them
      text.split('\n').forEach((line, i, arr) => {
        parts.push(line);
        if (i < arr.length - 1) {
          parts.push(<br key={`br-${currentMatch.index}-${i}`} />);
        }
      });
    }

    // Add the variable as a badge
    const variableName = currentMatch[1].trim();
    parts.push(
      <Badge
        key={`${currentMatch.index}-${variableName}`}
        variant="subtle"
        colorPalette="blue"
        size="sm"
        mx={0.5}
      >
        {variableName}
      </Badge>
    );

    lastIndex = currentMatch.index + currentMatch[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex);
    text.split('\n').forEach((line, i, arr) => {
      parts.push(line);
      if (i < arr.length - 1) {
        parts.push(<br key={`br-end-${i}`} />);
      }
    });
  }

  return parts.length > 0 ? parts : content;
}

export function TemplatePreview({
  isOpen,
  onClose,
  title,
  content,
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
            <Box
              bg="bg.surface"
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              p={4}
              fontSize="sm"
              lineHeight="1.7"
              maxH="400px"
              overflowY="auto"
            >
              {content ? renderContentWithBadges(content) : <Text color="fg.muted">No content to preview</Text>}
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
