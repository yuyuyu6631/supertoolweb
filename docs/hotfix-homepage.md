# 首页紧急修正清单

## 问题概述

本次修正针对以下3个"红线级"问题：

| # | 问题 | 严重程度 | 涉及文件 |
|---|------|----------|----------|
| 1 | 快速决策入口显示"0个结果" | 致命 | `HomePage.tsx` |
| 2 | detectPriceLabel未优先检查pricingType字段 | 高 | `tool-display.ts` |
| 3 | accessFlags传参遗漏 | 高 | `HomePage.tsx` |

---

## 修改方案

### 1. 过滤count为0的presets入口

**文件**: `apps/web/src/app/pages/HomePage.tsx`

**问题**: 快速决策入口显示"X个结果"，部分preset因count=0导致空列表

**现状**: 第90行 `presets.slice(0, 4).map` 未过滤count=0的项

**修改**: 过滤掉count为0的presets

```typescript
// 第90行，修改presets渲染逻辑
{presets.filter(p => p.count > 0).slice(0, 4).map((preset) => (
```

---

### 2. 修正detectPriceLabel函数

**文件**: `apps/web/src/app/lib/tool-display.ts`

**问题**: ChatGPT等工具的`pricingType`字段未被优先检查，导致被错误标注为"一次性付费"等

**现状**: `detectPriceLabel` 函数仅通过文本匹配判断，未检查后端提供的`pricingType`字段

**修改**: 优先检查`pricingType`字段，再fallback到文本匹配

```typescript
// 第3-12行，修正后的逻辑
export function detectPriceLabel(tool: Pick<ToolSummary, "price" | "name" | "summary" | "tags">) {
  const text = `${tool.price} ${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();

  // 优先检查pricingType字段（后端更准确）
  if (tool.pricingType === "free") return "free";
  if (tool.pricingType === "freemium") return "freemium";
  if (tool.pricingType === "subscription") return "subscription";
  if (tool.pricingType === "one_time") return "one-time";

  // 然后检查文本内容
  if (text.includes("免费") || text.includes("free")) return "free";
  if (text.includes("免费增值") || text.includes("freemium")) return "freemium";
  if (text.includes("订阅") || text.includes("月付") || text.includes("yearly") || text.includes("monthly") || text.includes("subscription")) {
    return "subscription";
  }
  if (text.includes("付费") || text.includes("一次性") || text.includes("lifetime")) return "one-time";
  return null;
}
```

**注意**: 后端`pricingType`使用`one_time`，前端映射为`one-time`

---

### 3. 传递accessFlags给ToolCard

**文件**: `apps/web/src/app/pages/HomePage.tsx`

**问题**: ToolCard需要展示访问条件标签（"无需翻墙"、"需翻墙"等），但featuredTools未传递accessFlags

**现状**: 第188-203行 ToolCard调用缺少 `accessFlags` prop

**修改**: 传递 `accessFlags={tool.accessFlags}`

```typescript
// 第199行，在ToolCard调用中添加
<ToolCard
  key={tool.slug}
  slug={tool.slug}
  name={tool.name}
  summary={tool.summary}
  tags={tool.tags}
  url={tool.officialUrl}
  logoPath={tool.logoPath}
  score={tool.score}
  reviewCount={tool.reviewCount}
  accessFlags={tool.accessFlags}  // 添加这行
  priceLabel={detectPriceLabel(tool)}
  decisionBadges={buildDecisionBadges({ price: tool.price, summary: tool.summary, tags: tool.tags })}
/>
```

---

## 完整修改清单

| 文件 | 修改内容 |
|------|----------|
| `apps/web/src/app/pages/HomePage.tsx` | 1. 过滤count为0的presets<br>2. 传递accessFlags给ToolCard |
| `apps/web/src/app/lib/tool-display.ts` | 修正detectPriceLabel函数，优先检查pricingType字段 |

---

## 已确认正常的功能（无需修改）

以下功能经代码确认已正常工作，无需修正：

| 功能 | 代码位置 | 现状 |
|------|----------|------|
| 评分0时显示"新品上线" | `tool-display.ts` 第27-32行 `getScoreBadge` | ✅ 正常 |
| 访问条件标签渲染 | `ToolCard.tsx` 第59行 `buildAccessBadges` | ✅ 正常 |
| 访问条件标签样式 | `ToolCard.tsx` 第107-111行 | ✅ 正常 |

**访问条件标签说明**: ToolCard通过`buildAccessBadges(accessFlags)`渲染标签，实际显示文案为：
- `needsVpn === false` → "无需翻墙"
- `needsVpn === true` → "需翻墙"
- `cnLang === true` → "中文界面"
- `cnPayment === true` → "支持国内支付"

---

## 验证要点

修改完成后，请验证：

1. 首页"快速决策"区域不再显示0个结果的入口
2. ChatGPT等订阅制工具显示"订阅"标签而非"一次性付费"
3. 精选工具卡片正确显示访问条件标签（无需翻墙/需翻墙）
4. 评分不足5条的工具显示"新品上线"而非"★ 0.0"
