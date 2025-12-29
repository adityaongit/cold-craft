"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Button,
  Tabs,
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
import { TemplateCard } from "@/components/templates/TemplateCard";
import { EmptyState } from "@/components/common/EmptyState";
import { TemplatesPageSkeleton } from "@/components/common/SkeletonLoaders";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { TemplateWithRelations } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchTemplates(filter: { isFavorite: boolean }) {
  const params = new URLSearchParams();
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
    isFavorite: false,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    onMutate: async ({ id, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["templates"] });

      // Get all templates query data for rollback
      const allQueriesData = queryClient.getQueriesData({ queryKey: ["templates"] });

      // Update "All Templates" cache - just update the isFavorite property
      queryClient.setQueryData(["templates", { isFavorite: false }], (old: TemplateWithRelations[] | undefined) => {
        if (!old) return old;
        return old.map((template) =>
          template.id === id ? { ...template, isFavorite } : template
        );
      });

      // Update "Favorites" cache - add or remove the template
      queryClient.setQueryData(["templates", { isFavorite: true }], (old: TemplateWithRelations[] | undefined) => {
        if (!old) return old;

        if (isFavorite) {
          // Adding to favorites - check if already exists
          const exists = old.some((t) => t.id === id);
          if (exists) {
            return old.map((template) =>
              template.id === id ? { ...template, isFavorite } : template
            );
          } else {
            // Get the template from all templates cache to add it
            const allTemplates = queryClient.getQueryData(["templates", { isFavorite: false }]) as TemplateWithRelations[] | undefined;
            const templateToAdd = allTemplates?.find((t) => t.id === id);
            if (templateToAdd) {
              return [...old, { ...templateToAdd, isFavorite: true }];
            }
          }
        } else {
          // Removing from favorites
          return old.filter((template) => template.id !== id);
        }

        return old;
      });

      // Return context with previous values
      return { allQueriesData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error - restore all previous query states
      if (context?.allQueriesData) {
        context.allQueriesData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Only invalidate usage stats, not templates (already optimistically updated)
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
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
    setDeleteId(id);
  }

  function confirmDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setDeleteId(null);
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

      {/* Delete Confirmation Dialog */}
      <DialogRoot
        open={!!deleteId}
        onOpenChange={(details) => {
          if (!details.open) {
            setDeleteId(null);
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
            <DialogTitle>Delete Template</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text>Are you sure you want to delete this template? This action cannot be undone.</Text>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              _hover={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              bg={{ base: "#dc2626", _dark: "#ef4444" }}
              color="white"
              _hover={{ bg: { base: "#b91c1c", _dark: "#dc2626" } }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </AppLayout>
  );
}
