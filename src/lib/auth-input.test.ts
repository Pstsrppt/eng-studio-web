import { describe, expect, it } from "vitest";
import { isEmail, PASSWORD_MIN, signInError, signUpError } from "./auth-input";

describe("auth form checks", () => {
  it("email shape", () => {
    for (const ok of ["a@b.co", "first.last+tag@school.ac.th"]) expect(isEmail(ok), ok).toBe(true);
    for (const bad of ["", "a", "a@b", "a@b.", "a b@c.com", "@c.com", "a@.com"]) expect(isEmail(bad), bad).toBe(false);
  });
  it("sign in: both fields and a valid email, nothing about password length (existing passwords may be shorter)", () => {
    expect(signInError("", "x")).toBeDefined();
    expect(signInError("a@b.co", "")).toBeDefined();
    expect(signInError("not-an-email", "secret")).toBe("รูปแบบอีเมลไม่ถูกต้อง");
    expect(signInError("a@b.co", "123")).toBeUndefined();
  });
  it("sign up: required, email, length, then confirmation", () => {
    const ok = "x".repeat(PASSWORD_MIN);
    expect(signUpError("a@b.co", ok, "")).toBeDefined();
    expect(signUpError("a@b", ok, ok)).toBe("รูปแบบอีเมลไม่ถูกต้อง");
    expect(signUpError("a@b.co", "short", "short")).toContain(String(PASSWORD_MIN));
    expect(signUpError("a@b.co", ok, ok + "y")).toBe("รหัสผ่านสองช่องไม่ตรงกัน");
    expect(signUpError("a@b.co", ok, ok)).toBeUndefined();
  });
});
