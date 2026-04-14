"use client";

import { Link } from "next-view-transitions";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { AccessFlags } from "../lib/catalog-types";
import { buildAccessBadgeMeta, getAccessBadgeClassName, getScoreBadge } from "../lib/tool-display";
import ToolLogo from "./ToolLogo";

interface ToolCardProps {
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  url: string;
  logoPath?: string | null;
  score: number;
  reviewCount?: number;
  accessFlags?: AccessFlags | null;
  priceLabel?: string | null;
  decisionBadges?: string[];
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: (() => void) | undefined;
  onDetailClick?: (() => void) | undefined;
  reason?: string | null;
}

const PRICE_TYPE_COLORS: Record<string, string> = {
  free: "bg-green-100 text-green-800",
  freemium: "bg-blue-100 text-blue-800",
  subscription: "bg-sky-100 text-sky-800",
  "one-time": "bg-orange-100 text-orange-800",
  contact: "bg-slate-100 text-slate-700",
  other: "bg-slate-100 text-slate-700",
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  free: "免费",
  freemium: "免费增值",
  subscription: "订阅",
  "one-time": "一次性付费",
  contact: "联系销售",
};

export default function ToolCard({
  slug,
  name,
  summary,
  tags,
  url,
  logoPath = null,
  score,
  reviewCount = 0,
  accessFlags = null,
  priceLabel = null,
  decisionBadges = [],
  compareSelected = false,
  compareDisabled = false,
  onCompareToggle,
  onDetailClick,
  reason = null,
}: ToolCardProps) {
  const priceDisplay = priceLabel && PRICE_TYPE_LABELS[priceLabel] ? PRICE_TYPE_LABELS[priceLabel] : priceLabel;
  const scoreBadge = getScoreBadge(reviewCount, score);
  const accessBadges = buildAccessBadgeMeta(accessFlags);

  return (
    <article className="card-base card-interactive rounded-[28px] p-5" data-testid="tool-card">
      <div className="relative z-10 flex h-full flex-col">
        {onCompareToggle ? (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onCompareToggle}
              disabled={!compareSelected && compareDisabled}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${compareSelected
                  ? "bg-slate-900 text-white"
                  : compareDisabled
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-white/80 text-slate-700 hover:bg-white"
                }`}
            >
              {compareSelected ? "已选对比" : "加入对比"}
            </button>
          </div>
        ) : null}
        <div className="flex items-start gap-3">
          <div style={{ viewTransitionName: `tool-logo-${slug}` }}>
            <ToolLogo slug={slug} name={name} logoPath={logoPath} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/tools/${slug}`} onClick={onDetailClick} className="block min-w-0 flex-1">
                <h3
                  style={{ viewTransitionName: `tool-title-${slug}` }}
                  className="truncate text-base font-semibold text-slate-950 transition group-hover:text-slate-900"
                >{name}</h3>
              </Link>
              {scoreBadge ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreBadge.tone === "score" ? "bg-amber-50 text-amber-600" : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {scoreBadge.label}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p>
            {reason ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-sky-700">推荐理由：{reason}</p> : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {priceDisplay ? (
            <span data-testid="price-tag" className={`rounded-full px-3 py-1 text-xs font-semibold ${PRICE_TYPE_COLORS[priceLabel || "other"]}`}>
              {priceDisplay}
            </span>
          ) : null}
          {accessBadges.map((badge) => (
            <span key={badge.label} className={`rounded-full px-3 py-1 text-xs font-medium ${getAccessBadgeClassName(badge.tone)}`}>
              {badge.label}
            </span>
          ))}
          {decisionBadges.slice(0, 4).map((badge) => (
            <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {badge}
            </span>
          ))}
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/35 pt-4">
          <Link
            href={`/tools/${slug}`}
            onClick={onDetailClick}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline-offset-4 transition hover:underline"
          >
            查看详情
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-white"
          >
            访问官网
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
