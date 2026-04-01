"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, LogOut } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useAuth } from "./AuthProvider";

const tabs = [
  { id: "login", label: "登录" },
  { id: "register", label: "注册" },
] as const;

interface AuthCardProps {
  nextHref?: string;
}

function hasSafeUriEncoding(value: string) {
  try {
    decodeURI(value);
    return true;
  } catch {
    return false;
  }
}

export function resolveNextHref(nextHref?: string) {
  if (!nextHref || !nextHref.startsWith("/") || nextHref.startsWith("//") || nextHref.startsWith("/auth")) {
    return "/tools";
  }

  if (!hasSafeUriEncoding(nextHref)) {
    return "/tools";
  }

  try {
    const normalized = new URL(nextHref, "http://localhost");
    return `${normalized.pathname}${normalized.search}${normalized.hash}`;
  } catch {
    return "/tools";
  }
}

export default function AuthCard({ nextHref }: AuthCardProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("login");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const router = useRouter();
  const { currentUser, status, message, setCurrentUser, logout } = useAuth();
  const targetHref = useMemo(() => resolveNextHref(nextHref), [nextHref]);

  async function handleLogout() {
    setLogoutLoading(true);
    setLocalMessage(null);

    try {
      await logout();
      setTab("login");
    } catch {
      setLocalMessage("退出登录失败了，请稍后再试。");
    } finally {
      setLogoutLoading(false);
    }
  }

  function handleSuccess(user: Parameters<typeof setCurrentUser>[0]) {
    if (!user) return;
    setCurrentUser(user);
    router.push(targetHref);
  }

  if (status === "loading") {
    return (
      <section className="panel-base auth-form-shell flex w-full items-center rounded-[32px] p-4 sm:p-5">
        <div className="auth-form-card flex w-full flex-col items-center justify-center gap-4 rounded-[28px] p-10 text-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-slate-600" />
          <p className="text-sm text-slate-600">正在确认当前登录状态...</p>
        </div>
      </section>
    );
  }

  if (currentUser) {
    return (
      <section className="panel-base auth-form-shell w-full rounded-[32px] p-4 sm:p-5">
        <div className="auth-form-card rounded-[28px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">已登录</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">欢迎回来，{currentUser.username}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            当前账号：{currentUser.email}。登录状态已经写入服务端会话，可以继续访问站内需要账号能力的页面。
          </p>

          {nextHref && targetHref !== "/tools" ? (
            <div className="mt-5 rounded-2xl border border-white/55 bg-white/65 px-4 py-3 text-sm text-slate-600">
              登录完成后将返回到你刚才访问的页面。
            </div>
          ) : null}

          {message || localMessage ? (
            <p className="mt-5 rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-600">{localMessage || message}</p>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href={targetHref}
              className="btn-primary flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
            >
              {targetHref === "/tools" ? "进入工具目录" : "返回上一页"}
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={logoutLoading}
              className="btn-secondary flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {logoutLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              退出登录
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-base auth-form-shell w-full rounded-[32px] p-4 sm:p-5">
      <div className="auth-form-card rounded-[28px] p-6 sm:p-8">
        {nextHref && targetHref !== "/tools" ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              登录成功后将返回上一页。
            </span>
          </div>
        ) : null}

        <div className="auth-tab-list mb-6 grid grid-cols-2 rounded-2xl p-1.5">
          {tabs.map((item) => {
            const active = item.id === tab;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={[
                  "rounded-[14px] px-4 py-3 text-sm font-semibold transition",
                  active ? "auth-tab-active text-slate-950" : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {tab === "login" ? "欢迎回来" : "创建账号"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {tab === "login" ? "登录星点评" : "加入星点评"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {tab === "login"
              ? "继续管理收藏、查看个性化推荐，并参与 AI 工具点评互动。"
              : "创建账号后即可收藏常用工具、参与点评，并解锁更贴合你的推荐内容。"}
          </p>
        </div>

        {message || localMessage ? (
          <p className="mt-6 rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-600">{localMessage || message}</p>
        ) : null}

        <div className="mt-8">
          {tab === "login" ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </section>
  );
}
