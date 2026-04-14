export interface NLUIntent {
  q: string;
  category: string;
  price: string;
  tag: string;
}

const CATEGORY_KEYWORDS: Array<{ slug: string; keywords: string[] }> = [
  { slug: "ai-tuxiang", keywords: ["图像", "图片", "画图", "绘图", "修图", "海报", "设计"] },
  { slug: "ai-wenben", keywords: ["文本", "文案", "写作", "文章", "改写", "翻译", "总结"] },
  { slug: "ai-yinpin", keywords: ["音频", "语音", "配音", "播客", "语音合成", "转录"] },
  { slug: "ai-shipin", keywords: ["视频", "剪辑", "字幕", "短视频", "转场"] },
  { slug: "dai-ma", keywords: ["代码", "编程", "开发", "debug", "调试", "测试"] },
];

const PRICE_KEYWORDS: Array<{ slug: string; keywords: string[] }> = [
  { slug: "free", keywords: ["免费", "白嫖", "零元", "不用钱", "不花钱"] },
  { slug: "freemium", keywords: ["免费增值", "先免费后付费", "试用版"] },
  { slug: "subscription", keywords: ["订阅", "按月", "按年", "月付", "年付", "付费"] },
  { slug: "one-time", keywords: ["买断", "一次性", "终身"] },
  { slug: "contact", keywords: ["联系销售", "报价", "询价"] },
];

const FILLER_PATTERN = /(推荐|工具|软件|平台|帮我|帮忙|给我|我想|我需要|请问|有哪些|哪个|什么|找|有没有|的)/gu;

function normalizeInput(input: string) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:()（）【】\[\]"'“”‘’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeyword(
  text: string,
  candidates: Array<{ slug: string; keywords: string[] }>,
): { slug: string; matchedKeyword: string } | null {
  for (const candidate of candidates) {
    for (const keyword of candidate.keywords) {
      if (text.includes(keyword)) {
        return { slug: candidate.slug, matchedKeyword: keyword };
      }
    }
  }
  return null;
}

export function parseSearchIntent(input: string): NLUIntent {
  const result: NLUIntent = {
    q: "",
    category: "",
    price: "",
    tag: "",
  };

  if (!input?.trim()) {
    return result;
  }

  let remaining = normalizeInput(input);

  const tagMatch = remaining.match(/#([\p{L}\p{N}_-]+)/u);
  if (tagMatch?.[1]) {
    result.tag = tagMatch[1];
    remaining = remaining.replace(tagMatch[0], " ").trim();
  }

  const price = extractKeyword(remaining, PRICE_KEYWORDS);
  if (price) {
    result.price = price.slug;
    remaining = remaining.replace(price.matchedKeyword, " ").trim();
  }

  const category = extractKeyword(remaining, CATEGORY_KEYWORDS);
  if (category) {
    result.category = category.slug;
    remaining = remaining.replace(category.matchedKeyword, " ").trim();
  }

  result.q = remaining.replace(FILLER_PATTERN, " ").replace(/\s+/g, " ").trim();
  return result;
}
