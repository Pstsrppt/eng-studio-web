"use client";

import { usePathname } from "next/navigation";
import { isAuthRoute } from "@/components/auth/auth-routes";

/**
 * The site chrome around every page: header, study bar, the page container, footer and the phone tab bar.
 * Sign-in pages bring their own full-screen Auth Shell, so for those it renders the page alone. The chrome is
 * rendered on the server and passed in, so nothing about it changes for the other pages.
 */
export function SiteFrame({ header, nav, footer, tabbar, children }: {
  header: React.ReactNode; nav: React.ReactNode; footer: React.ReactNode; tabbar: React.ReactNode; children: React.ReactNode;
}) {
  if (isAuthRoute(usePathname() ?? "")) return <>{children}</>;
  return (
    <>
      {header}
      {nav}
      <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9 lg:pb-12">{children}</main>
      {footer}
      {tabbar}
    </>
  );
}
