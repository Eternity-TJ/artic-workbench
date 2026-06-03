"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onConfirm: (key: string) => void;
  onCancel: () => void;
}

const VALIDATE_URL = "https://api.deepseek.com/v1/chat/completions";

async function validateKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(VALIDATE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function ApiKeyModal({ open, onConfirm, onCancel }: Props) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    setError("");
    setChecking(true);
    const valid = await validateKey(trimmed);
    setChecking(false);
    if (valid) {
      onConfirm(trimmed);
    } else {
      setError("API Key 无效，请检查后重试（需要有效的 DeepSeek API Key，从 platform.deepseek.com 获取）");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-[440px] p-6 rounded-2xl shadow-2xl animate-fade-in"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}>
        {/* 图标 */}
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
            <circle cx="12" cy="16" r="1"/>
          </svg>
        </div>

        <h3 className="text-lg font-bold text-center mb-1" style={{ color: "var(--text)" }}>输入你的 DeepSeek API Key</h3>
        <p className="text-xs text-center mb-4" style={{ color: "var(--muted)" }}>
          每位用户使用自己的 DeepSeek Key 访问工作台，Key 仅保存在你的浏览器本地
        </p>

        <div className="relative mb-3">
          <input
            type={show ? "text" : "password"}
            className="input-field pr-10"
            placeholder="sk-..."
            value={key}
            onChange={e => { setKey(e.target.value); setError(""); }}
            autoFocus
            disabled={checking}
            onKeyDown={e => { if (e.key === "Enter" && key.trim() && !checking) handleSubmit(); }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center hover:bg-surface-alt transition-colors"
            onClick={() => setShow(!show)}
            style={{ color: "var(--muted)" }}
            type="button">
            {show ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
            {error}
          </p>
        )}

        {checking && (
          <p className="text-xs text-center mb-3" style={{ color: "var(--primary)" }}>
            正在验证 API Key...
          </p>
        )}

        <div className="flex gap-3">
          <button className="btn btn-outline flex-1" onClick={onCancel} disabled={checking}>取消</button>
          <button className="btn btn-primary flex-1" disabled={!key.trim() || checking}
            onClick={handleSubmit}>
            {checking ? "验证中..." : "确认，进入工作台"}
          </button>
        </div>

        <p className="text-[10px] text-center mt-4" style={{ color: "var(--muted)" }}>
          将调用 DeepSeek API 验证 Key 有效性，不会存储或上传
        </p>
      </div>
    </div>
  );
}
