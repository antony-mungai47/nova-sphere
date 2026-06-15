import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NOVA SPHERE | The Future of Smart Shopping",
  description: "Explore the future of smart shopping with NOVA SPHERE. A premium tech-powered marketplace with cinematic UI and intelligent shopping experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark`} style={{ colorScheme: 'dark' }}>
        <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-nova-blue selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

