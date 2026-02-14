'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  BookOpen,
  Heart,
  Trash2,
  CheckCircle,
  AlertCircle,
  Tag,
  Filter,
  Sparkles,
  Star,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { useUserProgress, MistakeRecord, BookmarkRecord } from '@/hooks/useUserProgress';
import { useTopicProgress } from '@/hooks/useTopicProgress';
import {
  filterMistakes,
  isSituationTopic,
  MistakeQuestionKind,
} from '@/lib/mistakeFilters';

type SubPage = 'overview' | 'topics' | 'mistakes' | 'bookmarks';

type WrongCountFilter = 1 | 2 | 3 | 5;

const TOPIC_NAMES: Record<string, { title: string; titleCn: string }> = {
  values: { title: 'Principes et valeurs', titleCn: '原则与价值观' },
  institutions: { title: 'Système institutionnel', titleCn: '制度体系' },
  rights: { title: 'Droits et devoirs', titleCn: '权利与义务' },
  history: { title: 'Histoire et culture', titleCn: '历史与文化' },
  society: { title: 'Société française', titleCn: '法国社会' },
  'daily-practice': { title: 'Pratique quotidienne', titleCn: '每日练习' },
  situation: { title: 'Situations pratiques', titleCn: '情景题' },
};

// 各主题总题数
const TOPIC_TOTAL_QUESTIONS: Record<string, number> = {
  values: 40,
  institutions: 40,
  rights: 35,
  history: 85,
  society: 41,
};

const ALL_TOPICS = ['values', 'institutions', 'rights', 'history', 'society'];

const KIND_FILTERS: Array<{ value: MistakeQuestionKind; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'choice', label: '选择题' },
  { value: 'situation', label: '情景题' },
];

const COUNT_FILTERS: Array<{ value: WrongCountFilter; label: string }> = [
  { value: 1, label: '全部次数' },
  { value: 2, label: '错 >= 2 次' },
  { value: 3, label: '错 >= 3 次' },
  { value: 5, label: '错 >= 5 次' },
];

function getTopicLabel(topicId: string): { title: string; titleCn: string } {
  return TOPIC_NAMES[topicId] || { title: topicId, titleCn: topicId };
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function getTopicOptions(records: MistakeRecord[], kind: MistakeQuestionKind): string[] {
  const topics = records
    .map((record) => record.topicId)
    .filter((topicId) => {
      if (kind === 'choice') return !isSituationTopic(topicId);
      if (kind === 'situation') return isSituationTopic(topicId);
      return true;
    });

  return Array.from(new Set(topics));
}

function isTopicAllowedInKind(topicId: string, kind: MistakeQuestionKind): boolean {
  if (topicId === 'all') return true;
  if (kind === 'all') return true;
  if (kind === 'choice') return !isSituationTopic(topicId);
  return isSituationTopic(topicId);
}

// ---- Sub-components ----

interface MistakeItemProps {
  record: MistakeRecord;
  onRemove: () => void;
}

function MistakeItem({ record, onRemove }: MistakeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const topic = getTopicLabel(record.topicId);

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-900 font-medium leading-relaxed line-clamp-2">
            {record.question.stem}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              错 {record.count} 次
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {topic.title}
          </span>
          <span>·</span>
          <span>{formatDate(record.lastWrongAt)}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="space-y-2">
            {record.question.choices.map((choice) => (
              <div
                key={choice.id}
                className={`rounded-lg p-3 text-sm ${choice.isCorrect
                  ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200'
                  }`}
              >
                {choice.text}
                {choice.isCorrect && (
                  <CheckCircle className="inline ml-2 h-4 w-4" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
            <p className="font-medium mb-1">解析</p>
            <p>{record.question.analysis}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="mt-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-green-600 transition-colors"
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            标记已掌握
          </button>
        </div>
      )}
    </div>
  );
}

interface BookmarkItemProps {
  record: BookmarkRecord;
  onRemove: () => void;
}

function BookmarkItem({ record, onRemove }: BookmarkItemProps) {
  const [expanded, setExpanded] = useState(false);
  const topic = getTopicLabel(record.topicId);

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-900 font-medium leading-relaxed line-clamp-2">
            {record.question.stem}
          </p>
          <Heart className="shrink-0 h-4 w-4 text-rose-500 fill-current" />
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {topic.title}
          </span>
          <span>·</span>
          <span>收藏于 {formatDate(record.addedAt)}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="space-y-2">
            {record.question.choices.map((choice) => (
              <div
                key={choice.id}
                className={`rounded-lg p-3 text-sm ${choice.isCorrect
                  ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200'
                  }`}
              >
                {choice.text}
                {choice.isCorrect && (
                  <CheckCircle className="inline ml-2 h-4 w-4" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
            <p className="font-medium mb-1">解析</p>
            <p>{record.question.analysis}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="mt-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            取消收藏
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Overview Cards ----

function TopicPracticeCard({
  onExpand,
}: {
  onExpand: () => void;
}) {
  const { progress } = useTopicProgress();

  const practicedTopics = ALL_TOPICS.filter((t) => progress[t]);
  const totalCorrect = Object.values(progress).reduce((sum, p) => sum + p.correctCount, 0);
  const totalAnswered = Object.values(progress).reduce((sum, p) => sum + p.totalAnswered, 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">📚 主题练习</h3>
          <p className="text-xs text-slate-500">按主题分类练习</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{practicedTopics.length}/{ALL_TOPICS.length}</p>
          <p className="text-xs text-blue-600 mt-1">已练主题</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{overallAccuracy}%</p>
          <p className="text-xs text-emerald-600 mt-1">总正确率</p>
        </div>
      </div>

      {/* 各主题进度条 */}
      <div className="space-y-2 mb-4">
        {ALL_TOPICS.map((topicId) => {
          const tp = progress[topicId];
          const total = TOPIC_TOTAL_QUESTIONS[topicId] || 0;
          const answered = tp?.totalAnswered || 0;
          const correct = tp?.correctCount || 0;
          const pct = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
          const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
          const topic = getTopicLabel(topicId);

          return (
            <div key={topicId}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{topic.titleCn}</span>
                <span className="text-slate-400">
                  {answered}/{total} 题 · {accuracy}% 正确
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Link
          href="/topics"
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          进入练习
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
        <button
          onClick={onExpand}
          className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MistakesOverviewCard({
  mistakeCount,
  repeatCount,
  onExpand,
}: {
  mistakeCount: number;
  repeatCount: number;
  onExpand: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">📝 错题本</h3>
          <p className="text-xs text-slate-500">记录薄弱环节</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-red-50 p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{mistakeCount}</p>
          <p className="text-xs text-red-600 mt-1">错题数量</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{repeatCount}</p>
          <p className="text-xs text-amber-600 mt-1">反复错误</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/exam/mistakes"
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          继续刷错题
        </Link>
        <button
          onClick={onExpand}
          className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BookmarksOverviewCard({
  bookmarkCount,
  lastBookmarkAt,
  onExpand,
}: {
  bookmarkCount: number;
  lastBookmarkAt: number | null;
  onExpand: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Star className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">⭐ 收藏</h3>
          <p className="text-xs text-slate-500">重点题目标记</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{bookmarkCount}</p>
          <p className="text-xs text-amber-600 mt-1">收藏题目</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-sm font-bold text-slate-700 mt-1">
            {lastBookmarkAt ? formatDate(lastBookmarkAt) : '暂无'}
          </p>
          <p className="text-xs text-slate-500 mt-1">最近收藏</p>
        </div>
      </div>

      <button
        onClick={onExpand}
        className="w-full inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
      >
        查看收藏
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </button>
    </div>
  );
}

// ---- Main Page ----

export default function ProgressPage() {
  const router = useRouter();
  const [activeSubPage, setActiveSubPage] = useState<SubPage>('overview');
  const [mounted, setMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState<MistakeQuestionKind>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [minWrongCount, setMinWrongCount] = useState<WrongCountFilter>(1);
  const [showMistakeFilters, setShowMistakeFilters] = useState(true);

  const { mistakes, bookmarks, removeMistake, toggleBookmark } = useUserProgress();

  useEffect(() => {
    let active = true;

    async function verifyAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.replace('/login?next=/progress');
          return;
        }
      } catch {
        router.replace('/login?next=/progress');
        return;
      }

      if (active) {
        setAuthLoading(false);
        setMounted(true);
      }
    }

    verifyAuth();

    return () => {
      active = false;
    };
  }, [router]);

  const mistakesList = useMemo(
    () => Object.values(mistakes).sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt),
    [mistakes]
  );

  const bookmarksList = useMemo(
    () => Object.values(bookmarks).sort((a, b) => b.addedAt - a.addedAt),
    [bookmarks]
  );

  const repeatMistakeCount = useMemo(
    () => mistakesList.filter((m) => m.count >= 2).length,
    [mistakesList]
  );

  const lastBookmarkAt = useMemo(
    () => (bookmarksList.length > 0 ? bookmarksList[0].addedAt : null),
    [bookmarksList]
  );

  const topicOptions = useMemo(() => getTopicOptions(mistakesList, kindFilter), [mistakesList, kindFilter]);

  const filteredMistakes = useMemo(
    () => filterMistakes(mistakesList, { kind: kindFilter, topicId: topicFilter, minWrongCount }),
    [mistakesList, kindFilter, topicFilter, minWrongCount]
  );

  const groupedMistakes = useMemo(() => {
    const groups = new Map<string, MistakeRecord[]>();
    filteredMistakes.forEach((record) => {
      if (!groups.has(record.topicId)) {
        groups.set(record.topicId, []);
      }
      groups.get(record.topicId)?.push(record);
    });
    return Array.from(groups.entries());
  }, [filteredMistakes]);

  const handleToggleKind = (value: MistakeQuestionKind) => {
    const nextKind: MistakeQuestionKind = kindFilter === value ? 'all' : value;
    setKindFilter(nextKind);
    if (!isTopicAllowedInKind(topicFilter, nextKind)) {
      setTopicFilter('all');
    }
  };

  const handleToggleTopic = (value: string) => {
    setTopicFilter((prev) => (prev === value ? 'all' : value));
  };

  const handleToggleCount = (value: WrongCountFilter) => {
    setMinWrongCount((prev) => (prev === value ? 1 : value));
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回首页
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            学习管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">追踪练习进度，管理错题与收藏</p>
        </div>

        {/* Navigation Pills */}
        {activeSubPage !== 'overview' && (
          <button
            onClick={() => setActiveSubPage('overview')}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回概览
          </button>
        )}

        {/* Overview Cards */}
        {activeSubPage === 'overview' && (
          <div className="space-y-4">
            <TopicPracticeCard onExpand={() => setActiveSubPage('topics')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MistakesOverviewCard
                mistakeCount={mistakesList.length}
                repeatCount={repeatMistakeCount}
                onExpand={() => setActiveSubPage('mistakes')}
              />
              <BookmarksOverviewCard
                bookmarkCount={bookmarksList.length}
                lastBookmarkAt={lastBookmarkAt}
                onExpand={() => setActiveSubPage('bookmarks')}
              />
            </div>
          </div>
        )}

        {/* Topics Detail */}
        {activeSubPage === 'topics' && (
          <TopicDetailView />
        )}

        {/* Mistakes Detail */}
        {activeSubPage === 'mistakes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">📝 错题本</h2>
              <Link
                href="/exam/mistakes"
                className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                开始刷错题
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => setShowMistakeFilters((prev) => !prev)}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  {showMistakeFilters ? '收起筛选' : '展开筛选'}
                  <ChevronDown
                    className={`ml-1.5 h-3.5 w-3.5 transition-transform ${showMistakeFilters ? 'rotate-180' : ''}`}
                  />
                </button>
                <span className="text-xs text-slate-500">
                  共 {filteredMistakes.length} 道错题
                </span>
              </div>

              {showMistakeFilters && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {KIND_FILTERS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleToggleKind(item.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${kindFilter === item.value
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {topicOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topicOptions.map((topicId) => {
                        const topic = getTopicLabel(topicId);
                        return (
                          <button
                            key={topicId}
                            onClick={() => handleToggleTopic(topicId)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${topicFilter === topicId
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                          >
                            {topic.titleCn}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {COUNT_FILTERS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleToggleCount(item.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${minWrongCount === item.value
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {filteredMistakes.length > 0 ? (
                groupedMistakes.map(([topicId, records]) => {
                  const topic = getTopicLabel(topicId);
                  return (
                    <div key={topicId} className="space-y-2">
                      <div className="sticky top-0 z-[1] rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                        {topic.titleCn} · {records.length} 题
                      </div>
                      {records.map((record) => (
                        <MistakeItem
                          key={record.questionId}
                          record={record}
                          onRemove={() => removeMistake(record.questionId)}
                        />
                      ))}
                    </div>
                  );
                })
              ) : (
                <EmptyState type="mistakes" />
              )}
            </div>
          </div>
        )}

        {/* Bookmarks Detail */}
        {activeSubPage === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">⭐ 收藏题目</h2>
              <span className="text-xs text-slate-500">
                共 {bookmarksList.length} 道
              </span>
            </div>
            <div className="space-y-3">
              {bookmarksList.length > 0 ? (
                bookmarksList.map((record) => (
                  <BookmarkItem
                    key={record.questionId}
                    record={record}
                    onRemove={() => toggleBookmark(record.question, record.topicId)}
                  />
                ))
              ) : (
                <EmptyState type="bookmarks" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Topic Detail View ----

function TopicDetailView() {
  const { progress } = useTopicProgress();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 mb-2">📚 主题练习详情</h2>
      {ALL_TOPICS.map((topicId) => {
        const tp = progress[topicId];
        const total = TOPIC_TOTAL_QUESTIONS[topicId] || 0;
        const answered = tp?.totalAnswered || 0;
        const correct = tp?.correctCount || 0;
        const wrong = answered - correct;
        const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
        const coverage = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
        const topic = getTopicLabel(topicId);
        const lastPractice = tp?.lastPracticeAt;

        return (
          <div key={topicId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900">{topic.titleCn}</h3>
                <p className="text-xs text-slate-400">{topic.title}</p>
              </div>
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                练习
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>完成进度</span>
                <span>{coverage}% ({answered}/{total})</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${coverage}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
                <p className="text-lg font-bold text-emerald-700">{accuracy}%</p>
                <p className="text-[10px] text-emerald-600">正确率</p>
              </div>
              <div className="rounded-xl bg-green-50 p-2.5 text-center">
                <p className="text-lg font-bold text-green-700">{correct}</p>
                <p className="text-[10px] text-green-600">答对</p>
              </div>
              <div className="rounded-xl bg-red-50 p-2.5 text-center">
                <p className="text-lg font-bold text-red-700">{wrong}</p>
                <p className="text-[10px] text-red-600">答错</p>
              </div>
            </div>

            {lastPractice && (
              <p className="text-[11px] text-slate-400 mt-2">
                最近练习: {formatDate(lastPractice)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Empty State ----

function EmptyState({ type }: { type: 'mistakes' | 'bookmarks' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={`rounded-full p-4 ${type === 'mistakes' ? 'bg-green-100' : 'bg-slate-100'}`}>
        {type === 'mistakes' ? (
          <CheckCircle className="h-8 w-8 text-green-600" />
        ) : (
          <Heart className="h-8 w-8 text-slate-400" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {type === 'mistakes' ? '太棒了！' : '暂无收藏'}
      </h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">
        {type === 'mistakes'
          ? '当前筛选条件下没有错题，调整筛选试试。'
          : '点击题目卡片右上角的 ❤️ 收藏题目，方便复习。'}
      </p>
    </div>
  );
}
