from __future__ import annotations

import hashlib
import json
import re
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from urllib import error, request

from app.core.config import settings
from app.schemas.ai_search import (
    AiPanel,
    AiQuickAction,
    AiQuickActionPayload,
    AiSearchMeta,
    AiSearchResponse,
    AiSearchResult,
)
from app.schemas.catalog import ToolsDirectoryResponse
from app.schemas.tool import ToolSummary
from app.services import catalog_service
from app.services.cache_service import get_redis_client

INTENT_CACHE_PREFIX = "ai-search:intent"
HOT_QUERY_TTL_SECONDS = 24 * 60 * 60
DEFAULT_QUERY_TTL_SECONDS = 60 * 60
INTENT_TIMEOUT_SECONDS = 1.8

BUSINESS_MAPPINGS = {
    "做 ppt": "presentation",
    "ppt": "presentation",
    "演示文稿": "presentation",
    "写周报": "report-writing",
    "周报": "report-writing",
    "写公众号": "wechat-writing",
    "公众号": "wechat-writing",
    "视频剪辑": "video-editing",
}

STOP_WORDS = {
    "帮我",
    "帮忙",
    "请帮我",
    "我想",
    "想找",
    "有没有",
    "一下",
    "工具",
    "ai",
    "用",
}

HOT_QUERY_KEYWORDS = {
    "ppt",
    "presentation",
    "周报",
    "视频剪辑",
    "图片生成",
    "思维导图",
}

INTENT_PROMPT = """
你是一个 AI 搜索意图解析器，不是聊天助手。
任务：把用户输入的找工具需求转换成结构化 JSON。
要求：
1) 只输出 JSON
2) 不输出 markdown
3) 不杜撰工具名称
4) intent_summary 不超过 40 字
5) quick_actions 最多 3 个
6) constraints 仅可包含 pricing/language/difficulty/platform

输出 JSON 结构：
{
  "intent_summary": "",
  "task": "",
  "category_hint": "",
  "constraints": {
    "pricing": "",
    "language": "",
    "difficulty": "",
    "platform": ""
  },
  "quick_actions": [
    {"label": "", "type": "set_filter", "key": "pricing", "value": "free"}
  ]
}
""".strip()


def _normalize_chat_url(base_url: str) -> str:
    normalized = base_url.rstrip("/")
    if normalized.endswith("/chat/completions"):
        return normalized
    if normalized.endswith("/v1") or normalized.endswith("/v3"):
        return f"{normalized}/chat/completions"
    return f"{normalized}/v1/chat/completions"


def _extract_json_block(content: str) -> dict | None:
    if not content:
        return None

    fenced_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", content, re.DOTALL)
    if fenced_match:
        try:
            return json.loads(fenced_match.group(1))
        except json.JSONDecodeError:
            pass

    raw_text = content.strip()
    brace_match = re.search(r"(\{[\s\S]*\})", raw_text, re.DOTALL)
    if not brace_match:
        return None

    raw_json = brace_match.group(1)
    try:
        return json.loads(raw_json)
    except json.JSONDecodeError:
        cleaned = re.sub(r",\s*([\]}])", r"\1", raw_json)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return None


def normalize_query(query: str) -> str:
    normalized = unicodedata.normalize("NFKC", query).strip()
    normalized = re.sub(r"\s+", " ", normalized)
    lowered = normalized.lower()
    for source, target in BUSINESS_MAPPINGS.items():
        lowered = lowered.replace(source, target)

    tokens = [token for token in re.split(r"[\s,，。！？!?.]+", lowered) if token and token not in STOP_WORDS]
    return " ".join(tokens).strip() or normalized


def _build_intent_cache_key(normalized_query: str) -> str:
    payload = json.dumps({"mode": "ai", "query": normalized_query}, ensure_ascii=False, sort_keys=True)
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return f"{INTENT_CACHE_PREFIX}:{digest}"


def _cache_ttl_for_query(normalized_query: str) -> int:
    if any(keyword in normalized_query for keyword in HOT_QUERY_KEYWORDS):
        return HOT_QUERY_TTL_SECONDS
    return DEFAULT_QUERY_TTL_SECONDS


def _has_llm_config() -> bool:
    return bool(settings.ai_api_key and settings.ai_model and settings.ai_openai_base_url)


def _build_default_intent(user_query: str, normalized_query: str) -> tuple[dict, str]:
    constraints: dict[str, str] = {}
    logic: list[str] = []

    if "free" in normalized_query or "免费" in normalized_query:
        constraints["pricing"] = "free_preferred"
        logic.append("免费优先")
    if "新手" in normalized_query or "beginner" in normalized_query:
        constraints["difficulty"] = "beginner"
        logic.append("新手友好")
    if "中文" in normalized_query or "zh" in normalized_query:
        constraints["language"] = "zh_preferred"
        logic.append("中文优先")
    if "presentation" in normalized_query:
        logic.append("PPT / 演示场景")
    if "video" in normalized_query or "视频" in normalized_query:
        logic.append("视频处理场景")

    task = "general"
    if "presentation" in normalized_query:
        task = "presentation"
    elif "report" in normalized_query or "周报" in normalized_query:
        task = "report-writing"
    elif "video" in normalized_query or "视频" in normalized_query:
        task = "video-editing"

    actions: list[dict[str, str]] = [
        {"label": "只看免费", "type": "set_filter", "key": "pricing", "value": "free"},
        {"label": "只看中文", "type": "set_filter", "key": "language", "value": "zh"},
        {"label": "进入筛选列表", "type": "view_switch", "value": "filters"},
    ]

    summary = f"用户希望按“{task}”任务快速筛选工具"
    return {
        "intent_summary": summary[:40],
        "task": task,
        "category_hint": "",
        "constraints": constraints,
        "quick_actions": actions,
    }, "fallback"


def _call_intent_llm(query: str, normalized_query: str) -> dict | None:
    body = {
        "model": settings.ai_model,
        "messages": [
            {"role": "system", "content": INTENT_PROMPT},
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "query": query,
                        "normalized_query": normalized_query,
                        "allowed_constraint_values": {
                            "pricing": ["free", "free_preferred", "subscription", "contact"],
                            "language": ["zh", "zh_preferred", "en"],
                            "difficulty": ["beginner", "intermediate", "advanced"],
                            "platform": ["web", "windows", "mac", "ios", "android"],
                        },
                    },
                    ensure_ascii=False,
                ),
            },
        ],
        "temperature": 0,
        "max_tokens": 300,
        "response_format": {"type": "json_object"},
    }

    api_request = request.Request(
        _normalize_chat_url(settings.ai_openai_base_url),
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.ai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with request.urlopen(api_request, timeout=INTENT_TIMEOUT_SECONDS) as response:
        payload = json.loads(response.read().decode("utf-8"))

    choices = payload.get("choices", [])
    if not choices:
        return None

    message = choices[0].get("message", {})
    content = message.get("content") or message.get("reasoning_content") or ""
    if isinstance(content, list):
        parts = [item.get("text", "") for item in content if isinstance(item, dict)]
        content = "\n".join(parts)

    return _extract_json_block(content) if isinstance(content, str) else None


def _normalize_quick_actions(raw_actions: object) -> list[dict]:
    if not isinstance(raw_actions, list):
        return []

    normalized: list[dict] = []
    for item in raw_actions[:3]:
        if not isinstance(item, dict):
            continue
        label = item.get("label")
        action_type = item.get("type")
        if not isinstance(label, str) or not label.strip() or not isinstance(action_type, str) or not action_type.strip():
            continue

        action = {"label": label.strip(), "type": action_type.strip()}
        if isinstance(item.get("key"), str):
            action["key"] = item.get("key").strip()
        if isinstance(item.get("value"), str):
            action["value"] = item.get("value").strip()
        normalized.append(action)

    return normalized


def _normalize_intent_payload(raw_intent: dict, user_query: str, normalized_query: str) -> dict:
    fallback_intent, _ = _build_default_intent(user_query, normalized_query)
    if not isinstance(raw_intent, dict):
        return fallback_intent

    constraints_raw = raw_intent.get("constraints")
    constraints = {}
    if isinstance(constraints_raw, dict):
        for key in ("pricing", "language", "difficulty", "platform"):
            value = constraints_raw.get(key)
            if isinstance(value, str) and value.strip():
                constraints[key] = value.strip()

    summary = raw_intent.get("intent_summary")
    if not isinstance(summary, str) or not summary.strip():
        summary = fallback_intent["intent_summary"]

    quick_actions = _normalize_quick_actions(raw_intent.get("quick_actions"))
    if not quick_actions:
        quick_actions = fallback_intent["quick_actions"]

    return {
        "intent_summary": summary.strip()[:40],
        "task": str(raw_intent.get("task") or fallback_intent["task"]),
        "category_hint": str(raw_intent.get("category_hint") or ""),
        "constraints": constraints,
        "quick_actions": quick_actions,
    }


def parse_ai_search_intent(query: str, normalized_query: str) -> tuple[dict, str, bool]:
    redis_client = get_redis_client()
    cache_key = _build_intent_cache_key(normalized_query)

    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached), "cache", True
        except Exception:
            pass

    intent_payload, source = _build_default_intent(query, normalized_query)
    if _has_llm_config():
        try:
            llm_payload = _call_intent_llm(query, normalized_query)
            if llm_payload:
                intent_payload = _normalize_intent_payload(llm_payload, query, normalized_query)
                source = "llm"
        except (error.URLError, TimeoutError, ValueError, json.JSONDecodeError, OSError):
            source = "fallback"

    if redis_client:
        try:
            redis_client.setex(cache_key, _cache_ttl_for_query(normalized_query), json.dumps(intent_payload, ensure_ascii=False))
        except Exception:
            pass

    return intent_payload, source, False


def _build_quick_actions(raw_actions: list[dict]) -> list[AiQuickAction]:
    quick_actions: list[AiQuickAction] = []
    for item in raw_actions[:3]:
        action = AiQuickAction(
            label=item.get("label", "快捷动作"),
            action=AiQuickActionPayload(
                type=item.get("type", "set_filter"),
                key=item.get("key"),
                value=item.get("value"),
            ),
        )
        quick_actions.append(action)
    return quick_actions


def _build_active_logic(intent_constraints: dict[str, str], category_hint: str, task: str) -> list[str]:
    logic: list[str] = []
    if task and task != "general":
        logic.append(f"任务: {task}")
    if category_hint:
        logic.append(f"场景: {category_hint}")

    mapping = {
        "pricing": "免费优先" if intent_constraints.get("pricing") in {"free", "free_preferred"} else None,
        "language": "中文优先" if intent_constraints.get("language") in {"zh", "zh_preferred"} else None,
        "difficulty": "新手友好" if intent_constraints.get("difficulty") == "beginner" else None,
        "platform": f"平台: {intent_constraints.get('platform')}" if intent_constraints.get("platform") else None,
    }
    logic.extend([value for value in mapping.values() if value])

    if not logic:
        logic.append("按关键词和基础筛选返回结果")

    return logic[:4]


def _build_reason(tool: ToolSummary, intent_constraints: dict[str, str], task: str) -> str:
    if intent_constraints.get("pricing") in {"free", "free_preferred"} and tool.pricingType in {"free", "freemium"}:
        return "支持免费试用或免费版本，符合免费优先条件"
    if intent_constraints.get("language") in {"zh", "zh_preferred"} and tool.accessFlags and tool.accessFlags.cnLang:
        return "支持中文界面，降低上手成本"
    if task and task != "general" and any(task_part in " ".join(tool.tags).lower() for task_part in task.split("-")):
        return "标签与当前任务匹配度较高"
    if tool.tags:
        return f"覆盖 {tool.tags[0]} 等场景，适合作为候选"
    return "与当前查询关键词匹配，适合进一步比较"


def _build_ai_panel(query: str, intent_payload: dict) -> AiPanel:
    constraints = intent_payload.get("constraints") if isinstance(intent_payload.get("constraints"), dict) else {}
    task = str(intent_payload.get("task") or "general")
    category_hint = str(intent_payload.get("category_hint") or "")
    summary = str(intent_payload.get("intent_summary") or "根据你的输入先展示相关工具")

    active_logic = _build_active_logic(constraints, category_hint, task)
    quick_actions = _build_quick_actions(intent_payload.get("quick_actions") or [])

    return AiPanel(
        title="AI 帮你理解了这个需求",
        user_need=query,
        system_understanding=summary,
        active_logic=active_logic,
        quick_actions=quick_actions,
    )


def search_with_ai(
    *,
    db,
    query: str,
    category: str | None,
    tag: str | None,
    price: str | None,
    access: str | None,
    price_range: str | None,
    sort: str,
    view: str,
    page: int,
    page_size: int,
) -> AiSearchResponse:
    started_at = time.perf_counter()
    normalized_query = normalize_query(query)

    with ThreadPoolExecutor(max_workers=1) as executor:
        intent_future = executor.submit(parse_ai_search_intent, query, normalized_query)
        directory = catalog_service.get_tools_directory(
            db=db,
            q=query,
            category_slug=category,
            tag_slug=tag,
            status_slug=None,
            price_slug=price,
            access_slug=access,
            price_range_slug=price_range,
            sort=sort,
            view=view,
            page=page,
            page_size=page_size,
        )

        intent_payload: dict
        intent_source: str
        cache_hit: bool
        try:
            intent_payload, intent_source, cache_hit = intent_future.result(timeout=INTENT_TIMEOUT_SECONDS + 0.2)
        except TimeoutError:
            intent_payload, intent_source = _build_default_intent(query, normalized_query)
            cache_hit = False

    constraints = intent_payload.get("constraints") if isinstance(intent_payload.get("constraints"), dict) else {}

    task = str(intent_payload.get("task") or "general")
    results = [
        AiSearchResult(**item.model_dump(), reason=_build_reason(item, constraints, task))
        for item in directory.items
    ]

    latency_ms = int((time.perf_counter() - started_at) * 1000)

    return AiSearchResponse(
        mode="ai",
        query=query,
        normalized_query=normalized_query,
        ai_panel=_build_ai_panel(query, intent_payload),
        results=results,
        directory=ToolsDirectoryResponse(
            **directory.model_dump(),
            items=[ToolSummary(**item.model_dump()) for item in results],
        ),
        meta=AiSearchMeta(
            latency_ms=latency_ms,
            cache_hit=cache_hit,
            intent_source=intent_source,
        ),
    )
