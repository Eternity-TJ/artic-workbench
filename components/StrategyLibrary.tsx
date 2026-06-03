"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface Strategy {
  id: number;
  name: string;
  sourceExperiment: string;
  lift: number;
  confidence: number;
  scenario: string;
  tags: string[];
  executionTemplate: string;
  status: "active" | "inactive";
  createdAt: string;
  source: "manual" | "ab-export" | "migrated";
}

interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  strategyNote?: string;
}

/* ==================== 常量 ==================== */

const SCENARIO_PRESETS = [
  "电商首页 Hero Banner",
  "落地页 CTA 按钮",
  "SaaS 注册流程",
  "邮件订阅弹窗",
  "SaaS 定价页",
  "推送通知文案",
  "注册页 CTA",
  "商品详情页",
  "购物车页面",
  "退出弹窗",
  "社媒广告文案",
  "邮件主题行",
  "应用商店描述",
  "着陆页标题",
];

/* ==================== 组件 ==================== */

export default function StrategyLibrary() {
  const suggestion = getSkillForModule("strategy");
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  // 筛选状态
  const [search, setSearch] = useState("");
  const [filterScenario, setFilterScenario] = useState("");
  const [filterLift, setFilterLift] = useState<"all" | "positive" | ">5" | ">10" | "negative">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterTag, setFilterTag] = useState("");

  // 模态框
  const [showNewModal, setShowNewModal] = useState(false);
  const [showApplyCampaign, setShowApplyCampaign] = useState<Strategy | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // 表单
  const [newName, setNewName] = useState("");
  const [newSourceExp, setNewSourceExp] = useState("");
  const [newLift, setNewLift] = useState("");
  const [newConfidence, setNewConfidence] = useState("");
  const [newScenario, setNewScenario] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newTemplate, setNewTemplate] = useState("");

  // 活动选择
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | "new">("new");
  const [newCampaignName, setNewCampaignName] = useState("");

  // ===== 持久化 =====
  useEffect(() => {
    try {
      const saved = localStorage.getItem("artic-strategies");
      if (saved) setStrategies(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (strategies.length > 0) {
      localStorage.setItem("artic-strategies", JSON.stringify(strategies));
    }
  }, [strategies]);

  // 加载活动列表
  useEffect(() => {
    try {
      const saved = localStorage.getItem("artic-campaigns");
      if (saved) setCampaigns(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // ===== 策略操作 =====

  const addStrategy = () => {
    if (!newName.trim()) { alert("请输入策略名称"); return; }
    if (!newTemplate.trim()) { alert("请输入执行模板"); return; }

    const s: Strategy = {
      id: Date.now(),
      name: newName.trim(),
      sourceExperiment: newSourceExp.trim(),
      lift: parseFloat(newLift) || 0,
      confidence: parseFloat(newConfidence) || 0,
      scenario: newScenario.trim(),
      tags: newTags.split(/[,，\s]+/).filter(Boolean),
      executionTemplate: newTemplate.trim(),
      status: "active",
      createdAt: new Date().toISOString(),
      source: "manual",
    };
    setStrategies((prev) => [s, ...prev]);
    resetNewForm();
    setShowNewModal(false);
  };

  const resetNewForm = () => {
    setNewName(""); setNewSourceExp(""); setNewLift(""); setNewConfidence("");
    setNewScenario(""); setNewTags(""); setNewTemplate("");
  };

  const toggleStatus = (id: number) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s))
    );
  };

  const deleteStrategy = (id: number) => {
    if (!confirm("确定删除此策略？")) return;
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  // ===== 导入历史实验 =====
  const importFromExperiments = () => {
    try {
      const raw = localStorage.getItem("artic-experiments");
      if (!raw) { alert("未找到历史实验数据"); return; }
      const exps: {
        id: number; name: string; scenario: string; lift: number;
        confidence: number; status: string; hypothesis: string;
        variantA: string; variantB: string;
      }[] = JSON.parse(raw);

      const won = exps.filter((e) => e.status === "won");
      if (won.length === 0) { alert("没有胜出的实验可导入"); return; }

      const existingNames = new Set(strategies.map((s) => s.name));
      const newStrategies: Strategy[] = won
        .filter((e) => !existingNames.has(e.name))
        .map((e) => ({
          id: Date.now() + Math.random() * 10000,
          name: e.name,
          sourceExperiment: e.name,
          lift: e.lift,
          confidence: e.confidence,
          scenario: e.scenario || "",
          tags: e.scenario ? [e.scenario] : [],
          executionTemplate: `假设：${e.hypothesis}\nA 版本：${e.variantA}\nB 版本：${e.variantB}\n提升：${e.lift > 0 ? "+" : ""}${e.lift}%（置信度 ${e.confidence}%）`,
          status: "active" as const,
          createdAt: new Date().toISOString(),
          source: "migrated" as const,
        }));

      if (newStrategies.length === 0) { alert("所有胜出实验已导入，无新增策略"); return; }

      setStrategies((prev) => [...newStrategies, ...prev]);
      setShowImportConfirm(false);
      alert(`✅ 已导入 ${newStrategies.length} 条策略`);
    } catch (err) {
      alert("导入失败：" + (err as Error).message);
    }
  };

  // ===== 应用到活动 =====
  const applyToCampaign = (strategy: Strategy) => {
    const targetId = selectedCampaignId;

    if (targetId === "new") {
      const name = newCampaignName.trim() || `[策略驱动] ${strategy.name}`;
      const campaign: Campaign = {
        id: Date.now(),
        name,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
        status: "planning",
        description: strategy.executionTemplate,
        strategyNote: `来源策略: ${strategy.name} | 提升: ${strategy.lift > 0 ? "+" : ""}${strategy.lift}% | 置信度: ${strategy.confidence}%`,
      };
      const updated = [campaign, ...campaigns];
      setCampaigns(updated);
      localStorage.setItem("artic-campaigns", JSON.stringify(updated));
      alert(`✅ 已创建新活动「${name}」并预填执行模板\n\n切换到「活动管理」查看。`);
    } else {
      const updated = campaigns.map((c) => {
        if (c.id === targetId) {
          return {
            ...c,
            description: (c.description || "") + `\n\n[策略: ${strategy.name}]\n${strategy.executionTemplate}`,
            strategyNote: `应用策略: ${strategy.name} | 提升: ${strategy.lift > 0 ? "+" : ""}${strategy.lift}%`,
          };
        }
        return c;
      });
      setCampaigns(updated);
      localStorage.setItem("artic-campaigns", JSON.stringify(updated));
      const target = campaigns.find((c) => c.id === targetId);
      alert(`✅ 已将策略「${strategy.name}」的执行模板追加到活动「${target?.name}」\n\n切换到「活动管理」查看。`);
    }

    setShowApplyCampaign(null);
    setSelectedCampaignId("new");
    setNewCampaignName("");
  };

  const openApplyModal = (strategy: Strategy) => {
    // 刷新活动列表
    try {
      const saved = localStorage.getItem("artic-campaigns");
      if (saved) setCampaigns(JSON.parse(saved));
    } catch { /* ignore */ }
    setShowApplyCampaign(strategy);
    setSelectedCampaignId("new");
    setNewCampaignName(`[策略驱动] ${strategy.name}`);
  };

  // ===== 应用到内容工坊 =====
  const applyToPostWriter = (strategy: Strategy) => {
    const prompt = `[策略框架] ${strategy.name}\n场景: ${strategy.scenario}\n执行模板: ${strategy.executionTemplate}\n参考提升: ${strategy.lift > 0 ? "+" : ""}${strategy.lift}%`;
    localStorage.setItem("artic-strategy-post-prompt", prompt);
    window.dispatchEvent(new CustomEvent("artic-nav", { detail: "content-center" }));
  };

  // ===== 筛选 =====
  const allScenarios = Array.from(new Set(strategies.map((s) => s.scenario).filter(Boolean)));
  const allTags = Array.from(new Set(strategies.flatMap((s) => s.tags).filter(Boolean)));

  const filtered = strategies.filter((s) => {
    if (search && !s.name.includes(search) && !s.executionTemplate.includes(search) && !s.scenario.includes(search))
      return false;
    if (filterScenario && s.scenario !== filterScenario) return false;
    if (filterTag && !s.tags.includes(filterTag)) return false;
    if (filterStatus === "active" && s.status !== "active") return false;
    if (filterStatus === "inactive" && s.status !== "inactive") return false;
    if (filterLift === "positive" && s.lift <= 0) return false;
    if (filterLift === ">5" && s.lift < 5) return false;
    if (filterLift === ">10" && s.lift < 10) return false;
    if (filterLift === "negative" && s.lift >= 0) return false;
    return true;
  });

  // ===== 统计 =====
  const avgLift = strategies.length > 0
    ? strategies.filter((s) => s.status === "active").reduce((sum, s) => sum + s.lift, 0) / strategies.filter((s) => s.status === "active").length
    : 0;

  const topScenarios = (() => {
    const counts: Record<string, number> = {};
    strategies.forEach((s) => {
      if (s.scenario) counts[s.scenario] = (counts[s.scenario] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  })();

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>策略库</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        可行动的决策引擎 · 从历史实验中提炼策略 · 一键应用到活动/内容工坊
      </p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">

          {/* ===== 统计摘要 ===== */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "总策略数", value: strategies.length, color: "var(--primary)" },
              { label: "已启用", value: strategies.filter((s) => s.status === "active").length, color: "#10B981" },
              { label: "平均提升率", value: `${avgLift > 0 ? "+" : ""}${avgLift.toFixed(1)}%`, color: avgLift > 0 ? "#10B981" : "#EF4444" },
              { label: "最高提升", value: strategies.length ? `${Math.max(...strategies.map((s) => s.lift)) > 0 ? "+" : ""}${Math.max(...strategies.map((s) => s.lift)).toFixed(1)}%` : "-", color: "#F59E0B" },
              { label: "置信≥95%", value: strategies.filter((s) => s.confidence >= 95).length, color: "#8B5CF6" },
            ].map((stat) => (
              <div key={stat.label} className="smart-card text-center py-3">
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 常用场景 TOP 3 */}
          {topScenarios.length > 0 && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold" style={{ color: "var(--muted)" }}>最常用场景:</span>
              {topScenarios.map(([scenario, count], i) => (
                <span key={scenario} className="px-2 py-0.5 rounded-full"
                  style={{ background: "var(--surface-alt)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  {i + 1}. {scenario} ({count})
                </span>
              ))}
            </div>
          )}

          {/* 操作栏 */}
          <div className="flex items-center gap-2">
            <button className="btn btn-primary text-xs" onClick={() => setShowNewModal(true)}>
              + 新建策略
            </button>
            <button className="btn btn-outline text-xs" onClick={() => setShowImportConfirm(true)}>
              导入历史实验
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              {[
                { key: "all" as const, label: "全部" },
                { key: "positive" as const, label: "正向" },
                { key: ">5" as const, label: "≥5%" },
                { key: ">10" as const, label: "≥10%" },
                { key: "negative" as const, label: "负向" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilterLift(f.key)}
                  className="text-[10px] px-2 py-1 rounded-full transition-all"
                  style={{
                    background: filterLift === f.key ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-alt)",
                    color: filterLift === f.key ? "var(--primary)" : "var(--muted)",
                    border: `1px solid ${filterLift === f.key ? "var(--primary)" : "var(--border)"}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===== 策略卡片网格 ===== */}
          {filtered.length === 0 ? (
            <div className="smart-card text-center py-12">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" className="mx-auto mb-3 opacity-40">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--muted)" }}>
                {strategies.length === 0 ? "暂无策略" : "无匹配策略"}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {strategies.length === 0
                  ? "点击「新建策略」手动创建，或「导入历史实验」从已有实验迁移"
                  : "尝试调整筛选条件"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((s) => (
                <div key={s.id} className="smart-card flex flex-col animate-fade-in"
                  style={{ opacity: s.status === "inactive" ? 0.55 : 1 }}>
                  {/* 卡片顶部：名称 + 提升率 + 置信度 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{s.name}</h3>
                        {s.source === "migrated" && (
                          <span className="text-[9px] px-1 py-0.5 rounded shrink-0" style={{ background: "color-mix(in srgb, #F59E0B 12%, transparent)", color: "#F59E0B" }}>迁移</span>
                        )}
                        {s.source === "ab-export" && (
                          <span className="text-[9px] px-1 py-0.5 rounded shrink-0" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}>AB</span>
                        )}
                      </div>
                      {s.sourceExperiment && (
                        <p className="text-[10px] truncate" style={{ color: "var(--muted)" }}>来源: {s.sourceExperiment}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold leading-tight" style={{ color: s.lift > 0 ? "#10B981" : s.lift < 0 ? "#EF4444" : "var(--muted)" }}>
                        {s.lift > 0 ? "+" : ""}{s.lift}%
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <div className="w-10 h-1.5 rounded-full" style={{ background: "var(--surface-alt)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(100, s.confidence)}%`,
                            background: s.confidence >= 95 ? "#10B981" : s.confidence >= 80 ? "#F59E0B" : "#EF4444",
                          }}/>
                        </div>
                        <span className="text-[9px] font-bold" style={{
                          color: s.confidence >= 95 ? "#10B981" : s.confidence >= 80 ? "#F59E0B" : "#EF4444",
                        }}>{s.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 场景 + 标签 */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.scenario && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-all"
                        style={{
                          background: filterScenario === s.scenario ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--surface-alt)",
                          color: filterScenario === s.scenario ? "var(--primary)" : "var(--text-secondary)",
                          border: `1px solid ${filterScenario === s.scenario ? "var(--primary)" : "var(--border)"}`,
                        }}
                        onClick={() => setFilterScenario(filterScenario === s.scenario ? "" : s.scenario)}>
                        📍 {s.scenario}
                      </span>
                    )}
                    {s.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-all"
                        style={{
                          background: filterTag === tag ? "color-mix(in srgb, #8B5CF6 12%, transparent)" : "var(--surface-alt)",
                          color: filterTag === tag ? "#8B5CF6" : "var(--muted)",
                          border: `1px solid ${filterTag === tag ? "#8B5CF6" : "var(--border)"}`,
                        }}
                        onClick={() => setFilterTag(filterTag === tag ? "" : tag)}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 执行模板预览 */}
                  <div className="p-2.5 rounded-lg mb-3 flex-1" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                    <p className="text-[10px] leading-relaxed line-clamp-3 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                      {s.executionTemplate}
                    </p>
                  </div>

                  {/* 底部操作 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      className="text-[10px] px-2.5 py-1 rounded font-medium transition-all"
                      style={{ background: "var(--primary)", color: "#fff" }}
                      onClick={() => openApplyModal(s)}>
                      应用到活动
                    </button>
                    <button
                      className="text-[10px] px-2.5 py-1 rounded font-medium transition-all"
                      style={{ border: "1px solid var(--primary)", color: "var(--primary)" }}
                      onClick={() => applyToPostWriter(s)}>
                      应用到内容工坊
                    </button>
                    <button
                      className="text-[10px] px-2 py-1 rounded transition-all ml-auto"
                      style={{
                        color: s.status === "active" ? "#F59E0B" : "#10B981",
                        border: `1px solid ${s.status === "active" ? "#F59E0B" : "#10B981"}20`,
                      }}
                      onClick={() => toggleStatus(s.id)}>
                      {s.status === "active" ? "停用" : "启用"}
                    </button>
                    <button
                      className="text-[10px] px-2 py-1 rounded transition-all"
                      style={{ color: "#EF4444", border: "1px solid #EF444420" }}
                      onClick={() => deleteStrategy(s.id)}>
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== 右侧筛选栏 ===== */}
        <div className="w-[300px] shrink-0 hidden lg:flex flex-col gap-4">
          {/* 搜索 */}
          <div className="smart-card">
            <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>🔍 搜索</h3>
            <input
              className="input-field text-xs"
              placeholder="搜索策略名称、模板内容..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 状态筛选 */}
          <div className="smart-card">
            <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>📌 状态</h3>
            <div className="flex gap-1.5">
              {[
                { key: "all" as const, label: "全部" },
                { key: "active" as const, label: "启用" },
                { key: "inactive" as const, label: "停用" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilterStatus(f.key)}
                  className="text-[10px] flex-1 py-1.5 rounded-full font-medium transition-all"
                  style={{
                    background: filterStatus === f.key ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-alt)",
                    color: filterStatus === f.key ? "var(--primary)" : "var(--muted)",
                    border: `1px solid ${filterStatus === f.key ? "var(--primary)" : "var(--border)"}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 场景筛选 */}
          {allScenarios.length > 0 && (
            <div className="smart-card">
              <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>🎯 场景</h3>
              <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
                {allScenarios.map((sc) => (
                  <button key={sc} onClick={() => setFilterScenario(filterScenario === sc ? "" : sc)}
                    className="text-[10px] px-2 py-1 rounded-full transition-all"
                    style={{
                      background: filterScenario === sc ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-alt)",
                      color: filterScenario === sc ? "var(--primary)" : "var(--muted)",
                      border: `1px solid ${filterScenario === sc ? "var(--primary)" : "var(--border)"}`,
                    }}>
                    {sc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="smart-card">
              <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>🏷️ 标签</h3>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <button key={tag} onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                    className="text-[10px] px-2 py-1 rounded-full transition-all"
                    style={{
                      background: filterTag === tag ? "color-mix(in srgb, #8B5CF6 10%, transparent)" : "var(--surface-alt)",
                      color: filterTag === tag ? "#8B5CF6" : "var(--muted)",
                      border: `1px solid ${filterTag === tag ? "#8B5CF6" : "var(--border)"}`,
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SmartSuggestionCard suggestion={suggestion} />
        </div>

        {/* 移动端 SmartSuggestionCard */}
        <div className="lg:hidden">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>

      {/* ===== 新建策略模态框 ===== */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowNewModal(false); resetNewForm(); } }}>
          <div className="rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>新建策略</h3>
              <button className="p-2 rounded-lg" style={{ color: "var(--muted)" }}
                onClick={() => { setShowNewModal(false); resetNewForm(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>策略名称 *</label>
                <input className="input-field text-xs" placeholder="例如：紧迫感标题策略" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>来源实验</label>
                <input className="input-field text-xs" placeholder="引用 A/B 测试名称（可选）" value={newSourceExp} onChange={(e) => setNewSourceExp(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>提升率 (%)</label>
                  <input className="input-field text-xs" placeholder="+4.8" value={newLift} onChange={(e) => setNewLift(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>置信度 (%)</label>
                  <input className="input-field text-xs" placeholder="97.2" value={newConfidence} onChange={(e) => setNewConfidence(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>适用场景</label>
                <input className="input-field text-xs" list="scenario-list" placeholder="例如：电商首页 Hero Banner" value={newScenario} onChange={(e) => setNewScenario(e.target.value)} />
                <datalist id="scenario-list">
                  {SCENARIO_PRESETS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>标签（逗号分隔）</label>
                <input className="input-field text-xs" placeholder="电商, 标题优化, Hero Banner" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>执行模板 *</label>
                <textarea className="input-field text-xs min-h-[120px]" placeholder="描述如何应用此策略：&#10;例如：标题使用数字+情感词，长度 10-12 字&#10;配合紧迫感副标题（限时/限量/错过）" value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)} />
              </div>
            </div>
            <div className="px-6 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button className="btn btn-ghost text-xs" onClick={() => { setShowNewModal(false); resetNewForm(); }}>取消</button>
              <button className="btn btn-primary text-xs" onClick={addStrategy}>创建策略</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 应用到活动模态框 ===== */}
      {showApplyCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowApplyCampaign(null); }}>
          <div className="rounded-xl shadow-2xl w-full max-w-md animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>应用到活动</h3>
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>策略：{showApplyCampaign.name}</p>
              </div>
              <button className="p-2 rounded-lg" style={{ color: "var(--muted)" }} onClick={() => setShowApplyCampaign(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold block mb-2" style={{ color: "var(--muted)" }}>选择目标</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: selectedCampaignId === "new" ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "var(--surface-alt)",
                      border: `1px solid ${selectedCampaignId === "new" ? "var(--primary)" : "var(--border)"}`,
                    }}>
                    <input type="radio" name="campaign" checked={selectedCampaignId === "new"} onChange={() => setSelectedCampaignId("new")} />
                    <span className="text-xs font-medium" style={{ color: "var(--text)" }}>创建新活动</span>
                  </label>
                  {campaigns.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: selectedCampaignId === c.id ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "var(--surface-alt)",
                        border: `1px solid ${selectedCampaignId === c.id ? "var(--primary)" : "var(--border)"}`,
                      }}>
                      <input type="radio" name="campaign" checked={selectedCampaignId === c.id} onChange={() => setSelectedCampaignId(c.id)} />
                      <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{c.name}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded ml-auto" style={{
                        background: c.status === "planning" ? "color-mix(in srgb, #F59E0B 12%, transparent)" : "color-mix(in srgb, #10B981 12%, transparent)",
                        color: c.status === "planning" ? "#F59E0B" : "#10B981",
                      }}>{c.status === "planning" ? "计划中" : c.status}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedCampaignId === "new" && (
                <div>
                  <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>新活动名称</label>
                  <input className="input-field text-xs" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} />
                </div>
              )}
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--muted)" }}>将填入活动描述：</p>
                <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                  {showApplyCampaign.executionTemplate}
                </p>
              </div>
            </div>
            <div className="px-6 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button className="btn btn-ghost text-xs" onClick={() => setShowApplyCampaign(null)}>取消</button>
              <button className="btn btn-primary text-xs" onClick={() => applyToCampaign(showApplyCampaign)}>
                {selectedCampaignId === "new" ? "创建并应用" : "应用到选中活动"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 导入历史确认 ===== */}
      {showImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowImportConfirm(false); }}>
          <div className="rounded-xl shadow-2xl w-full max-w-sm animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>导入历史实验</h3>
              <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                从旧「实验库」中提取所有「胜出」状态的实验，自动生成策略卡片。原有数据不会删除。
              </p>
            </div>
            <div className="px-6 py-4">
              {(() => {
                try {
                  const raw = localStorage.getItem("artic-experiments");
                  const exps = raw ? JSON.parse(raw) : [];
                  const wonCount = exps.filter((e: { status: string }) => e.status === "won").length;
                  return (
                    <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                      检测到 <span className="font-bold" style={{ color: "var(--primary)" }}>{exps.length}</span> 条历史实验，
                      其中 <span className="font-bold" style={{ color: "#10B981" }}>{wonCount}</span> 条胜出可导入
                    </p>
                  );
                } catch { return null; }
              })()}
            </div>
            <div className="px-6 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button className="btn btn-ghost text-xs" onClick={() => setShowImportConfirm(false)}>取消</button>
              <button className="btn btn-primary text-xs" onClick={importFromExperiments}>确认导入</button>
            </div>
          </div>
        </div>
      )}

      {/* 策略为空时仍显示 SmartSuggestionCard（无右侧栏场景） */}
      {strategies.length === 0 && (
        <div className="lg:hidden mt-4">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      )}
    </div>
  );
}
