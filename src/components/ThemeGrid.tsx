import Link from 'next/link';
import { Topic } from '@/types/topic';
import { Scale, Landmark, ScrollText, BookOpen, Users, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Scale,
  Landmark,
  ScrollText,
  BookOpen,
  Users
};

interface ThemeGridProps {
  topics: Topic[];
}

export default function ThemeGrid({ topics }: ThemeGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {topics.map((topic) => {
        const Icon = iconMap[topic.icon] || BookOpen;
        
        return (
          <Link 
            key={topic.id} 
            href={`/topics/${topic.slug}`}
            className="group relative flex min-h-[320px] flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Icon size={40} />
            </div>
            
            <div className="w-full flex-1 flex flex-col justify-center gap-2">
              <h3 
                className="text-lg font-bold leading-tight text-slate-900 group-hover:text-blue-800"
                title={topic.title}
              >
                {topic.title}
              </h3>
              <p className="truncate text-sm font-medium text-slate-500 group-hover:text-blue-600">
                {topic.titleCn}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
