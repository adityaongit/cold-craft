"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Skeleton, VStack } from "@chakra-ui/react";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [session, isPending, router]);

  return (
    <Center h="100vh" bg="bg.surface">
      <VStack gap={4}>
        <Skeleton w={16} h={16} borderRadius="lg" />
        <Skeleton w={48} h={4} />
        <Skeleton w={32} h={3} />
      </VStack>
    </Center>
  );
}
