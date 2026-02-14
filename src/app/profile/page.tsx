import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, UserCog } from "lucide-react";
import { getCurrentUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/profile');
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <main className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          返回首页
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">编辑资料</h1>
            <p className="text-sm text-slate-500">此页面已预留，后续可扩展昵称、密码修改等能力。</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">当前昵称：{user.nickname}</p>
          <p className="mt-1 text-sm text-slate-600">当前账号：{user.account}</p>
        </div>
      </main>
    </div>
  );
}
