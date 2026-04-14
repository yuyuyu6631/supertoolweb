import ToolsPage from "@/src/app/pages/ToolsPage";
import { fetchAiSearch, fetchDirectory } from "@/src/app/lib/catalog-api";
import type { AiSearchResponse, ToolsDirectoryResponse } from "@/src/app/lib/catalog-types";

const EMPTY_DIRECTORY: ToolsDirectoryResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 9,
  hasMore: false,
  categories: [],
  tags: [],
  statuses: [],
  priceFacets: [],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
};

interface ToolsRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

export default async function Page({ searchParams }: ToolsRouteProps) {
  const params = await searchParams;
  const state = {
    mode: readValue(params.mode),
    aiFocus: readValue(params.ai_focus),
    q: readValue(params.q),
    category: readValue(params.category),
    tag: readValue(params.tag),
    price: readValue(params.price),
    access: readValue(params.access),
    priceRange: readValue(params.price_range),
    sort: readValue(params.sort),
    view: readValue(params.view),
    page: readValue(params.page),
  };

  const query = new URLSearchParams();
  if (state.q) query.set("q", state.q);
  if (state.category) query.set("category", state.category);
  if (state.tag) query.set("tag", state.tag);
  if (state.price) query.set("price", state.price);
  if (state.access) query.set("access", state.access);
  if (state.priceRange) query.set("price_range", state.priceRange);
  if (state.sort) query.set("sort", state.sort);
  if (state.view) query.set("view", state.view);
  if (state.page) query.set("page", state.page);
  query.set("page_size", "9");

  let loadState: "idle" | "error" | "timeout" = "idle";
  let aiSearch: AiSearchResponse | null = null;
  let directory: ToolsDirectoryResponse = EMPTY_DIRECTORY;

  if (state.mode === "ai" && state.q?.trim()) {
    const aiQuery = new URLSearchParams(query);
    try {
      aiSearch = await fetchAiSearch(aiQuery.toString());
      directory = aiSearch.directory;
    } catch (error) {
      loadState = String(error).includes("timeout") ? "timeout" : "error";
      directory = await fetchDirectory(query.toString()).catch(() => EMPTY_DIRECTORY);
    }
  } else {
    directory = await fetchDirectory(query.toString()).catch((error) => {
      loadState = String(error).includes("timeout") ? "timeout" : "error";
      return EMPTY_DIRECTORY;
    });
  }

  return <ToolsPage directory={directory} aiSearch={aiSearch} state={state} loadState={loadState} />;
}
