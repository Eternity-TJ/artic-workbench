"use client";

import { useState } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import AiPanel from "./AiPanel";
import { getSkillForModule } from "@/lib/skillMapping";
import { PROMPTS } from "@/lib/ai";

/* ==================== 类型 ==================== */

interface Observation {
  id: number;
  date: string;
  content: string;
  category: "pricing" | "content" | "social" | "product" | "other";
}

interface Competitor {
  id: number;
  name: string;
  url: string;
  addedAt: string;
  observations: Observation[];
  profile: {
    positioning: string;
    priceRange: string;
    keyChannels: string;
    contentStyle: string;
  };
}

const OBS_CATEGORIES: Record<Observation["category"], { label: string; color: string }> = {
  pricing: { label: "定价", color: "#EF4444" },
  content: { label: "内容", color: "#6366F1" },
  social: { label: "社媒", color: "#F59E0B" },
  product: { label: "产品", color: "#10B981" },
  other: { label: "其他", color: "#6B7280" },
};

const INITIAL_COMPETITORS: Competitor[] = [
  {
    id: 1, name: "Shein", url: "https://www.shein.com", addedAt: "2026-05-15",
    profile: { positioning: "快时尚 DTC，年轻女性 18-35", priceRange: "$5-$50（极致低价）", keyChannels: "App + Instagram + TikTok", contentStyle: "UGC 穿搭 + KOL 开箱 + 每日上新" },
    observations: [
      { id: 11, date: "2026-05-30", content: "618 首页弹窗：倒计时+阶梯优惠+社交证明（2.3万人已领），三要素齐全", category: "pricing" },
      { id: 12, date: "2026-05-25", content: "TikTok 发起 #SheinHaul 挑战赛，单周新增 UGC 视频 1.2 万条，互动率 4.8%", category: "social" },
      { id: 13, date: "2026-05-20", content: "搜索\"连衣裙\"→ 顶部 banner 推荐算法展示「猜你喜欢」横向滑动分类标签", category: "product" },
    ],
  },
  {
    id: 2, name: "Temu", url: "https://www.temu.com", addedAt: "2026-05-20",
    profile: { positioning: "极致性价比全品类平台", priceRange: "$1-$30（补贴定价）", keyChannels: "App + Facebook Ads + 游戏化裂变", contentStyle: "拼团+Coupon+Spin-the-Wheel 游戏化互动" },
    observations: [
      { id: 21, date: "2026-05-28", content: "新用户首单 90% OFF 弹窗，配合 Spin-the-Wheel 抽奖，注册转化率估计 > 40%", category: "pricing" },
      { id: 22, date: "2026-05-22", content: "Facebook 广告素材风格转变：从「极致低价」转向「好物推荐」叙事风格", category: "content" },
    ],
  },
  {
    id: 3, name: "Zaful", url: "https://www.zaful.com", addedAt: "2026-05-28",
    profile: { positioning: "泳装/度假风细分 DTC", priceRange: "$10-$60", keyChannels: "Instagram + Pinterest + 网红分销", contentStyle: "度假场景+旅行博主+高颜值视觉" },
    observations: [
      { id: 31, date: "2026-05-26", content: "Instagram Story 每日更新 5-8 条，使用\"上滑购买\"功能直接转化", category: "social" },
    ],
  },
];

/* ==================== 组件 ==================== */

export default function CompetitorTracking() {
  const suggestion = getSkillForModule("competitor");
  const [competitors, setCompetitors] = useState<Competitor[]>(INITIAL_COMPETITORS);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  /* ===== 新增观察 ===== */
  const [obsForm, setObsForm] = useState({ competitorId: 0, content: "", category: "content" as Observation["category"] });

  const handleAdd = () => {
    if (!name.trim() || !url.trim()) return;
    setCompetitors((prev) => [{
      id: Date.now(), name: name.trim(),
      url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      addedAt: new Date().toISOString().slice(0, 10),
      profile: { positioning: "", priceRange: "", keyChannels: "", contentStyle: "" },
      observations: [],
    }, ...prev]);
    setName(""); setUrl("");
  };

  const handleDelete = (id: number) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    setCompareIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  /* ===== 观察记录 ===== */
  const addObservation = (competitorId: number) => {
    if (!obsForm.content.trim()) return;
    setCompetitors((prev) => prev.map((c) => c.id === competitorId ? {
      ...c, observations: [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), content: obsForm.content.trim(), category: obsForm.category }, ...c.observations],
    } : c));
    setObsForm({ competitorId: 0, content: "", category: "content" });
  };

  const deleteObservation = (competitorId: number, obsId: number) => {
    setCompetitors((prev) => prev.map((c) => c.id === competitorId ? {
      ...c, observations: c.observations.filter((o) => o.id !== obsId),
    } : c));
  };

  /* ===== 竞品画像编辑 ===== */
  const updateProfile = (competitorId: number, field: keyof Competitor["profile"], value: string) => {
    setCompetitors((prev) => prev.map((c) => c.id === competitorId ? {
      ...c, profile: { ...c.profile, [field]: value },
    } : c));
  };

  /* ===== 对比视图 ===== */
  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { if (next.size >= 4) return prev; next.add(id); }
      return next;
    });
  };

  const compareList = competitors.filter((c) => compareIds.has(c.id));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>竞品追踪</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>结构化追踪 · 手动记录观察 · 并排对比分析</p>
        </div>
        <div className="flex items-center gap-2">
          <AiPanel
            title="竞品格局分析"
            buttonLabel="AI 竞品洞察"
            {...PROMPTS.competitor(
              competitors.map(c => ({
                name: c.name,
                positioning: c.profile.positioning,
                priceRange: c.profile.priceRange,
                channels: c.profile.keyChannels,
                style: c.profile.contentStyle,
              }))
            )}
          />
          {compareIds.size >= 2 && (
            <button className="btn btn-outline text-xs" onClick={() => setShowCompare(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h4l3-9 6 18 3-9h4"/></svg>
              对比 ({compareIds.size})
            </button>
          )}
          <span className="text-[10px]" style={{ color: "var(--muted)" }}>勾选 2-4 个竞品进行并排对比</span>
        </div>
      </div>
      <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
        所有竞品数据需手动录入和维护。真实平台数据因反爬机制无法自动抓取，请在各平台官方后台导出后录入。
      </p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">

          {/* 添加表单 */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>添加竞品</h3>
            <div className="flex gap-3">
              <input className="input-field flex-1" placeholder="竞品名称" value={name}
                onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              <input className="input-field flex-1" placeholder="网址" value={url}
                onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              <button className="btn btn-primary shrink-0" onClick={handleAdd}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                添加
              </button>
            </div>
          </div>

          {/* 竞品列表 */}
          {competitors.length === 0 ? (
            <div className="smart-card text-center py-10"><p className="text-sm" style={{ color: "var(--muted)" }}>暂无竞品</p></div>
          ) : (
            <div className="space-y-3">
              {competitors.map((c) => (
                <div key={c.id} className="smart-card">
                  {/* 竞品头部 */}
                  <div className="flex items-center gap-3 mb-3">
                    <label className="shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={compareIds.has(c.id)} onChange={() => toggleCompare(c.id)}
                        className="w-3.5 h-3.5 rounded accent-[#F59E0B]" />
                    </label>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--primary)" }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{c.name}</span>
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[10px] hover:underline" style={{ color: "var(--primary)" }}>{c.url}</a>
                      </div>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>添加于 {c.addedAt} · {c.observations.length} 条观察记录</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                        {expandedId === c.id ? "收起" : "详情"}
                      </button>
                      <button className="btn btn-danger text-xs px-2 py-1" onClick={() => handleDelete(c.id)}>删除</button>
                    </div>
                  </div>

                  {/* 竞品画像（展开） */}
                  {expandedId === c.id && (
                    <div className="mt-3 pt-3 animate-fade-in space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                      {/* 画像编辑 */}
                      <div>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>竞品画像</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { key: "positioning" as const, label: "市场定位", placeholder: "如：快时尚 DTC，18-35 女性" },
                            { key: "priceRange" as const, label: "价格带", placeholder: "如：$5-$50" },
                            { key: "keyChannels" as const, label: "核心渠道", placeholder: "如：App + Ins + TikTok" },
                            { key: "contentStyle" as const, label: "内容风格", placeholder: "如：UGC 穿搭 + 每日上新" },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="text-[10px] font-medium block mb-0.5" style={{ color: "var(--muted)" }}>{field.label}</label>
                              <input className="input-field text-[11px]" placeholder={field.placeholder} value={c.profile[field.key]}
                                onChange={(e) => updateProfile(c.id, field.key, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 观察记录 */}
                      <div>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>
                          观察记录 ({c.observations.length})
                        </h4>
                        <div className="space-y-1.5 mb-3">
                          {c.observations.length === 0 && (
                            <p className="text-[11px] py-2 text-center" style={{ color: "var(--muted)" }}>暂无记录，在下方添加</p>
                          )}
                          {c.observations.slice(0, 10).map((o) => {
                            const cat = OBS_CATEGORIES[o.category];
                            return (
                              <div key={o.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "var(--surface-alt)" }}>
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white shrink-0 mt-0.5" style={{ background: cat.color }}>{cat.label}</span>
                                <span className="text-xs flex-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{o.content}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px]" style={{ color: "var(--muted)" }}>{o.date}</span>
                                  <button className="text-[9px]" style={{ color: "#EF4444" }} onClick={() => deleteObservation(c.id, o.id)}>✕</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* 新增观察 */}
                        <div className="flex gap-2">
                          <select className="input-field w-20 text-[11px]" value={obsForm.category}
                            onChange={(e) => setObsForm((f) => ({ ...f, category: e.target.value as Observation["category"], competitorId: c.id }))}>
                            {Object.entries(OBS_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <input className="input-field flex-1 text-xs" placeholder="输入观察内容..." value={obsForm.competitorId === c.id ? obsForm.content : ""}
                            onFocus={() => setObsForm((f) => ({ ...f, competitorId: c.id }))}
                            onChange={(e) => setObsForm((f) => ({ ...f, content: e.target.value, competitorId: c.id }))}
                            onKeyDown={(e) => e.key === "Enter" && addObservation(c.id)} />
                          <button className="btn btn-primary text-xs shrink-0" onClick={() => addObservation(c.id)}>记录</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-[320px] shrink-0 hidden lg:block">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>

      {/* ===== 对比视图（Modal） ===== */}
      {showCompare && compareList.length >= 2 && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCompare(false)} />
          <div className="fixed inset-x-4 top-8 bottom-8 z-50 bg-white rounded-xl overflow-auto shadow-2xl" style={{ background: "var(--surface)" }}>
            <div className="sticky top-0 p-4 flex items-center justify-between" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>竞品对比分析 · {compareList.length} 家</h3>
              <button className="btn btn-ghost text-xs" onClick={() => setShowCompare(false)}>关闭 ✕</button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--text)" }}>对比维度</th>
                    {compareList.map((c, i) => {
                      const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];
                      return <th key={c.id} className="text-left py-3 px-3 font-bold" style={{ color: colors[i] }}>{c.name}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "市场定位", key: "positioning" as const },
                    { label: "价格带", key: "priceRange" as const },
                    { label: "核心渠道", key: "keyChannels" as const },
                    { label: "内容风格", key: "contentStyle" as const },
                  ].map((dim) => (
                    <tr key={dim.key} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-3 px-3 font-semibold" style={{ color: "var(--muted)" }}>{dim.label}</td>
                      {compareList.map((c) => (
                        <td key={c.id} className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                          {c.profile[dim.key] || <span style={{ color: "var(--muted)" }}>未填写</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-3 font-semibold" style={{ color: "var(--muted)" }}>最近观察</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                        {c.observations.length > 0 ? (
                          <div className="space-y-1">
                            {c.observations.slice(0, 3).map((o) => {
                              const cat = OBS_CATEGORIES[o.category];
                              return (
                                <div key={o.id} className="flex items-start gap-1">
                                  <span className="text-[9px] px-1 py-0.5 rounded text-white shrink-0" style={{ background: cat.color }}>{cat.label}</span>
                                  <span className="text-[11px]">{o.content.slice(0, 60)}...</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : <span style={{ color: "var(--muted)" }}>暂无</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold" style={{ color: "var(--muted)" }}>观察总数</td>
                    {compareList.map((c, i) => {
                      const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];
                      return <td key={c.id} className="py-3 px-3"><span className="text-lg font-bold" style={{ color: colors[i] }}>{c.observations.length}</span> 条</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
