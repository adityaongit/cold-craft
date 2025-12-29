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
  Center,
  createListCollection,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ComposePageSkeleton } from "@/components/common/SkeletonLoaders";
import { Copy, Check, FileText, Sparkles, Save } from "lucide-react";
import { TemplateWithRelations } from "@/types";
import { fillTemplate, copyToClipboard } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";

async function fetchTemplates() {
  const res = await fetch("/api/templates?isArchived=false");
  if (!res.ok) throw new Error("Failed to fetch templates");
  const data = await res.json();
  return data.data as TemplateWithRelations[];
}

function ComposePageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates", { isArchived: false }],
    queryFn: fetchTemplates,
    staleTime: 0, // Always refetch to get latest data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithRelations | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [composedMessage, setComposedMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedResume, setSelectedResume] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const templateCollection = useMemo(() => {
    return createListCollection({
      items: templates,
      itemToString: (item) => item.title,
      itemToValue: (item) => item.id,
    });
  }, [templates]);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);

        // Check if there are prefilled variables from saved messages
        const prefillData = sessionStorage.getItem('prefillVariables');
        if (prefillData) {
          try {
            const prefillValues = JSON.parse(prefillData);
            setVariableValues(prefillValues);
            // Clear the storage after using it
            sessionStorage.removeItem('prefillVariables');
          } catch (error) {
            console.error('Failed to parse prefill data:', error);
            // Fall back to default values
            const initialValues: Record<string, string> = {};
            template.variables.forEach((v) => {
              initialValues[v.name] = v.defaultValue || "";
            });
            setVariableValues(initialValues);
          }
        } else {
          // Initialize with default values if no prefill data
          const initialValues: Record<string, string> = {};
          template.variables.forEach((v) => {
            initialValues[v.name] = v.defaultValue || "";
          });
          setVariableValues(initialValues);
        }
      }
    }
  }, [templateId, templates]);

  useEffect(() => {
    if (selectedTemplate) {
      const filled = fillTemplate(selectedTemplate.content, variableValues);
      setComposedMessage(filled);
    }
  }, [selectedTemplate, variableValues]);

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
          }),
        });
      }
    }
  }

  async function handleSave() {
    if (!saveTitle.trim()) {
      toaster.error({ title: "Please enter a title" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/composed-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle.trim(),
          content: composedMessage,
          templateId: selectedTemplate?.id,
          variableValues,
        }),
      });

      if (res.ok) {
        toaster.success({ title: "Message saved successfully" });
        setShowSaveDialog(false);
        setSaveTitle("");
      } else {
        const error = await res.json();
        toaster.error({ title: error.error || "Failed to save message" });
      }
    } catch (error) {
      console.error("Failed to save message:", error);
      toaster.error({ title: "Failed to save message" });
    } finally {
      setSaving(false);
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
        {isLoading ? (
          <ComposePageSkeleton />
        ) : (
          <>
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
              >
                <Select.HiddenSelect />
                <Select.Control
                  borderWidth="1px"
                  borderColor={{ base: "gray.300", _dark: "gray.600" }}
                  _focusWithin={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
                >
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
                            {template.description && (
                              <Text fontSize="xs" color="fg.muted">{template.description}</Text>
                            )}
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
                  templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                  gap={4}
                >
                  {selectedTemplate.variables.map((variable) => (
                    <Box key={variable.name}>
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
            {/* Header with Action Buttons */}
            <HStack justify="space-between" flexShrink={0}>
              <Text fontWeight="semibold" fontSize="md">
                Preview
              </Text>
              <HStack gap={2}>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!composedMessage}
                  variant="outline"
                  size="sm"
                  gap={2}
                  borderColor={{ base: "gray.300", _dark: "gray.600" }}
                  _hover={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
                >
                  <Save size={14} />
                  Save
                </Button>
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
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </HStack>
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
        </>
        )}
      </Grid>

      {/* Save Dialog */}
      <DialogRoot
        open={showSaveDialog}
        onOpenChange={(e) => {
          if (!e.open) {
            setShowSaveDialog(false);
            setSaveTitle("");
          }
        }}
        placement="center"
      >
        <DialogBackdrop />
        <DialogContent
          maxW={{ base: "90vw", sm: "md" }}
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <DialogHeader>
            <DialogTitle>Save Composed Message</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Title *
                </Text>
                <Input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g., LinkedIn Message for Google PM Role"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted">
                  Save this composed message to access and reuse it later.
                </Text>
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveTitle("");
              }}
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              _hover={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              loadingText="Saving..."
              bg={{ base: "white", _dark: "#f5f5f5" }}
              color={{ base: "gray.900", _dark: "gray.900" }}
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.300" }}
              _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
            >
              Save Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </AppLayout>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Compose Message">
          <ComposePageSkeleton />
        </AppLayout>
      }
    >
      <ComposePageContent />
    </Suspense>
  );
}
