"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Search, Save, Plus, KeyRound, X } from "lucide-react";

type UserRow = {
  id: string;
  account: string;
  nickname: string;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
};

const roleOptions = ["USER", "ADMIN"];
const planOptions = ["FREE", "PRO", "TEAM"];
const statusOptions = ["ACTIVE", "SUSPENDED"];

const initialCreateForm = {
  account: "",
  password: "",
  nickname: "",
  role: "USER",
  plan: "FREE",
  status: "ACTIVE",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { role: string; plan: string; status: string }>>({});
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchUsers(searchKeyword = "") {
    setLoading(true);
    setError(null);
    try {
      const query = searchKeyword ? `?keyword=${encodeURIComponent(searchKeyword)}` : "";
      const res = await fetch(`/api/admin/users${query}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "加载用户失败");
        return;
      }

      const list: UserRow[] = data.users || [];
      setUsers(list);
      setDrafts(
        Object.fromEntries(
          list.map((user) => [user.id, { role: user.role, plan: user.plan, status: user.status }])
        )
      );
    } catch {
      setError("加载用户失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const hasResult = useMemo(() => users.length > 0, [users.length]);

  async function handleSave(userId: string) {
    const draft = drafts[userId];
    if (!draft) {
      return;
    }

    setSavingUserId(userId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }

      setUsers((prev) => prev.map((item) => (item.id === userId ? data.user : item)));
      setMessage("用户权限已更新");
    } catch {
      setError("保存失败");
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleCreateUser() {
    setIsCreating(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建用户失败");
        return;
      }

      const created: UserRow = data.user;
      setUsers((prev) => [created, ...prev]);
      setDrafts((prev) => ({
        ...prev,
        [created.id]: { role: created.role, plan: created.plan, status: created.status },
      }));
      setCreateForm(initialCreateForm);
      setIsCreateOpen(false);
      setMessage(`用户 ${created.account} 创建成功`);
    } catch {
      setError("创建用户失败");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleResetPassword(userId: string, account: string) {
    const newPassword = window.prompt(`请输入用户 ${account} 的新密码（8-64位）`);
    if (!newPassword) {
      return;
    }

    setResettingUserId(userId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "重置密码失败");
        return;
      }

      setMessage(`已为 ${account} 重置密码`);
    } catch {
      setError("重置密码失败");
    } finally {
      setResettingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">用户管理</h1>
          <p className="mt-2 text-slate-400">管理账号角色、订阅档位与可用状态</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
            <Users className="h-4 w-4" />
            {users.length} 位用户
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {isCreateOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isCreateOpen ? "关闭" : "添加用户"}
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">新增用户</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              value={createForm.account}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, account: event.target.value }))}
              placeholder="账号"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none ring-blue-500 focus:ring-2"
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="初始密码"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none ring-blue-500 focus:ring-2"
            />
            <input
              type="text"
              value={createForm.nickname}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, nickname: event.target.value }))}
              placeholder="昵称"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={createForm.role}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value }))}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              {roleOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={createForm.plan}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, plan: event.target.value }))}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              {planOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={createForm.status}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, status: event.target.value }))}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleCreateUser}
              disabled={isCreating}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "创建中..." : "创建用户"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="按账号或昵称搜索"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-10 py-2.5 text-sm text-white outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchUsers(keyword.trim())}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            搜索
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/50">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            <tr className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">账号</th>
              <th className="px-4 py-3">昵称</th>
              <th className="px-4 py-3">角色</th>
              <th className="px-4 py-3">订阅</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">创建时间</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !hasResult && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  暂无用户
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  加载中...
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => {
                const draft = drafts[user.id] || { role: user.role, plan: user.plan, status: user.status };
                return (
                  <tr key={user.id} className="border-t border-slate-700/60">
                    <td className="px-4 py-3 font-medium text-white">{user.account}</td>
                    <td className="px-4 py-3">{user.nickname}</td>
                    <td className="px-4 py-3">
                      <select
                        value={draft.role}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [user.id]: { ...draft, role: event.target.value },
                          }))
                        }
                        className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
                      >
                        {roleOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={draft.plan}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [user.id]: { ...draft, plan: event.target.value },
                          }))
                        }
                        className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
                      >
                        {planOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [user.id]: { ...draft, status: event.target.value },
                          }))
                        }
                        className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
                      >
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(user.createdAt).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSave(user.id)}
                          disabled={savingUserId === user.id}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingUserId === user.id ? "保存中" : "保存"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user.id, user.account)}
                          disabled={resettingUserId === user.id}
                          className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          {resettingUserId === user.id ? "重置中" : "重置密码"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
