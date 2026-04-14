import React from "react";
import { render, screen } from "@testing-library/react";
import ToolDetailPage from "../ToolDetailPage";
import type { ToolDetail } from "../../lib/catalog-types";

vi.mock("../../components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../../components/Breadcrumbs", () => ({
  default: () => <div>Breadcrumbs</div>,
}));

vi.mock("../../components/ToolLogo", () => ({
  default: () => <div>ToolLogo</div>,
}));

vi.mock("../../components/ToolCard", () => ({
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

const tool: ToolDetail = {
  id: 1,
  slug: "chatgpt",
  name: "ChatGPT",
  category: "通用助手",
  score: 9.5,
  summary: "通用型 AI 助手",
  tags: ["对话", "写作"],
  officialUrl: "https://chat.openai.com",
  logoPath: null,
  logoStatus: null,
  logoSource: null,
  status: "published",
  featured: true,
  createdAt: "2026-03-01",
  price: "免费增值",
  reviewCount: 2,
  accessFlags: { needsVpn: false, cnLang: true, cnPayment: true },
  pricingType: "free",
  freeAllowanceText: "永久免费",
  description: "详细介绍",
  editorComment: "这段内容现在不该显示",
  developer: "OpenAI",
  country: "美国",
  city: "",
  platforms: "Web",
  vpnRequired: "不需要",
  targetAudience: [],
  abilities: [],
  pros: ["上手快"],
  cons: ["复杂场景需要复核"],
  pitfalls: ["复杂工作流需要二次编排"],
  scenarios: [],
  scenarioRecommendations: [{ audience: "内容团队", task: "快速起草", summary: "适合高频日常生产。" }],
  reviewPreview: [{ sourceType: "editor", title: "编辑结论", body: "先试再买", rating: 9.1 }],
  alternatives: [],
  lastVerifiedAt: "2026-03-01",
};

describe("ToolDetailPage", () => {
  it("hides editor comments even when data exists", () => {
    render(<ToolDetailPage tool={tool} relatedTools={[]} />);

    expect(screen.getByText("详细介绍")).toBeInTheDocument();
    expect(screen.getByText("避坑指南")).toBeInTheDocument();
    expect(screen.getByText("场景推荐")).toBeInTheDocument();
    expect(screen.queryByText("编辑点评")).not.toBeInTheDocument();
    expect(screen.queryByText("这段内容现在不该显示")).not.toBeInTheDocument();
  });
});
