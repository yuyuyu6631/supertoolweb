import { buildComparisonSlug, normalizeComparisonSlugs, parseComparisonSlug } from "../compare-utils";

describe("compare-utils", () => {
  it("normalizes and sorts selected slugs", () => {
    expect(normalizeComparisonSlugs(["claude", "chatgpt", "claude"])).toEqual(["chatgpt", "claude"]);
  });

  it("builds canonical compare slugs for 2-3 tools", () => {
    expect(buildComparisonSlug(["claude", "chatgpt"])).toBe("chatgpt-vs-claude");
    expect(buildComparisonSlug(["gamma", "claude", "chatgpt"])).toBe("chatgpt-vs-claude-vs-gamma");
    expect(buildComparisonSlug(["chatgpt"])).toBeNull();
  });

  it("parses compare slugs into raw slugs", () => {
    expect(parseComparisonSlug("chatgpt-vs-claude-vs-gamma")).toEqual(["chatgpt", "claude", "gamma"]);
  });
});
