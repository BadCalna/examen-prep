import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";
import { normalizeAccount, hashPassword } from "@/lib/auth";
import { isUserPlan, isUserRole, isUserStatus } from "@/lib/user-access";

function validateAccount(account: string): string | null {
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(account)) {
    return "账号仅支持字母、数字、下划线，长度 3-32";
  }

  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 64) {
    return "密码长度需在 8-64 之间";
  }

  return null;
}

function validateNickname(nickname: string): string | null {
  if (nickname.length < 1 || nickname.length > 32) {
    return "昵称长度需在 1-32 之间";
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const guard = await requireAdminApi();
    if (!guard.ok) {
      return guard.response;
    }

    const { searchParams } = new URL(request.url);
    const keyword = (searchParams.get("keyword") ?? "").trim();

    const users = await prisma.user.findMany({
      where: keyword
        ? {
            OR: [
              { account: { contains: keyword } },
              { nickname: { contains: keyword } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        account: true,
        nickname: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to get users:", error);
    return NextResponse.json({ error: "获取用户失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdminApi();
    if (!guard.ok) {
      return guard.response;
    }

    const body = await request.json();
    const account = normalizeAccount(String(body.account ?? ""));
    const password = String(body.password ?? "");
    const nickname = String(body.nickname ?? "").trim();
    const role = String(body.role ?? "USER").trim();
    const plan = String(body.plan ?? "FREE").trim();
    const status = String(body.status ?? "ACTIVE").trim();

    const accountError = validateAccount(account);
    if (accountError) {
      return NextResponse.json({ error: accountError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json({ error: nicknameError }, { status: 400 });
    }

    if (!isUserRole(role)) {
      return NextResponse.json({ error: "无效角色" }, { status: 400 });
    }

    if (!isUserPlan(plan)) {
      return NextResponse.json({ error: "无效订阅档位" }, { status: 400 });
    }

    if (!isUserStatus(status)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { account } });
    if (existing) {
      return NextResponse.json({ error: "账号已存在" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        account,
        passwordHash,
        nickname,
        role,
        plan,
        status,
      },
      select: {
        id: true,
        account: true,
        nickname: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const guard = await requireAdminApi();
    if (!guard.ok) {
      return guard.response;
    }

    const body = await request.json();
    const userId = String(body.userId ?? "").trim();
    const role = String(body.role ?? "").trim();
    const plan = String(body.plan ?? "").trim();
    const status = String(body.status ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "缺少用户 ID" }, { status: 400 });
    }

    if (!isUserRole(role)) {
      return NextResponse.json({ error: "无效角色" }, { status: 400 });
    }

    if (!isUserPlan(plan)) {
      return NextResponse.json({ error: "无效订阅档位" }, { status: 400 });
    }

    if (!isUserStatus(status)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    if (guard.user.id === userId && role !== "ADMIN") {
      return NextResponse.json({ error: "不能移除自己的管理员角色" }, { status: 400 });
    }

    if (guard.user.id === userId && status !== "ACTIVE") {
      return NextResponse.json({ error: "不能将自己设为禁用状态" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role, plan, status },
      select: {
        id: true,
        account: true,
        nickname: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
  }
}
