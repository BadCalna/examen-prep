'use client';

import { motion } from 'framer-motion';
import { ExamQuestion } from '@/hooks/useExam';

interface ExamCardProps {
    question: ExamQuestion;
    questionNumber: number;
    totalQuestions: number;
    selectedAnswer: string | null;
    onSelectAnswer: (choiceId: string) => void;
}

export default function ExamCard({
    question,
    questionNumber,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
}: ExamCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            key={question.id}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8"
        >
            {/* Question number badge */}
            <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    Question {questionNumber} / {totalQuestions}
                </span>
                {question.topicId === 'situation' && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Situation pratique
                    </span>
                )}
            </div>

            {/* Question stem */}
            <h2 className="text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
                {question.stem}
            </h2>

            {/* Choices */}
            <div className="mt-8 space-y-3">
                {question.choices.map((choice) => {
                    const isSelected = selectedAnswer === choice.id;

                    return (
                        <button
                            key={choice.id}
                            onClick={() => onSelectAnswer(choice.id)}
                            className={`group relative flex w-full items-center rounded-xl border p-4 text-left text-base font-medium transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            <span className="flex-1">{choice.text}</span>
                            {isSelected && (
                                <span className="ml-3 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
