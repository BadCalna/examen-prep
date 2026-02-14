"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "登录失败");
        return;
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath || "/");
      router.refresh();
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">账号登录</h1>
        <p className="mt-2 text-sm text-slate-500">使用账号和密码登录你的学习空间</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="account" className="mb-1 block text-sm font-medium text-slate-700">
              账号
            </label>
            <input
              id="account"
              type="text"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none ring-blue-500 focus:ring-2"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none ring-blue-500 focus:ring-2"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          还没有账号？
          <Link
            href={searchParams.get("next") ? `/register?next=${encodeURIComponent(searchParams.get("next") || "")}` : "/register"}
            className="ml-1 font-semibold text-blue-700 hover:text-blue-800"
          >
            去注册
          </Link>
        </p>
      </div>
    </div>
  );
}
