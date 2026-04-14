import { parseSearchIntent } from "../nlu-agent";

describe("parseSearchIntent", () => {
  it("extracts category + price and keeps task keywords", () => {
    expect(parseSearchIntent("帮我找免费做海报的工具")).toEqual({
      q: "做",
      category: "ai-tuxiang",
      price: "free",
      tag: "",
    });
  });

  it("recognizes paid one-time query", () => {
    expect(parseSearchIntent("有没有买断的代码工具")).toEqual({
      q: "",
      category: "dai-ma",
      price: "one-time",
      tag: "",
    });
  });

  it("extracts hashtag as tag", () => {
    expect(parseSearchIntent("推荐 #效率 的免费工具")).toEqual({
      q: "",
      category: "",
      price: "free",
      tag: "效率",
    });
  });
});
