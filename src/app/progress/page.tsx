'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useUserProgress, MistakeRecord, BookmarkRecord } from '@/hooks/useUserProgress';
import {
  filterMistakes,
  isSituationTopic,
  MistakeQuestionKind,
} from '@/lib/mistakeFilters';

type TabType = 'mistakes' | 'bookmarks';

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

function EmptyState({ type }: { type: TabType }) {
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

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<TabType>('mistakes');
  const [mounted, setMounted] = useState(false);
  const [kindFilter, setKindFilter] = useState<MistakeQuestionKind>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [minWrongCount, setMinWrongCount] = useState<WrongCountFilter>(1);
  const [showMistakeFilters, setShowMistakeFilters] = useState(true);

  const { mistakes, bookmarks, removeMistake, toggleBookmark } = useUserProgress();

  useEffect(() => {
    setMounted(true);
  }, []);

  const mistakesList = useMemo(
    () => Object.values(mistakes).sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt),
    [mistakes]
  );

  const bookmarksList = useMemo(
    () => Object.values(bookmarks).sort((a, b) => b.addedAt - a.addedAt),
    [bookmarks]
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

  const tabs = [
    { id: 'mistakes' as TabType, label: '错题本', count: mistakesList.length, icon: AlertCircle },
    { id: 'bookmarks' as TabType, label: '我的收藏', count: bookmarksList.length, icon: Heart },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回首页
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            学习进度
          </h1>
        </div>

        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all
                ${activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs
                  ${activeTab === tab.id
                    ? tab.id === 'mistakes' ? 'bg-red-100 text-red-700' : 'bg-rose-100 text-rose-700'
                    : 'bg-slate-300 text-slate-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'mistakes' && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              </div>
              <Link
                href="/exam/mistakes"
                className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                开始刷错题
              </Link>
            </div>

            {showMistakeFilters && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {KIND_FILTERS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleToggleKind(item.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        kindFilter === item.value
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
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            topicFilter === topicId
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
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        minWrongCount === item.value
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
        )}

        <div className="space-y-3">
          {activeTab === 'mistakes' && (
            filteredMistakes.length > 0 ? (
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
            )
          )}

          {activeTab === 'bookmarks' && (
            bookmarksList.length > 0 ? (
              bookmarksList.map((record) => (
                <BookmarkItem
                  key={record.questionId}
                  record={record}
                  onRemove={() => toggleBookmark(record.question, record.topicId)}
                />
              ))
            ) : (
              <EmptyState type="bookmarks" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
