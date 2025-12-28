"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Icon,
  Button,
  Card,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MessageSquare, FileText, TrendingUp, Mail, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsageStats } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/usage/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Dashboard">
      <VStack align="stretch" gap={6}>
        {/* Quick Actions */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Quick Actions
          </Text>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Card.Root
              bg="bg.panel"
              p={4}
              cursor="pointer"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={{ borderColor: "brand.500" }}
              onClick={() => router.push("/compose")}
            >
              <HStack gap={3}>
                <Box
                  bg="bg.muted"
                  color="fg.muted"
                  p={3}
                  borderRadius="md"
                >
                  <Icon fontSize="lg">
                    <MessageSquare size={20} />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold">Compose Message</Text>
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                    Start writing
                  </Text>
                </VStack>
              </HStack>
            </Card.Root>

            <Card.Root
              bg="bg.panel"
              p={4}
              cursor="pointer"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={{ borderColor: "brand.500" }}
              onClick={() => router.push("/templates/new")}
            >
              <HStack gap={3}>
                <Box
                  bg="bg.muted"
                  color="fg.muted"
                  p={3}
                  borderRadius="md"
                >
                  <Icon fontSize="lg">
                    <Plus size={20} />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold">New Template</Text>
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                    Create template
                  </Text>
                </VStack>
              </HStack>
            </Card.Root>

            <Card.Root
              bg="bg.panel"
              p={4}
              cursor="pointer"
              borderWidth="1px"
              borderColor="border.subtle"
              _hover={{ borderColor: "brand.500" }}
              onClick={() => router.push("/templates")}
            >
              <HStack gap={3}>
                <Box
                  bg="bg.muted"
                  color="fg.muted"
                  p={3}
                  borderRadius="md"
                >
                  <Icon fontSize="lg">
                    <FileText size={20} />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold">Browse Templates</Text>
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                    View all
                  </Text>
                </VStack>
              </HStack>
            </Card.Root>
          </Grid>
        </Box>

        {/* Stats */}
        {!loading && stats && (
          <>
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Usage Statistics
              </Text>
              <Grid templateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap={4}>
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
                        <MessageSquare size={18} />
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

                {stats.successRate !== null && (
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
                        {Math.round(stats.successRate || 0)}%
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        Response rate
                      </Text>
                    </VStack>
                  </Card.Root>
                )}
              </Grid>
            </Box>

            {/* Top Templates */}
            {stats.topTemplates.length > 0 && (
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Top Templates
                </Text>
                <VStack align="stretch" gap={3}>
                  {stats.topTemplates.map(({ template, count }, index) => (
                    <Card.Root
                      key={template.id}
                      bg="bg.panel"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      p={4}
                      cursor="pointer"
                      _hover={{ borderColor: "brand.500" }}
                      onClick={() => router.push(`/templates/${template.id}`)}
                    >
                      <HStack justify="space-between">
                        <HStack gap={3}>
                          <Box
                            bg="bg.muted"
                            color="fg.muted"
                            fontWeight="bold"
                            w={8}
                            h={8}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="sm"
                            fontSize="sm"
                          >
                            {index + 1}
                          </Box>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="semibold">{template.title}</Text>
                            <Text fontSize="sm" color="fg.muted">
                              {template.platform}
                            </Text>
                          </VStack>
                        </HStack>
                        <Text fontWeight="semibold" color="fg.muted">
                          {count} uses
                        </Text>
                      </HStack>
                    </Card.Root>
                  ))}
                </VStack>
              </Box>
            )}
          </>
        )}
      </VStack>
    </AppLayout>
  );
}
