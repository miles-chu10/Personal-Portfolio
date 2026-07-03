import type { Metadata, Viewport } from "next";

import { profile, socialLinks } from "@/data/portfolio";
import { getSiteUrl } from "@/lib/site";

import "./globals.css";

const siteTitle = `${profile.name} | ${profile.title}`;
const siteDescription =
  "Personal portfolio for Miles Chu, covering GTM strategy, revenue operations, Salesforce systems, forecasting, and AI workflow systems, with selected impact metrics.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: profile.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: profile.location,
  },
  url: getSiteUrl(),
  sameAs: socialLinks
    .filter((link) => link.href.startsWith("https://"))
    .map((link) => link.href),
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of California, Riverside",
  },
  knowsAbout: [
    "GTM Strategy",
    "Revenue Operations",
    "Sales Strategy and Operations",
    "Salesforce",
    "Pipeline Analytics",
    "Forecasting",
    "SQL",
    "AI Workflow Automation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
