"use client";

import { useState, useEffect } from "react";
import { FileQuestion, Upload, Download, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

interface CategoryStats {
    name: string;
    count: number;
    categoryId: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<CategoryStats[]>([]);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            setStats(data.categories || []);
            setTotalQuestions(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { href: "/admin/import", label: "导入题库", icon: <Upload size={24} />, color: "from-green-500 to-emerald-500" },
        { href: "/admin/questions", label: "管理题目", icon: <FileQuestion size={24} />, color: "from-blue-500 to-cyan-500" },
        { href: "/admin/users", label: "管理用户", icon: <Users size={24} />, color: "from-amber-500 to-orange-500" },
        { href: "/admin/export", label: "导出数据", icon: <Download size={24} />, color: "from-purple-500 to-pink-500" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">管理后台概览</h1>
                <p className="text-slate-400 mt-2">管理和维护您的题库数据</p>
            </div>

            {/* Total Stats */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-blue-500/20">
                        <TrendingUp size={32} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">题库总数</p>
                        <p className="text-4xl font-bold text-white">
                            {loading ? "..." : totalQuestions}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">快捷操作</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <h3 className="text-lg font-medium text-white">{action.label}</h3>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Category Stats */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">分类统计</h2>
                {loading ? (
                    <div className="text-slate-400">加载中...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.map((category, index) => (
                            <div
                                key={category.categoryId}
                                className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">分类 {index + 1}</span>
                                    <span className="text-2xl font-bold text-white">{category.count}</span>
                                </div>
                                <p className="text-white mt-2 font-medium truncate" title={category.name}>
                                    {category.name}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
