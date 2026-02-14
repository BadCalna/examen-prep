import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeAccount,
} from "@/lib/auth";

function validateInput(account: string, password: string, nickname: string): string | null {
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(account)) {
    return "账号仅支持字母、数字、下划线，长度 3-32";
  }

  if (password.length < 8 || password.length > 64) {
    return "密码长度需在 8-64 之间";
  }

  if (nickname.length < 1 || nickname.length > 32) {
    return "昵称长度需在 1-32 之间";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = normalizeAccount(String(body.account ?? ""));
    const password = String(body.password ?? "");
    const nickname = String(body.nickname ?? "").trim();

    const validationError = validateInput(account, password, nickname);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { account } });
    if (exists) {
      return NextResponse.json({ error: "账号已存在" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    const created = await prisma.$transaction(async (tx) => {
      const userCount = await tx.user.count();
      const role = userCount === 0 ? "ADMIN" : "USER";

      const user = await tx.user.create({
        data: {
          account,
          passwordHash,
          nickname,
          role,
          plan: "FREE",
          status: "ACTIVE",
        },
      });

      await tx.session.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      return user;
    });

    const response = NextResponse.json({
      user: {
        id: created.id,
        account: created.account,
        nickname: created.nickname,
        role: created.role,
        plan: created.plan,
        status: created.status,
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
    console.error("Failed to register:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
