"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileQuestion,
    Upload,
    Download,
    ArrowLeft,
    Users,
} from "lucide-react";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { href: "/admin", label: "概览", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/questions", label: "题目管理", icon: <FileQuestion size={20} /> },
    { href: "/admin/users", label: "用户管理", icon: <Users size={20} /> },
    { href: "/admin/import", label: "导入题库", icon: <Upload size={20} /> },
    { href: "/admin/export", label: "导出数据", icon: <Download size={20} /> },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        题库管理后台
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Examen Civique Prep</p>
                </div>

                <nav className="px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-6 left-4 right-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">返回前台</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
