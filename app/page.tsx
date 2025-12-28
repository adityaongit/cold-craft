"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner } from "@chakra-ui/react";
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
      <Spinner size="xl" />
    </Center>
  );
}
