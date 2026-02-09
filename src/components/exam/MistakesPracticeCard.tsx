'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import BookmarkButton from '@/components/quiz/BookmarkButton';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function MistakesPracticeCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const {
    mistakes,
    isBookmarked,
    toggleBookmark,
    removeMistake,
  } = useUserProgress();

  const mistakeList = useMemo(
    () => Object.values(mistakes).sort((a, b) => b.lastWrongAt - a.lastWrongAt),
    [mistakes]
  );

  if (mistakeList.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center text-emerald-900">
        <h2 className="text-2xl font-bold">错题本为空</h2>
        <p className="mt-3 text-sm text-emerald-800">当前没有可刷的错题。先去主题练习或模拟考试累积错题。</p>
      </div>
    );
  }

  const safeIndex = currentIndex % mistakeList.length;
  const currentRecord = mistakeList[safeIndex];
  const currentQuestion = currentRecord.question;
  const bookmarked = isBookmarked(currentQuestion.id);

  const handleSelectChoice = (choiceId: string) => {
    if (showAnswer) return;
    setSelectedChoice(choiceId);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mistakeList.length);
    setSelectedChoice(null);
    setShowAnswer(false);
  };

  const handleMarkMastered = () => {
    removeMistake(currentQuestion.id);
    setSelectedChoice(null);
    setShowAnswer(false);
    setCurrentIndex(0);
  };

  return (
    <div className="relative rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="absolute right-4 top-4">
        <BookmarkButton
          isActive={bookmarked}
          onClick={() => toggleBookmark(currentQuestion, currentRecord.topicId)}
        />
      </div>

      <div className="pr-12">
        <span className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
          错题本练习
        </span>
        <p className="mt-3 text-sm text-slate-500">
          第 {safeIndex + 1} / {mistakeList.length} 题 · 累计错 {currentRecord.count} 次
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentQuestion.id}-${currentRecord.lastWrongAt}`}
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
  );
}
