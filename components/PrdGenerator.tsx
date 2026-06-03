"use client";

import { useState, useRef } from "react";

interface PrdSection { title: string; content: string; }

const SECTIONS: PrdSection[] = [
  { title: "背景与目标", content: "" },
  { title: "目标用户", content: "" },
  { title: "用户故事", content: "" },
  { title: "功能需求", content: "" },
  { title: "验收标准", content: "" },
  { title: "时间线", content: "" },
];

export default function PrdGenerator() {
  const [product, setProduct] = useState("");
  const [users, setUsers] = useState("");
  const [scenes, setScenes] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<PrdSection[]>(SECTIONS);
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!product.trim()) return;
    setError("");
    setLoading(true);

    const key = localStorage.getItem("artic-api-key");
    if (!key) { setError("请先在设置中配置 DeepSeek API Key"); setLoading(false); return; }

    const prompt = `你是一位资深产品经理。请根据以下信息生成一份结构化 PRD 文档。每个章节用小标题 "## 章节名" 开头，内容简洁专业，中文输出。

产品名称：${product}
目标用户：${users || "待补充"}
核心场景：${scenes || "待补充"}
补充说明：${extra || "无"}

请按以下格式输出：
## 背景与目标
## 目标用户
## 用户故事
## 功能需求
## 验收标准
## 时间线`;

    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat", max_tokens: 2048, temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: { message?: string } })?.error?.message || `请求失败 (${res.status})`);
      } else {
        const data = await res.json();
        const text: string = data.choices?.[0]?.message?.content || "";
        const parsed = parseSections(text);
        setSections(parsed);
        setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {
      setError("网络连接失败，请重试");
    }
    setLoading(false);
  };

  const saveToKnowledge = () => {
    const existing = JSON.parse(localStorage.getItem("artic-knowledge") || "[]");
    const article = {
      id: Date.now(),
      title: `PRD: ${product}`,
      category: "template",
      source: "AI 生成",
      tags: ["PRD", product],
      summary: `${product} 产品需求文档 — ${new Date().toLocaleDateString("zh-CN")}`,
      content: sections.map(s => `## ${s.title}\n\n${s.content}`).join("\n\n"),
      pinned: false,
      createdAt: new Date().toISOString().slice(0, 10),
      author: "AI 生成器",
    };
    existing.unshift(article);
    localStorage.setItem("artic-knowledge", JSON.stringify(existing));
    alert("PRD 已保存到知识库 → 工作模板分类");
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* 表单 */}
      <div className="smart-card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>📋 PRD 生成器</h3>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>输入产品信息，AI 自动生成结构化产品需求文档</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>产品名称 *</label>
            <input className="input-field" placeholder="例：社区团购小程序" value={product}
              onChange={e => setProduct(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>目标用户</label>
            <input className="input-field" placeholder="例：25-40岁家庭主妇" value={users}
              onChange={e => setUsers(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>核心场景</label>
          <input className="input-field" placeholder="例：用户在线下单，团长配送到小区自提点" value={scenes}
            onChange={e => setScenes(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text)" }}>补充说明</label>
          <textarea className="input-field" rows={2} placeholder="其他需求、约束条件、参考竞品等..." value={extra}
            onChange={e => setExtra(e.target.value)} />
        </div>
        {error && (
          <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>{error}</p>
        )}
        <button className="btn btn-primary" onClick={generate} disabled={loading || !product.trim()}>
          {loading ? "AI 正在生成..." : "🤖 生成 PRD"}
        </button>
      </div>

      {/* 结果 */}
      <div ref={contentRef}>
        {sections.some(s => s.content) && (
          <div className="smart-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>📄 {product || "PRD 文档"}</h3>
              <div className="flex gap-2">
                <button className="btn btn-outline text-xs" onClick={generate} disabled={loading}>🔄 重新生成</button>
                <button className="btn btn-primary text-xs" onClick={saveToKnowledge}>💾 保存到知识库</button>
              </div>
            </div>
            {sections.map(s => (
              <div key={s.title}>
                <h4 className="text-sm font-bold mb-2" style={{ color: "var(--primary)" }}>{s.title}</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{s.content || "（待生成）"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 解析 AI 返回的 ## 章节 */
function parseSections(text: string): PrdSection[] {
  const result: PrdSection[] = [];
  const parts = text.split(/^## /m);
  for (const part of parts) {
    const lines = part.trim().split("\n");
    const title = lines[0]?.trim();
    const content = lines.slice(1).join("\n").trim();
    if (title && content) {
      const existing = SECTIONS.find(s => s.title.includes(title) || title.includes(s.title));
      if (existing) {
        result.push({ title: existing.title, content });
      }
    }
  }
  // fill missing
  for (const s of SECTIONS) {
    if (!result.find(r => r.title === s.title)) {
      result.push({ title: s.title, content: "（未生成）" });
    }
  }
  return result;
}
