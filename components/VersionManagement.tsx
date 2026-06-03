"use client";

import { useState } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface Version {
  id: number;
  version: string;
  date: string;
  content: string;
  isCurrent: boolean;
}

/* ==================== 真实版本记录 ==================== */

const REAL_VERSIONS: Version[] = [
  {
    id: 7, version: "v0.7.0", date: "2026-06-02", isCurrent: true,
    content: "界面重构——活动管理+内容日历合并为「运营日历」（双 Tab 切换）、素材库+文案工坊合并为「内容中心」、实验库替换为「策略库」（卡片网格+提炼引擎+应用到活动/内容工坊联动）、数据模块精简为 3 Tab（导入/对比/AB）并改名为「数据比对」、删除对比结果中心 tab、全局 UI 一致性优化",
  },
  {
    id: 6, version: "v0.6.0", date: "2026-06-01", isCurrent: false,
    content: "数据模块真实化——引入 xlsx+mammoth 实现 CSV/XLSX/DOCX 文件导入解析、数据对比（自动列匹配+并排对比+差异高亮）、AB 测试逐行对比表+8 项统计摘要+提炼策略、归因看板改造为对比结果中心（卡片列表+详情弹窗）、纯 TypeScript 统计函数库（normalCDF/quantile/z-test/chi-square/效应量/样本量估算）",
  },
  {
    id: 5, version: "v0.5.0", date: "2026-06-01", isCurrent: false,
    content: "首页改版为 SaaS 落地页（5 屏结构：Hero/数据条/核心能力/面板速览/CTA）、全局阴影系统（--card-shadow 变量 + hover 层次）、Sidebar 增加用户区域、毛玻璃 .glass 工具类、SEO metadata 完善",
  },
  {
    id: 4, version: "v0.4.0", date: "2026-06-01", isCurrent: false,
    content: "务实重建——删除发布管道（无真实 API）、删除内容工坊（模拟 AI 生成）、删除链接提取（对小红书等真实平台无效）。新增工作台首页（指标仪表盘+待办+动态）、内容日历（月历+列表，仅规划不发布）、素材库（5 分类+搜索+关联活动）。活动管理增加交付物清单+进度条、竞品追踪增加四维画像+观察记录+并排对比。导航精简为 8 面板。",
  },
  {
    id: 3, version: "v0.3.0", date: "2026-06-01", isCurrent: false,
    content: "扩展至 10 个功能面板——新增洞察池（拖拽卡片+链接提取）、内容工坊（三栏布局+模拟 AI 生成）、发布管道（看板视图+模拟发布）、实验库（历史 AB 测试表格）。数据模块增加归因看板（桑基图模拟）。模块间增加数据联动（localStorage 跨组件共享）。",
  },
  {
    id: 2, version: "v0.2.0", date: "2026-06-01", isCurrent: false,
    content: "完善 6 个功能模块——竞品追踪（CRUD+表格）、活动管理（表单+列表+状态标签）、数据（KOL 看板+A/B 测试工作台）、版本管理（时间线+回滚）、设置（主题切换+通知+刷新间隔）、使用手册抽屉。每个模块右侧嵌入 320px 智能建议卡片（基于 SKILL_CATALOG.md 76 技能映射）。增加深色主题支持（html.dark class 驱动 CSS 变量切换）。",
  },
  {
    id: 1, version: "v0.1.0", date: "2026-06-01", isCurrent: false,
    content: "Artic 工作台初始化——创建 SKILL_CATALOG.md（76 个技能 × 9 大模块 × 20 智能行为映射）、Next.js 14 + Tailwind CSS 项目搭建、侧栏导航 260px 固定宽度、欢迎卡片、使用手册抽屉、开发者视图面板（CSS 变量实时控制）。",
  },
];

/* ==================== 主题预设（CSS 变量预览，非虚假历史） ==================== */

interface ThemePreset {
  id: number;
  name: string;
  description: string;
  primaryColor: string;
  cardRadius: number;
  cardPadding: number;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 1, name: "默认 Indigo",
    description: "当前使用的主题——Indigo 主色 + 12px 圆角 + 24px 内边距",
    primaryColor: "#6366F1", cardRadius: 12, cardPadding: 24,
  },
  {
    id: 2, name: "紧凑 Slate",
    description: "信息密度更高的紧凑布局——Slate 主色 + 8px 圆角 + 16px 内边距。适合数据密集型页面",
    primaryColor: "#475569", cardRadius: 8, cardPadding: 16,
  },
  {
    id: 3, name: "柔和 Emerald",
    description: "品牌偏绿色的柔和风格——Emerald 主色 + 16px 大圆角 + 28px 宽松间距。适合品牌/内容型页面",
    primaryColor: "#10B981", cardRadius: 16, cardPadding: 28,
  },
  {
    id: 4, name: "直角 Amber",
    description: "偏工具型的直角风格——Amber 主色 + 0px 直角 + 20px 间距。适合后台管理系统风格",
    primaryColor: "#F59E0B", cardRadius: 0, cardPadding: 20,
  },
];

/* ==================== 组件 ==================== */

export default function VersionManagement({ embedded }: { embedded?: boolean }) {
  const suggestion = embedded ? null : getSkillForModule("settings");
  const [versions, setVersions] = useState<Version[]>(REAL_VERSIONS);
  const [newVersion, setNewVersion] = useState("");
  const [newContent, setNewContent] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  /* ========== 发布新版本 ========== */
  const handlePublish = () => {
    if (!newVersion.trim() || !newContent.trim()) return;
    const fresh: Version = {
      id: Date.now(),
      version: newVersion.trim().startsWith("v") ? newVersion.trim() : `v${newVersion.trim()}`,
      date: new Date().toISOString().slice(0, 10),
      content: newContent.trim(),
      isCurrent: true,
    };
    setVersions((prev) => {
      const updated = prev.map((v) => ({ ...v, isCurrent: false }));
      return [fresh, ...updated];
    });
    setNewVersion("");
    setNewContent("");
  };

  /* ========== 回滚提醒 ========== */
  const handleRollback = (v: Version) => {
    alert(`⚠️ 回滚确认\n\n即将回滚到 ${v.version}\n发布日期: ${v.date}\n更新内容: ${v.content}\n\n请在服务器控制台执行回滚操作。\n\n提示：Artic 工作台部署于 Vercel/服务器时，可通过 git revert 或部署回滚实现版本切换。`);
  };

  /* ========== 主题预览 ========== */
  const handlePresetApply = (preset: ThemePreset | null) => {
    if (!preset) {
      setActivePreset(null);
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--card-radius");
      document.documentElement.style.removeProperty("--card-padding");
      return;
    }
    setActivePreset(preset.id);
    document.documentElement.style.setProperty("--primary", preset.primaryColor);
    document.documentElement.style.setProperty("--card-radius", `${preset.cardRadius}px`);
    document.documentElement.style.setProperty("--card-padding", `${preset.cardPadding}px`);
  };

  return (
    <div className={embedded ? "" : "animate-fade-in"}>
      {!embedded && (
        <>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>版本管理</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>版本时间线 · 发布记录 · 主题预设预览</p>
        </>
      )}

      <div className={embedded ? "" : "flex gap-6"}>
        <div className="flex-1 min-w-0 space-y-4">

          {/* 发布新版本 */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>记录新版本</h3>
            <p className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>
              手动记录版本变更——用于团队内部追踪。实际部署需通过 git 或 CI/CD 流水线完成。
            </p>
            <div className="flex gap-3 mb-3">
              <input className="input-field w-40 shrink-0" placeholder="版本号，如 0.6.0" value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)} />
              <input className="input-field flex-1" placeholder="更新内容摘要..." value={newContent}
                onChange={(e) => setNewContent(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handlePublish}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              记录版本
            </button>
          </div>

          {/* 主题预设（替代虚假"环境快照"） */}
          <div className="smart-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>主题预设预览</h3>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                  点击下方预设可实时预览不同的 CSS 变量组合——仅前端演示，刷新后恢复默认
                </p>
              </div>
              {activePreset !== null && (
                <button className="text-[10px] px-2 py-1 rounded font-bold"
                  style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  onClick={() => handlePresetApply(null)}>
                  恢复默认
                </button>
              )}
            </div>

            {/* 选中预设的预览面板 */}
            {activePreset !== null && (() => {
              const preset = THEME_PRESETS.find((p) => p.id === activePreset)!;
              return (
                <div className="mb-4 p-4 rounded-lg animate-fade-in"
                  style={{ background: "color-mix(in srgb, var(--primary) 5%, transparent)", border: "1px solid var(--primary)" }}>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "主题名", value: preset.name },
                      { label: "主色", value: preset.primaryColor, isColor: true, color: preset.primaryColor },
                      { label: "卡片圆角", value: `${preset.cardRadius}px` },
                      { label: "卡片间距", value: `${preset.cardPadding}px` },
                      { label: "描述", value: preset.description, span: 2 },
                    ].map((item) => (
                      <div key={item.label} className={`p-2 rounded ${item.span ? "" : ""}`}
                        style={{ background: "var(--surface)", gridColumn: item.span ? `span ${item.span}` : undefined }}>
                        <p className="text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>{item.label}</p>
                        <p className="text-xs font-bold" style={{ color: item.isColor ? item.color : "var(--text)" }}>
                          {item.isColor && <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: item.color }} />}
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 预设列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetApply(activePreset === preset.id ? null : preset)}
                  className="text-left p-3 rounded-lg transition-all"
                  style={{
                    background: activePreset === preset.id
                      ? "color-mix(in srgb, var(--primary) 6%, transparent)"
                      : "var(--surface-alt)",
                    border: activePreset === preset.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {/* 预览色块 */}
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ background: `${preset.primaryColor}20` }}>
                      <span className="w-3 h-3 rounded-full" style={{ background: preset.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text)" }}>{preset.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                        圆角 {preset.cardRadius}px · 间距 {preset.cardPadding}px
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 版本时间线 */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              版本时间线 <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>({versions.length})</span>
            </h3>

            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded" style={{ background: "var(--border)" }} />

              <div className="space-y-4">
                {versions.map((v) => (
                  <div key={v.id} className="flex gap-4 relative">
                    {/* 时间线圆点 */}
                    <div className="relative z-10 shrink-0 mt-1">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${v.isCurrent ? "ring-2 ring-offset-2" : ""}`}
                        style={{
                          background: v.isCurrent ? "var(--primary)" : "var(--surface)",
                          borderColor: v.isCurrent ? "var(--primary)" : "var(--border)",
                          ...(v.isCurrent ? { boxShadow: "0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent)" } : {}),
                        }}
                      >
                        {v.isCurrent && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* 内容卡片 */}
                    <div
                      className="flex-1 p-4 rounded-lg transition-colors"
                      style={{
                        background: v.isCurrent ? "color-mix(in srgb, var(--primary) 5%, transparent)" : "var(--surface-alt)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{v.version}</span>
                          {v.isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: "var(--primary)" }}>
                              当前版本
                            </span>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{v.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v.content}</p>

                      {!v.isCurrent && (
                        <button className="btn btn-outline text-xs px-3 py-1 mt-3" onClick={() => handleRollback(v)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                          </svg>
                          回滚到此版本
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!embedded && (
          <div className="w-[320px] shrink-0 hidden lg:block">
            <SmartSuggestionCard suggestion={suggestion} />
          </div>
        )}
      </div>
    </div>
  );
}
