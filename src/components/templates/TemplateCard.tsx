"use client";

import { Box, HStack, VStack, Text, Badge, Icon, IconButton, Flex } from "@chakra-ui/react";
import { Star, Copy, Pencil, Trash2, Clock } from "lucide-react";
import { TemplateWithRelations } from "@/types";
import { formatRelativeTime, truncate } from "@/lib/utils";

interface TemplateCardProps {
  template: TemplateWithRelations & { _count?: { usageHistory: number } };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onUse?: (id: string) => void;
}

const platformColors = {
  LINKEDIN: "gray",
  GMAIL: "gray",
  TWITTER: "gray",
  COLD_EMAIL: "gray",
  OTHER: "gray",
};

const toneColors = {
  PROFESSIONAL: "gray",
  CASUAL: "gray",
  FRIENDLY: "gray",
  FORMAL: "gray",
  ENTHUSIASTIC: "gray",
};

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUse,
}: TemplateCardProps) {
  return (
    <Box
      bg="bg.panel"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.subtle"
      p={4}
      _hover={{
        borderColor: "brand.500",
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onUse?.(template.id)}
    >
      <VStack align="stretch" gap={3}>
        {/* Header */}
        <Flex justify="space-between" align="start">
          <VStack align="start" flex={1} gap={1}>
            <Text fontSize="lg" fontWeight="semibold" lineHeight="tight">
              {template.title}
            </Text>
            {template.description && (
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                {truncate(template.description, 80)}
              </Text>
            )}
          </VStack>

          <HStack gap={1}>
            <IconButton
              aria-label="Toggle favorite"
              variant="ghost"
              size="sm"
              colorScheme="gray"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(template.id, !template.isFavorite);
              }}
            >
              <Star
                size={16}
                fill={template.isFavorite ? "currentColor" : "none"}
              />
            </IconButton>
            <IconButton
              aria-label="Edit template"
              variant="ghost"
              size="sm"
              colorScheme="gray"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(template.id);
              }}
            >
              <Pencil size={16} />
            </IconButton>
            <IconButton
              aria-label="Delete template"
              variant="ghost"
              size="sm"
              colorScheme="gray"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(template.id);
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </HStack>
        </Flex>

        {/* Content Preview */}
        <Text
          fontSize="sm"
          color={{ base: "gray.700", _dark: "gray.300" }}
          lineClamp={2}
        >
          {template.content}
        </Text>

        {/* Tags & Badges */}
        <HStack gap={2} flexWrap="wrap">
          <Badge colorScheme={platformColors[template.platform]} variant="subtle">
            {template.platform}
          </Badge>
          <Badge colorScheme={toneColors[template.tone]} variant="outline">
            {template.tone}
          </Badge>
          <Badge variant="outline">{template.length}</Badge>
          {template.categories.map((cat) => (
            <Badge key={cat.id} variant="subtle" colorScheme="gray">
              {cat.name}
            </Badge>
          ))}
        </HStack>

        {/* Footer */}
        <HStack justify="space-between" fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
          <HStack gap={4}>
            <HStack gap={1}>
              <Icon>
                <Copy size={14} />
              </Icon>
              <Text>{template.usageCount || 0} uses</Text>
            </HStack>
            {template.lastUsedAt && (
              <HStack gap={1}>
                <Icon>
                  <Clock size={14} />
                </Icon>
                <Text>Used {formatRelativeTime(new Date(template.lastUsedAt))}</Text>
              </HStack>
            )}
          </HStack>
          <Text>
            {template.variables.length} variable{template.variables.length !== 1 ? "s" : ""}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
