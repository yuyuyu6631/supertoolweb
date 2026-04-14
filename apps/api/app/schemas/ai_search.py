from pydantic import BaseModel, Field

from app.schemas.catalog import ToolsDirectoryResponse
from app.schemas.tool import ToolSummary


class AiIntentConstraints(BaseModel):
    pricing: str | None = None
    language: str | None = None
    difficulty: str | None = None
    platform: str | None = None


class AiQuickActionPayload(BaseModel):
    type: str
    key: str | None = None
    value: str | None = None


class AiQuickAction(BaseModel):
    label: str
    action: AiQuickActionPayload


class AiPanel(BaseModel):
    title: str
    user_need: str
    system_understanding: str
    active_logic: list[str] = Field(default_factory=list)
    quick_actions: list[AiQuickAction] = Field(default_factory=list)


class AiSearchResult(ToolSummary):
    reason: str | None = None


class AiSearchMeta(BaseModel):
    latency_ms: int
    cache_hit: bool = False
    intent_source: str = "fallback"


class AiSearchResponse(BaseModel):
    mode: str = "ai"
    query: str
    normalized_query: str
    ai_panel: AiPanel
    results: list[AiSearchResult]
    directory: ToolsDirectoryResponse
    meta: AiSearchMeta
