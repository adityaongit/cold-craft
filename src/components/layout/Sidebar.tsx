"use client";

import { Box, VStack, HStack, Text, Icon, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FileUp,
  Folder,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Templates", icon: FileText, href: "/templates" },
  { label: "Compose", icon: MessageSquare, href: "/compose" },
  { label: "Resumes", icon: FileUp, href: "/resumes" },
  { label: "Categories", icon: Folder, href: "/categories" },
];

const bottomNavItems: NavItem[] = [
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isCollapsed ? "70px" : "240px"}
      bg={{ base: "white", _dark: "gray.900" }}
      borderRightWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      display="flex"
      flexDirection="column"
      transition="width 0.2s"
    >
      {/* Logo */}
      <Box p={6} borderBottomWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
        <HStack gap={2} justify={isCollapsed ? "center" : "space-between"}>
          {!isCollapsed && (
            <HStack gap={2}>
              <Icon fontSize="2xl" color="brand.500">
                <Sparkles />
              </Icon>
              <Text fontSize="xl" fontWeight="bold" color="brand.500">
                ColdCraft
              </Text>
            </HStack>
          )}
          {isCollapsed && (
            <Icon fontSize="2xl" color="brand.500">
              <Sparkles />
            </Icon>
          )}
        </HStack>
      </Box>

      {/* Navigation */}
      <VStack flex={1} gap={1} p={3} align="stretch" overflowY="auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} title={isCollapsed ? item.label : undefined}>
              <Flex
                align="center"
                gap={3}
                px={3}
                py={2.5}
                borderRadius="md"
                cursor="pointer"
                fontWeight={isActive ? "semibold" : "medium"}
                color={
                  isActive
                    ? { base: "brand.600", _dark: "brand.400" }
                    : { base: "gray.700", _dark: "gray.300" }
                }
                bg={
                  isActive
                    ? { base: "brand.50", _dark: "brand.950" }
                    : "transparent"
                }
                _hover={{
                  bg: isActive
                    ? { base: "brand.100", _dark: "brand.900" }
                    : { base: "gray.100", _dark: "gray.800" },
                }}
                transition="all 0.2s"
                justify={isCollapsed ? "center" : "flex-start"}
              >
                <Icon fontSize="lg">
                  <item.icon />
                </Icon>
                {!isCollapsed && (
                  <>
                    <Text flex={1}>{item.label}</Text>
                    {item.badge && (
                      <Box
                        bg="brand.500"
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                      >
                        {item.badge}
                      </Box>
                    )}
                  </>
                )}
              </Flex>
            </Link>
          );
        })}
      </VStack>

      {/* Bottom Nav */}
      <VStack gap={1} p={3} align="stretch" borderTopWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} title={isCollapsed ? item.label : undefined}>
              <Flex
                align="center"
                gap={3}
                px={3}
                py={2.5}
                borderRadius="md"
                cursor="pointer"
                fontWeight={isActive ? "semibold" : "medium"}
                color={
                  isActive
                    ? { base: "brand.600", _dark: "brand.400" }
                    : { base: "gray.700", _dark: "gray.300" }
                }
                bg={
                  isActive
                    ? { base: "brand.50", _dark: "brand.950" }
                    : "transparent"
                }
                _hover={{
                  bg: isActive
                    ? { base: "brand.100", _dark: "brand.900" }
                    : { base: "gray.100", _dark: "gray.800" },
                }}
                transition="all 0.2s"
                justify={isCollapsed ? "center" : "flex-start"}
              >
                <Icon fontSize="lg">
                  <item.icon />
                </Icon>
                {!isCollapsed && <Text flex={1}>{item.label}</Text>}
              </Flex>
            </Link>
          );
        })}

        {/* Collapse Toggle */}
        <Flex
          align="center"
          gap={3}
          px={3}
          py={2.5}
          borderRadius="md"
          cursor="pointer"
          color={{ base: "gray.700", _dark: "gray.300" }}
          _hover={{ bg: { base: "gray.100", _dark: "gray.800" } }}
          transition="all 0.2s"
          onClick={toggleCollapsed}
          justify={isCollapsed ? "center" : "flex-start"}
          title={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          <Icon fontSize="lg">
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Icon>
          {!isCollapsed && <Text flex={1}>Collapse menu</Text>}
        </Flex>
      </VStack>
    </Box>
  );
}
