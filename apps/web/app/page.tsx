import HomePage from "@/src/app/pages/HomePage";
import { fetchDirectory, fetchScenarios } from "@/src/app/lib/catalog-api";
import type { ScenarioSummary, ToolsDirectoryResponse } from "@/src/app/lib/catalog-types";

const EMPTY_DIRECTORY: ToolsDirectoryResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 8,
  hasMore: false,
  categories: [],
  tags: [],
  statuses: [],
  priceFacets: [],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
};

const EMPTY_SCENARIOS: ScenarioSummary[] = [];

export default async function Page() {
  const [directory, scenarios] = await Promise.all([
    fetchDirectory("view=hot&page=1&page_size=8").catch(() => EMPTY_DIRECTORY),
    fetchScenarios().catch(() => EMPTY_SCENARIOS),
  ]);

  return (
    <HomePage
      featuredTools={directory.items.slice(0, 4)}
      categories={directory.categories}
      presets={directory.presets}
      audienceScenarios={scenarios.slice(0, 4)}
    />
  );
}
