/**
 * Artic 工作台 — 模块 → 技能映射表（v0.4 务实版）
 */

export interface SkillSuggestion {
  category: string;
  moduleName: string;
  primarySkills: string[];
  secondarySkills: string[];
  triggerWords: string[];
  tips: string[];
}

export const skillMapping: Record<string, SkillSuggestion> = {
  /* ==================== v0.4 新增 ==================== */

  overview: {
    category: "营销运营",
    moduleName: "工作台首页",
    primarySkills: ["marketing-plan", "analytics"],
    secondarySkills: ["Find-skills", "launch", "social"],
    triggerWords: ["工作台", "仪表盘", "待办", "动态", "指标"],
    tips: [
      "【仪表盘】首页自动聚合活动、日历、竞品、实验各模块的关键指标",
      "【待办驱动】从活动交付物和内容排期中自动生成待办，按优先级排序",
      "【快速跳转】使用快速操作按钮一键进入功能模块，减少导航摩擦",
      "【动态感知】最近动态时间线让你快速了解团队工作进展",
    ],
  },
  operations: {
    category: "营销运营 + SEO/内容",
    moduleName: "运营节奏",
    primarySkills: ["marketing-plan", "launch", "social", "content-strategy"],
    secondarySkills: ["marketing-ideas", "marketing-psychology", "customer-research", "post-writer"],
    triggerWords: ["运营节奏", "活动策划", "内容排期", "日历", "交付物", "营销计划", "排期", "活动管理"],
    tips: [
      "【月度日历】统一视图同时展示活动周期和内容排期——活动（● 按状态着色）和内容（◆ 按类型着色）在同一日历格",
      "【点击即看】点击日历格上的活动标签查看交付物进度详情，点击内容标签查看排期状态",
      "【+ 快速创建】悬停任意日期格 → 点击 + 按钮 → 选择新建活动或内容 → 日期自动填入",
      "【右侧详情】活动详情（交付物清单+进度条）和内容详情上下分区，快速推进状态",
    ],
  },
  "content-center": {
    category: "SEO/内容 + 社交媒体 + 品牌/设计",
    moduleName: "内容中心",
    primarySkills: ["post-writer", "copywriting", "hook-generator", "brand-guidelines"],
    secondarySkills: ["post-formatter", "content-matrix", "social", "graphic-designer", "doc-coauthoring"],
    triggerWords: ["写文案", "小红书", "抖音", "公众号", "素材", "模板", "文案库", "种草", "生成", "语气", "风格"],
    tips: [
      "【文案生成】选平台→定类型→挑语气→输入主题→一键生成 3 版文案，覆盖 6 平台 × 3 类型 × 3 风格",
      "【素材管理】五大分类（文案模板/品牌素材/SOP/竞品截图/收藏），支持搜索、标签、关联活动",
      "【PRD 生成】输入产品名称+目标用户→AI 自动生成结构化产品需求文档（背景/用户故事/验收标准/时间线）",
      "【生成即保存】所有生成内容可一键保存到知识库，实现内容生产→沉淀→复用的完整闭环",
      "【复用循环】已保存素材可作为灵感参考，反哺文案生成的主题和关键词输入",
    ],
  },

  /* ==================== 保留模块 ==================== */

  competitor: {
    category: "SEO/内容 + 社交媒体",
    moduleName: "竞品追踪",
    primarySkills: ["competitor-profiling", "competitors", "social"],
    secondarySkills: ["ai-seo", "seo-audit", "niche-research"],
    triggerWords: ["竞品分析", "竞品画像", "社媒追踪", "观察记录", "对比"],
    tips: [
      "【手动录入】所有竞品数据需手动录入——真实平台因反爬无法自动抓取",
      "【结构化画像】每个竞品维护四维画像：定位、价格带、渠道、内容风格",
      "【观察记录】按定价/内容/社媒/产品分类记录观察，积累长期情报",
      "【并排对比】勾选 2-4 个竞品进入并排对比表，维度化分析差异",
    ],
  },
  data: {
    category: "增长/变现",
    moduleName: "数据比对",
    primarySkills: ["analytics", "analytics-dashboard", "cro", "ab-testing"],
    secondarySkills: ["revops", "churn-prevention"],
    triggerWords: ["数据分析", "A/B测试", "转化漏斗", "文件导入", "数据对比", "AB测试", "对比"],
    tips: [
      "【文件导入】拖拽 CSV/XLSX/XLS/DOCX 文件到上传区，自动解析为结构化数据集",
      "【数据对比】选择 2 个数据集，自动匹配公共列名并排对比，数值列显示差异值",
      "【AB 检验】选数据集+数值列 → 逐行对比表 + 8 项统计摘要 → 提炼为策略卡片",
      "【提炼策略】点击「提炼为策略」将 AB 测试结果保存到策略库，含提升率、置信度和执行模板骨架",
    ],
  },
  "user-center": {
    category: "产品/项目",
    moduleName: "用户中心",
    primarySkills: ["marketing-plan", "project-docs"],
    secondarySkills: ["analytics", "systematic-debugging"],
    triggerWords: ["用户中心", "团队成员", "邀请", "技能标签", "活动日志", "个人工作台"],
    tips: [
      "【团队管理】查看团队成员列表、在线状态、角色和技能标签，支持邀请新成员",
      "【项目仪表盘】9 项关键指标实时统计——活动、内容、竞品、知识、数据集、成员、在线数",
      "【用户分层】RFM 模型分层（高价值/潜力/沉睡/流失）+ 自定义分层，含画像描述和运营策略",
      "【用户画像】手动录入用户画像（年龄/城市/兴趣标签），关联分层，支持增删改查",
      "【全局日志】聚合来自运营节奏、内容中心、知识库的操作记录，按时间倒序排列",
    ],
  },
  knowledge: {
    category: "方法论/质量 + 通用/元技能",
    moduleName: "知识库",
    primarySkills: ["deep-research", "doc-coauthoring", "Skill-Creator", "claude-code-guide"],
    secondarySkills: ["Find-skills", "systematic-debugging", "project-docs", "update-config"],
    triggerWords: ["知识库", "SOP", "最佳实践", "技能指南", "案例", "模板", "行业洞察"],
    tips: [
      "【六大分类】SOP 流程、最佳实践、行业洞察、技能指南、工作模板、案例研究——按分类筛选和统计",
      "【全文搜索】搜索标题、摘要、标签、正文内容，快速定位所需知识",
      "【置顶文章】关键文档支持置顶，确保团队优先看到最重要的知识",
      "【Markdown 正文】支持 Markdown 格式撰写正文，详情弹窗展示完整内容",
      "【知识沉淀】从日常运营中提炼经验，沉淀为团队可复用的知识资产",
    ],
  },
  settings: {
    category: "产品/项目 + 方法论/质量",
    moduleName: "设置",
    primarySkills: ["launch", "prd", "systematic-debugging", "verification-before-completion"],
    secondarySkills: ["update-config", "planning-with-files", "executing-plans", "project-docs"],
    triggerWords: ["设置", "版本发布", "回滚", "PRD", "主题", "CSS变量", "偏好", "深色模式"],
    tips: [
      "【偏好设置】切换浅色/深色主题，管理推送通知和数据刷新间隔",
      "【版本时间线】记录每个版本的变更摘要，支持回滚确认流程",
      "【主题预设】预览 Indigo/Slate/Emerald/Amber 四种主题预设，一键切换 CSS 变量",
      "【开发者工具】实时调整 --primary 主色调、--card-padding 间距、--card-radius 圆角，即时生效",
    ],
  },
  help: {
    category: "通用/元技能",
    moduleName: "使用手册",
    primarySkills: ["Find-skills", "claude-code-guide"],
    secondarySkills: ["deep-research", "doc-coauthoring", "Skill-Creator"],
    triggerWords: ["帮助", "使用手册", "怎么用", "技能查找"],
    tips: [
      "使用 Find-skills 快速搜索合适的技能",
      "查阅 docs/SKILL_CATALOG.md 了解全部 76 个技能",
      "使用 Skill-Creator 创建自定义技能",
      "如有疑问，直接输入任务描述，AI 会自动匹配最佳技能",
    ],
  },
};

export function getSkillForModule(key: string): SkillSuggestion | null {
  return skillMapping[key] ?? null;
}
