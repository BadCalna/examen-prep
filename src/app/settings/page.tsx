import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">设置</h1>
        <p className="mt-2 text-slate-500">此功能正在开发中...</p>
      </div>
      <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
        <ChevronLeft className="mr-1 h-4 w-4" /> 返回首页
      </Link>
    </div>
  );
}
