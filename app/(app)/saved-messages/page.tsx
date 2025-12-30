"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Icon,
  IconButton,
  Portal,
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
import { EmptyState } from "@/components/common/EmptyState";
import { SavedMessagesPageSkeleton } from "@/components/common/SkeletonLoaders";
import { FileText, Trash2, Clock, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toaster, Toaster } from "@/components/ui/toaster";

interface SavedMessage {
  id: string;
  _id: string;
  title: string;
  content: string;
  templateId: string | null;
  templateTitle: string | null;
  variableValues: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export default function SavedMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState<SavedMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/composed-messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch saved messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;

    // Optimistically update UI
    setMessages(messages.filter(msg => msg.id !== deleteId));
    setDeleteId(null);

    try {
      const res = await fetch(`/api/composed-messages/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toaster.success({
          title: "Message deleted successfully",
        });
      } else {
        // Revert on error
        fetchMessages();
        const error = await res.json();
        toaster.error({
          title: error.error || "Failed to delete message",
        });
      }
    } catch (error) {
      // Revert on error
      fetchMessages();
      console.error("Failed to delete message:", error);
      toaster.error({
        title: "Failed to delete message",
      });
    }
  }

  function handleUseInCompose(message: SavedMessage) {
    // Store variable values in sessionStorage to prefill on compose page
    if (message.variableValues && Object.keys(message.variableValues).length > 0) {
      sessionStorage.setItem('prefillVariables', JSON.stringify(message.variableValues));
    }

    // Navigate to compose page with the template pre-selected if available
    if (message.templateId) {
      router.push(`/compose?templateId=${message.templateId}`);
    } else {
      router.push("/compose");
    }
  }

  return (
    <AppLayout title="Saved Messages">
      <VStack align="stretch" gap={6}>
        {/* Messages List */}
        {loading ? (
          <SavedMessagesPageSkeleton />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No saved messages yet"
            description="Save composed messages from the compose page to access and reuse them later."
          />
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
            {messages.map((message) => (
              <Card.Root
                key={message.id}
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
                p={5}
                position="relative"
                _hover={{ borderColor: "border.emphasized" }}
                transition="border-color 0.2s"
              >
                <VStack align="stretch" gap={4}>
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={2} flex={1}>
                      <Text fontSize="lg" fontWeight="600" lineHeight="1.3">
                        {message.title}
                      </Text>
                      {message.templateTitle && (
                        <Badge colorScheme="blue" variant="subtle" size="sm">
                          <FileText size={12} style={{ marginRight: 4 }} />
                          {message.templateTitle}
                        </Badge>
                      )}
                    </VStack>

                    <IconButton
                      aria-label="Delete message"
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(message.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </HStack>

                  {/* Message Preview */}
                  <Box
                    bg="bg.subtle"
                    p={3}
                    borderRadius="md"
                    fontSize="sm"
                    color="fg.muted"
                    lineHeight="1.6"
                    css={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {message.content}
                  </Box>

                  {/* Actions */}
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      gap={2}
                      onClick={() => setViewMessage(message)}
                      flex={1}
                    >
                      <ExternalLink size={14} />
                      View Full
                    </Button>
                    <Button
                      size="sm"
                      gap={2}
                      onClick={() => handleUseInCompose(message)}
                      colorScheme="blue"
                      flex={1}
                    >
                      Use in Compose
                    </Button>
                  </HStack>

                  {/* Meta Info */}
                  <HStack
                    justify="space-between"
                    fontSize="xs"
                    color="fg.muted"
                    pt={2}
                    borderTopWidth="1px"
                    borderColor="border.subtle"
                  >
                    <HStack gap={1}>
                      <Icon>
                        <Clock size={12} />
                      </Icon>
                      <Text>Saved {formatRelativeTime(new Date(message.createdAt))}</Text>
                    </HStack>
                    <Text>
                      {message.content.split(/\s+/).filter(Boolean).length} words
                    </Text>
                  </HStack>
                </VStack>
              </Card.Root>
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
            <DialogTitle>Delete Message</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text>Are you sure you want to delete this saved message? This action cannot be undone.</Text>
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

      {/* View Full Message Dialog */}
      <DialogRoot
        open={!!viewMessage}
        onOpenChange={(details) => {
          if (!details.open) {
            setViewMessage(null);
          }
        }}
        placement="center"
      >
        <DialogBackdrop />
        <DialogContent
          maxW={{ base: "90vw", md: "2xl" }}
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <DialogHeader>
            <DialogTitle>{viewMessage?.title}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack align="stretch" gap={3}>
              {viewMessage?.templateTitle && (
                <Box>
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb={1}>
                    Template Used
                  </Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {viewMessage.templateTitle}
                  </Badge>
                </Box>
              )}
              <Box>
                <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb={2}>
                  Message Content
                </Text>
                <Box
                  bg={{ base: "gray.50", _dark: "gray.900" }}
                  p={4}
                  borderRadius="md"
                  maxH="400px"
                  overflowY="auto"
                  fontSize="sm"
                  lineHeight="1.7"
                  whiteSpace="pre-wrap"
                  borderWidth="1px"
                  borderColor={{ base: "gray.200", _dark: "gray.700" }}
                >
                  {viewMessage?.content}
                </Box>
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button
              variant="outline"
              onClick={() => setViewMessage(null)}
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              _hover={{ borderColor: { base: "gray.400", _dark: "gray.500" } }}
            >
              Close
            </Button>
            <Button
              gap={2}
              onClick={() => {
                if (viewMessage) {
                  handleUseInCompose(viewMessage);
                }
              }}
              bg={{ base: "white", _dark: "#f5f5f5" }}
              color={{ base: "gray.900", _dark: "gray.900" }}
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.300" }}
              _hover={{ bg: { base: "gray.50", _dark: "#e5e5e5" } }}
            >
              Use in Compose
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <Toaster />
    </AppLayout>
  );
}
