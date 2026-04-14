# /api/ai-search v1 接口契约（一期冻结）

- 版本: `v1`
- 目标: 为 `mode=ai` 工具搜索页提供“可运行、可降级、可联调”的统一聚合返回。
- 状态: **Frozen（一期）**。后续变更需走版本化（`v1.x` 向后兼容 / `v2` 破坏性变更）。

## 1. Endpoint

- Method: `GET`
- Path: `/api/ai-search`
- Content-Type: `application/json`

## 2. 请求参数（Query）

### 2.1 必填参数

- `q: string`
  - 必填，最小长度 `1`
  - 含义: 用户自然语言需求原文（例如“帮我找适合新手的免费 PPT 工具”）

### 2.2 可选参数

- `category: string | null`
- `tag: string | null`
- `price: string | null`
- `access: string | null`
  - 多值使用逗号分隔，例如 `cn-lang,no-vpn`
- `price_range: string | null`
- `sort: string`（默认 `featured`）
- `view: string`（默认 `hot`）
- `page: int`（默认 `1`，`>=1`）
- `page_size: int`（默认 `9`，范围 `1..24`）

### 2.3 约束说明

- `mode` 不在该接口 query 中作为业务参数；接口固定返回 `mode="ai"`。
- `locale` 当前版本未接入；若需要国际化语义，请走 `v1.x` 增强。

## 3. 成功响应（200）

```json
{
  "mode": "ai",
  "query": "帮我找适合新手的免费 PPT 工具",
  "normalized_query": "presentation free ...",
  "ai_panel": {
    "title": "AI 帮你理解了这个需求",
    "user_need": "帮我找适合新手的免费 PPT 工具",
    "system_understanding": "用户希望按任务快速筛选工具",
    "active_logic": ["任务: presentation", "免费优先", "新手友好"],
    "quick_actions": [
      {
        "label": "只看免费",
        "action": {
          "type": "set_filter",
          "key": "pricing",
          "value": "free"
        }
      }
    ]
  },
  "results": [
    {
      "id": 1,
      "slug": "gamma",
      "name": "Gamma",
      "category": "Slides",
      "score": 9.1,
      "summary": "快速生成演示文稿",
      "tags": ["PPT"],
      "officialUrl": "https://...",
      "status": "published",
      "featured": true,
      "createdAt": "2026-01-01",
      "price": "freemium",
      "reason": "支持免费试用或免费版本，符合免费优先条件"
    }
  ],
  "directory": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 9,
    "hasMore": false,
    "categories": [],
    "tags": [],
    "statuses": [],
    "priceFacets": [],
    "accessFacets": [],
    "priceRangeFacets": [],
    "presets": []
  },
  "meta": {
    "latency_ms": 520,
    "cache_hit": true,
    "intent_source": "cache"
  }
}
```

## 4. 字段契约（必填/选填 + 前端使用规则）

### 4.1 顶层字段

- `mode: "ai"`（必填）
  - 前端用途: 页面渲染模式确认，不依赖 URL 二次推断。
- `query: string`（必填）
  - 前端用途: 回显用户输入。
- `normalized_query: string`（必填）
  - 前端用途: 调试/日志，不建议直接展示给用户。
- `ai_panel: object`（必填）
  - 前端用途: AI 理解面板主数据。
- `results: ToolSummary[]`（必填，可空数组）
  - 前端用途: 工具卡片主列表（AI 模式优先消费）。
- `directory: ToolsDirectoryResponse`（必填）
  - 前端用途: Facet、分页、筛选统计；与现有目录组件复用。
- `meta: object`（必填）
  - 前端用途: 观测/日志；仅允许“有限展示”字段见 4.6。

### 4.2 `ai_panel`

- `title: string`（必填）
  - 建议展示。
- `user_need: string`（必填）
  - 直接展示用户需求。
- `system_understanding: string`（必填）
  - 语义: 系统对需求的简短解释（非长文推理）。
  - 要求: 可读、简短、稳定；不得作为排序依据。
- `active_logic: string[]`（必填，可空）
  - 语义: 当前生效/推断的筛选逻辑标签。
  - 前端建议: 用 `/` 或标签形式展示。
- `quick_actions: AiQuickAction[]`（必填，可空）
  - 语义: 可执行筛选动作，不是装饰按钮。

### 4.3 `quick_actions[].action` schema（冻结）

- `type: string`（必填）
  - 一期允许值：
    - `set_filter`
    - `view_switch`
- `key: string | null`（选填）
  - 当 `type=set_filter` 时可用
  - 一期已用值：`pricing` / `language`
- `value: string | null`（选填）
  - `set_filter` 示例：`free` / `zh`
  - `view_switch` 示例：`filters`

前端执行规则（一期）：
- `set_filter + pricing=free` -> 写回 URL `price=free`
- `set_filter + language=zh` -> 写回 URL `access` 并追加 `cn-lang`
- `view_switch + filters` -> 写回 URL `ai_focus=list`

### 4.4 `results[].reason`

- `reason: string | null`（选填，当前实现默认有值）
- 语义: 推荐提示（hint），不是主排序解释。
- 生成来源: **模板规则生成（服务端）**，不是逐卡 LLM 生成。
- 产品约束:
  - 短
  - 稳
  - 可预测
  - 不影响主排序

### 4.5 `results` 与 `directory` 边界

- `results`
  - 面向 AI 模式卡片消费
  - 包含 `reason` 等 AI 辅助展示信息
- `directory`
  - 面向筛选/分页/facet 系统
  - 兼容现有目录渲染能力

注意：一期中两者的 `items` 来自同一结果集；前端仍应按职责区分消费，不要混用语义。

### 4.6 `meta` 字段分级

- `latency_ms: number`（必填）
  - 用途: 性能观测
  - 前端: 可展示（例如“耗时 xx ms”）
- `cache_hit: boolean`（必填）
  - 语义: 意图解析缓存是否命中
  - 前端: 默认不对普通用户展示，允许调试面板展示
- `intent_source: string`（必填）
  - 一期取值：`llm | cache | fallback`
  - 前端: 默认不对普通用户展示，允许日志/调试展示

## 5. 降级与异常语义（200 路径内）

### 5.1 LLM 超时/失败/非法 JSON

- 行为:
  - 检索结果照常返回
  - `ai_panel` 使用 fallback 模板
  - `meta.intent_source = "fallback"`
  - 不阻塞列表渲染

### 5.2 Redis 不可用

- 行为:
  - 忽略缓存失败
  - 走正常解析链路
  - `cache_hit=false`

### 5.3 检索为空但 AI 成功

- 行为:
  - `results=[]`
  - `directory.items=[]` 且保留分页/facet结构
  - `ai_panel` 仍可展示

### 5.4 非 200 场景

- `q` 缺失或不合法 -> FastAPI 参数校验错误（`422`）

## 6. 示例请求

```http
GET /api/ai-search?q=免费做ppt的工具&page=1&page_size=9
GET /api/ai-search?q=做视频&price=free&access=cn-lang,no-vpn&sort=featured&view=hot
```

## 7. 一期冻结清单（Contract Freeze）

以下视为 `v1` 冻结内容：
- URL 模式: `/tools?mode=ai&q=...`
- 接口: `GET /api/ai-search`
- 响应顶层结构: `mode/query/normalized_query/ai_panel/results/directory/meta`
- `quick_actions[].action` schema
- 降级语义与 `meta.intent_source`
- `reason` 的模板生成定位（非主排序依据）

> 变更规则：
> - 新增可选字段 => `v1.x`
> - 修改字段语义/删除字段/改必填性 => `v2`
