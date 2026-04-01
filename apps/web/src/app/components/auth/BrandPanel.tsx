import { Compass, ListChecks, Sparkles, Star } from "lucide-react";

const valueItems = [
  {
    icon: Compass,
    title: "发现真正好用的 AI 工具",
    description: "按场景、能力和真实口碑快速筛掉噪音，少走弯路。",
  },
  {
    icon: Star,
    title: "收藏常用工具",
    description: "把高频使用的产品放进自己的工具清单，回访更顺手。",
  },
  {
    icon: Sparkles,
    title: "获取个性化推荐",
    description: "基于你的关注方向，优先看到更适合当前任务的工具。",
  },
  {
    icon: ListChecks,
    title: "参与真实点评和榜单互动",
    description: "分享体验、补充评分，让榜单更有参考价值。",
  },
];

export default function BrandPanel() {
  return (
    <section className="widget-glass-hero auth-brand-panel rounded-[32px] p-6 sm:p-8 lg:p-10">
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="max-w-[560px]">
          <p className="eyebrow text-xs font-semibold">可信的 AI 工具发现入口</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
            为每一次工具选择，
            <br />
            建立更可靠的参考。
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            星点评聚合 AI 工具导航、真实点评和榜单互动，让你从搜索、筛选到沉淀常用工具都更高效。
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {valueItems.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="auth-value-card rounded-[24px] p-5">
                <div className="icon-tile relative flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Icon className="relative z-10 h-5 w-5 text-slate-900" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
