"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock3, Flame, RotateCcw, Search, Sparkles } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CatalogScrollRestorer from "../components/CatalogScrollRestorer";
import ToolCard from "../components/ToolCard";
import { cn } from "../components/ui/utils";
import type { FacetOption, ScenarioSummary, ToolSummary, ToolsDirectoryResponse } from "../lib/catalog-types";
import { TOOL_SUBMISSION_URL, buildDecisionBadges, buildToolsHref, derivePriceFacets, filterDisplayableFacets } from "../lib/catalog-utils";
import { rememberCatalogNavigation } from "../lib/catalog-navigation";
import { detectPriceLabel } from "../lib/tool-display";
import { trackEvent } from "../lib/analytics";

const DEFAULT_TAB = "recommended";

interface HomePageProps {
  directory: ToolsDirectoryResponse;
  hotTools: ToolSummary[];
  latestTools: ToolSummary[];
  scenarios: ScenarioSummary[];
  state: {
    mode?: string;
    q?: string;
    category?: string;
    tag?: string;
    price?: string;
    access?: string;
    priceRange?: string;
    sort?: string;
    view?: string;
    tab?: string;
    page?: string;
    source?: string;
  };
}

function dedupeTools(items: ToolSummary[]) {
  const seen = new Set<string>();
  return items.filter((tool) => {
    const key = tool.slug.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortToolsForDirectory(items: ToolSummary[]) {
  return [...items].sort((left, right) => {
    if (Number(right.featured) !== Number(left.featured)) return Number(right.featured) - Number(left.featured);
    if ((right.reviewCount ?? 0) !== (left.reviewCount ?? 0)) return (right.reviewCount ?? 0) - (left.reviewCount ?? 0);
    if ((right.score ?? 0) !== (left.score ?? 0)) return (right.score ?? 0) - (left.score ?? 0);
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
  });
}

function matchCategorySlug(categories: FacetOption[], keywords: string[]) {
  const normalizedKeywords = keywords.map((item) => item.toLowerCase());
  const matched = categories.find((item) => {
    const haystack = `${item.slug} ${item.label}`.toLowerCase();
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });
  return matched?.slug;
}

function buildAccessLabel(access: string | undefined, accessFacets: FacetOption[]) {
  if (!access) return null;
  const labels = access
    .split(",")
    .map((slug) => accessFacets.find((item) => item.slug === slug)?.label || slug)
    .filter(Boolean);
  return labels.length > 0 ? `访问：${labels.join(" / ")}` : null;
}

function resolveActiveTab(state: HomePageProps["state"]) {
  if (state.tab) return state.tab;
  if (state.price === "free") return "free";
  if (state.view === "latest") return "latest";
  if (state.view === "hot") return "hot";
  return DEFAULT_TAB;
}

function getChipClasses(isActive: boolean, isPending: boolean) {
  return cn(
    "rounded-full border px-3 py-2 text-sm font-medium transition duration-200",
    isActive
      ? "border-slate-900 bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    isPending && "scale-[0.99] border-slate-300 bg-slate-100 text-slate-900",
  );
}

export default function HomePage({ directory, hotTools, latestTools, scenarios, state }: HomePageProps) {
  const router = useRouter();
  const [query, setQuery] = useState(state.q || "");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  const cleanedCategories = useMemo(() => filterDisplayableFacets(directory.categories), [directory.categories]);
  const priceFacets = useMemo(() => directory.priceFacets ?? derivePriceFacets(directory.items), [directory.items, directory.priceFacets]);
  const accessFacets = useMemo(() => directory.accessFacets ?? [], [directory.accessFacets]);
  const activeTab = resolveActiveTab(state);

  const current = {
    q: state.q,
    category: state.category,
    tag: state.tag,
    price: state.price,
    access: state.access,
    priceRange: state.priceRange,
    sort: state.sort,
    view: state.view,
    tab: state.tab,
    page: state.page,
    source: state.source,
  };
  const currentRoute = buildToolsHref(current, {});

  useEffect(() => {
    setPendingHref(null);
    setPendingLabel(null);
  }, [currentRoute]);

  const selectedCategory = cleanedCategories.find((item) => item.slug === state.category);
  const selectedPrice = priceFacets.find((item) => item.slug === state.price);
  const selectedAccessLabel = buildAccessLabel(state.access, accessFacets);
  const freePriceSlug = priceFacets.find((item) => item.slug === "free")?.slug || "free";

  const writingCategorySlug = matchCategorySlug(cleanedCategories, ["writing", "office", "文档", "写作"]);
  const codingCategorySlug = matchCategorySlug(cleanedCategories, ["coding", "dev", "代码", "编程"]);
  const visualCategorySlug = matchCategorySlug(cleanedCategories, ["image", "design", "图像", "设计"]);
  const officeCategorySlug = matchCategorySlug(cleanedCategories, ["office", "productivity", "办公", "效率"]);
  const agentCategorySlug = matchCategorySlug(cleanedCategories, ["agent", "workflow", "智能体"]);

  const recommendedTools = useMemo(
    () => sortToolsForDirectory(dedupeTools([...hotTools, ...latestTools, ...directory.items])),
    [directory.items, hotTools, latestTools],
  );
  const rankingTools = useMemo(
    () => sortToolsForDirectory(dedupeTools([...hotTools, ...directory.items, ...latestTools])),
    [directory.items, hotTools, latestTools],
  );

  const displayedTools = directory.items.length > 0 ? directory.items : recommendedTools;
  const quickScenarios = scenarios.slice(0, 4);

  const categoryLinks = [
    {
      label: "全部",
      href: buildToolsHref(current, { q: null, category: null, page: 1 }),
      active: !state.q && !state.category,
    },
    {
      label: "AI 写作",
      href: buildToolsHref(current, { category: writingCategorySlug || null, q: writingCategorySlug ? null : "AI 写作", page: 1 }),
      active: state.category === writingCategorySlug || state.q === "AI 写作",
    },
    {
      label: "AI 编程",
      href: buildToolsHref(current, { category: codingCategorySlug || null, q: codingCategorySlug ? null : "AI 编程", page: 1 }),
      active: state.category === codingCategorySlug || state.q === "AI 编程",
    },
    {
      label: "AI 图像",
      href: buildToolsHref(current, { category: visualCategorySlug || null, q: visualCategorySlug ? null : "AI 图像", page: 1 }),
      active: state.category === visualCategorySlug || state.q === "AI 图像",
    },
    {
      label: "AI 办公",
      href: buildToolsHref(current, { category: officeCategorySlug || null, q: officeCategorySlug ? null : "AI 办公", page: 1 }),
      active: state.category === officeCategorySlug || state.q === "AI 办公",
    },
    {
      label: "AI Agent",
      href: buildToolsHref(current, { category: agentCategorySlug || null, q: agentCategorySlug ? null : "AI Agent", page: 1 }),
      active: state.category === agentCategorySlug || state.q === "AI Agent",
    },
  ];

  const viewTabs = [
    { id: "recommended", label: "推荐", href: buildToolsHref(current, { tab: "recommended", view: null, price: null, page: 1 }) },
    { id: "hot", label: "热门", href: buildToolsHref(current, { tab: "hot", view: "hot", price: null, page: 1 }) },
    { id: "latest", label: "最新", href: buildToolsHref(current, { tab: "latest", view: "latest", price: null, page: 1 }) },
    { id: "free", label: "免费", href: buildToolsHref(current, { tab: "free", view: null, price: freePriceSlug, page: 1 }) },
  ];

  const activeFilters = [
    state.q ? { label: `搜索：${state.q}`, href: buildToolsHref(current, { q: null, page: 1 }) } : null,
    selectedCategory ? { label: `分类：${selectedCategory.label}`, href: buildToolsHref(current, { category: null, page: 1 }) } : null,
    selectedPrice ? { label: `价格：${selectedPrice.label}`, href: buildToolsHref(current, { price: null, page: 1 }) } : null,
    selectedAccessLabel ? { label: selectedAccessLabel, href: buildToolsHref(current, { access: null, page: 1 }) } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  const setNavigationFeedback = (href: string, label: string) => {
    if (href === currentRoute) return;
    setPendingHref(href);
    setPendingLabel(label);
  };

  const submitSearch = (value: string) => {
    const trimmed = value.trim();
    const href = buildToolsHref(current, { q: trimmed || null, page: 1 });
    trackEvent("home_directory_search", { has_query: Boolean(trimmed), query_length: trimmed.length });
    setNavigationFeedback(href, trimmed ? `正在切换到搜索结果：${trimmed}` : "正在刷新结果");
    router.push(href);
  };

  const isPending = Boolean(pendingHref && pendingHref !== currentRoute);
  const resultSummary =
    displayedTools.length > 0 ? `当前展示 ${displayedTools.length} 个工具` : "当前没有可展示的工具";

  return (
    <div className="page-shell">
      <CatalogScrollRestorer />
      <Header currentPath="/" currentRoute={currentRoute} />

      <main aria-busy={isPending ? "true" : "false"} className="pb-16">
        <section className="border-b border-white/20 py-5">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.045)]">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch(query);
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="tools-search"
                      type="search"
                      name="q"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="搜索工具名称、用途或关键词"
                      data-global-search-target="tools"
                      className="w-full rounded-[18px] border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                    />
                  </div>
                  <button type="submit" className="btn-primary rounded-[18px] px-5 py-3 text-sm font-semibold">
                    搜索工具
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="py-4">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <nav aria-label="homepage categories" className="flex flex-wrap gap-2">
                {categoryLinks.map((item) => {
                  const itemPending = pendingHref === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setNavigationFeedback(item.href, `正在切换到 ${item.label}`)}
                      aria-current={item.active ? "page" : undefined}
                      className={getChipClasses(item.active || itemPending, itemPending)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.045)]">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {viewTabs.map((tab) => {
                        const itemPending = pendingHref === tab.href;
                        return (
                          <Link
                            key={tab.id}
                            href={tab.href}
                            onClick={() => setNavigationFeedback(tab.href, `正在切换到 ${tab.label}`)}
                            aria-current={activeTab === tab.id ? "page" : undefined}
                            className={getChipClasses(activeTab === tab.id || itemPending, itemPending)}
                          >
                            {tab.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="text-sm text-slate-500" aria-live="polite">
                      {isPending ? pendingLabel || "正在更新结果..." : resultSummary}
                    </div>
                  </div>

                  {isPending ? (
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-900" />
                      {pendingLabel || "正在更新结果..."}
                    </div>
                  ) : null}

                  {activeFilters.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {activeFilters.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setNavigationFeedback(item.href, `正在移除 ${item.label}`)}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <Link
                        href="/"
                        onClick={() => setNavigationFeedback("/", "正在重置筛选")}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        重置筛选
                      </Link>
                    </div>
                  ) : null}

                  {directory.items.length === 0 && recommendedTools.length > 0 ? (
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      当前筛选暂无结果，已自动回退到推荐工具。
                    </div>
                  ) : null}
                </div>

                {displayedTools.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {displayedTools.map((tool) => (
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
                        onDetailClick={() => {
                          rememberCatalogNavigation(currentRoute);
                          setPendingLabel(`正在打开 ${tool.name}`);
                        }}
                        reason={tool.reason}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
                    当前没有拿到工具目录数据，请先检查首页接口和后端服务是否正常。
                  </div>
                )}
              </div>

              <aside className="space-y-3">
                <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">常用场景</p>
                    <Clock3 className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {quickScenarios.map((scenario) => (
                      <Link
                        key={scenario.slug}
                        href={`/scenarios/${scenario.slug}`}
                        onClick={() => setPendingLabel(`正在打开 ${scenario.title}`)}
                        className="block rounded-[18px] border border-slate-200 bg-white px-3 py-3 transition duration-200 hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                      >
                        <p className="text-sm font-medium text-slate-900">{scenario.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{scenario.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">热门榜单</p>
                    <Flame className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {rankingTools.slice(0, 5).map((tool, index) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        onClick={() => {
                          rememberCatalogNavigation(currentRoute);
                          setPendingLabel(`正在打开 ${tool.name}`);
                        }}
                        className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-3 py-2.5 transition duration-200 hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{tool.name}</p>
                          <p className="truncate text-xs text-slate-500">{tool.category}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <p className="text-sm font-semibold text-slate-900">提交工具</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">补充你常用但目录里还没有的工具，我们会优先收录。</p>
                  <a
                    href={TOOL_SUBMISSION_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                  >
                    去提交
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
