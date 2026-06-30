import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miles Chu | Product-minded Engineer",
  description:
    "Personal portfolio for Miles Chu, covering work experience, selected projects, and skillsets.",
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
