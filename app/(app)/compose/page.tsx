"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Textarea,
  Input,
  Button,
  Select,
  Card,
  Badge,
  Icon,
  IconButton,
  Portal,
  createListCollection,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Copy, Check, FileText, Sparkles } from "lucide-react";
import { TemplateWithRelations } from "@/types";
import { fillTemplate, copyToClipboard } from "@/lib/utils";

function ComposePageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId");

  const [templates, setTemplates] = useState<TemplateWithRelations[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithRelations | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [composedMessage, setComposedMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedResume, setSelectedResume] = useState("");

  const templateCollection = useMemo(() => {
    return createListCollection({
      items: templates,
      itemToString: (item) => item.title,
      itemToValue: (item) => item.id,
    });
  }, [templates]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        handleTemplateSelect(template);
      }
    }
  }, [templateId, templates]);

  useEffect(() => {
    if (selectedTemplate) {
      const filled = fillTemplate(selectedTemplate.content, variableValues);
      setComposedMessage(filled);
    }
  }, [selectedTemplate, variableValues]);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/templates?isArchived=false");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  }

  function handleTemplateSelect(template: TemplateWithRelations) {
    setSelectedTemplate(template);

    // Initialize variable values with defaults
    const initialValues: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialValues[v.name] = v.defaultValue || "";
    });
    setVariableValues(initialValues);
  }

  async function handleCopy() {
    const success = await copyToClipboard(composedMessage);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track usage
      if (selectedTemplate) {
        await fetch("/api/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            resumeId: selectedResume || undefined,
            variableValues,
            platform: selectedTemplate.platform,
          }),
        });
      }
    }
  }

  return (
    <AppLayout
      title="Compose Message"
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1.2fr" }}
        gap={4}
        h="full"
      >
        {/* Left Panel: Template & Variables */}
        <Card.Root
          bg="bg.panel"
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          p={5}
          display="flex"
          flexDirection="column"
          h="full"
          overflow="hidden"
        >
          <VStack align="stretch" gap={4} h="full">
            {/* Template Selector */}
            <Box flexShrink={0}>
              <Text fontSize="sm" fontWeight="semibold" mb={3} color="fg.default">
                Template
              </Text>
              <Select.Root
                collection={templateCollection}
                value={selectedTemplate ? [selectedTemplate.id] : []}
                onValueChange={(e) => {
                  const template = templates.find((t) => t.id === e.value[0]);
                  if (template) handleTemplateSelect(template);
                }}
                borderColor={{ base: "gray.300", _dark: "gray.400" }}
                _focusWithin={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Choose a template..." />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {templates.map((template) => (
                        <Select.Item key={template.id} item={template}>
                          <VStack align="start" gap={1}>
                            <Text fontWeight="medium">{template.title}</Text>
                            <HStack gap={2}>
                              <Badge size="xs" variant="subtle" colorPalette="gray">
                                {template.platform}
                              </Badge>
                              <Badge size="xs" variant="outline" colorPalette="gray">
                                {template.tone}
                              </Badge>
                            </HStack>
                          </VStack>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>

            {/* Variables Section - Scrollable */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <Box flex="1" overflowY="auto" minH={0}>
                <Text fontSize="sm" fontWeight="semibold" mb={3} color="fg.default">
                  Variables
                </Text>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  gap={4}
                >
                  {selectedTemplate.variables.map((variable) => (
                    <Box key={variable.id}>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        {variable.displayName}
                        {variable.isRequired && (
                          <Text as="span" color="red.500" ml={1}>
                            *
                          </Text>
                        )}
                      </Text>
                      {variable.description && (
                        <Text fontSize="xs" color="fg.muted" mb={2}>
                          {variable.description}
                        </Text>
                      )}

                      {variable.type === "TEXTAREA" ? (
                        <Textarea
                          value={variableValues[variable.name] || ""}
                          onChange={(e) =>
                            setVariableValues({
                              ...variableValues,
                              [variable.name]: e.target.value,
                            })
                          }
                          placeholder={variable.defaultValue || `Enter ${variable.displayName.toLowerCase()}`}
                          rows={3}
                          size="sm"
                          borderColor={{ base: "gray.300", _dark: "gray.400" }}
                          _focus={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
                        />
                      ) : (
                        <Input
                          type={variable.type === "EMAIL" ? "email" : variable.type === "URL" ? "url" : variable.type === "PHONE" ? "tel" : variable.type === "DATE" ? "date" : "text"}
                          value={variableValues[variable.name] || ""}
                          onChange={(e) =>
                            setVariableValues({
                              ...variableValues,
                              [variable.name]: e.target.value,
                            })
                          }
                          placeholder={variable.defaultValue || `Enter ${variable.displayName.toLowerCase()}`}
                          size="sm"
                          borderColor={{ base: "gray.300", _dark: "gray.400" }}
                          _focus={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
                        />
                      )}
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}

            {!selectedTemplate && (
              <Center flex="1">
                <VStack gap={3} color="fg.muted">
                  <Icon fontSize="4xl">
                    <FileText size={48} />
                  </Icon>
                  <Text fontSize="sm">Select a template to get started</Text>
                </VStack>
              </Center>
            )}
          </VStack>
        </Card.Root>

        {/* Right Panel: Preview */}
        <Card.Root
          bg="bg.panel"
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          p={5}
          display="flex"
          flexDirection="column"
          h="full"
          overflow="hidden"
        >
          <VStack align="stretch" gap={4} h="full">
            {/* Header with Copy Button */}
            <HStack justify="space-between" flexShrink={0}>
              <HStack gap={3}>
                <Text fontWeight="semibold" fontSize="md">
                  Preview
                </Text>
                {selectedTemplate && (
                  <HStack gap={2}>
                    <Badge size="xs" variant="subtle" colorPalette="gray">
                      {selectedTemplate.platform}
                    </Badge>
                    <Badge size="xs" variant="outline" colorPalette="gray">
                      {selectedTemplate.tone}
                    </Badge>
                  </HStack>
                )}
              </HStack>
              <Button
                onClick={handleCopy}
                disabled={!composedMessage || !selectedTemplate}
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
                {copied ? "Copied!" : "Copy Message"}
              </Button>
            </HStack>

            {/* Scrollable Preview */}
            <Box
              flex="1"
              bg="bg.surface"
              borderRadius="md"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              p={5}
              fontSize="sm"
              lineHeight="1.7"
              whiteSpace="pre-wrap"
              overflowY="auto"
              minH={0}
            >
              {composedMessage || (
                <Text color="fg.muted" fontSize="sm">
                  Your composed message will appear here...
                </Text>
              )}
            </Box>

            {/* Word Count Footer */}
            <HStack justify="flex-end" pt={2} borderTopWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} flexShrink={0}>
              <Text fontSize="xs" color="fg.muted">
                {composedMessage.split(/\s+/).filter(Boolean).length} words
              </Text>
            </HStack>
          </VStack>
        </Card.Root>
      </Grid>
    </AppLayout>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Compose Message">
          <Center h="50vh">
            <Spinner size="xl" color="brand.500" />
          </Center>
        </AppLayout>
      }
    >
      <ComposePageContent />
    </Suspense>
  );
}
