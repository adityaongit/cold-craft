"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Box, Flex, Skeleton, VStack } from "@chakra-ui/react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="bg.surface">
        <VStack gap={4}>
          <Skeleton w={16} h={16} borderRadius="lg" />
          <Skeleton w={48} h={4} />
          <Skeleton w={32} h={3} />
        </VStack>
      </Flex>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
