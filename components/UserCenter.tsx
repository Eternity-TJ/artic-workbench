"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import UserSegments from "./UserSegments";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  email: string;
  skills: string[];
  status: "online" | "offline" | "busy";
  joinedAt: string;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  module: string;
  detail: string;
  time: string;
}

interface ProjectStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContent: number;
  publishedContent: number;
  totalCompetitors: number;
  totalKnowledge: number;
  totalDatasets: number;
}

/* ==================== 种子数据 ==================== */

const SEED_MEMBERS: TeamMember[] = [
  { id: 1, name: "李明", role: "运营主管", avatar: "李", email: "liming@artic.work", skills: ["营销策划", "数据分析", "团队管理"], status: "online", joinedAt: "2026-01-15" },
  { id: 2, name: "王芳", role: "内容运营", avatar: "王", email: "wangfang@artic.work", skills: ["文案撰写", "社媒运营", "SEO"], status: "online", joinedAt: "2026-02-01" },
  { id: 3, name: "张伟", role: "增长运营", avatar: "张", email: "zhangwei@artic.work", skills: ["A/B测试", "转化优化", "数据分析"], status: "busy", joinedAt: "2026-03-10" },
  { id: 4, name: "陈静", role: "品牌设计", avatar: "陈", email: "chenjing@artic.work", skills: ["视觉设计", "品牌规范", "素材制作"], status: "offline", joinedAt: "2026-04-05" },
];

/* ==================== 组件 ==================== */

export default function UserCenter() {
  const suggestion = getSkillForModule("user-center");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalCampaigns: 0, activeCampaigns: 0, totalContent: 0,
    publishedContent: 0, totalCompetitors: 0, totalKnowledge: 0, totalDatasets: 0,
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    // 成员数据
    const saved = localStorage.getItem("artic-members");
    if (saved) { try { setMembers(JSON.parse(saved)); return; } catch {} }
    setMembers(SEED_MEMBERS);
    localStorage.setItem("artic-members", JSON.stringify(SEED_MEMBERS));

    // 聚合真实统计数据
    try {
      const campaigns = JSON.parse(localStorage.getItem("artic-campaigns") || "[]");
      const events = JSON.parse(localStorage.getItem("artic-calendar-events") || "[]");
      const competitors = JSON.parse(localStorage.getItem("artic-competitors") || "[]");
      const knowledge = JSON.parse(localStorage.getItem("artic-knowledge") || "[]");
      const datasets = JSON.parse(localStorage.getItem("artic-datasets") || "[]");
      const savedPosts = JSON.parse(localStorage.getItem("artic-saved-posts") || "[]");

      setStats({
        totalCampaigns: Array.isArray(campaigns) ? campaigns.length : 0,
        activeCampaigns: Array.isArray(campaigns) ? campaigns.filter((c: { status: string }) => c.status === "active").length : 0,
        totalContent: Array.isArray(events) ? events.length : 0,
        publishedContent: Array.isArray(events) ? events.filter((e: { status: string }) => e.status === "done").length : 0,
        totalCompetitors: Array.isArray(competitors) ? competitors.length : 0,
        totalKnowledge: Array.isArray(knowledge) ? knowledge.length : 0,
        totalDatasets: Array.isArray(datasets) ? datasets.length : 0,
      });
    } catch {}

    // 生成活动日志
    const logs: ActivityLog[] = [];
    try {
      const campaigns = JSON.parse(localStorage.getItem("artic-campaigns") || "[]");
      const posts = JSON.parse(localStorage.getItem("artic-saved-posts") || "[]");
      const knowledge = JSON.parse(localStorage.getItem("artic-knowledge") || "[]");
      Array.isArray(campaigns) && campaigns.slice(0, 5).forEach((c: { id: number; name: string; createdAt?: string }) => {
        logs.push({ id: c.id, user: "李明", action: "创建活动", module: "运营日历", detail: `活动「${c.name}」`, time: c.createdAt || "2026-06-01" });
      });
      Array.isArray(posts) && posts.slice(0, 3).forEach((p: { id: number; title?: string; platform?: string; createdAt?: string }) => {
        logs.push({ id: p.id + 10000, user: "王芳", action: "保存文案", module: "内容中心", detail: `「${p.title || "未命名"}」(${p.platform || "多平台"})`, time: p.createdAt || "2026-06-01" });
      });
      Array.isArray(knowledge) && knowledge.slice(0, 3).forEach((k: { id: number; title: string; createdAt: string }) => {
        logs.push({ id: k.id + 20000, user: "运营团队", action: "收录知识", module: "知识库", detail: `「${k.title}」`, time: k.createdAt });
      });
    } catch {}
    logs.sort((a, b) => b.time.localeCompare(a.time));
    setActivities(logs.slice(0, 15));
  }, []);

  const handleInvite = () => {
    if (!inviteName.trim() || !inviteRole.trim()) return;
    const member: TeamMember = {
      id: Date.now(),
      name: inviteName.trim(),
      role: inviteRole.trim(),
      avatar: inviteName.trim().charAt(0),
      email: inviteEmail.trim() || `${inviteName.trim()}@artic.work`,
      skills: [],
      status: "offline",
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [...members, member];
    setMembers(updated);
    localStorage.setItem("artic-members", JSON.stringify(updated));
    setInviteName(""); setInviteRole(""); setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleRemoveMember = (id: number) => {
    if (!confirm("确定移除该成员？")) return;
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    localStorage.setItem("artic-members", JSON.stringify(updated));
  };

  const statusColor = { online: "#10B981", busy: "#F59E0B", offline: "#94A3B8" };
  const statusLabel = { online: "在线", busy: "忙碌", offline: "离线" };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>用户中心</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>团队管理 · 个人工作台 · 全局活动日志</p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* 项目统计仪表盘 */}
          <div className="grid grid-cols-7 gap-2">
            {[
              { label: "总活动", value: stats.totalCampaigns, sub: `${stats.activeCampaigns} 进行中`, color: "#6366F1", menu: "operations" as const },
              { label: "内容排期", value: stats.totalContent, sub: `${stats.publishedContent} 已发布`, color: "#10B981", menu: "content-center" as const },
              { label: "竞品监控", value: stats.totalCompetitors, color: "#F59E0B", menu: "competitor" as const },
              { label: "知识文章", value: stats.totalKnowledge, color: "#8B5CF6", menu: "knowledge" as const },
              { label: "数据集", value: stats.totalDatasets, color: "#EC4899", menu: "data" as const },
              { label: "团队成员", value: members.length, color: "#06B6D4" },
              { label: "在线成员", value: members.filter(m => m.status === "online").length, color: "#10B981" },
            ].map(s => (
              <div key={s.label}
                className={`smart-card text-center py-3 ${s.menu ? "cursor-pointer hover:border-primary/50" : ""}`}
                onClick={() => {
                  if (s.menu) {
                    const event = new CustomEvent("artic-nav", { detail: { menu: s.menu } });
                    window.dispatchEvent(event);
                  }
                }}>
                <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] font-medium" style={{ color: "var(--muted)" }}>{s.label}</p>
                {s.sub && <p className="text-[8px] mt-0.5" style={{ color: "var(--muted)" }}>{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* 两栏：团队成员 + 活动日志 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 团队成员 */}
            <div className="smart-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>👥 团队成员</h3>
                <button className="btn btn-primary text-xs px-3 py-1" onClick={() => setShowInviteModal(true)}>+ 邀请</button>
              </div>
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                    style={{ background: selectedMember?.id === m.id ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface-alt)", border: "1px solid var(--border)" }}
                    onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}>
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--primary)" }}>{m.avatar}</div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: statusColor[m.status] }} title={statusLabel[m.status]} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{m.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>{m.role} · {m.email}</p>
                    </div>
                    <button className="text-[10px] px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity"
                      style={{ color: "#EF4444" }}
                      onClick={e => { e.stopPropagation(); handleRemoveMember(m.id); }}>✕</button>
                  </div>
                ))}
              </div>

              {/* 选中成员详情 */}
              {selectedMember && (
                <div className="mt-3 p-3 rounded-lg animate-fade-in" style={{ background: "var(--surface)", border: "1px solid var(--primary)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: "var(--primary)" }}>{selectedMember.avatar}</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{selectedMember.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{selectedMember.role} · 加入于 {selectedMember.joinedAt}</p>
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 font-bold" style={{ background: statusColor[selectedMember.status] + "20", color: statusColor[selectedMember.status] }}>
                        {statusLabel[selectedMember.status]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--muted)" }}>技能标签</p>
                    <div className="flex gap-1 flex-wrap">
                      {selectedMember.skills.map(s => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 活动日志 */}
            <div className="smart-card">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>📊 全局活动日志</h3>
              {activities.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--muted)" }}>暂无活动记录</p>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {activities.map((a, i) => (
                    <div key={`${a.id}-${i}`} className="flex items-center gap-2 py-2 px-1" style={{ borderBottom: i < activities.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
                      <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--text)" }}>{a.user}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white shrink-0" style={{ background: "var(--primary)" }}>{a.module}</span>
                      <span className="text-[11px] flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{a.action}：{a.detail}</span>
                      <span className="text-[9px] shrink-0" style={{ color: "var(--muted)" }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 用户分层与画像 */}
          <UserSegments />
        </div>

        <SmartSuggestionCard suggestion={suggestion} />
      </div>

      {/* ===== 邀请弹窗 ===== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowInviteModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[420px] p-6 rounded-xl shadow-2xl animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4" style={{ color: "var(--text)" }}>👥 邀请团队成员</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>姓名</label>
                <input className="input-field" placeholder="成员姓名..." value={inviteName} onChange={e => setInviteName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>角色</label>
                <input className="input-field" placeholder="如：内容运营、数据分析师..." value={inviteRole} onChange={e => setInviteRole(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>邮箱（选填）</label>
                <input className="input-field" placeholder="email@artic.work" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-outline" onClick={() => setShowInviteModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleInvite}>发送邀请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
