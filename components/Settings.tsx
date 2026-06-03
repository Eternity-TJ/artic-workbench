"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import VersionManagementEmbedded from "./VersionManagement";
import ApiKeyManager from "./ApiKeyManager";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

type SettingsTab = "preferences" | "version";
type Theme = "light" | "dark" | "custom";
type RefreshInterval = "30" | "60" | "120" | "300";

/* ==================== 开发者工具常量 ==================== */

const DEFAULTS = { primary: "#6366F1", cardPadding: 24, cardRadius: 12, customBg: "#F1F5F9" };

/* ==================== 组件 ==================== */

export default function Settings() {
  const suggestion = getSkillForModule("settings");
  const [tab, setTab] = useState<SettingsTab>("preferences");

  /* ===== 偏好设置状态：从 localStorage 初始化，避免覆盖已保存主题 ===== */
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("artic-theme") as Theme) || "light";
    }
    return "light";
  });
  const [customBg, setCustomBg] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("artic-custom-bg") || DEFAULTS.customBg;
    }
    return DEFAULTS.customBg;
  });
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>("60");

  useEffect(() => {
    const html = document.documentElement;
    const root = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
      root.style.removeProperty("--bg");
      root.style.removeProperty("--surface");
      root.style.removeProperty("--surface-alt");
    } else if (theme === "custom") {
      html.classList.remove("dark");
      root.style.setProperty("--bg", customBg);
      root.style.setProperty("--surface", `color-mix(in srgb, ${customBg} 25%, white)`);
      root.style.setProperty("--surface-alt", `color-mix(in srgb, ${customBg} 15%, white)`);
      root.style.setProperty("--border", `color-mix(in srgb, ${customBg} 30%, #E2E8F0)`);
    } else {
      html.classList.remove("dark");
      root.style.removeProperty("--bg");
      root.style.removeProperty("--surface");
      root.style.removeProperty("--surface-alt");
      root.style.removeProperty("--border");
    }
    localStorage.setItem("artic-theme", theme);
  }, [theme, customBg]);

  // 自定义背景色变化时保存并同步更新
  useEffect(() => {
    if (theme === "custom") {
      document.documentElement.style.setProperty("--bg", customBg);
      document.documentElement.style.setProperty("--surface", `color-mix(in srgb, ${customBg} 25%, white)`);
      document.documentElement.style.setProperty("--surface-alt", `color-mix(in srgb, ${customBg} 15%, white)`);
      document.documentElement.style.setProperty("--border", `color-mix(in srgb, ${customBg} 30%, #E2E8F0)`);
    }
    localStorage.setItem("artic-custom-bg", customBg);
  }, [customBg, theme]);

  const handleResetPrefs = useCallback(() => {
    setTheme("light");
    setCustomBg(DEFAULTS.customBg);
    setNotifyEnabled(true);
    setRefreshInterval("60");
    localStorage.removeItem("artic-dev-color");
    localStorage.removeItem("artic-dev-padding");
    localStorage.removeItem("artic-dev-radius");
  }, []);

  /* ===== 开发者工具状态 ===== */
  const [devColor, setDevColor] = useState(DEFAULTS.primary);
  const [devPadding, setDevPadding] = useState(DEFAULTS.cardPadding);
  const [devRadius, setDevRadius] = useState(DEFAULTS.cardRadius);
  const devMounted = useRef(false);

  const applyDevStyles = useCallback((c: string, p: number, r: number) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", c);
    root.style.setProperty("--card-padding", `${p}px`);
    root.style.setProperty("--card-radius", `${r}px`);
  }, []);

  // 挂载时从 DOM 读取当前值（跳过 SSR 默认值），不触发写回
  useEffect(() => {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const c = cs.getPropertyValue("--primary").trim();
    if (c) setDevColor(c);
    const p = parseInt(cs.getPropertyValue("--card-padding"));
    if (Number.isFinite(p)) setDevPadding(p);
    const r = parseInt(cs.getPropertyValue("--card-radius"));
    if (Number.isFinite(r)) setDevRadius(r);
  }, []);

  // 仅在用户手动调节时写回 CSS 变量（跳过首次挂载），同时持久化
  useEffect(() => {
    if (!devMounted.current) { devMounted.current = true; return; }
    applyDevStyles(devColor, devPadding, devRadius);
    localStorage.setItem("artic-dev-color", devColor);
    localStorage.setItem("artic-dev-padding", String(devPadding));
    localStorage.setItem("artic-dev-radius", String(devRadius));
  }, [devColor, devPadding, devRadius, applyDevStyles]);

  const handleDevReset = () => {
    setDevColor(DEFAULTS.primary);
    setDevPadding(DEFAULTS.cardPadding);
    setDevRadius(DEFAULTS.cardRadius);
    localStorage.removeItem("artic-dev-color");
    localStorage.removeItem("artic-dev-padding");
    localStorage.removeItem("artic-dev-radius");
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>设置</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>偏好设置 · 版本时间线</p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab 切换 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            {[
              { key: "preferences" as const, label: "⚙️ 偏好设置", desc: "主题·通知·刷新·样式调试" },
              { key: "version" as const, label: "📋 版本管理", desc: "时间线·发布·主题预设" },
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

          {/* ===== Tab 1: 偏好设置 ===== */}
          {tab === "preferences" && (
            <div className="space-y-4 animate-fade-in">
              {/* 主题切换 */}
              <div className="smart-card">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>主题</h3>
                <div className="flex gap-3">
                  {[
                    { key: "light" as const, label: "浅色模式", icon: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 2v2 M12 20v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M2 12h2 M20 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42" },
                    { key: "dark" as const, label: "深色模式", icon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" },
                    { key: "custom" as const, label: "自定义", icon: "M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5.5h2v2h-2zm0-8h2v6h-2z M7.5 12a4.5 4.5 0 1 1 9 0" },
                  ].map((t) => (
                    <button key={t.key} onClick={() => setTheme(t.key)}
                      className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg transition-all"
                      style={{
                        background: theme === t.key ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-alt)",
                        border: theme === t.key ? "2px solid var(--primary)" : "1px solid var(--border)",
                      }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: theme === t.key ? "var(--primary)" : "var(--muted)" }}>
                        <path d={t.icon} />
                      </svg>
                      <span className="text-xs font-semibold" style={{ color: theme === t.key ? "var(--primary)" : "var(--muted)" }}>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* 自定义背景色选择器 */}
                {theme === "custom" && (
                  <div className="mt-4 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <label className="text-xs font-medium" style={{ color: "var(--text)" }}>背景颜色</label>
                    <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-border p-0.5" />
                    <code className="text-xs px-2 py-1 rounded" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>{customBg}</code>
                    <button className="btn btn-outline text-xs px-2 py-0.5 ml-auto" onClick={() => setCustomBg(DEFAULTS.customBg)}>重置</button>
                  </div>
                )}
              </div>

              {/* 通知开关 */}
              <div className="smart-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>推送通知</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>接收版本发布、活动状态变更等通知</p>
                  </div>
                  <button onClick={() => setNotifyEnabled((v) => !v)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ background: notifyEnabled ? "var(--primary)" : "var(--border)" }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: notifyEnabled ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
              </div>

              {/* API Key 管理 */}
              <ApiKeyManager />

              {/* 数据刷新间隔 */}
              <div className="smart-card">
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>数据刷新间隔</h3>
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>控制工作台数据的自动刷新频率</p>
                <select className="input-field" value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value as RefreshInterval)}>
                  <option value="30">每 30 秒</option>
                  <option value="60">每 1 分钟</option>
                  <option value="120">每 2 分钟</option>
                  <option value="300">每 5 分钟</option>
                </select>
              </div>

              {/* ===== CSS 变量实时调试 ===== */}
              <div className="smart-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>CSS 变量实时调试</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                      调整主色调、卡片间距和圆角——修改即时生效
                    </p>
                  </div>
                  <button className="btn btn-outline text-xs px-3 py-1" onClick={handleDevReset}>重置</button>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: "var(--text)" }}>主色调</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={devColor} onChange={(e) => setDevColor(e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border border-border p-0.5" />
                      <code className="text-xs px-2 py-1 rounded" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>{devColor}</code>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: "var(--text)" }}>
                      卡片间距: <span style={{ color: "var(--muted)" }}>{devPadding}px</span>
                    </label>
                    <input type="range" min={8} max={48} value={devPadding}
                      onChange={(e) => setDevPadding(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "var(--primary)", background: "var(--border)" }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: "var(--text)" }}>
                      卡片圆角: <span style={{ color: "var(--muted)" }}>{devRadius}px</span>
                    </label>
                    <input type="range" min={0} max={32} value={devRadius}
                      onChange={(e) => setDevRadius(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "var(--primary)", background: "var(--border)" }} />
                  </div>
                </div>

                {/* 实时预览 */}
                <div className="mt-5 p-4 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                  <p className="text-[10px] mb-2" style={{ color: "var(--muted)" }}>预览效果</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-md text-xs font-semibold text-white transition-colors"
                      style={{ background: devColor, borderRadius: `${devRadius}px`, padding: `${devPadding * 0.4}px ${devPadding * 0.7}px` }}>
                      主按钮
                    </button>
                    <button className="px-4 py-2 rounded-md text-xs font-semibold transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: `${devRadius}px`, padding: `${devPadding * 0.4}px ${devPadding * 0.7}px`, color: "var(--text)" }}>
                      次按钮
                    </button>
                    <span className="px-3 py-2 rounded-md text-xs"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: `${devRadius}px`, padding: `${devPadding * 0.4}px ${devPadding * 0.7}px` }}>
                      <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: devColor }} />
                      <span style={{ color: "var(--text-secondary)" }}>标签</span>
                    </span>
                  </div>
                </div>
              </div>

              <button className="btn btn-outline" onClick={handleResetPrefs}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                恢复默认设置
              </button>
            </div>
          )}

          {/* ===== Tab 2: 版本管理 ===== */}
          {tab === "version" && (
            <div className="animate-fade-in">
              <VersionManagementEmbedded embedded />
            </div>
          )}
        </div>

        <div className="w-[320px] shrink-0 hidden lg:block">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
