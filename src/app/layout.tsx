import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Account, MobileAccount, MobileAccountFallback } from "@/components/account";
import { SideNav, TabBar } from "@/components/nav";
import { StudyProvider } from "@/components/study-context";
import { ThaiToggle } from "@/components/thai-toggle";
import "./globals.css";

const body = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display-face" });
const serif = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-serif-face" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-face" });

const DESCRIPTION = "เรียนภาษาอังกฤษสำหรับคนทำงาน ไวยากรณ์ทีละบท คำศัพท์พร้อมภาพและเสียง ทวนอัตโนมัติ เรียนฟรีบนมือถือ";

export const metadata: Metadata = {
  // Link previews need absolute image URLs; Vercel sets the production host for us.
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "English Studio", template: "%s · English Studio" },
  description: DESCRIPTION,
  applicationName: "English Studio",
  openGraph: { type: "website", siteName: "English Studio", locale: "th_TH", title: "English Studio · เรียนภาษาอังกฤษสำหรับคนทำงาน", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "English Studio · เรียนภาษาอังกฤษสำหรับคนทำงาน", description: DESCRIPTION },
  // Opened from the iPhone home screen: full screen, with a black status bar above the dark header.
  appleWebApp: { capable: true, title: "English Studio", statusBarStyle: "black" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#13201b", viewportFit: "cover" };

function Brand() {
  return (
    <Link href="/" className="font-display text-xl font-bold tracking-tight">
      English<span className="text-mark">.</span>Studio
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${body.variable} ${display.variable} ${mono.variable} ${serif.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <StudyProvider>
          <div className="lg:grid lg:min-h-dvh lg:grid-cols-[232px_1fr]">
            <aside className="sticky top-0 hidden h-dvh flex-col gap-6 bg-ink px-4 py-6 text-white lg:flex">
              <div className="px-2.5"><Brand /></div>
              <SideNav />
              <Link href="/guide" className="mx-2.5 rounded-lg border border-[#2a3b34] px-3 py-2.5 text-xs leading-5 text-[#c9d4cf] transition hover:bg-ink-2/60">
                <b className="block text-sm font-semibold text-white">คู่มือ</b>
                n. v. adj. V3 กริยาช่วย คืออะไร
              </Link>
              <Link href="/mistakes" className="mx-2.5 -mt-3 rounded-lg border border-[#2a3b34] px-3 py-2.5 text-xs leading-5 text-[#c9d4cf] transition hover:bg-ink-2/60">
                <b className="block text-sm font-semibold text-white">ทบทวนข้อผิด</b>
                ทำข้อที่เคยตอบผิดซ้ำจนถูก
              </Link>
              <div className="mt-auto flex flex-col gap-4 border-t border-[#2a3b34] px-2.5 pt-4">
                <ThaiToggle dark />
                <Suspense fallback={null}><Account /></Suspense>
              </div>
            </aside>

            <div className="min-w-0">
              <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white lg:hidden">
                <Brand />
                <div className="flex items-center gap-2">
                  <ThaiToggle dark />
                  {/* The guide, mistakes and sign-out live on /account on phones. */}
                  <Suspense fallback={<MobileAccountFallback />}><MobileAccount /></Suspense>
                </div>
              </header>
              <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9 lg:pb-12">{children}</main>
            </div>
          </div>
          <TabBar />
        </StudyProvider>
      </body>
    </html>
  );
}
