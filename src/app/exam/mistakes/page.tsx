import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MistakesPracticeCard from '@/components/exam/MistakesPracticeCard';

export default function ExamMistakesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-100 px-6 py-16">
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
            错题本
            <span className="block text-slate-500">闪卡强化练习</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            仅从你的错题本抽题，答题后即时反馈与解析。可将已掌握题目标记移出错题本。
          </p>
        </header>

        <MistakesPracticeCard />
      </main>
    </div>
  );
}
