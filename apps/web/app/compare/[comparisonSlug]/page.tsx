import { notFound, redirect } from "next/navigation";
import ComparePage from "@/src/app/pages/ComparePage";
import { fetchToolDetail } from "@/src/app/lib/catalog-api";
import { buildComparisonSlug, parseComparisonSlug } from "@/src/app/lib/compare-utils";

interface CompareRouteProps {
  params: Promise<{ comparisonSlug: string }>;
}

export default async function Page({ params }: CompareRouteProps) {
  const { comparisonSlug } = await params;
  const requestedSlugs = parseComparisonSlug(comparisonSlug);
  const canonicalSlug = buildComparisonSlug(requestedSlugs);

  if (!canonicalSlug) {
    notFound();
  }
  if (canonicalSlug !== comparisonSlug) {
    redirect(`/compare/${canonicalSlug}`);
  }

  const tools = (await Promise.all(requestedSlugs.map((slug) => fetchToolDetail(slug)))).filter(Boolean);
  const resolvedTools = tools.filter((tool): tool is NonNullable<typeof tool> => tool !== null);
  if (resolvedTools.length !== requestedSlugs.length || resolvedTools.length < 2 || resolvedTools.length > 3) {
    notFound();
  }

  return <ComparePage tools={resolvedTools} comparisonSlug={canonicalSlug} />;
}
