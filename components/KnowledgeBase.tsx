"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface Article {
  id: number;
  title: string;
  category: ArticleCategory;
  tags: string[];
  summary: string;
  content: string;
  source: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

type ArticleCategory = "sop" | "best-practice" | "industry" | "skill-guide" | "template" | "case-study";

interface CategoryDef {
  key: ArticleCategory;
  label: string;
  icon: string;
  color: string;
}

/* ==================== 常量 ==================== */

const CATEGORIES: CategoryDef[] = [
  { key: "sop", label: "SOP 流程", icon: "📋", color: "#10B981" },
  { key: "best-practice", label: "最佳实践", icon: "⭐", color: "#6366F1" },
  { key: "industry", label: "行业洞察", icon: "🔍", color: "#F59E0B" },
  { key: "skill-guide", label: "技能指南", icon: "📖", color: "#8B5CF6" },
  { key: "template", label: "工作模板", icon: "📄", color: "#EC4899" },
  { key: "case-study", label: "案例研究", icon: "🎯", color: "#06B6D4" },
];

const SEED_ARTICLES: Article[] = [
  {
    id: 1, title: "小红书种草文案 SOP", category: "sop",
    tags: ["小红书", "种草", "文案", "SOP"],
    summary: "从选题、拍摄、文案撰写到发布节奏的完整操作流程。适用于美妆/穿搭/家居类目。",
    content: "## 一、选题阶段\n1. 热点追踪：每日查看小红书热搜 + 抖音热点\n2. 产品库匹配：从产品库中筛选 3-5 款适合的产品\n\n## 二、内容制作\n1. 拍摄：自然光 + 场景化构图\n2. 文案结构：痛点引入 → 产品介绍 → 使用感受 → CTA\n\n## 三、发布策略\n- 最佳发布时间：工作日 12:00-14:00, 20:00-22:00\n- 标签数量：5-8 个精准标签",
    source: "团队沉淀", author: "运营团队", createdAt: "2026-05-15", updatedAt: "2026-06-01", pinned: true,
  },
  {
    id: 2, title: "A/B 测试最佳实践", category: "best-practice",
    tags: ["AB测试", "CRO", "数据驱动"],
    summary: "如何设计、执行和分析 A/B 测试。覆盖样本量计算、统计显著性、避免常见误区。",
    content: "## 核心原则\n1. 一次只测一个变量\n2. 样本量至少 1000/组\n3. 运行至少 2 个完整周期\n\n## 常见误区\n- 过早停止测试\n- 多重比较不修正\n- 忽略新奇效应",
    source: "行业标准", author: "增长团队", createdAt: "2026-04-20", updatedAt: "2026-05-28", pinned: true,
  },
  {
    id: 3, title: "抖音短视频运营指南", category: "skill-guide",
    tags: ["抖音", "短视频", "运营", "算法"],
    summary: "抖音推荐算法逻辑、内容策略、投流技巧的综合指南。",
    content: "## 算法三要素\n1. 完播率（权重最高）\n2. 互动率（点赞+评论+分享）\n3. 转化率（主页访问+关注）\n\n## 内容策略\n- 黄金 3 秒：开头必须有悬念或冲突\n- 时长建议：15-45 秒\n- 发布频率：每天 1-2 条",
    source: "官方文档 + 实践总结", author: "内容团队", createdAt: "2026-05-01", updatedAt: "2026-06-01", pinned: false,
  },
  {
    id: 4, title: "电商大促活动策划模板", category: "template",
    tags: ["电商", "大促", "活动策划", "模板"],
    summary: "双11/618等大促活动的完整策划框架，含时间线、资源分配、风险预案。",
    content: "## 活动框架\n### 预热期（前7天）\n- 悬念海报 + 倒计时\n- 老客专属预告\n\n### 爆发期（当天）\n- 0 点限时秒杀\n- 满减 + 赠品 + 免单\n\n### 返场期（后3天）\n- 爆款返场\n- 感谢信 + 复购券",
    source: "历史活动复盘", author: "运营团队", createdAt: "2026-03-10", updatedAt: "2026-05-15", pinned: false,
  },
  {
    id: 5, title: "邮件营销开户率提升案例", category: "case-study",
    tags: ["邮件营销", "EDM", "转化", "案例"],
    summary: "某 SaaS 产品通过优化邮件主题行和发送时间，将开户率从 12% 提升至 28%。",
    content: "## 背景\n- 产品：SaaS CRM 工具\n- 初始开户率：12%\n- 目标：提升至 20%+\n\n## 优化措施\n1. 主题行 A/B 测试（疑问句 vs 陈述句 vs 数字型）\n2. 发送时间优化（周三 10am vs 周四 3pm）\n3. 个性化变量（{firstName} 插入）\n\n## 结果\n- 开户率：12% → 28%（+133%）\n- 打开率：18% → 34%",
    source: "客户案例", author: "增长团队", createdAt: "2026-04-05", updatedAt: "2026-04-05", pinned: false,
  },
  {
    id: 6, title: "品牌社媒运营规范", category: "best-practice",
    tags: ["品牌", "社媒", "规范", "调性"],
    summary: "多平台品牌社媒运营的统一规范：语言调性、视觉风格、互动话术、危机应对。",
    content: "## 语言调性\n- 微博：轻松幽默 + 热点互动\n- 微信：专业克制 + 深度内容\n- 小红书：真实种草 + 生活方式\n- 抖音：娱乐性强 + 节奏快速\n\n## 视觉规范\n- 主色 #6366F1，辅色 #10B981\n- 字体：标题思源黑体 Bold，正文思源黑体 Regular",
    source: "品牌团队", author: "品牌团队", createdAt: "2026-02-20", updatedAt: "2026-05-20", pinned: false,
  },
];

/* ==================== 组件 ==================== */

export default function KnowledgeBase() {
  const suggestion = getSkillForModule("knowledge");
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | "all">("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // 新建表单
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ArticleCategory>("best-practice");
  const [newTags, setNewTags] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSource, setNewSource] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("artic-knowledge");
    if (saved) {
      try { setArticles(JSON.parse(saved)); } catch { setArticles(SEED_ARTICLES); }
    } else {
      setArticles(SEED_ARTICLES);
      localStorage.setItem("artic-knowledge", JSON.stringify(SEED_ARTICLES));
    }
  }, []);

  const saveArticles = (updated: Article[]) => {
    setArticles(updated);
    localStorage.setItem("artic-knowledge", JSON.stringify(updated));
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newSummary.trim()) return;
    const article: Article = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      summary: newSummary.trim(),
      content: newContent.trim() || newSummary.trim(),
      source: newSource.trim() || "团队沉淀",
      author: "运营团队",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      pinned: false,
    };
    saveArticles([article, ...articles]);
    setNewTitle(""); setNewCategory("best-practice"); setNewTags("");
    setNewSummary(""); setNewContent(""); setNewSource("");
    setShowNewModal(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("确定删除这篇知识文章？")) return;
    saveArticles(articles.filter(a => a.id !== id));
  };

  const handleTogglePin = (id: number) => {
    saveArticles(articles.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  /* ===== 筛选 ===== */
  const filtered = articles
    .filter(a => selectedCategory === "all" || a.category === selectedCategory)
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q)
        || a.summary.toLowerCase().includes(q)
        || a.tags.some(t => t.toLowerCase().includes(q))
        || a.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const catDef = (key: ArticleCategory) => CATEGORIES.find(c => c.key === key)!;

  const categoryCounts = CATEGORIES.map(c => ({
    ...c,
    count: articles.filter(a => a.category === c.key).length,
  }));

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>知识库</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>SOP · 最佳实践 · 行业洞察 · 技能指南 · 工作模板 · 案例研究</p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* 统计条 */}
          <div className="grid grid-cols-6 gap-2">
            {[{ key: "all", label: "全部", icon: "📚", count: articles.length, color: "#6366F1" } as const,
              ...categoryCounts,
            ].map(c => (
              <button key={c.key}
                onClick={() => setSelectedCategory(c.key as ArticleCategory | "all")}
                className="p-2.5 rounded-lg text-center transition-all"
                style={{
                  background: selectedCategory === c.key ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-alt)",
                  border: selectedCategory === c.key ? "1px solid var(--primary)" : "1px solid var(--border)",
                }}>
                <span className="block text-lg">{c.icon}</span>
                <span className="block text-[10px] mt-1 font-semibold" style={{ color: "var(--text)" }}>{c.label}</span>
                <span className="block text-lg font-bold" style={{ color: selectedCategory === c.key ? "var(--primary)" : "var(--muted)" }}>{c.count}</span>
              </button>
            ))}
          </div>

          {/* 搜索 + 新建 */}
          <div className="flex gap-3">
            <input className="input-field flex-1" placeholder="搜索知识库——标题、摘要、标签、正文..." value={search}
              onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              新建文章
            </button>
          </div>

          {/* 文章网格 */}
          {filtered.length === 0 ? (
            <div className="smart-card text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>暂无匹配的知识文章</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>试试换个关键词或分类筛选</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(a => {
                const cat = catDef(a.category);
                return (
                  <div key={a.id} className="smart-card group cursor-pointer"
                    style={{ borderColor: a.pinned ? cat.color : undefined }}
                    onClick={() => setSelectedArticle(a)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {a.pinned && <span className="text-xs" title="已置顶">📌</span>}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white shrink-0" style={{ background: cat.color }}>{cat.label}</span>
                        <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{a.title}</h3>
                      </div>
                      <span className="text-[10px] shrink-0 ml-2" style={{ color: "var(--muted)" }}>{a.updatedAt}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{a.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {a.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>{t}</span>
                        ))}
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--muted)" }}>{a.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧栏：筛选 + 建议 */}
        <div className="w-[320px] shrink-0 hidden lg:block space-y-4">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>

      {/* ===== 详情弹窗 ===== */}
      {selectedArticle && (() => {
        const cat = catDef(selectedArticle.category);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedArticle(null)}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-[720px] max-h-[85vh] overflow-y-auto p-6 rounded-xl shadow-2xl animate-fade-in"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: cat.color }}>{cat.label}</span>
                  <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{selectedArticle.title}</h2>
                  {selectedArticle.pinned && <span>📌</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => handleTogglePin(selectedArticle.id)}>
                    {selectedArticle.pinned ? "取消置顶" : "📌 置顶"}
                  </button>
                  <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => handleDelete(selectedArticle.id)}>🗑️ 删除</button>
                  <button className="btn btn-ghost text-xs px-2 py-1" onClick={() => setSelectedArticle(null)}>✕</button>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {selectedArticle.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--border)" }}>{t}</span>
                ))}
              </div>
              <p className="text-sm mb-4 p-3 rounded-lg" style={{ background: "var(--surface-alt)", color: "var(--text-secondary)", borderLeft: `3px solid ${cat.color}` }}>
                {selectedArticle.summary}
              </p>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {selectedArticle.content}
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-[10px]" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                <span>来源：{selectedArticle.source} · 作者：{selectedArticle.author}</span>
                <span>创建：{selectedArticle.createdAt} · 更新：{selectedArticle.updatedAt}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== 新建弹窗 ===== */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[560px] max-h-[85vh] overflow-y-auto p-6 rounded-xl shadow-2xl animate-fade-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4" style={{ color: "var(--text)" }}>📖 新建知识文章</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>标题</label>
                <input className="input-field" placeholder="文章标题..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>分类</label>
                  <select className="input-field" value={newCategory} onChange={e => setNewCategory(e.target.value as ArticleCategory)}>
                    {CATEGORIES.map(c => (<option key={c.key} value={c.key}>{c.icon} {c.label}</option>))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>来源</label>
                  <input className="input-field" placeholder="如：团队沉淀、行业报告..." value={newSource} onChange={e => setNewSource(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>标签（逗号分隔）</label>
                <input className="input-field" placeholder="如：小红书, 种草, SOP" value={newTags} onChange={e => setNewTags(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>摘要</label>
                <textarea className="input-field" rows={2} placeholder="一句话概括文章内容..." value={newSummary} onChange={e => setNewSummary(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text)" }}>正文（Markdown 格式）</label>
                <textarea className="input-field" rows={8} placeholder="支持 Markdown 格式：## 标题、- 列表、**粗体**..." value={newContent} onChange={e => setNewContent(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-outline" onClick={() => setShowNewModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreate}>保存文章</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
