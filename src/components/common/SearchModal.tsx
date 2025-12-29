"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DialogRoot,
  DialogContent,
  DialogBackdrop,
  DialogBody,
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { Search, FileText, Folder, File } from "lucide-react";

interface SearchResult {
  id: string;
  type: "template" | "category" | "page";
  title: string;
  description?: string;
  href: string;
  badge?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks: SearchResult[] = [
  {
    id: "dashboard",
    type: "page",
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "templates",
    type: "page",
    title: "Templates",
    description: "Browse all templates",
    href: "/templates",
  },
  {
    id: "new-template",
    type: "page",
    title: "Create Template",
    description: "Create a new template",
    href: "/templates/new",
  },
  {
    id: "compose",
    type: "page",
    title: "Compose Message",
    href: "/compose",
  },
  {
    id: "categories",
    type: "page",
    title: "Categories",
    description: "Manage categories",
    href: "/categories",
  },
  {
    id: "resumes",
    type: "page",
    title: "Resumes",
    description: "Manage your resumes",
    href: "/resumes",
  },
  {
    id: "settings",
    type: "page",
    title: "Settings",
    href: "/settings",
  },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [templates, setTemplates] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchCategories();
      setQuery("");
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const response = await res.json();
        const data = response.data || [];
        const templateResults: SearchResult[] = data.map((t: any) => ({
          id: t.id,
          type: "template",
          title: t.title,
          description: t.description,
          href: `/templates/${t.id}`,
        }));
        setTemplates(templateResults);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        const categories = Array.isArray(data) ? data : [];
        const categoryResults: SearchResult[] = categories.map((c: any) => ({
          id: c.id,
          type: "category",
          title: c.name,
          description: c.description,
          href: `/categories/${c.id}`,
        }));
        setCategories(categoryResults);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  const allResults = [...quickLinks, ...templates, ...categories];

  const filteredResults = query
    ? allResults.filter((result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => prev === -1 ? 0 : (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => prev === -1 ? filteredResults.length - 1 : (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter" && selectedIndex !== -1 && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "template":
        return FileText;
      case "category":
        return Folder;
      case "page":
        return File;
      default:
        return File;
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
    >
      <DialogBackdrop />
      <DialogContent
        maxW="600px"
        position="fixed"
        top="80px"
        left="50%"
        transform="translateX(-50%)"
      >
        <DialogBody p={0}>
          <Box p={4} borderBottomWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
            <HStack gap={3}>
              <Icon color="fg.muted">
                <Search size={18} />
              </Icon>
              <Input
                placeholder="Search templates, categories, or navigate..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                autoFocus
                fontSize="md"
                border="none"
                bg="transparent"
                px={0}
                _focus={{ outline: "none", border: "none" }}
              />
            </HStack>
          </Box>

          <VStack align="stretch" gap={0} maxH="400px" overflowY="auto" p={2}>
            {filteredResults.length === 0 ? (
              <Box p={8} textAlign="center">
                <Text color="fg.muted">No results found</Text>
              </Box>
            ) : (
              filteredResults.map((result, index) => {
                const ResultIcon = getIcon(result.type);
                return (
                  <HStack
                    key={result.id}
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    bg={index === selectedIndex ? "bg.muted" : "transparent"}
                    _hover={{ bg: "bg.muted" }}
                    onClick={() => handleSelect(result)}
                    gap={3}
                  >
                    <Icon color="fg.muted" fontSize="lg">
                      <ResultIcon size={18} />
                    </Icon>
                    <VStack align="start" gap={0} flex={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {result.title}
                      </Text>
                      {result.description && (
                        <Text fontSize="xs" color="fg.muted">
                          {result.description}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                );
              })
            )}
          </VStack>

          <Box
            p={2}
            borderTopWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            bg="bg.muted"
          >
            <HStack justify="space-between" px={2}>
              <HStack gap={4} fontSize="xs" color="fg.muted">
                <HStack gap={1}>
                  <Badge size="sm" variant="outline">↑↓</Badge>
                  <Text>Navigate</Text>
                </HStack>
                <HStack gap={1}>
                  <Badge size="sm" variant="outline">⏎</Badge>
                  <Text>Select</Text>
                </HStack>
                <HStack gap={1}>
                  <Badge size="sm" variant="outline">esc</Badge>
                  <Text>Close</Text>
                </HStack>
              </HStack>
            </HStack>
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
