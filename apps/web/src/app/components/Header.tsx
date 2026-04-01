"use client";

import Link from "next/link";
import { LoaderCircle, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PlatformLogo from "./PlatformLogo";
import { useAuth } from "./auth/AuthProvider";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/tools", label: "工具目录" },
  { href: "/rankings", label: "榜单" },
  { href: "/scenarios", label: "场景" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, status, logout } = useAuth();
  const currentRoute = pathname === "/" && !searchParams.toString() ? "/" : `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const authHref = pathname === "/auth" ? "/auth" : `/auth?next=${encodeURIComponent(currentRoute)}`;

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
    } catch {
      // Keep the current UI if logout fails.
    }
  }

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15">
          <PlatformLogo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link text-sm font-medium transition ${
                pathname === item.href ? "is-active text-slate-950" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/tools" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white">
            <Search className="h-4 w-4" />
            查看全部
          </Link>
          {status === "loading" ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              登录状态读取中
            </span>
          ) : currentUser ? (
            <>
              <Link href={authHref} className="user-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-800">
                <UserRound className="h-4 w-4" />
                {currentUser.username}
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </>
          ) : (
            <Link href={authHref} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <UserRound className="h-4 w-4" />
              登录 / 注册
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/40 bg-white/75 p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "关闭导航" : "打开导航"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/25 bg-white/85 md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href ? "bg-white text-slate-950 shadow-sm" : "text-slate-700 hover:bg-white"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={authHref}
              className="rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-white"
              onClick={() => setOpen(false)}
            >
              {currentUser ? `账号：${currentUser.username}` : "登录 / 注册"}
            </Link>
            {currentUser ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-white"
              >
                退出登录
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
