import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CompareToolsGrid from "../CompareToolsGrid";
import type { ToolSummary } from "../../lib/catalog-types";

const makeTool = (id: number, slug: string, name: string): ToolSummary => ({
  id,
  slug,
  name,
  category: "通用助手",
  score: 9.1,
  summary: `${name} summary`,
  tags: ["assistant"],
  officialUrl: `https://example.com/${slug}`,
  logoPath: null,
  logoStatus: null,
  logoSource: null,
  status: "published",
  featured: true,
  createdAt: "2026-03-01",
  price: "",
  reviewCount: 6,
  accessFlags: { needsVpn: false, cnLang: true },
  pricingType: "subscription",
});

describe("CompareToolsGrid", () => {
  it("builds a compare link from tools selected across multiple sections", () => {
    render(
      <CompareToolsGrid
        sections={[
          { id: "primary", title: "优先推荐工具", items: [makeTool(1, "chatgpt", "ChatGPT")] },
          { id: "alternative", title: "备选工具", items: [makeTool(2, "gamma", "Gamma")] },
        ]}
      />,
    );

    const compareButtons = screen.getAllByRole("button", { name: "加入对比" });
    fireEvent.click(compareButtons[0]);
    fireEvent.click(compareButtons[1]);

    expect(screen.getByRole("link", { name: "开始对比" })).toHaveAttribute("href", "/compare/chatgpt-vs-gamma");
  });

  it("shows a guided empty state for empty sections", () => {
    render(
      <CompareToolsGrid
        sections={[
          {
            id: "empty",
            title: "备选工具",
            items: [],
            emptyTitle: "备选工具还没收齐",
            emptyDescription: "先看主推工具也没问题。如果你有更顺手的替代品，欢迎直接提交给我们。",
          },
        ]}
      />,
    );

    expect(screen.getByText("备选工具还没收齐")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "去最热榜单" })).toHaveAttribute("href", "/tools?view=hot");
    expect(screen.getByRole("link", { name: "提交你喜欢的工具" })).toHaveAttribute(
      "href",
      "https://github.com/yuyuyu6631/Next.js-AI-Tool-Demo/issues",
    );
  });
});
