"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TemplateEditSkeleton } from "@/components/common/SkeletonLoaders";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { TemplateWithRelations } from "@/types";
import { toaster, Toaster } from "@/components/ui/toaster";
import { TemplateForm, type TemplateFormData } from "@/components/templates/TemplateForm";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { useQueryClient } from "@tanstack/react-query";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    title: "",
    content: "",
    description: "",
    categoryIds: [],
    tagIds: [],
  });

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  async function fetchTemplate() {
    try {
      const res = await fetch(`/api/templates/${templateId}`);
      if (res.ok) {
        const template: TemplateWithRelations = await res.json();
        setFormData({
          title: template.title,
          content: template.content,
          description: template.description || "",
          categoryIds: template.categories.map((c) => c.id),
          tagIds: template.tags.map((t) => t.id),
        });
      }
    } catch (error) {
      console.error("Failed to fetch template:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Completely remove template cache to force fresh fetch
        queryClient.removeQueries({ queryKey: ["templates"] });

        toaster.success({
          title: "Template updated successfully",
        });
        router.push(`/templates`);
      } else {
        const error = await res.json();
        let errorMessage = error.error || "Failed to update template";

        // If there are validation details, show them
        if (error.details && Array.isArray(error.details)) {
          const messages = error.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
          errorMessage = `${errorMessage}: ${messages}`;
        }

        toaster.error({
          title: errorMessage,
        });
      }
    } catch (error) {
      console.error("Failed to update template:", error);
      toaster.error({
        title: "Failed to update template",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <TemplateEditSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit}>
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <HStack justify="flex-end" gap={2}>
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
              Save Changes
            </Button>
          </HStack>

          <TemplateForm formData={formData} onChange={setFormData} isEdit />
        </VStack>
      </form>

      <TemplatePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData.title || "Untitled Template"}
        content={formData.content}
      />

      <Toaster />
    </AppLayout>
  );
}
