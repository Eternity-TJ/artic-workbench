# Artic 工作台 — 技能目录

> 版本: v0.7 | 日期: 2026-06-03 | 状态: 运营节奏统一月历 + API Key 认证 + 可拖拽侧边栏 + 可折叠智能建议

本文档是 Artic 工作台所有内置技能的完整目录。按 9 大模块组织，每个条目标注所属分类、触发场景。

## Artic 工作台 v0.7 概况

首页为 SaaS 产品落地页，展示核心能力、功能面板速览、技能统计。进入 `/dashboard` 后使用 9 大功能面板进行运营管理。

| 导航菜单 | 组件 | 功能定位 |
|---|---|---|
| **工作台首页** | `Overview` | 指标仪表盘、待办聚合、动态时间线、快速操作、内容工坊卡片 |
| **用户中心** | `UserCenter` | 团队管理、7 项仪表盘、全局活动日志 |
| **运营节奏** | `OperationsRhythm` | 月历视图 — 活动(● 按状态着色) + 内容(◆ 按类型着色) 统一管理 |
| **竞品追踪** | `CompetitorTracking` | 结构化画像、分类观察、并排对比 |
| **内容中心** | `ContentCenter` | 文案生成器（6平台×5类型×6风格）+ 素材库（5分类） |
| **数据比对** | `DataAnalytics` | 文件导入（CSV/XLSX/DOCX）+ 数据对比 + AB 统计检验（z-test/chi-square） |
| **知识库** | `KnowledgeBase` | 6 分类知识文章（SOP/最佳实践/行业洞察/技能指南/模板/案例） |
| **设置** | `Settings` | 主题切换 + CSS 变量调试 + 版本时间线 + API Key 管理 |
| **使用手册** | `HelpDrawer` | 侧边抽屉式帮助文档 |

> **功能介绍**：支持三种主题（浅色/深色/自定义背景）、API Key 认证（每位用户独立 Key）、可拖拽侧边栏（180~420px）、可折叠智能建议卡片、CSS 变量实时调试。数据模块支持真实文件导入和统计检验。所有数据手动录入，不做自动抓取或发布。

---

## 目录

1. [营销运营](#1-营销运营)
2. [SEO / 内容](#2-seo--内容)
3. [社交媒体](#3-社交媒体)
4. [自动化 / 工具](#4-自动化--工具)
5. [邮件 / 通讯](#5-邮件--通讯)
6. [品牌 / 设计](#6-品牌--设计)
7. [增长 / 变现](#7-增长--变现)
8. [产品 / 项目](#8-产品--项目)
9. [方法论 / 质量](#9-方法论--质量)
10. [通用 / 基础技能](#10-通用--基础技能)

---

## 1. 营销运营

### 1.1 活动策划检查清单

| 技能 | 用途 | 触发词 |
|---|---|---|
| `marketing-plan` | 制定完整营销计划，含时间线、渠道、预算框架 | "制定营销计划", "marketing plan" |
| `launch` | 产品/功能发布全流程检查清单与执行 | "发布", "launch", "上线" |
| `marketing-ideas` | 基于行业/产品的创意营销点子生成 | "营销创意", "marketing ideas" |
| `marketing-psychology` | 消费心理学原理在营销中的应用 | "营销心理", "consumer psychology" |

### 1.2 用户生命周期分层

| 技能 | 用途 | 触发词 |
|---|---|---|
| `customer-research` | 用户调研方法、访谈提纲、画像构建 | "用户调研", "customer research" |
| `churn-prevention` | 流失预警指标、挽回策略、留存机制 | "防流失", "churn" |
| `onboarding` | 新用户引导流程设计、激活里程碑 | "onboarding", "新手引导" |
| `lifecycle` (via `revops`) | 收入运营视角下的全生命周期管理 | "收入运营", "revops" |

### 1.3 营销日历建议

| 技能 | 用途 | 触发词 |
|---|---|---|
| `marketing-plan` | 输出含时间节点的年度/季度营销日历 | "营销日历", "年度计划" |
| `social` | 社交媒体内容日历规划 | "社媒日历", "发帖计划" |

---

## 2. SEO / 内容

### 2.1 关键词聚类分析

| 技能 | 用途 | 触发词 |
|---|---|---|
| `ai-seo` | AI 驱动的 SEO 策略，含关键词聚类、语义分析 | "AI SEO", "关键词策略" |
| `seo-audit` | 全站 SEO 审计：技术、内容、外链、体验 | "SEO 审计", "seo audit" |
| `seo-best-practices` | SEO 最佳实践速查与执行建议 | "SEO 最佳实践" |
| `niche-research` | 利基市场与长尾关键词研究 | "niche", "利基", "细分市场" |
| `programmatic-seo` | 规模化 SEO 落地页生成策略 | "程序化SEO", "pSEO" |
| `keywords` (via `ai-seo`) | 关键词密度、TF-IDF、语义关联分析 | "关键词密度", "keyword" |

### 2.2 标题优化公式（数字 + 情感 + 价值）

| 技能 | 用途 | 触发词 |
|---|---|---|
| `copywriting` | 销售文案、标题公式、转化的文字技巧 | "文案", "copywriting" |
| `hook-generator` | 专门生成抓人眼球的开头钩子/标题 | "钩子", "标题", "hook" |
| `post-writer` | 社交媒体帖子全篇撰写（含标题技巧） | "写帖子", "post writer" |
| `post-scorer` | 对已有标题/帖子进行评分和优化建议 | "帖子评分", "score post" |

### 2.3 内容结构模板（H1/H2, 段落长度, 内部链接）

| 技能 | 用途 | 触发词 |
|---|---|---|
| `content-strategy` | 内容策略制定：主题集群、内容支柱、内容日历 | "内容策略", "content strategy" |
| `content-matrix` | 用户阶段 × 内容类型的矩阵映射 | "内容矩阵", "content matrix" |
| `copy-editing` | 文案编辑润色、可读性优化、结构校订 | "编辑", "润色", "校对" |
| `site-architecture` | 网站信息架构与内部链接结构规划 | "网站架构", "内部链接" |
| `post-formatter` | 帖子格式化：排版、emoji、段落节奏 | "格式化", "排版" |

---

## 3. 社交媒体

### 3.1 最佳发帖时间建议

| 技能 | 用途 | 触发词 |
|---|---|---|
| `social` | 全平台社媒策略，含发帖时间、平台特性 | "社交媒体", "social media" |
| `analytics` | 数据分析，含用户活跃时段洞察 | "分析", "数据", "analytics" |
| `analytics-dashboard` | 构建分析仪表盘，含时间维度可视化 | "仪表盘", "dashboard" |

### 3.2 互动率计算公式与基准

| 技能 | 用途 | 触发词 |
|---|---|---|
| `social` | 各平台互动率基准（行业 × 平台 × 内容类型） | "互动率", "engagement rate" |
| `post-scorer` | 单帖互动潜力预评分与改进方向 | "帖子评分" |
| `analytics` | 自定义指标计算与基准对比 | "基准", "benchmark" |

### 3.3 竞品社交账号追踪要点

| 技能 | 用途 | 触发词 |
|---|---|---|
| `competitor-profiling` | 竞品全方位画像：定位、定价、内容、社媒 | "竞品画像", "competitor" |
| `competitors` | 竞品快速分析与对比表 | "竞品分析", "竞争对手" |
| `social` | 竞品社媒矩阵扫描与内容策略反推 | "竞品社媒", "竞品内容" |

---

## 4. 自动化 / 工具

### 4.1 n8n 常见工作流模式

| 技能 | 用途 | 触发词 |
|---|---|---|
| `operational-prompting` | 运营自动化提示工程，含工作流设计模式 | "自动化", "workflow", "n8n" |
| `revops` | 收入运营自动化（CRM、计费、管道自动化） | "收入运营自动化" |
| `schema` | 结构化数据 / Schema 定义与自动化映射 | "schema", "数据结构" |

### 4.2 API 限流处理策略

| 技能 | 用途 | 触发词 |
|---|---|---|
| `operational-prompting` | 含 API 集成、限流重试、降级策略的模式库 | "API", "限流", "rate limit" |
| `mcp-builder` | MCP 服务器构建，含 API 封装与限流设计 | "MCP", "构建工具" |

---

## 5. 邮件 / 通讯

### 5.1 邮件主题行 A/B 测试指标

| 技能 | 用途 | 触发词 |
|---|---|---|
| `emails` | 邮件全链路：模板、序列、自动化、指标 | "邮件", "email", "newsletter" |
| `ab-testing` | A/B 测试设计：变量控制、样本量、显著性 | "A/B测试", "ab test" |
| `cold-email` | 冷启动邮件策略与序列设计 | "冷邮件", "cold email" |
| `newsletter-voice` | 邮件通讯的语气、风格、人格化 | "newsletter", "邮件风格" |

### 5.2 退订率阈值警报

| 技能 | 用途 | 触发词 |
|---|---|---|
| `emails` | 邮件健康指标：退订率、投诉率、送达率 | "退订率", "unsubscribe" |
| `churn-prevention` | 流失信号预警机制（可对接邮件指标） | "流失预警", "预警" |

---

## 6. 品牌 / 设计

### 6.1 配色一致性检查

| 技能 | 用途 | 触发词 |
|---|---|---|
| `brand-guidelines` | 品牌手册全要素：色板、字体、语调、Logo | "品牌规范", "brand guidelines" |
| `graphic-designer` | 视觉设计工作：配色、版式、图形 | "设计", "配色", "调色板" |
| `UI-UX-Pro-Max` | 界面与体验设计中视觉一致性的极致把控 | "UI", "UX", "界面设计" |
| `theme-factory` | 主题工厂：批量生成品牌一致的视觉方案 | "主题", "theme" |
| `canvas-design` | Canva 风格平面设计指导 | "平面设计", "海报" |

### 6.2 Logo 使用规范

| 技能 | 用途 | 触发词 |
|---|---|---|
| `brand-guidelines` | Logo 安全空间、最小尺寸、颜色变体规则 | "Logo规范", "品牌标识" |
| `graphic-designer` | Logo 标准化输出、导出格式指导 | "Logo导出" |

---

## 7. 增长 / 变现

### 7.1 A/B 测试最小样本量计算

| 技能 | 用途 | 触发词 |
|---|---|---|
| `ab-testing` | 统计严谨的 A/B 测试全流程：样本量、持续时间、显著性 | "样本量", "统计显著性" |
| `cro` | 转化率优化：测试优先级、假设生成、结果解读 | "转化率优化", "CRO" |

### 7.2 转化漏斗分析步骤

| 技能 | 用途 | 触发词 |
|---|---|---|
| `cro` | 漏斗识别、泄漏点定位、修复假设 | "转化漏斗", "funnel" |
| `analytics` | 漏斗数据采集、指标定义、看板搭建 | "漏斗分析" |
| `analytics-dashboard` | 漏斗可视化仪表盘 | "漏斗仪表盘" |
| `revops` | 收入漏斗：从线索到现金的全链路优化 | "收入漏斗" |
| `signup` | 注册/登录流程优化，含社交登录 | "注册", "signup" |
| `paywalls` | 付费墙策略与转化优化 | "付费墙", "paywall" |
| `pricing` | 定价策略：套餐设计、价格锚点、心理定价 | "定价", "pricing" |

---

## 8. 产品 / 项目

### 8.1 版本发布检查清单

| 技能 | 用途 | 触发词 |
|---|---|---|
| `launch` | 发布日执行清单、回滚预案、沟通模板 | "发布检查", "上线清单" |
| `project-docs` | 项目文档标准化：README、CHANGELOG、架构决策 | "项目文档" |
| `prd` | 产品需求文档标准化模板与撰写指南 | "PRD", "产品需求" |

### 8.2 需求优先级评估方法

| 技能 | 用途 | 触发词 |
|---|---|---|
| `prd` | 含 RICE/ICE/MoSCoW/Kano 等优先级框架 | "优先级", "需求排序" |
| `project-docs` | 项目路线图与里程碑规划 | "路线图", "roadmap" |
| `brainstorming` | 需求探索前的结构化头脑风暴 | "头脑风暴", "brainstorm" |

---

## 9. 方法论 / 质量

### 9.1 PDCA 循环应用于活动复盘

| 技能 | 用途 | 触发词 |
|---|---|---|
| `systematic-debugging` | 系统化排错方法论 — 可适配 PDCA 复盘流程 | "复盘", "PDCA", "排错" |
| `verification-before-completion` | 完成前验证 — 对应 PDCA 的 Check 阶段 | "验证", "检查" |
| `executing-plans` | 计划执行 — 对应 PDCA 的 Do 阶段 | "执行计划" |
| `planning-with-files` | 文件化规划 — 对应 PDCA 的 Plan 阶段 | "规划" |

### 9.2 5 Whys 分析根因

| 技能 | 用途 | 触发词 |
|---|---|---|
| `systematic-debugging` | 结构化根因分析：5 Whys、鱼骨图、故障树 | "根因", "5 whys", "why" |
| `code-review` | 代码根因审查（技术侧） | "代码审查" |

---

## 10. 通用 / 基础技能

以下技能跨模块通用，为整个工作台提供基础设施。

| 技能 | 用途 | 分类 |
|---|---|---|
| `brainstorming` | **任何创造性工作前必须先调用** — 结构化头脑风暴 | 创意前置 |
| `web-access` | 所有联网操作统一入口：搜索、抓取、登录后操作 | 网络层 |
| `deep-research` | 深度研究：多源搜索、交叉验证、生成引用报告 | 研究 |
| `doc-coauthoring` | 文档协同创作工作流 | 文档 |
| `Find-skills` | 查找和发现合适技能的元技能 | 元技能 |
| `Skill-Creator` | 创建新自定义技能 | 元技能 |
| `Dispatching-parallel-agents` | 并行派发独立任务（2+ 个无依赖任务） | 编排 |
| `loop` | 定时循环执行任务 | 编排 |
| `update-config` | 调整 Claude Code 配置与权限 | 配置 |
| `xlsx` | Excel 文件创建与分析 | 文件 |
| `pptx` | PowerPoint 演示文稿创建 | 文件 |
| `pdf` | PDF 文件处理与生成 | 文件 |
| `image` | 图片生成 | 文件 |
| `video` | 视频脚本与制作指导 | 文件 |
| `web-artifacts-builder` | 构建复杂 Web 制品（多 HTML/CSS/JS） | 开发 |
| `webapp-testing` | Web 应用测试 | 质保 |
| `voice-builder` | 语音/语调构建器 | 品牌 |
| `internal-comms` | 内部沟通模板 | 沟通 |
| `prospecting` | 销售线索挖掘 | 销售 |
| `sales-enablement` | 销售赋能材料 | 销售 |
| `referrals` | 推荐裂变策略 | 增长 |
| `lead-magnets` | 引流磁铁设计 | 增长 |
| `popups` | 弹窗策略与优化 | 增长 |
| `sms` | 短信营销 | 通讯 |
| `directory-submissions` | 目录提交（SEO 外链） | SEO |
| `aso` | 应用商店优化 | ASO |
| `ad-creative` | 广告创意设计 | 广告 |
| `ads` | 广告投放策略 | 广告 |
| `profile-optimizer` | 社交媒体个人资料优化 | 社交 |
| `co-marketing` | 联合营销策略 | 营销 |
| `community-marketing` | 社区营销 | 营销 |
| `product-marketing` | 产品营销 | 营销 |
| `youtube-thumbnail` | YouTube 缩略图设计 | 内容 |
| `gemini-carousel` | Gemini 轮播图生成 | 内容 |
| `gemini-infographic` | Gemini 信息图生成 | 内容 |
| `reels-scripting` | 短视频脚本撰写 | 内容 |
| `quote-post` | 引用帖子文案 | 内容 |
| `pinned-comment` | 置顶评论策略 | 社区 |
| `excalidraw-diagram` | Excalidraw 图表绘制 | 可视化 |
| `Frontend-Design` | 前端设计 | 开发 |
| `web-design-guidelines` | Web 设计指南 | 设计 |
| `test-driven-development` | TDD 测试驱动开发 | 质量 |
| `simplify` | 代码简化与重构 | 质量 |
| `security-review` | 安全审查 | 质量 |
| `using-git-worktrees` | Git Worktree 使用 | 工具 |
| `finishing-a-development-branch` | 开发分支收尾 | 工具 |
| `free-tools` | 免费工具推荐 | 资源 |
| `claude-api` | Claude API 开发与调试 | 开发 |
| `claude-code-guide` | Claude Code 使用指南 | 元技能 |
| `PUA` | 搭讪艺术 | 其他 |

---

## 附录 A：智能行为触发词索引

按你提供的 9 大分类指南，以下是各智能行为的触发词 → 技能映射速查：

| 分类 | 智能行为 | 主技能 | 辅技能 |
|---|---|---|---|
| 营销运营 | 活动策划检查清单 | `marketing-plan` | `launch`, `marketing-ideas` |
| 营销运营 | 用户生命周期分层 | `customer-research` | `churn-prevention`, `onboarding` |
| 营销运营 | 营销日历建议 | `marketing-plan` | `social` |
| SEO/内容 | 关键词聚类分析 | `ai-seo` | `seo-audit`, `niche-research` |
| SEO/内容 | 标题优化公式 | `copywriting` | `hook-generator`, `post-writer` |
| SEO/内容 | 内容结构模板 | `content-strategy` | `content-matrix`, `copy-editing` |
| 社交媒体 | 最佳发帖时间 | `social` | `analytics` |
| 社交媒体 | 互动率公式与基准 | `social` | `post-scorer`, `analytics` |
| 社交媒体 | 竞品社媒追踪 | `competitor-profiling` | `competitors`, `social` |
| 自动化/工具 | n8n 工作流模式 | `operational-prompting` | `revops` |
| 自动化/工具 | API 限流策略 | `operational-prompting` | `mcp-builder` |
| 邮件/通讯 | 邮件 A/B 测试 | `emails` | `ab-testing` |
| 邮件/通讯 | 退订率警报 | `emails` | `churn-prevention` |
| 品牌/设计 | 配色一致性 | `brand-guidelines` | `graphic-designer`, `UI-UX-Pro-Max` |
| 品牌/设计 | Logo 使用规范 | `brand-guidelines` | `graphic-designer` |
| 增长/变现 | A/B 样本量计算 | `ab-testing` | `cro` |
| 增长/变现 | 转化漏斗分析 | `cro` | `analytics`, `revops` |
| 产品/项目 | 版本发布清单 | `launch` | `project-docs`, `prd` |
| 产品/项目 | 需求优先级 | `prd` | `project-docs` |
| 方法论/质量 | PDCA 活动复盘 | `systematic-debugging` | `verification-before-completion` |
| 方法论/质量 | 5 Whys 根因分析 | `systematic-debugging` | `code-review` |

---

## 附录 B：维护日志

| 日期 | 变更 | 作者 |
|---|---|---|
| 2026-06-01 | 初始创建，76 个技能完整编目 | Artic Workbench |
| 2026-06-01 | v0.4 务实重建：删除发布管道/内容工坊/链接提取，新增工作台首页/内容日历/素材库，活动管理增加交付物追踪 | Artic Workbench |
| 2026-06-01 | v0.5 首页改版为 SaaS 落地页、全局阴影系统、Sidebar 用户区域 | Artic Workbench |
| 2026-06-01 | v0.6 数据模块重写：文件导入、数据对比、真实 AB 统计检验（z-test/chi-square）、归因数据导入 | Artic Workbench |
| 2026-06-03 | v0.7 运营节奏统一月历（合并活动管理+内容日历）、内容中心双面板（文案生成+素材库）、用户中心+知识库、设置合并（偏好+版本+CSS调试）、深色/浅色/自定义三种主题、API Key 认证门控、可拖拽侧边栏、可折叠智能建议 | Artic Workbench |
