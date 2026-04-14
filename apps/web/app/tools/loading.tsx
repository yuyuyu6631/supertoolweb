export default function ToolsLoading() {
  return (
    <main className="py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <section className="panel-base rounded-[32px] p-5 md:p-6">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-10 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="h-12 animate-pulse rounded-[18px] bg-slate-200" />
            <div className="h-12 w-36 animate-pulse rounded-[18px] bg-slate-200" />
          </div>
        </section>

        <section className="panel-base mt-6 rounded-[28px] border border-sky-200/80 bg-sky-50/70 p-5 md:p-6">
          <p className="text-sm font-semibold text-sky-900">AI 正在整理候选工具...</p>
          <p className="mt-1 text-xs text-sky-700">请稍候，正在生成更匹配的结果。</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
            <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
            <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel-base rounded-[24px] p-5">
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-8 w-24 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
