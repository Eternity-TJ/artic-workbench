"use client";

import { useState } from "react";
import PostWriter from "./PostWriter";
import AssetLibrary from "./AssetLibrary";
import PrdGenerator from "./PrdGenerator";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

type ContentTab = "writer" | "assets" | "prd";

export default function ContentCenter() {
  const suggestion = getSkillForModule("content-center");
  const [tab, setTab] = useState<ContentTab>("writer");

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>内容中心</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        文案生成 + 素材管理 + PRD 生成 · 生成即保存，素材即复用
      </p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab 切换 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            {[
              { key: "writer" as const, label: "✏️ 文案生成", desc: "多平台·多语气·一键生成" },
              { key: "assets" as const, label: "📂 素材库", desc: "分类管理·搜索复用·关联活动" },
              { key: "prd" as const, label: "📋 PRD 生成", desc: "AI 生成·结构化文档" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 py-2.5 rounded-md text-sm font-medium transition-all"
                style={{
                  background: tab === t.key ? "var(--primary)" : "transparent",
                  color: tab === t.key ? "#fff" : "var(--muted)",
                }}>
                <span className="block text-xs">{t.label}</span>
                <span className="block text-[9px] opacity-70 mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          {tab === "writer" && <PostWriter embedded />}
          {tab === "assets" && <AssetLibrary embedded />}
          {tab === "prd" && <PrdGenerator />}
        </div>

        <SmartSuggestionCard suggestion={suggestion} />
      </div>
    </div>
  );
}
