"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Box, Spinner, Flex } from "@chakra-ui/react";

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
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
