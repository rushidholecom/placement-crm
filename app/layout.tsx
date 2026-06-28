import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "Placement CRM",
  description: "Placement operations CRM built with Next.js, Prisma, and SQLite."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
