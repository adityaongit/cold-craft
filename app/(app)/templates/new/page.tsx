"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toaster, Toaster } from "@/components/ui/toaster";
import { TemplateForm, type TemplateFormData } from "@/components/templates/TemplateForm";
import { TemplatePreview } from "@/components/templates/TemplatePreview";

export default function NewTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    title: "",
    content: "",
    description: "",
    platform: "OTHER",
    tone: "PROFESSIONAL",
    categoryIds: [],
    tagIds: [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const template = await res.json();
        toaster.success({
          title: "Template created",
          description: "Your template has been created successfully",
        });
        router.push(`/templates`);
      } else {
        const error = await res.json();
        toaster.error({
          title: "Failed to create template",
          description: error.error || "An error occurred while creating the template",
        });
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toaster.error({
        title: "Failed to create template",
        description: "An unexpected error occurred",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Templates", href: "/templates" },
        { label: "New Template" }
      ]}
    >
      <form onSubmit={handleSubmit}>
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <HStack justify="flex-end"  gap={2}>
            <Button
              onClick={() => setShowPreview(true)}
              disabled={!formData.content}
              bg={{ base: "white", _dark: "#f5f5f5" }}
              color={{ base: "gray.900", _dark: "gray.900" }}
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.300" }}
              _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
              borderRadius="md"
              fontWeight="500"
              gap={2}
            >
              <Eye size={16} />
              Preview
            </Button>
            <Button
              type="submit"
              loading={saving}
              loadingText="Saving..."
              bg={{ base: "white", _dark: "#f5f5f5" }}
              color={{ base: "gray.900", _dark: "gray.900" }}
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.300" }}
              _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
              borderRadius="md"
              fontWeight="500"
              gap={2}
            >
              <Save size={16} />
              Save Template
            </Button>
          </HStack>

          <TemplateForm formData={formData} onChange={setFormData} />
        </VStack>
      </form>

      <TemplatePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData.title || "Untitled Template"}
        content={formData.content}
        platform={formData.platform}
        tone={formData.tone}
      />

      <Toaster />
    </AppLayout>
  );
}
