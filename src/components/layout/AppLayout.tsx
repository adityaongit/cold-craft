"use client";

import React, { useState } from "react";
import { Box, Flex, HStack, VStack, Text, Icon, IconButton, Input, Badge, Kbd } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  FileUp,
  Folder,
  Settings,
  PanelRightOpen,
  PanelRightClose,
  Search,
  Moon,
  Sun,
  ArrowLeft,
  User,
  LogOut,
} from "lucide-react";
import { useColorMode } from "@/components/ui/color-mode";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SearchModal } from "@/components/common/SearchModal";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@/components/ui/menu";

interface NavItem {
  label: string;
  icon: any;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Templates", icon: FileText, href: "/templates" },
  { label: "Compose", icon: PenSquare, href: "/compose" },
  { label: "Resumes", icon: FileUp, href: "/resumes" },
  { label: "Categories", icon: Folder, href: "/categories" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  subtitle?: string;
  showSearch?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function AppLayout({ children, title, breadcrumbs, subtitle, showSearch = true, showBackButton = false, onBackClick }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const { data: session } = useSession();

  // Enable global keyboard shortcuts
  useGlobalShortcuts(() => setSearchOpen(true));

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Flex h="100vh" bg="bg.surface" overflow="hidden" direction="column">
      {/* Top Navbar - Full Width */}
      <Flex
        as="header"
        align="center"
        h={{ base: "56px", md: "64px" }}
        px={{ base: 3, md: 6 }}
        borderBottomWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg="bg.canvas"
      >
        {/* Breadcrumb OR Search */}
        {(title || breadcrumbs) ? (
          <>
            <HStack gap={{ base: 2, md: 3 }}>
              {/* Logo - Hidden on mobile */}
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="600"
                  letterSpacing="-0.01em"
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  transition="opacity 0.15s"
                  display={{ base: "none", md: "block" }}
                >
                  CC
                </Text>
              </Link>

              {/* Slash separator */}
              <Text display={{ base: "none", md: "block" }} opacity={0.15} fontSize="33px" fontWeight="300" lineHeight="47.1438px">/</Text>

              {/* Breadcrumb items */}
              {breadcrumbs ? (
                <>
                  {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={index}>
                        {item.href && !isLast ? (
                          <Link href={item.href} style={{ textDecoration: 'none' }}>
                            <Text
                              fontSize={{ base: "xs", md: "sm" }}
                              fontWeight={isLast ? "semibold" : "normal"}
                              color={isLast ? "fg.default" : "fg.muted"}
                              _hover={{ color: "fg.default" }}
                              cursor="pointer"
                              display={{ base: isLast ? "block" : "none", md: "block" }}
                            >
                              {item.label}
                            </Text>
                          </Link>
                        ) : (
                          <Text
                            fontSize={{ base: "xs", md: "sm" }}
                            fontWeight={isLast ? "semibold" : "normal"}
                            color={isLast ? "fg.default" : "fg.muted"}
                            display={{ base: isLast ? "block" : "none", md: "block" }}
                          >
                            {item.label}
                          </Text>
                        )}
                        {!isLast && <Text display={{ base: "none", md: "block" }} opacity={0.15} fontSize="33px" fontWeight="300" lineHeight="47.1438px">/</Text>}
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                  {title}
                </Text>
              )}
            </HStack>

            <Box flex={1} />

            {showSearch && (
              <Box display={{ base: "none", md: "block" }}>
                <HStack
                  onClick={() => setSearchOpen(true)}
                  cursor="pointer"
                  bg="bg.muted"
                  px={3}
                  py={1.5}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={{ base: "gray.200", _dark: "gray.700" }}
                  _hover={{ borderColor: { base: "gray.300", _dark: "gray.600" } }}
                  transition="all 0.15s"
                  gap={2}
                  minW={{ base: "180px", sm: "200px", lg: "300px" }}
                >
                  <Icon color="fg.muted" fontSize="sm">
                    <Search size={14} />
                  </Icon>
                  <Text fontSize="sm" color="fg.muted" flex={1}>
                    Search...
                  </Text>
                  <HStack gap={0.5} display={{ base: "none", lg: "flex" }}>
                    <Kbd fontSize="xs" px={1.5} py={0.5} bg="bg.subtle" borderRadius="sm">
                      ⌘
                    </Kbd>
                    <Kbd fontSize="xs" px={1.5} py={0.5} bg="bg.subtle" borderRadius="sm">
                      K
                    </Kbd>
                  </HStack>
                </HStack>
              </Box>
            )}
          </>
        ) : showSearch ? (
            <Box display="flex" justifyContent="center" maxW="600px" mx="auto">
              <HStack
                onClick={() => setSearchOpen(true)}
                cursor="pointer"
                bg="bg.muted"
                px={4}
                py={2}
                borderRadius="md"
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
                _hover={{ borderColor: { base: "gray.300", _dark: "gray.600" } }}
                transition="all 0.15s"
                gap={3}
                minW={{ base: "250px", sm: "300px", md: "400px" }}
              >
                <Icon color="fg.muted" fontSize="sm">
                  <Search size={14} />
                </Icon>
                <Text fontSize="sm" color="fg.muted" flex={1}>
                  Search templates, categories...
                </Text>
                <HStack gap={0.5}>
                  <Kbd fontSize="xs" px={1.5} py={0.5} bg="bg.subtle" borderRadius="sm">
                    ⌘
                  </Kbd>
                  <Kbd fontSize="xs" px={1.5} py={0.5} bg="bg.subtle" borderRadius="sm">
                    K
                  </Kbd>
                </HStack>
              </HStack>
            </Box>
          ) : null}

        {/* Actions */}
        <Box flex={1} />
        <HStack gap={1}>
          {/* Mobile Search Button */}
          {showSearch && (
            <IconButton
              aria-label="Search"
              variant="ghost"
              size="sm"
              display={{ base: "flex", md: "none" }}
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
            </IconButton>
          )}

          <IconButton
            aria-label="Toggle color mode"
            variant="ghost"
            size="sm"
            onClick={toggleColorMode}
          >
            {mounted && (colorMode === "light" ? <Moon size={16} /> : <Sun size={16} />)}
          </IconButton>

          {/* User Menu */}
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                aria-label="User menu"
                variant="ghost"
                size="sm"
              >
                <User size={16} />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <Box px={3} py={2} borderBottomWidth="1px" borderColor="border.subtle">
                <Text fontSize="sm" fontWeight="semibold">
                  {session?.user?.name || "User"}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {session?.user?.email}
                </Text>
              </Box>
              <MenuItem value="profile" onClick={() => router.push("/settings")}>
                <Icon mr={2}>
                  <User size={14} />
                </Icon>
                Profile
              </MenuItem>
              <MenuSeparator />
              <MenuItem value="logout" onClick={handleSignOut} color="red.500">
                <Icon mr={2}>
                  <LogOut size={14} />
                </Icon>
                Sign Out
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </HStack>
      </Flex>

      {/* Main Content Area with Sidebar */}
      <Flex flex={1} overflow="hidden">
        {/* Collapsible Sidebar - Hidden on Mobile */}
        <Box
          as="aside"
          w={isCollapsed ? "60px" : "240px"}
          h="full"
          bg="bg.canvas"
          borderRightWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          transition="width 0.2s ease"
          position="relative"
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
        >
        {/* Navigation */}
        <VStack gap={0.5} p={2} align="stretch" flex={1} overflowY="auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <Flex
                  align="center"
                  gap={3}
                  px={2.5}
                  py={1.5}
                  borderRadius="sm"
                  cursor="pointer"
                  fontWeight={isActive ? "500" : "normal"}
                  fontSize="sm"
                  color={isActive ? undefined : "fg.muted"}
                  bg={isActive ? "bg.muted" : "transparent"}
                  _hover={{ bg: "bg.muted" }}
                  transition="all 0.15s"
                  justify={isCollapsed ? "center" : "flex-start"}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon fontSize="md" color={isActive ? undefined : "fg.muted"}>
                    <item.icon size={16} />
                  </Icon>
                  {!isCollapsed && <Text>{item.label}</Text>}
                </Flex>
              </Link>
            );
          })}
        </VStack>

        {/* Collapse Button at Bottom */}
        <Box p={2} borderTopWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
          <Flex
            align="center"
            gap={3}
            px={2.5}
            py={2}
            borderRadius="sm"
            cursor="pointer"
            fontSize="sm"
            color="fg.muted"
            _hover={{ bg: "bg.muted" }}
            transition="all 0.15s"
            justify={isCollapsed ? "center" : "flex-start"}
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expand menu" : undefined}
          >
            <Icon fontSize="md">
              {isCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
            </Icon>
            {!isCollapsed && <Text>Collapse menu</Text>}
          </Flex>
        </Box>
      </Box>

      {/* Page Content */}
      <Flex flex={1} direction="column" overflow="hidden">
        <Box flex={1} overflowY="auto" p={{ base: 4, md: 6 }} pb={{ base: "80px", md: 6 }}>
          {children}
        </Box>
      </Flex>
      </Flex>

      {/* Mobile Bottom Navigation */}
      <Box
        as="nav"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        display={{ base: "block", md: "none" }}
        bg="bg.canvas"
        borderTopWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        zIndex={1000}
        pb="env(safe-area-inset-bottom)"
      >
        <HStack gap={0} justify="space-around" px={2} py={2}>
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none', flex: 1 }}
              >
                <VStack
                  gap={1}
                  cursor="pointer"
                  transition="all 0.2s"
                  py={1.5}
                  px={2}
                >
                  <Icon
                    fontSize="xl"
                    color={isActive ? "brand.500" : "fg.muted"}
                  >
                    <item.icon size={22} />
                  </Icon>
                  <Text
                    fontSize="xs"
                    fontWeight={isActive ? "600" : "normal"}
                    color={isActive ? "brand.500" : "fg.muted"}
                    textAlign="center"
                  >
                    {item.label}
                  </Text>
                </VStack>
              </Link>
            );
          })}
        </HStack>
      </Box>

      {/* Centralized Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </Flex>
  );
}
