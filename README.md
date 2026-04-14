# 星点评（Xingdianping）

AI 工具发现、评测与对比平台（Monorepo）。

## 当前能力

- 工具目录：列表页、详情页、分类筛选、状态展示
- 对比能力：多工具对比页（`/compare/[comparisonSlug]`）
- 匹配推荐：`/matches` 场景化推荐流
- AI 能力：
  - 聊天与 RAG（后端 `chat` 路由）
  - AI Search（后端 `ai_search` 路由）
  - 工具解析（后端 `parser` 路由）
- 评测与访问条件：评分、评论计数、可访问性标识（VPN/中文等）

## 技术栈

- 前端：Next.js 15、React 19、TypeScript、Vitest、Playwright
- 后端：FastAPI、SQLAlchemy、Alembic、Pytest
- 基础设施：MySQL、Redis（本地或 Docker）

## 项目结构

```text
apps/
  api/                FastAPI 服务与测试
  web/                Next.js 前端与测试
packages/
  contracts/          前后端共享类型
doc/                  项目过程文档
docs/                 技术方案与交接文档
scripts/              根目录脚本
```

## 本地启动

1. 安装依赖

```bash
npm install
cd apps/api
pip install -e .[dev]
```

2. 配置环境变量

- 复制 `.env.example` 为 `.env`
- 配置数据库与 Redis 连接

3. 启动服务

```bash
# 根目录
npm start
```

## 测试

```bash
# 前端单测
npm run test:web

# 后端测试
cd apps/api
python -m pytest
```

本次推送前已执行：
- `npm run test:web` 通过（12 files, 36 tests）
- `python -m pytest` 通过（132 passed）

## 提交规范（本仓库约定）

- 仅提交有效源码、测试与必要文档
- 不提交构建缓存与临时文件（如 `*.tsbuildinfo`、`output/`）
- 调试脚本与临时验证文件不进入主干提交

## 常用命令

```bash
npm run dev:web
npm run build:web
npm run lint:web
npm run test:web
```

后端：

```bash
cd apps/api
alembic upgrade head
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
