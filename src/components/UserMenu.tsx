"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Shield, UserCog } from "lucide-react";

type UserMenuProps = {
  nickname: string;
  role: string;
};

export default function UserMenu({ nickname, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-500" aria-hidden="true">
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20a8 8 0 0 1 16 0" fill="currentColor" />
          </svg>
        </span>
        <span className="max-w-[120px] truncate">{nickname}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Shield className="h-4 w-4" />
              管理后台
            </Link>
          )}
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <UserCog className="h-4 w-4" />
            编辑资料（预留）
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "退出中..." : "退出登录"}
          </button>
        </div>
      )}
    </div>
  );
}
