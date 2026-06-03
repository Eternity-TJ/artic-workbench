"use client";

import { useState } from "react";
import type { SkillSuggestion } from "@/lib/skillMapping";

interface Props {
  suggestion: SkillSuggestion | null;
}

export default function SmartSuggestionCard({ suggestion }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (!suggestion) return null;

  if (collapsed) {
    return (
      <div className="smart-card animate-fade-in sticky top-4 flex items-center justify-between py-3 px-4 cursor-pointer"
        onClick={() => setCollapsed(false)} title="点击展开智能建议">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1.23.49 2.41 1.41 3.38.78.78 1.24 1.56 1.41 2.62" />
            </svg>
          </div>
          <span className="text-[11px] font-bold" style={{ color: "var(--primary)" }}>智能建议</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    );
  }

  return (
    <div className="smart-card animate-fade-in sticky top-4">
      {/* 头部 */}
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1.23.49 2.41 1.41 3.38.78.78 1.24 1.56 1.41 2.62" />
          </svg>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
          智能建议 · {suggestion.category}
        </span>
        <button className="ml-auto w-6 h-6 rounded flex items-center justify-center hover:bg-surface-alt transition-colors"
          onClick={() => setCollapsed(true)} title="收起">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      {/* 详细建议列表 */}
      <ul className="space-y-3 mb-4">
        {suggestion.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
              style={{ background: "var(--primary)" }}
            >
              {i + 1}
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      {/* 关联技能标签 */}
      <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-[11px] font-medium mb-2" style={{ color: "var(--muted)" }}>
          推荐技能
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestion.primarySkills.map((s) => (
            <span key={s} className="px-2 py-1 rounded-md text-[11px] font-semibold text-white" style={{ background: "var(--primary)" }}>
              {s}
            </span>
          ))}
          {suggestion.secondarySkills.map((s) => (
            <span key={s} className="px-2 py-1 rounded-md text-[11px] font-medium" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
              {s}
            </span>
          ))}
        </div>
        <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>
          试试说：「{suggestion.triggerWords.slice(0, 3).join("」「")}」
        </p>
      </div>
    </div>
  );
}
