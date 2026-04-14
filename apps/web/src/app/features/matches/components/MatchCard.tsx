"use client";

import { Bot, RefreshCcw, Sparkles } from "lucide-react";
import type { ResolvedMatchProfile } from "../types";

interface MatchCardProps {
  profile: ResolvedMatchProfile;
  mode: "defaultFeed" | "filteredFeed";
  isFavorite: boolean;
  onLike: () => void;
  onSkip: () => void;
}

const AVATAR_STYLES: Record<string, string> = {
  sunset: "linear-gradient(135deg, #fb923c 0%, #f97316 45%, #7c3aed 100%)",
  ocean: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 60%, #1d4ed8 100%)",
  berry: "linear-gradient(135deg, #f43f5e 0%, #ec4899 55%, #8b5cf6 100%)",
  forest: "linear-gradient(135deg, #34d399 0%, #16a34a 55%, #166534 100%)",
  amber: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #c2410c 100%)",
  iris: "linear-gradient(135deg, #818cf8 0%, #6366f1 55%, #312e81 100%)",
  graphite: "linear-gradient(135deg, #94a3b8 0%, #475569 55%, #0f172a 100%)",
  mint: "linear-gradient(135deg, #6ee7b7 0%, #14b8a6 55%, #0f766e 100%)",
  coral: "linear-gradient(135deg, #fb7185 0%, #f97316 55%, #ea580c 100%)",
  rose: "linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #be185d 100%)",
  cobalt: "linear-gradient(135deg, #60a5fa 0%, #2563eb 55%, #1e3a8a 100%)",
  peach: "linear-gradient(135deg, #fdba74 0%, #fb7185 55%, #be123c 100%)",
  violet: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 55%, #5b21b6 100%)",
  lime: "linear-gradient(135deg, #bef264 0%, #84cc16 55%, #365314 100%)",
  teal: "linear-gradient(135deg, #5eead4 0%, #14b8a6 55%, #134e4a 100%)",
  strawberry: "linear-gradient(135deg, #fda4af 0%, #fb7185 55%, #9f1239 100%)",
  sky: "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 55%, #0369a1 100%)",
  aurora: "linear-gradient(135deg, #67e8f9 0%, #a78bfa 55%, #f472b6 100%)",
  sand: "linear-gradient(135deg, #fde68a 0%, #f59e0b 55%, #92400e 100%)",
  apricot: "linear-gradient(135deg, #fdba74 0%, #fb923c 55%, #9a3412 100%)",
  ruby: "linear-gradient(135deg, #fb7185 0%, #e11d48 55%, #881337 100%)",
  sage: "linear-gradient(135deg, #bbf7d0 0%, #4ade80 55%, #166534 100%)",
  navy: "linear-gradient(135deg, #38bdf8 0%, #1d4ed8 55%, #172554 100%)",
  gold: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 55%, #92400e 100%)",
  electric: "linear-gradient(135deg, #22d3ee 0%, #818cf8 55%, #7c3aed 100%)",
};

const WORK_TYPE_META = {
  content: { label: "内容型", className: "bg-amber-100/80 text-amber-900" },
  automation: { label: "自动化型", className: "bg-sky-100/80 text-sky-900" },
  expression: { label: "表达型", className: "bg-rose-100/80 text-rose-900" },
} as const;

function buildAvatarLabel(name: string) {
  return name.slice(0, 1).toUpperCase();
}

export default function MatchCard({ profile, mode, isFavorite, onLike, onSkip }: MatchCardProps) {
  const avatarBackground = AVATAR_STYLES[profile.avatarStyle] ?? AVATAR_STYLES.graphite;
  const workTypeMeta = WORK_TYPE_META[profile.workType];

  return (
    <article
      className="card-base card-interactive rounded-[28px] p-6 md:p-7"
      data-testid="match-card"
      aria-label={`候选人 ${profile.name}`}
    >
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] text-xl font-semibold text-white shadow-lg"
              style={{ background: avatarBackground }}
              aria-hidden="true"
            >
              {buildAvatarLabel(profile.name)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{profile.name}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${workTypeMeta.className}`}>{workTypeMeta.label}</span>
                {isFavorite ? (
                  <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-900">已收藏</span>
                ) : null}
              </div>
              <p className="mt-2 text-base font-medium text-slate-900">{profile.personaTitle}</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{profile.oneLiner}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{profile.matchLabel}</span>
            <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-medium text-slate-700">
              {mode === "filteredFeed" ? `${profile.sharedTools.length} 个共同工具` : "随机推荐"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-4">
            <section>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Bot className="h-4 w-4" />
                Tool Stack
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.toolTags.map((tag) => (
                  <span key={tag} className="tag-muted rounded-full px-3 py-1 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Sparkles className="h-4 w-4" />
                Vibe
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.vibeTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/75 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-[24px] border border-white/45 bg-white/55 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {mode === "filteredFeed" ? "系统判断" : "为什么推荐"}
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              <li>{mode === "filteredFeed" ? `共同工具：${profile.sharedTools.length || 0} 个` : `匹配热度：${profile.matchScore}/100`}</li>
              <li>{profile.workTypeMatched ? "工作类型和你接近" : "工作风格形成互补"}</li>
              <li>{profile.vibeOverlapCount > 0 ? `重合 vibe：${profile.vibeOverlapCount} 个` : "更适合从工作流话题开聊"}</li>
            </ul>
          </aside>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/35 pt-5 sm:flex-row">
          <button type="button" onClick={onLike} className="btn-primary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold">
            同频
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
          >
            <RefreshCcw className="h-4 w-4" />
            换一个
          </button>
        </div>
      </div>
    </article>
  );
}
