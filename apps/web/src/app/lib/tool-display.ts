import type { AccessFlags, ToolDetail, ToolSummary } from "./catalog-types";

export type AccessBadgeTone = "network-direct" | "network-restricted" | "network-unknown" | "secondary";

export interface AccessBadgeMeta {
  label: string;
  tone: AccessBadgeTone;
  kind: "network" | "secondary";
}

export function detectPriceLabel(tool: Pick<ToolSummary, "price" | "name" | "summary" | "tags" | "pricingType">) {
  switch (tool.pricingType) {
    case "free":
      return "free";
    case "freemium":
      return "freemium";
    case "subscription":
      return "subscription";
    case "one_time":
      return "one-time";
    case "contact":
      return "contact";
    default:
      break;
  }

  const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();
  if (text.includes("\u514d\u8d39\u589e\u503c") || text.includes("freemium")) return "freemium";
  if (text.includes("\u514d\u8d39") || text.includes("free")) return "free";
  if (
    text.includes("\u8ba2\u9605") ||
    text.includes("\u6708\u4ed8") ||
    text.includes("yearly") ||
    text.includes("monthly") ||
    text.includes("subscription")
  ) {
    return "subscription";
  }
  if (text.includes("\u4ed8\u8d39") || text.includes("\u4e00\u6b21\u6027") || text.includes("lifetime")) return "one-time";
  return null;
}

export function buildAccessBadgeMeta(accessFlags?: AccessFlags | null): AccessBadgeMeta[] {
  const badges: AccessBadgeMeta[] = [];

  if (accessFlags?.needsVpn === false) {
    badges.push({ label: "\u56fd\u5185\u76f4\u8fde", tone: "network-direct", kind: "network" });
  } else if (accessFlags?.needsVpn === true) {
    badges.push({ label: "\u9700\u7279\u5b9a\u7f51\u7edc", tone: "network-restricted", kind: "network" });
  }

  if (accessFlags?.cnLang === true) badges.push({ label: "\u4e2d\u6587\u754c\u9762", tone: "secondary", kind: "secondary" });
  if (accessFlags?.cnPayment === true) badges.push({ label: "\u652f\u6301\u56fd\u5185\u652f\u4ed8", tone: "secondary", kind: "secondary" });
  return badges;
}

export function buildAccessBadges(accessFlags?: AccessFlags | null) {
  return buildAccessBadgeMeta(accessFlags).map((badge) => badge.label);
}

export function getAccessBadgeClassName(tone: AccessBadgeTone) {
  switch (tone) {
    case "network-direct":
      return "bg-emerald-100 text-emerald-800";
    case "network-restricted":
      return "bg-amber-100 text-amber-800";
    case "network-unknown":
      return "bg-slate-200 text-slate-700";
    case "secondary":
    default:
      return "bg-slate-900 text-white";
  }
}

export function getNetworkStatusValue(accessFlags?: AccessFlags | null) {
  if (accessFlags?.needsVpn === false) return "\u662f";
  if (accessFlags?.needsVpn === true) return "\u5426";
  return "";
}

export function getScoreBadge(reviewCount: number | undefined, score: number) {
  if ((reviewCount ?? 0) < 5) {
    return null;
  }
  return { label: `\u2605 ${score.toFixed(1)}`, tone: "score" as const };
}

export function formatPricingType(tool: Pick<ToolSummary, "pricingType" | "price">) {
  switch (tool.pricingType) {
    case "free":
      return "\u5b8c\u5168\u514d\u8d39";
    case "freemium":
      return "\u514d\u8d39\u589e\u503c";
    case "subscription":
      return "\u8ba2\u9605\u5236";
    case "one_time":
      return "\u4e00\u6b21\u6027\u4ed8\u8d39";
    case "contact":
      return "\u8054\u7cfb\u9500\u552e";
    default:
      return tool.price || "";
  }
}

export function formatPriceRange(tool: Pick<ToolSummary, "priceMinCny" | "priceMaxCny" | "pricingType">) {
  if (tool.pricingType === "free") {
    return "\u5b8c\u5168\u514d\u8d39";
  }
  if (tool.pricingType === "contact") {
    return "\u8054\u7cfb\u9500\u552e";
  }
  if (tool.priceMinCny == null && tool.priceMaxCny == null) {
    return "";
  }
  if (tool.priceMinCny != null && tool.priceMaxCny != null && tool.priceMinCny !== tool.priceMaxCny) {
    return `\u00a5${tool.priceMinCny}-${tool.priceMaxCny}`;
  }
  const value = tool.priceMinCny ?? tool.priceMaxCny;
  return value == null ? "\u672a\u77e5" : `\u00a5${value}`;
}

export function buildCompareValue(tool: Pick<ToolDetail, "targetAudience" | "pitfalls" | "summary">) {
  const pitfalls = (tool.pitfalls ?? []).slice(0, 2).join(" / ");
  return {
    targetAudience: tool.targetAudience.length > 0 ? tool.targetAudience.join(" / ") : "",
    pitfalls: pitfalls || tool.summary,
  };
}
