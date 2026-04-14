"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ToolCard from "../components/ToolCard";
import type { PresetView, ScenarioSummary, ToolSummary } from "../lib/catalog-types";
import { buildDecisionBadges, buildToolsHref } from "../lib/catalog-utils";
import { detectPriceLabel } from "../lib/tool-display";
import { trackEvent } from "../lib/analytics";

interface HomePageProps {
  featuredTools: ToolSummary[];
  categories: Array<{ slug: string; label: string; count: number }>;
  presets: PresetView[];
  audienceScenarios: ScenarioSummary[];
}

type SearchMode = "search" | "ai";

const quickExamples = [
  "免费做 PPT 的工具",
  "写周报用什么 AI",
  "适合新手的 AI 编程工具",
  "帮我找视频剪辑 AI",
  "对比 3 个 AI 写作工具",
  "适合做产品原型的 AI",
];

export default function HomePage({ featuredTools, categories, presets, audienceScenarios }: HomePageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("search");
  const [query, setQuery] = useState("");
  const [errorText, setErrorText] = useState("");

  const modePlaceholder = useMemo(
    () =>
      mode === "search"
        ? "例如：写周报、做 PPT、剪视频、写代码、做海报"
        : "例如：帮我找免费的 PPT 工具，适合新手，中文优先",
    [mode],
  );

  const submitByMode = (rawInput: string, nextMode: SearchMode) => {
    const trimmed = rawInput.trim();

    if (nextMode === "ai" && !trimmed) {
      setErrorText("先输入你的需求");
      return;
    }

    setErrorText("");
    const params = new URLSearchParams();
    params.set("mode", nextMode);
    if (trimmed) {
      params.set("q", trimmed);
    }

    trackEvent(nextMode === "search" ? "home_submit_search" : "home_submit_ai", {
      mode: nextMode,
      has_query: Boolean(trimmed),
      query_length: trimmed.length,
    });

    router.push(`/tools?${params.toString()}`);
  };

  return (
    <div className="page-shell">
      <Header currentPath="/" currentRoute="/" />

      <main>
        <section className="hero-shell border-b border-white/25 py-16 md:py-20">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">面向真实任务的 AI 工具发现与决策平台</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
                找 AI 工具，别再一个个试。
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                直接搜，或者让 AI 按你的任务、预算和上手难度帮你缩小范围。
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitByMode(query, mode);
                }}
                className="mt-8"
              >
                <div className="search-panel rounded-[32px] p-4 md:p-5">
                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("search");
                          setErrorText("");
                          trackEvent("home_mode_switch", { mode: "search" });
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          mode === "search"
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "border border-white/45 bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        直接搜索
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("ai");
                          trackEvent("home_mode_switch", { mode: "ai" });
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          mode === "ai"
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "border border-white/45 bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        AI 帮找
                      </button>
                    </div>

                    <div className="relative z-10 flex flex-col gap-3 md:flex-row">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          name="q"
                          value={query}
                          onChange={(event) => {
                            setQuery(event.target.value);
                            if (errorText) setErrorText("");
                          }}
                          placeholder={modePlaceholder}
                          className="w-full rounded-[22px] border border-white/45 bg-white/80 py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
                        />
                      </div>
                      <button type="submit" className="btn-primary rounded-[22px] px-6 py-4 text-sm font-semibold">
                        {mode === "search" ? "搜索工具" : "开始推荐"}
                      </button>
                    </div>

                    {errorText ? <p className="text-xs text-red-600">{errorText}</p> : null}
                  </div>

                  <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                    {quickExamples.map((text) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => {
                          setQuery(text);
                          submitByMode(text, mode);
                        }}
                        className="rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white"
                      >
                        {text}
                      </button>
                    ))}
                  </div>

                  <p className="relative z-10 mt-4 text-xs leading-6 text-slate-500">
                    当前共收录 {presets.reduce((sum, item) => sum + item.count, 0)} 个预设导航结果，可继续按最新、最热、价格与场景筛选。
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">不是给你一堆结果，而是先帮你缩小范围。</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">按场景筛、按成本看、按上手难度选，快速缩小范围后再决策。</p>
              </div>
              <Link href="/tools" className="hidden text-sm font-medium text-slate-900 hover:underline md:inline-flex">
                查看全部
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.slug}
                  href={buildToolsHref({}, { category: category.slug, page: 1, mode: "search" })}
                  className="card-base rounded-[28px] p-5"
                >
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-slate-950">{category.label}</p>
                    <p className="mt-3 text-sm text-slate-500">{category.count} 个工具</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                      进入分类
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">先看别人怎么用，再决定自己要不要试。</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  哪些场景好用，哪些地方一般，适不适合长期用，看真实反馈更有参考价值。
                </p>
              </div>
              <Link href="/scenarios" className="hidden text-sm font-medium text-slate-900 hover:underline md:inline-flex">
                查看更多场景
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {audienceScenarios.map((scenario) => (
                <Link key={scenario.slug} href={`/scenarios/${scenario.slug}`} className="card-base rounded-[28px] p-5">
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{scenario.toolCount} 个工具</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{scenario.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{scenario.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {scenario.targetAudience.slice(0, 3).map((audience) => (
                        <span key={audience} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">最近大家最常拿来干活的工具</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">先从高频、成熟、容易上手的开始，不容易走偏。</p>
              </div>
              <Link href="/tools?view=hot&mode=search" className="text-sm font-medium text-slate-900 hover:underline">
                查看全部
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredTools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  slug={tool.slug}
                  name={tool.name}
                  summary={tool.summary}
                  tags={tool.tags}
                  url={tool.officialUrl}
                  logoPath={tool.logoPath}
                  score={tool.score}
                  reviewCount={tool.reviewCount}
                  accessFlags={tool.accessFlags}
                  priceLabel={detectPriceLabel(tool)}
                  decisionBadges={buildDecisionBadges({ price: tool.price, summary: tool.summary, tags: tool.tags })}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

