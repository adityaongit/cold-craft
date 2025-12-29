"use client";

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  duration: 3000,
  pauseOnPageIdle: true,
});

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster
        toaster={toaster}
        insetInline={{ mdDown: "4" }}
        gap={2}
        placement={{ base: "top", md: "top-end" }}
      >
        {(toast) => (
          <Toast.Root
            width={{ md: "sm" }}
            borderRadius="md"
            py={3}
            px={4}
            bg={{ base: "white", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            boxShadow="md"
            _open={{
              animationName: "slide-fade-in",
              animationDuration: "0.3s",
            }}
          >
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && (
                <Toast.Title
                  fontSize="sm"
                  fontWeight="500"
                  color={{ base: "gray.900", _dark: "gray.100" }}
                >
                  {toast.title}
                </Toast.Title>
              )}
              {toast.description && (
                <Toast.Description
                  fontSize="xs"
                  color={{ base: "gray.600", _dark: "gray.400" }}
                >
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
