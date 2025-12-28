import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fafafa" },
          100: { value: "#f4f4f5" },
          200: { value: "#e4e4e7" },
          300: { value: "#d4d4d8" },
          400: { value: "#a1a1aa" },
          500: { value: "#71717a" }, // Primary brand color - neutral grey
          600: { value: "#52525b" },
          700: { value: "#3f3f46" },
          800: { value: "#27272a" },
          900: { value: "#18181b" },
          950: { value: "#09090b" },
        },
      },
      fonts: {
        heading: { value: "var(--font-inter), system-ui, sans-serif" },
        body: { value: "var(--font-inter), system-ui, sans-serif" },
      },
      radii: {
        sm: { value: "0.25rem" },
        md: { value: "0.375rem" },
        lg: { value: "0.5rem" },
        xl: { value: "0.75rem" },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" },
        },
        "primary.solid": {
          value: { base: "{colors.brand.800}", _dark: "{colors.brand.200}" },
        },
        "primary.muted": {
          value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" },
        },
        "bg.canvas": {
          value: { base: "#fafafa", _dark: "#222222" }, // Light: RGB(250,250,250) - navbar/topbar
        },
        "bg.surface": {
          value: { base: "#fafafa", _dark: "#191919" }, // Light: RGB(250,250,250) - main background
        },
        "bg.panel": {
          value: { base: "#ffffff", _dark: "#2a2a2a" }, // Light: RGB(255,255,255) - main components/cards
        },
        "border.subtle": {
          value: { base: "#e4e4e7", _dark: "#3a3a3a" },
        },
        "border.default": {
          value: { base: "#d4d4d8", _dark: "#52525b" },
        },
        "border.emphasized": {
          value: { base: "#a1a1aa", _dark: "#71717a" },
        },
      },
    },
    recipes: {
      input: {
        base: {
          borderColor: { base: "gray.300", _dark: "gray.600" },
          _focus: {
            borderColor: { base: "gray.400", _dark: "gray.500" },
          },
        },
      },
      textarea: {
        base: {
          borderColor: { base: "gray.300", _dark: "gray.600" },
          _focus: {
            borderColor: { base: "gray.400", _dark: "gray.500" },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
