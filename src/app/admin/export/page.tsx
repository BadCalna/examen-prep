"use client";

import { useState, useEffect } from "react";
import { Download, FileJson, CheckCircle } from "lucide-react";

interface TargetFile {
    file: string;
    title: string;
    count: number;
}

export default function ExportPage() {
    const [targetFiles, setTargetFiles] = useState<TargetFile[]>([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);

    useEffect(() => {
        fetchTargetFiles();
    }, []);

    const fetchTargetFiles = async () => {
        try {
            const res = await fetch("/api/admin/import");
            const data = await res.json();
            setTargetFiles(data.files || []);
        } catch (err) {
            console.error("Failed to fetch target files:", err);
        }
    };

    const handleExport = async () => {
        if (!selectedFile) return;

        setExporting(true);
        try {
            // 获取题目数据
            const res = await fetch(`/api/admin/questions?category=${encodeURIComponent(selectedFile.split("-")[0])}&limit=1000`);
            const data = await res.json();

            // 创建下载
            const blob = new Blob([JSON.stringify({ questions: data.questions }, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `export_${selectedFile}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExported(true);
            setTimeout(() => setExported(false), 3000);
        } catch (err) {
            console.error("Export failed:", err);
            alert("导出失败");
        } finally {
            setExporting(false);
        }
    };

    const handleExportAll = async () => {
        setExporting(true);
        try {
            const res = await fetch("/api/admin/questions?limit=10000");
            const data = await res.json();

            const blob = new Blob([JSON.stringify({ questions: data.questions }, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "export_all_questions.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExported(true);
            setTimeout(() => setExported(false), 3000);
        } catch (err) {
            console.error("Export failed:", err);
            alert("导出失败");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">导出数据</h1>
                <p className="text-slate-400 mt-1">将题库导出为 JSON 格式</p>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export by Category */}
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-blue-500/20">
                            <FileJson className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white">按分类导出</h3>
                    </div>

                    <select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500 mb-4"
                    >
                        <option value="">选择分类...</option>
                        {targetFiles.map((f) => (
                            <option key={f.file} value={f.file}>
                                {f.title} ({f.count} 题)
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleExport}
                        disabled={!selectedFile || exporting}
                        className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        导出选中分类
                    </button>
                </div>

                {/* Export All */}
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-purple-500/20">
                            <Download className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white">导出全部</h3>
                    </div>

                    <p className="text-slate-400 mb-4">
                        将所有分类的题目合并导出为一个 JSON 文件
                    </p>

                    <button
                        onClick={handleExportAll}
                        disabled={exporting}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        导出全部题目
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {exported && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <p className="text-green-400">导出成功！文件已开始下载。</p>
                </div>
            )}

            {/* Format Info */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-lg font-medium text-white mb-4">导出格式说明</h3>
                <p className="text-slate-400 mb-4">导出的 JSON 文件结构如下：</p>
                <pre className="p-4 rounded-lg bg-slate-900 text-sm text-slate-300 overflow-x-auto">
                    {`{
  "questions": [
    {
      "id": "INS_001",
      "type": "single",
      "stem": "题干（法语）",
      "stem_zh": "题干（中文）",
      "choices": [
        { "id": "c1", "text": "...", "text_zh": "...", "isCorrect": false },
        { "id": "c2", "text": "...", "text_zh": "...", "isCorrect": true }
      ],
      "analysis": "解析（法语）",
      "analysis_zh": "解析（中文）",
      "difficulty": 2,
      "tags": ["tag1", "tag2"]
    }
  ]
}`}
                </pre>
            </div>
        </div>
    );
}
