"use client";

import { useState, useEffect } from "react";

/* ==================== 类型 ==================== */

interface UserSegment {
  id: number;
  name: string;
  description: string;
  criteria: string;
  size: number;
  color: string;
  persona: string;
  strategy: string;
}

interface UserProfile {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  city?: string;
  occupation?: string;
  interests: string[];
  segmentId: number;
  notes: string;
  addedAt: string;
}

type SegTab = "overview" | "profiles" | "create";

/* ==================== 种子数据 ==================== */

const SEED_SEGMENTS: UserSegment[] = [
  {
    id: 1, name: "高价值会员", description: "高频购买+高客单价，品牌核心资产",
    criteria: "月消费≥3次 且 客单价≥¥200", size: 120, color: "#6366F1",
    persona: "25-35岁都市白领女性，追求品质生活，信任品牌，愿意为体验付费",
    strategy: "1. VIP专属折扣\n2. 新品优先体验\n3. 专属客服\n4. 生日礼遇",
  },
  {
    id: 2, name: "潜力新客", description: "首单后7天内活跃，转化潜力大",
    criteria: "注册≤30天 且 已首单 且 近7天活跃", size: 350, color: "#10B981",
    persona: "22-30岁年轻用户，通过社交媒体/朋友推荐而来，价格敏感但愿意尝试",
    strategy: "1. 新人专享券\n2. 社群引导\n3. 内容种草\n4. 首单好评激励",
  },
  {
    id: 3, name: "沉睡用户", description: "曾消费但30天+未活跃，需激活",
    criteria: "历史有消费 且 近30天无活跃", size: 480, color: "#F59E0B",
    persona: "各年龄段，曾因促销/活动购买后流失，对品牌认知较浅",
    strategy: "1. 大促召回短信\n2. 限时优惠券\n3. 爆品推荐\n4. 问卷调研流失原因",
  },
  {
    id: 4, name: "流失风险", description: "消费频次下降，有流失趋势",
    criteria: "近60天消费次数 ≤ 近60-120天消费次数的50%", size: 85, color: "#EF4444",
    persona: "曾是活跃用户，近期活跃度明显下降，可能被竞品吸引或需求变化",
    strategy: "1. 定向优惠券\n2. 电话/微信回访\n3. 专属权益唤醒\n4. 竞品对比内容",
  },
];

const SEED_PROFILES: UserProfile[] = [
  { id: 1, name: "张女士", age: 32, gender: "女", city: "上海", occupation: "市场总监", interests: ["美妆", "穿搭", "瑜伽", "咖啡"], segmentId: 1, notes: "小红书重度用户，月消费约¥800", addedAt: "2026-05-10" },
  { id: 2, name: "李同学", age: 24, gender: "女", city: "杭州", occupation: "研究生", interests: ["护肤", "平价好物", "追剧", "宠物"], segmentId: 2, notes: "通过抖音广告进入，首单¥68", addedAt: "2026-06-01" },
  { id: 3, name: "王先生", age: 40, gender: "男", city: "北京", occupation: "工程师", interests: ["数码", "户外", "汽车"], segmentId: 3, notes: "去年大促消费¥500+，此后无记录", addedAt: "2025-11-15" },
];

const SEG_COLORS: Record<string, string> = { "#6366F1": "bg-[#6366F1]", "#10B981": "bg-[#10B981]", "#F59E0B": "bg-[#F59E0B]", "#EF4444": "bg-[#EF4444]" };

/* ==================== 组件 ==================== */

export default function UserSegments() {
  const [tab, setTab] = useState<SegTab>("overview");
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedSeg, setSelectedSeg] = useState<UserSegment | null>(null);

  // 创建表单
  const [segName, setSegName] = useState("");
  const [segCriteria, setSegCriteria] = useState("");
  const [segSize, setSegSize] = useState(100);
  const [segColor, setSegColor] = useState("#6366F1");
  const [segPersona, setSegPersona] = useState("");
  const [segStrategy, setSegStrategy] = useState("");

  // 画像表单
  const [profileName, setProfileName] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileInterests, setProfileInterests] = useState("");
  const [profileSegId, setProfileSegId] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("artic-segments");
    if (saved) { try { setSegments(JSON.parse(saved)); return; } catch {} }
    setSegments(SEED_SEGMENTS);
    localStorage.setItem("artic-segments", JSON.stringify(SEED_SEGMENTS));
    const savedP = localStorage.getItem("artic-user-profiles");
    if (savedP) { try { setProfiles(JSON.parse(savedP)); return; } catch {} }
    setProfiles(SEED_PROFILES);
    localStorage.setItem("artic-user-profiles", JSON.stringify(SEED_PROFILES));
  }, []);

  const saveSegments = (s: UserSegment[]) => { setSegments(s); localStorage.setItem("artic-segments", JSON.stringify(s)); };
  const saveProfiles = (p: UserProfile[]) => { setProfiles(p); localStorage.setItem("artic-user-profiles", JSON.stringify(p)); };

  const createSegment = () => {
    if (!segName.trim()) return;
    const seg: UserSegment = { id: Date.now(), name: segName.trim(), description: segCriteria.slice(0, 30), criteria: segCriteria, size: segSize, color: segColor, persona: segPersona, strategy: segStrategy };
    saveSegments([...segments, seg]);
    setSegName(""); setSegCriteria(""); setSegPersona(""); setSegStrategy("");
  };

  const deleteSegment = (id: number) => {
    if (!confirm("确定删除此分层？")) return;
    saveSegments(segments.filter(s => s.id !== id));
  };

  const createProfile = () => {
    if (!profileName.trim()) return;
    const p: UserProfile = { id: Date.now(), name: profileName.trim(), age: parseInt(profileAge) || undefined, city: profileCity, interests: profileInterests.split(/[,，、]/).map(s => s.trim()).filter(Boolean), segmentId: profileSegId, notes: "", addedAt: new Date().toISOString().slice(0, 10) };
    saveProfiles([...profiles, p]);
    setProfileName(""); setProfileAge(""); setProfileCity(""); setProfileInterests("");
  };

  const totalUsers = segments.reduce((s, seg) => s + seg.size, 0);

  return (
    <div className="smart-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>🎯 用户分层与画像</h3>
        <div className="flex gap-1 p-0.5 rounded" style={{ background: "var(--surface-alt)" }}>
          {[
            { key: "overview" as const, label: "分层总览" },
            { key: "profiles" as const, label: "用户画像" },
            { key: "create" as const, label: "+ 新建" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-2.5 py-1 rounded text-[10px] font-medium transition-all"
              style={{ background: tab === t.key ? "var(--primary)" : "transparent", color: tab === t.key ? "#fff" : "var(--muted)" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 分层总览 */}
      {tab === "overview" && (
        <>
          <div className="flex items-center gap-4 mb-3 p-3 rounded-lg" style={{ background: "var(--surface-alt)" }}>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>{segments.length}</p>
              <p className="text-[9px]" style={{ color: "var(--muted)" }}>分层数</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "#10B981" }}>{totalUsers.toLocaleString()}</p>
              <p className="text-[9px]" style={{ color: "var(--muted)" }}>总用户数</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{profiles.length}</p>
              <p className="text-[9px]" style={{ color: "var(--muted)" }}>画像数</p>
            </div>
            <div className="flex-1">
              {/* 简易进度条 */}
              <div className="flex h-2 rounded-full overflow-hidden">
                {segments.map(seg => (
                  <div key={seg.id} style={{ width: `${(seg.size / totalUsers) * 100}%`, background: seg.color }}
                    title={`${seg.name}: ${seg.size}`} />
                ))}
              </div>
              <div className="flex gap-3 mt-1 flex-wrap">
                {segments.slice(0, 4).map(seg => (
                  <span key={seg.id} className="text-[8px] flex items-center gap-1" style={{ color: "var(--muted)" }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: seg.color }} />{seg.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {segments.map(seg => (
              <div key={seg.id}
                className="p-3 rounded-lg cursor-pointer transition-all"
                style={{ background: selectedSeg?.id === seg.id ? `color-mix(in srgb, ${seg.color} 10%, transparent)` : "var(--surface-alt)", border: selectedSeg?.id === seg.id ? `1px solid ${seg.color}` : "1px solid var(--border)" }}
                onClick={() => setSelectedSeg(selectedSeg?.id === seg.id ? null : seg)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: seg.color }}>● {seg.name}</span>
                  <span className="text-[9px] font-bold" style={{ color: "var(--muted)" }}>{seg.size} 人</span>
                </div>
                <p className="text-[9px]" style={{ color: "var(--muted)" }}>{seg.description}</p>
                {selectedSeg?.id === seg.id && (
                  <div className="mt-2 pt-2 space-y-1 animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-[10px]"><span style={{ color: "var(--muted)" }}>条件：</span><span style={{ color: "var(--text-secondary)" }}>{seg.criteria}</span></p>
                    <p className="text-[10px]"><span style={{ color: "var(--muted)" }}>画像：</span><span style={{ color: "var(--text-secondary)" }}>{seg.persona}</span></p>
                    <p className="text-[10px] whitespace-pre-wrap"><span style={{ color: "var(--muted)" }}>策略：</span><span style={{ color: "var(--text-secondary)" }}>{seg.strategy}</span></p>
                    <button className="text-[9px] mt-1" style={{ color: "#EF4444" }} onClick={() => deleteSegment(seg.id)}>删除</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 用户画像 */}
      {tab === "profiles" && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <input className="input-field text-xs flex-1" placeholder="姓名" value={profileName} onChange={e => setProfileName(e.target.value)} />
            <input className="input-field text-xs w-16" placeholder="年龄" value={profileAge} onChange={e => setProfileAge(e.target.value)} />
            <input className="input-field text-xs w-20" placeholder="城市" value={profileCity} onChange={e => setProfileCity(e.target.value)} />
            <select className="input-field text-xs w-32" value={profileSegId} onChange={e => setProfileSegId(Number(e.target.value))}>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button className="btn btn-primary text-xs px-2 py-1" onClick={createProfile}>+ 添加</button>
          </div>
          <input className="input-field text-xs mb-3" placeholder="兴趣标签（逗号分隔）" value={profileInterests} onChange={e => setProfileInterests(e.target.value)} />

          {profiles.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>暂无用户画像，点击上方添加</p>
          ) : (
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {profiles.map(p => {
                const seg = segments.find(s => s.id === p.segmentId);
                return (
                  <div key={p.id} className="flex items-center gap-2 py-2 px-1" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg?.color || "var(--muted)" }} />
                    <span className="text-xs font-semibold w-16 shrink-0" style={{ color: "var(--text)" }}>{p.name}</span>
                    <span className="text-[9px] w-12 shrink-0" style={{ color: "var(--muted)" }}>{p.age ? `${p.age}岁` : ""} {p.city}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 text-white" style={{ background: seg?.color || "var(--muted)" }}>{seg?.name || "未分层"}</span>
                    <span className="text-[9px] flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{p.interests.join(" · ")}</span>
                    <button className="text-[9px] opacity-30 hover:opacity-100" style={{ color: "#EF4444" }} onClick={() => saveProfiles(profiles.filter(x => x.id !== p.id))}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 新建分层 */}
      {tab === "create" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>分层名称 *</label>
              <input className="input-field" placeholder="例：高价值会员" value={segName} onChange={e => setSegName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>预估人数</label>
                <input type="number" className="input-field" value={segSize} onChange={e => setSegSize(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>颜色</label>
                <input type="color" value={segColor} onChange={e => setSegColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border p-0.5" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>筛选条件</label>
            <input className="input-field" placeholder="例：月消费≥3次 且 客单价≥¥200" value={segCriteria} onChange={e => setSegCriteria(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>用户画像描述</label>
            <textarea className="input-field" rows={2} placeholder="该分层用户的典型特征..." value={segPersona} onChange={e => setSegPersona(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>运营策略</label>
            <textarea className="input-field" rows={2} placeholder="针对该分层的具体运营动作..." value={segStrategy} onChange={e => setSegStrategy(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={createSegment} disabled={!segName.trim()}>创建分层</button>
        </div>
      )}
    </div>
  );
}
