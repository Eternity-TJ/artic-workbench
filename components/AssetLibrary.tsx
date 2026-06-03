"use client";

import { useState, useEffect, useCallback } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

type AssetCategory = "copy-template" | "brand-asset" | "sop" | "screenshot" | "favorite";

interface Asset {
  id: number;
  title: string;
  content: string;
  category: AssetCategory;
  source: string;
  tags: string[];
  linkedCampaignId?: number;
  linkedCampaignName?: string;
  date: string;
}

const CATEGORY_CONFIG: Record<AssetCategory, { label: string; color: string; icon: string }> = {
  "copy-template": { label: "文案模板", color: "#6366F1", icon: "📝" },
  "brand-asset": { label: "品牌素材", color: "#F59E0B", icon: "🎨" },
  "sop": { label: "SOP 流程", color: "#10B981", icon: "📋" },
  "screenshot": { label: "竞品截图", color: "#8B5CF6", icon: "📸" },
  "favorite": { label: "我的收藏", color: "#EC4899", icon: "⭐" },
};

const STORAGE_KEY = "artic-assets";

/* ==================== 预置数据 ==================== */

const INITIAL_ASSETS: Asset[] = [
  { id: 1, title: "新品上市种草模板", content: "【新品首发】{产品名}终于来了！\n3个你必须知道的使用技巧：\n① 使用场景\n② 效果对比\n③ 限时福利", category: "copy-template", source: "内部沉淀", tags: ["新品", "种草", "模板"], date: "2026-05-15" },
  { id: 2, title: "618 大促促销话术", content: "全年最低价！{折扣}折 + 满减\n限时{N}天，错过等一年\n🔥 已有{X}人加购", category: "copy-template", source: "往期活动", tags: ["大促", "促销", "紧迫感"], date: "2026-05-20" },
  { id: 3, title: "品牌主色板", content: "主色：#6366F1 (Indigo)\n辅色：#10B981 (Emerald)\n强调：#F59E0B (Amber)\n背景：#F1F5F9 (Slate)", category: "brand-asset", source: "品牌规范", tags: ["配色", "品牌规范", "设计"], date: "2026-04-01" },
  { id: 4, title: "新活动上线检查清单", content: "1. 活动页面全设备适配 ✅\n2. 优惠券配置生效 ✅\n3. 客服话术更新 ✅\n4. 数据埋点验证 ✅\n5. 应急预案就绪 ✅\n6. 内部通知发送 ✅", category: "sop", source: "问题复盘沉淀", tags: ["SOP", "检查清单", "上线"], date: "2026-05-10" },
  { id: 5, title: "Shein 618 首页弹窗结构分析", content: "倒计时组件：「距结束 2天 8时 23分」→ 紧迫感\n阶梯优惠：「满299-50 / 满599-120」→ 客单价锚定\n社交证明：「2.3万人已领」→ 从众效应\n关闭成本：「再逛逛，还有惊喜」→ 挽留弹窗", category: "screenshot", source: "竞品追踪同步", tags: ["Shein", "弹窗", "CRO", "社交证明"], date: "2026-05-30" },
  { id: 6, title: "社群运营周报模板", content: "📊 本周概览\n- 新增成员：{X} 人\n- 活跃率：{X}%\n- 转化数：{X} 单\n\n🔥 热门话题\n- {话题1}\n- {话题2}\n\n📅 下周计划\n- {计划项1}\n- {计划项2}", category: "favorite", source: "内部整理", tags: ["社群", "周报", "模板"], date: "2026-05-25" },
];

/* ==================== 组件 ==================== */

export default function AssetLibrary({ embedded }: { embedded?: boolean }) {
  const suggestion = getSkillForModule("assets");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeCategory, setActiveCategory] = useState<AssetCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", category: "copy-template" as AssetCategory,
    source: "", tags: "", linkedCampaignId: undefined as number | undefined,
  });

  const [campaignOptions, setCampaignOptions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      setAssets(parsed?.length ? parsed : INITIAL_ASSETS);
    } catch { setAssets(INITIAL_ASSETS); }
    refreshCampaigns();
  }, []);

  useEffect(() => {
    if (assets.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  const refreshCampaigns = () => {
    try {
      const campaigns = JSON.parse(localStorage.getItem("artic-campaigns") || "[]");
      setCampaignOptions(Array.isArray(campaigns) ? campaigns.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })) : []);
    } catch { setCampaignOptions([]); }
  };

  /* ========== 表单 ========== */
  const resetForm = () => {
    setForm({ title: "", content: "", category: "copy-template", source: "", tags: "", linkedCampaignId: undefined });
    setEditId(null); setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const campaign = campaignOptions.find((c) => c.id === form.linkedCampaignId);
    if (editId !== null) {
      setAssets((prev) => prev.map((a) => a.id === editId ? {
        ...a,
        title: form.title.trim(), content: form.content.trim(), category: form.category,
        source: form.source.trim(), tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        linkedCampaignId: form.linkedCampaignId, linkedCampaignName: campaign?.name,
      } : a));
    } else {
      setAssets((prev) => [{
        id: Date.now(), title: form.title.trim(), content: form.content.trim(),
        category: form.category, source: form.source.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        linkedCampaignId: form.linkedCampaignId, linkedCampaignName: campaign?.name,
        date: new Date().toISOString().slice(0, 10),
      }, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (a: Asset) => {
    setForm({
      title: a.title, content: a.content, category: a.category,
      source: a.source, tags: a.tags.join(", "), linkedCampaignId: a.linkedCampaignId,
    });
    setEditId(a.id); setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (editId === id) resetForm();
  };

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => alert("✅ 已复制到剪贴板"));
  }, []);

  /* ========== 筛选 ========== */
  const filtered = assets.filter((a) => {
    if (activeCategory !== "all" && a.category !== activeCategory) return false;
    if (search && !a.title.includes(search) && !a.content.includes(search) && !a.tags.some((t) => t.includes(search))) return false;
    return true;
  });

  return (
    <div className={embedded ? "" : "animate-fade-in"}>
      {!embedded && (
        <>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>素材库</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>文案模板 · 品牌素材 · SOP 流程 · 竞品截图 · 我的收藏</p>
            </div>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); refreshCampaigns(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              新建素材
            </button>
          </div>
          <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
            手动管理所有运营素材，分类检索，关联活动。素材不自动获取——需手动录入。
          </p>
        </>
      )}

      <div className={embedded ? "" : "flex gap-6"}>
        <div className={embedded ? "space-y-4" : "flex-1 min-w-0 space-y-4"}>

          {/* ===== 新建/编辑表单 ===== */}
          {showForm && (
            <div className="smart-card animate-fade-in">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
                {editId !== null ? "编辑素材" : "新建素材"}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input className="input-field" placeholder="素材标题" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>分类</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AssetCategory }))}>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
              </div>
              <textarea className="input-field h-28 resize-none mb-3" placeholder="素材正文内容..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input className="input-field" placeholder="来源（如：往期活动）" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
                <input className="input-field" placeholder="标签（逗号分隔）" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
                <div>
                  <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>关联活动</label>
                  <select className="input-field" value={form.linkedCampaignId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, linkedCampaignId: e.target.value ? Number(e.target.value) : undefined }))}>
                    <option value="">不关联</option>
                    {campaignOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={handleSubmit}>{editId !== null ? "保存修改" : "保存素材"}</button>
                <button className="btn btn-outline" onClick={resetForm}>取消</button>
              </div>
            </div>
          )}

          {/* ===== 分类标签 + 搜索 ===== */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 flex-wrap flex-1">
              {[
                { key: "all" as const, label: "全部", color: "var(--muted)" },
                ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ key: k as AssetCategory, label: `${v.icon} ${v.label}`, color: v.color })),
              ].map((cat) => (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                  style={{
                    background: activeCategory === cat.key ? `${cat.color}18` : "var(--surface-alt)",
                    color: activeCategory === cat.key ? cat.color : "var(--muted)",
                    border: `1px solid ${activeCategory === cat.key ? cat.color : "var(--border)"}`,
                  }}>
                  {cat.label} ({cat.key === "all" ? assets.length : assets.filter((a) => a.category === cat.key).length})
                </button>
              ))}
            </div>
            <input className="input-field w-48 shrink-0" placeholder="搜索素材..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* ===== 卡片网格 ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((asset) => {
              const cfg = CATEGORY_CONFIG[asset.category];
              return (
                <div key={asset.id} className="smart-card group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {asset.linkedCampaignName && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)" }}>
                          📎 {asset.linkedCampaignName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] px-2 py-1 rounded font-bold" style={{ background: "var(--primary)", color: "#fff" }}
                        onClick={() => handleCopy(asset.content)}>复制</button>
                      <button className="text-[10px] px-1.5 py-1 rounded" style={{ color: "var(--muted)" }}
                        onClick={() => handleEdit(asset)}>编辑</button>
                      <button className="text-[10px] px-1.5 py-1 rounded" style={{ color: "#EF4444" }}
                        onClick={() => handleDelete(asset.id)}>✕</button>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>{asset.title}</h4>
                  <p className="text-xs leading-relaxed mb-3 whitespace-pre-wrap line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {asset.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                      {asset.source} · {asset.date}
                    </span>
                    <div className="flex gap-1">
                      {asset.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="smart-card text-center py-10">
              <p className="text-sm" style={{ color: "var(--muted)" }}>暂无匹配的素材</p>
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
