"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import AiPanel from "./AiPanel";
import { getSkillForModule } from "@/lib/skillMapping";
import { PROMPTS } from "@/lib/ai";

/* ==================== 类型 ==================== */

type CampaignStatus = "planning" | "active" | "completed" | "paused";
type ContentType = "article" | "short-video" | "live" | "image-text";
type ContentStatus = "draft" | "writing" | "done" | "cancelled";

interface Deliverable {
  id: number; name: string; owner: string;
  status: "pending" | "in-progress" | "done"; dueDate: string;
}

interface Campaign {
  id: number; name: string; startDate: string; endDate: string;
  status: CampaignStatus; deliverables: Deliverable[];
  linkedAssetId?: number; linkedAssetTitle?: string;
}

interface ContentEvent {
  id: number; title: string; platform: string; date: string;
  type: ContentType; status: ContentStatus; createdAt: string;
}

type CreateMode = "campaign" | "content" | null;

/* ==================== 常量 ==================== */

const STATUS_LABELS: Record<CampaignStatus, string> = { planning: "规划中", active: "进行中", completed: "已完成", paused: "已暂停" };
const STATUS_COLORS: Record<CampaignStatus, string> = { planning: "#F59E0B", active: "#10B981", completed: "#6B7280", paused: "#EF4444" };

const TYPE_CONFIG: Record<ContentType, { label: string; color: string }> = {
  "image-text": { label: "图文", color: "#6366F1" }, "short-video": { label: "短视频", color: "#F59E0B" },
  "live": { label: "直播", color: "#EF4444" }, "article": { label: "文章", color: "#10B981" },
};

const CONTENT_STATUS: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: "待创作", color: "#94A3B8" }, writing: { label: "创作中", color: "#F59E0B" },
  done: { label: "已完成", color: "#10B981" }, cancelled: { label: "已取消", color: "#EF4444" },
};

const PLATFORMS = ["小红书", "抖音", "公众号", "微博", "Instagram", "TikTok"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

const CAMPAIGN_KEY = "artic-campaigns";
const EVENT_KEY = "artic-calendar-events";

/* ==================== 种子数据 ==================== */

const SEED_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "618 大促", startDate: "2026-06-01", endDate: "2026-06-18", status: "active", deliverables: [
    { id: 101, name: "活动落地页设计", owner: "设计师@小李", status: "done", dueDate: "2026-06-05" },
    { id: 102, name: "KOL 合作确认", owner: "BD@小张", status: "in-progress", dueDate: "2026-06-10" },
    { id: 103, name: "社群预热话术", owner: "社群@小陈", status: "pending", dueDate: "2026-06-12" },
  ]},
  { id: 2, name: "新品首发", startDate: "2026-07-01", endDate: "2026-07-15", status: "planning", deliverables: [
    { id: 201, name: "详情页文案", owner: "文案@小刘", status: "in-progress", dueDate: "2026-06-20" },
    { id: 202, name: "预热短视频", owner: "视频@小李", status: "pending", dueDate: "2026-06-25" },
  ]},
];

const SEED_EVENTS: ContentEvent[] = [
  { id: 1, title: "618 预热种草笔记", platform: "小红书", date: "2026-06-10", type: "image-text", status: "draft", createdAt: "2026-06-01" },
  { id: 2, title: "防晒霜实测短视频", platform: "抖音", date: "2026-06-15", type: "short-video", status: "draft", createdAt: "2026-06-01" },
  { id: 3, title: "618 战报推送", platform: "公众号", date: "2026-06-18", type: "article", status: "writing", createdAt: "2026-06-01" },
  { id: 4, title: "好评合集海报", platform: "微博", date: "2026-06-08", type: "image-text", status: "done", createdAt: "2026-05-28" },
  { id: 5, title: "周三宠粉直播", platform: "抖音", date: "2026-06-12", type: "live", status: "draft", createdAt: "2026-06-01" },
];

/* ==================== 工具 ==================== */

const dateInRange = (date: string, start: string, end: string): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end || start);
  return d >= s && d <= e;
};

const shiftDays = (dateStr: string, days: number): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/* ==================== 组件 ==================== */

export default function OperationsRhythm() {
  const suggestion = getSkillForModule("operations");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<ContentEvent[]>([]);

  // 右侧选中
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ContentEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // 创建弹窗
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [createDate, setCreateDate] = useState("");

  // 活动表单
  const [campName, setCampName] = useState("");
  const [campStart, setCampStart] = useState("");
  const [campEnd, setCampEnd] = useState("");
  const [campStatus, setCampStatus] = useState<CampaignStatus>("planning");

  // 内容表单
  const [evTitle, setEvTitle] = useState("");
  const [evPlatform, setEvPlatform] = useState("小红书");
  const [evType, setEvType] = useState<ContentType>("image-text");
  const [evDate, setEvDate] = useState("");
  const [evStatus, setEvStatus] = useState<ContentStatus>("draft");

  // 交付物表单
  const [newDlv, setNewDlv] = useState({ name: "", owner: "", dueDate: "" });

  /* ===== 初始化数据 ===== */
  useEffect(() => {
    try {
      const savedCamp = localStorage.getItem(CAMPAIGN_KEY);
      setCampaigns(savedCamp ? JSON.parse(savedCamp) : SEED_CAMPAIGNS);
      if (!savedCamp) localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(SEED_CAMPAIGNS));
    } catch { setCampaigns(SEED_CAMPAIGNS); }
    try {
      const savedEv = localStorage.getItem(EVENT_KEY);
      setEvents(savedEv ? JSON.parse(savedEv) : SEED_EVENTS);
      if (!savedEv) localStorage.setItem(EVENT_KEY, JSON.stringify(SEED_EVENTS));
    } catch { setEvents(SEED_EVENTS); }
  }, []);

  const saveCampaigns = (updated: Campaign[]) => { setCampaigns(updated); localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(updated)); };
  const saveEvents = (updated: ContentEvent[]) => { setEvents(updated); localStorage.setItem(EVENT_KEY, JSON.stringify(updated)); };

  /* ===== 导航 ===== */
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  /* ===== 创建活动 ===== */
  const createCampaign = () => {
    if (!campName.trim()) return;
    const camp: Campaign = { id: Date.now(), name: campName.trim(), startDate: campStart || createDate, endDate: campEnd || campStart || createDate, status: campStatus, deliverables: [] };
    saveCampaigns([camp, ...campaigns]);
    setCampName(""); setCampStart(""); setCampEnd(""); setCreateMode(null);
  };

  /* ===== 创建内容 ===== */
  const createEvent = () => {
    if (!evTitle.trim()) return;
    const ev: ContentEvent = { id: Date.now(), title: evTitle.trim(), platform: evPlatform, date: evDate || createDate, type: evType, status: evStatus, createdAt: new Date().toISOString().slice(0, 10) };
    saveEvents([ev, ...events]);
    setEvTitle(""); setEvPlatform("小红书"); setEvDate(""); setCreateMode(null);
  };

  /* ===== 交付物 ===== */
  const addDeliverable = () => {
    if (!newDlv.name.trim() || !selectedCampaign) return;
    const updated = campaigns.map(c => c.id === selectedCampaign.id ? {
      ...c, deliverables: [...c.deliverables, { id: Date.now(), name: newDlv.name.trim(), owner: newDlv.owner, dueDate: newDlv.dueDate, status: "pending" as const }],
    } : c);
    saveCampaigns(updated);
    setSelectedCampaign(updated.find(c => c.id === selectedCampaign.id) || null);
    setNewDlv({ name: "", owner: "", dueDate: "" });
  };

  const toggleDlv = (dlvId: number) => {
    if (!selectedCampaign) return;
    const updated = campaigns.map(c => c.id === selectedCampaign.id ? {
      ...c, deliverables: c.deliverables.map(d => d.id === dlvId ? { ...d, status: d.status === "done" ? "pending" as const : d.status === "pending" ? "in-progress" as const : "done" as const } : d),
    } : c);
    saveCampaigns(updated);
    setSelectedCampaign(updated.find(c => c.id === selectedCampaign.id) || null);
  };

  const deleteDlv = (dlvId: number) => {
    if (!selectedCampaign) return;
    const updated = campaigns.map(c => c.id === selectedCampaign.id ? { ...c, deliverables: c.deliverables.filter(d => d.id !== dlvId) } : c);
    saveCampaigns(updated);
    setSelectedCampaign(updated.find(c => c.id === selectedCampaign.id) || null);
  };

  const handleDeleteCampaign = (id: number) => {
    if (!confirm("确定删除此活动？")) return;
    saveCampaigns(campaigns.filter(c => c.id !== id));
    if (selectedCampaign?.id === id) setSelectedCampaign(null);
  };

  const handleDeleteEvent = (id: number) => {
    if (!confirm("确定删除此内容排期？")) return;
    saveEvents(events.filter(e => e.id !== id));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  /* ===== 日历计算 ===== */
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun

  const getCampaignsForDay = (day: number): Campaign[] => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return campaigns.filter(c => dateInRange(ds, c.startDate, c.endDate));
  };

  const getEventsForDay = (day: number): ContentEvent[] => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === ds);
  };

  const getProgress = (camp: Campaign): number => {
    if (!camp.deliverables.length) return 0;
    return Math.round((camp.deliverables.filter(d => d.status === "done").length / camp.deliverables.length) * 100);
  };

  const openCreate = (day: number, mode: CreateMode) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setCreateDate(ds);
    setCreateMode(mode);
    if (mode === "campaign") { setCampStart(ds); setCampEnd(""); }
    if (mode === "content") { setEvDate(ds); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>运营节奏</h2>
        <AiPanel
          title="月度运营节奏分析"
          buttonLabel="AI 分析本月"
          {...PROMPTS.rhythm(
            campaigns.map(c => ({ name: c.name, status: STATUS_LABELS[c.status], startDate: c.startDate, endDate: c.endDate })),
            events.map(e => ({ title: e.title, platform: e.platform, type: TYPE_CONFIG[e.type].label, status: CONTENT_STATUS[e.status].label, date: e.date })),
            `${year}年${MONTHS[month]}`
          )}
        />
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>月度活动×内容日历 · 统一节奏管理</p>

      <div className="flex gap-6">
        {/* ===== 左侧：日历 + 下方空白 ===== */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 月份导航 */}
          <div className="flex items-center justify-between">
            <button className="btn btn-ghost text-sm px-3 py-1" onClick={prevMonth}>◀ 上月</button>
            <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{year}年 {MONTHS[month]}</h3>
            <button className="btn btn-ghost text-sm px-3 py-1" onClick={nextMonth}>下月 ▶</button>
          </div>

          {/* 日历网格 */}
          <div className="smart-card overflow-hidden" style={{ padding: 0 }}>
            {/* 星期头 */}
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map(w => (
                <div key={w} className="text-center py-2 text-[11px] font-semibold" style={{ color: w === "日" || w === "六" ? "var(--muted)" : "var(--text-secondary)" }}>{w}</div>
              ))}
            </div>
            {/* 日期格子 */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[90px] p-1.5" style={{ background: "var(--surface-alt)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayCampaigns = getCampaignsForDay(day);
                const dayEvents = getEventsForDay(day);
                const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isToday = ds === new Date().toISOString().slice(0, 10);
                return (
                  <div key={day} className="min-h-[90px] p-1.5 relative group cursor-pointer transition-colors"
                    style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: isToday ? "color-mix(in srgb, var(--primary) 6%, transparent)" : selectedDate === ds ? "color-mix(in srgb, var(--primary) 4%, transparent)" : "var(--surface)" }}
                    onClick={() => { setSelectedDate(ds); setSelectedCampaign(null); setSelectedEvent(null); }}>
                    {/* 日期号 + 添加按钮 */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "text-white" : ""}`}
                        style={isToday ? { background: "var(--primary)" } : { color: selectedDate === ds ? "var(--primary)" : "var(--text-secondary)" }}>{day}</span>
                      <button className="w-5 h-5 rounded-full hidden group-hover:flex items-center justify-center text-[10px] font-bold transition-all"
                        style={{ background: "var(--primary)", color: "#fff" }}
                        onClick={(e) => { e.stopPropagation(); openCreate(day, "campaign"); }}
                        title="添加活动/内容">+</button>
                    </div>
                    {/* 活动标签 */}
                    {dayCampaigns.slice(0, 2).map(c => (
                      <button key={`c-${c.id}`} onClick={(e) => { e.stopPropagation(); setSelectedCampaign(c); setSelectedEvent(null); setSelectedDate(ds); }}
                        className="block w-full text-left text-[9px] px-1 py-0.5 rounded mb-0.5 truncate font-medium"
                        style={{ background: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>
                        ● {c.name}
                      </button>
                    ))}
                    {dayCampaigns.length > 2 && <p className="text-[8px] pl-1" style={{ color: "var(--muted)" }}>+{dayCampaigns.length - 2} 活动</p>}
                    {/* 内容标签 */}
                    {dayEvents.slice(0, 2).map(e => (
                      <button key={`e-${e.id}`} onClick={(e2) => { e2.stopPropagation(); setSelectedEvent(e); setSelectedCampaign(null); setSelectedDate(ds); }}
                        className="block w-full text-left text-[9px] px-1 py-0.5 rounded mb-0.5 truncate font-medium"
                        style={{ background: `${TYPE_CONFIG[e.type].color}15`, color: TYPE_CONFIG[e.type].color }}>
                        ◆ {e.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && <p className="text-[8px] pl-1" style={{ color: "var(--muted)" }}>+{dayEvents.length - 2} 内容</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--muted)" }}>
            <span>● 活动（按状态着色）</span>
            <span>◆ 内容（按类型着色）</span>
            <span>悬停日期格 → 点击 + 新建</span>
          </div>
        </div>

        {/* ===== 右侧：活动详情 + 内容详情 ===== */}
        <div className="w-[340px] shrink-0 space-y-3">
          {/* 上：活动详情 */}
          <div className="smart-card" style={{ minHeight: 260 }}>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              活动详情
            </h4>
            {selectedCampaign ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{selectedCampaign.name}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: `${STATUS_COLORS[selectedCampaign.status]}18`, color: STATUS_COLORS[selectedCampaign.status] }}>
                    {STATUS_LABELS[selectedCampaign.status]}
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: "var(--muted)" }}>{selectedCampaign.startDate} ~ {selectedCampaign.endDate}</p>

                {/* 进度条 */}
                {selectedCampaign.deliverables.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
                      <div className="h-full rounded-full" style={{ width: `${getProgress(selectedCampaign)}%`, background: "var(--primary)" }} />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: "var(--muted)" }}>{getProgress(selectedCampaign)}%</span>
                  </div>
                )}

                {/* 交付物 */}
                <div className="max-h-[120px] overflow-y-auto space-y-1">
                  <p className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>交付物 ({selectedCampaign.deliverables.length})</p>
                  {selectedCampaign.deliverables.map(d => (
                    <div key={d.id} className="flex items-center gap-2 py-0.5">
                      <button onClick={() => toggleDlv(d.id)}>
                        {d.status === "done" ? <span className="text-[10px] text-[#10B981]">✔</span>
                         : d.status === "in-progress" ? <span className="text-[10px] text-[#F59E0B]">◐</span>
                         : <span className="text-[10px]" style={{ color: "var(--muted)" }}>○</span>}
                      </button>
                      <span className="text-[10px] flex-1 truncate" style={{ color: d.status === "done" ? "var(--muted)" : "var(--text)" }}>{d.name}</span>
                      <button className="text-[8px] opacity-30 hover:opacity-100" style={{ color: "#EF4444" }} onClick={() => deleteDlv(d.id)}>✕</button>
                    </div>
                  ))}
                </div>

                {/* 交付物表单 */}
                <div className="flex gap-1">
                  <input className="input-field text-[9px] flex-1 py-1" placeholder="交付物名称" value={newDlv.name} onChange={e => setNewDlv(p => ({ ...p, name: e.target.value }))} />
                  <input className="input-field text-[9px] w-16 py-1" placeholder="负责人" value={newDlv.owner} onChange={e => setNewDlv(p => ({ ...p, owner: e.target.value }))} />
                  <button className="btn btn-primary text-[9px] px-2 py-1" onClick={addDeliverable}>+</button>
                </div>

                <button className="text-[9px]" style={{ color: "#EF4444" }} onClick={() => handleDeleteCampaign(selectedCampaign.id)}>删除活动</button>
              </div>
            ) : selectedDate ? (
              /* 选中日期但未选具体活动时，列出当日所有活动 */
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--primary)" }}>{selectedDate}</p>
                {campaigns.filter(c => dateInRange(selectedDate, c.startDate, c.endDate)).length === 0 ? (
                  <p className="text-[10px]" style={{ color: "var(--muted)" }}>当日无活动</p>
                ) : (
                  campaigns.filter(c => dateInRange(selectedDate, c.startDate, c.endDate)).map(c => (
                    <button key={`sd-${c.id}`} onClick={() => setSelectedCampaign(c)}
                      className="block w-full text-left text-[10px] px-2 py-1 rounded font-medium"
                      style={{ background: `${STATUS_COLORS[c.status]}12`, color: STATUS_COLORS[c.status] }}>
                      ● {c.name} <span className="text-[9px] opacity-70">{STATUS_LABELS[c.status]}</span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <p className="text-[11px] py-6 text-center" style={{ color: "var(--muted)" }}>点击日历日期或活动标签查看详情</p>
            )}
          </div>

          {/* 下：内容详情 */}
          <div className="smart-card" style={{ minHeight: 260 }}>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              内容详情
            </h4>
            {selectedEvent ? (
              <div className="space-y-2">
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{selectedEvent.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: TYPE_CONFIG[selectedEvent.type].color }}>{TYPE_CONFIG[selectedEvent.type].label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${CONTENT_STATUS[selectedEvent.status].color}18`, color: CONTENT_STATUS[selectedEvent.status].color }}>{CONTENT_STATUS[selectedEvent.status].label}</span>
                </div>
                <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                  {selectedEvent.platform} · {selectedEvent.date} · 创建于 {selectedEvent.createdAt}
                </p>
                <div className="flex gap-1 pt-1">
                  <button className="text-[9px] px-2 py-0.5 rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    onClick={() => {
                      const next: ContentStatus = selectedEvent.status === "draft" ? "writing" : selectedEvent.status === "writing" ? "done" : "draft";
                      const updated = events.map(e => e.id === selectedEvent.id ? { ...e, status: next } : e);
                      saveEvents(updated); setSelectedEvent(updated.find(e => e.id === selectedEvent.id) || null);
                    }}>推进状态</button>
                  <button className="text-[9px]" style={{ color: "#EF4444" }} onClick={() => handleDeleteEvent(selectedEvent.id)}>删除</button>
                </div>
              </div>
            ) : selectedDate ? (
              /* 选中日期但未选具体内容时，列出当日所有内容 */
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                <p className="text-[10px] font-semibold mb-1" style={{ color: "#10B981" }}>{selectedDate}</p>
                {events.filter(e => e.date === selectedDate).length === 0 ? (
                  <p className="text-[10px]" style={{ color: "var(--muted)" }}>当日无内容排期</p>
                ) : (
                  events.filter(e => e.date === selectedDate).map(e => (
                    <button key={`se-${e.id}`} onClick={() => setSelectedEvent(e)}
                      className="block w-full text-left text-[10px] px-2 py-1 rounded font-medium"
                      style={{ background: `${TYPE_CONFIG[e.type].color}12`, color: TYPE_CONFIG[e.type].color }}>
                      ◆ {e.title} <span className="text-[9px] opacity-70">{e.platform} · {CONTENT_STATUS[e.status].label}</span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <p className="text-[11px] py-6 text-center" style={{ color: "var(--muted)" }}>点击日历日期或内容标签查看详情</p>
            )}
          </div>
        </div>

        {/* ===== 右侧建议卡片 ===== */}
        <div className="w-[320px] shrink-0 hidden xl:block">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>

      {/* ===== 创建弹窗 ===== */}
      {createMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setCreateMode(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[480px] p-5 rounded-xl shadow-2xl animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}>
            {/* 模式选择 */}
            <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: "var(--surface-alt)" }}>
              {[
                { mode: "campaign" as const, label: "📋 新建活动", desc: "策划营销活动" },
                { mode: "content" as const, label: "📄 新建内容", desc: "排期内容创作" },
              ].map(t => (
                <button key={t.mode}
                  onClick={() => { setCreateMode(t.mode); if (t.mode === "campaign") setCampStart(createDate); else setEvDate(createDate); }}
                  className="flex-1 py-2 rounded-md text-xs font-semibold transition-all"
                  style={{ background: createMode === t.mode ? "var(--primary)" : "transparent", color: createMode === t.mode ? "#fff" : "var(--muted)" }}>
                  {t.label}<br/><span className="text-[9px] opacity-70">{t.desc}</span>
                </button>
              ))}
            </div>

            {createMode === "campaign" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>活动名称</label>
                  <input className="input-field" placeholder="活动名称..." value={campName} onChange={e => setCampName(e.target.value)} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>开始日期</label>
                    <input type="date" className="input-field" value={campStart} onChange={e => setCampStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>结束日期</label>
                    <input type="date" className="input-field" value={campEnd} onChange={e => setCampEnd(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>状态</label>
                  <select className="input-field" value={campStatus} onChange={e => setCampStatus(e.target.value as CampaignStatus)}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="btn btn-outline text-xs" onClick={() => setCreateMode(null)}>取消</button>
                  <button className="btn btn-primary text-xs" onClick={createCampaign}>创建活动</button>
                </div>
              </div>
            )}

            {createMode === "content" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>内容标题</label>
                  <input className="input-field" placeholder="内容标题..." value={evTitle} onChange={e => setEvTitle(e.target.value)} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>平台</label>
                    <select className="input-field" value={evPlatform} onChange={e => setEvPlatform(e.target.value)}>
                      {PLATFORMS.map(p => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>类型</label>
                    <select className="input-field" value={evType} onChange={e => setEvType(e.target.value as ContentType)}>
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>日期</label>
                    <input type="date" className="input-field" value={evDate} onChange={e => setEvDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>状态</label>
                    <select className="input-field" value={evStatus} onChange={e => setEvStatus(e.target.value as ContentStatus)}>
                      {Object.entries(CONTENT_STATUS).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="btn btn-outline text-xs" onClick={() => setCreateMode(null)}>取消</button>
                  <button className="btn btn-primary text-xs" onClick={createEvent}>创建内容</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
