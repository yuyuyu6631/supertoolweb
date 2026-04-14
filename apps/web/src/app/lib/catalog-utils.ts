export const TOOL_SUBMISSION_URL = "https://github.com/yuyuyu6631/Next.js-AI-Tool-Demo/issues";

export function slugifyLabel(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_]+/gu, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function buildToolsHref(
  current: Record<string, string | undefined>,
  updates: Record<string, string | number | null | undefined>,
) {
  const params = new URLSearchParams();
  const next = { ...current };

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      delete next[key];
      return;
    }
    next[key] = String(value);
  });

  Object.entries(next).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    params.set(key, value);
  });

  const query = params.toString();
  return query ? `/tools?${query}` : "/tools";
}

export interface DecisionBadgeSource {
  price?: string;
  summary?: string;
  tags?: string[];
  platforms?: string;
}

export function buildDecisionBadges(source: DecisionBadgeSource) {
  const text = [source.price || "", source.summary || "", source.tags?.join(" ") || "", source.platforms || ""]
    .join(" ")
    .toLowerCase();

  const badges: string[] = [];
  const push = (label: string) => {
    if (!badges.includes(label)) {
      badges.push(label);
    }
  };

  if (text.includes("免费") || text.includes("free")) {
    push("免费");
  }
  if (text.includes("商用") || text.includes("commercial") || text.includes("企业")) {
    push("可商用");
  }
  if (text.includes("ad-free") || text.includes("无广告")) {
    push("无广告");
  }
  if (text.includes("手机") || text.includes("mobile") || text.includes("ios") || text.includes("android") || text.includes("app")) {
    push("手机可用");
  }
  if (text.includes("版权安全") || text.includes("无版权风险")) {
    push("版权风险低");
  }

  return badges.slice(0, 4);
}

export function derivePriceFacets(items: Array<{ price?: string; name: string; summary: string; tags: string[] }>) {
  const counter = new Map<string, number>();

  const detect = (text: string) => {
    const normalized = text.toLowerCase();
    if (normalized.includes("free") || normalized.includes("免费")) {
      return "free";
    }
    if (normalized.includes("freemium") || normalized.includes("免费增值")) {
      return "freemium";
    }
    if (
      normalized.includes("subscription") ||
      normalized.includes("monthly") ||
      normalized.includes("yearly") ||
      normalized.includes("订阅") ||
      normalized.includes("按月") ||
      normalized.includes("按年")
    ) {
      return "subscription";
    }
    if (normalized.includes("one-time") || normalized.includes("lifetime") || normalized.includes("一次性") || normalized.includes("终身")) {
      return "one-time";
    }
    return null;
  };

  for (const item of items) {
    const priceType = detect([item.price || "", item.name, item.summary, item.tags.join(" ")].join(" "));
    if (!priceType) continue;
    counter.set(priceType, (counter.get(priceType) || 0) + 1);
  }

  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug, count]) => ({
      slug,
      count,
      label: slug === "free" ? "免费" : slug === "freemium" ? "免费增值" : slug === "subscription" ? "订阅" : "一次性付费",
    }));
}
