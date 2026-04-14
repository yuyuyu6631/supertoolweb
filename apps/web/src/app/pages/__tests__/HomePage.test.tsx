import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HomePage from "../HomePage";
import type { PresetView, ScenarioSummary, ToolSummary } from "../../lib/catalog-types";

const pushMock = vi.fn();

vi.mock("../../components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../../components/ToolCard", () => ({
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../../lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

const featuredTools: ToolSummary[] = [
  {
    id: 1,
    slug: "chatgpt",
    name: "ChatGPT",
    category: "General",
    score: 9.5,
    summary: "Useful for writing, analysis, and coding workflows.",
    tags: ["chat", "writing"],
    officialUrl: "https://chat.openai.com",
    logoPath: null,
    logoStatus: null,
    logoSource: null,
    status: "published",
    featured: true,
    createdAt: "2026-03-01",
    price: "",
    reviewCount: 1,
    accessFlags: { needsVpn: false, cnLang: true, cnPayment: true },
  },
];

const presets: PresetView[] = [
  { id: "hot", label: "Hot", description: "High-frequency tools.", count: 10 },
  { id: "latest", label: "Latest", description: "Newest additions.", count: 5 },
  { id: "zero", label: "Zero", description: "Should stay hidden.", count: 0 },
];

const audienceScenarios: ScenarioSummary[] = [
  {
    id: 1,
    slug: "student",
    title: "Students",
    description: "A practical starter set for coursework and research.",
    problem: "Study faster.",
    toolCount: 1,
    primaryTools: [],
    alternativeTools: [],
    targetAudience: ["students", "beginners"],
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("renders homepage content and dual-mode controls", () => {
    render(
      <HomePage
        featuredTools={featuredTools}
        categories={[{ slug: "general", label: "General", count: 12 }]}
        presets={presets}
        audienceScenarios={audienceScenarios}
      />,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "直接搜索" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 帮找" })).toBeInTheDocument();
  });

  it("blocks empty submit in ai mode", () => {
    render(
      <HomePage
        featuredTools={featuredTools}
        categories={[{ slug: "general", label: "General", count: 12 }]}
        presets={presets}
        audienceScenarios={audienceScenarios}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "AI 帮找" }));
    fireEvent.click(screen.getByRole("button", { name: "开始推荐" }));

    expect(screen.getByText("先输入你的需求")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("uses current mode when quick example is clicked", () => {
    render(
      <HomePage
        featuredTools={featuredTools}
        categories={[{ slug: "general", label: "General", count: 12 }]}
        presets={presets}
        audienceScenarios={audienceScenarios}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "AI 帮找" }));
    fireEvent.click(screen.getByRole("button", { name: "免费做 PPT 的工具" }));

    expect(pushMock).toHaveBeenCalledWith("/tools?mode=ai&q=%E5%85%8D%E8%B4%B9%E5%81%9A+PPT+%E7%9A%84%E5%B7%A5%E5%85%B7");
  });
});
