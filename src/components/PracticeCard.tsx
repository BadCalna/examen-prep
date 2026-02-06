"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BookmarkButton from "@/components/quiz/BookmarkButton";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Question } from "@/types/quiz";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface TopicData {
  meta: {
    sectionId: string;
    sectionTitle: string;
  };
  questions: Question[];
}

const TOPIC_FILES = ['values', 'institutions', 'rights', 'history', 'society'];

export default function PracticeCard() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const { isBookmarked, toggleBookmark, addMistake } = useUserProgress();

  // Load all topic questions
  useEffect(() => {
    const loadAllQuestions = async () => {
      try {
        const allQuestionsList: Question[] = [];

        for (const topic of TOPIC_FILES) {
          try {
            const response = await fetch(`/data/topics/${topic}.json`);
            if (response.ok) {
              const data = (await response.json()) as TopicData;
              if (data.questions) {
                const questionsWithTopic = data.questions.map(q => ({
                  ...q,
                  topicId: topic
                }));
                allQuestionsList.push(...questionsWithTopic);
              }
            }
          } catch {
            // Skip failed topic
          }
        }

        if (allQuestionsList.length === 0) {
          throw new Error("无法加载题库");
        }

        // Shuffle questions
        const shuffled = [...allQuestionsList].sort(() => Math.random() - 0.5);
        setAllQuestions(shuffled);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "题库加载失败";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAllQuestions();
  }, []);

  const currentQuestion = allQuestions[index] as (Question & { topicId?: string }) | undefined;

  const bookmarked = currentQuestion ? isBookmarked(currentQuestion.id) : false;

  const handleSelectChoice = useCallback((choiceId: string) => {
    if (showAnswer || !currentQuestion) return;

    setSelectedChoice(choiceId);
    setShowAnswer(true);

    const selectedChoiceObj = currentQuestion.choices.find(c => c.id === choiceId);
    if (selectedChoiceObj && !selectedChoiceObj.isCorrect) {
      addMistake(currentQuestion, currentQuestion.topicId || 'daily-practice');
    }
  }, [showAnswer, currentQuestion, addMistake]);

  const handleNext = useCallback(() => {
    // Random next question (wrap around if at end)
    const nextIndex = (index + 1) % allQuestions.length;
    setIndex(nextIndex);
    setShowAnswer(false);
    setSelectedChoice(null);
  }, [index, allQuestions.length]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/70 p-10 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)]">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm">正在加载题库...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-red-700">
        {error}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-700">
        题库为空，请检查数据源。
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
      {/* Bookmark Button */}
      <div className="absolute top-4 right-4">
        <BookmarkButton
          isActive={bookmarked}
          onClick={() => toggleBookmark(currentQuestion, currentQuestion.topicId || 'daily-practice')}
        />
      </div>

      {/* Header */}
      <div className="pr-12">
        <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
          每日练习
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="mt-6 text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
            {currentQuestion.stem}
          </p>

          {/* Choices */}
          <div className="mt-6 space-y-3">
            {currentQuestion.choices.map((choice) => {
              const isSelected = selectedChoice === choice.id;
              const isCorrect = choice.isCorrect;

              let buttonStyle = "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700";

              if (showAnswer) {
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

          {/* Analysis */}
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

      {/* Next Button - only show after answering */}
      <div className="mt-8 flex justify-center">
        {showAnswer ? (
          <button
            className="inline-flex items-center rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white transition hover:bg-slate-800 active:scale-95"
            onClick={handleNext}
            type="button"
          >
            下一题
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        ) : (
          <p className="text-sm text-slate-400">👆 点击选项作答</p>
        )}
      </div>
    </div>
  );
}
