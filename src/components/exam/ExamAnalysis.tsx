'use client';

import { useState } from 'react';
import { ExamResult, WrongQuestion } from '@/hooks/useExam';
import { ArrowLeft, Clock, Target, CheckCircle, ChevronDown, ChevronUp, Tag } from 'lucide-react';

interface ExamAnalysisProps {
    result: ExamResult;
    onBack: () => void;
}

// Topic name mapping
const TOPIC_NAMES: Record<string, { title: string; titleCn: string }> = {
    'values': { title: 'Principes et valeurs', titleCn: '原则与价值观' },
    'institutions': { title: 'Système institutionnel', titleCn: '制度体系' },
    'rights': { title: 'Droits et devoirs', titleCn: '权利与义务' },
    'history': { title: 'Histoire et culture', titleCn: '历史与文化' },
    'society': { title: 'Société française', titleCn: '法国社会' },
    'situation': { title: 'Situations pratiques', titleCn: '情景题' },
};

function getTopicLabel(topicId: string): { title: string; titleCn: string } {
    return TOPIC_NAMES[topicId] || { title: topicId, titleCn: topicId };
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}秒`;
    if (secs === 0) return `${mins}分钟`;
    return `${mins}分${secs}秒`;
}

interface WrongQuestionItemProps {
    item: WrongQuestion;
    index: number;
}

function WrongQuestionItem({ item, index }: WrongQuestionItemProps) {
    const [expanded, setExpanded] = useState(false);
    const topic = getTopicLabel(item.topicId);
    const correctChoice = item.question.choices.find(c => c.isCorrect);
    const userChoice = item.question.choices.find(c => c.id === item.userAnswer);

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                            {index + 1}
                        </span>
                        <p className="text-slate-900 font-medium leading-relaxed line-clamp-2">
                            {item.question.stem}
                        </p>
                    </div>
                    {expanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    )}
                </div>
                <div className="mt-2 ml-9 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Tag className="h-3 w-3" />
                        {topic.titleCn}
                    </span>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                    {/* User's wrong answer */}
                    {userChoice && (
                        <div className="rounded-lg p-3 bg-red-50 text-red-800 ring-1 ring-red-200">
                            <p className="text-xs font-medium text-red-600 mb-1">Votre réponse</p>
                            <p className="text-sm">{userChoice.text}</p>
                        </div>
                    )}

                    {!userChoice && item.userAnswer === '' && (
                        <div className="rounded-lg p-3 bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-1">Votre réponse</p>
                            <p className="text-sm italic">Aucune réponse</p>
                        </div>
                    )}

                    {/* Correct answer */}
                    {correctChoice && (
                        <div className="rounded-lg p-3 bg-green-50 text-green-800 ring-1 ring-green-200">
                            <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Bonne réponse
                            </p>
                            <p className="text-sm">{correctChoice.text}</p>
                        </div>
                    )}

                    {/* Analysis */}
                    {item.question.analysis && (
                        <div className="rounded-lg p-3 bg-blue-50 text-blue-800">
                            <p className="text-xs font-medium text-blue-600 mb-1">Analyse</p>
                            <p className="text-sm">{item.question.analysis}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ExamAnalysis({ result, onBack }: ExamAnalysisProps) {
    const percentage = Math.round((result.score / result.total) * 100);

    // Group wrong questions by topic
    const wrongByTopic: Record<string, WrongQuestion[]> = {};
    for (const wrong of result.wrongQuestions) {
        if (!wrongByTopic[wrong.topicId]) {
            wrongByTopic[wrong.topicId] = [];
        }
        wrongByTopic[wrong.topicId].push(wrong);
    }

    // Get topic scores (excluding situation)
    const topicScoreEntries = Object.entries(result.topicScores)
        .filter(([topicId]) => topicId !== 'situation');

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-2xl px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        返回结果
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">详细分析</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                            <Clock className="h-4 w-4" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">{formatDuration(result.duration)}</p>
                        <p className="text-xs text-slate-500">用时</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                            <Target className="h-4 w-4" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">{percentage}%</p>
                        <p className="text-xs text-slate-500">正确率</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 text-center">
                        <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                            <span className="text-sm">✗</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{result.wrongQuestions.length}</p>
                        <p className="text-xs text-slate-500">错题数</p>
                    </div>
                </div>

                {/* Topic Scores */}
                {topicScoreEntries.length > 0 && (
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 mb-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-3">各主题得分</h2>
                        <div className="space-y-3">
                            {topicScoreEntries.map(([topicId, score]) => {
                                const topic = getTopicLabel(topicId);
                                const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                                return (
                                    <div key={topicId}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-600">{topic.titleCn}</span>
                                            <span className="font-medium text-slate-900">{score.correct}/{score.total}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full transition-all duration-500 ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Wrong Questions */}
                {result.wrongQuestions.length > 0 ? (
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">
                            错题列表 ({result.wrongQuestions.length})
                        </h2>
                        <div className="space-y-3">
                            {result.wrongQuestions.map((item, index) => (
                                <WrongQuestionItem key={item.question.id} item={item} index={index} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">完美！</h3>
                        <p className="text-slate-500">你答对了所有题目</p>
                    </div>
                )}
            </div>
        </div>
    );
}
