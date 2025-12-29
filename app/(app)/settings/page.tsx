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

export default function SettingsPage() {
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
