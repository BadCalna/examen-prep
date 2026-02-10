"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileJson, AlertCircle, CheckCircle, X } from "lucide-react";

interface TargetCategory {
    categoryId: string;
    title: string;
    count: number;
}

interface Question {
    id: string;
    type: string;
    stem: string;
    stem_zh?: string;
    choices: unknown[];
    analysis: string;
}

interface ImportResult {
    success: boolean;
    imported?: number;
    skipped?: number;
    total?: number;
    error?: string;
    details?: string[];
}

export default function ImportPage() {
    const [targetCategories, setTargetCategories] = useState<TargetCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [importMode, setImportMode] = useState<"append" | "replace">("append");
    const [jsonContent, setJsonContent] = useState("");
    const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTargetCategories();
    }, []);

    const fetchTargetCategories = async () => {
        try {
            const res = await fetch("/api/admin/import");
            const data = await res.json();
            setTargetCategories(data.categories || []);
            if (data.categories?.length > 0) {
                setSelectedCategory(data.categories[0].categoryId);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonContent(content);
            parseJsonContent(content);
        };
        reader.readAsText(file);
    };

    const parseJsonContent = (content: string) => {
        setParseError(null);
        setPreviewQuestions([]);
        setResult(null);

        try {
            const data = JSON.parse(content);
            const questions = data.questions || (Array.isArray(data) ? data : [data]);

            if (!Array.isArray(questions) || questions.length === 0) {
                setParseError("未找到有效的题目数据。请确保 JSON 包含 questions 数组。");
                return;
            }

            // 验证题目格式
            const invalidQuestions: string[] = [];
            questions.forEach((q: Question, index: number) => {
                if (!q.id || !q.stem || !q.choices) {
                    invalidQuestions.push(`题目 ${index + 1}: 缺少必填字段 (id, stem, choices)`);
                }
            });

            if (invalidQuestions.length > 0) {
                setParseError(`部分题目格式不正确:\n${invalidQuestions.slice(0, 5).join("\n")}`);
                return;
            }

            setPreviewQuestions(questions);
        } catch {
            setParseError("JSON 解析失败，请检查格式是否正确");
        }
    };

    const handleJsonChange = (value: string) => {
        setJsonContent(value);
        if (value.trim()) {
            parseJsonContent(value);
        } else {
            setPreviewQuestions([]);
            setParseError(null);
        }
    };

    const handleImport = async () => {
        if (!selectedCategory || previewQuestions.length === 0) return;

        setImporting(true);
        setResult(null);

        try {
            const res = await fetch("/api/admin/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: { questions: previewQuestions },
                    categoryId: selectedCategory,
                    mode: importMode,
                }),
            });

            const data = await res.json();
            setResult(data);

            if (data.success) {
                // 清空表单
                setJsonContent("");
                setPreviewQuestions([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                // 刷新目标文件列表
                fetchTargetCategories();
            }
        } catch (err) {
            console.error("Import failed:", err);
            setResult({ success: false, error: "导入失败，请重试" });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">导入题库</h1>
                <p className="text-slate-400 mt-1">上传 JSON 文件或粘贴 JSON 内容导入题目</p>
            </div>

            {/* Import Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target File Selection */}
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <h3 className="text-lg font-medium text-white mb-4">目标分类</h3>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
                    >
                        {targetCategories.map((cat) => (
                            <option key={cat.categoryId} value={cat.categoryId}>
                                {cat.title} ({cat.count} 题)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Import Mode */}
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <h3 className="text-lg font-medium text-white mb-4">导入模式</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="mode"
                                value="append"
                                checked={importMode === "append"}
                                onChange={() => setImportMode("append")}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span className="text-white">追加</span>
                            <span className="text-sm text-slate-400">(跳过重复ID)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="mode"
                                value="replace"
                                checked={importMode === "replace"}
                                onChange={() => setImportMode("replace")}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span className="text-white">替换</span>
                            <span className="text-sm text-slate-400">(覆盖全部)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* File Upload */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-lg font-medium text-white mb-4">上传文件</h3>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                    <p className="text-slate-400">点击选择 JSON 文件，或拖拽至此</p>
                    <p className="text-sm text-slate-500 mt-1">支持 .json 格式</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* JSON Input */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-lg font-medium text-white mb-4">或粘贴 JSON 内容</h3>
                <textarea
                    value={jsonContent}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder='{"questions": [{"id": "...", "stem": "...", "choices": [...]}]}'
                    rows={10}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-y"
                />
            </div>

            {/* Parse Error */}
            {parseError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                    <pre className="text-red-400 text-sm whitespace-pre-wrap">{parseError}</pre>
                </div>
            )}

            {/* Preview */}
            {previewQuestions.length > 0 && (
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            <FileJson size={20} className="text-blue-400" />
                            预览 ({previewQuestions.length} 道题目)
                        </h3>
                        <button
                            onClick={() => {
                                setJsonContent("");
                                setPreviewQuestions([]);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {previewQuestions.slice(0, 10).map((q, i) => (
                            <div key={q.id || i} className="p-3 rounded-lg bg-slate-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{q.id}</span>
                                </div>
                                <p className="text-white text-sm line-clamp-1">{q.stem}</p>
                            </div>
                        ))}
                        {previewQuestions.length > 10 && (
                            <p className="text-slate-400 text-sm text-center py-2">
                                ... 还有 {previewQuestions.length - 10} 道题目
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Import Button */}
            <button
                onClick={handleImport}
                disabled={importing || previewQuestions.length === 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
                {importing ? "导入中..." : `导入 ${previewQuestions.length} 道题目`}
            </button>

            {/* Result */}
            {result && (
                <div
                    className={`p-4 rounded-xl flex items-start gap-3 ${result.success
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                        }`}
                >
                    {result.success ? (
                        <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                    ) : (
                        <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                    )}
                    <div>
                        {result.success ? (
                            <p className="text-green-400">
                                导入成功！新增 {result.imported} 道题目
                                {result.skipped ? `，跳过 ${result.skipped} 道重复题目` : ""}
                                ，总计 {result.total} 道
                            </p>
                        ) : (
                            <>
                                <p className="text-red-400">{result.error}</p>
                                {result.details && (
                                    <ul className="text-red-400 text-sm mt-2">
                                        {result.details.slice(0, 5).map((d, i) => (
                                            <li key={i}>{d}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
