import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Releaf · Websites for psychologists",
  description:
    "Create a thoughtful professional website for your psychology practice without starting from a blank canvas.",
  icons: {
    icon: "/releaf-logo.jpg",
    apple: "/releaf-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
