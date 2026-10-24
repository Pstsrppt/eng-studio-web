import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Cinzel, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { MobileAccount, MobileAccountFallback } from "@/components/account";
import { TabBar, TopNav } from "@/components/nav";
import { StudyProvider } from "@/components/study-context";
import { ThaiToggle } from "@/components/thai-toggle";
import "./globals.css";

const body = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display-face" });
const serif = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-serif-face" });
const brand = Cinzel({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-brand-face" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-face" });

const TITLE = "Odyssey · เตรียมสอบ IELTS ตั้งแต่พื้นฐาน";
const DESCRIPTION = "เส้นทางเตรียมสอบ IELTS ตั้งแต่พื้นฐาน ไวยากรณ์ทีละบท คำศัพท์พร้อมภาพและเสียง ทวนอัตโนมัติ เรียนฟรีบนมือถือ";

export const metadata: Metadata = {
  // Link previews need absolute image URLs; Vercel sets the production host for us.
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: TITLE, template: "%s · Odyssey" },
  description: DESCRIPTION,
  applicationName: "Odyssey",
  openGraph: { type: "website", siteName: "Odyssey", locale: "th_TH", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  // Opened from the iPhone home screen: full screen, with a black status bar above the dark header.
  appleWebApp: { capable: true, title: "Odyssey", statusBarStyle: "black" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#07182b", viewportFit: "cover" };

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 flex-col leading-none" aria-label="Odyssey หน้าแรก">
      <span className="font-brand text-[19px] font-bold tracking-[0.18em] text-white">ODYSSEY</span>
      <span className="mt-1 font-mono text-[9.5px] tracking-[0.2em] whitespace-nowrap text-gold sm:tracking-[0.28em]">IELTS · A HIGHER YOU</span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${body.variable} ${display.variable} ${mono.variable} ${serif.variable} ${brand.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <StudyProvider>
          <header className="on-dark sticky top-0 z-30 border-b border-white/10 bg-[rgba(7,24,43,0.92)] text-white backdrop-blur-md">
            <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
              <Brand />
              <div className="hidden min-w-0 flex-1 justify-center lg:flex"><TopNav /></div>
              <div className="flex items-center gap-2">
                <Link href="/guide" className="hidden rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#c4d0dd] hover:text-white lg:block">คู่มือ</Link>
                <ThaiToggle dark />
                {/* Sign-out, mistakes and the rest of the menu live on /account. */}
                <Suspense fallback={<MobileAccountFallback />}><MobileAccount /></Suspense>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9 lg:pb-12">{children}</main>
          <TabBar />
        </StudyProvider>
      </body>
    </html>
  );
}
