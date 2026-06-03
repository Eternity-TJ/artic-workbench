"use client";

import { useState, useEffect } from "react";

export default function ApiKeyManager() {
  const [savedKey, setSavedKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setSavedKey(localStorage.getItem("artic-api-key") || "");
  }, []);

  const handleSave = async () => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${trimmed}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "deepseek-chat", max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
      });
      if (res.ok) {
        localStorage.setItem("artic-api-key", trimmed);
        setSavedKey(trimmed);
        setNewKey("");
        setEditing(false);
        setMsg({ type: "ok", text: "API Key 验证通过，已保存" });
      } else {
        setMsg({ type: "err", text: "API Key 无效，请检查后重试" });
      }
    } catch {
      setMsg({ type: "err", text: "网络连接失败，无法验证 Key" });
    }
    setSaving(false);
  };

  const handleClear = () => {
    if (!confirm("确定清除 API Key？清除后需要重新输入才能访问工作台。")) return;
    localStorage.removeItem("artic-api-key");
    setSavedKey("");
  };

  const masked = (k: string) => {
    if (k.length <= 12) return k;
    return k.slice(0, 6) + "..." + k.slice(-6);
  };

  return (
    <div className="smart-card">
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>API Key</h3>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>当前浏览器中保存的 API Key，仅你本人可见</p>

      {msg && (
        <p className={"text-xs mb-2 px-3 py-1.5 rounded-lg " + (msg.type === "ok" ? "" : "")}
          style={msg.type === "ok"
            ? { background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }
            : { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
          {msg.text}
        </p>
      )}

      {!savedKey && (
        <div className="mb-2">
          <div className="flex gap-2">
            <input className="input-field flex-1 text-xs" placeholder="输入你的 API Key..."
              value={newKey} onChange={function(e) { setNewKey(e.target.value); setMsg(null); }}
              onKeyDown={function(e) { if (e.key === "Enter" && !saving) handleSave(); }} autoFocus disabled={saving} />
            <button className="btn btn-primary text-xs px-3" onClick={handleSave} disabled={saving}>
              {saving ? "验证中..." : "保存"}
            </button>
          </div>
        </div>
      )}

      {savedKey && !editing && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs px-2 py-1 rounded flex-1 truncate"
              style={{ background: "var(--surface-alt)", color: "var(--primary)", fontFamily: "monospace" }}>
              {showKey ? savedKey : masked(savedKey)}
            </code>
            <button className="btn btn-ghost text-xs px-2 py-1" onClick={function() { setShowKey(!showKey); }}
              title={showKey ? "隐藏" : "显示"}>
              {showKey ? "隐藏" : "显示"}
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline text-xs px-3 py-1" onClick={function() { setEditing(true); setNewKey(""); setMsg(null); }}>更换 Key</button>
            <button className="btn btn-ghost text-xs px-3 py-1" onClick={handleClear} style={{ color: "#EF4444" }}>清除 Key</button>
          </div>
        </>
      )}

      {savedKey && editing && (
        <div className="flex gap-2 mb-2">
          <input className="input-field flex-1 text-xs" placeholder="输入新的 API Key..."
            value={newKey} onChange={function(e) { setNewKey(e.target.value); setMsg(null); }}
            onKeyDown={function(e) { if (e.key === "Enter" && !saving) handleSave(); }} autoFocus disabled={saving} />
          <button className="btn btn-primary text-xs px-3" onClick={handleSave} disabled={saving}>
            {saving ? "验证中..." : "保存"}
          </button>
          <button className="btn btn-outline text-xs px-3" onClick={function() { setEditing(false); setNewKey(""); setMsg(null); }}>取消</button>
        </div>
      )}
    </div>
  );
}
