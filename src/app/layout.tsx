import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miles Chu | GTM Strategy and AI Workflow Systems",
  description:
    "Personal portfolio for Miles Chu, covering GTM strategy, revenue operations, AI workflow systems, and selected impact metrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
