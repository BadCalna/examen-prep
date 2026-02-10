'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types/quiz';
import { CheckCircle2, XCircle } from 'lucide-react';
import BookmarkButton from '@/components/quiz/BookmarkButton';
import { useUserProgress } from '@/hooks/useUserProgress';

interface TopicQuizCardProps {
  question: Question;
  userAnswer: string | null;
  onAnswer: (choiceId: string) => void;
  topicId: string;
  showTranslation?: boolean;
}

const zhFadeVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 4 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
};

export default function TopicQuizCard({ question, userAnswer, onAnswer, topicId, showTranslation = false }: TopicQuizCardProps) {
  const isAnswered = userAnswer !== null;
  const { isBookmarked, toggleBookmark } = useUserProgress();
  const bookmarked = isBookmarked(question.id);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        key={question.id}
        className="relative rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8"
      >
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <BookmarkButton
            isActive={bookmarked}
            onClick={() => toggleBookmark(question, topicId)}
          />
        </div>
        <h2 className="text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl pr-12">
          {question.stem}
        </h2>

        {/* 中文题干翻译 */}
        <AnimatePresence>
          {showTranslation && question.stemZh && (
            <motion.p
              key="stem-zh"
              variants={zhFadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="text-sm leading-relaxed text-blue-500/80 pr-12"
            >
              {question.stemZh}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-8 space-y-3">
          {question.choices.map((choice) => {
            const isSelected = userAnswer === choice.id;
            const isCorrect = choice.isCorrect;

            let buttonStyle = "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700";

            if (isAnswered) {
              if (isSelected && isCorrect) {
                buttonStyle = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
              } else if (isSelected && !isCorrect) {
                buttonStyle = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
              } else if (!isSelected && isCorrect) {
                buttonStyle = "border-green-200 bg-green-50/50 text-green-700";
              } else {
                buttonStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={choice.id}
                onClick={() => !isAnswered && onAnswer(choice.id)}
                disabled={isAnswered}
                className={`group relative flex w-full flex-col rounded-xl border p-4 text-left text-base font-medium transition-all ${buttonStyle}`}
              >
                <div className="flex w-full items-center">
                  <span className="flex-1">{choice.text}</span>
                  {isAnswered && isSelected && isCorrect && (
                    <CheckCircle2 className="ml-3 h-5 w-5 shrink-0 text-green-600" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="ml-3 h-5 w-5 shrink-0 text-red-600" />
                  )}
                </div>

                {/* 中文选项翻译 */}
                <AnimatePresence>
                  {showTranslation && choice.textZh && (
                    <motion.span
                      key={`choice-zh-${choice.id}`}
                      variants={zhFadeVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-xs text-slate-400"
                    >
                      {choice.textZh}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 overflow-hidden rounded-2xl bg-slate-50 p-6 text-slate-600"
            >
              <h3 className="mb-2 font-semibold text-slate-900">Analyse</h3>
              <p>{question.analysis}</p>

              {/* 中文解析 */}
              <AnimatePresence>
                {showTranslation && question.analysisZh && (
                  <motion.div
                    key="analysis-zh"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 pt-4 border-t border-slate-200"
                  >
                    <p className="text-sm text-blue-500/80 leading-relaxed">
                      {question.analysisZh}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
