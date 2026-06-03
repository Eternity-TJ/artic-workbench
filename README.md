# Artic 工作台

> v0.7 · Next.js 14 + TypeScript + Tailwind CSS · 76 技能 × 9 模块 × 9 功能面板

Artic 是面向运营团队的一站式工作台，集成 76 个 Claude Code 专业技能，覆盖营销策划、内容创作、数据分析、竞品情报、品牌设计、流程自动化 9 大模块。

## 快速启动

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建
```

## 功能面板

| 面板 | 功能 | 核心技能 |
|---|---|---|
| 🏠 工作台首页 | 指标仪表盘、待办聚合、动态时间线、快速操作、内容工坊 | `marketing-plan` `analytics` |
| 👥 用户中心 | 团队管理、7 项仪表盘、全局活动日志 | `project-docs` `analytics` |
| 📅 运营节奏 | 月历视图 — 活动(●) + 内容(◆) 统一管理 | `marketing-plan` `launch` `social` |
| 🔍 竞品追踪 | 画像编辑、分类观察、并排对比 | `competitor-profiling` `competitors` |
| ✍️ 内容中心 | 文案生成器（6 平台×5 类型×6 风格）+ 素材库 | `post-writer` `copywriting` |
| 📊 数据比对 | 文件导入 + 数据对比 + z-test/chi-square 真实统计 | `analytics` `ab-testing` |
| 📚 知识库 | SOP/最佳实践/行业洞察/技能指南/模板/案例 6 分类 | `deep-research` `doc-coauthoring` |
| ⚙️ 设置 | 主题切换 + CSS 变量调试 + 版本时间线 + API Key 管理 | `launch` `prd` |
| 📖 使用手册 | 侧边抽屉式帮助文档 | `Find-skills` |

## 特色功能

- **三种主题**: 浅色 / 深色 / 自定义背景色
- **API Key 认证**: 每位用户使用自己的 Key，浏览器本地存储
- **可拖拽侧边栏**: 自由调整导航宽度（180px~420px）
- **可折叠智能建议**: 所有面板右侧智能建议支持收起
- **日历交互**: 点击日期格查看当日所有活动和内容
- **CSS 实时调试**: 主色调、卡片间距、圆角即时预览
- **真实数据导入**: 支持 CSV/XLSX/XLS/DOCX 拖拽上传
- **统计检验**: z-test、chi-square、置信区间、效应量

## 目录结构

```
Artic/
├── app/
│   ├── page.tsx                    # 首页（SaaS 落地页）
│   ├── layout.tsx                  # 根布局（含 ThemeInitializer）
│   ├── globals.css                 # 全局样式 + CSS 变量
│   └── dashboard/
│       └── page.tsx                # 工作台 Dashboard（侧边栏 + 内容区）
├── components/
│   ├── Sidebar.tsx                 # 侧边栏导航
│   ├── Overview.tsx                # 工作台首页
│   ├── UserCenter.tsx              # 用户中心
│   ├── OperationsRhythm.tsx        # 运营节奏（月历）
│   ├── CompetitorTracking.tsx      # 竞品追踪
│   ├── ContentCenter.tsx           # 内容中心（文案+素材）
│   ├── DataAnalytics.tsx           # 数据比对
│   ├── KnowledgeBase.tsx           # 知识库
│   ├── Settings.tsx                # 设置
│   ├── VersionManagement.tsx       # 版本管理（嵌入设置）
│   ├── SmartSuggestionCard.tsx     # 智能建议卡片（可折叠）
│   ├── ThemeInitializer.tsx        # 全局主题初始化
│   ├── ApiKeyModal.tsx             # API Key 输入弹窗
│   ├── ApiKeyManager.tsx           # API Key 管理面板
│   ├── EnterButton.tsx             # 首页进入按钮
│   ├── HelpDrawer.tsx              # 帮助抽屉
│   └── ...                         # 其余组件
├── lib/
│   ├── skillMapping.ts             # 模块→技能映射表
│   └── statistics.ts               # 统计函数库
├── docs/
│   └── SKILL_CATALOG.md            # 76 技能完整目录
└── CLAUDE.md                       # 项目配置
```

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS 自定义属性
- **存储**: localStorage（客户端）
- **统计**: 纯 TypeScript 实现（z-test, chi-square, CI, effect size）
- **文件解析**: xlsx (SheetJS) + mammoth (docx)

## 许可

内部工具，仅供团队使用。
