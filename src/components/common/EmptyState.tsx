"use client";

import { VStack, Text, Icon, Button } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <VStack
      gap={4}
      textAlign="center"
      minH="calc(100vh - 300px)"
      justify="center"
      align="center"
    >
      <Icon fontSize="4xl" color="fg.muted">
        <IconComponent size={48} />
      </Icon>
      <VStack gap={2}>
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
        <Text color="fg.muted" maxW="md">
          {description}
        </Text>
      </VStack>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          mt={2}
          bg={{ base: "white", _dark: "#f5f5f5" }}
          color={{ base: "gray.900", _dark: "gray.900" }}
          borderWidth="1px"
          borderColor={{ base: "gray.300", _dark: "gray.300" }}
          _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
          borderRadius="md"
          fontWeight="500"
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
}
