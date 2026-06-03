"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface Experiment {
  id: number;
  name: string;
  hypothesis: string;
  variantA: string;
  variantB: string;
  lift: number;
  confidence: number;
  scenario: string;
  date: string;
  status: "won" | "lost" | "inconclusive";
  sampleSize: number;
  duration: number; // 天
}

const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: 1, name: "首页标题 A/B", hypothesis: "紧迫感标题比利益承诺标题转化更高",
    variantA: "限时特惠，全场5折起", variantB: "错过等一年，超值折扣来袭",
    lift: 4.8, confidence: 97.2, scenario: "电商首页 Hero Banner", date: "2026-05-28",
    status: "won", sampleSize: 10200, duration: 14,
  },
  {
    id: 2, name: "注册页简化", hypothesis: "移除手机号字段可提升注册完成率",
    variantA: "邮箱 + 手机号双字段", variantB: "仅邮箱注册",
    lift: 2.1, confidence: 94.5, scenario: "SaaS 注册流程优化", date: "2026-05-20",
    status: "won", sampleSize: 8500, duration: 10,
  },
  {
    id: 3, name: "CTA 按钮颜色", hypothesis: "绿色按钮比蓝色按钮点击率更高",
    variantA: "蓝色 #6366F1", variantB: "绿色 #10B981",
    lift: -1.2, confidence: 88.3, scenario: "落地页 CTA 按钮", date: "2026-05-15",
    status: "lost", sampleSize: 6700, duration: 7,
  },
  {
    id: 4, name: "弹窗时机测试", hypothesis: "浏览 30 秒后弹窗比立即弹窗转化高",
    variantA: "进入页面立即弹窗", variantB: "浏览 30 秒后弹窗",
    lift: 12.5, confidence: 99.1, scenario: "内容站邮件订阅弹窗", date: "2026-05-10",
    status: "won", sampleSize: 15200, duration: 21,
  },
  {
    id: 5, name: "价格锚点测试", hypothesis: "高价锚点能提升中价位套餐选择率",
    variantA: "仅展示 ¥99 套餐", variantB: "展示 ¥199/¥99/¥49 三档",
    lift: 0.8, confidence: 72.3, scenario: "SaaS 定价页", date: "2026-05-05",
    status: "inconclusive", sampleSize: 5200, duration: 9,
  },
];

/* ==================== 组件 ==================== */

export default function ExperimentLibrary() {
  const suggestion = getSkillForModule("experiments");
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filter, setFilter] = useState<"all" | "won" | "lost" | "inconclusive">("all");
  const [sortBy, setSortBy] = useState<"date" | "lift" | "confidence">("date");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("artic-experiments");
      const parsed = saved ? JSON.parse(saved) : null;
      setExperiments(parsed?.length ? parsed : INITIAL_EXPERIMENTS);
    } catch { setExperiments(INITIAL_EXPERIMENTS); }
  }, []);

  useEffect(() => {
    if (experiments.length) localStorage.setItem("artic-experiments", JSON.stringify(experiments));
  }, [experiments]);

  /* 复用到新活动 */
  const reuseForCampaign = (exp: Experiment) => {
    const campaigns = JSON.parse(localStorage.getItem("artic-campaigns") || "[]");
    campaigns.push({
      id: Date.now(),
      name: `[实验复用] ${exp.name}`,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      status: "planning",
      linkedExperimentId: exp.id,
      linkedExperimentName: exp.name,
    });
    localStorage.setItem("artic-campaigns", JSON.stringify(campaigns));
    alert(`✅ 已复用到新活动\n\n实验「${exp.name}」的策略将应用于新活动「[实验复用] ${exp.name}」\n\n切换到「活动管理」查看。`);
  };

  const filtered = experiments
    .filter((e) => filter === "all" || e.status === filter)
    .sort((a, b) => {
      if (sortBy === "lift") return Math.abs(b.lift) - Math.abs(a.lift);
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const statusConfig = {
    won: { label: "胜出", color: "#10B981", bg: "#ECFDF5" },
    lost: { label: "未胜", color: "#EF4444", bg: "#FEF2F2" },
    inconclusive: { label: "不确定", color: "#F59E0B", bg: "#FFF7ED" },
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>实验库</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>历史 A/B 测试结果 · 置信度评估 · 策略复用</p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* 统计概览卡片 */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "总实验数", value: experiments.length, color: "var(--primary)" },
              { label: "胜出", value: experiments.filter((e) => e.status === "won").length, color: "#10B981" },
              { label: "未胜", value: experiments.filter((e) => e.status === "lost").length, color: "#EF4444" },
              { label: "最高提升", value: `${Math.max(...experiments.map((e) => Math.abs(e.lift))).toFixed(1)}%`, color: "#F59E0B" },
            ].map((stat) => (
              <div key={stat.label} className="smart-card text-center py-3">
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 筛选 & 排序 */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[
                { key: "all" as const, label: "全部" },
                { key: "won" as const, label: "胜出" },
                { key: "lost" as const, label: "未胜" },
                { key: "inconclusive" as const, label: "不确定" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: filter === f.key ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-alt)",
                    color: filter === f.key ? "var(--primary)" : "var(--muted)",
                    border: `1px solid ${filter === f.key ? "var(--primary)" : "var(--border)"}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>排序：</span>
              <select className="text-[11px] px-2 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
                value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "lift" | "confidence")}>
                <option value="date">时间</option>
                <option value="lift">提升率</option>
                <option value="confidence">置信度</option>
              </select>
            </div>
          </div>

          {/* 实验表格 */}
          <div className="smart-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["实验名称", "假设", "提升率", "置信度", "适用场景", "状态", "操作"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase whitespace-nowrap" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const cfg = statusConfig[e.status];
                  return (
                    <tr key={e.id} className="group" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-3 px-3">
                        <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{e.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>{e.date} · {e.sampleSize.toLocaleString()} 样本 · {e.duration}天</p>
                      </td>
                      <td className="py-3 px-3 text-xs max-w-[180px] truncate" style={{ color: "var(--text-secondary)" }} title={e.hypothesis}>{e.hypothesis}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-bold ${e.lift > 0 ? "" : ""}`}
                          style={{ color: e.lift > 0 ? "#10B981" : "#EF4444" }}>
                          {e.lift > 0 ? "+" : ""}{e.lift}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--surface-alt)" }}>
                            <div className="h-full rounded-full" style={{
                              width: `${e.confidence}%`,
                              background: e.confidence >= 95 ? "#10B981" : e.confidence >= 80 ? "#F59E0B" : "#EF4444"
                            }}/>
                          </div>
                          <span className="text-[10px] font-semibold" style={{
                            color: e.confidence >= 95 ? "#10B981" : e.confidence >= 80 ? "#F59E0B" : "#EF4444"
                          }}>{e.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs" style={{ color: "var(--text-secondary)" }}>{e.scenario}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => reuseForCampaign(e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap"
                          style={{ background: "var(--primary)", color: "#fff" }}>
                          复用到新活动
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>暂无匹配的实验记录</p>
            )}
          </div>
        </div>

        <div className="w-[320px] shrink-0 hidden lg:block">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
