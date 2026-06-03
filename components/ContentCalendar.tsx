"use client";

import { useState, useEffect, useCallback } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

type ContentType = "article" | "short-video" | "live" | "image-text";
type ContentStatus = "draft" | "writing" | "done" | "cancelled";

interface ContentEvent {
  id: number;
  title: string;
  platform: string;
  date: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
}

const TYPE_CONFIG: Record<ContentType, { label: string; color: string }> = {
  "image-text": { label: "图文", color: "#6366F1" },
  "short-video": { label: "短视频", color: "#F59E0B" },
  "live": { label: "直播", color: "#EF4444" },
  "article": { label: "文章", color: "#10B981" },
};

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: "待创作", color: "#94A3B8" },
  writing: { label: "创作中", color: "#F59E0B" },
  done: { label: "已完成", color: "#10B981" },
  cancelled: { label: "已取消", color: "#EF4444" },
};

const PLATFORMS = ["小红书", "抖音", "公众号", "微博", "Instagram", "TikTok"];
const STORAGE_KEY = "artic-calendar-events";

/* ==================== 预置数据 ==================== */

const INITIAL_EVENTS: ContentEvent[] = [
  { id: 1, title: "618 大促预热种草笔记", platform: "小红书", date: "2026-06-10", type: "image-text", status: "draft", createdAt: "2026-06-01" },
  { id: 2, title: "新品防晒霜实测短视频", platform: "抖音", date: "2026-06-15", type: "short-video", status: "draft", createdAt: "2026-06-01" },
  { id: 3, title: "618 战报长图推送", platform: "公众号", date: "2026-06-18", type: "article", status: "writing", createdAt: "2026-06-01" },
  { id: 4, title: "用户好评合集海报", platform: "微博", date: "2026-06-08", type: "image-text", status: "done", createdAt: "2026-05-28" },
  { id: 5, title: "周三宠粉直播预告", platform: "抖音", date: "2026-06-12", type: "live", status: "draft", createdAt: "2026-06-01" },
];

/* ==================== 组件 ==================== */

export default function ContentCalendar({ embedded }: { embedded?: boolean }) {
  const suggestion = getSkillForModule("calendar");
  const [events, setEvents] = useState<ContentEvent[]>([]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() }; // 0-indexed
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<ContentStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", platform: "小红书", date: "", type: "image-text" as ContentType, status: "draft" as ContentStatus });

  /* 读取数据 */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      setEvents(parsed?.length ? parsed : INITIAL_EVENTS);
    } catch { setEvents(INITIAL_EVENTS); }
  }, []);

  useEffect(() => {
    if (events.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  /* ========== 日期工具 ========== */
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay(); // 0=Sun
  const today = new Date().toISOString().slice(0, 10);

  const getEventsForDate = (dateStr: string) => events.filter((e) => e.date === dateStr);
  const navigateMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  /* ========== 表单 ========== */
  const resetForm = () => {
    setForm({ title: "", platform: "小红书", date: "", type: "image-text", status: "draft" });
    setEditId(null); setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.date) return;
    if (editId !== null) {
      setEvents((prev) => prev.map((e) => e.id === editId ? { ...e, ...form, title: form.title.trim() } : e));
    } else {
      setEvents((prev) => [{ id: Date.now(), ...form, title: form.title.trim(), createdAt: new Date().toISOString().slice(0, 10) }, ...prev]);
    }
    resetForm();
  };

  const openEdit = (e: ContentEvent) => {
    setForm({ title: e.title, platform: e.platform, date: e.date, type: e.type, status: e.status });
    setEditId(e.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => setEvents((prev) => prev.filter((e) => e.id !== id));

  /* ========== 列表筛选 ========== */
  const filtered = filterStatus === "all" ? events : events.filter((e) => e.status === filterStatus);

  const monthLabel = `${currentMonth.year}年${currentMonth.month + 1}月`;

  return (
    <div className={embedded ? "" : "animate-fade-in"}>
      {!embedded && (
        <>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>内容日历</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>月度排期 · 平台管理 · 状态追踪（仅做规划，不涉及发布）</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                {[
                  { key: "calendar" as const, label: "月历" },
                  { key: "list" as const, label: "列表" },
                ].map((v) => (
                  <button key={v.key} onClick={() => setView(v.key)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                    style={{ background: view === v.key ? "var(--primary)" : "transparent", color: view === v.key ? "#fff" : "var(--muted)" }}>
                    {v.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                新建排期
              </button>
            </div>
          </div>
          <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
            注意：内容日历仅用于规划排期，不承担实际发布功能。实际发布需在各平台创作者后台操作。
          </p>
        </>
      )}

      <div className={embedded ? "" : "flex gap-6"}>
        <div className={embedded ? "space-y-4" : "flex-1 min-w-0 space-y-4"}>

          {/* ===== 新建/编辑弹窗（内嵌卡片） ===== */}
          {showForm && (
            <div className="smart-card animate-fade-in">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
                {editId !== null ? "编辑排期" : "新建排期"}
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input className="input-field" placeholder="内容标题" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                <select className="input-field" value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="date" className="input-field" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>内容类型</label>
                  <select className="input-field" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ContentType }))}>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>状态</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ContentStatus }))}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={handleSubmit}>{editId !== null ? "保存修改" : "添加排期"}</button>
                <button className="btn btn-outline" onClick={resetForm}>取消</button>
              </div>
            </div>
          )}

          {/* ===== 月历视图 ===== */}
          {view === "calendar" && (
            <div className="smart-card">
              {/* 月份导航 */}
              <div className="flex items-center justify-between mb-4">
                <button className="btn btn-ghost text-xs px-2" onClick={() => navigateMonth(-1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{monthLabel}</h3>
                <button className="btn btn-ghost text-xs px-2" onClick={() => navigateMonth(1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* 星期标题 */}
              <div className="grid grid-cols-7 mb-2">
                {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: "var(--muted)" }}>{d}</div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7 gap-1">
                {/* 填充上月空白 */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-lg" />
                ))}
                {/* 日期格子 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = getEventsForDate(dateStr);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? "" : dateStr)}
                      className="aspect-square rounded-lg p-1 transition-all flex flex-col items-center gap-0.5 relative"
                      style={{
                        background: isSelected ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-alt)",
                        border: isToday ? "2px solid var(--primary)" : isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                      }}>
                      <span className="text-xs font-semibold" style={{ color: isToday ? "var(--primary)" : "var(--text)" }}>{day}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 flex-wrap justify-center">
                          {dayEvents.slice(0, 3).map((e) => (
                            <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_CONFIG[e.type].color }} title={e.title} />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px]" style={{ color: "var(--muted)" }}>+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== 列表视图 ===== */}
          {view === "list" && (
            <div className="space-y-1">
              {/* 状态筛选 */}
              <div className="flex gap-1.5 mb-3">
                {[
                  { key: "all" as const, label: "全部", color: "var(--primary)" },
                  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k as ContentStatus, label: v.label, color: v.color })),
                ].map((f) => (
                  <button key={f.key} onClick={() => setFilterStatus(f.key)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                    style={{
                      background: filterStatus === f.key ? `${f.color}18` : "var(--surface-alt)",
                      color: filterStatus === f.key ? f.color : "var(--muted)",
                      border: `1px solid ${filterStatus === f.key ? f.color : "var(--border)"}`,
                    }}>
                    {f.label} ({f.key === "all" ? events.length : events.filter((e) => e.status === f.key).length})
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="smart-card text-center py-10"><p className="text-sm" style={{ color: "var(--muted)" }}>暂无排期</p></div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((ev) => {
                    const tCfg = TYPE_CONFIG[ev.type];
                    const sCfg = STATUS_CONFIG[ev.status];
                    return (
                      <div key={ev.id} className="smart-card flex items-center gap-4 group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{ev.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${tCfg.color}18`, color: tCfg.color }}>{tCfg.label}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${sCfg.color}18`, color: sCfg.color }}>{sCfg.label}</span>
                          </div>
                          <p className="text-[11px]" style={{ color: "var(--muted)" }}>{ev.platform} · {ev.date}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => openEdit(ev)}>编辑</button>
                          <button className="btn btn-danger text-xs px-2 py-1" onClick={() => handleDelete(ev.id)}>删除</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== 选中日期的内容详情 ===== */}
          {view === "calendar" && selectedDate && (
            <div className="smart-card animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{selectedDate} 排期详情</h3>
                <button className="text-xs px-2 py-1 rounded" style={{ color: "var(--muted)" }} onClick={() => setSelectedDate("")}>
                  关闭 ✕
                </button>
              </div>
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>该日期暂无排期，点击「新建排期」添加</p>
              ) : (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map((ev) => {
                    const tCfg = TYPE_CONFIG[ev.type];
                    const sCfg = STATUS_CONFIG[ev.status];
                    return (
                      <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: tCfg.color }}>
                          {tCfg.label.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{ev.title}</p>
                          <p className="text-[10px]" style={{ color: "var(--muted)" }}>{ev.platform}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${sCfg.color}18`, color: sCfg.color }}>{sCfg.label}</span>
                        <button className="btn btn-ghost text-[10px] px-1.5 py-1" onClick={() => openEdit(ev)}>编辑</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {!embedded && (
          <SmartSuggestionCard suggestion={suggestion} />
        )}
      </div>
    </div>
  );
}
