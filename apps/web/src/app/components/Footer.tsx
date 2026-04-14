import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/30 bg-white/40 py-10 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">关于星点评</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            星点评，帮你把 AI 工具看明白，再决定要不要用。面向真实任务的 AI 工具发现与决策平台，少一点信息堆砌，多一点实际判断。
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">使用说明</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            直接搜你想做的事，优先从别人验证过的高频工具开始，不仅发现新工具，更帮你减少试错成本。
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">协作反馈</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <a
              href="https://github.com/yuyuyu6631/Next.js-AI-Tool-Demo"
              target="_blank"
              rel="noreferrer"
              className="block hover:text-slate-900"
            >
              项目仓库
            </a>
            <a
              href="https://github.com/yuyuyu6631/Next.js-AI-Tool-Demo/issues"
              target="_blank"
              rel="noreferrer"
              className="block hover:text-slate-900"
            >
              问题反馈
            </a>
            <Link href="/tools" className="block hover:text-slate-900">
              返回工具目录
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
