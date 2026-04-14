import type { ToolSummary } from "../lib/catalog-types";

// Note: Ensure consistent slugify matching backend
export function slugify(value: string | undefined | null) {
    if (!value) return "";
    return value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function detectPriceType(priceText: string, tool: ToolSummary): string {
    if (tool.pricingType) {
        const raw = tool.pricingType.replace("_", "-").toLowerCase();
        if (["free", "freemium", "subscription", "one-time", "contact"].includes(raw)) {
            return raw;
        }
    }
    const text = (priceText + " " + tool.name + " " + (tool.summary || "") + " " + (tool.tags || []).join(" ")).toLowerCase();
    if (text.includes("free") || text.includes("免费")) return "free";
    if (text.includes("freemium") || text.includes("免费增值")) return "freemium";
    if (text.includes("subscription") || text.includes("按月") || text.includes("按年") || text.includes("订阅")) return "subscription";
    if (text.includes("one-time") || text.includes("一次性") || text.includes("终身")) return "one-time";
    return "other";
}

export function filterToolsLocally(
    items: ToolSummary[],
    qResults: ToolSummary[] | null,
    filters: {
        category?: string;
        tag?: string;
        price?: string;
        access?: string;
        priceRange?: string;
    }
): ToolSummary[] {
    let filtered = qResults !== null ? qResults : items;

    if (filters.category) {
        const targetSlug = slugify(filters.category);
        filtered = filtered.filter(t => slugify(t.category) === targetSlug);
    }

    if (filters.tag) {
        const targetTag = slugify(filters.tag);
        filtered = filtered.filter(t => t.tags.map(slugify).includes(targetTag));
    }

    if (filters.price) {
        filtered = filtered.filter(t => detectPriceType(t.price || "", t) === filters.price);
    }

    if (filters.access) {
        const activeAccess = filters.access.split(",").filter(Boolean);
        filtered = filtered.filter(t => {
            const flags = t.accessFlags;
            if (!flags) return false;
            let ok = true;
            if (activeAccess.includes("no-vpn") && flags.needsVpn !== false) ok = false;
            if (activeAccess.includes("needs-vpn") && flags.needsVpn !== true) ok = false;
            if (activeAccess.includes("cn-lang") && flags.cnLang !== true) ok = false;
            if (activeAccess.includes("cn-payment") && flags.cnPayment !== true) ok = false;
            return ok;
        });
    }

    if (filters.priceRange) {
        filtered = filtered.filter(t => {
            let r = "unknown";
            if (t.pricingType === "free") r = "free";
            else if (t.pricingType === "contact") r = "contact";
            else if (t.priceMinCny != null) {
                if (t.priceMinCny <= 50) r = "0-50";
                else if (t.priceMinCny <= 200) r = "51-200";
                else r = "201-plus";
            }
            return r === filters.priceRange;
        });
    }

    return filtered;
}

export function sortToolsLocally(items: ToolSummary[], sort: string, view: string): ToolSummary[] {
    const arr = [...items];
    if (view === "latest" || sort === "latest") {
        return arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    if (sort === "name") {
        return arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    // default: hotness / featured / score
    return arr.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if ((a.score || 0) !== (b.score || 0)) return (b.score || 0) - (a.score || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
}
