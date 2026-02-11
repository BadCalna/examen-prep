import Link from "next/link";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Settings,
  ChevronRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 sm:px-8 lg:px-12">
      <main className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="mb-16 flex flex-col items-start gap-6 py-10 sm:py-16">
          <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Examen Civique Prep
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            准备好成为<br />
            <span className="text-blue-700">法国公民</span>了吗？
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">
            高效掌握面试必考知识：历史、共和国价值与文化。
            <br className="hidden sm:inline" />
            专为申请多年居留与入籍设计。
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-800 hover:shadow-xl active:scale-95"
            >
              <BookOpen className="h-5 w-5" />
              开始每日练习
            </Link>
            <Link
              href="/exam/mistakes"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:ring-slate-300 active:scale-95"
            >
              <Clock className="h-5 w-5" />
              刷错题本
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Practice */}
          <Link
            href="/topics"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">主题练习</h3>
            <p className="mb-6 text-sm text-slate-500">
              浏览核心题库，按分类刷题。包含历史、地理与共和国原则。
            </p>
            <div className="flex items-center text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
              进入练习 <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>

          {/* Card 2: Mock Exam */}
          <Link
            href="/exam"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-red-200 hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">模拟考试</h3>
            <p className="mb-6 text-sm text-slate-500">
              40 道题，45 分钟。完全模拟真实考试环境，仅显示法语。
            </p>
            <div className="flex items-center text-sm font-semibold text-red-600 transition-transform group-hover:translate-x-1">
              开始模考 <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>

          {/* Card 3: Progress */}
          <Link
            href="/progress"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">学习管理</h3>
            <p className="mb-6 text-sm text-slate-500">
              追踪练习进度，管理错题与收藏，发现薄弱环节。
            </p>
            <div className="flex items-center text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1">
              进入管理 <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>

          {/* Card 4: Settings (Small) */}
          <Link
            href="/settings"
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:bg-slate-50 sm:col-span-2 lg:col-span-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Settings className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">设置</h3>
              <p className="text-xs text-slate-500">
                切换语言、重置进度、关于应用
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-sm text-slate-400">
          <p>© 2026 Examen Civique Prep. MVP Demo.</p>
        </footer>
      </main>
    </div>
  );
}
