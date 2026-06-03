"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULTS = {
  primary: "#6366F1",
  cardPadding: 24,
  cardRadius: 12,
};

interface Props {
  open: boolean;
}

export default function DeveloperPanel({ open }: Props) {
  const [color, setColor] = useState(DEFAULTS.primary);
  const [padding, setPadding] = useState(DEFAULTS.cardPadding);
  const [radius, setRadius] = useState(DEFAULTS.cardRadius);
  const [collapsed, setCollapsed] = useState(false);

  // Inject CSS variables into :root
  const applyStyles = useCallback((c: string, p: number, r: number) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", c);
    root.style.setProperty("--primary-light", c + "99"); // 60% opacity approx
    root.style.setProperty("--primary-dark", c + "CC");
    root.style.setProperty("--card-padding", `${p}px`);
    root.style.setProperty("--card-radius", `${r}px`);
  }, []);

  useEffect(() => {
    applyStyles(color, padding, radius);
  }, [color, padding, radius, applyStyles]);

  const handleReset = () => {
    setColor(DEFAULTS.primary);
    setPadding(DEFAULTS.cardPadding);
    setRadius(DEFAULTS.cardRadius);
  };

  if (!open) return null;

  return (
    <div className="dev-panel">
      {/* 面板头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">开发者视图</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1 rounded-md border border-border hover:bg-surface transition-colors text-muted"
          >
            重置
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface transition-colors text-muted"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-3 gap-4 animate-fade-in">
          {/* 主色调 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600">主色调</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-border p-0.5"
              />
              <code className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded">{color}</code>
            </div>
          </div>

          {/* 间距滑块 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600">
              卡片间距: <span className="text-muted">{padding}px</span>
            </label>
            <input
              type="range"
              min={8}
              max={48}
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer"
              style={{ accentColor: "var(--primary)" }}
            />
          </div>

          {/* 圆角滑块 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600">
              卡片圆角: <span className="text-muted">{radius}px</span>
            </label>
            <input
              type="range"
              min={0}
              max={32}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer"
              style={{ accentColor: "var(--primary)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
