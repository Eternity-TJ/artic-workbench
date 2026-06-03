"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface ActivityFeed {
  id: number;
  type: "campaign" | "competitor" | "experiment" | "calendar" | "asset";
  action: string;
  target: string;
  time: string;
}

interface TodoItem {
  id: number;
  text: string;
  source: string;
  due: string;
  priority: "high" | "medium" | "low";
}

/* ==================== 组件 ==================== */

export default function Overview() {
  const suggestion = getSkillForModule("overview");

  const [stats, setStats] = useState({
    activeCampaigns: 0,
    weekEvents: 0,
    competitors: 0,
    totalExperiments: 0,
  });

  const [contentStats, setContentStats] = useState({ pendingPosts: 0, savedPosts: 0 });
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [feed, setFeed] = useState<ActivityFeed[]>([]);

  useEffect(() => {
    // 从 localStorage 聚合真实数据
    try {
      const campaigns = JSON.parse(localStorage.getItem("artic-campaigns") || "[]");
      const competitors = JSON.parse(localStorage.getItem("artic-competitors") || "[]");
      const experiments = JSON.parse(localStorage.getItem("artic-experiments") || "[]");
      const events = JSON.parse(localStorage.getItem("artic-calendar-events") || "[]");

      const activeCount = campaigns.filter((c: { status: string }) => c.status === "active").length;
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEvents = events.filter((e: { date: string }) => {
        const d = new Date(e.date);
        return d >= now && d <= weekEnd;
      }).length;

      setStats({
        activeCampaigns: activeCount,
        weekEvents,
        competitors: Array.isArray(competitors) ? competitors.length : 0,
        totalExperiments: Array.isArray(experiments) ? experiments.length : 0,
      });

      // 生成待办
      const todoList: TodoItem[] = [];
      campaigns
        .filter((c: { status: string }) => c.status === "planning" || c.status === "active")
        .slice(0, 4)
        .forEach((c: { id: number; name: string; endDate: string; startDate: string }) => {
          todoList.push({
            id: c.id,
            text: `活动「${c.name}」进行中`,
            source: "活动管理",
            due: c.endDate || c.startDate,
            priority: "high" as const,
          });
        });
      events
        .filter((e: { status: string }) => e.status === "draft" || e.status === "writing")
        .slice(0, 3)
        .forEach((e: { id: number; title: string; date: string }) => {
          todoList.push({
            id: e.id + 10000,
            text: `内容「${e.title}」待创作`,
            source: "内容日历",
            due: e.date,
            priority: "medium" as const,
          });
        });
      setTodos(todoList.slice(0, 8));

      // 生成动态
      const all: ActivityFeed[] = [];
      campaigns.slice(0, 3).forEach((c: { id: number; name: string; status: string; startDate: string }) => {
        all.push({ id: c.id, type: "campaign", action: c.status === "active" ? "启动" : "创建", target: c.name, time: c.startDate || "今天" });
      });
      events.slice(0, 2).forEach((e: { id: number; title: string; date: string }) => {
        all.push({ id: e.id + 10000, type: "calendar", action: "排期", target: e.title, time: e.date || "今天" });
      });
      const competitorsArr = Array.isArray(competitors) ? competitors : [];
      competitorsArr.slice(0, 2).forEach((c: { id: number; name: string; addedAt: string }) => {
        all.push({ id: c.id + 20000, type: "competitor", action: "添加竞品", target: c.name, time: c.addedAt || "今天" });
      });
      all.sort((a, b) => b.time.localeCompare(a.time));
      setFeed(all.slice(0, 10));

      // 内容工坊产出统计
      const savedPosts = JSON.parse(localStorage.getItem("artic-saved-posts") || "[]");
      const strategyPrompt = localStorage.getItem("artic-strategy-post-prompt");
      setContentStats({
        pendingPosts: strategyPrompt ? 1 : 0,
        savedPosts: Array.isArray(savedPosts) ? savedPosts.length : 0,
      });
    } catch {
      // fallback to defaults
    }
  }, []);

  const priorityColor = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>工作台首页</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>关键指标 · 今日待办 · 最近动态</p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-5">
          {/* ===== 指标卡片行 ===== */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "进行中活动", value: stats.activeCampaigns, icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0", color: "#6366F1", menu: "operations" as const },
              { label: "本周排期", value: stats.weekEvents, icon: "M8 6V3m8 3V3M3 10h18M3 18h18M5 2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4c0-1.1.9-2 2-2z", color: "#10B981", menu: "operations" as const },
              { label: "竞品监控", value: stats.competitors, icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z", color: "#F59E0B", menu: "competitor" as const },
              { label: "实验记录", value: stats.totalExperiments, icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", color: "#8B5CF6", menu: "data" as const },
            ].map((stat) => (
              <div key={stat.label} className="smart-card cursor-pointer"
                onClick={() => {
                  const event = new CustomEvent("artic-nav", { detail: { menu: stat.menu } });
                  window.dispatchEvent(event);
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--muted)" }}>{stat.label}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={stat.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== 两栏：待办 + 动态 ===== */}
          <div className="grid grid-cols-2 gap-5">
            {/* 今日待办 */}
            <div className="smart-card">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                今日待办
                <span className="text-xs font-normal ml-auto" style={{ color: "var(--muted)" }}>{todos.length} 项</span>
              </h3>
              {todos.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--muted)" }}>暂无待办事项 🎉</p>
              ) : (
                <div className="space-y-2">
                  {todos.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: priorityColor[t.priority] }} title={t.priority} />
                      <span className="text-xs flex-1" style={{ color: "var(--text)" }}>{t.text}</span>
                      <span className="text-[10px] shrink-0" style={{ color: "var(--muted)" }}>{t.source} · {t.due}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 最近动态 */}
            <div className="smart-card">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                最近动态
              </h3>
              {feed.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--muted)" }}>暂无动态，开始创建活动或添加竞品吧</p>
              ) : (
                <div className="space-y-1">
                  {feed.map((f, i) => {
                    const typeIcons: Record<string, { color: string; label: string }> = {
                      campaign: { color: "#6366F1", label: "活动" },
                      calendar: { color: "#10B981", label: "排期" },
                      competitor: { color: "#F59E0B", label: "竞品" },
                      experiment: { color: "#8B5CF6", label: "实验" },
                      asset: { color: "#EC4899", label: "素材" },
                    };
                    const cfg = typeIcons[f.type] || { color: "var(--muted)", label: "其他" };
                    return (
                      <div key={`${f.id}-${i}`} className="flex items-center gap-3 py-2 px-1" style={{ borderBottom: i < feed.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white shrink-0" style={{ background: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
                          {f.action}「{f.target}」
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: "var(--muted)" }}>{f.time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== 内容工坊产出中 ===== */}
          <div className="smart-card cursor-pointer transition-all hover:border-primary"
            style={{ borderLeft: "3px solid var(--primary)" }}
            onClick={() => {
              const event = new CustomEvent("artic-nav", { detail: { menu: "content-center" } });
              window.dispatchEvent(event);
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>内容工坊产出中</h3>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                    待生成文案 {contentStats.pendingPosts} / 已保存到素材库 {contentStats.savedPosts}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {contentStats.pendingPosts > 0 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold text-white animate-pulse" style={{ background: "var(--primary)" }}>
                    有待处理
                  </span>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ===== 快速操作 ===== */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>快速操作</h3>
            <div className="flex gap-3">
              {[
                { label: "新建活动", icon: "M12 5v14M5 12h14", color: "#6366F1", hint: "切换到运营日历创建活动" },
                { label: "添加竞品", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M17 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", color: "#F59E0B", hint: "切换到竞品追踪添加" },
                { label: "生成文案", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8", color: "#10B981", hint: "切换到内容中心生成多平台文案" },
              ].map((btn) => (
                <button key={btn.label} className="flex-1 p-4 rounded-lg transition-all text-left group"
                  style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
                  onClick={() => {
                    const menuMap: Record<string, string> = {
                      "新建活动": "operations",
                      "添加竞品": "competitor",
                      "生成文案": "content-center",
                    };
                    const key = menuMap[btn.label];
                    if (key) {
                      const event = new CustomEvent("artic-nav", { detail: { menu: key } });
                      window.dispatchEvent(event);
                    }
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${btn.color}18` }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={btn.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={btn.icon} />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{btn.label}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>{btn.hint}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[320px] shrink-0 hidden lg:block">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
