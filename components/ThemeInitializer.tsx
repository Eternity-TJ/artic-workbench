"use client";

import { useEffect } from "react";

const DEFAULTS = { primary: "#6366F1", cardPadding: 24, cardRadius: 12 };

export default function ThemeInitializer() {
  useEffect(() => {
    const theme = localStorage.getItem("artic-theme");
    const html = document.documentElement;
    const root = document.documentElement;

    // 恢复主题
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "custom") {
      html.classList.remove("dark");
      const customBg = localStorage.getItem("artic-custom-bg") || "#F1F5F9";
      root.style.setProperty("--bg", customBg);
      root.style.setProperty("--surface", `color-mix(in srgb, ${customBg} 25%, white)`);
      root.style.setProperty("--surface-alt", `color-mix(in srgb, ${customBg} 15%, white)`);
      root.style.setProperty("--border", `color-mix(in srgb, ${customBg} 30%, #E2E8F0)`);
    }

    // 恢复开发者工具 CSS 变量（主色调 / 卡片间距 / 圆角）
    const savedColor = localStorage.getItem("artic-dev-color");
    if (savedColor) root.style.setProperty("--primary", savedColor);
    const savedPadding = localStorage.getItem("artic-dev-padding");
    if (savedPadding) root.style.setProperty("--card-padding", `${savedPadding}px`);
    const savedRadius = localStorage.getItem("artic-dev-radius");
    if (savedRadius) root.style.setProperty("--card-radius", `${savedRadius}px`);
  }, []);

  return null;
}
