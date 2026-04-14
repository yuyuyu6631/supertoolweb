export interface ToolSummary {
  id: number;
  slug: string;
  name: string;
  category: string;
  score: number;
  summary: string;
  tags: string[];
  officialUrl: string;
  logoPath?: string | null;
  logoStatus?: string | null;
  logoSource?: string | null;
  status: "published" | "draft" | "archived";
  featured: boolean;
  createdAt: string;
  price: string;
  reviewCount?: number;
  accessFlags?: AccessFlags | null;
  pricingType?: string;
  priceMinCny?: number | null;
  priceMaxCny?: number | null;
  freeAllowanceText?: string;
  reason?: string | null;
}

export interface ToolDetail extends ToolSummary {
  description: string;
  editorComment: string;
  developer: string;
  country: string;
  city: string;
  price: string;
  platforms: string;
  vpnRequired: string;
  targetAudience: string[];
  abilities: string[];
  pros: string[];
  cons: string[];
  pitfalls?: string[];
  scenarios: string[];
  scenarioRecommendations?: ScenarioRecommendation[];
  reviewPreview?: ReviewPreview[];
  alternatives: string[];
  lastVerifiedAt: string;
}

export interface AccessFlags {
  needsVpn?: boolean | null;
  cnLang?: boolean | null;
  cnPayment?: boolean | null;
}

export interface ScenarioRecommendation {
  audience: string;
  task: string;
  summary: string;
}

export interface ReviewPreview {
  sourceType: "editor" | "user" | string;
  title: string;
  body: string;
  rating?: number | null;
}

export interface FacetOption {
  slug: string;
  label: string;
  count: number;
}

export interface PresetView {
  id: string;
  label: string;
  description: string;
  count: number;
}

export interface ToolsDirectoryResponse {
  items: ToolSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  categories: FacetOption[];
  tags: FacetOption[];
  statuses: FacetOption[];
  priceFacets?: FacetOption[];
  accessFacets?: FacetOption[];
  priceRangeFacets?: FacetOption[];
  presets: PresetView[];
}

export interface ScenarioSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  problem: string;
  toolCount: number;
  primaryTools: ToolSummary[];
  alternativeTools: ToolSummary[];
  targetAudience: string[];
}

export interface RankingItem {
  rank: number;
  reason: string;
  tool: ToolSummary;
}

export interface RankingSection {
  slug: string;
  title: string;
  description: string;
  items: RankingItem[];
}

export interface AiQuickActionPayload {
  type: string;
  key?: string | null;
  value?: string | null;
}

export interface AiQuickAction {
  label: string;
  action: AiQuickActionPayload;
}

export interface AiPanel {
  title: string;
  user_need: string;
  system_understanding: string;
  active_logic: string[];
  quick_actions: AiQuickAction[];
}

export interface AiSearchMeta {
  latency_ms: number;
  cache_hit: boolean;
  intent_source: string;
}

export interface AiSearchResponse {
  mode: "ai";
  query: string;
  normalized_query: string;
  ai_panel: AiPanel;
  results: ToolSummary[];
  directory: ToolsDirectoryResponse;
  meta: AiSearchMeta;
}
