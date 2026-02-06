'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Play,
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import useExam from '@/hooks/useExam';
import ExamCard from '@/components/exam/ExamCard';
import ExamTimer from '@/components/exam/ExamTimer';
import ExamResultView from '@/components/exam/ExamResult';
import ExamAnalysis from '@/components/exam/ExamAnalysis';

type ViewMode = 'exam' | 'result' | 'analysis';

export default function ExamPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('exam');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const {
    status,
    questions,
    currentQuestion,
    currentIndex,
    userAnswers,
    timeRemaining,
    result,
    error,
    answeredCount,
    totalQuestions,
    startExam,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    finishExam,
    resetExam,
  } = useExam();

  // Handle view transitions
  const handleViewAnalysis = () => setViewMode('analysis');
  const handleBackToResult = () => setViewMode('result');
  const handleReturnHome = () => {
    resetExam();
    setViewMode('exam');
  };

  // Handle submit with confirmation
  const handleSubmitClick = () => {
    if (answeredCount < totalQuestions) {
      setShowSubmitConfirm(true);
    } else {
      finishExam();
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    finishExam();
  };

  // Show analysis view
  if (viewMode === 'analysis' && result) {
    return <ExamAnalysis result={result} onBack={handleBackToResult} />;
  }

  // Show result view
  if (status === 'finished' && result && viewMode !== 'analysis') {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <ExamResultView
          result={result}
          onViewAnalysis={handleViewAnalysis}
          onReturnHome={handleReturnHome}
        />
      </div>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p>Chargement de l&apos;examen...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6">
        <div className="rounded-2xl bg-red-50 p-8 text-center text-red-800 max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur</h3>
          <p>{error}</p>
        </div>
        <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
          <ChevronLeft className="mr-1 h-4 w-4" /> Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  // Exam in progress
  if (status === 'inProgress' && currentQuestion) {
    const currentAnswer = userAnswers[currentQuestion.id] || null;
    const progressPercentage = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

    return (
      <div className="min-h-screen bg-slate-50 notranslate" translate="no" lang="fr">
        {/* Confirm submit modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirmation</h3>
              <p className="text-slate-600 mb-4">
                Vous n&apos;avez répondu qu&apos;à {answeredCount} questions sur {totalQuestions}.
                <br />
                <span className="text-sm text-slate-500">
                  （您只完成了 {answeredCount}/{totalQuestions} 题，确定提交吗？）
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  Soumettre
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header with timer */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <ExamTimer timeRemaining={timeRemaining} />

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                {answeredCount} / {totalQuestions} répondu(s)
              </span>
              <button
                onClick={handleSubmitClick}
                className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Soumettre
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question area */}
        <div className="mx-auto max-w-3xl px-4 py-8">
          <AnimatePresence mode="wait">
            <ExamCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              selectedAnswer={currentAnswer}
              onSelectAnswer={(choiceId) => selectAnswer(currentQuestion.id, choiceId)}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              Précédent
            </button>

            <button
              onClick={nextQuestion}
              disabled={currentIndex >= totalQuestions - 1}
              className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </div>

          {/* Question navigator */}
          <div className="mt-8">
            <details className="group">
              <summary className="flex items-center justify-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                <span>Navigation rapide</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {questions.map((q, i) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isCurrent = i === currentIndex;

                  return (
                    <button
                      key={`${i}-${q.id}`}
                      onClick={() => goToQuestion(i)}
                      className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${isCurrent
                        ? 'bg-blue-600 text-white'
                        : isAnswered
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Idle state - Start page
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-6">
      <div className="max-w-lg text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <FileText className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Examen Civique
        </h1>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 text-left mb-8">
          <h2 className="font-semibold text-slate-900 mb-4">Règles de l&apos;examen :</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
              <span><strong>40 questions</strong> : 28 questions de culture générale + 12 situations pratiques</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
              <span><strong>45 minutes</strong> pour compléter l&apos;examen</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
              <span>Vous pouvez <strong>modifier vos réponses</strong> avant de soumettre</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">!</span>
              <span>L&apos;examen sera <strong>soumis automatiquement</strong> à la fin du temps</span>
            </li>
          </ul>
        </div>

        <button
          onClick={startExam}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl active:scale-95"
        >
          <Play className="h-6 w-6" />
          Commencer l&apos;examen
        </button>
      </div>

      <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
        <ChevronLeft className="mr-1 h-4 w-4" /> Retour à l&apos;accueil
      </Link>
    </div>
  );
}
