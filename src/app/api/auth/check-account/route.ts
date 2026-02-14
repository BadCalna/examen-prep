import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeAccount } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawAccount = searchParams.get("account") ?? "";
    const account = normalizeAccount(rawAccount);

    if (account.length < 3) {
      return NextResponse.json({ available: false, error: "账号至少 3 个字符" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { account } });
    return NextResponse.json({ available: !existing });
  } catch (error) {
    console.error("Failed to check account availability:", error);
    return NextResponse.json({ available: false, error: "检查账号失败" }, { status: 500 });
  }
}
