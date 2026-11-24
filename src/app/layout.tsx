import type { Metadata } from "next";
import { Playfair_Display, Mulish, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/demo-banner";
import { ClientGate } from "@/components/client-gate";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PackageBar } from "@/components/package-bar";
import { Toaster } from "@/components/toaster";
import { WelcomeDialog } from "@/components/welcome-dialog";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-playfair", display: "swap" });
const urdu = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: ["600"], variable: "--font-urdu", display: "swap", preload: false });
const mulish = Mulish({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-mulish", display: "swap" });

const DESCRIPTION =
  "Book a marriage hall and add photographers, decorators, caterers, fireworks, DJs, makeup and mehndi artists to the same booking — with live availability and one 25% advance. Interactive prototype.";

export const metadata: Metadata = {
  metadataBase: new URL("https://rasm-wedding.vercel.app"),
  title: { default: "Rasm — Book your wedding hall and every service in one place", template: "%s · Rasm" },
  description: DESCRIPTION,
  applicationName: "Rasm",
  openGraph: {
    type: "website",
    siteName: "Rasm",
    title: "Rasm — Your whole wedding, one booking",
    description: DESCRIPTION,
    url: "/",
    locale: "en_PK",
  },
  twitter: { card: "summary_large_image", title: "Rasm — Your whole wedding, one booking", description: DESCRIPTION },
};

export const viewport = { themeColor: "#5B1A2B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${mulish.variable} ${urdu.variable}`}>
      <body className="flex min-h-screen flex-col">
        <MotionProvider>
          <DemoBanner />
          <SiteHeader />
          <main className="flex-1">
            <ClientGate>{children}</ClientGate>
          </main>
          <SiteFooter />
          <PackageBar />
          <Toaster />
          <WelcomeDialog />
        </MotionProvider>
      </body>
    </html>
  );
}
