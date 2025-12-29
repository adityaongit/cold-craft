"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Button,
  Select,
  Tabs,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { EmptyState } from "@/components/common/EmptyState";
import { TemplatesPageSkeleton } from "@/components/common/SkeletonLoaders";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { TemplateWithRelations } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const platformOptions = createListCollection({
  items: [
    { label: "All Platforms", value: "" },
    { label: "LinkedIn", value: "LINKEDIN" },
    { label: "Gmail", value: "GMAIL" },
    { label: "Twitter", value: "TWITTER" },
    { label: "Cold Email", value: "COLD_EMAIL" },
    { label: "Other", value: "OTHER" },
  ],
});

const toneOptions = createListCollection({
  items: [
    { label: "All Tones", value: "" },
    { label: "Professional", value: "PROFESSIONAL" },
    { label: "Casual", value: "CASUAL" },
    { label: "Friendly", value: "FRIENDLY" },
    { label: "Formal", value: "FORMAL" },
    { label: "Enthusiastic", value: "ENTHUSIASTIC" },
  ],
});

async function fetchTemplates(filter: { platform: string; tone: string; isFavorite: boolean }) {
  const params = new URLSearchParams();
  if (filter.platform) params.set("platform", filter.platform);
  if (filter.tone) params.set("tone", filter.tone);
  if (filter.isFavorite) params.set("isFavorite", "true");

  const res = await fetch(`/api/templates?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch templates");
  const data = await res.json();
  return data.data as TemplateWithRelations[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState({
    platform: "",
    tone: "",
    isFavorite: false,
  });

  const { data: templates = [], isLoading: loading } = useQuery({
    queryKey: ["templates", filter],
    queryFn: () => fetchTemplates(filter),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  async function handleToggleFavorite(id: string, isFavorite: boolean) {
    toggleFavoriteMutation.mutate({ id, isFavorite });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    deleteMutation.mutate(id);
  }

  return (
    <AppLayout title="Templates">
      <VStack align="stretch" gap={4}>
        {/* Header with Filters */}
        <Tabs.Root defaultValue="all">
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <Tabs.List>
              <Tabs.Trigger value="all" onClick={() => setFilter({ ...filter, isFavorite: false })}>
                All Templates
              </Tabs.Trigger>
              <Tabs.Trigger value="favorites" onClick={() => setFilter({ ...filter, isFavorite: true })}>
                Favorites
              </Tabs.Trigger>
            </Tabs.List>

            <HStack gap={3} flexDirection={{ base: "column", md: "row" }} w={{ base: "full", md: "auto" }}>
              <Button
                onClick={() => router.push("/templates/new")}
                bg={{ base: "white", _dark: "#f5f5f5" }}
                color={{ base: "gray.900", _dark: "gray.900" }}
                borderWidth="1px"
                borderColor={{ base: "gray.300", _dark: "gray.300" }}
                _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
                borderRadius="md"
                fontWeight="500"
                gap={2}
                w={{ base: "full", md: "auto" }}
              >
                <Plus size={16} />
                New Template
              </Button>
              <Select.Root
                collection={platformOptions}
                value={[filter.platform]}
                onValueChange={(e) => setFilter({ ...filter, platform: e.value[0] })}
                width={{ base: "full", md: "200px" }}
                borderColor={{ base: "gray.300", _dark: "gray.400" }}
                _focusWithin={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Platform" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {platformOptions.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              <Select.Root
                collection={toneOptions}
                value={[filter.tone]}
                onValueChange={(e) => setFilter({ ...filter, tone: e.value[0] })}
                width={{ base: "full", md: "200px" }}
                borderColor={{ base: "gray.300", _dark: "gray.400" }}
                _focusWithin={{ borderColor: { base: "gray.400", _dark: "gray.300" } }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Tone" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {toneOptions.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </HStack>
          </HStack>
        </Tabs.Root>

        {/* Templates Grid */}
        {loading ? (
          <TemplatesPageSkeleton />
        ) : templates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No templates yet"
            description="Create your first template to get started with PitchPad"
            actionLabel="Create Template"
            onAction={() => router.push("/templates/new")}
          />
        ) : (
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(auto-fill, minmax(280px, 1fr))" }}
            gap={4}
          >
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={(id) => router.push(`/templates/${id}/edit`)}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onUse={(id) => router.push(`/compose?templateId=${id}`)}
              />
            ))}
          </Grid>
        )}
      </VStack>
    </AppLayout>
  );
}
