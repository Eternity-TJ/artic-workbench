# Artic 工作台 — Claude Code 项目配置

## 项目身份

Artic 是一个**运营工作台**，内置 76 个专业技能。覆盖营销运营、SEO/内容、社交媒体、自动化、邮件通讯、品牌设计、增长变现、产品项目、方法论质量 9 大模块。提供 9 个功能面板，支持浅色/深色/自定义三种主题。

**技术栈**: Next.js 14 · TypeScript · Tailwind CSS · localStorage 客户端存储

## 版本

**v0.7** — 运营节奏统一月历 · 内容中心双面板 · 数据比对真实统计 · API Key 认证 · 可拖拽侧边栏 · 可折叠智能建议

## 知识库

- **技能目录**: [docs/SKILL_CATALOG.md](docs/SKILL_CATALOG.md) — 全量 76 技能 × 9 模块 × 20 智能行为映射
- **README**: [README.md](README.md) — 快速查询表

## 侧边栏导航（9 面板）

| 导航 | 组件 | 功能 |
|---|---|---|
| 工作台首页 | `Overview` | 关键指标、今日待办、最近动态、快速操作、内容工坊 |
| 用户中心 | `UserCenter` | 团队管理、7 项仪表盘、全局活动日志 |
| 运营节奏 | `OperationsRhythm` | 月历视图 — 活动(●) + 内容(◆) 统一管理 |
| 竞品追踪 | `CompetitorTracking` | 画像编辑、观察记录、并排对比 |
| 内容中心 | `ContentCenter` | 文案生成器 + 素材库双面板 |
| 数据比对 | `DataAnalytics` | 文件导入 + 数据对比 + AB 真实统计检验 |
| 知识库 | `KnowledgeBase` | 6 分类知识文章管理（SOP/实践/洞察/指南/模板/案例） |
| 设置 | `Settings` | 偏好设置（含 CSS 调试）+ 版本管理 |
| 使用手册 | `HelpDrawer` | 侧边抽屉式帮助文档 |

## 使用约定

1. 当用户提出运营/营销/增长/内容等任务时，先查阅 `docs/SKILL_CATALOG.md` 找到匹配的技能
2. 调用技能前，优先使用 `Find-skills` 确认最佳匹配
3. 任何创造性工作（功能、组件、功能修改）前先调用 `brainstorming`
4. 联网操作统一通过 `web-access` 技能处理
5. 2 个以上独立任务使用 `Dispatching-parallel-agents` 并行派发
6. 修改组件前注意 `embedded` prop 模式（组件可在弹窗/嵌入/独立三种模式下使用）

## 核心技能速查（按场景）

- **制定营销计划** → `marketing-plan`
- **SEO 优化** → `ai-seo`, `seo-audit`
- **写营销文案** → `copywriting`, `post-writer`
- **A/B 测试** → `ab-testing`
- **用户调研** → `customer-research`
- **竞品分析** → `competitor-profiling`
- **邮件营销** → `emails`
- **转化优化** → `cro`
- **自动化** → `operational-prompting`
- **数据分析** → `analytics`
- **品牌规范** → `brand-guidelines`
- **产品需求** → `prd`
- **发布上线** → `launch`
- **问题复盘** → `systematic-debugging`

## 数据流

```
localStorage 键值:
  artic-campaigns       → 活动数据
  artic-calendar-events → 内容排期
  artic-competitors     → 竞品数据
  artic-datasets        → 导入数据集
  artic-experiments     → AB 实验
  artic-knowledge       → 知识库文章
  artic-members         → 团队成员
  artic-saved-posts     → 已保存文案
  artic-theme           → 主题偏好 (light/dark/custom)
  artic-custom-bg       → 自定义背景色
  artic-dev-color       → 主色调覆盖
  artic-dev-padding     → 卡片间距覆盖
  artic-dev-radius      → 卡片圆角覆盖
  artic-sidebar-width   → 侧边栏宽度
  artic-api-key         → API 认证密钥
```

## 关键组件模式

- `ThemeInitializer` — 全局主题恢复（layout 层）
- `SmartSuggestionCard` — 可折叠智能建议卡片（所有面板复用）
- `ApiKeyModal` — API Key 输入弹窗
- `EnterButton` — 首页进入按钮（含 Key 检查）
- `embedded?: boolean` — 组件嵌入模式（如 VersionManagement）
- `artic-nav` CustomEvent — 跨组件导航
