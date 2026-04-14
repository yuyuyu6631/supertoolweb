const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
        BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
        TableOfContents, ExternalHyperlink } = require('docx');
const fs = require('fs');

// Constants
const CONTENT_WIDTH = 9360; // A4 with 1" margins
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;

// Border style
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// Helper: Create heading paragraph
function createHeading(text, level) {
  return new Paragraph({
    heading: level,
    children: [new TextRun(text)]
  });
}

// Helper: Create paragraph
function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: 200 },
    ...options,
    children: [new TextRun({ text, ...options.run })]
  });
}

// Helper: Create bullet
function createBullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun(text)]
  });
}

// Helper: Create numbered item
function createNumbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    children: [new TextRun(text)]
  });
}

// Helper: Create table
function createTable(headers, rows, columnWidths) {
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: columnWidths[i], type: WidthType.DXA },
      shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
    }))
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders,
      width: { size: columnWidths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun(String(cell))] })]
    }))
  }));

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths,
    rows: [headerRow, ...dataRows]
  });
}

// Helper: Space
function space() {
  return new Paragraph({ children: [new TextRun("")] });
}

// Create document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 24 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: { spacing: { before: 400, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 300, after: 180 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 }
      }
    ]
  },
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
        }, {
          level: 1,
          format: LevelFormat.BULLET,
          text: "\u25E6",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "星点评产品需求文档 v1.0", color: "666666", size: 20 })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "第 ", size: 20 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 20 }),
            new TextRun({ text: " 页", size: 20 })
          ]
        })]
      })
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 400 },
        children: [new TextRun({ text: "星点评", font: "Arial", size: 72, bold: true, color: "1F4E79" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "AI工具点评与发现平台", font: "Arial", size: 48, color: "2E75B6" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "产品需求文档 v1.0", font: "Arial", size: 32 })]
      }),
      space(),

      // Table of Contents
      new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== Section 1 ====================
      createHeading("1. 产品概述", HeadingLevel.HEADING_1),
      createHeading("1.1 产品定位", HeadingLevel.HEADING_2),
      createParagraph("星点评是一个AI工具点评与发现平台，定位为「AI工具界的豆瓣」，旨在帮助用户发现、比较和推荐优质AI工具。"),
      createParagraph("核心价值主张：让用户通过真实点评和场景化组织，更高效地找到适合自己任务的AI工具。"),

      createHeading("1.2 目标用户", HeadingLevel.HEADING_2),
      createTable(
        ["用户类型", "特征描述", "核心诉求"],
        [
          ["运营人员", "需要快速产出文案、策划内容", "写作工具、PPT工具"],
          ["产品经理", "需要做原型、写PRD、数据分析", "办公、编程类工具"],
          ["开发者", "需要编程辅助、代码生成", "IDE插件、代码生成工具"],
          ["设计师", "需要视觉内容创作", "图像、视频生成工具"],
          ["企业用户", "需要智能体平台、工作流", "Agent平台、知识库工具"]
        ],
        [2000, 4000, 3360]
      ),
      space(),

      createHeading("1.3 技术栈", HeadingLevel.HEADING_2),
      createTable(
        ["层级", "技术选型"],
        [
          ["前端", "Next.js 15.2+, React 19, TypeScript 5.8+, Tailwind CSS 4.1+"],
          ["后端", "FastAPI 0.115+, Python 3.11+, SQLAlchemy 2.0, Pydantic"],
          ["数据库", "MySQL 8.4, Redis 7.4"],
          ["基础设施", "Docker Compose"]
        ],
        [2000, 7360]
      ),
      space(),

      // ==================== Section 2 ====================
      createHeading("2. 系统架构", HeadingLevel.HEADING_1),
      createHeading("2.1 前端结构 (apps/web)", HeadingLevel.HEADING_2),
      createParagraph("前端采用 Next.js 15.2+ App Router 架构，主要页面和路由如下："),
      createTable(
        ["目录", "路由", "说明"],
        [
          ["app/page.tsx", "/", "首页"],
          ["app/tools/page.tsx", "/tools", "工具目录页"],
          ["app/tools/[slug]/page.tsx", "/tools/[slug]", "工具详情页"],
          ["app/scenarios/page.tsx", "/scenarios", "场景列表页"],
          ["app/scenarios/[slug]/page.tsx", "/scenarios/[slug]", "场景详情页"],
          ["app/rankings/page.tsx", "/rankings", "榜单页"],
          ["app/compare/page.tsx", "/compare/[slug]", "工具对比页"],
          ["app/auth/page.tsx", "/auth", "认证页"]
        ],
        [3000, 2500, 3860]
      ),
      space(),

      createHeading("2.2 后端结构 (apps/api)", HeadingLevel.HEADING_2),
      createParagraph("后端采用 FastAPI 分层架构，主要模块如下："),
      createTable(
        ["模块", "文件", "职责"],
        [
          ["API路由层", "api/routes/*.py", "处理HTTP请求，路由分发"],
          ["业务逻辑层", "services/*.py", "核心业务逻辑处理"],
          ["数据模型层", "models/models.py", "SQLAlchemy ORM模型"],
          ["Schema层", "schemas/*.py", "Pydantic数据验证"],
          ["数据库连接", "db/session.py", "数据库会话管理"]
        ],
        [2000, 3000, 4360]
      ),
      space(),

      createHeading("2.3 数据模型关系", HeadingLevel.HEADING_2),
      createParagraph("核心数据模型包括：Tool（工具）、Category（分类）、Tag（标签）、Scenario（场景）、Ranking（榜单）、ToolReview（点评）、User（用户）等，通过外键关系相互关联。"),
      space(),

      // ==================== Section 3 ====================
      createHeading("3. 页面与功能说明", HeadingLevel.HEADING_1),

      createHeading("3.1 首页 (/)", HeadingLevel.HEADING_2),
      createParagraph("路由: /"),
      createParagraph("功能:"),
      createBullet("展示精选工具 (featured tools)"),
      createBullet("分类快速入口"),
      createBullet("场景化入口预览"),
      createBullet("AI搜索入口 (两种模式: 普通搜索/AI搜索)"),
      space(),

      createHeading("3.2 工具目录页 (/tools)", HeadingLevel.HEADING_2),
      createParagraph("路由: /tools"),
      createParagraph("功能:"),
      createBullet("工具列表展示 (分页)"),
      createBullet("多维度筛选: 分类、价格、访问方式、标签"),
      createBullet("排序: featured/hot/latest/free/enterprise"),
      createBullet("视图切换: hot/latest"),
      createBullet("AI搜索模式: 意图理解+快速筛选"),
      space(),
      createParagraph("筛选参数说明:"),
      createTable(
        ["参数", "类型", "默认值", "说明"],
        [
          ["q", "string", "null", "搜索关键词"],
          ["category", "string", "null", "分类slug"],
          ["tag", "string", "null", "标签slug"],
          ["price", "string", "null", "价格类型"],
          ["access", "string", "null", "访问方式"],
          ["price_range", "string", "null", "价格区间"],
          ["sort", "string", "featured", "排序方式"],
          ["view", "string", "hot", "视图"],
          ["page", "int", "1", "页码"],
          ["mode", "string", "null", "搜索模式 (ai)"]
        ],
        [1500, 1000, 1200, 5660]
      ),
      space(),

      createHeading("3.3 工具详情页 (/tools/[slug])", HeadingLevel.HEADING_2),
      createParagraph("路由: /tools/{slug}"),
      createParagraph("功能:"),
      createBullet("工具完整信息展示"),
      createBullet("编辑点评预览"),
      createBullet("优缺点分析"),
      createBullet("适用场景推荐"),
      createBullet("替代工具推荐"),
      createBullet("相关信息 (相关工具)"),
      space(),

      createHeading("3.4 场景列表页 (/scenarios)", HeadingLevel.HEADING_2),
      createParagraph("路由: /scenarios"),
      createParagraph("功能:"),
      createBullet("展示所有使用场景"),
      createBullet("场景分类卡片"),
      createBullet("目标人群标签"),
      space(),

      createHeading("3.5 场景详情页 (/scenarios/[slug])", HeadingLevel.HEADING_2),
      createParagraph("路由: /scenarios/{slug}"),
      createParagraph("功能:"),
      createBullet("场景详细介绍"),
      createBullet("核心问题说明"),
      createBullet("主推工具和备选工具对比"),
      space(),

      createHeading("3.6 榜单页 (/rankings)", HeadingLevel.HEADING_2),
      createParagraph("路由: /rankings"),
      createParagraph("榜单类型:"),
      createBullet("热门工具榜 (hot)"),
      createBullet("写作办公榜 (writing)"),
      createBullet("编程开发榜 (coding)"),
      createBullet("智能体平台榜 (agents)"),
      space(),

      createHeading("3.7 认证页 (/auth)", HeadingLevel.HEADING_2),
      createParagraph("路由: /auth"),
      createParagraph("功能:"),
      createBullet("用户注册"),
      createBullet("用户登录"),
      space(),

      // ==================== Section 4 ====================
      createHeading("4. API接口规范", HeadingLevel.HEADING_1),

      createHeading("4.1 目录接口 (Catalog)", HeadingLevel.HEADING_2),
      createParagraph("GET /api/tools - 获取工具列表"),
      createParagraph("GET /api/tools/{slug} - 获取工具详情"),
      createParagraph("GET /api/tools/search-index - 获取搜索索引"),
      createParagraph("GET /api/categories - 获取分类列表"),
      createParagraph("GET /api/rankings - 获取榜单列表"),
      createParagraph("GET /api/rankings/{slug} - 获取榜单详情"),
      createParagraph("GET /api/scenarios - 获取场景列表"),
      createParagraph("GET /api/scenarios/{slug} - 获取场景详情"),
      space(),

      createHeading("4.2 AI搜索接口 (AI Search)", HeadingLevel.HEADING_2),
      createParagraph("GET /api/ai-search - AI意图理解搜索"),
      createParagraph("Query参数: q (必填), category, tag, price, access, price_range, sort, view, page, page_size"),
      createParagraph("返回: mode, query, normalized_query, ai_panel, results, directory, meta"),
      space(),

      createHeading("4.3 认证接口 (Auth)", HeadingLevel.HEADING_2),
      createParagraph("POST /api/auth/register - 用户注册"),
      createParagraph("POST /api/auth/login - 用户登录"),
      createParagraph("POST /api/auth/logout - 用户登出"),
      createParagraph("GET /api/auth/me - 获取当前用户信息"),
      space(),

      createHeading("4.4 推荐接口 (Recommend)", HeadingLevel.HEADING_2),
      createParagraph("POST /api/recommend - 工具推荐"),
      createParagraph("请求体: query, scenario, tags, candidateSlugs"),
      space(),

      createHeading("4.5 对话接口 (Chat)", HeadingLevel.HEADING_2),
      createParagraph("POST /api/chat - RAG对话 (流式SSE)"),
      createParagraph("请求体: messages (role, content)"),
      space(),

      // ==================== Section 5 ====================
      createHeading("5. 数据字典", HeadingLevel.HEADING_1),

      createHeading("5.1 工具状态 (Tool Status)", HeadingLevel.HEADING_2),
      createTable(
        ["状态值", "说明"],
        [["published", "已发布"], ["draft", "草稿"], ["archived", "已归档"]],
        [2000, 7360]
      ),
      space(),

      createHeading("5.2 价格类型 (Pricing Type)", HeadingLevel.HEADING_2),
      createTable(
        ["类型值", "说明"],
        [["free", "免费"], ["freemium", "免费增值"], ["subscription", "订阅制"], ["one-time", "一次性付费"], ["contact", "联系销售"], ["unknown", "未知"]],
        [2000, 7360]
      ),
      space(),

      createHeading("5.3 访问标志 (Access Flags)", HeadingLevel.HEADING_2),
      createTable(
        ["标志", "说明"],
        [["needs_vpn", "需VPN"], ["cn_lang", "中文界面"], ["cn_payment", "支持国内支付"]],
        [2000, 7360]
      ),
      space(),

      // ==================== Section 6 ====================
      createHeading("6. 核心业务流程", HeadingLevel.HEADING_1),

      createHeading("6.1 工具发现流程", HeadingLevel.HEADING_2),
      createParagraph("用户输入搜索词 → 选择搜索模式(普通/AI) → 关键词匹配+过滤+排序 或 AI意图解析+约束提取 → 返回工具列表(分页、聚合facets)"),
      space(),

      createHeading("6.2 场景化找工具流程", HeadingLevel.HEADING_2),
      createParagraph("用户进入场景页 → 浏览场景列表(按任务/人群分类) → 点击具体场景 → 查看场景详情(核心问题说明、主推工具、备选工具) → 工具决策"),
      space(),

      createHeading("6.3 用户认证流程", HeadingLevel.HEADING_2),
      createParagraph("注册流程: 填写注册信息 → 表单验证 → 密码加密存储(bcrypt_sha256) → 创建用户会话 → 设置认证Cookie → 返回用户信息"),
      createParagraph("登录流程: 填写登录表单 → 查询用户 → 验证密码 → 创建用户会话 → 设置认证Cookie → 返回用户信息"),
      space(),

      createHeading("6.4 AI搜索流程", HeadingLevel.HEADING_2),
      createParagraph("输入搜索需求 → 选择AI搜索模式 → AI意图解析(意图分类、约束提取、快速操作生成) → 工具召回(向量召回+规则召回) → 结果排序 → 返回AI面板+结果"),
      space(),

      // ==================== Section 7 ====================
      createHeading("7. 页面-接口-数据表映射", HeadingLevel.HEADING_1),
      createTable(
        ["页面", "API端点", "核心数据表"],
        [
          ["首页 /", "GET /api/tools, GET /api/scenarios", "tools, scenarios"],
          ["工具目录 /tools", "GET /api/tools", "tools, categories, tags"],
          ["工具详情 /tools/[slug]", "GET /api/tools/{slug}", "tools, tool_reviews"],
          ["场景列表 /scenarios", "GET /api/scenarios", "scenarios"],
          ["场景详情 /scenarios/[slug]", "GET /api/scenarios/{slug}", "scenarios, scenario_tools"],
          ["榜单 /rankings", "GET /api/rankings", "rankings, ranking_items"],
          ["登录 /auth", "POST /api/auth/login, /register", "users, user_sessions"]
        ],
        [2500, 3500, 3360]
      ),
      space(),

      // ==================== Section 8 ====================
      createHeading("8. 风险点和待确认项", HeadingLevel.HEADING_1),

      createHeading("8.1 推断项 (待确认)", HeadingLevel.HEADING_2),
      createTable(
        ["项", "说明", "来源"],
        [
          ["工具对比功能", "代码中存在 /compare/[comparisonSlug] 路由，但页面实现不完整", "前端路由分析"],
          ["工具提交功能", "TOOL_SUBMISSION_URL 常量存在，但后端接口未实现", "前端代码"],
          ["用户点评功能", "ToolReview 模型存在，但CRUD接口未完整实现", "后端模型"],
          ["工具更新提议", "ToolUpdate 模型存在，用于用户提交工具更新", "后端模型"]
        ],
        [2000, 4000, 3360]
      ),
      space(),

      createHeading("8.2 命名不一致", HeadingLevel.HEADING_2),
      createBullet("ScenarioSummary类型: packages/contracts中primaryTools/alternativeTools为string[]，实际返回应为ToolSummary[]"),
      createBullet("category字段: Tool模型中同时有category_name和categories关系，需确认使用场景"),
      space(),

      createHeading("8.3 逻辑冲突点", HeadingLevel.HEADING_2),
      createBullet("缓存策略: catalog-api.ts使用60秒revalidate，但部分接口设计为更长的TTL，需统一"),
      createBullet("AI搜索fallback: AI搜索失败时fallback到普通目录搜索，需确认用户体验设计"),
      space(),

      // End
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        children: [new TextRun({ text: "— 文档结束 —", color: "999999", size: 24 })]
      })
    ]
  }]
});

// Generate document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("d:/codespace/workfile/星点评PRD_v1.0.docx", buffer);
  console.log("Document generated successfully!");
});
