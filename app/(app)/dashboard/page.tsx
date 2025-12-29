"use client";

import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Icon,
  Button,
  Card,
  Badge,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PenSquare, FileText, TrendingUp, Mail, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsageStats } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "@/components/common/SkeletonLoaders";

async function fetchStats(): Promise<UsageStats> {
  const res = await fetch("/api/usage/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export default function DashboardPage() {
  const router = useRouter();

  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: fetchStats,
  });

  return (
    <AppLayout title="Dashboard">
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <VStack align="stretch" gap={6}>
          {/* Quick Actions */}
          <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Quick Actions
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            }}
            gap={4}
          >
            <Card.Root
              bg="bg.panel"
              p={5}
              cursor="pointer"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={{ borderColor: "brand.500", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              onClick={() => router.push("/compose")}
            >
              <HStack gap={3}>
                <Box
                  bg="bg.muted"
                  color="fg.default"
                  p={3}
                  borderRadius="lg"
                >
                  <Icon fontSize="lg">
                    <PenSquare size={20} />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold" fontSize="md">Compose Message</Text>
                  <Text fontSize="sm" color="fg.muted">
                    Start writing
                  </Text>
                </VStack>
              </HStack>
            </Card.Root>

            <Card.Root
              bg="bg.panel"
              p={5}
              cursor="pointer"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={{ borderColor: "brand.500", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              onClick={() => router.push("/templates/new")}
            >
              <HStack gap={3}>
                <Box
                  bg="bg.muted"
                  color="fg.default"
                  p={3}
                  borderRadius="lg"
                >
                  <Icon fontSize="lg">
                    <Plus size={20} />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold" fontSize="md">New Template</Text>
                  <Text fontSize="sm" color="fg.muted">
                    Create template
                  </Text>
                </VStack>
              </HStack>
            </Card.Root>

            <Card.Root
              bg="bg.panel"
              p={5}
              cursor="pointer"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={{ borderColor: "brand.500", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              onClick={() => router.push("/templates")}
            >
              <HStack gap={3}>
                <Box
                  bg="bg.muted"
                  color="fg.default"
                  p={3}
                  borderRadius="lg"
                >
                  <Icon fontSize="lg">
                    <FileText size={20} />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold" fontSize="md">Browse Templates</Text>
                  <Text fontSize="sm" color="fg.muted">
                    View all
                  </Text>
                </VStack>
              </HStack>
            </Card.Root>
          </Grid>
        </Box>

        {/* Stats */}
        {stats && (
          <>
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Usage Statistics
              </Text>
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
                gap={4}
              >
                <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={6}>
                  <VStack align="start" gap={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="fg.muted">
                        Total Messages
                      </Text>
                      <Icon color="fg.muted">
                        <Mail size={18} />
                      </Icon>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold">
                      {stats.totalMessages}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      All time
                    </Text>
                  </VStack>
                </Card.Root>

                <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={6}>
                  <VStack align="start" gap={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="fg.muted">
                        This Week
                      </Text>
                      <Icon color="fg.muted">
                        <TrendingUp size={18} />
                      </Icon>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold">
                      {stats.thisWeek}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      +{Math.round((stats.thisWeek / Math.max(stats.totalMessages, 1)) * 100)}% of total
                    </Text>
                  </VStack>
                </Card.Root>

                <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={6}>
                  <VStack align="start" gap={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="fg.muted">
                        This Month
                      </Text>
                      <Icon color="fg.muted">
                        <Mail size={18} />
                      </Icon>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold">
                      {stats.thisMonth}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      Last 30 days
                    </Text>
                  </VStack>
                </Card.Root>

                <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={6}>
                  <VStack align="start" gap={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="fg.muted">
                        Success Rate
                      </Text>
                      <Icon color="fg.muted">
                        <TrendingUp size={18} />
                      </Icon>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold">
                      {stats.successRate !== null && stats.successRate !== undefined ? Math.round(stats.successRate) : 0}%
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {stats.successRate !== null && stats.successRate !== undefined ? "Response rate" : "No data yet"}
                    </Text>
                  </VStack>
                </Card.Root>
              </Grid>
            </Box>

            {/* Top Templates */}
            {stats.topTemplates.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Top Templates
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/templates")}
                  >
                    View all
                  </Button>
                </HStack>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                  gap={4}
                >
                  {stats.topTemplates.map(({ template, count }, index) => (
                    <Card.Root
                      key={template.id}
                      bg="bg.panel"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      p={4}
                      cursor="pointer"
                      _hover={{ borderColor: "brand.500", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                      onClick={() => router.push(`/templates/${template.id}`)}
                    >
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between">
                          <Box
                            bg={index === 0 ? "brand.500" : "bg.muted"}
                            color={index === 0 ? "white" : "fg.muted"}
                            fontWeight="bold"
                            w={8}
                            h={8}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="md"
                            fontSize="sm"
                          >
                            {index + 1}
                          </Box>
                          <Badge variant="subtle" colorPalette="gray">
                            {template.platform}
                          </Badge>
                        </HStack>
                        <VStack align="start" gap={1}>
                          <Text fontWeight="semibold" fontSize="md" lineClamp={1}>
                            {template.title}
                          </Text>
                          <Text fontSize="sm" color="brand.500" fontWeight="medium">
                            {count} {count === 1 ? "use" : "uses"}
                          </Text>
                        </VStack>
                      </VStack>
                    </Card.Root>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
        </VStack>
      )}
    </AppLayout>
  );
}
