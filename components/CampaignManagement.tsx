"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

type CampaignStatus = "planning" | "active" | "completed" | "paused";

interface Deliverable {
  id: number;
  name: string;
  owner: string;
  status: "pending" | "in-progress" | "done";
  dueDate: string;
}

interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  deliverables: Deliverable[];
  linkedAssetId?: number;
  linkedAssetTitle?: string;
}

const STATUS_LABELS: Record<CampaignStatus, string> = {
  planning: "规划中", active: "进行中", completed: "已完成", paused: "已暂停",
};

const STATUS_COLORS: Record<CampaignStatus, string> = {
  planning: "#F59E0B", active: "#10B981", completed: "#6B7280", paused: "#EF4444",
};

const STORAGE_KEY = "artic-campaigns";

/* ==================== 组件 ==================== */

export default function CampaignManagement({ embedded }: { embedded?: boolean }) {
  const suggestion = getSkillForModule("campaign");
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1, name: "618 大促", startDate: "2026-06-01", endDate: "2026-06-18", status: "active",
      deliverables: [
        { id: 101, name: "活动落地页设计", owner: "设计师@小李", status: "done", dueDate: "2026-06-05" },
        { id: 102, name: "优惠券配置上线", owner: "运营@小王", status: "done", dueDate: "2026-06-08" },
        { id: 103, name: "KOL 合作确认（5人）", owner: "BD@小张", status: "in-progress", dueDate: "2026-06-10" },
        { id: 104, name: "社群预热话术准备", owner: "社群@小陈", status: "pending", dueDate: "2026-06-12" },
      ],
    },
    {
      id: 2, name: "新品首发活动", startDate: "2026-07-01", endDate: "2026-07-15", status: "planning",
      deliverables: [
        { id: 201, name: "产品详情页文案", owner: "文案@小刘", status: "in-progress", dueDate: "2026-06-20" },
        { id: 202, name: "预热短视频拍摄", owner: "视频@小李", status: "pending", dueDate: "2026-06-25" },
        { id: 203, name: "媒体通稿撰写", owner: "PR@小赵", status: "pending", dueDate: "2026-06-28" },
      ],
    },
  ]);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("planning");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [linkedAssetId, setLinkedAssetId] = useState<number | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newDlv, setNewDlv] = useState({ name: "", owner: "", dueDate: "" });

  /* ===== 素材库选项 ===== */
  const [assetOptions, setAssetOptions] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.length) setCampaigns(parsed);
    } catch {}
    refreshAssets();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  const refreshAssets = () => {
    try {
      const assets = JSON.parse(localStorage.getItem("artic-assets") || "[]");
      setAssetOptions(Array.isArray(assets) ? assets.map((a: { id: number; title: string }) => ({ id: a.id, title: a.title })) : []);
    } catch { setAssetOptions([]); }
  };

  /* ========== 活动表单 ========== */
  const resetForm = () => {
    setName(""); setStartDate(""); setEndDate(""); setStatus("planning");
    setEditingId(null); setLinkedAssetId(undefined);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const linked = assetOptions.find((a) => a.id === linkedAssetId);
    if (editingId !== null) {
      setCampaigns((prev) => prev.map((c) => c.id === editingId ? {
        ...c, name: name.trim(), startDate, endDate, status,
        linkedAssetId, linkedAssetTitle: linked?.title,
      } : c));
    } else {
      setCampaigns((prev) => [{
        id: Date.now(), name: name.trim(), startDate, endDate, status,
        deliverables: [], linkedAssetId, linkedAssetTitle: linked?.title,
      }, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (c: Campaign) => {
    setName(c.name); setStartDate(c.startDate); setEndDate(c.endDate);
    setStatus(c.status); setEditingId(c.id); setLinkedAssetId(c.linkedAssetId);
  };

  const handleDelete = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) resetForm();
  };

  const handleCopy = (c: Campaign) => {
    const shiftDays = (dateStr: string, days: number): string => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };
    const copy: Campaign = {
      ...c,
      id: Date.now(),
      name: `${c.name} (副本)`,
      startDate: shiftDays(c.startDate, 7),
      endDate: shiftDays(c.endDate, 7),
      status: "planning" as CampaignStatus,
      deliverables: c.deliverables.map((d) => ({ ...d, id: Date.now() + Math.random() * 1000 })),
    };
    setCampaigns((prev) => [copy, ...prev]);
  };

  /* ========== 交付物管理 ========== */
  const addDeliverable = (campaignId: number) => {
    if (!newDlv.name.trim()) return;
    setCampaigns((prev) => prev.map((c) => c.id === campaignId ? {
      ...c, deliverables: [...c.deliverables, { id: Date.now(), ...newDlv, name: newDlv.name.trim(), status: "pending" as const }],
    } : c));
    setNewDlv({ name: "", owner: "", dueDate: "" });
  };

  const toggleDeliverable = (campaignId: number, dlvId: number) => {
    setCampaigns((prev) => prev.map((c) => c.id === campaignId ? {
      ...c, deliverables: c.deliverables.map((d) => d.id === dlvId ? {
        ...d, status: d.status === "done" ? "pending" as const : d.status === "pending" ? "in-progress" as const : "done" as const,
      } : d),
    } : c));
  };

  const deleteDeliverable = (campaignId: number, dlvId: number) => {
    setCampaigns((prev) => prev.map((c) => c.id === campaignId ? {
      ...c, deliverables: c.deliverables.filter((d) => d.id !== dlvId),
    } : c));
  };

  const getProgress = (campaign: Campaign): number => {
    if (campaign.deliverables.length === 0) return 0;
    const done = campaign.deliverables.filter((d) => d.status === "done").length;
    return Math.round((done / campaign.deliverables.length) * 100);
  };

  return (
    <div className={embedded ? "" : "animate-fade-in"}>
      {!embedded && (
        <>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>活动管理</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>营销活动策划 · 交付物追踪 · 进度管理</p>
        </>
      )}

      <div className={embedded ? "" : "flex gap-6"}>
        <div className={embedded ? "space-y-4" : "flex-1 min-w-0 space-y-4"}>
          {/* 创建/编辑表单 */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
              {editingId !== null ? "编辑活动" : "创建活动"}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input className="input-field" placeholder="活动名称" value={name} onChange={(e) => setName(e.target.value)} />
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value as CampaignStatus)}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>开始日期</label>
                <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>结束日期</label>
                <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-[11px] font-semibold flex items-center gap-1 mb-1.5" style={{ color: "var(--muted)" }}>
                📎 关联素材库
              </label>
              <div className="flex gap-2">
                <select className="input-field flex-1" value={linkedAssetId ?? ""}
                  onChange={(e) => setLinkedAssetId(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">不关联</option>
                  {assetOptions.map((a) => (<option key={a.id} value={a.id}>{a.title}</option>))}
                </select>
                <button className="btn btn-ghost text-xs shrink-0" onClick={refreshAssets} title="刷新素材列表">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingId !== null ? "保存修改" : "创建活动"}
              </button>
              {editingId !== null && <button className="btn btn-outline" onClick={resetForm}>取消编辑</button>}
            </div>
          </div>

          {/* 活动列表 */}
          {campaigns.length === 0 ? (
            <div className="smart-card text-center py-10"><p className="text-sm" style={{ color: "var(--muted)" }}>暂无活动</p></div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => {
                const progress = getProgress(c);
                return (
                  <div key={c.id} className="smart-card">
                    {/* 活动头部 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{c.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>
                            {STATUS_LABELS[c.status]}
                          </span>
                          {c.linkedAssetTitle && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)" }}>
                              📎 {c.linkedAssetTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                          {c.startDate || "未设置"} ~ {c.endDate || "未设置"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                          {expandedId === c.id ? "收起" : "详情"}
                        </button>
                        <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => handleEdit(c)}>编辑</button>
                        <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => handleCopy(c)} title="复制活动（日期顺延7天）">📋 复制</button>
                        <button className="btn btn-danger text-xs px-2 py-1" onClick={() => handleDelete(c.id)}>删除</button>
                      </div>
                    </div>

                    {/* 进度条 */}
                    {c.deliverables.length > 0 && (
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--surface-alt)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--primary)" }} />
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>
                          {progress}% ({c.deliverables.filter((d) => d.status === "done").length}/{c.deliverables.length})
                        </span>
                      </div>
                    )}

                    {/* 交付物清单（展开） */}
                    {expandedId === c.id && (
                      <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                          交付物清单 ({c.deliverables.length})
                        </h4>
                        <div className="space-y-1.5 mb-3">
                          {c.deliverables.length === 0 && (
                            <p className="text-[11px] py-2 text-center" style={{ color: "var(--muted)" }}>暂无交付物</p>
                          )}
                          {c.deliverables.map((d) => (
                            <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--surface-alt)" }}>
                              <button onClick={() => toggleDeliverable(c.id, d.id)}>
                                {d.status === "done" ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                ) : d.status === "in-progress" ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                                )}
                              </button>
                              <span className="flex-1 text-xs" style={{ color: d.status === "done" ? "var(--muted)" : "var(--text)", textDecoration: d.status === "done" ? "line-through" : "none" }}>{d.name}</span>
                              <span className="text-[10px]" style={{ color: "var(--muted)" }}>{d.owner} · {d.dueDate}</span>
                              <button className="text-[10px]" style={{ color: "#EF4444" }} onClick={() => deleteDeliverable(c.id, d.id)}>✕</button>
                            </div>
                          ))}
                        </div>
                        {/* 新增交付物 */}
                        <div className="flex gap-2">
                          <input className="input-field flex-1 text-xs" placeholder="交付物名称" value={newDlv.name}
                            onChange={(e) => setNewDlv((d) => ({ ...d, name: e.target.value }))} />
                          <input className="input-field w-24 text-xs" placeholder="负责人" value={newDlv.owner}
                            onChange={(e) => setNewDlv((d) => ({ ...d, owner: e.target.value }))} />
                          <input type="date" className="input-field w-28 text-xs" value={newDlv.dueDate}
                            onChange={(e) => setNewDlv((d) => ({ ...d, dueDate: e.target.value }))} />
                          <button className="btn btn-primary text-xs shrink-0" onClick={() => addDeliverable(c.id)}>+ 添加</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
