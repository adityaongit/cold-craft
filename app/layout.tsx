import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ColdCraft - Professional Outreach Message Composer",
  description: "Craft perfect cold emails, LinkedIn messages, and outreach with intelligent templates and resume integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Provider>
          {children}
          <Toaster richColors position="top-right" />
        </Provider>
      </body>
    </html>
  );
}
