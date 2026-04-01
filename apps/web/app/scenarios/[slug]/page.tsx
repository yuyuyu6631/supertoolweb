import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import ToolCard from "@/src/app/components/ToolCard";
import { fetchScenarioDetail } from "@/src/app/lib/catalog-api";
import type { ToolSummary } from "@/src/app/lib/catalog-types";

export const dynamic = "force-dynamic";

interface ScenarioRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: ScenarioRouteProps) {
  const { slug } = await params;
  const scenario = await fetchScenarioDetail(slug);

  if (!scenario) {
    notFound();
  }

  const renderToolsGrid = (tools: ToolSummary[], title: string) => (
    <div className="panel-base rounded-[28px] p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {tools.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-1 xl:grid-cols-1">
          {tools.map((tool) => {
            // Detect price type from price field first, then summary and tags
            const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(' ')}`.toLowerCase();
            let priceLabel: string | null = null;
            if (text.includes('免费') || text.includes('free')) {
              priceLabel = 'free';
            } else if (text.includes('免费增值') || text.includes('freemium')) {
              priceLabel = 'freemium';
            } else if (text.includes('订阅') || text.includes('月付') || text.includes('yearly') || text.includes('monthly')) {
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
      ) : (
        <p className="mt-4 text-sm text-slate-500">暂无已发布工具。</p>
      )}
    </div>
  );

  return (
    <div className="page-shell">
      <Header />

      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "首页", href: "/" },
              { label: "场景", href: "/scenarios" },
              { label: scenario.title },
            ]}
          />

          <section className="panel-base rounded-[32px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">场景</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{scenario.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{scenario.description}</p>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="panel-base rounded-[28px] p-6">
              <h2 className="text-xl font-semibold text-slate-900">解决核心问题</h2>
              <p className="mt-4 text-sm leading-8 text-slate-700">{scenario.problem}</p>
            </div>
          </section>

          {scenario.primaryTools.length > 0 && (
            <section className="mt-6">
              {renderToolsGrid(scenario.primaryTools, "优先推荐工具")}
            </section>
          )}

          {scenario.alternativeTools.length > 0 && (
            <section className="mt-6">
              {renderToolsGrid(scenario.alternativeTools, "备选工具")}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
