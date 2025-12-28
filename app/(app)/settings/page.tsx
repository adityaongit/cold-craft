"use client";

import { useState } from "react";
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
import { Settings, User, Palette, Zap, Database } from "lucide-react";
import { useColorMode } from "@/components/ui/color-mode";

export default function SettingsPage() {
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
            <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
            <Tabs.Trigger value="data">Data & Privacy</Tabs.Trigger>
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

                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Keyboard Shortcuts
                    </Text>

                    <VStack align="stretch" gap={3}>
                      {[
                        { keys: ["⌘", "K"], description: "Quick search" },
                        { keys: ["⌘", "N"], description: "New template" },
                        { keys: ["⌘", "B"], description: "Toggle sidebar" },
                        { keys: ["⌘", "/"], description: "Show shortcuts" },
                        { keys: ["Esc"], description: "Close modal" },
                      ].map((shortcut, idx) => (
                        <HStack key={idx} justify="space-between">
                          <Text fontSize="sm">{shortcut.description}</Text>
                          <HStack gap={1}>
                            {shortcut.keys.map((key, i) => (
                              <Badge key={i} variant="outline" fontFamily="mono" px={2}>
                                {key}
                              </Badge>
                            ))}
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            {/* Appearance Tab */}
            <Tabs.Content value="appearance">
              <VStack align="stretch" gap={4}>
                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Theme
                    </Text>

                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium">Dark mode</Text>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          Use dark theme for better visibility in low light
                        </Text>
                      </VStack>
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

                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Brand Color
                    </Text>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      Current brand color: <Badge colorScheme="brand">#6366F1</Badge>
                    </Text>
                  </VStack>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            {/* Data & Privacy Tab */}
            <Tabs.Content value="data">
              <VStack align="stretch" gap={4}>
                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Data Storage
                    </Text>

                    <VStack align="start" gap={2}>
                      <Text fontSize="sm">
                        All your data is stored locally in your PostgreSQL database.
                      </Text>
                      <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                        We don't collect or share any of your personal information.
                      </Text>
                    </VStack>
                  </VStack>
                </Card.Root>

                <Card.Root bg={{ base: "white", _dark: "gray.800" }} p={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Export Data
                    </Text>

                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                      You can export your templates and data using Prisma Studio or by running database queries directly.
                    </Text>
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
                      ColdCraft
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
                        "Prisma",
                        "PostgreSQL",
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
                    © 2024 ColdCraft. Built with ❤️ for better outreach.
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
