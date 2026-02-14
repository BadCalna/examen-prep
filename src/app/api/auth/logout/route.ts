import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const tokenHash = hashSessionToken(token);
      await prisma.session.deleteMany({ where: { tokenHash } });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Failed to logout:", error);
    return NextResponse.json({ error: "退出登录失败" }, { status: 500 });
  }
}
