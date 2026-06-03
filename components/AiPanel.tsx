"use client";

import { useState, useRef, useEffect } from "react";
import { callDeepSeek } from "@/lib/ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string, isFollowUp = false) => {
    setError("");
    const userMsg: Message = { role: "user", content };
    const updated = isFollowUp ? [...messages, userMsg] : [userMsg];
    setMessages(updated);
    setLoading(true);

    // 构建对话历史
    const apiMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];
    if (isFollowUp) {
      // 包含历史消息
      for (const m of messages) {
        apiMessages.push({ role: m.role, content: m.content });
      }
    } else {
      apiMessages.push({ role: "user", content: userPrompt });
    }
    apiMessages.push({ role: "user", content: content });

    // 发送请求（绕过 callDeepSeek 的固定 system/user 模式）
    const key = typeof window !== "undefined" ? localStorage.getItem("artic-api-key") : null;
    if (!key) {
      setError("未找到 API Key，请先在设置中配置");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-chat", max_tokens: 1024, temperature: 0.7, messages: apiMessages }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: { message?: string } })?.error?.message || `请求失败 (${res.status})`);
      } else {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || "";
        setMessages([...updated, { role: "assistant", content: reply }]);
      }
    } catch {
      setError("网络连接失败，请检查网络后重试");
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      sendMessage(userPrompt);
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    sendMessage(trimmed, messages.length > 0);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}>
        {buttonIcon} {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[540px] h-[520px] flex flex-col rounded-2xl shadow-2xl animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}>
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{buttonIcon}</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{title}</h3>
                  <p className="text-[10px]" style={{ color: "var(--muted)" }}>可连续追问，AI 会结合上文回答</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-alt" style={{ color: "var(--muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* 消息区 */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "text-white"
                      : ""
                  }`}
                  style={m.role === "user"
                    ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }
                    : { background: "var(--surface-alt)", color: "var(--text-secondary)" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl" style={{ background: "var(--surface-alt)" }}>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--muted)", animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--muted)", animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--muted)", animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-3 rounded-lg text-xs" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* 输入区 */}
            <div className="flex gap-2 px-4 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
              <input
                className="input-field flex-1 text-xs"
                placeholder="输入追问..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                disabled={loading}
              />
              <button className="btn btn-primary text-xs px-4" onClick={handleSubmit} disabled={loading || !input.trim()}>
                发送
              </button>
              <button className="btn btn-ghost text-xs px-2" onClick={() => { setMessages([]); setError(""); }}
                title="重新开始" disabled={loading}>
                ↺
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
