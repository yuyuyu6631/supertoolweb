import type {
  RankingSection,
  ScenarioSummary,
  AiSearchResponse,
  ToolSummary,
  ToolDetail,
  ToolsDirectoryResponse,
} from "./catalog-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const CATALOG_CACHE_TAG = "catalog";
export const CATALOG_REVALIDATE_SECONDS = 60;

type CatalogFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

class ApiError extends Error {
  status: number;

  constructor(path: string, status: number) {
    super(`Request failed for ${path} with status ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

function withCatalogCache(options?: CatalogFetchOptions): CatalogFetchOptions {
  return {
    ...options,
    next: {
      revalidate: options?.next?.revalidate ?? CATALOG_REVALIDATE_SECONDS,
      tags: options?.next?.tags ?? [CATALOG_CACHE_TAG],
    },
  };
}

async function fetchJson<T>(path: string, options?: CatalogFetchOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, withCatalogCache(options));

  if (!response.ok) {
    throw new ApiError(path, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchDirectory(
  queryString = "",
): Promise<ToolsDirectoryResponse> {
  return fetchJson<ToolsDirectoryResponse>(`/api/tools${queryString ? `?${queryString}` : ""}`);
}

export async function fetchAiSearch(queryString = ""): Promise<AiSearchResponse> {
  return fetchJson<AiSearchResponse>(`/api/ai-search${queryString ? `?${queryString}` : ""}`);
}

export async function fetchSearchIndex(): Promise<ToolSummary[]> {
  // 不传递 options 禁用缓存，或者给一个更长时间的缓存，依赖数据实时性，这里我们复用 catalog cache
  return fetchJson<ToolSummary[]>("/api/tools/search-index");
}

export async function fetchToolDetail(slug: string): Promise<ToolDetail | null> {
  try {
    return await fetchJson<ToolDetail>(`/api/tools/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchScenarioDetail(slug: string): Promise<ScenarioSummary | null> {
  try {
    return await fetchJson<ScenarioSummary>(`/api/scenarios/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchRankings(): Promise<RankingSection[]> {
  return fetchJson<RankingSection[]>("/api/rankings");
}

export async function fetchScenarios(): Promise<ScenarioSummary[]> {
  return fetchJson<ScenarioSummary[]>("/api/scenarios");
}

export { ApiError };
