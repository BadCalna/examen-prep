import { describe, it, expect } from "vitest";
import { hashPassword, normalizeAccount, verifyPassword } from "@/lib/auth";

describe("auth helpers", () => {
  it("normalizeAccount 只做首尾空格裁剪，不强制转小写", () => {
    expect(normalizeAccount("  AbC_User  ")).toBe("AbC_User");
  });

  it("hashPassword + verifyPassword 可以正确校验密码", async () => {
    const hashed = await hashPassword("Passw0rd!");

    await expect(verifyPassword("Passw0rd!", hashed)).resolves.toBe(true);
    await expect(verifyPassword("wrong-pass", hashed)).resolves.toBe(false);
  });
});
