# 星点评 MVP 改动记录与预期

## 文档目的

本文档记录当前仓库已经完成的关键事实、当前状态和下一阶段预期。  
它描述的是“现在代码已经有什么”，不是历史方案回顾。

## 本轮已完成事实

### 1. 仓库结构已稳定

当前仓库主体已经稳定为：

- `apps/web`
- `apps/api`
- `packages/contracts`
- `infra/docker`
- `infra/sql`
- `doc`

### 2. 前端基线已稳定

当前 Web 端已经基于 Next.js App Router 落地，真实页面包括：

- `/`
- `/tools`
- `/tools/[slug]`
- `/rankings`
- `/scenarios`
- `/scenarios/[slug]`
- `/auth`

当前前端已具备：

- 首页目录入口
- 工具目录检索
- 工具详情展示
- 榜单展示
- 场景展示
- 基础登录注册页
- Header 登录态展示

### 3. 后端基线已稳定

当前 API 已具备以下主路由：

- `GET /api/tools`
- `GET /api/tools/{slug}`
- `GET /api/categories`
- `GET /api/categories/{slug}/tools`
- `GET /api/rankings`
- `GET /api/rankings/{slug}`
- `GET /api/scenarios`
- `GET /api/scenarios/{slug}`
- `POST /api/recommend`
- `POST /api/crawl/jobs`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 4. 数据库与认证已进入当前事实

当前数据库模型已经覆盖：

- 工具目录
- 分类与标签
- 榜单与场景
- 抓取快照与更新候选
- 用户与用户会话

这意味着：

- “只靠静态 mock 数据”已经不是当前事实
- “登录注册不做”已经不是当前事实

### 5. 测试资产已存在

当前已存在：

- 前端 Vitest 测试
- 前端 Playwright 用例
- 后端 pytest
- 认证 API 测试

## 当前实际状态

可以概括为：

- 前后端主干已经搭好
- 目录和认证已经是可运行能力
- 抓取和运营链路仍未闭环
- 后台管理侧仍未落地

## 下一阶段预期

### 1. 类型与文档统一

- 把前后端共享类型进一步统一
- 保持 `doc/` 与代码同步

### 2. 测试补强

- 继续补页面级测试
- 补充更多后端接口覆盖

### 3. 抓取审核闭环

- 让抓取结果进入审核流
- 明确发布和回滚能力

### 4. 后台与权限

- 引入后台角色体系
- 为内容管理和审核提供前端入口

## 当前口径约束

- 本文档只记录当前已发生的事实
- 未来目标应写入规划类文档，不应混入本文件
