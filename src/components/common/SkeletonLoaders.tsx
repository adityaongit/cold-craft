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

// Resume Card Skeleton
export function ResumeCardSkeleton() {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={5}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <HStack gap={3}>
            <Skeleton w={12} h={12} borderRadius="md" />
            <VStack align="start" gap={1}>
              <Skeleton h={5} w={40} />
              <Skeleton h={3} w={24} />
            </VStack>
          </HStack>
          <Skeleton w={6} h={6} borderRadius="md" />
        </HStack>
        <Skeleton h={3} w="full" />
        <HStack justify="space-between">
          <Skeleton h={4} w={32} />
          <HStack gap={2}>
            <Skeleton w={8} h={8} borderRadius="md" />
            <Skeleton w={8} h={8} borderRadius="md" />
          </HStack>
        </HStack>
      </VStack>
    </Card.Root>
  );
}

// Resumes Page Loading State
export function ResumesPageSkeleton() {
  return (
    <VStack align="stretch" gap={4}>
      {/* Header */}
      <HStack justify="space-between">
        <Skeleton h={8} w={40} />
        <Skeleton h={10} w={40} />
      </HStack>

      {/* Resumes Grid */}
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={4}
      >
        <ResumeCardSkeleton />
        <ResumeCardSkeleton />
        <ResumeCardSkeleton />
      </Grid>
    </VStack>
  );
}

// Compose Page Loading State
export function ComposePageSkeleton() {
  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "2fr 3fr" }}
      gap={6}
      minH="600px"
    >
      {/* Left Panel - Template Selection */}
      <VStack align="stretch" gap={4}>
        <Skeleton h={10} w="full" />
        <Skeleton h={10} w="full" />
        <Box>
          <Skeleton h={6} w={24} mb={3} />
          <VStack gap={3}>
            <Skeleton h={10} w="full" />
            <Skeleton h={10} w="full" />
            <Skeleton h={10} w="full" />
            <Skeleton h={10} w="full" />
          </VStack>
        </Box>
      </VStack>

      {/* Right Panel - Preview */}
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Skeleton h={6} w={32} />
          <Skeleton h={8} w={20} />
        </HStack>
        <Box
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="md"
          p={6}
          minH="400px"
        >
          <VStack align="start" gap={3}>
            <Skeleton h={4} w="full" />
            <Skeleton h={4} w="90%" />
            <Skeleton h={4} w="95%" />
            <Skeleton h={4} w="full" />
            <Skeleton h={4} w="85%" />
            <Skeleton h={4} w="full" />
            <Skeleton h={4} w="93%" />
            <Skeleton h={4} w="88%" />
          </VStack>
        </Box>
        <HStack justify="flex-end" gap={3}>
          <Skeleton h={10} w={24} />
          <Skeleton h={10} w={24} />
        </HStack>
      </VStack>
    </Grid>
  );
}

// Template Edit Form Skeleton
export function TemplateEditSkeleton() {
  return (
    <VStack align="stretch" gap={6} maxW="4xl" mx="auto">
      <Skeleton h={10} w="full" />
      <Skeleton h={32} w="full" />
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
        <Skeleton h={10} w="full" />
        <Skeleton h={10} w="full" />
        <Skeleton h={10} w="full" />
        <Skeleton h={10} w="full" />
      </Grid>
      <Skeleton h={10} w="full" />
      <Skeleton h={10} w="full" />
      <HStack justify="flex-end" gap={3}>
        <Skeleton h={10} w={24} />
        <Skeleton h={10} w={24} />
      </HStack>
    </VStack>
  );
}

// Saved Message Card Skeleton
export function SavedMessageCardSkeleton() {
  return (
    <Card.Root bg="bg.panel" borderWidth="1px" borderColor="border.subtle" p={5} w="full" maxW="full">
      <VStack align="stretch" gap={3} w="full">
        <HStack justify="space-between" w="full">
          <VStack align="start" gap={2} flex={1} minW={0}>
            <Skeleton h={5} w="70%" maxW="200px" />
            <Skeleton h={4} w={24} borderRadius="full" />
          </VStack>
          <Skeleton w={6} h={6} borderRadius="md" flexShrink={0} />
        </HStack>
        <Box bg="bg.subtle" p={3} borderRadius="md" w="full">
          <Skeleton h={3} w="full" mb={2} />
          <Skeleton h={3} w="90%" mb={2} />
          <Skeleton h={3} w="95%" />
        </Box>
        <HStack gap={2} w="full">
          <Skeleton h={8} flex={1} />
          <Skeleton h={8} flex={1} />
        </HStack>
        <HStack justify="space-between" pt={2} borderTopWidth="1px" w="full">
          <Skeleton h={3} w={24} />
          <Skeleton h={3} w={16} />
        </HStack>
      </VStack>
    </Card.Root>
  );
}

// Saved Messages Page Loading State
export function SavedMessagesPageSkeleton() {
  return (
    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
      <SavedMessageCardSkeleton />
      <SavedMessageCardSkeleton />
      <SavedMessageCardSkeleton />
      <SavedMessageCardSkeleton />
    </Grid>
  );
}

// Shortened URLs Table Loading State
export function ShortenedUrlsTableSkeleton() {
  return (
    <Box overflowX="auto">
      <VStack align="stretch" gap={0}>
        {/* Table Header */}
        <HStack
          bg="bg.subtle"
          p={3}
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="md"
          borderBottomRadius={0}
        >
          <Skeleton h={4} w="35%" />
          <Skeleton h={4} w="25%" />
          <Skeleton h={4} w="15%" />
          <Skeleton h={4} w="15%" />
          <Skeleton h={4} w="10%" />
        </HStack>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <HStack
            key={i}
            p={3}
            borderWidth="1px"
            borderColor="border.subtle"
            borderTopWidth={0}
            borderRadius={i === 5 ? "md" : 0}
            borderTopRadius={0}
          >
            <Skeleton h={4} w="35%" />
            <Skeleton h={4} w="25%" />
            <Skeleton h={4} w="15%" />
            <Skeleton h={4} w="15%" />
            <Skeleton h={4} w="10%" />
            <Skeleton h={6} w={6} borderRadius="md" />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
