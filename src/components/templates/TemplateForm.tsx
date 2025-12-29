"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Card,
  Badge,
  Grid,
  Icon,
} from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { Category, Tag } from "@/types";
import { extractVariables } from "@/lib/utils";

export interface TemplateFormData {
  title: string;
  content: string;
  description: string;
  categoryIds: string[];
  tagIds: string[];
}

interface TemplateFormProps {
  formData: TemplateFormData;
  onChange: (data: TemplateFormData) => void;
  isEdit?: boolean;
}

export function TemplateForm({ formData, onChange, isEdit = false }: TemplateFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [extractedVars, setExtractedVars] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (formData.content) {
      const vars = extractVariables(formData.content);
      setExtractedVars(vars);
    } else {
      setExtractedVars([]);
    }
  }, [formData.content]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function fetchTags() {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }

  const updateFormData = (updates: Partial<TemplateFormData>) => {
    onChange({ ...formData, ...updates });
  };

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 380px" }}
      gap={4}
      alignItems="start"
    >
      {/* Left: Main Form */}
      <Card.Root
        bg="bg.panel"
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        p={5}
      >
        <VStack align="stretch" gap={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Template Title *
            </Text>
            <Input
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              placeholder="General Referral Request"
              required
              borderColor={{ base: "gray.300", _dark: "gray.400" }}
              _focus={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Description
            </Text>
            <Input
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Brief description of when to use this template"
              borderColor={{ base: "gray.300", _dark: "gray.400" }}
              _focus={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Message Content *
            </Text>
            <Textarea
              value={formData.content}
              onChange={(e) => updateFormData({ content: e.target.value })}
              placeholder="Write your template here. Use {{variableName}} for dynamic fields.&#10;&#10;Example:&#10;Hi {{name}},&#10;&#10;I noticed you work at {{company}}..."
              rows={12}
              fontSize="sm"
              lineHeight="1.6"
              required
              borderColor={{ base: "gray.300", _dark: "gray.400" }}
              _focus={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
            />
            <Text fontSize="xs" color="fg.muted" mt={2}>
              Use {`{{variableName}}`} for dynamic fields. Add descriptions with {`{{name:Description}}`} or defaults with {`{{name|Default Value}}`}
            </Text>
          </Box>
        </VStack>
      </Card.Root>

      {/* Right: Metadata & Variables */}
      <VStack align="stretch" gap={4}>
        {/* Categories */}
        <Card.Root bg="bg.panel" borderWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} p={4}>
          <VStack align="stretch" gap={3}>
            <Text fontWeight="semibold" fontSize="sm">Categories</Text>
            {categories.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">No categories available</Text>
            ) : (
              <VStack align="stretch" gap={2} maxH="150px" overflowY="auto">
                {categories.map((category) => (
                  <HStack key={category.id}>
                    <input
                      type="checkbox"
                      id={`cat-${category.id}`}
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          updateFormData({
                            categoryIds: [...formData.categoryIds, category.id],
                          });
                        } else {
                          updateFormData({
                            categoryIds: formData.categoryIds.filter((id) => id !== category.id),
                          });
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                    <label htmlFor={`cat-${category.id}`} style={{ cursor: "pointer", flex: 1 }}>
                      <Text fontSize="sm">{category.name}</Text>
                    </label>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </Card.Root>

        {/* Tags */}
        <Card.Root bg="bg.panel" borderWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} p={4}>
          <VStack align="stretch" gap={3}>
            <Text fontWeight="semibold" fontSize="sm">Tags</Text>
            {tags.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">No tags available</Text>
            ) : (
              <VStack align="stretch" gap={2} maxH="150px" overflowY="auto">
                {tags.map((tag) => (
                  <HStack key={tag.id} cursor="pointer">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={formData.tagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({
                            tagIds: [...formData.tagIds, tag.id],
                          });
                        } else {
                          updateFormData({
                            tagIds: formData.tagIds.filter((id) => id !== tag.id),
                          });
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                    <label htmlFor={`tag-${tag.id}`} style={{ cursor: "pointer", flex: 1 }}>
                      <Text fontSize="sm">{tag.name}</Text>
                    </label>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </Card.Root>

        {/* Extracted Variables */}
        {extractedVars.length > 0 && (
          <Card.Root bg="bg.panel" borderWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} p={4}>
            <VStack align="stretch" gap={3}>
              <HStack gap={2}>
                <Icon color="fg.muted">
                  <Sparkles size={16} />
                </Icon>
                <Text fontWeight="semibold" fontSize="sm">
                  Detected Variables
                </Text>
              </HStack>
              <VStack align="stretch" gap={2} maxH="300px" overflowY="auto">
                {extractedVars.map((variable) => (
                  <HStack
                    key={variable.name || variable.displayName}
                    justify="space-between"
                    p={2}
                    bg="bg.muted"
                    borderRadius="sm"
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      {variable.displayName}
                    </Text>
                    <Badge size="xs" variant="outline" colorPalette="gray">
                      {variable.type}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Card.Root>
        )}
      </VStack>
    </Grid>
  );
}
