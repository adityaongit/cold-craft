"use client";

import { useState, useEffect } from "react";
import { Box, Flex, HStack, IconButton, Text, Input } from "@chakra-ui/react";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { useColorMode } from "@/components/ui/color-mode";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title, showSearch = true }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      bg={{ base: "white", _dark: "gray.900" }}
      borderBottomWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      px={6}
      py={4}
    >
      <Flex justify="space-between" align="center">
        {/* Title or Search */}
        <Box flex={1} maxW="600px">
          {title ? (
            <Text fontSize="2xl" fontWeight="bold">
              {title}
            </Text>
          ) : showSearch ? (
            <Box position="relative">
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                color={{ base: "gray.400", _dark: "gray.500" }}
              >
                <Search size={18} />
              </Box>
              <Input
                placeholder="Search templates, categories..."
                pl={10}
                bg={{ base: "gray.50", _dark: "gray.800" }}
                border="none"
                _focus={{
                  bg: { base: "white", _dark: "gray.700" },
                  boxShadow: "sm",
                }}
              />
            </Box>
          ) : null}
        </Box>

        {/* Actions */}
        <HStack gap={2}>
          <IconButton
            aria-label="Notifications"
            variant="ghost"
            colorScheme="gray"
          >
            <Bell size={20} />
          </IconButton>

          <IconButton
            aria-label="Toggle color mode"
            variant="ghost"
            colorScheme="gray"
            onClick={toggleColorMode}
          >
            {mounted && (colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />)}
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  );
}
