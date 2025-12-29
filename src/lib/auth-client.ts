import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Don't specify baseURL - better-auth will use the current origin automatically
  // This prevents hydration mismatches
});

export const { signIn, signUp, signOut, useSession } = authClient;
