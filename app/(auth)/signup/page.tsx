"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Card,
  Flex,
  Link as ChakraLink,
  HStack,
  Separator,
} from "@chakra-ui/react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onResponse: () => {
            setLoading(false);
          },
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to create account");
            setLoading(false);
          },
        }
      );
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => {
            setGoogleLoading(true);
          },
          onResponse: () => {
            setGoogleLoading(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to sign up with Google");
            setGoogleLoading(false);
          },
        }
      );
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg.surface" p={4}>
      <Box w="full" maxW="400px">
        <VStack gap={6} align="stretch">
          {/* Logo/Header */}
          <VStack gap={2}>
            <Text fontSize="2xl" fontWeight="bold">
              PitchPad
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Create your account
            </Text>
          </VStack>

          {/* Sign Up Form */}
          <Card.Root bg="bg.canvas" borderWidth="1px" borderColor="border.subtle">
            <Card.Body p={6}>
              <VStack gap={4} align="stretch">
                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  w="full"
                  onClick={handleGoogleSignUp}
                  loading={googleLoading}
                  disabled={googleLoading || loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 256 262"
                  >
                    <path
                      fill="#4285F4"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    />
                    <path
                      fill="#34A853"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    />
                    <path
                      fill="#FBBC05"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    />
                    <path
                      fill="#EB4335"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <HStack gap={3}>
                  <Separator flex="1" />
                  <Text fontSize="xs" color="fg.muted" textTransform="uppercase">
                    Or continue with
                  </Text>
                  <Separator flex="1" />
                </HStack>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailSignUp}>
                  <VStack gap={4} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">
                        Name
                      </Text>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">
                        Email
                      </Text>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">
                        Password
                      </Text>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={8}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">
                        Confirm Password
                      </Text>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={8}
                      />
                      <Text fontSize="xs" color="fg.muted">
                        Must be at least 8 characters
                      </Text>
                    </VStack>

                    <Button
                      type="submit"
                      w="full"
                      loading={loading}
                      disabled={loading || googleLoading}
                    >
                      Create Account
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Login Link */}
          <Text fontSize="sm" textAlign="center" color="fg.muted">
            Already have an account?{" "}
            <ChakraLink asChild color="brand.500" fontWeight="medium">
              <Link href="/login">Sign in</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
