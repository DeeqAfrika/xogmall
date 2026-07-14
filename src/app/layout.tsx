import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { brand } from "@/config/brand";
import "./globals.css";

const metadataBase = brand.websiteUrl ? new URL(brand.websiteUrl) : undefined;

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | GBP to USD rate and agent support`,
    template: `%s | ${brand.name}`,
  },
  description:
    `${brand.name} provides a public ${brand.sourceCurrency} to ${brand.payoutCurrency} rate calculator, agent locator, and agent onboarding service. Service details require approval before launch.`,
  metadataBase,
  openGraph: {
    title: `${brand.name} | GBP to USD rate and agent support`,
    description:
      "Public GBP to USD rate information, agent locator support, and agent onboarding.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
