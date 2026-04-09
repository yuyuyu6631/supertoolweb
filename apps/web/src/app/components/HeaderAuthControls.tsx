"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";

interface HeaderAuthControlsProps {
  authHref: string;
}

function GuestAction({ authHref }: HeaderAuthControlsProps) {
  return (
    <Link href={authHref} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
      <UserRound className="h-4 w-4" />
      登录 / 注册
    </Link>
  );
}

export default function HeaderAuthControls({ authHref }: HeaderAuthControlsProps) {
  const { availability, currentUser, status, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Keep the current UI if logout fails.
    }
  }

  if (!mounted || status === "loading" || !currentUser) {
    return (
      <>
        {availability !== "ready" ? <span className="text-xs font-medium text-slate-500">服务未就绪</span> : null}
        <GuestAction authHref={authHref} />
      </>
    );
  }

  return (
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
        退出登录
      </button>
    </>
  );
}
