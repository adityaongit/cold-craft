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
  Spinner,
  Center,
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
import { Plus, Folder, Edit2, Trash2, Save, X, Briefcase, GraduationCap, Code, Mail, Phone, Users, Star, Heart, Target, Zap, TrendingUp, Award, BookOpen, Home, Settings as SettingsIcon } from "lucide-react";
import { CategoryWithCount } from "@/types";
import { toaster, Toaster } from "@/components/ui/toaster";

const ICON_OPTIONS = [
  { name: "Folder", icon: Folder, emoji: "📁" },
  { name: "Briefcase", icon: Briefcase, emoji: "💼" },
  { name: "GraduationCap", icon: GraduationCap, emoji: "🎓" },
  { name: "Code", icon: Code, emoji: "💻" },
  { name: "Mail", icon: Mail, emoji: "📧" },
  { name: "Phone", icon: Phone, emoji: "📞" },
  { name: "Users", icon: Users, emoji: "👥" },
  { name: "Star", icon: Star, emoji: "⭐" },
  { name: "Heart", icon: Heart, emoji: "❤️" },
  { name: "Target", icon: Target, emoji: "🎯" },
  { name: "Zap", icon: Zap, emoji: "⚡" },
  { name: "TrendingUp", icon: TrendingUp, emoji: "📈" },
  { name: "Award", icon: Award, emoji: "🏆" },
  { name: "BookOpen", icon: BookOpen, emoji: "📖" },
  { name: "Home", icon: Home, emoji: "🏠" },
  { name: "Settings", icon: SettingsIcon, emoji: "⚙️" },
];

const COLOR_OPTIONS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#3B82F6", // Blue
  "#6B7280", // Gray
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
    color: "#6366F1",
    icon: "📁",
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
        setFormData({ name: "", description: "", color: "#6366F1", icon: "📁" });
        fetchCategories();
        toaster.success({
          title: "Category created",
          description: "Your category has been created successfully",
        });
      } else {
        const error = await res.json();
        toaster.error({
          title: "Failed to create category",
          description: error.error || "An error occurred while creating the category",
        });
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toaster.error({
        title: "Failed to create category",
        description: "An unexpected error occurred",
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
        setFormData({ name: "", description: "", color: "#6366F1", icon: "📁" });
        fetchCategories();
        toaster.success({
          title: "Category updated",
          description: "Your category has been updated successfully",
        });
      } else {
        const error = await res.json();
        toaster.error({
          title: "Failed to update category",
          description: error.error || "An error occurred while updating the category",
        });
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toaster.error({
        title: "Failed to update category",
        description: "An unexpected error occurred",
      });
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteId(null);
        fetchCategories();
        toaster.success({
          title: "Category deleted",
          description: "The category has been deleted successfully",
        });
      } else {
        const error = await res.json();
        toaster.error({
          title: "Failed to delete category",
          description: error.error || "An error occurred while deleting the category",
        });
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toaster.error({
        title: "Failed to delete category",
        description: "An unexpected error occurred",
      });
    }
  }

  function startEdit(category: CategoryWithCount) {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ name: "", description: "", color: "#6366F1", icon: "📁" });
  }

  return (
    <AppLayout title="Categories">
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="flex-end">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            bg={{ base: "white", _dark: "#f5f5f5" }}
            color={{ base: "gray.900", _dark: "gray.900" }}
            borderWidth="1px"
            borderColor={{ base: "gray.300", _dark: "gray.300" }}
            _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
            borderRadius="md"
            fontWeight="500"
            gap={2}
          >
            <Plus size={16} />
            New Category
          </Button>
        </HStack>

        {/* Create Form */}
        {showCreateForm && (
          <Card.Root bg="bg.panel" borderWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }} p={6}>
            <form onSubmit={handleCreate}>
              <VStack align="stretch" gap={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Create New Category
                </Text>

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
                    Icon / Emoji
                  </Text>
                  <SimpleGrid columns={8} gap={2}>
                    {ICON_OPTIONS.map((option) => (
                      <Box
                        key={option.name}
                        p={2}
                        borderRadius="md"
                        borderWidth="2px"
                        borderColor={formData.icon === option.emoji ? "brand.500" : "border.subtle"}
                        bg={formData.icon === option.emoji ? "brand.50" : "bg.surface"}
                        cursor="pointer"
                        textAlign="center"
                        fontSize="xl"
                        _hover={{ borderColor: "brand.400", bg: "brand.50" }}
                        onClick={() => setFormData({ ...formData, icon: option.emoji })}
                        title={option.name}
                      >
                        {option.emoji}
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Color
                  </Text>
                  <HStack gap={2}>
                    {COLOR_OPTIONS.map((color) => (
                      <Box
                        key={color}
                        w={10}
                        h={10}
                        borderRadius="md"
                        bg={color}
                        cursor="pointer"
                        borderWidth="2px"
                        borderColor={formData.color === color ? "gray.900" : "transparent"}
                        _hover={{ transform: "scale(1.1)" }}
                        transition="all 0.2s"
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </HStack>
                </Box>

                <HStack justify="flex-end" gap={3}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: "", description: "", color: "#6366F1", icon: "📁" });
                    }}
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
                  >
                    Create Category
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Card.Root>
        )}

        {/* Categories List */}
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No categories yet"
            description="Create your first category to organize your templates"
            actionLabel="Create Category"
            onAction={() => setShowCreateForm(true)}
          />
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
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
                    <SimpleGrid columns={8} gap={1}>
                      {ICON_OPTIONS.map((option) => (
                        <Box
                          key={option.name}
                          p={1}
                          borderRadius="sm"
                          borderWidth="1px"
                          borderColor={formData.icon === option.emoji ? "brand.500" : "border.subtle"}
                          bg={formData.icon === option.emoji ? "brand.50" : "bg.surface"}
                          cursor="pointer"
                          textAlign="center"
                          fontSize="md"
                          _hover={{ borderColor: "brand.400" }}
                          onClick={() => setFormData({ ...formData, icon: option.emoji })}
                        >
                          {option.emoji}
                        </Box>
                      ))}
                    </SimpleGrid>
                    <HStack gap={1}>
                      {COLOR_OPTIONS.map((color) => (
                        <Box
                          key={color}
                          w={6}
                          h={6}
                          borderRadius="sm"
                          bg={color}
                          cursor="pointer"
                          borderWidth="2px"
                          borderColor={formData.color === color ? "gray.900" : "transparent"}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </HStack>
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
                          bg={category.color}
                          p={2}
                          borderRadius="md"
                          fontSize="2xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          minW={10}
                          minH={10}
                        >
                          {category.icon || "📁"}
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
                        {category._count.templates} template{category._count.templates !== 1 ? "s" : ""}
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

      {/* Delete Confirmation Dialog */}
      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)}>
        <DialogBackdrop />
        <DialogContent>
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
