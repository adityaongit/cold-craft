"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
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
  Separator,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ExternalLink,
  Copy,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toaster, Toaster } from "@/components/ui/toaster";
import { useQuery } from "@tanstack/react-query";
import { ShortenedUrlWithTemplate } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ShortenedUrlDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [showFullUrl, setShowFullUrl] = useState(false);

  const { data: url, isLoading } = useQuery<ShortenedUrlWithTemplate>({
    queryKey: ["shortened-url", resolvedParams.id],
    queryFn: async () => {
      const res = await fetch(`/api/shortened-urls/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Failed to fetch URL");
      return res.json();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toaster.success({ title: "Copied to clipboard" });
  };

  if (isLoading) {
    return (
      <AppLayout
        title="URL Details"
        showBackButton
        onBackClick={() => router.back()}
      >
        <VStack align="stretch" gap={4}>
          <Card.Root bg="bg.panel" borderWidth="1px" p={6}>
            <Text>Loading...</Text>
          </Card.Root>
        </VStack>
      </AppLayout>
    );
  }

  if (!url) {
    return (
      <AppLayout
        title="URL Details"
        showBackButton
        onBackClick={() => router.back()}
      >
        <VStack align="stretch" gap={4}>
          <Card.Root bg="bg.panel" borderWidth="1px" p={6}>
            <Text>URL not found</Text>
          </Card.Root>
        </VStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="URL Details"
      showBackButton
      onBackClick={() => router.back()}
    >
      <VStack align="stretch" gap={4} maxW="800px" mx="auto" w="full">
        {/* Created Info */}
        <Card.Root
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          p={3}
        >
          <HStack gap={2}>
            <Icon color="fg.muted">
              <Calendar size={14} />
            </Icon>
            <Text fontSize="xs" color="fg.muted" fontWeight="medium">
              Created
            </Text>
            <Text fontSize="sm" fontWeight="semibold" ml="auto">
              {formatRelativeTime(new Date(url.createdAt))}
            </Text>
          </HStack>
        </Card.Root>

        {/* URL Details */}
        <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle">
          <VStack align="stretch" gap={0}>
            {/* Original URL */}
            <Box p={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                  Original URL
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  gap={1}
                  onClick={() => setShowFullUrl(!showFullUrl)}
                >
                  {showFullUrl ? (
                    <>
                      <ChevronUp size={14} />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Reveal full URL
                    </>
                  )}
                </Button>
              </HStack>
              <HStack justify="space-between" gap={3}>
                <Text
                  fontSize="sm"
                  wordBreak="break-all"
                  flex={1}
                  lineHeight="1.6"
                  css={
                    !showFullUrl
                      ? {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }
                      : undefined
                  }
                >
                  {url.originalUrl}
                </Text>
                <IconButton
                  aria-label="Copy original URL"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(url.originalUrl)}
                >
                  <Copy size={16} />
                </IconButton>
              </HStack>
            </Box>

            <Separator />

            {/* Shortened URL */}
            <Box p={4}>
              <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb={2}>
                Shortened URL
              </Text>
              <HStack justify="space-between" gap={3}>
                <HStack gap={2} flex={1} minW={0}>
                  <Icon color="blue.500">
                    <ExternalLink size={16} />
                  </Icon>
                  <Text
                    fontSize="sm"
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => window.open(url.shortenedUrl, "_blank")}
                    wordBreak="break-all"
                  >
                    {url.shortenedUrl}
                  </Text>
                </HStack>
                <IconButton
                  aria-label="Copy shortened URL"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(url.shortenedUrl)}
                >
                  <Copy size={16} />
                </IconButton>
              </HStack>
            </Box>

            {/* Template Info */}
            {url.templateTitle && (
              <>
                <Separator />
                <Box p={4}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color="fg.muted"
                    mb={2}
                  >
                    Associated Template
                  </Text>
                  <HStack gap={2}>
                    <Icon color="blue.500">
                      <FileText size={16} />
                    </Icon>
                    <Badge size="sm" variant="subtle" colorScheme="blue">
                      {url.templateTitle}
                    </Badge>
                  </HStack>
                </Box>
              </>
            )}

            {/* Variable Name */}
            {url.variableName && (
              <>
                <Separator />
                <Box p={4}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color="fg.muted"
                    mb={2}
                  >
                    Variable Name
                  </Text>
                  <Badge size="sm" variant="outline">
                    {url.variableName}
                  </Badge>
                </Box>
              </>
            )}
          </VStack>
        </Card.Root>
      </VStack>

      <Toaster />
    </AppLayout>
  );
}
