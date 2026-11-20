import type { Metadata } from "next";
import { Playfair_Display, Mulish } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/session";
import { MotionProvider } from "@/components/motion/motion-provider";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-playfair", display: "swap" });
const mulish = Mulish({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-mulish", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Rasm — Book your wedding hall and every service in one place", template: "%s · Rasm" },
  description: "Book a marriage hall and add photographers, decorators, caterers, fireworks, DJs, makeup and mehndi artists to the same booking.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={`${playfair.variable} ${mulish.variable}`}>
      <body className="flex min-h-screen flex-col">
        <MotionProvider>
          <SiteHeader user={user ? { id: user.id, name: user.name, role: user.role } : null} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
