import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/hearth/theme-provider";
import { Ambient } from "@/components/hearth/ambient";
import { Nav } from "@/components/hearth/nav";
import { Footer } from "@/components/hearth/footer";
import { ScrollProgress } from "@/components/hearth/scroll-progress";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-code",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hearth.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hearth — rebuild your cultural home in any city",
    template: "%s · Hearth",
  },
  description:
    "Tell Hearth the places, music, food and films that made your old city feel like home. It finds their equivalents in your new city and builds a 30-day soft-landing plan. Powered by the Qloo taste graph.",
  applicationName: "Hearth",
  keywords: [
    "relocation",
    "taste graph",
    "Qloo",
    "expat",
    "international students",
    "soft landing",
    "cultural home",
  ],
  authors: [{ name: "Hearth" }],
  openGraph: {
    type: "website",
    title: "Hearth — rebuild your cultural home in any city",
    description:
      "Cross-city taste transfer: find the bars, venues, food and scenes your old-city self would love, in the city you're moving to.",
    siteName: "Hearth",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hearth — rebuild your cultural home in any city",
    description: "Your taste, translated for a new city.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0a09" },
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} ${mono.variable} antialiased`}
      >
        <ThemeProvider>
          <Ambient />
          <ScrollProgress />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:text-ember-ink"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
