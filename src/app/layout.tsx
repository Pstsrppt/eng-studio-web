import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Cinzel, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans_Thai, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { MobileAccount, MobileAccountFallback } from "@/components/account";
import { StudyNav, TabBar } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteFrame } from "@/components/site-frame";
import { SiteHeader } from "@/components/site-header";
import { StudyProvider } from "@/components/study-context";
import "./globals.css";

const body = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display-face" });
const serif = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-serif-face" });
const brand = Cinzel({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-brand-face" });
// Academic Studio headings (the Home reference); not preloaded, since only themed pages use it.
const academic = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-academic-face", preload: false });
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
  // Opened from the iPhone home screen: full screen, with the default (dark text) status bar above the white header.
  appleWebApp: { capable: true, title: "Odyssey", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${body.variable} ${display.variable} ${mono.variable} ${serif.variable} ${brand.variable} ${academic.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <StudyProvider>
          {/* Sign-out, mistakes and the rest of the menu live on /account. Sign-in pages (/login, /signup and the
              password and welcome pages) render without this chrome, in their own Auth Shell. */}
          <SiteFrame
            header={<SiteHeader account={<Suspense fallback={<MobileAccountFallback />}><MobileAccount /></Suspense>} />}
            nav={<StudyNav />} footer={<SiteFooter />} tabbar={<TabBar />}>
            {children}
          </SiteFrame>
        </StudyProvider>
      </body>
    </html>
  );
}
