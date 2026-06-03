import EnterButton from "@/components/EnterButton";

/* ==================== 平台数据（纯静态） ==================== */

const STATS = [
  { value: 76, suffix: " 个", label: "专业技能", desc: "覆盖运营全链路" },
  { value: 9, suffix: " 大", label: "模块分类", desc: "营销·内容·社媒·增长·品牌" },
  { value: 9, suffix: " 个", label: "功能面板", desc: "首页·运营节奏·内容中心" },
  { value: 20, suffix: " 种", label: "智能行为", desc: "自动匹配最优技能" },
];

const CAPABILITIES = [
  {
    title: "营销策划",
    desc: "从营销计划、活动管理到发布复盘的全流程支持。内置北极星指标拆解、人群分层、预算分配模板。",
    skills: ["marketing-plan", "launch", "marketing-ideas", "customer-research"],
    color: "#6366F1",
  },
  {
    title: "内容创作",
    desc: "多平台文案生成、标题公式优化、内容结构模板。覆盖小红书/抖音/公众号/微博/Instagram。",
    skills: ["copywriting", "post-writer", "hook-generator", "content-strategy"],
    color: "#10B981",
  },
  {
    title: "数据分析",
    desc: "KOL 看板、A/B 测试工作台、归因分析、转化漏斗。用数据驱动运营决策，拒绝拍脑袋。",
    skills: ["analytics", "analytics-dashboard", "ab-testing", "cro"],
    color: "#F59E0B",
  },
  {
    title: "竞品情报",
    desc: "结构化竞品画像、分类观察记录、并排对比分析。系统化追踪竞品动态而非零散信息。",
    skills: ["competitor-profiling", "competitors", "social", "ai-seo"],
    color: "#EF4444",
  },
  {
    title: "品牌设计",
    desc: "品牌规范检查、配色一致性、Logo 使用指南、Canva 风格平面设计。保护品牌视觉资产。",
    skills: ["brand-guidelines", "graphic-designer", "theme-factory", "UI-UX-Pro-Max"],
    color: "#8B5CF6",
  },
  {
    title: "流程自动化",
    desc: "n8n 工作流模式、API 限流策略、运营自动化提示工程。把重复劳动交给系统。",
    skills: ["operational-prompting", "revops", "mcp-builder", "schema"],
    color: "#EC4899",
  },
];

const MODULES = [
  { icon: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z", name: "工作台首页", desc: "关键指标·待办·动态", skills: "marketing-plan · analytics" },
  { icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75", name: "用户中心", desc: "团队·仪表盘·日志", skills: "marketing-plan · project-docs" },
  { icon: "M2 4h18a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2z M16 2v4 M8 2v4 M3 10h18 M12 15v4 M9 17h6", name: "运营节奏", desc: "月历·活动·内容排期", skills: "marketing-plan · launch" },
  { icon: "M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z", name: "竞品追踪", desc: "画像·观察·对比", skills: "competitor-profiling · social" },
  { icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8", name: "内容中心", desc: "文案生成·素材管理", skills: "post-writer · copywriting" },
  { icon: "M18 20V10M12 20V4M6 20v-6", name: "数据比对", desc: "导入·对比·AB检验", skills: "analytics · ab-testing" },
  { icon: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z M8 7h8 M8 11h6", name: "知识库", desc: "SOP·案例·技能指南", skills: "deep-research · doc-coauthoring" },
  { icon: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z", name: "设置", desc: "偏好·版本·样式调试", skills: "launch · prd" },
];

/* ==================== 组件 ==================== */

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg)" }}>
      {/* ===== ① Hero ===== */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* 装饰光晕 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
            Artic v0.7 · 运营工作台
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4" style={{ color: "var(--text)" }}>
            Artic
          </h1>
          <p className="text-lg md:text-xl mb-2 text-balance" style={{ color: "var(--text-secondary)" }}>
            面向运营团队的一站式工作台
          </p>
          <p className="text-sm mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
            集成 <strong style={{ color: "var(--text)" }}>76 个专业技能</strong>，覆盖营销策划、内容创作、数据分析、竞品情报、品牌设计、流程自动化
            <strong style={{ color: "var(--text)" }}> 9 大运营模块</strong>
          </p>

          <EnterButton />
        </div>
      </section>

      {/* ===== ② 数据条 ===== */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: "var(--primary)" }}>
                {stat.value}<span className="text-lg font-semibold" style={{ color: "var(--muted)" }}>{stat.suffix}</span>
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{stat.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ③ 核心能力 ===== */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>Artic 能做什么</h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            每个能力背后都有 Claude Code 技能支撑，输入触发词即可自动调用对应的 AI 技能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="p-6 rounded-2xl transition-all group"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${cap.color}15`, color: cap.color }}>
                  {["📊", "✍️", "📈", "🔍", "🎨", "⚡"][CAPABILITIES.indexOf(cap)]}
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{cap.title}</h3>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{cap.desc}</p>
              <div className="flex flex-wrap gap-1">
                {cap.skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-1 rounded-md font-medium"
                    style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ④ 功能面板速览 ===== */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>9 大功能面板</h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            左侧导航按工作流顺序排列：首页 → 用户中心 → 运营节奏 → 竞品追踪 → 内容中心 → 数据比对 → 知识库 → 设置
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODULES.map((mod) => (
            <div key={mod.name} className="p-4 rounded-xl text-center transition-all hover:border-primary/50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={mod.icon} />
                </svg>
              </div>
              <p className="text-sm font-bold mb-0.5" style={{ color: "var(--text)" }}>{mod.name}</p>
              <p className="text-[11px] mb-2" style={{ color: "var(--muted)" }}>{mod.desc}</p>
              <p className="text-[10px] font-medium" style={{ color: "var(--primary)" }}>{mod.skills}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ⑤ 底部 CTA ===== */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="p-10 rounded-3xl" style={{
          background: "var(--surface-alt)",
          border: "1px solid var(--border)",
        }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>准备好开始了吗？</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>76 个技能已经就绪，输入你的运营任务，AI 自动匹配最佳技能</p>
          <EnterButton />
        </div>
        <p className="text-xs mt-8" style={{ color: "var(--muted)" }}>
          Artic v0.7 · Next.js 14 + Tailwind CSS · 76 Skills · 9 Modules · 9 Panels
        </p>
      </section>
    </main>
  );
}
