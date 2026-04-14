import { notFound } from "next/navigation";
import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import Breadcrumbs from "@/src/app/components/Breadcrumbs";
import CompareToolsGrid from "@/src/app/components/CompareToolsGrid";
import { fetchScenarioDetail } from "@/src/app/lib/catalog-api";
import type { CompareToolsSection } from "@/src/app/components/CompareToolsGrid";

interface ScenarioRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: ScenarioRouteProps) {
  const { slug } = await params;
  const scenario = await fetchScenarioDetail(slug);

  if (!scenario) {
    notFound();
  }

  const compareSections: CompareToolsSection[] = [
    {
      id: "primary-tools",
      title: "优先推荐工具",
      items: scenario.primaryTools,
      emptyTitle: "主推工具还在补充中",
      emptyDescription: "你可以先去最热榜单看看，或者提交你正在用的工具，帮助我们把这个场景补完整。",
    },
    {
      id: "alternative-tools",
      title: "备选工具",
      items: scenario.alternativeTools,
      emptyTitle: "备选工具还没收齐",
      emptyDescription: "先看主推工具也没问题。如果你有更顺手的替代品，欢迎直接提交给我们。",
    },
  ];

  return (
    <div className="page-shell">
      <Header currentPath={`/scenarios/${slug}`} currentRoute={`/scenarios/${slug}`} />

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

            <div className="mt-5 flex flex-wrap gap-2">
              {scenario.targetAudience.map((audience) => (
                <span key={audience} className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700">
                  {audience}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="panel-base rounded-[28px] p-6">
              <h2 className="text-xl font-semibold text-slate-900">要解决的核心问题</h2>
              <p className="mt-4 text-sm leading-8 text-slate-700">{scenario.problem}</p>
            </div>
          </section>

          <section className="mt-6">
            <CompareToolsGrid sections={compareSections} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
