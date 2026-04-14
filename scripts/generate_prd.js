const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents,
  LevelFormat, ExternalHyperlink, ImageRun
} = require('docx');
const fs = require('fs');
const path = require('path');

// Color palette
const HEADER_BG = "1F4E79";
const HEADER_TEXT = "FFFFFF";
const ACCENT_COLOR = "2E75B6";
const LIGHT_BG = "D6E3F0";
const ROW_ALT_BG = "F2F7FB";
const BORDER_COLOR = "B8CCE4";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };

function createParagraph(text, options = {}) {
  const { bold = false, size = 22, color = "000000", heading, spacing = {}, alignment = AlignmentType.LEFT } = options;
  const runOptions = { text, bold, size, color, font: "Arial" };
  const paraOptions = {
    alignment,
    spacing: { before: 120, after: 120, ...spacing },
    children: [new TextRun(runOptions)]
  };
  if (heading) paraOptions.heading = heading;
  return new Paragraph(paraOptions);
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, bold: true, size: 36, color: HEADER_BG, font: "Arial" })]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, size: 28, color: ACCENT_COLOR, font: "Arial" })]
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: "333333", font: "Arial" })]
  });
}

function createBullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function createTable(headers, rows, columnWidths) {
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: columnWidths[i], type: WidthType.DXA },
      shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, size: 20, color: HEADER_TEXT, font: "Arial" })]
      })]
    }))
  });

  const dataRows = rows.map((row, rowIdx) => new TableRow({
    children: row.map((cell, cellIdx) => new TableCell({
      borders,
      width: { size: columnWidths[cellIdx], type: WidthType.DXA },
      shading: { fill: rowIdx % 2 === 0 ? "FFFFFF" : ROW_ALT_BG, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        children: [new TextRun({ text: String(cell || ""), size: 20, font: "Arial" })]
      })]
    }))
  }));

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths,
    rows: [headerRow, ...dataRows]
  });
}

function createSection(title, content) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    createHeading1(title),
    ...content
  ];
}

// Helper to embed screenshot with caption
function createScreenshot(imagePath, caption, widthPx = 600) {
  const fullPath = path.join(__dirname, '..', 'output', 'screenshots', imagePath);
  if (!fs.existsSync(fullPath)) {
    return [
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: `[截图缺失: ${imagePath}]`, size: 20, color: "FF0000", font: "Arial", italics: true })]
      })
    ];
  }
  const imageData = fs.readFileSync(fullPath);
  const imageExt = path.extname(imagePath).toLowerCase().slice(1); // png, jpg, etc.

  // Scale image to fit within max width (maintaining aspect ratio)
  const aspectRatio = 16 / 9; // Default assumption
  const heightPx = Math.round(widthPx / aspectRatio);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new ImageRun({
          type: imageExt,
          data: imageData,
          transformation: { width: widthPx, height: heightPx },
          altText: { title: caption, description: caption, name: caption }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 200 },
      children: [new TextRun({ text: caption, size: 18, color: "666666", font: "Arial", italics: true })]
    })
  ];
}

// ====================== DOCUMENT CONTENT ======================

const children = [
  // ===== COVER PAGE =====
  new Paragraph({ spacing: { before: 2400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 300 },
    children: [new TextRun({ text: "星点评", bold: true, size: 72, color: HEADER_BG, font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "Xingdianping", bold: false, size: 36, color: ACCENT_COLOR, font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "AI工具点评与发现平台", bold: true, size: 32, color: "333333", font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 1200 },
    children: [new TextRun({ text: "产品需求文档（PRD）与用户流程说明", bold: false, size: 28, color: "666666", font: "Arial" })]
  }),
  new Paragraph({ spacing: { before: 1200 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "文档版本：v1.0", size: 22, color: "666666", font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "生成日期：2026-04-14", size: 22, color: "666666", font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "状态：已完成", size: 22, color: "666666", font: "Arial" })]
  }),

  // ===== TOC =====
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
    children: [new TextRun({ text: "目  录", bold: true, size: 40, color: HEADER_BG, font: "Arial" })]
  }),
  new TableOfContents("目录", {
    hyperlink: true,
    headingStyleRange: "1-3"
  }),

  // ===== SECTION 1: 项目概述 =====
  ...createSection("一、项目概述", [
    createHeading2("1.1 基本信息"),
    createTable(
      ["项目名称", "内容"],
      [
        ["项目名称", "星点评 (Xingdianping)"],
        ["项目定位", "AI 工具点评与发现平台，\"AI 工具界的豆瓣\""],
        ["核心价值", "帮助用户发现、比较和推荐 AI 工具，解决\"找 AI 工具时一个个试\"的痛点"],
        ["建设目标", "成为用户寻找、评测与获取 AI 智能体的首选入口与信任平台"],
        ["产品定位", "AI Agent 时代的公共点评社区"],
        ["使用对象", "需要发现、比较和选择 AI 工具的用户"],
        ["技术栈", "FastAPI + Next.js + MySQL + Redis"]
      ],
      [3000, 6360]
    ),

    createHeading2("1.2 项目背景"),
    createParagraph("星点评是一个开源的 AI 工具点评平台，目标是通过社区化运营和专业编辑内容，帮助用户快速找到适合自己场景的 AI 工具。"),
    createParagraph("当前处于 MVP 阶段，已完成核心功能：工具目录浏览、工具详情查看、AI 搜索推荐、工具对比、榜单场景、用户认证等基础能力。"),

    createHeading2("1.3 系统界面总览"),
    createParagraph("以下是系统主要界面截图："),
    ...createScreenshot("01-homepage.png", "图 1-1 首页 - 搜索入口、分类导航、场景入口", 620),
  ]),

  // ===== SECTION 2: 系统整体说明 =====
  ...createSection("二、系统整体说明", [
    createHeading2("2.1 系统组成"),
    createBullet("后端：FastAPI 0.115+ / Python 3.11+ / SQLAlchemy 2.0 / Alembic / Pydantic"),
    createBullet("前端：Next.js 15.2+ / React 19 / TypeScript 5.8+ / Tailwind CSS 4.1+"),
    createBullet("数据库：MySQL 8.4 / Redis 7.4"),
    createBullet("基础设施：Docker Compose（可选）"),

    createHeading2("2.2 前后端架构"),
    createParagraph("系统采用前后端分离架构："),
    createBullet("前端基于 Next.js App Router，通过 Server Components 和 Client Components 组织页面"),
    createBullet("后端基于 FastAPI，通过 REST API 与前端通信"),
    createBullet("前后端共享类型定义，通过 packages/contracts 维护"),
    createBullet("API Base URL: http://localhost:8000（开发环境）"),

    createHeading2("2.3 角色构成"),
    createTable(
      ["角色", "能力边界"],
      [
        ["游客（未登录用户）", "浏览工具目录、搜索筛选、查看工具详情、榜单、场景、AI 导购对话"],
        ["注册用户", "享受游客全部能力 + 登录态管理（推测：提交工具评论、收藏等）"],
        ["管理员", "推测：工具审核、用户管理、榜单配置（当前代码中未发现管理后台）"]
      ],
      [2500, 6860]
    ),

    createHeading2("2.4 核心业务闭环"),
    createParagraph("浏览 → 搜索/筛选 → AI 推荐 → 工具详情 → 对比 → 访问官网"),
    createParagraph("具体流程："),
    createBullet("用户在首页搜索框输入需求（关键词或自然语言）"),
    createBullet("进入工具目录页看到筛选结果"),
    createBullet("可进一步筛选分类/标签/价格等维度"),
    createBullet("点击工具卡片进入详情页了解完整信息"),
    createBullet("可返回目录勾选多个工具进行对比"),
    createBullet("进入对比页横向比较后，点击\"访问官网\"跳转外部"),
  ]),

  // ===== SECTION 3: 用户角色与权限 =====
  ...createSection("三、用户角色与权限", [
    createHeading2("3.1 权限控制机制"),
    createParagraph("系统使用基于 Session Cookie 的身份验证机制："),
    createBullet("登录成功后，服务端创建 UserSession 记录"),
    createBullet("Session Token 使用 secrets.token_urlsafe(48) 生成（安全随机）"),
    createBullet("Cookie 设置为 HttpOnly=True（防止 XSS）"),
    createBullet("Session 默认有效期 7 天（session_ttl_seconds）"),
    createBullet("新登录时会撤销旧 Session（支持多设备但单设备单会话）"),
    createBullet("Cookie 名称：xingdianping_session（可配置）"),

    createHeading2("3.2 认证 API"),
    createTable(
      ["接口", "方法", "说明"],
      [
        ["/api/auth/register", "POST", "用户注册"],
        ["/api/auth/login", "POST", "用户登录"],
        ["/api/auth/logout", "POST", "用户登出"],
        ["/api/auth/me", "GET", "获取当前用户信息"]
      ],
      [3000, 1500, 4860]
    ),

    createHeading2("3.3 密码安全"),
    createBullet("密码使用 bcrypt 加密（带 $bcrypt_sha256$ 前缀）"),
    createBullet("超过 72 字节的密码会先用 SHA256 压缩再加密"),
    createBullet("Session Token 存储 SHA256 哈希值，不存储明文"),
  ]),

  // ===== SECTION 4: 功能架构 =====
  ...createSection("四、功能架构", [
    createHeading2("4.1 一级模块总览"),
    createTable(
      ["模块", "功能说明", "完成度"],
      [
        ["工具目录模块", "分类/标签/价格筛选、关键词搜索、AI 智能搜索", "已实现"],
        ["工具详情模块", "完整信息展示、优缺点、点评、场景推荐", "已实现"],
        ["AI 搜索与推荐", "意图解析、向量召回、快捷动作", "已实现（需配置 LLM）"],
        ["工具对比模块", "2-3 工具横向对比表格", "已实现"],
        ["榜单模块", "编辑精选榜单展示", "已实现"],
        ["场景模块", "按人群/任务组织工具入口", "已实现"],
        ["用户认证模块", "注册/登录/登出/会话管理", "已实现"],
        ["AI 导购对话模块", "RAG 流式对话（SSE）", "已实现（需配置 LLM）"],
        ["命令面板模块", "全局搜索 + 意图识别", "已实现"]
      ],
      [2800, 4000, 1560]
    ),

    createHeading2("4.2 模块依赖关系"),
    createParagraph("工具详情 → 依赖 → 工具目录（入口）"),
    createParagraph("工具对比 → 依赖 → 工具目录（勾选工具）"),
    createParagraph("AI 搜索 → 依赖 → 向量召回服务（embedding）"),
    createParagraph("AI 导购 → 依赖 → 向量召回 + LLM 服务"),
    createParagraph("用户认证 → 依赖 → Session 管理（独立模块）"),
  ]),

  // ===== SECTION 5: 详细功能说明 =====
  ...createSection("五、详细功能说明", [
    createHeading2("5.1 工具目录功能"),
    createHeading3("功能概述"),
    createParagraph("帮助用户快速找到符合需求的 AI 工具，通过分类、标签、价格、访问条件等维度筛选，支持关键词搜索和 AI 智能搜索。"),
    createHeading3("入口位置"),
    createBullet("首页快捷入口"),
    createBullet("导航栏\"工具目录\""),
    createHeading3("页面组成"),
    createBullet("顶部搜索栏（模式切换 + 搜索输入 + 快捷筛选）"),
    createBullet("左侧筛选面板（分类 / 价格 / 访问条件 / 标签）"),
    createBullet("中间工具卡片网格"),
    createBullet("底部分页导航"),
    createBullet("AI 理解面板（仅 AI 模式）"),
    createHeading3("调用接口"),
    createBullet("GET /api/tools - 工具目录"),
    createBullet("GET /api/ai-search - AI 搜索"),
    createBullet("GET /api/tools/search-index - 搜索索引"),
    createHeading3("业务规则"),
    createBullet("默认按 featured 和 score 降序排序"),
    createBullet("支持分页，每页最多 24 条"),
    createBullet("AI 模式会调用 LLM 进行意图解析并展示理解面板"),

    createHeading2("5.2 工具详情功能"),
    createHeading3("功能概述"),
    createParagraph("展示单个工具的完整信息，帮助用户决策是否使用该工具。"),
    createHeading3("入口位置"),
    createBullet("工具卡片点击"),
    createBullet("搜索结果"),
    createBullet("对比页工具名称"),
    createHeading3("页面组成"),
    createBullet("面包屑导航"),
    createBullet("Hero 区（logo、名称、评分、简介、访问官网按钮）"),
    createBullet("主体内容区（描述、优缺点、避坑指南、场景推荐、工具信息、标签、开发者点评）"),
    createBullet("右侧边栏（同类工具推荐）"),
    createHeading3("调用接口"),
    createBullet("GET /api/tools/{slug} - 获取工具详情"),

    createHeading2("5.3 工具对比功能"),
    createHeading3("功能概述"),
    createParagraph("支持 2-3 个工具横向对比，通过表格形式展示关键维度差异。"),
    createHeading3("入口位置"),
    createParagraph("工具目录页勾选工具 → 点击\"开始对比\"按钮"),
    createHeading3("对比维度"),
    createTable(
      ["维度", "说明"],
      [
        ["评分", "工具评分和点评数量"],
        ["定价类型", "免费 / 免费增值 / 订阅 / 一次性付费 / 联系销售"],
        ["免费额度", "免费试用说明"],
        ["中文界面", "是否支持中文"],
        ["国内直连", "是否需要 VPN"],
        ["国内支付", "是否支持国内支付方式"],
        ["价格区间", "按人民币价格分组"],
        ["主要用途", "工具简介"],
        ["适合人群", "目标用户群"],
        ["避坑摘要", "不适合的场景和注意事项"]
      ],
      [3000, 6360]
    ),

    createHeading2("5.4 AI 搜索与推荐功能"),
    createHeading3("功能概述"),
    createParagraph("通过自然语言理解用户需求，调用 LLM 解析意图，结合向量召回返回匹配工具。"),
    createHeading3("核心逻辑"),
    createBullet("意图解析：调用 LLM 将用户需求解析为结构化 JSON（intent_summary、task、constraints、quick_actions）"),
    createBullet("向量召回：通过 embedding 相似度匹配相关工具"),
    createBullet("AI 推荐：当无直接匹配时，使用 AI 进行二次推荐"),
    createHeading3("缓存策略"),
    createBullet("热门查询词（如 ppt、周报、视频剪辑等）：缓存 24 小时"),
    createBullet("普通查询词：缓存 1 小时"),
    createHeading3("异常处理"),
    createParagraph("LLM 调用失败时降级为规则匹配（_build_default_intent）"),

    createHeading2("5.5 AI 导购对话功能"),
    createHeading3("功能概述"),
    createParagraph("浮窗式 AI 助手，基于 RAG 的流式对话（SSE），解答用户关于 AI 工具的疑问。"),
    createHeading3("核心逻辑"),
    createBullet("RAG 上下文：根据用户查询向量召回相关工具信息"),
    createBullet("对话历史：保留最近 10 轮对话（MAX_CONVERSATION_PAIRS = 10）"),
    createBullet("短消息处理：识别确认类消息并回退到上一轮召回"),
    createBullet("SSE 流式输出：每个 chunk 为 data: {\"content\": \"...\"}"),
    createHeading3("快捷问题"),
    createParagraph("系统预置快捷问题按钮，用户可一键发送常见问题"),

    createHeading2("5.6 命令面板功能"),
    createHeading3("功能概述"),
    createParagraph("Cmd+K（或 Ctrl+K）打开，支持自然语言意图识别的全局搜索。"),
    createHeading3("功能特点"),
    createBullet("模糊匹配工具列表（Fuse.js）"),
    createBullet("自然语言意图识别（parseSearchIntent）"),
    createBullet("已识别意图高亮显示（分类 / 价格）"),
    createBullet("支持直接跳转到工具详情或进入完整目录搜索"),

    createHeading2("5.7 榜单功能"),
    createHeading3("功能概述"),
    createParagraph("展示编辑精选的工具榜单，按主题展示工具优先级和推荐理由。"),
    createHeading3("调用接口"),
    createBullet("GET /api/rankings - 获取榜单列表"),
    createBullet("GET /api/rankings/{slug} - 获取榜单详情"),

    createHeading2("5.8 场景功能"),
    createHeading3("功能概述"),
    createParagraph("按真实使用场景组织工具入口，按人群和任务场景聚合工具。"),
    createHeading3("调用接口"),
    createBullet("GET /api/scenarios - 获取场景列表"),
    createBullet("GET /api/scenarios/{slug} - 获取场景详情"),

    createHeading2("5.9 用户认证功能"),
    createHeading3("功能概述"),
    createParagraph("支持用户注册、登录、登出、会话管理。"),
    createHeading3("业务规则"),
    createTable(
      ["规则项", "内容"],
      [
        ["用户名唯一性", "用户名唯一，邮箱唯一"],
        ["密码加密", "bcrypt_sha256 加密"],
        ["Session 生成", "secrets.token_urlsafe(48)"],
        ["Session 存储", "SHA256 哈希值"],
        ["Session 有效期", "默认 7 天"],
        ["多设备支持", "创建新 Session 时撤销旧 Session"]
      ],
      [3500, 5860]
    ),
  ]),

  // ===== SECTION 6: 页面清单 =====
  ...createSection("六、页面清单", [
    createTable(
      ["页面", "路由", "文件位置", "功能说明"],
      [
        ["首页", "/", "apps/web/app/page.tsx", "搜索入口、分类入口、场景入口、热门工具"],
        ["工具目录", "/tools", "apps/web/app/tools/page.tsx", "工具列表、筛选、搜索、AI 帮找"],
        ["工具详情", "/tools/[slug]", "apps/web/app/tools/[slug]/page.tsx", "单个工具完整信息"],
        ["场景列表", "/scenarios", "apps/web/app/scenarios/page.tsx", "场景入口列表"],
        ["场景详情", "/scenarios/[slug]", "apps/web/app/scenarios/[slug]/page.tsx", "场景详情及工具"],
        ["榜单列表", "/rankings", "apps/web/app/rankings/page.tsx", "榜单列表"],
        ["工具对比", "/compare/[slug]", "apps/web/app/compare/[comparisonSlug]/page.tsx", "2-3 工具对比表"],
        ["认证页", "/auth", "apps/web/app/auth/page.tsx", "登录 / 注册表单"],
        ["Matches 页", "/matches", "apps/web/app/matches/page.tsx", "好友匹配功能（mock 数据，疑似废弃）"]
      ],
      [1800, 1600, 3000, 2960]
    ),
  ]),

  // ===== SECTION 7: 接口清单 =====
  ...createSection("七、接口清单", [
    createTable(
      ["接口", "方法", "路径", "主要入参", "返回", "功能"],
      [
        ["获取工具目录", "GET", "/api/tools", "q, category, tag, status, price, access, price_range, sort, view, page, page_size", "ToolsDirectoryResponse", "工具列表 + 筛选条件 + 聚合数据"],
        ["获取工具详情", "GET", "/api/tools/{slug}", "slug", "ToolDetail", "单个工具完整信息"],
        ["获取搜索索引", "GET", "/api/tools/search-index", "-", "ToolSummary[]", "全量工具摘要供前端本地搜索"],
        ["预览验证", "GET", "/api/tools/import-preview/validation", "-", "ValidationReport", "数据导入预览验证"],
        ["AI 搜索", "GET", "/api/ai-search", "q, category, tag, price, access, price_range, sort, view, page, page_size", "AiSearchResponse", "AI 意图解析 + 工具推荐"],
        ["获取分类列表", "GET", "/api/categories", "include_empty", "CategorySummary[]", "分类列表"],
        ["获取分类下工具", "GET", "/api/categories/{slug}/tools", "slug", "ToolSummary[]", "指定分类的工具"],
        ["获取榜单列表", "GET", "/api/rankings", "-", "RankingSection[]", "榜单列表"],
        ["获取榜单详情", "GET", "/api/rankings/{slug}", "slug", "RankingSection", "榜单详情 + 工具"],
        ["获取场景列表", "GET", "/api/scenarios", "-", "ScenarioSummary[]", "场景列表"],
        ["获取场景详情", "GET", "/api/scenarios/{slug}", "slug", "ScenarioSummary", "场景详情 + 工具"],
        ["用户注册", "POST", "/api/auth/register", "username, email, password, confirmPassword, agreed", "AuthUserResponse", "注册并登录"],
        ["用户登录", "POST", "/api/auth/login", "identifier, password", "AuthUserResponse", "登录"],
        ["用户登出", "POST", "/api/auth/logout", "-", "204", "登出"],
        ["获取当前用户", "GET", "/api/auth/me", "-", "AuthUserResponse", "获取登录用户信息"],
        ["AI 推荐", "POST", "/api/recommend", "query, scenario, tags, candidateSlugs", "RecommendItem[]", "工具推荐"],
        ["对话", "POST", "/api/chat", "messages: [{role, content}]", "SSE stream", "RAG 流式对话"],
        ["创建抓取任务", "POST", "/api/crawl/jobs", "source_name", "CrawlJob", "触发抓取（mock）"]
      ],
      [2000, 1200, 2200, 2200, 2000, 2760]
    ),
  ]),

  // ===== SECTION 8: 数据实体说明 =====
  ...createSection("八、数据实体与数据库说明", [
    createHeading2("8.1 核心实体"),
    createParagraph("数据库包含以下核心实体关系，详情见下方数据表说明。"),

    createHeading2("8.2 Tool（工具）"),
    createTable(
      ["字段", "类型", "说明"],
      [
        ["id", "int", "主键"],
        ["slug", "string", "URL 友好标识，唯一"],
        ["name", "string", "工具名称，唯一"],
        ["category_name", "string", "分类名称"],
        ["summary", "string", "简短摘要"],
        ["description", "string", "详细描述"],
        ["editor_comment", "string", "编辑评语"],
        ["developer", "string", "开发者"],
        ["country", "string", "国家"],
        ["city", "string", "城市"],
        ["price", "string", "价格描述"],
        ["platforms", "string", "支持平台"],
        ["vpn_required", "string", "VPN 要求"],
        ["access_flags", "JSON", "访问标志（needsVpn, cnLang, cnPayment）"],
        ["official_url", "string", "官网 URL"],
        ["logo_path", "string", "Logo 路径"],
        ["score", "float", "评分"],
        ["review_count", "int", "点评数"],
        ["status", "string", "状态（published/draft/archived）"],
        ["featured", "bool", "是否精选"],
        ["pricing_type", "string", "定价类型"],
        ["created_on", "date", "创建日期"],
        ["last_verified_at", "date", "最后验证时间"]
      ],
      [2800, 1500, 5060]
    ),

    createHeading2("8.3 User（用户）"),
    createTable(
      ["字段", "类型", "说明"],
      [
        ["id", "int", "主键"],
        ["username", "string", "用户名，唯一"],
        ["email", "string", "邮箱，唯一"],
        ["password_hash", "string", "密码哈希"],
        ["status", "string", "状态（active）"],
        ["agreed_terms_at", "datetime", "同意协议时间"],
        ["last_login_at", "datetime", "最后登录时间"]
      ],
      [2800, 1500, 5060]
    ),

    createHeading2("8.4 UserSession（用户会话）"),
    createTable(
      ["字段", "类型", "说明"],
      [
        ["id", "int", "主键"],
        ["user_id", "int", "外键 → User"],
        ["session_token_hash", "string", "Session Token 的 SHA256 哈希，唯一"],
        ["expires_at", "datetime", "过期时间"],
        ["revoked_at", "datetime", "撤销时间（null=有效）"],
        ["user_agent", "string", "客户端 User-Agent"],
        ["ip_address", "string", "客户端 IP"]
      ],
      [2800, 1500, 5060]
    ),

    createHeading2("8.5 Category / Scenario / Ranking / ToolReview / ToolEmbedding"),
    createParagraph("Category（分类）：id, slug, name, description"),
    createParagraph("Scenario（场景）：id, slug, title, description, problem, tool_count"),
    createParagraph("Ranking（榜单）：id, slug, title, description"),
    createParagraph("ToolReview（工具点评）：id, tool_id, user_id, source_type, status, rating, title, body, pros_json, cons_json, pitfalls_json, audience, task"),
    createParagraph("ToolEmbedding（工具向量）：id, tool_id, provider, model, content_hash, source_text, embedding_json"),
  ]),

  // ===== SECTION 9: 用户流程与业务流程 =====
  ...createSection("九、用户流程与业务流程", [
    createHeading2("9.1 主用户流程：工具发现与决策"),
    createParagraph("流程目标：帮助用户从\"不知道选什么工具\"到\"确定访问哪个工具官网\"。"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程步骤：", bold: true, size: 22, font: "Arial" })] }),
    createBullet("1. 用户访问首页"),
    createBullet("2. 在首页搜索框输入需求（可选切换 AI 帮找模式）"),
    createBullet("3. 进入工具目录页，看到筛选结果"),
    createBullet("4. 可进一步筛选分类 / 标签 / 价格"),
    createBullet("5. 点击工具卡片进入详情页"),
    createBullet("6. 在详情页了解工具完整信息"),
    createBullet("7. 可返回目录勾选多个工具进行对比"),
    createBullet("8. 进入对比页横向比较"),
    createBullet("9. 点击\"访问官网\"跳转到工具官网"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程解读：", bold: true, size: 22, font: "Arial" })] }),
    createParagraph("该流程覆盖了用户决策的完整链路：需求触发 → 信息检索 → 候选筛选 → 详情了解 → 方案对比 → 最终决策。每个环节都有对应的产品界面支撑。"),

    createHeading2("9.2 AI 搜索流程"),
    createParagraph("流程目标：通过自然语言理解用户需求，精准推荐工具。"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程步骤：", bold: true, size: 22, font: "Arial" })] }),
    createBullet("1. 用户切换到\"AI 帮找\"模式"),
    createBullet("2. 输入自然语言需求（如\"帮我找免费的 PPT 工具\"）"),
    createBullet("3. 后端调用 LLM 解析意图（_call_intent_llm）"),
    createBullet("4. 返回结构化理解面板（ai_panel：你的需求、系统理解、筛选逻辑）"),
    createBullet("5. 用户可点击快捷动作按钮（如\"只看免费\"）"),
    createBullet("6. 系统返回匹配的工具列表"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程解读：", bold: true, size: 22, font: "Arial" })] }),
    createParagraph("AI 搜索模式通过 LLM 将模糊需求转化为结构化筛选条件，结合向量召回提升召回率，同时通过快捷动作降低用户操作成本。"),

    createHeading2("9.3 用户注册登录流程"),
    createParagraph("流程目标：建立用户身份，支持个性化功能和会话管理。"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "注册流程：", bold: true, size: 22, font: "Arial" })] }),
    createBullet("1. 用户点击\"注册\""),
    createBullet("2. 填写用户名 / 邮箱 / 密码 / 确认密码"),
    createBullet("3. 勾选用户协议"),
    createBullet("4. 点击注册"),
    createBullet("5. 后端验证唯一性，创建用户和 Session"),
    createBullet("6. 返回用户信息，设置 HttpOnly Cookie"),
    createBullet("7. 前端刷新页面获取登录状态"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "登录流程：", bold: true, size: 22, font: "Arial" })] }),
    createBullet("1. 用户点击\"登录\""),
    createBullet("2. 填写用户名或邮箱 + 密码"),
    createBullet("3. 点击登录"),
    createBullet("4. 后端验证，创建 Session"),
    createBullet("5. 登录成功跳转"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "登出流程：", bold: true, size: 22, font: "Arial" })] }),
    createBullet("1. 用户点击登出"),
    createBullet("2. 后端撤销 Session"),
    createBullet("3. 清除 Cookie"),
    createBullet("4. 跳转首页"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程解读：", bold: true, size: 22, font: "Arial" })] }),
    createParagraph("认证流程采用标准的 Session-Cookie 模式，相比 JWT 方案更适合有服务端渲染的前端架构。HttpOnly Cookie 可有效防止 XSS 攻击。"),

    createHeading2("9.4 RAG 对话流程"),
    createParagraph("流程目标：通过 AI 助手即时解答用户关于 AI 工具的疑问。"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程步骤：", bold: true, size: 22, font: "Arial" })] }),
    createBullet("1. 用户点击右下角\"智能选型\"按钮"),
    createBullet("2. 打开对话面板"),
    createBullet("3. 输入问题或点击快捷问题"),
    createBullet("4. 后端提取用户查询（_extract_user_query）"),
    createBullet("5. 通过 embedding 召回相关工具（recall_tool_ids_by_embedding）"),
    createBullet("6. 构建 RAG 上下文和 System Prompt"),
    createBullet("7. 调用 LLM 生成回答（stream_chat_rag）"),
    createBullet("8. SSE 流式返回结果"),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "流程解读：", bold: true, size: 22, font: "Arial" })] }),
    createParagraph("RAG 对话结合了向量召回和 LLM 生成，既能保证答案基于平台真实数据，又能提供自然语言交互体验。对话历史保留最近 10 轮，避免上下文过长。"),
  ]),

  // ===== SECTION 10: 非功能性说明 =====
  ...createSection("十、非功能性说明", [
    createHeading2("10.1 安全"),
    createBullet("Session Token 使用 secrets.token_urlsafe(48) 生成，安全随机"),
    createBullet("Session Token 存储 SHA256 哈希值，不存储明文"),
    createBullet("密码使用 bcrypt 加密（带 sha256 前缀）"),
    createBullet("Cookie 设置 HttpOnly=True，防止 XSS"),
    createBullet("支持 cookie_secure 配置（生产环境应开启）"),

    createHeading2("10.2 性能"),
    createBullet("工具目录使用 Redis 缓存（分类 5 分钟，场景 5 分钟，榜单 1 分钟）"),
    createBullet("向量召回使用余弦相似度，设置 top_k 和 min_similarity 阈值"),
    createBullet("AI 搜索意图解析结果缓存（热门词 24 小时，普通 1 小时）"),
    createBullet("推荐结果缓存 30 分钟"),

    createHeading2("10.3 日志"),
    createBullet("使用 Python logging 模块记录关键操作"),
    createBullet("登录成功 / 失败记录用户名"),
    createBullet("注册冲突记录用户名和邮箱"),
    createBullet("数据库异常记录完整堆栈"),

    createHeading2("10.4 异常处理"),
    createBullet("API 统一返回 HTTP 状态码"),
    createBullet("业务异常返回 422（验证失败）、401（未认证）、404（不存在）、409（冲突）、500（服务器错误）"),
    createBullet("AI 服务异常时发送 SSE 错误事件，不中断流"),

    createHeading2("10.5 可维护性"),
    createBullet("前后端类型共享通过 packages/contracts"),
    createBullet("服务层（services）独立于路由层"),
    createBullet("SQLAlchemy ORM 使用声明式基类"),
    createBullet("配置通过环境变量 / .env 文件管理"),

    createHeading2("10.6 可扩展性"),
    createBullet("AI provider 可配置（stub/openai/volcengine/ark）"),
    createBullet("Embedding provider 可独立配置"),
    createBullet("支持扩展新的 AI 模型和向量服务"),
  ]),

  // ===== SECTION 11: 问题与风险清单 =====
  ...createSection("十一、问题与风险清单", [
    createHeading2("11.1 待确认 / 未闭环功能"),
    createTable(
      ["功能", "状态", "说明"],
      [
        ["工具提交功能", "未实现", "代码中有 TOOL_SUBMISSION_URL 常量，但未实现提交表单"],
        ["工具评论功能", "部分实现", "ToolReview 模型存在，但前端无评论提交入口"],
        ["Matches 功能", "疑似废弃", "存在 matches 页面和 feature 模块，但数据为 mock"],
        ["管理后台", "不存在", "未发现管理员后台相关代码"],
        ["工具更新功能", "未实现", "ToolUpdate 模型存在，但无对应 API"],
        ["抓取功能", "mock 状态", "CrawlJob 和 CrawlSnapshot 模型存在，但 crawl API 仅返回 mock 数据"]
      ],
      [2800, 1500, 5060]
    ),

    createHeading2("11.2 命名不一致风险"),
    createBullet("前端 catalog-types.ts 中 ScenarioSummary.primaryTools 和 alternativeTools 为 ToolSummary[]，而后端返回的为 ToolSummary 对象（无数组结构）"),
    createBullet("前端 catalog-types.ts 与 packages/contracts/src/index.ts 类型定义有部分差异"),

    createHeading2("11.3 历史遗留"),
    createBullet("archive/drawer/ 目录包含已归档的旧代码，不参与构建"),
    createBullet("start.py 为 legacy 兼容入口，保留但不推荐使用"),

    createHeading2("11.4 潜在问题"),
    createTable(
      ["问题", "严重程度", "说明"],
      [
        ["embedding_recall_min_similarity 默认为 0.2", "中等", "可能过低导致召回不相关结果"],
        ["session_ttl_seconds 默认 7 天", "低", "可能需要可配置"],
        ["密码长度限制在 72 字节", "低", "超长使用 SHA256 压缩"]
      ],
      [3500, 1500, 4360]
    ),
  ]),

  // ===== SECTION 12: 当前完成度与后续建议 =====
  ...createSection("十二、当前完成度与后续建议", [
    createHeading2("12.1 当前系统完成度"),
    createTable(
      ["模块", "完成度", "说明"],
      [
        ["后端 API", "约 75%", "核心 CRUD 和 AI 功能已实现"],
        ["前端页面", "约 80%", "主要页面和交互已完成"],
        ["用户认证", "约 70%", "基础功能具备，第三方登录未实现"],
        ["AI 搜索推荐", "约 65%", "核心逻辑具备，LLM 调用需配置"],
        ["工具对比", "已实现", "-"],
        ["榜单场景", "已实现", "-"],
        ["数据导入", "部分实现", "工具 API 存在，完整导入流程未完成"]
      ],
      [2800, 1500, 5060]
    ),

    createHeading2("12.2 不足之处"),
    createBullet("移动端适配未专门优化"),
    createBullet("无管理后台"),
    createBullet("无数据导出功能"),
    createBullet("无评论审核流程"),
    createBullet("搜索结果排序算法简单"),

    createHeading2("12.3 可迭代方向"),
    createBullet("管理后台开发（工具审核、用户管理、榜单配置）"),
    createBullet("用户评论系统完善（提交、点赞、回复）"),
    createBullet("个性化推荐（基于用户浏览历史）"),
    createBullet("工具收藏 / 关注功能"),
    createBullet("第三方登录（GitHub / Google）"),
    createBullet("数据导出（Excel / JSON）"),
    createBullet("多语言支持"),
  ]),

  // ===== SECTION 13: 系统截图 =====
  ...createSection("十三、系统截图", [
    createHeading2("13.1 首页"),
    ...createScreenshot("01-homepage.png", "图 13-1 首页", 650),

    createHeading2("13.2 工具目录页"),
    ...createScreenshot("02-tools-page.png", "图 13-2 工具目录页 - 筛选面板 + 工具卡片网格", 650),

    createHeading2("13.3 工具详情页"),
    ...createScreenshot("03-tool-detail.png", "图 13-3 工具详情页", 650),

    createHeading2("13.4 工具对比页"),
    ...createScreenshot("04-compare-page.png", "图 13-4 工具对比页 - 横向对比表格", 650),

    createHeading2("13.5 场景页"),
    ...createScreenshot("05-scenarios-page.png", "图 13-5 场景页 - 按人群/任务组织工具入口", 650),

    createHeading2("13.6 榜单页"),
    ...createScreenshot("06-rankings-page.png", "图 13-6 榜单页 - 编辑精选榜单", 650),

    createHeading2("13.7 认证页"),
    ...createScreenshot("07-auth-page.png", "图 13-7 认证页 - 登录/注册表单", 650),

    createHeading2("13.8 命令面板"),
    ...createScreenshot("08-command-palette.png", "图 13-8 命令面板 - Cmd+K 全局搜索 + 意图识别", 650),
  ]),

  // ===== END =====
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 300 },
    children: [new TextRun({ text: "— 文档结束 —", bold: true, size: 24, color: "999999", font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "星点评产品需求文档 v1.0 | 2026-04-14", size: 20, color: "999999", font: "Arial" })]
  }),
];

// ====================== CREATE DOCUMENT ======================

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: HEADER_BG },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: ACCENT_COLOR },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4 portrait in DXA (8.27 x 11.69 inches)
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_COLOR, space: 1 } },
          children: [new TextRun({ text: "星点评产品需求文档（PRD）v1.0", size: 18, color: "666666", font: "Arial" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_COLOR, space: 1 } },
          children: [
            new TextRun({ text: "第 ", size: 18, color: "666666", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "666666", font: "Arial" }),
            new TextRun({ text: " 页 | 星点评 Xingdianping", size: 18, color: "666666", font: "Arial" })
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("d:/codespace/workfile/output/星点评PRD_v2.0.docx", buffer);
  console.log("Document generated: d:/codespace/workfile/output/星点评PRD_v2.0.docx");
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
