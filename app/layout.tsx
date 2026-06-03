import type { Metadata } from "next";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";

export const metadata: Metadata = {
  title: "Artic — 运营工作台 · 76 技能 · 一站式运营管理",
  description: "集成 76 个专业 Claude Code 技能的运营工作台。覆盖营销策划、内容创作、数据分析、竞品情报、品牌设计、流程自动化 9 大模块，提供 9 个功能面板。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
