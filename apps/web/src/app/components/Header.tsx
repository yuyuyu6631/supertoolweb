import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import HeaderAuthControls from "./HeaderAuthControls";
import HeaderMobileMenu from "./HeaderMobileMenu";
import PlatformLogo from "./PlatformLogo";
import { headerNavItems, isHeaderNavActive } from "./header-nav";
import CommandPalette from "./CommandPalette";

interface HeaderProps {
  currentPath: string;
  currentRoute?: string;
}

export default function Header({ currentPath, currentRoute = currentPath }: HeaderProps) {
  const authHref = currentPath === "/auth" ? "/auth" : `/auth?next=${encodeURIComponent(currentRoute)}`;

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15">
          <PlatformLogo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {headerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link text-sm font-medium transition ${isHeaderNavActive(currentPath, item.href) ? "is-active text-slate-950" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div
            className="hidden max-w-[320px] items-start gap-2 rounded-full border border-white/45 bg-white/70 px-4 py-2 text-left text-[11px] leading-4 text-slate-700 shadow-sm backdrop-blur-md lg:inline-flex"
            title="帮你少试错，也帮你少浪费时间"
            aria-label="帮你少试错，也帮你少浪费时间"
          >
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-medium text-slate-900">帮你少试错，也帮你少花时间</span>
              <span className="block text-slate-500">用对 AI 工具，比多装 10 个工具更重要</span>
            </span>
          </div>
          <Link href="/tools" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white hidden xl:inline-flex">
            全部工具
          </Link>
          <CommandPalette />
          <HeaderAuthControls authHref={authHref} />
        </div>

        <HeaderMobileMenu currentPath={currentPath} authHref={authHref} />
      </div>
    </header>
  );
}
