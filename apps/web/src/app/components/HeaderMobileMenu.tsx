"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { headerNavItems, isHeaderNavActive } from "./header-nav";

interface HeaderMobileMenuProps {
  currentPath: string;
  authHref: string;
}

export default function HeaderMobileMenu({ currentPath, authHref }: HeaderMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
    } catch {
      // Keep the current UI if logout fails.
    }
  }

  const authLabel = mounted && currentUser ? `账户：${currentUser.username}` : "登录 / 注册";

  return (
    <>
      <button
        type="button"
        className="rounded-xl border border-white/40 bg-white/75 p-2 md:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "关闭导航" : "打开导航"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-t border-white/25 bg-white/85 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 sm:px-6">
            {headerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isHeaderNavActive(currentPath, item.href) ? "bg-white text-slate-950 shadow-sm" : "text-slate-700 hover:bg-white"
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
              {authLabel}
            </Link>
            {mounted && currentUser ? (
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
    </>
  );
}
