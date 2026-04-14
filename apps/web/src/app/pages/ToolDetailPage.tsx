import { Link } from "next-view-transitions";
import { ExternalLink } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import ToolLogo from "../components/ToolLogo";
import ToolCard from "../components/ToolCard";
import type { ToolDetail, ToolSummary } from "../lib/catalog-types";
import { buildDecisionBadges, slugifyLabel } from "../lib/catalog-utils";
import { buildAccessBadgeMeta, detectPriceLabel, formatPricingType, getScoreBadge, getAccessBadgeClassName } from "../lib/tool-display";

interface ToolDetailPageProps {
  tool: ToolDetail | null;
  relatedTools: ToolSummary[];
}

export default function ToolDetailPage({ tool, relatedTools }: ToolDetailPageProps) {
  if (!tool) {
    return (
      <div className="page-shell">
        <Header currentPath="/tools" currentRoute="/tools" />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-950">暂无相关内容</h1>
          <p className="mt-3 text-sm text-slate-600">当前工具信息暂未收录，你可以返回列表继续浏览其他内容。</p>
          <Link href="/tools" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
            返回列表
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryHref = `/tools?category=${slugifyLabel(tool.category)}`;
  const scoreBadge = getScoreBadge(tool.reviewCount, tool.score);
  const accessBadges = buildAccessBadgeMeta(tool.accessFlags);
  const infoFields = [
    { label: "开发者", value: tool.developer },
    { label: "地区", value: tool.country },
    { label: "城市", value: tool.city },
    { label: "价格", value: formatPricingType(tool) },
    { label: "免费额度", value: tool.freeAllowanceText || "" },
    { label: "支持平台", value: tool.platforms },
    { label: "网络环境", value: accessBadges[0]?.label || tool.vpnRequired },
  ].filter((field) => field.value);
  const scenarioRecommendations = tool.scenarioRecommendations ?? [];
  const reviewPreview = tool.reviewPreview ?? [];
  const pitfalls = tool.pitfalls ?? [];

  return (
    <div className="page-shell">
      <Header currentPath={`/tools/${tool.slug}`} currentRoute={`/tools/${tool.slug}`} />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "首页", href: "/" },
              { label: "工具目录", href: "/tools" },
              { label: tool.name },
            ]}
          />

          {/* Hero Section */}
          <section className="mt-8 rounded-[36px] bg-white px-6 py-10 shadow-sm md:mt-10 md:px-12 md:py-16">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm md:h-32 md:w-32"
                style={{ viewTransitionName: `tool-logo-${tool.slug}` }}
              >
                {tool.logoPath ? (
                  <img
                    src={tool.logoPath}
                    alt={`${tool.name} logo`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-300 md:text-5xl">{tool.name[0]?.toUpperCase()}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
                    style={{ viewTransitionName: `tool-title-${tool.slug}` }}
                  >{tool.name}</h1>
                  {scoreBadge ? (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBadge.tone === "score" ? "bg-amber-50 text-amber-600" : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      {scoreBadge.label}
                    </span>
                  ) : null}
                  <Link href={categoryHref} className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-slate-700">
                    {tool.category}
                  </Link>
                </div>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{tool.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {accessBadges.map((badge) => (
                    <span key={badge.label} className={`rounded-full px-3 py-1 text-xs font-medium ${getAccessBadgeClassName(badge.tone)}`}>
                      {badge.label}
                    </span>
                  ))}
                  {buildDecisionBadges({
                    price: tool.price,
                    summary: tool.summary,
                    tags: tool.tags,
                    platforms: tool.platforms,
                  }).map((badge) => (
                    <span key={badge} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={tool.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
              >
                访问官网
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link href="/tools" className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium">
                返回列表
              </Link>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="panel-base rounded-[28px] p-6">
                <h2 className="text-xl font-semibold text-slate-900">这个工具适合做什么？</h2>
                <p className="mt-4 text-sm leading-8 text-slate-700">{tool.description || tool.summary}</p>
              </div>

              {(tool.pros.length > 0 || tool.cons.length > 0) ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">先看优缺点，再看值不值得花时间试</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
                      <p className="text-sm font-semibold text-emerald-700">优点</p>
                      {tool.pros.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                          {tool.pros.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
                      <p className="text-sm font-semibold text-amber-700">限制</p>
                      {tool.cons.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                          {tool.cons.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {pitfalls.length > 0 ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">避坑指南</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-700">
                    {pitfalls.map((item) => (
                      <li key={item} className="rounded-2xl border border-rose-200/70 bg-rose-50/60 px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {scenarioRecommendations.length > 0 ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">场景推荐</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {scenarioRecommendations.map((item) => (
                      <div key={`${item.audience}-${item.task}`} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.audience}</p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">{item.task}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {infoFields.length > 0 ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">工具信息</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {infoFields.map((field) => (
                      <div
                        key={`${field.label}-${field.value}`}
                        className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{field.label}</p>
                        <p className="mt-2 text-sm font-medium leading-7 text-slate-700">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="panel-base rounded-[28px] p-6">
                <h2 className="text-xl font-semibold text-slate-900">标签</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {accessBadges.map((badge) => (
                    <span key={badge.label} className={`rounded-full px-3 py-1.5 text-sm font-medium ${getAccessBadgeClassName(badge.tone)}`}>
                      {badge.label}
                    </span>
                  ))}
                  {tool.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {reviewPreview.length > 0 ? (
                <div className="panel-base rounded-[28px] p-6">
                  <h2 className="text-xl font-semibold text-slate-900">开发者点评 / 资深用户说</h2>
                  <div className="mt-4 space-y-4">
                    {reviewPreview.map((item, index) => (
                      <article key={`${item.sourceType}-${item.title}-${index}`} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            {item.sourceType === "editor" ? "开发者点评" : "资深用户说"}
                          </span>
                          {typeof item.rating === "number" ? (
                            <span className="text-sm font-semibold text-amber-600">★ {item.rating.toFixed(1)}</span>
                          ) : null}
                        </div>
                        {item.title ? <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3> : null}
                        <p className="mt-2 text-sm leading-7 text-slate-700">{item.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              {relatedTools.length > 0 ? (
                <div className="panel-base rounded-[28px] p-5">
                  <h2 className="text-lg font-semibold text-slate-900">同类工具</h2>
                  <div className="mt-4 space-y-4">
                    {relatedTools.map((item) => (
                      <ToolCard
                        key={item.slug}
                        slug={item.slug}
                        name={item.name}
                        summary={item.summary}
                        tags={item.tags}
                        url={item.officialUrl}
                        logoPath={item.logoPath}
                        score={item.score}
                        reviewCount={item.reviewCount}
                        accessFlags={item.accessFlags}
                        priceLabel={detectPriceLabel(item)}
                        decisionBadges={buildDecisionBadges({
                          price: item.price,
                          summary: item.summary,
                          tags: item.tags,
                        })}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
