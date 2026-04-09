import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import ToolLogo from "../components/ToolLogo";
import ToolCard from "../components/ToolCard";
import type { ToolDetail, ToolSummary } from "../lib/catalog-types";
import { buildDecisionBadges, slugifyLabel } from "../lib/catalog-utils";

interface ToolDetailPageProps {
  tool: ToolDetail | null;
  relatedTools: ToolSummary[];
}

function detectPriceLabel(tool: ToolSummary) {
  const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();
  if (text.includes("免费") || text.includes("free")) return "free";
  if (text.includes("免费增值") || text.includes("freemium")) return "freemium";
  if (text.includes("订阅") || text.includes("月付") || text.includes("yearly") || text.includes("monthly")) return "subscription";
  if (text.includes("付费") || text.includes("一次性") || text.includes("lifetime")) return "one-time";
  return null;
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
  const infoFields = [
    { label: "开发者", value: tool.developer },
    { label: "地区", value: tool.country },
    { label: "城市", value: tool.city },
    { label: "价格", value: tool.price },
    { label: "支持平台", value: tool.platforms },
    { label: "VPN", value: tool.vpnRequired },
  ].filter((field) => field.value);

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

          <section className="panel-base rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <ToolLogo slug={tool.slug} name={tool.name} size="lg" logoPath={tool.logoPath ?? null} />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{tool.name}</h1>
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-lg font-semibold text-amber-600">
                      ★ {tool.score.toFixed(1)}
                    </span>
                    <Link href={categoryHref} className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-slate-700">
                      {tool.category}
                    </Link>
                  </div>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{tool.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {buildDecisionBadges({
                      price: tool.price,
                      summary: tool.summary,
                      tags: tool.tags,
                      platforms: tool.platforms,
                      vpnRequired: tool.vpnRequired,
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
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="panel-base rounded-[28px] p-6">
                <h2 className="text-xl font-semibold text-slate-900">工具简介</h2>
                <p className="mt-4 text-sm leading-8 text-slate-700">{tool.description || tool.summary}</p>
              </div>

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
                  {tool.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
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
