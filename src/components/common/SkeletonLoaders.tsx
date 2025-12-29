import { Box, Card, Grid, HStack, VStack, Skeleton } from "@chakra-ui/react";

// Skeleton for Quick Action Cards
export function QuickActionSkeleton() {
  return (
    <Card.Root bg="bg.panel" p={5} borderWidth="1px" borderColor="border.subtle">
      <HStack gap={3}>
        <Skeleton w={12} h={12} borderRadius="lg" />
        <VStack align="start" gap={2} flex={1}>
          <Skeleton h={4} w="60%" />
          <Skeleton h={3} w="40%" />
        </VStack>
      </HStack>
    </Card.Root>
  );
}

// Skeleton for Stat Cards
export function StatCardSkeleton() {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={6}>
      <VStack align="start" gap={2}>
        <HStack justify="space-between" w="full">
          <Skeleton h={4} w="40%" />
          <Skeleton w={5} h={5} borderRadius="md" />
        </HStack>
        <Skeleton h={10} w="50%" />
        <Skeleton h={3} w="30%" />
      </VStack>
    </Card.Root>
  );
}

// Skeleton for Template Cards
export function TemplateCardSkeleton() {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={5}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Skeleton h={5} w="60%" />
          <Skeleton w={6} h={6} borderRadius="md" />
        </HStack>
        <VStack align="start" gap={2}>
          <Skeleton h={3} w="full" />
          <Skeleton h={3} w="80%" />
          <Skeleton h={3} w="90%" />
        </VStack>
        <HStack gap={2}>
          <Skeleton h={5} w={16} borderRadius="full" />
          <Skeleton h={5} w={16} borderRadius="full" />
        </HStack>
      </VStack>
    </Card.Root>
  );
}

// Skeleton for Top Template Cards
export function TopTemplateSkeleton() {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={4}>
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between">
          <Skeleton w={8} h={8} borderRadius="md" />
          <Skeleton h={5} w={20} borderRadius="full" />
        </HStack>
        <VStack align="start" gap={1}>
          <Skeleton h={4} w="70%" />
          <Skeleton h={3} w="40%" />
        </VStack>
      </VStack>
    </Card.Root>
  );
}

// Skeleton for Category Cards
export function CategoryCardSkeleton() {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={5}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={3}>
            <Skeleton w={12} h={12} borderRadius="lg" />
            <VStack align="start" gap={1}>
              <Skeleton h={5} w={32} />
              <Skeleton h={3} w={24} />
            </VStack>
          </HStack>
          <Skeleton w={6} h={6} borderRadius="md" />
        </HStack>
        <Skeleton h={3} w="full" />
        <HStack justify="space-between">
          <Skeleton h={4} w={20} />
          <HStack gap={2}>
            <Skeleton w={8} h={8} borderRadius="md" />
            <Skeleton w={8} h={8} borderRadius="md" />
          </HStack>
        </HStack>
      </VStack>
    </Card.Root>
  );
}

// Dashboard Loading State
export function DashboardSkeleton() {
  return (
    <VStack align="stretch" gap={6}>
      {/* Quick Actions Skeleton */}
      <Box>
        <Skeleton h={6} w={32} mb={4} />
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          }}
          gap={4}
        >
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </Grid>
      </Box>

      {/* Stats Skeleton */}
      <Box>
        <Skeleton h={6} w={40} mb={4} />
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={4}
        >
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </Grid>
      </Box>

      {/* Top Templates Skeleton */}
      <Box>
        <Skeleton h={6} w={32} mb={4} />
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={4}
        >
          <TopTemplateSkeleton />
          <TopTemplateSkeleton />
          <TopTemplateSkeleton />
        </Grid>
      </Box>
    </VStack>
  );
}

// Templates Page Loading State
export function TemplatesPageSkeleton() {
  return (
    <VStack align="stretch" gap={4}>
      {/* Header Skeleton */}
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <Skeleton h={10} w={64} />
        <HStack gap={3} flexDirection={{ base: "column", md: "row" }} w={{ base: "full", md: "auto" }}>
          <Skeleton h={10} w={{ base: "full", md: 40 }} />
          <Skeleton h={10} w={{ base: "full", md: 40 }} />
          <Skeleton h={10} w={{ base: "full", md: 40 }} />
        </HStack>
      </HStack>

      {/* Templates Grid Skeleton */}
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(auto-fill, minmax(280px, 1fr))" }}
        gap={4}
      >
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
      </Grid>
    </VStack>
  );
}

// Categories Page Loading State
export function CategoriesPageSkeleton() {
  return (
    <VStack align="stretch" gap={4}>
      {/* Header */}
      <HStack justify="space-between">
        <Skeleton h={8} w={40} />
        <Skeleton h={10} w={40} />
      </HStack>

      {/* Categories Grid */}
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={4}
      >
        <CategoryCardSkeleton />
        <CategoryCardSkeleton />
        <CategoryCardSkeleton />
        <CategoryCardSkeleton />
        <CategoryCardSkeleton />
        <CategoryCardSkeleton />
      </Grid>
    </VStack>
  );
}
