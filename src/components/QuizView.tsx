"use client";

import { useState } from 'react';
import useTopicQuiz from '@/hooks/useTopicQuiz';
import TopicQuizCard from './TopicQuizCard';
import CircularProgress from './CircularProgress';
import BilingualToggle from './BilingualToggle';
import { ArrowRight, RotateCcw, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface QuizViewProps {
  slug: string;
}

export default function QuizView({ slug }: QuizViewProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const {
    questions,
    currentQuestion,
    currentIndex,
    userAnswers,
    score,
    isFinished,
    loading,
    error,
    submitAnswer,
    nextQuestion,
    restart
  } = useTopicQuiz(slug);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p>Chargement du quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-red-50 p-8 text-center text-red-800">
        <h3 className="mb-2 text-lg font-semibold">Erreur</h3>
        <p>{error}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Link>
          <Link
            href="/topics"
            className="inline-flex items-center rounded-full bg-red-100 px-6 py-2 text-sm font-semibold text-red-800 hover:bg-red-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux thèmes
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-8 rounded-3xl bg-white p-10 shadow-lg ring-1 ring-slate-900/5">
          <h2 className="text-2xl font-bold text-slate-900">Terminé !</h2>

          <div className="my-8">
            <CircularProgress score={score} total={questions.length} />
            <p className="mt-6 text-lg font-medium text-slate-600">
              {percentage}% de réussite
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={restart}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Recommencer
            </button>
            <Link
              href="/topics"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Changer de thème
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const currentAnswer = userAnswers[currentQuestion.id] || null;
  const isAnswered = currentAnswer !== null;
  const progressPercentage = Math.min(100, ((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/topics"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Link>
        <BilingualToggle
          enabled={showTranslation}
          onChange={setShowTranslation}
        />
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <TopicQuizCard
        question={currentQuestion}
        userAnswer={currentAnswer}
        onAnswer={submitAnswer}
        topicId={slug}
        showTranslation={showTranslation}
      />

      <div className="mt-8 flex justify-end h-12">
        {isAnswered && (
          <button
            onClick={nextQuestion}
            className="inline-flex items-center rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
          >
            Suivant
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
