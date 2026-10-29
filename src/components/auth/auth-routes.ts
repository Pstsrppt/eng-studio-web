// The sign-in / sign-up pages that use the full-screen Auth Shell instead of the site header, study bar, footer
// and tab bar. /account stays on the normal site layout: it is a signed-in page, not part of signing in.
export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/welcome"] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}
