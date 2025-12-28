import { createAuthClient } from "better-auth/react";

// Automatically detect the base URL
const getBaseURL = () => {
  // In production, use VERCEL_URL or custom domain
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // For Vercel deployments
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // For browser, use current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback to localhost for development
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
