export function normalizeComparisonSlugs(slugs: string[]) {
  return Array.from(new Set(slugs.map((item) => item.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function buildComparisonSlug(slugs: string[]) {
  const normalized = normalizeComparisonSlugs(slugs);
  if (normalized.length < 2 || normalized.length > 3) {
    return null;
  }
  return normalized.join("-vs-");
}

export function parseComparisonSlug(comparisonSlug: string) {
  return comparisonSlug
    .split("-vs-")
    .map((item) => item.trim())
    .filter(Boolean);
}
