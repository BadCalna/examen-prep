"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Trash2, Eye } from "lucide-react";

interface Question {
    id: string;
    type: string;
    stem: string;
    stem_zh?: string;
    choices: { id: string; text: string; text_zh?: string; isCorrect: boolean }[];
    analysis: string;
    analysis_zh?: string;
    difficulty?: number;
    tags?: string[];
    _file: string;
    _category: string;
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(search && { search }),
            });
            const res = await fetch(`/api/admin/questions?${params}`);
            const data = await res.json();
            setQuestions(data.questions || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch questions:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchQuestions();
    };

    const handleDelete = async (question: Question) => {
        if (!confirm(`确定要删除题目 "${question.id}" 吗？此操作不可撤销。`)) {
            return;
        }

        setDeleting(question.id);
        try {
            const res = await fetch("/api/admin/questions", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId: question.id, targetFile: question._file }),
            });

            if (res.ok) {
                fetchQuestions();
            } else {
                const data = await res.json();
                alert(`删除失败: ${data.error}`);
            }
        } catch (err) {
            console.error("Failed to delete:", err);
            alert("删除失败");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">题目管理</h1>
                    <p className="text-slate-400 mt-1">共 {total} 道题目</p>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="搜索题目ID、题干..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                >
                    搜索
                </button>
            </form>

            {/* Question List */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">加载中...</div>
                ) : questions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">没有找到题目</div>
                ) : (
                    <div className="divide-y divide-slate-700/50">
                        {questions.map((q) => (
                            <div
                                key={q.id}
                                className="p-4 hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
                                                {q.id}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs rounded bg-slate-600/50 text-slate-300">
                                                {q._category}
                                            </span>
                                            {q.difficulty && (
                                                <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400">
                                                    难度 {q.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white line-clamp-2">{q.stem}</p>
                                        {q.stem_zh && (
                                            <p className="text-slate-400 text-sm mt-1 line-clamp-1">{q.stem_zh}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedQuestion(q)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                                            title="查看详情"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q)}
                                            disabled={deleting === q.id}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            title="删除"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-slate-400">
                        第 {page} / {totalPages} 页
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Question Detail Modal */}
            {selectedQuestion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">{selectedQuestion.id}</h3>
                            <button
                                onClick={() => setSelectedQuestion(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm text-slate-400 mb-1">题干 (法语)</h4>
                                <p className="text-white">{selectedQuestion.stem}</p>
                            </div>

                            {selectedQuestion.stem_zh && (
                                <div>
                                    <h4 className="text-sm text-slate-400 mb-1">题干 (中文)</h4>
                                    <p className="text-white">{selectedQuestion.stem_zh}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm text-slate-400 mb-2">选项</h4>
                                <div className="space-y-2">
                                    {selectedQuestion.choices.map((c) => (
                                        <div
                                            key={c.id}
                                            className={`p-3 rounded-lg ${c.isCorrect
                                                    ? "bg-green-500/20 border border-green-500/30"
                                                    : "bg-slate-700/50"
                                                }`}
                                        >
                                            <p className="text-white">{c.text}</p>
                                            {c.text_zh && <p className="text-slate-400 text-sm">{c.text_zh}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm text-slate-400 mb-1">解析</h4>
                                <p className="text-white">{selectedQuestion.analysis}</p>
                                {selectedQuestion.analysis_zh && (
                                    <p className="text-slate-400 mt-1">{selectedQuestion.analysis_zh}</p>
                                )}
                            </div>

                            {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                                <div>
                                    <h4 className="text-sm text-slate-400 mb-1">标签</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedQuestion.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs rounded bg-slate-600 text-slate-300"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
