"use client";

import { useState } from "react";
import { callDeepSeek, type AiResult } from "@/lib/ai";

interface Props {
  title: string;
  systemPrompt: string;
  userPrompt: string;
  buttonLabel?: string;
  buttonIcon?: string;
}

export default function AiPanel({ title, systemPrompt, userPrompt, buttonLabel = "AI 分析", buttonIcon = "🤖" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);

  const handleAnalyze = async () => {
    setOpen(true);
    if (result) return; // 已有结果，不重复请求
    setLoading(true);
    const r = await callDeepSeek(systemPrompt, userPrompt);
    setResult(r);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleAnalyze}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff",
        }}>
        {buttonIcon} {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[520px] max-h-[70vh] flex flex-col rounded-2xl shadow-2xl animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}>
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{buttonIcon}</span>
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{title}</h3>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-alt transition-colors"
                style={{ color: "var(--muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {/* 内容 */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs" style={{ color: "var(--muted)" }}>AI 正在分析中...</p>
                </div>
              )}
              {!loading && result && !result.success && (
                <div className="p-4 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  <p className="text-sm font-semibold mb-1">分析失败</p>
                  <p className="text-xs">{result.error}</p>
                </div>
              )}
              {!loading && result && result.success && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                  {result.content}
                </div>
              )}
            </div>
            {/* 底部操作 */}
            {result?.success && (
              <div className="flex gap-2 px-5 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
                <button className="btn btn-outline text-xs flex-1"
                  onClick={() => { setResult(null); setLoading(true); callDeepSeek(systemPrompt, userPrompt).then(r => { setResult(r); setLoading(false); }); }}>
                  重新分析
                </button>
                <button className="btn btn-primary text-xs flex-1"
                  onClick={() => { navigator.clipboard.writeText(result.content); }}>
                  复制结果
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
