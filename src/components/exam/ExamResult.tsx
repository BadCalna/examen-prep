'use client';

import { ExamResult } from '@/hooks/useExam';
import CircularProgress from '@/components/CircularProgress';
import { Clock, Target, FileText, BarChart3 } from 'lucide-react';

interface ExamResultProps {
    result: ExamResult;
    onViewAnalysis: () => void;
    onReturnHome: () => void;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} secondes`;
    if (secs === 0) return `${mins} minutes`;
    return `${mins} min ${secs} sec`;
}

export default function ExamResultView({ result, onViewAnalysis, onReturnHome }: ExamResultProps) {
    const percentage = Math.round((result.score / result.total) * 100);
    const isPassed = percentage >= 80;

    return (
        <div className="mx-auto max-w-lg text-center">
            <div className="rounded-3xl bg-white p-10 shadow-lg ring-1 ring-slate-900/5">
                <h2 className="text-2xl font-bold text-slate-900">
                    {isPassed ? '🎉 Félicitations !' : 'Examen terminé'}
                </h2>

                <div className="my-8">
                    <CircularProgress score={result.score} total={result.total} />
                    <p className="mt-6 text-lg font-medium text-slate-600">
                        {percentage}% de réussite
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {result.score} / {result.total} réponses correctes
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-medium">Durée</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                            {formatDuration(result.duration)}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-medium">Erreurs</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                            {result.wrongQuestions.length}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {result.wrongQuestions.length > 0 && (
                        <button
                            onClick={onViewAnalysis}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Analyse détaillée
                        </button>
                    )}
                    <button
                        onClick={onReturnHome}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <FileText className="mr-2 h-5 w-5" />
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );
}
