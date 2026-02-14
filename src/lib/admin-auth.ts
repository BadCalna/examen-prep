import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function requireAdminApi() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "无管理员权限" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
