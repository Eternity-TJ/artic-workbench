# Artic 工作台 — Claude Code 项目配置

## 项目身份

Artic 是一个**运营工作台**，内置 76 个专业技能。覆盖营销运营、SEO/内容、社交媒体、自动化、邮件通讯、品牌设计、增长变现、产品项目、方法论质量 9 大模块。

## 知识库

- **技能目录**: [docs/SKILL_CATALOG.md](docs/SKILL_CATALOG.md) — 全量 76 技能 × 9 模块 × 20 智能行为映射
- **README**: [README.md](README.md) — 快速查询表

## 使用约定

1. 当用户提出运营/营销/增长/内容等任务时，先查阅 `docs/SKILL_CATALOG.md` 找到匹配的技能
2. 调用技能前，优先使用 `Find-skills` 确认最佳匹配
3. 任何创造性工作（功能、组件、功能修改）前先调用 `brainstorming`
4. 联网操作统一通过 `web-access` 技能处理
5. 2 个以上独立任务使用 `Dispatching-parallel-agents` 并行派发

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
