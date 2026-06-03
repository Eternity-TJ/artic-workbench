"use client";

interface Props { open: boolean; onClose: () => void; }

const SECTIONS = [
  {
    title: "工作台首页",
    skills: "marketing-plan · analytics · Find-skills",
    desc: "运营仪表盘：关键指标卡片、今日待办聚合、最近动态时间线、快速操作入口、内容工坊产出统计。",
    tips: ["待办数据从运营节奏（活动+内容）自动聚合", "快速操作按钮可一键跳转到运营节奏/竞品追踪/内容中心", "指标卡片实时计算 localStorage 中的数据", "内容工坊卡片显示待生成/已保存文案数量"],
  },
  {
    title: "用户中心",
    skills: "marketing-plan · project-docs · analytics",
    desc: "团队管理 + 项目仪表盘 + 全局活动日志。查看成员在线状态、角色、技能标签。",
    tips: ["7 项关键指标实时统计——活动、内容、竞品、知识、数据集、成员、在线数", "成员卡片可展开查看角色、加入时间、技能标签", "全局日志聚合运营节奏、内容中心、知识库的操作记录", "支持邀请新成员加入团队"],
  },
  {
    title: "运营节奏",
    skills: "marketing-plan · launch · social · content-strategy",
    desc: "统一月历视图同时展示活动周期和内容排期——活动（● 按状态着色）和内容（◆ 按类型着色）在同一日历格中。",
    tips: ["点击日历格上的活动标签查看交付物进度详情", "点击内容标签查看排期状态（平台/类型/状态）", "悬停任意日期格→点击 + 按钮→选择新建活动或内容→日期自动填入", "活动交付物点击 ○/◐ 循环切换待办→进行中→已完成", "右侧上下分区：活动详情（交付物+进度条）+ 内容详情"],
  },
  {
    title: "竞品追踪",
    skills: "competitor-profiling · competitors · social · ai-seo",
    desc: "结构化竞品情报管理：画像编辑、观察记录、并排对比视图。所有数据手动录入。",
    tips: ["勾选 2-4 个竞品进入并排对比视图", "按定价/内容/社媒/产品分类记录观察", "竞品画像四维度：定位、价格带、渠道、内容风格"],
  },
  {
    title: "内容中心",
    skills: "post-writer · copywriting · hook-generator · brand-guidelines",
    desc: "双 Tab 面板：文案生成器 + 素材库。选平台→定类型→挑语气→输入主题→一键生成多版文案；五大分类素材管理。",
    tips: ["文案生成覆盖 6 大平台 × 5 种类型 × 6 种风格", "生成即保存——文案可一键存入素材库实现闭环", "素材五大分类：文案模板/品牌素材/SOP/竞品截图/收藏", "素材可关联活动，活动上下文直接引用对应文案"],
  },
  {
    title: "数据比对",
    skills: "analytics · analytics-dashboard · cro · ab-testing",
    desc: "三 Tab 数据工作台：文件导入 + 数据对比 + A/B 测试检验。支持 CSV/XLSX/XLS/DOCX 拖拽上传。",
    tips: ["拖拽文件到上传区自动解析为结构化数据集", "选择 2 个数据集自动匹配公共列名并排对比", "AB 检验：z-test / chi-square + 置信区间 + 效应量", "可下载示例 CSV 快速体验（A/B 测试数据）"],
  },
  {
    title: "知识库",
    skills: "deep-research · doc-coauthoring · Skill-Creator",
    desc: "六大分类知识管理：SOP 流程、最佳实践、行业洞察、技能指南、工作模板、案例研究。全文搜索+置顶。",
    tips: ["六大分类按按钮筛选和统计", "全文搜索标题、摘要、标签、正文内容", "关键文档支持置顶确保团队优先看到", "Markdown 格式撰写正文，详情弹窗展示完整内容"],
  },
  {
    title: "设置",
    skills: "launch · prd · systematic-debugging · update-config",
    desc: "双 Tab 面板：偏好设置（主题/通知/刷新/CSS变量调试）+ 版本管理（时间线/发布/回滚/主题预设）。",
    tips: ["切换浅色/深色主题，自动保存到本地", "CSS 变量实时调试：主色调、卡片间距、圆角即时生效", "版本时间线记录每个版本的变更摘要", "Indigo/Slate/Emerald/Amber 四种主题预设一键切换"],
  },
];

export default function HelpDrawer({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel flex flex-col">
        <div className="flex items-center justify-between px-6 h-16 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>使用手册</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Artic 工作台 v0.7 · 76 技能 · 9 模块 · 9 功能面板</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-alt transition-colors" style={{ color: "var(--muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="p-4 rounded-lg" style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--primary)" }}>Artic 工作台 v0.7</strong> 集成 76 个专业技能，覆盖 9 大运营模块，提供 9 个功能面板。
              左侧导航按<strong style={{ color: "var(--text)" }}> 首页→用户中心→运营节奏→竞品追踪→内容中心→数据比对→知识库→设置 </strong>顺序排列。
              所有数据手动录入和维护，不做虚假的自动抓取或模拟发布。
              完整技能目录请查阅 <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface)", color: "var(--primary)" }}>docs/SKILL_CATALOG.md</code>。
            </p>
          </div>
          {SECTIONS.map((s) => (
            <section key={s.title} className="p-4 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
              <h4 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>{s.title}</h4>
              <p className="text-[11px] font-medium mb-2" style={{ color: "var(--primary)" }}>{s.skills}</p>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
              <ul className="space-y-1">
                {s.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
                    <span style={{ color: "var(--primary)" }}>•</span>{tip}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="text-xs text-center py-2" style={{ color: "var(--muted)" }}>
            Artic v0.7 · Next.js 14 + Tailwind CSS · 首页→用户中心→运营节奏→竞品追踪→内容中心→数据比对→知识库→设置
          </div>
        </div>
      </div>
    </>
  );
}
