import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import { ScrollbarHider } from "@/components/common/ScrollbarHider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PitchPad - Professional Outreach Message Composer",
  description: "Craft perfect cold emails, LinkedIn messages, and outreach with intelligent templates and resume integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable}`}>
        <ScrollbarHider />
        <Provider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </Provider>
      </body>
    </html>
  );
}
