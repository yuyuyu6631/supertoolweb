import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import MatchFeed, {
  PROFILE_STORAGE_KEY,
  buildMatchFeed,
  createEmptyProfileDraft,
  shuffleProfiles,
} from "../MatchFeed";
import type { MockProfile, ProfileDraft } from "../../types";

vi.mock("@/src/app/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    currentUser: null,
  }),
}));

const fixtureProfiles: MockProfile[] = [
  {
    id: "alpha",
    name: "Alpha",
    avatarStyle: "sunset",
    personaTitle: "内容研究员",
    oneLiner: "擅长把资料整理成可执行结构。",
    workType: "content",
    toolTags: ["ChatGPT", "Claude", "Perplexity"],
    vibeTags: ["研究型", "先搭框架"],
    introPrompt: "你做研究时会先铺素材还是先搭框架？",
    matchScore: 91,
    sharedTools: [],
    isBot: true,
  },
  {
    id: "beta",
    name: "Beta",
    avatarStyle: "ocean",
    personaTitle: "自动化搭建者",
    oneLiner: "喜欢用流程把重复工作吃掉。",
    workType: "automation",
    toolTags: ["n8n", "Airtable", "ChatGPT"],
    vibeTags: ["爱做系统", "结果导向"],
    introPrompt: "你现在最想自动化掉哪一步？",
    matchScore: 82,
    sharedTools: [],
    isBot: true,
  },
  {
    id: "gamma",
    name: "Gamma",
    avatarStyle: "berry",
    personaTitle: "视觉表达设计师",
    oneLiner: "会把内容先变成可感知的视觉节奏。",
    workType: "expression",
    toolTags: ["Figma", "Midjourney", "Framer"],
    vibeTags: ["视觉优先", "偏实验"],
    introPrompt: "你会先做 moodboard 还是先搭页面？",
    matchScore: 88,
    sharedTools: [],
    isBot: true,
  },
];

function storeDraft(draft: ProfileDraft) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draft));
}

describe("match feed logic", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shuffles profiles with an injected random source", () => {
    const shuffled = shuffleProfiles(fixtureProfiles, () => 0);
    expect(shuffled.map((profile) => profile.id)).toEqual(["beta", "gamma", "alpha"]);
  });

  it("orders filtered feed by shared tools, work type, vibe, then score", () => {
    const draft: ProfileDraft = {
      ...createEmptyProfileDraft("Tester"),
      workType: "automation",
      toolTags: ["ChatGPT", "n8n"],
      vibeTags: ["爱做系统"],
    };

    const ordered = buildMatchFeed(fixtureProfiles, draft);
    expect(ordered.map((profile) => profile.id)).toEqual(["beta", "alpha", "gamma"]);
    expect(ordered[0].sharedTools).toEqual(["n8n", "ChatGPT"]);
  });
});

describe("MatchFeed component", () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    window.localStorage.clear();
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it("shows a candidate card immediately and cycles to the next one", async () => {
    render(<MatchFeed profiles={fixtureProfiles} />);

    expect(screen.getByTestId("match-card")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "换一个" }));

    await waitFor(() => {
      expect(screen.getByText("Beta")).toBeInTheDocument();
    });
  });

  it("opens the drawer in default mode with recommended conversation chips", async () => {
    render(<MatchFeed profiles={fixtureProfiles} />);

    fireEvent.click(screen.getByRole("button", { name: "同频" }));

    await waitFor(() => {
      expect(screen.getByTestId("greeting-drawer")).toBeInTheDocument();
    });

    expect(screen.getByText("推荐聊点")).toBeInTheDocument();
    expect(screen.queryByText("共同工具")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "继续看下一个" }));

    await waitFor(() => {
      expect(screen.queryByTestId("greeting-drawer")).not.toBeInTheDocument();
      expect(screen.getByText("Beta")).toBeInTheDocument();
    });
  });

  it("restores profile draft from localStorage and shows shared tools in the drawer", async () => {
    storeDraft({
      ...createEmptyProfileDraft("Tester"),
      workType: "content",
      toolTags: ["ChatGPT", "Claude"],
      vibeTags: ["研究型"],
    });

    render(<MatchFeed profiles={fixtureProfiles} />);

    await waitFor(() => {
      expect(screen.getByText(/已按你的工具组合排序/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "同频" }));

    await waitFor(() => {
      const drawer = screen.getByTestId("greeting-drawer");
      expect(within(drawer).getByText("共同工具")).toBeInTheDocument();
      expect(within(drawer).getAllByText("Claude").length).toBeGreaterThan(0);
    });
  });

  it("clears the saved draft and returns to the default feed", async () => {
    storeDraft({
      ...createEmptyProfileDraft("Tester"),
      workType: "content",
      toolTags: ["ChatGPT"],
      vibeTags: [],
    });

    render(<MatchFeed profiles={fixtureProfiles} />);

    await waitFor(() => {
      expect(screen.getByText(/已按你的工具组合排序/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "清空我的工具" }));

    await waitFor(() => {
      expect(screen.getByText(/随机遇见正在用 AI 做事的人/)).toBeInTheDocument();
    });
  });
});
