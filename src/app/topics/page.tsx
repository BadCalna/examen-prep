import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import ThemeGrid from '@/components/ThemeGrid';
import { Topic } from '@/types/topic';
import { ArrowLeft } from 'lucide-react';

async function getTopics(): Promise<Topic[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'topics', 'index.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Thèmes d'Étude
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Choisissez un sujet pour commencer l'entraînement ciblé.
            <br />
            <span className="text-sm opacity-80">选择一个主题开始专项练习。</span>
          </p>
        </header>

        <ThemeGrid topics={topics} />
      </div>
    </div>
  );
}
