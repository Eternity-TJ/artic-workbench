"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import type { MenuKey } from "@/components/Sidebar";
import Overview from "@/components/Overview";
import OperationsRhythm from "@/components/OperationsRhythm";
import CompetitorTracking from "@/components/CompetitorTracking";
import ContentCenter from "@/components/ContentCenter";
import DataAnalytics from "@/components/DataAnalytics";
import KnowledgeBase from "@/components/KnowledgeBase";
import UserCenter from "@/components/UserCenter";
import Settings from "@/components/Settings";
import HelpDrawer from "@/components/HelpDrawer";

const CONTENT_MAP: Partial<Record<Exclude<MenuKey, "help">, React.ComponentType<any>>> = {
  overview: Overview,
  "user-center": UserCenter,
  operations: OperationsRhythm,
  competitor: CompetitorTracking,
  "content-center": ContentCenter,
  data: DataAnalytics,
  knowledge: KnowledgeBase,
  settings: Settings,
};

const MIN_SIDEBAR = 180;
const MAX_SIDEBAR = 420;
const DEFAULT_SIDEBAR = 260;

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [apiChecked, setApiChecked] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("artic-sidebar-width");
      if (saved) { const n = parseInt(saved); if (n >= MIN_SIDEBAR && n <= MAX_SIDEBAR) return n; }
    }
    return DEFAULT_SIDEBAR;
  });

  const resizing = useRef(false);

  const handleMenuClick = useCallback((key: MenuKey) => {
    if (key === "help") { setHelpOpen(true); return; }
    setActiveMenu(key);
  }, []);

  // API Key 守卫：校验存储的 Key 是否仍然有效（带超时）
  useEffect(() => {
    const key = localStorage.getItem("artic-api-key");
    if (!key) {
      router.replace("/");
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => { ctrl.abort(); setApiChecked(true); }, 5000);

    fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
      signal: ctrl.signal,
    }).then(res => {
      clearTimeout(timer);
      if (res.ok) { setApiChecked(true); }
      else { localStorage.removeItem("artic-api-key"); router.replace("/"); }
    }).catch(() => {
      clearTimeout(timer);
      setApiChecked(true); // 超时或网络错误：允许进入
    });
  }, [router]);

  // 监听 artic-nav 自定义事件（Overview 快速操作 + 联动）
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === "object" && "menu" in detail) {
        handleMenuClick(detail.menu as MenuKey);
        return;
      }
      if (typeof detail === "string") handleMenuClick(detail as MenuKey);
    };
    window.addEventListener("artic-nav", handler);
    return () => window.removeEventListener("artic-nav", handler);
  }, [handleMenuClick]);

  // 侧边栏拖拽调整宽度
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const w = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, e.clientX));
      setSidebarWidth(w);
      localStorage.setItem("artic-sidebar-width", String(w));
    };
    const onUp = () => { resizing.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const handleResizeStart = () => {
    resizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const ContentComponent = activeMenu && activeMenu !== "help" ? CONTENT_MAP[activeMenu] : undefined;

  if (!apiChecked) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm" style={{ color: "var(--muted)" }}>验证访问权限...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <div style={{ width: sidebarWidth }} className="shrink-0">
        <Sidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
      </div>

      {/* 拖拽分隔条 */}
      <div
        onMouseDown={handleResizeStart}
        className="w-1.5 shrink-0 cursor-col-resize relative group z-10"
        style={{ background: "transparent" }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded group-hover:bg-primary/50 transition-colors"
          style={{ background: "var(--border)" }} />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 group-hover:w-1"
          style={{ background: "transparent" }} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6" style={{ padding: "var(--card-padding)" }}>
          {!activeMenu || activeMenu === "overview" ? (
            <Overview />
          ) : ContentComponent ? (
            <ContentComponent />
          ) : null}
        </div>
      </main>
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
