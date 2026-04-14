import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetailPage from "@/src/app/pages/ToolDetailPage";
import { fetchDirectory, fetchToolDetail } from "@/src/app/lib/catalog-api";
import { slugifyLabel } from "@/src/app/lib/catalog-utils";
import { buildAccessBadges, formatPricingType } from "@/src/app/lib/tool-display";

interface ToolDetailRouteProps {
  params: Promise<{ slug: string }>;
}

function buildToolTitle(toolName: string, summary: string) {
  const year = new Date().getFullYear();
  const corePoint = summary.split(/[，。,.!！?？]/).map((item) => item.trim()).find(Boolean) || "核心能力";
  return `${toolName} 评测 ${year}：${corePoint} - 星点评`;
}

function buildToolDescription(tool: NonNullable<Awaited<ReturnType<typeof fetchToolDetail>>>) {
  const parts = [
    tool.summary,
    buildAccessBadges(tool.accessFlags).join(" / "),
    formatPricingType(tool),
    tool.targetAudience?.length ? `适合：${tool.targetAudience.slice(0, 2).join("、")}` : "",
    tool.pitfalls?.length ? `避坑：${tool.pitfalls[0]}` : "",
  ].filter(Boolean);

  return parts.join("｜").slice(0, 120);
}

export async function generateMetadata({ params }: ToolDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await fetchToolDetail(slug);

  if (!tool) {
    return {
      title: "工具详情 - 星点评",
      description: "星点评的 AI 工具详情页。",
    };
  }

  return {
    title: buildToolTitle(tool.name, tool.summary),
    description: buildToolDescription(tool),
  };
}

export default async function Page({ params }: ToolDetailRouteProps) {
  const { slug } = await params;
  const tool = await fetchToolDetail(slug);

  if (!tool) {
    notFound();
  }

  const relatedDirectory = await fetchDirectory(`category=${slugifyLabel(tool.category)}&page=1&page_size=4`).catch(() => null);
  const relatedTools = relatedDirectory ? relatedDirectory.items.filter((item) => item.slug !== slug).slice(0, 3) : [];

  return <ToolDetailPage tool={tool} relatedTools={relatedTools} />;
}
