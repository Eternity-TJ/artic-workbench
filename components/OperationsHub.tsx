"use client";

import { useState } from "react";
import CampaignManagement from "./CampaignManagement";
import ContentCalendar from "./ContentCalendar";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

export type OpsTab = "campaign" | "calendar";

export default function OperationsHub({ initialTab }: { initialTab?: OpsTab }) {
  const suggestion = getSkillForModule("operations");
  const [tab, setTab] = useState<OpsTab>(initialTab || "campaign");

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>运营日历</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        活动策划 + 内容排期 · 统一管理运营节奏
      </p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab 切换 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            {[
              { key: "campaign" as const, label: "📋 活动管理", desc: "策划·交付物·进度" },
              { key: "calendar" as const, label: "📅 内容日历", desc: "排期·平台·状态" },
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

          {tab === "campaign" ? <CampaignManagement embedded /> : <ContentCalendar embedded />}
        </div>

        <SmartSuggestionCard suggestion={suggestion} />
      </div>
    </div>
  );
}
