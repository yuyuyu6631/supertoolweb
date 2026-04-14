import React from "react";
import { render, screen } from "@testing-library/react";
import ToolCard from "../ToolCard";

describe("ToolCard", () => {
  it("renders compact card content", () => {
    render(
      <ToolCard
        slug="chatgpt"
        name="ChatGPT"
        summary="综合能力稳定，适合写作、分析和代码协作。"
        tags={["对话", "写作", "搜索"]}
        url="https://chat.openai.com"
        score={9.5}
        reviewCount={2}
        accessFlags={{ needsVpn: false, cnLang: true }}
      />,
    );

    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("综合能力稳定，适合写作、分析和代码协作。")).toBeInTheDocument();
    expect(screen.getByText("对话")).toBeInTheDocument();
    expect(screen.getByText("国内直连")).toBeInTheDocument();
    expect(screen.getByText("中文界面")).toBeInTheDocument();
    expect(screen.queryByText("已发布")).not.toBeInTheDocument();
    expect(screen.queryByText("搜索")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看详情/ })).toHaveAttribute("href", "/tools/chatgpt");
  });

  it("omits placeholder badges when access conditions are unknown", () => {
    render(
      <ToolCard
        slug="mystery-tool"
        name="Mystery Tool"
        summary="Unknown access conditions."
        tags={["new"]}
        url="https://example.com"
        score={8.1}
      />,
    );

    expect(screen.queryByText("访问条件待确认")).not.toBeInTheDocument();
  });
});
