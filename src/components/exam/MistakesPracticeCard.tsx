'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Filter,
  Zap,
  Shuffle,
} from 'lucide-react';
import BookmarkButton from '@/components/quiz/BookmarkButton';
import { useUserProgress } from '@/hooks/useUserProgress';
import {
  buildPracticeQueue,
  filterMistakes,
  isSituationTopic,
  MistakeQuestionKind,
  PracticeMode,
} from '@/lib/mistakeFilters';

type WrongCountFilter = 1 | 2 | 3 | 5;

const TOPIC_CN: Record<string, string> = {
  values: '原则与价值观',
  institutions: '制度体系',
  rights: '权利与义务',
  history: '历史与文化',
  society: '法国社会',
  'daily-practice': '每日练习',
  situation: '情景题',
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

const MODES: Array<{ value: PracticeMode; label: string; description: string }> = [
  { value: 'review', label: '复习模式', description: '随机顺序复习错题，可点击打乱重排' },
  { value: 'sprint', label: '冲刺模式', description: '高频错题加权重复，答错会再次出现' },
];

function getTopicOptions(topicIds: string[], kind: MistakeQuestionKind): string[] {
  return Array.from(new Set(topicIds.filter((topicId) => {
    if (kind === 'choice') return !isSituationTopic(topicId);
    if (kind === 'situation') return isSituationTopic(topicId);
    return true;
  })));
}

function isTopicAllowedInKind(topicId: string, kind: MistakeQuestionKind): boolean {
  if (topicId === 'all') return true;
  if (kind === 'all') return true;
  if (kind === 'choice') return !isSituationTopic(topicId);
  return isSituationTopic(topicId);
}

export default function MistakesPracticeCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [kindFilter, setKindFilter] = useState<MistakeQuestionKind>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [minWrongCount, setMinWrongCount] = useState<WrongCountFilter>(1);
  const [mode, setMode] = useState<PracticeMode>('review');
  const [showFilters, setShowFilters] = useState(true);
  const [extraQueue, setExtraQueue] = useState<string[]>([]);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);

  const { mistakes, isBookmarked, toggleBookmark, removeMistake } = useUserProgress();

  const sortedMistakes = useMemo(
    () => Object.values(mistakes).sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt),
    [mistakes]
  );

  const topicOptions = useMemo(
    () => getTopicOptions(sortedMistakes.map((record) => record.topicId), kindFilter),
    [sortedMistakes, kindFilter]
  );

  const filteredRecords = useMemo(
    () => filterMistakes(sortedMistakes, { kind: kindFilter, topicId: topicFilter, minWrongCount }),
    [sortedMistakes, kindFilter, topicFilter, minWrongCount]
  );

  const filteredMap = useMemo(() => {
    const map = new Map<string, (typeof filteredRecords)[number]>();
    filteredRecords.forEach((record) => map.set(record.questionId, record));
    return map;
  }, [filteredRecords]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseQueue = useMemo(() => buildPracticeQueue(filteredRecords, mode), [filteredRecords, mode, shuffleKey]);

  const replayQueue = useMemo(() => {
    return extraQueue
      .map((questionId) => filteredMap.get(questionId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [extraQueue, filteredMap]);

  const queue = useMemo(() => [...baseQueue, ...replayQueue], [baseQueue, replayQueue]);
  const hasRecords = filteredRecords.length > 0;

  const safeIndex = queue.length > 0 ? currentIndex % queue.length : 0;
  const currentRecord = hasRecords ? queue[safeIndex] : null;
  const currentQuestion = currentRecord?.question ?? null;

  const resetSession = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setShowAnswer(false);
    setExtraQueue([]);
    setSessionAnswered(0);
    setSessionCorrect(0);
  };

  const handleReshuffle = () => {
    setShuffleKey((prev) => prev + 1);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setShowAnswer(false);
  };

  const handleChangeKind = (nextKind: MistakeQuestionKind) => {
    const finalKind = kindFilter === nextKind ? 'all' : nextKind;
    setKindFilter(finalKind);
    if (!isTopicAllowedInKind(topicFilter, finalKind)) {
      setTopicFilter('all');
    }
    resetSession();
  };

  const handleChangeTopic = (nextTopic: string) => {
    setTopicFilter((prev) => (prev === nextTopic ? 'all' : nextTopic));
    resetSession();
  };

  const handleChangeMinWrongCount = (nextValue: WrongCountFilter) => {
    setMinWrongCount((prev) => (prev === nextValue ? 1 : nextValue));
    resetSession();
  };

  const handleChangeMode = (nextMode: PracticeMode) => {
    setMode(nextMode);
    resetSession();
  };

  const handleSelectChoice = (choiceId: string) => {
    if (showAnswer || !currentQuestion || !currentRecord) return;

    const choice = currentQuestion.choices.find((item) => item.id === choiceId);
    const isCorrect = Boolean(choice?.isCorrect);

    setSelectedChoice(choiceId);
    setShowAnswer(true);
    setSessionAnswered((prev) => prev + 1);
    if (isCorrect) {
      setSessionCorrect((prev) => prev + 1);
    } else if (mode === 'sprint') {
      setExtraQueue((prev) => [...prev, currentRecord.questionId]);
    }
  };

  const handleNext = () => {
    if (queue.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % queue.length);
    setSelectedChoice(null);
    setShowAnswer(false);
  };

  const handleMarkMastered = () => {
    if (!currentRecord || !currentQuestion) return;
    removeMistake(currentQuestion.id);
    setExtraQueue((prev) => prev.filter((questionId) => questionId !== currentRecord.questionId));

    setSelectedChoice(null);
    setShowAnswer(false);
    setCurrentIndex(0);
  };

  const bookmarked = currentQuestion ? isBookmarked(currentQuestion.id) : false;
  const accuracy = sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-medium text-slate-700">练习模式</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map((item) => (
            <button
              key={item.value}
              onClick={() => handleChangeMode(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${mode === item.value
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              title={item.description}
            >
              {item.value === 'sprint' && <Zap className="mr-1 inline h-3.5 w-3.5" />}
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {MODES.find((item) => item.value === mode)?.description}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            {showFilters ? '收起筛选' : '展开筛选'}
            <ChevronDown
              className={`ml-1.5 h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
          <div className="text-xs text-slate-500">
            本轮作答 {sessionAnswered} 题 · 正确率 {accuracy}%
          </div>
        </div>

        {showFilters && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {KIND_FILTERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleChangeKind(item.value)}
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
                {topicOptions.map((topicId) => (
                  <button
                    key={topicId}
                    onClick={() => handleChangeTopic(topicId)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${topicFilter === topicId
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {TOPIC_CN[topicId] || topicId}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {COUNT_FILTERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleChangeMinWrongCount(item.value)}
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

      {hasRecords && currentRecord && currentQuestion ? (
        <div className="relative rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="absolute right-4 top-4">
            <BookmarkButton
              isActive={bookmarked}
              onClick={() => toggleBookmark(currentQuestion, currentRecord.topicId)}
            />
          </div>

          <div className="pr-12">
            <span className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
              {mode === 'sprint' ? '错题冲刺' : '错题本复习'}
            </span>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-sm text-slate-500">
                第 {safeIndex + 1} / {queue.length} 题 · 累计错 {currentRecord.count} 次
              </p>
              <button
                onClick={handleReshuffle}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                title="打乱题序"
                type="button"
              >
                <Shuffle className="mr-1 h-3 w-3" />
                打乱
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentQuestion.id}-${safeIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p className="mt-6 text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
                {currentQuestion.stem}
              </p>

              <div className="mt-6 space-y-3">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = selectedChoice === choice.id;
                  const isCorrect = choice.isCorrect;

                  let buttonStyle = 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700';

                  if (showAnswer) {
                    if (isSelected && isCorrect) {
                      buttonStyle = 'border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500';
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = 'border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500';
                    } else if (!isSelected && isCorrect) {
                      buttonStyle = 'border-green-200 bg-green-50/50 text-green-700';
                    } else {
                      buttonStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice.id)}
                      disabled={showAnswer}
                      className={`group relative flex w-full items-center rounded-xl border p-4 text-left text-base font-medium transition-all ${buttonStyle}`}
                    >
                      <span className="flex-1">{choice.text}</span>
                      {showAnswer && isSelected && isCorrect && (
                        <CheckCircle2 className="ml-3 h-5 w-5 text-green-600" />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <XCircle className="ml-3 h-5 w-5 text-red-600" />
                      )}
                      {showAnswer && !isSelected && isCorrect && (
                        <CheckCircle2 className="ml-3 h-5 w-5 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showAnswer && currentQuestion.analysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden rounded-2xl bg-blue-50 p-4 text-blue-800"
                  >
                    <h3 className="mb-2 font-semibold">解析</h3>
                    <p className="text-sm">{currentQuestion.analysis}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {showAnswer && (
              <>
                <button
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={handleMarkMastered}
                  type="button"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  标记已掌握
                </button>
                <button
                  className="inline-flex items-center rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white transition hover:bg-slate-800 active:scale-95"
                  onClick={handleNext}
                  type="button"
                >
                  下一题
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </>
            )}
            {!showAnswer && <p className="text-sm text-slate-500">请选择一个选项作答</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center text-emerald-900">
          <h2 className="text-2xl font-bold">当前筛选下暂无错题</h2>
          <p className="mt-3 text-sm text-emerald-800">可以切换筛选条件，或先去主题练习/模拟考试积累错题。</p>
        </div>
      )}
    </div>
  );
}
