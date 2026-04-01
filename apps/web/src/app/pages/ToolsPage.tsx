import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import ToolCard from "../components/ToolCard";
import type { ToolsDirectoryResponse } from "../lib/catalog-types";
import { buildToolsHref } from "../lib/catalog-utils";

const CATEGORY_LIMIT = 8;
const TAG_LIMIT = 14;

interface ToolsPageProps {
  directory: ToolsDirectoryResponse;
  state: {
    q?: string;
    category?: string;
    tag?: string;
    status?: string;
    price?: string;
    sort?: string;
    view?: string;
    page?: string;
  };
  loadState?: "idle" | "error" | "timeout";
}

function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [];

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const tokens: Array<number | "ellipsis"> = [];

  for (const page of sorted) {
    const last = tokens[tokens.length - 1];
    if (typeof last === "number" && page - last > 1) {
      tokens.push("ellipsis");
    }
    tokens.push(page);
  }

  return tokens;
}

export default function ToolsPage({ directory, state, loadState = "idle" }: ToolsPageProps) {
  const activeView = state.view || "hot";
  const activeSort = state.sort || "featured";
  const selectedCategory = directory.categories.find((item) => item.slug === state.category);
  const selectedTag = directory.tags.find((item) => item.slug === state.tag);
  const selectedStatus = directory.statuses.find((item) => item.slug === state.status);
  const selectedPrice = directory.priceFacets.find((item) => item.slug === state.price);
  const showEmpty = directory.items.length === 0;
  const current = {
    q: state.q,
    category: state.category,
    tag: state.tag,
    status: state.status,
    price: state.price,
    sort: state.sort,
    view: state.view,
    page: state.page,
  };
  const pageTitle = state.q ? "搜索结果" : "工具分类";
  const currentPage = Number(state.page || directory.page || 1);
  const totalPages = Math.max(1, Math.ceil(directory.total / Math.max(1, directory.pageSize || 9)));
  const pagination = buildPagination(currentPage, totalPages);
  const isFiltered = Boolean(
    state.q || state.category || state.tag || state.status || state.price || activeView !== "hot" || activeSort !== "featured",
  );

  return (
    <div className="page-shell">
      <Header />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "工具目录" }]} />

          <section className="panel-base rounded-[32px] p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tools</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  {pageTitle}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  支持按关键词搜索工具名称、用途和标签，并结合分类、状态、标签继续筛选，帮助你更快找到合适的工具。
                </p>
              </div>

              <form action="/tools" method="get" className="w-full lg:max-w-xl">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      name="q"
                      defaultValue={state.q || ""}
                      placeholder="搜索工具名称、标签或用途"
                      className="w-full rounded-[18px] border border-white/50 bg-white/80 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
                    />
                    {state.view ? <input type="hidden" name="view" value={state.view} /> : null}
                    {state.category ? <input type="hidden" name="category" value={state.category} /> : null}
                    {state.tag ? <input type="hidden" name="tag" value={state.tag} /> : null}
                    {state.status ? <input type="hidden" name="status" value={state.status} /> : null}
                    {state.price ? <input type="hidden" name="price" value={state.price} /> : null}
                    {state.sort ? <input type="hidden" name="sort" value={state.sort} /> : null}
                  </div>
                  <button type="submit" className="btn-primary rounded-[18px] px-5 py-3 text-sm font-semibold">
                    开始搜索
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {directory.presets.map((preset) => (
                <Link
                  key={preset.id}
                  href={buildToolsHref(current, {
                    view: preset.id,
                    page: 1,
                    category: null,
                    tag: null,
                  })}
                  className={`filter-chip rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeView === preset.id
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "border border-white/45 bg-white/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  {preset.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[288px_minmax(0,1fr)]">
            <aside className="xl:sticky xl:top-24 xl:self-start">
              <div className="panel-base rounded-[28px] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4" />
                  筛选条件
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">排序</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { id: "featured", label: "推荐" },
                      { id: "latest", label: "最新" },
                      { id: "name", label: "名称" },
                    ].map((sortOption) => (
                      <Link
                        key={sortOption.id}
                        href={buildToolsHref(current, { sort: sortOption.id, page: 1 })}
                        className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                          activeSort === sortOption.id
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {sortOption.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">分类</p>
                    {state.category ? (
                      <Link href={buildToolsHref(current, { category: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                        清除分类
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    {directory.categories.slice(0, CATEGORY_LIMIT).map((category) => (
                      <Link
                        key={category.slug}
                        href={buildToolsHref(current, { category: category.slug, page: 1 })}
                        className={`aside-item flex items-center justify-between rounded-2xl px-3 py-2 text-sm ${
                          state.category === category.slug
                            ? "bg-slate-900 text-white"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        <span>{category.label}</span>
                        <span className="text-xs opacity-70">{category.count}</span>
                      </Link>
                    ))}
                    {directory.categories.length > CATEGORY_LIMIT ? (
                      <details className="rounded-2xl bg-white/60 p-3">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">查看更多分类</summary>
                        <div className="mt-3 space-y-2">
                          {directory.categories.slice(CATEGORY_LIMIT).map((category) => (
                            <Link
                              key={category.slug}
                              href={buildToolsHref(current, { category: category.slug, page: 1 })}
                              className="aside-item flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white"
                            >
                              <span>{category.label}</span>
                              <span className="text-xs text-slate-500">{category.count}</span>
                            </Link>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">状态</p>
                    {state.status ? (
                      <Link href={buildToolsHref(current, { status: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                        清除状态
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {directory.statuses.map((status) => (
                      <Link
                        key={status.slug}
                        href={buildToolsHref(current, { status: status.slug, page: 1 })}
                        className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                          state.status === status.slug
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {status.label} ({status.count})
                      </Link>
                    ))}
                  </div>
                </div>

                {directory.priceFacets.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">价格</p>
                      {state.price ? (
                        <Link href={buildToolsHref(current, { price: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                          清除价格
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {directory.priceFacets.map((price) => (
                        <Link
                          key={price.slug}
                          href={buildToolsHref(current, { price: price.slug, page: 1 })}
                          className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                            state.price === price.slug
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                              : "bg-white/70 text-slate-700 hover:bg-white"
                          }`}
                        >
                          {price.label} ({price.count})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">标签</p>
                    {state.tag ? (
                      <Link href={buildToolsHref(current, { tag: null, page: 1 })} className="text-xs text-slate-500 hover:text-slate-900">
                        清除标签
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {directory.tags.slice(0, TAG_LIMIT).map((tag) => (
                      <Link
                        key={tag.slug}
                        href={buildToolsHref(current, { tag: tag.slug, page: 1 })}
                        className={`filter-chip rounded-full px-3 py-1.5 text-xs font-medium ${
                          state.tag === tag.slug
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-white/70 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {tag.label}
                      </Link>
                    ))}
                  </div>
                  {directory.tags.length > TAG_LIMIT ? (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      标签较多时，优先展示高频标签。你也可以通过搜索直接定位具体工具。
                    </p>
                  ) : null}
                </div>

                {isFiltered ? (
                  <div className="mt-6">
                    <Link
                      href="/tools"
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline"
                    >
                      <RotateCcw className="h-4 w-4" />
                      重置筛选
                    </Link>
                  </div>
                ) : null}
              </div>
            </aside>

            <div>
              {loadState !== "idle" ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {loadState === "timeout" ? "目录加载超时" : "目录加载失败"}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    当前未能完整获取工具目录数据。你可以刷新重试，或先清空筛选条件后重新访问。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={buildToolsHref(current, {})} className="btn-primary rounded-full px-4 py-2 text-sm">
                      重新加载
                    </Link>
                    <Link href="/tools" className="btn-secondary rounded-full px-4 py-2 text-sm">
                      返回目录
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="panel-base mb-4 rounded-[24px] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{`结果数：${directory.total}`}</span>
                    <span>{`当前页：${currentPage} / ${totalPages}`}</span>
                    {selectedCategory ? <span>{`分类：${selectedCategory.label}`}</span> : null}
                    {selectedTag ? <span>{`标签：${selectedTag.label}`}</span> : null}
                    {selectedStatus ? <span>{`状态：${selectedStatus.label}`}</span> : null}
                    {selectedPrice ? <span>{`价格：${selectedPrice.label}`}</span> : null}
                    {state.q ? <span>{`搜索：${state.q}`}</span> : null}
                  </div>
                  {!showEmpty && totalPages > 1 ? (
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      列表 → 详情 → 返回
                    </div>
                  ) : null}
                </div>
              </div>

              {showEmpty ? (
                <div className="panel-base rounded-[28px] p-8 text-center">
                  <h2 className="text-xl font-semibold text-slate-900">暂无匹配的工具</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    当前筛选条件下没有找到结果。可以尝试更换关键词，或清除分类、状态和标签后重新查看。
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link href="/tools" className="btn-primary rounded-full px-5 py-3 text-sm">
                      重置筛选
                    </Link>
                    <Link href="/tools?view=hot" className="btn-secondary rounded-full px-5 py-3 text-sm">
                      返回推荐
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {directory.items.map((tool) => {
                    // Detect price type from price field first, then summary and tags
                    const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(' ')}`.toLowerCase();
                    let priceLabel: string | null = null;
                    if (text.includes('免费') || text.includes('free')) {
                      priceLabel = 'free';
                    } else if (text.includes('免费增值') || text.includes('freemium')) {
                      priceLabel = 'freemium';
                    } else if (text.includes('订阅') || text.includes('月付') || text.includes('yearly') || text.includes('monthly') || text.includes('subscription')) {
                      priceLabel = 'subscription';
                    } else if (text.includes('付费') || text.includes('一次性') || text.includes('lifetime')) {
                      priceLabel = 'one-time';
                    }
                    return (
                      <ToolCard
                        key={tool.slug}
                        slug={tool.slug}
                        name={tool.name}
                        summary={tool.summary}
                        tags={tool.tags}
                        url={tool.officialUrl}
                        logoPath={tool.logoPath}
                        status={tool.status}
                        score={tool.score}
                        priceLabel={priceLabel}
                      />
                    );
                  })}
                </div>
              )}

              {!showEmpty && totalPages > 1 ? (
                <nav aria-label="分页导航" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href={buildToolsHref(current, { page: Math.max(1, currentPage - 1) })}
                    aria-disabled={currentPage <= 1}
                    className={`pagination-chip inline-flex min-w-10 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Link>
                  {pagination.map((token, index) =>
                    token === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-400">
                        ...
                      </span>
                    ) : (
                      <Link
                        key={token}
                        href={buildToolsHref(current, { page: token })}
                        aria-current={token === currentPage ? "page" : undefined}
                        className={`pagination-chip inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                          token === currentPage ? "is-active bg-slate-900 text-white" : ""
                        }`}
                      >
                        {token}
                      </Link>
                    ),
                  )}
                  <Link
                    href={buildToolsHref(current, { page: Math.min(totalPages, currentPage + 1) })}
                    aria-disabled={currentPage >= totalPages}
                    className={`pagination-chip inline-flex min-w-10 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </nav>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
