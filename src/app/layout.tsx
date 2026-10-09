import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Account } from "@/components/account";
import { SideNav, TabBar } from "@/components/nav";
import { StudyProvider } from "@/components/study-context";
import { ThaiToggle } from "@/components/thai-toggle";
import "./globals.css";

const body = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display-face" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-face" });

export const metadata: Metadata = {
  title: { default: "English Studio", template: "%s · English Studio" },
  description: "เรียนภาษาอังกฤษทีละขั้น ตั้งแต่โครงประโยคจนใช้ทำงานได้",
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
    <html lang="th" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <StudyProvider>
          <div className="lg:grid lg:min-h-dvh lg:grid-cols-[232px_1fr]">
            <aside className="sticky top-0 hidden h-dvh flex-col gap-6 bg-ink px-4 py-6 text-white lg:flex">
              <div className="px-2.5"><Brand /></div>
              <SideNav />
              <div className="mt-auto flex flex-col gap-4 border-t border-[#2a3b34] px-2.5 pt-4">
                <ThaiToggle dark />
                <Suspense fallback={null}><Account /></Suspense>
              </div>
            </aside>

            <div className="min-w-0">
              <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white lg:hidden">
                <Brand />
                <ThaiToggle dark />
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
