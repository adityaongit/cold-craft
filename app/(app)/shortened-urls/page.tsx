"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Badge,
  Icon,
  IconButton,
  Table,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { ShortenedUrlsTableSkeleton } from "@/components/common/SkeletonLoaders";
import {
  LinkIcon,
  ExternalLink,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toaster, Toaster } from "@/components/ui/toaster";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShortenedUrlWithTemplate } from "@/types";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/menu";

export default function ShortenedUrlsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: urlsData, isLoading } = useQuery<{
    data: ShortenedUrlWithTemplate[];
  }>({
    queryKey: ["shortened-urls"],
    queryFn: async () => {
      const res = await fetch("/api/shortened-urls");
      if (!res.ok) throw new Error("Failed to fetch URLs");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shortened-urls/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortened-urls"] });
      queryClient.invalidateQueries({ queryKey: ["shortened-urls-recent"] });
      toaster.success({ title: "Shortened URL deleted" });
      setDeleteId(null);
    },
    onError: () => {
      toaster.error({ title: "Failed to delete" });
    },
  });

  const urls = urlsData?.data || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toaster.success({ title: "Copied to clipboard" });
  };

  return (
    <AppLayout title="Shortened URLs">
      <VStack align="stretch" gap={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Shortened URLs
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Manage all your shortened URLs in one place
          </Text>
        </Box>

        {isLoading ? (
          <ShortenedUrlsTableSkeleton />
        ) : urls.length === 0 ? (
          <EmptyState
            icon={LinkIcon}
            title="No shortened URLs yet"
            description="URLs you shorten from the compose page will appear here"
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table.Root variant="outline" size="sm">
                <Table.Header>
                  <Table.Row bg="bg.subtle">
                    <Table.ColumnHeader minW="250px">
                      Original URL
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="180px">
                      Shortened URL
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px">
                      Created
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="150px">
                      Template
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="60px">
                      Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {urls.map((url) => (
                    <Table.Row key={url.id}>
                      <Table.Cell>
                        <Text
                          fontSize="sm"
                          title={url.originalUrl}
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          maxW="250px"
                        >
                          {url.originalUrl}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
                          <Icon color="blue.500">
                            <ExternalLink size={14} />
                          </Icon>
                          <Text
                            fontSize="sm"
                            color="blue.500"
                            cursor="pointer"
                            _hover={{ textDecoration: "underline" }}
                            onClick={() => window.open(url.shortenedUrl, "_blank")}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            maxW="150px"
                          >
                            {url.shortenedUrl.replace("https://", "")}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="fg.muted">
                          {formatRelativeTime(new Date(url.createdAt))}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {url.templateTitle ? (
                          <Badge size="sm" variant="subtle" colorScheme="blue">
                            {url.templateTitle}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="fg.muted">
                            -
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <MenuRoot>
                          <MenuTrigger asChild>
                            <IconButton
                              aria-label="Actions"
                              variant="ghost"
                              size="sm"
                            >
                              <ChevronDown size={16} />
                            </IconButton>
                          </MenuTrigger>
                          <MenuContent>
                            <MenuItem
                              value="copy"
                              onClick={() => copyToClipboard(url.shortenedUrl)}
                            >
                              <Icon mr={2}>
                                <Copy size={14} />
                              </Icon>
                              Copy URL
                            </MenuItem>
                            <MenuItem
                              value="delete"
                              onClick={() => setDeleteId(url.id)}
                              color="red.500"
                            >
                              <Icon mr={2}>
                                <Trash2 size={14} />
                              </Icon>
                              Delete
                            </MenuItem>
                          </MenuContent>
                        </MenuRoot>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Mobile Card View */}
            <VStack
              align="stretch"
              gap={2}
              display={{ base: "flex", md: "none" }}
            >
              {urls.map((url) => (
                <Card.Root
                  key={url.id}
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  p={3}
                  cursor="pointer"
                  _hover={{ borderColor: "border.emphasized" }}
                  transition="border-color 0.2s"
                  onClick={() => router.push(`/shortened-urls/${url.id}`)}
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1} flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                        {url.originalUrl}
                      </Text>
                      <HStack gap={1.5} fontSize="xs" color="fg.muted" flexWrap="wrap">
                        <Text color="blue.500" fontWeight="medium">
                          {url.shortenedUrl.replace("https://", "")}
                        </Text>
                        <Text>•</Text>
                        <Text>{formatRelativeTime(new Date(url.createdAt))}</Text>
                      </HStack>
                    </VStack>
                    <Icon color="fg.muted" mt={0.5}>
                      <ChevronRight size={16} />
                    </Icon>
                  </HStack>
                </Card.Root>
              ))}
            </VStack>
          </>
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
            <DialogTitle>Delete Shortened URL</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete this shortened URL? This action
              cannot be undone.
            </Text>
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
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              bg={{ base: "#dc2626", _dark: "#ef4444" }}
              color="white"
              _hover={{ bg: { base: "#b91c1c", _dark: "#dc2626" } }}
              loading={deleteMutation.isPending}
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
