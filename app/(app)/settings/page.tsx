"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Tabs,
  Switch,
  Badge,
} from "@chakra-ui/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Folder, ChevronRight, Moon, Sun } from "lucide-react";
import { useColorMode } from "@/components/ui/color-mode";

export default function SettingsPage() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);


  return (
    <AppLayout title="Settings">
      <VStack align="stretch" gap={6}>
        {/* Settings Tabs */}
        <Tabs.Root defaultValue="general">
          <Tabs.List>
            <Tabs.Trigger value="general">General</Tabs.Trigger>
            <Tabs.Trigger value="about">About</Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            {/* General Tab */}
            <Tabs.Content value="general">
              <VStack align="stretch" gap={4}>
                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Editor Preferences
                    </Text>

                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium">Auto-save drafts</Text>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          Automatically save your work as you type
                        </Text>
                      </VStack>
                      <Switch.Root
                        checked={autoSave}
                        onCheckedChange={(e) => setAutoSave(e.checked)}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </HStack>

                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium">Enable notifications</Text>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          Get notified about template usage and updates
                        </Text>
                      </VStack>
                      <Switch.Root
                        checked={notifications}
                        onCheckedChange={(e) => setNotifications(e.checked)}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </HStack>
                  </VStack>
                </Card.Root>

                {/* Appearance */}
                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Appearance
                    </Text>

                    <HStack justify="space-between">
                      <HStack gap={3}>
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={{ base: "gray.100", _dark: "gray.700" }}
                        >
                          {colorMode === "light" ? <Sun size={20} /> : <Moon size={20} />}
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium">Dark mode</Text>
                          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                            {colorMode === "light" ? "Switch to dark theme" : "Switch to light theme"}
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch.Root
                        checked={colorMode === "dark"}
                        onCheckedChange={toggleColorMode}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </HStack>
                  </VStack>
                </Card.Root>

                {/* Manage Categories - Mobile Only */}
                <Card.Root
                  bg={{ base: "white", _dark: "gray.800" }}
                  p={6}
                  display={{ base: "block", lg: "none" }}
                >
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Organization
                    </Text>

                    <HStack
                      justify="space-between"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: "bg.muted" }}
                      transition="background 0.2s"
                      onClick={() => router.push("/categories")}
                    >
                      <HStack gap={3}>
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={{ base: "gray.100", _dark: "gray.700" }}
                        >
                          <Folder size={20} />
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium">Manage Categories</Text>
                          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                            Organize your templates
                          </Text>
                        </VStack>
                      </HStack>
                      <ChevronRight size={20} color="gray" />
                    </HStack>
                  </VStack>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            {/* About Tab */}
            <Tabs.Content value="about">
              <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                <VStack align="stretch" gap={6}>
                  <VStack align="start" gap={2}>
                    <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                      PitchPad
                    </Text>
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                      Professional Outreach Message Composer
                    </Text>
                    <Badge variant="outline">Version 1.0.0</Badge>
                  </VStack>

                  <VStack align="start" gap={3}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Built with
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                      {[
                        "Next.js 15",
                        "React 19",
                        "Chakra UI v3",
                        "MongoDB",
                        "TypeScript",
                      ].map((tech) => (
                        <Badge key={tech} variant="subtle">
                          {tech}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>

                  <VStack align="start" gap={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Features
                    </Text>
                    <VStack align="start" gap={1} fontSize="sm">
                      <Text>✓ Smart template variables</Text>
                      <Text>✓ Resume management</Text>
                      <Text>✓ Usage analytics</Text>
                      <Text>✓ Multi-platform support</Text>
                      <Text>✓ Dark mode</Text>
                    </VStack>
                  </VStack>

                  <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.500" }}>
                    © 2026 PitchPad. Built with ❤️ for better outreach.
                  </Text>
                </VStack>
              </Card.Root>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </AppLayout>
  );
}
