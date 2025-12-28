"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import { system } from "@/lib/theme";

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="dark" storageKey="coldcraft-theme">
        {props.children}
      </ColorModeProvider>
    </ChakraProvider>
  );
}
