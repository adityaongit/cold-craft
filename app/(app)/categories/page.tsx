"use client";

import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Icon,
  IconButton,
  Input,
  Textarea,
  Grid,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogBackdrop,
  DialogCloseTrigger,
  SimpleGrid,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { CategoriesPageSkeleton } from "@/components/common/SkeletonLoaders";
import { Plus, Edit2, Trash2, Save, X, Linkedin, Mail, MessageSquare, Send, AtSign, Hash, Video, Globe, Folder } from "lucide-react";
import { CategoryWithCount } from "@/types";
import { toaster, Toaster } from "@/components/ui/toaster";

// Custom provider icon components
const GmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const OutlookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"/>
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
  </svg>
);

const ICON_OPTIONS = [
  { name: "LinkedIn", iconComponent: Linkedin, color: "#0A66C2" },
  { name: "Email", iconComponent: Mail, color: "#6B7280" },
  { name: "WhatsApp", iconComponent: WhatsAppIcon, color: "#25D366" },
  { name: "Twitter/X", iconComponent: TwitterIcon, color: "#000000" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: ICON_OPTIONS[0].name,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFormData({ name: "", description: "", icon: ICON_OPTIONS[0].name });
        fetchCategories();
        toaster.success({
          title: "Category created successfully",
        });
      } else {
        const error = await res.json();
        toaster.error({
          title: error.error || "Failed to create category",
        });
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toaster.error({
        title: "Failed to create category",
      });
    }
  }

  async function handleUpdate(id: string) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditingId(null);
        setFormData({ name: "", description: "", icon: ICON_OPTIONS[0].name });
        fetchCategories();
        toaster.success({
          title: "Category updated successfully",
        });
      } else {
        const error = await res.json();
        toaster.error({
          title: error.error || "Failed to update category",
        });
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toaster.error({
        title: "Failed to update category",
      });
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;

    // Optimistically update UI
    setCategories(categories.filter(cat => cat.id !== deleteId));
    setDeleteId(null);

    try {
      const res = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toaster.success({
          title: "Category deleted successfully",
        });
      } else {
        // Revert on error
        fetchCategories();
        const error = await res.json();
        toaster.error({
          title: error.error || "Failed to delete category",
        });
      }
    } catch (error) {
      // Revert on error
      fetchCategories();
      console.error("Failed to delete category:", error);
      toaster.error({
        title: "Failed to delete category",
      });
    }
  }

  function startEdit(category: CategoryWithCount) {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ name: "", description: "", icon: ICON_OPTIONS[0].name });
  }

  return (
    <AppLayout title="Categories">
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="flex-end">
          <Button
            onClick={() => setShowCreateForm(true)}
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
            New Category
          </Button>
        </HStack>

        {/* Categories List */}
        {loading ? (
          <CategoriesPageSkeleton />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No categories yet"
            description="Create your first category to organize your templates"
          />
        ) : (
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 3, md: 4 }}>
            {categories.map((category) => (
              <Card.Root
                key={category.id}
                bg="bg.panel"
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
                p={5}
              >
                {editingId === category.id ? (
                  <VStack align="stretch" gap={3}>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Category name"
                      size="sm"
                      borderColor={{ base: "gray.300", _dark: "gray.600" }}
                      _focus={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
                    />
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                      size="sm"
                      borderColor={{ base: "gray.300", _dark: "gray.600" }}
                      _focus={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
                    />
                    <SimpleGrid columns={4} gap={2}>
                      {ICON_OPTIONS.map((option) => {
                        const IconComp = option.iconComponent;
                        const isSelected = formData.icon === option.name;
                        return (
                          <Box
                            key={option.name}
                            p={2}
                            borderRadius="md"
                            borderWidth="2px"
                            borderColor={isSelected ? "border.emphasized" : "border.subtle"}
                            bg={isSelected ? "bg.emphasized" : "bg.surface"}
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            _hover={{ borderColor: "border.emphasized" }}
                            onClick={() => setFormData({ ...formData, icon: option.name })}
                            transition="all 0.2s"
                            title={option.name}
                          >
                            <Box color="fg.default" w={6} h={6} display="flex" alignItems="center" justifyContent="center">
                              <IconComp />
                            </Box>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                    <HStack justify="flex-end" gap={2}>
                      <IconButton
                        aria-label="Cancel"
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        <X size={16} />
                      </IconButton>
                      <IconButton
                        aria-label="Save"
                        size="sm"
                        onClick={() => handleUpdate(category.id)}
                      >
                        <Save size={16} />
                      </IconButton>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="start">
                      <HStack gap={3}>
                        <Box
                          bg="bg.muted"
                          p={2.5}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          w={12}
                          h={12}
                        >
                          <Box color="fg.default" w={6} h={6}>
                            {(() => {
                              const iconOption = ICON_OPTIONS.find(opt => opt.name === category.icon);
                              if (iconOption) {
                                const IconComp = iconOption.iconComponent;
                                return <IconComp />;
                              }
                              return <Icon><Mail size={24} /></Icon>;
                            })()}
                          </Box>
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="semibold">{category.name}</Text>
                          {category.description && (
                            <Text fontSize="sm" color="fg.muted">
                              {category.description}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <HStack gap={1}>
                        <IconButton
                          aria-label="Edit"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(category)}
                        >
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton
                          aria-label="Delete"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </HStack>
                    </HStack>

                    <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="border.subtle">
                      <Badge variant="outline">
                        {category.templateCount} template{category.templateCount !== 1 ? "s" : ""}
                      </Badge>
                      {category.children && category.children.length > 0 && (
                        <Badge variant="subtle">
                          {category.children.length} subcategor{category.children.length !== 1 ? "ies" : "y"}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                )}
              </Card.Root>
            ))}
          </Grid>
        )}
      </VStack>

      {/* Create Category Dialog */}
      <DialogRoot open={showCreateForm} onOpenChange={(e) => !e.open && setShowCreateForm(false)} placement="center">
        <DialogBackdrop />
        <DialogContent
          maxW={{ base: "95vw", sm: "90vw", md: "2xl" }}
          maxH={{ base: "90vh", md: "85vh" }}
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          overflowY="auto"
        >
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Category Name *
                  </Text>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Job Applications"
                    required
                    borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    _focus={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Description
                  </Text>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={2}
                    borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    _focus={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Platform / Provider
                  </Text>
                  <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3}>
                    {ICON_OPTIONS.map((option) => {
                      const IconComp = option.iconComponent;
                      const isSelected = formData.icon === option.name;
                      return (
                        <VStack
                          key={option.name}
                          p={4}
                          borderRadius="lg"
                          borderWidth="2px"
                          borderColor={isSelected ? "border.emphasized" : "border.subtle"}
                          bg={isSelected ? "bg.emphasized" : "bg.surface"}
                          cursor="pointer"
                          _hover={{ borderColor: "border.emphasized", transform: "translateY(-2px)" }}
                          onClick={() => setFormData({ ...formData, icon: option.name })}
                          transition="all 0.2s"
                          gap={2}
                          justify="center"
                          align="center"
                        >
                          <Box color="fg.default" w={6} h={6} display="flex" alignItems="center" justifyContent="center">
                            <IconComp />
                          </Box>
                          <Text fontSize="2xs" fontWeight="medium" textAlign="center" color={isSelected ? "fg.emphasized" : "fg.muted"}>
                            {option.name}
                          </Text>
                        </VStack>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              </VStack>
            </DialogBody>
            <DialogFooter gap={{ base: 2, md: 3 }} flexDirection={{ base: "column-reverse", sm: "row" }}>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: "", description: "", icon: ICON_OPTIONS[0].name });
                }}
                w={{ base: "full", sm: "auto" }}
                borderColor={{ base: "gray.300", _dark: "gray.600" }}
                _hover={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                bg={{ base: "white", _dark: "#f5f5f5" }}
                color={{ base: "gray.900", _dark: "gray.900" }}
                borderWidth="1px"
                borderColor={{ base: "gray.300", _dark: "gray.300" }}
                _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
                borderRadius="md"
                fontWeight="500"
                w={{ base: "full", sm: "auto" }}
              >
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>

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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text>Are you sure you want to delete this category? This action cannot be undone.</Text>
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

      <Toaster />
    </AppLayout>
  );
}
