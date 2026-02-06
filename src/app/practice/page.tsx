import PracticeCard from "@/components/PracticeCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-200 px-6 py-16">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>

        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Examen Civique Prep
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            法国公民知识考试
            <span className="block text-slate-500">闪卡练习</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            闪卡模式下系统将随机出题，随机考察主题内容。
          </p>
        </header>

        <PracticeCard />

        <section className="rounded-3xl border border-white/60 bg-white/70 p-6 text-sm text-slate-600">
          <div className="font-semibold text-slate-700">数据来源</div>
          <div className="mt-2">
            公民考试题库与公民手册摘录自官方 PDF，已整理为卡片练习数据。
          </div>
        </section>
      </main>
    </div>
  );
}
