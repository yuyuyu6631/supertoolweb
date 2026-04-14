"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useClientSearch } from "./ClientSearchProvider";
import { parseSearchIntent } from "../utils/nlu-agent";

const PRICE_LABELS: Record<string, string> = {
  free: "免费",
  freemium: "免费增值",
  subscription: "订阅",
  "one-time": "一次性付费",
  contact: "联系销售",
};

const CATEGORY_LABELS: Record<string, string> = {
  "ai-tuxiang": "图像",
  "ai-wenben": "文本",
  "ai-yinpin": "音频",
  "ai-shipin": "视频",
  "dai-ma": "编程",
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { tools, fuse } = useClientSearch();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setSearch("");
    router.push(`/tools/${slug}`);
  };

  const nluIntent = useMemo(() => parseSearchIntent(search), [search]);

  const handleGlobalSearch = () => {
    setOpen(false);

    const params = new URLSearchParams();
    if (nluIntent.q) params.set("q", nluIntent.q);
    if (nluIntent.category) params.set("category", nluIntent.category);
    if (nluIntent.price) params.set("price", nluIntent.price);

    const query = params.toString();
    router.push(query ? `/tools?${query}` : "/tools");
  };

  const results = nluIntent.q && fuse ? fuse.search(nluIntent.q).map((r) => r.item).slice(0, 10) : tools.slice(0, 5);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-64 items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-200/80"
      >
        <span className="flex-1 text-left">搜索 / 回车...</span>
        <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-400 shadow-sm sm:inline-block">
          <span className="mr-0.5 text-xs">⌘</span>K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6"
      >
        <DialogPrimitive.Title className="sr-only">Global command menu</DialogPrimitive.Title>
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          <Command className="w-full" shouldFilter={false}>
            <div className="flex items-center border-b border-slate-100 px-4">
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="你想找哪类工具？支持自然语言搜索。"
                className="mb-0 h-14 w-full rounded-none border-none bg-transparent px-3 py-5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
              />
            </div>

            <Command.List className="max-h-[60vh] scroll-py-2 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-slate-500">
                {search ? "未能找到相关工具，请尝试调整关键词。" : "最近搜索"}
              </Command.Empty>

              {search && (nluIntent.category || nluIntent.price) && (
                <div className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  <span className="mr-2">已识别意图:</span>
                  {nluIntent.category ? (
                    <span className="mr-1 rounded-full bg-emerald-100 px-2 py-0.5">分类: {CATEGORY_LABELS[nluIntent.category] || nluIntent.category}</span>
                  ) : null}
                  {nluIntent.price ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5">价格: {PRICE_LABELS[nluIntent.price] || nluIntent.price}</span>
                  ) : null}
                </div>
              )}

              <Command.Group heading={search ? "工具库检索结果" : "热门推荐"}>
                {results.map((tool) => (
                  <Command.Item
                    key={tool.slug}
                    value={tool.slug}
                    onSelect={() => handleSelect(tool.slug)}
                    className="flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-sm text-slate-900 transition-colors aria-selected:bg-slate-100"
                  >
                    {tool.logoPath ? (
                      <img src={tool.logoPath} alt={tool.name} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{tool.name[0]}</div>
                    )}
                    <div className="flex min-w-0 flex-col">
                      <div className="truncate font-medium">{tool.name}</div>
                      <div className="truncate text-xs text-slate-500">{tool.summary}</div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>

              {search && (
                <Command.Group heading="快捷命令">
                  <Command.Item
                    onSelect={handleGlobalSearch}
                    className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-50/50 px-4 py-3 text-sm text-slate-900 transition-colors aria-selected:bg-slate-100"
                  >
                    <Search className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-indigo-700">在完整工具目录中搜索 "{search}"</span>
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </div>
      </Command.Dialog>
    </>
  );
}
