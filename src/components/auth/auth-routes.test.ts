import { describe, expect, it } from "vitest";
import { isAuthRoute } from "./auth-routes";

describe("isAuthRoute: which pages drop the site chrome", () => {
  it("the five sign-in pages", () => {
    for (const p of ["/login", "/signup", "/forgot-password", "/reset-password", "/welcome"]) expect(isAuthRoute(p), p).toBe(true);
  });
  it("everything else keeps the header, footer and tab bar", () => {
    for (const p of ["/", "/account", "/study", "/roadmap", "/learn", "/today", "/grammar/1-1", "/auth/callback", "/loginx", "/signups"]) expect(isAuthRoute(p), p).toBe(false);
  });
});
