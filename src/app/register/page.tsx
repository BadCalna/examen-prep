"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  const normalizedAccount = useMemo(() => account.trim().toLowerCase(), [account]);

  async function checkAccountAvailability() {
    if (!normalizedAccount) {
      setAccountStatus(null);
      return;
    }

    setChecking(true);
    setAccountStatus(null);

    try {
      const response = await fetch(`/api/auth/check-account?account=${encodeURIComponent(normalizedAccount)}`);
      const data = await response.json();
      if (!response.ok) {
        setAccountStatus(data.error || "账号检查失败");
        return;
      }
      setAccountStatus(data.available ? "账号可用" : "账号已存在");
    } catch {
      setAccountStatus("账号检查失败");
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password, nickname }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "注册失败");
        return;
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath || "/");
      router.refresh();
    } catch {
      setError("注册失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">创建账号</h1>
        <p className="mt-2 text-sm text-slate-500">注册后可在不同设备同步你的学习记录（下一步可扩展）</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="account" className="mb-1 block text-sm font-medium text-slate-700">
              账号
            </label>
            <div className="flex gap-2">
              <input
                id="account"
                type="text"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none ring-blue-500 focus:ring-2"
                autoComplete="username"
                required
              />
              <button
                type="button"
                onClick={checkAccountAvailability}
                disabled={checking}
                className="shrink-0 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checking ? "检查中" : "检查"}
              </button>
            </div>
            {accountStatus && (
              <p className={`mt-1 text-sm ${accountStatus === "账号可用" ? "text-emerald-600" : "text-red-600"}`}>
                {accountStatus}
              </p>
            )}
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
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-slate-700">
              昵称
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none ring-blue-500 focus:ring-2"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "注册中..." : "注册并登录"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          已有账号？
          <Link
            href={searchParams.get("next") ? `/login?next=${encodeURIComponent(searchParams.get("next") || "")}` : "/login"}
            className="ml-1 font-semibold text-blue-700 hover:text-blue-800"
          >
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
