import { describe, expect, it } from "vitest";
import { isRateLimited, SIGNUP_BAD_EMAIL, SIGNUP_FAILED, SIGNUP_LIMITED, SIGNUP_WEAK, signUpOutcome } from "./auth-result";

const err = (code: string, status = 400) => ({ data: null, error: { code, status } });

describe("signUpOutcome: what the sign-up form shows", () => {
  it("confirmation on, new address: check your email", () => {
    expect(signUpOutcome("a@b.co", { data: { session: null }, error: null })).toEqual({ sent: "a@b.co" });
  });
  it("confirmation on, existing address (Supabase returns a user with no identities, no session): the same screen", () => {
    const existing = { data: { session: null, user: { identities: [] } }, error: null };
    expect(signUpOutcome("a@b.co", existing)).toEqual(signUpOutcome("a@b.co", { data: { session: null }, error: null }));
  });
  it("confirmation off, new address: created and signed in", () => {
    expect(signUpOutcome("a@b.co", { data: { session: { access_token: "x" } }, error: null })).toEqual({ created: true });
  });
  it("confirmation off, existing address: the generic failure, word for word the same as an unexpected error", () => {
    const existing = signUpOutcome("a@b.co", err("user_already_exists", 422));
    expect(existing).toEqual({ error: SIGNUP_FAILED });
    expect(existing).toEqual(signUpOutcome("a@b.co", err("unexpected_failure", 500)));
    // It doesn't assert that the account exists.
    expect(SIGNUP_FAILED).not.toMatch(/มีบัญชีอยู่แล้ว|already/);
  });
  it("input and limit errors keep their own message", () => {
    expect(signUpOutcome("a@b.co", err("weak_password", 422))).toEqual({ error: SIGNUP_WEAK });
    expect(signUpOutcome("a@b.co", err("email_address_invalid"))).toEqual({ error: SIGNUP_BAD_EMAIL });
    expect(signUpOutcome("a@b.co", err("over_email_send_rate_limit", 429))).toEqual({ error: SIGNUP_LIMITED });
  });
  it("rate limits by status or code", () => {
    expect(isRateLimited({ status: 429 })).toBe(true);
    expect(isRateLimited({ code: "over_request_rate_limit" })).toBe(true);
    expect(isRateLimited({ status: 400, code: "invalid_credentials" })).toBe(false);
  });
});
