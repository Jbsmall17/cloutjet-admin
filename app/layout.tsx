import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "./globals.css";
import ContextComp from "@/context/context";

export const metadata: Metadata = {
  title: "Clout Jet Admin",
  description: "Admin dashboard for Clout Jet marketplace",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ContextComp>
          <Suspense fallback={null}>{children}</Suspense>
        </ContextComp>
      </body>
    </html>
  );
}
