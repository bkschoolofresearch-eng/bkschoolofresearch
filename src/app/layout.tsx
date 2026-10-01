import type { Metadata } from "next";
import {
  ADLaM_Display,
  Instrument_Sans,
  Manrope,
  Newsreader,
} from "next/font/google";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/seo/site-url";
import { siteSettings } from "@/content/seed/site-settings";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const adlamDisplay = ADLaM_Display({
  variable: "--font-adlam-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = buildMetadata(siteSettings.defaultSeo, {
  absoluteUrlBase: getSiteUrl(),
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable} ${instrumentSans.variable} ${adlamDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper font-sans text-body">
        <SiteJsonLd />
        <AuthProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
