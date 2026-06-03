"use client";

import { useState, useEffect } from "react";

export default function ApiKeyManager() {
  const [savedKey, setSavedKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    setSavedKey(localStorage.getItem("artic-api-key") || "");
  }, []);

  const handleSave = () => {
    if (!newKey.trim()) return;
    localStorage.setItem("artic-api-key", newKey.trim());
    setSavedKey(newKey.trim());
    setNewKey("");
    setEditing(false);
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

      {!savedKey && (
        <div className="mb-2">
          <div className="flex gap-2">
            <input className="input-field flex-1 text-xs" placeholder="输入你的 API Key..."
              value={newKey} onChange={function(e) { setNewKey(e.target.value); }}
              onKeyDown={function(e) { if (e.key === "Enter") handleSave(); }} autoFocus />
            <button className="btn btn-primary text-xs px-3" onClick={handleSave}>保存</button>
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
            <button className="btn btn-outline text-xs px-3 py-1" onClick={function() { setEditing(true); setNewKey(""); }}>更换 Key</button>
            <button className="btn btn-ghost text-xs px-3 py-1" onClick={handleClear} style={{ color: "#EF4444" }}>清除 Key</button>
          </div>
        </>
      )}

      {savedKey && editing && (
        <div className="flex gap-2 mb-2">
          <input className="input-field flex-1 text-xs" placeholder="输入新的 API Key..."
            value={newKey} onChange={function(e) { setNewKey(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") handleSave(); }} autoFocus />
          <button className="btn btn-primary text-xs px-3" onClick={handleSave}>保存</button>
          <button className="btn btn-outline text-xs px-3" onClick={function() { setEditing(false); setNewKey(""); }}>取消</button>
        </div>
      )}
    </div>
  );
}
