"use client";

import { ThemeProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
}

export function useColorMode() {
  const { theme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return {
    colorMode: theme,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { theme } = useTheme();
  return theme === "light" ? light : dark;
}

export function LightMode(props: { children: React.ReactNode }) {
  return <div className="light">{props.children}</div>;
}

export function DarkMode(props: { children: React.ReactNode }) {
  return <div className="dark">{props.children}</div>;
}
