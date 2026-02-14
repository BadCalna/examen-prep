import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
  createSessionToken,
  hashSessionToken,
  normalizeAccount,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = normalizeAccount(String(body.account ?? ""));
    const password = String(body.password ?? "");

    if (!account || !password) {
      return NextResponse.json({ error: "账号和密码不能为空" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { account } });
    if (!user) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "账号已被禁用" }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        account: user.account,
        nickname: user.nickname,
        role: user.role,
        plan: user.plan,
        status: user.status,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Failed to login:", error);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
