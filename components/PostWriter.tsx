"use client";

import { useState, useEffect } from "react";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";

/* ==================== 类型 ==================== */

interface Platform {
  key: string; label: string; emoji: string;
  maxChars: number; hashtagStyle: string; tip: string;
}

interface ToneSpec {
  key: string; label: string; modifiers: string[];
  emoji: string;
}

interface ContentType {
  key: string; label: string; desc: string;
}

interface GeneratedPost {
  id: number;
  platform: string;
  contentType: string;
  tone: string;
  product: string;
  keywords: string;
  headline: string;
  body: string;
  hashtags: string;
  fullText: string;
  createdAt: string;
  saved: boolean;
}

/* ==================== 常量 ==================== */

const PLATFORMS: Platform[] = [
  { key: "xiaohongshu", label: "小红书", emoji: "📕", maxChars: 1000, hashtagStyle: "#关键词 ", tip: "标题≤20字，正文轻松口语化，多用Emoji分段，文末加3-5个标签" },
  { key: "douyin", label: "抖音", emoji: "🎵", maxChars: 500, hashtagStyle: "#话题 ", tip: "开头3秒抓眼球，口语化短句，配合画面节奏，结尾引导互动" },
  { key: "wechat", label: "公众号", emoji: "💬", maxChars: 2000, hashtagStyle: "", tip: "标题党技巧，结构化小标题，深度阅读排版，文末引导关注/在看" },
  { key: "weibo", label: "微博", emoji: "🐦", maxChars: 2000, hashtagStyle: "#话题# ", tip: "话题标签前置，140字以内核心信息，可用长图补充，转发抽奖效果好" },
  { key: "zhihu", label: "知乎", emoji: "🧠", maxChars: 3000, hashtagStyle: "", tip: "开头抛出问题或观点，结构化论证，干货密度高，引用数据/案例加分" },
  { key: "pengyouquan", label: "朋友圈", emoji: "👥", maxChars: 500, hashtagStyle: "", tip: "短小精悍，真实感第一，1-2张高质量配图，适当留白引发好奇" },
];

const CONTENT_TYPES: ContentType[] = [
  { key: "product", label: "产品种草", desc: "软性植入产品卖点，场景化描述引发购买欲" },
  { key: "knowledge", label: "干货分享", desc: "专业知识/技巧输出，建立权威感和信任度" },
  { key: "promo", label: "活动推广", desc: "促销/活动/直播预告，营造紧迫感和参与感" },
  { key: "brand", label: "品牌故事", desc: "品牌理念/创始人故事，建立情感连接" },
  { key: "case", label: "用户案例", desc: "用户真实使用反馈/前后对比，social proof" },
];

const TONES: ToneSpec[] = [
  { key: "humor", label: "幽默风趣", emoji: "😂", modifiers: ["笑死", "绝了", "谁懂啊", "家人们", "离谱", "真香", "破防了", "DNA动了"] },
  { key: "pro", label: "专业严谨", emoji: "🎓", modifiers: ["数据表明", "研究表明", "核心逻辑", "底层原理", "系统化", "深度拆解", "三个维度", "关键指标"] },
  { key: "warm", label: "温暖治愈", emoji: "🌿", modifiers: ["慢慢来", "没关系", "好好爱自己", "温柔", "陪伴", "小确幸", "治愈", "松弛感"] },
  { key: "sharp", label: "犀利吐槽", emoji: "🔥", modifiers: ["说真的", "别杠", "实话难听", "踩坑无数", "智商税", "割韭菜", "不惯着", "消费者不傻"] },
  { key: "literary", label: "文艺清新", emoji: "✨", modifiers: ["恰好", "温柔了岁月", "仪式感", "万物可爱", "人间值得", "风和日丽", "恰如其分", "不紧不慢"] },
  { key: "down2earth", label: "接地气", emoji: "🤙", modifiers: ["咱就是说", "一整个", "纯纯的", "属实", "真真儿的", "这也太", "yyds", "栓Q"] },
];

/* ==================== 模板引擎 ==================== */

function generateHeadline(product: string, tone: ToneSpec, platform: Platform, ct: ContentType): string {
  const t = tone.modifiers;
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const templates: Record<string, string[]> = {
    xiaohongshu: [
      `${pick(t)}！${product}真的${pick(["绝了","太香了","值得冲","是我的菜","挖到宝了"])}`,
      `${product}｜${pick(["用完直呼","后悔没早买","按头安利","无限回购","相见恨晚"])}`,
      `姐妹们！这个${product}${pick(t)}，${pick(["必须分享","忍不住了","藏不住了","给我冲"])}`,
    ],
    douyin: [
      `${pick(["你敢信","没想到","惊呆了","原来"])}${product}还可以这样？！`,
      `${product}到底值不值得买？${pick(["答案在这","3秒告诉你","看完再决定","我来帮你避坑"])}`,
      `${pick(t)}${product}——${pick(["我测了","用了30天","对比了10款","帮你们试过了"])}`,
    ],
    wechat: [
      `深度｜${product}：${pick(["从0到1","背后的逻辑","为什么火了","你不知道的事"])}`,
      `${pick(["2026","最新","全网首发","独家"])}｜${product}${pick(["完全指南","终极测评","深度复盘","万字解读"])}`,
      `${product}的${pick(["秘密","真相","底层逻辑","核心方法"])}，今天说透`,
    ],
    weibo: [
      `${pick(t)} ${product} ${pick(["快来看","速转","码住","收藏","转发抽奖"])}`,
      `#${product}# ${pick(["我宣布","这波","实锤了","太顶了","原地封神"])}`,
    ],
    zhihu: [
      `如何评价${product}？——${pick(["万字深度分析","从专业角度说说","拆解一下底层逻辑","聊聊我的真实体验"])}`,
      `${product}是不是智商税？${pick(["用数据说话","专业分析来了","聊聊真相","逐个拆解"])}`,
    ],
    pengyouquan: [
      `${pick(["今日份快乐","挖到宝了","忍不住分享","强推"])}：${product}`,
      `${product}，${pick(["用了才知道","真的好","相见恨晚","不多说了看图","懂得都懂"])}`,
    ],
  };

  const temps = templates[platform.key] || templates.xiaohongshu;
  return pick(temps);
}

function generateBody(
  product: string, keywords: string, tone: ToneSpec, platform: Platform, ct: ContentType
): string {
  const t = tone.modifiers;
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const kws = keywords.split(/[,，\s]+/).filter(Boolean);

  const introMap: Record<string, string[]> = {
    humor: [`${pick(t)}，今天必须来聊聊${product}。`, `我先说：${product}真的${pick(t)}！`, `谁还没用过${product}？不会就我一个吧？`],
    pro: [`关于${product}，我想从${pick(["三个维度","底层逻辑","核心指标","数据层面"])}来拆解。`, `聊${product}之前，先明确一个前提：`, `做${product}这些年，总结了以下几点：`],
    warm: [`前几天和${product}相处的日子里，慢慢发现……`, `其实${product}给我的感觉，就是${pick(t)}。`, `今天想温柔地说说${product}。`],
    sharp: [`说真的，${product}这玩意儿${pick(t)}。`, `${product}我用了大半年，有些实话必须说。`, `别被${product}的营销骗了，真实情况是这样的：`],
    literary: [`遇见${product}，恰好在${pick(["一个午后","微风的季节","阳光正好的时候","不早不晚"])}。`, `${product}，是生活中${pick(t)}的一部分。`],
    down2earth: [`咱就是说，${product}这个东西……`, `一整个被${product}${pick(t)}了。`, `关于${product}，我纯纯地想分享几点：`],
  };

  const bodyMap: Record<string, string[]> = {
    product: [
      `先说说最打动我的点：\n• ${product}的${pick(["外观设计","使用体验","核心功能","性价比"])}真的没话说\n• ${kws[0] || "效果"}方面，肉眼可见的变化\n• 用了之后明显感觉${kws[1] || "整体提升了一个档次"}`,
      `为什么推荐${product}？\n1️⃣ ${pick(["效果好到离谱","价格良心到哭","用了回不去","身边朋友都被我种草了"])}\n2️⃣ ${kws[0] ? `${kws[0]}真的是核心竞争力` : "细节做得很到位"}\n3️⃣ ${pick(["售后也靠谱","客服秒回","包装都有仪式感","复购率说明一切"])}`,
    ],
    knowledge: [
      `干货时间——关于${product}的三个核心认知：\n\n📌 第一：${kws[0] || "底层逻辑"}决定了80%的结果\n大多数人只关注表面，其实核心在于${pick(["系统化的方法论","持续的迭代优化","对细节的极致追求","把简单的事情做对"])}。\n\n📌 第二：${kws[1] || "执行层面"}的差距才是真正的护城河\n不是知道就够了，关键在${pick(["日复一日的坚持","每个环节的标准化","不断复盘和改进","把方法论落地"])}。\n\n📌 第三：${pick(["长期主义","用户视角","数据驱动","品质为王"])}才是正道`,
    ],
    promo: [
      `🔥 重磅消息！${product}活动来了！\n\n⏰ 时间：${pick(["限时3天","仅此一周","手慢无","即将截止"])}\n💰 力度：${pick(["全年最低","买一送一","限时5折","史低价"])}\n🎁 福利：${pick(["下单送好礼","前100名加赠","评论抽奖","邀请好友返现"])}\n\n${pick(["错过等一年","库存有限先到先得","这波不冲真的亏","犹豫就会败北"])}！`,
    ],
    brand: [
      `${product}的故事，要从${pick(["一个初心","一个洞察","一次偶然","一个痛点","无数次打磨"])}说起。\n\n${pick(["我们始终相信","坚持做难而正确的事","好产品自己会说话","慢就是快"])}。\n\n${kws[0] ? `在${kws[0]}这条路上，` : ""}我们走过了${pick(["无数个不眠之夜","上百次的推翻重来","从0到1的艰难探索","每个细节都不妥协"])}。\n\n${pick(["因为相信所以看见","做有温度的品牌","让用户成为最好的代言人","品质是最好的营销"])}。`,
    ],
    case: [
      `来看看真实用户的反馈——\n\n👤 @用户A：${pick(["用了3个月","坚持了30天","复购第5次","推荐给了全办公室"])}\n"${product}真的${pick(t)}，${pick(["效果肉眼可见","没想到这么好用","已经成为日常必备","后悔没早点用"])}"\n\n👤 @用户B：${pick(["对比了好几款","犹豫了很久终于入手","被朋友安利的","从对手那边转过来的"])}\n"${pick(["比我预期还好","用一次就回不去了","性价比之王","终于找到适合的了"])}"\n\n👤 @用户C：${pick(["忠实用户","铁粉","已经用了一年","无限回购中"])}\n"${pick(["品质一直在线","每次都有新惊喜","服务也超好","已经离不开"])}"`,
    ],
  };

  const intros = introMap[tone.key] || introMap.humor;
  const bodies = bodyMap[ct.key] || bodyMap.product;

  const outroMap: Record<string, string[]> = {
    humor: [`${pick(t)}，不说了，我去${pick(["继续用了","下单了","安利给下一波人了","回购了"])}！`],
    pro: [`总结：${product}值得${pick(["深入研究","系统学习","持续关注","认真对待"])}。欢迎交流讨论。`],
    warm: [`愿你和${product}的每一天，都${pick(t)} ❤️`],
    sharp: [`最后说一句：${pick(["理性消费","别盲目跟风","适合自己的才是最好的","多做功课少踩坑","把钱花在刀刃上"])}。`],
    literary: [`${pick(["时光清浅","万物有序","来日方长","慢慢来"])}，${product}在这里等你。`],
    down2earth: [`散会！${pick(["赶紧去试试","评论区见","有啥问题直接问","溜了溜了","别忘了点赞"])} 🤙`],
  };

  const outro = outroMap[tone.key] || outroMap.humor;
  return `${pick(intros)}\n\n${pick(bodies)}\n\n${pick(outro)}`;
}

function generateHashtags(product: string, keywords: string, platform: Platform, ct: ContentType): string {
  const ctTags: Record<string, string[]> = {
    product: ["好物分享", "种草", "爱用物", "开箱", "测评", "好物推荐"],
    knowledge: ["干货", "涨知识", "职场", "效率", "方法论", "深度思考"],
    promo: ["活动", "福利", "限时", "折扣", "优惠", "必买清单"],
    brand: ["品牌", "创始人", "创业", "品牌故事", "国货", "品质"],
    case: ["真实反馈", "买家秀", "用户体验", "口碑", "种草", "回购"],
  };

  const tags = ctTags[ct.key] || ctTags.product;
  const kws = keywords.split(/[,，\s]+/).filter(Boolean);
  const allTags = [...kws.map((k) => k.replace(/\s/g, "")), ...tags];

  if (platform.hashtagStyle.includes("#话题#")) {
    return allTags.slice(0, 4).map((t) => `#${t}#`).join(" ");
  }
  return allTags.slice(0, 5).map((t) => `#${t}`).join(" ");
}

/* ==================== 主组件 ==================== */

export default function PostWriter({ embedded }: { embedded?: boolean }) {
  const suggestion = getSkillForModule("content-center");

  const [platform, setPlatform] = useState<string>("xiaohongshu");
  const [contentType, setContentType] = useState<string>("product");
  const [tone, setTone] = useState<string>("humor");
  const [product, setProduct] = useState("");
  const [keywords, setKeywords] = useState("");

  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<GeneratedPost[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // 加载已保存的文案
  useEffect(() => {
    try {
      const saved = localStorage.getItem("artic-saved-posts");
      if (saved) setSavedPosts(JSON.parse(saved));
    } catch { }
  }, []);

  // 接收来自策略库的预填提示词
  const [strategyPrompt, setStrategyPrompt] = useState("");
  useEffect(() => {
    try {
      const prompt = localStorage.getItem("artic-strategy-post-prompt");
      if (prompt) {
        setStrategyPrompt(prompt);
        // 如果产品名为空，用策略提示词预填
        setProduct((prev) => prev || "");
        localStorage.removeItem("artic-strategy-post-prompt");
      }
    } catch { }
  }, []);

  const savePost = (post: GeneratedPost) => {
    const updated = [post, ...savedPosts].slice(0, 50);
    setSavedPosts(updated);
    localStorage.setItem("artic-saved-posts", JSON.stringify(updated));
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, saved: true } : p));
  };

  const deleteSaved = (id: number) => {
    const updated = savedPosts.filter((p) => p.id !== id);
    setSavedPosts(updated);
    localStorage.setItem("artic-saved-posts", JSON.stringify(updated));
  };

  const generate = () => {
    if (!product.trim()) { alert("请至少输入产品名称或主题"); return; }

    const p = PLATFORMS.find((x) => x.key === platform)!;
    const t = TONES.find((x) => x.key === tone)!;
    const ct = CONTENT_TYPES.find((x) => x.key === contentType)!;

    const newPosts: GeneratedPost[] = [];
    const usedHeadlines = new Set<string>();

    for (let i = 0; i < 3; i++) {
      let headline = generateHeadline(product, t, p, ct);
      let retry = 0;
      while (usedHeadlines.has(headline) && retry < 10) {
        headline = generateHeadline(product, t, p, ct);
        retry++;
      }
      usedHeadlines.add(headline);

      const body = generateBody(product, keywords, t, p, ct);
      const hashtags = generateHashtags(product, keywords, p, ct);
      const fullText = `${headline}\n\n${body}\n\n${hashtags}`.trim();

      newPosts.push({
        id: Date.now() + i,
        platform: p.label,
        contentType: ct.label,
        tone: t.label,
        product: product.trim(),
        keywords: keywords.trim(),
        headline,
        body,
        hashtags,
        fullText,
        createdAt: new Date().toISOString(),
        saved: false,
      });
    }

    setPosts(newPosts);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("✅ 已复制到剪贴板");
    }).catch(() => {
      // 降级方案
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("✅ 已复制到剪贴板");
    });
  };

  const activePlatform = PLATFORMS.find((x) => x.key === platform)!;
  const activeContentType = CONTENT_TYPES.find((x) => x.key === contentType)!;

  return (
    <div className={embedded ? "" : "animate-fade-in"}>
      {!embedded && (
        <>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>文案工坊</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            多平台文案生成器 · 选平台 → 定类型 → 挑语气 → 一键生成多版文案
          </p>
        </>
      )}

      <div className={embedded ? "" : "flex gap-6"}>
        <div className={embedded ? "space-y-4" : "flex-1 min-w-0 space-y-4"}>

          {/* 平台选择 */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>📱 选择平台</h3>
            <div className="grid grid-cols-6 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlatform(p.key)}
                  className="p-3 rounded-lg text-center transition-all border"
                  style={{
                    background: platform === p.key ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-alt)",
                    borderColor: platform === p.key ? "var(--primary)" : "var(--border)",
                  }}>
                  <div className="text-xl mb-1">{p.emoji}</div>
                  <div className="text-xs font-semibold" style={{ color: platform === p.key ? "var(--primary)" : "var(--text)" }}>{p.label}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--muted)" }}>{p.maxChars}字</div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{activePlatform.emoji} {activePlatform.label}</span>
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>· 建议 {activePlatform.maxChars} 字以内</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>💡 {activePlatform.tip}</p>
            </div>
          </div>

          {/* 内容类型 + 语气风格 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="smart-card">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>📝 内容类型</h3>
              <div className="space-y-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => setContentType(ct.key)}
                    className="w-full text-left p-3 rounded-lg transition-all border"
                    style={{
                      background: contentType === ct.key ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "var(--surface-alt)",
                      borderColor: contentType === ct.key ? "var(--primary)" : "var(--border)",
                    }}>
                    <div className="text-xs font-semibold" style={{ color: contentType === ct.key ? "var(--primary)" : "var(--text)" }}>{ct.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{ct.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="smart-card">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>🎭 语气风格</h3>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTone(t.key)}
                    className="p-3 rounded-lg text-center transition-all border"
                    style={{
                      background: tone === t.key ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface-alt)",
                      borderColor: tone === t.key ? "var(--primary)" : "var(--border)",
                    }}>
                    <div className="text-lg">{t.emoji}</div>
                    <div className="text-xs font-semibold" style={{ color: tone === t.key ? "var(--primary)" : "var(--text)" }}>{t.label}</div>
                    <div className="text-[9px] mt-0.5 truncate" style={{ color: "var(--muted)" }}>{t.modifiers.slice(0, 3).join(" ")}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 策略库预填提示 */}
          {strategyPrompt && (
            <div className="smart-card animate-fade-in" style={{ borderColor: "#F59E0B", background: "color-mix(in srgb, #F59E0B 4%, transparent)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>策略库联动</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "color-mix(in srgb, #F59E0B 12%, transparent)", color: "#F59E0B" }}>已预填</span>
                </div>
                <button className="text-[10px]" style={{ color: "var(--muted)" }} onClick={() => setStrategyPrompt("")}>✕ 清除</button>
              </div>
              <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {strategyPrompt}
              </p>
              <button
                className="text-[10px] mt-2 px-2 py-0.5 rounded transition-all"
                style={{ background: "var(--primary)", color: "#fff" }}
                onClick={() => {
                  setProduct(`${strategyPrompt.split("\n")[0].replace("[策略框架] ", "").slice(0, 60)}`);
                  setKeywords("策略驱动");
                }}>
                一键填入主题
              </button>
            </div>
          )}

          {/* 输入区 */}
          <div className="smart-card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>✏️ 输入主题</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>产品名称 / 主题 *</label>
                <input
                  className="input-field"
                  placeholder="例如：氨基酸洁面乳、智能手表X1、瑜伽私教课..."
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>关键词（逗号分隔）</label>
                <input
                  className="input-field"
                  placeholder="例如：保湿、温和、敏感肌可用、回购..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
                />
              </div>
              <button
                className="w-full py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{ background: "var(--primary)", color: "#fff" }}
                onClick={generate}
              >
                🚀 生成文案（3 版）
              </button>
            </div>
          </div>

          {/* 生成结果 */}
          {posts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>📄 生成结果</h3>
                <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>
                  {activePlatform.emoji} {activePlatform.label} · {activeContentType.label} · {TONES.find((t) => t.key === tone)?.label}
                </span>
              </div>

              {posts.map((post, i) => (
                <div key={post.id} className="smart-card animate-fade-in relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{
                      background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                      color: "var(--primary)",
                    }}>
                      版本 {i + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        className="text-[10px] px-2.5 py-1 rounded transition-all"
                        style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                        onClick={() => {
                          if (editingId === post.id) { setEditingId(null); }
                          else { setEditingId(post.id); setEditingText(post.fullText); }
                        }}>
                        {editingId === post.id ? "完成编辑" : "编辑"}
                      </button>
                      <button
                        className="text-[10px] px-2.5 py-1 rounded transition-all"
                        style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                        onClick={() => copyToClipboard(post.fullText)}>
                        复制
                      </button>
                      <button
                        className="text-[10px] px-2.5 py-1 rounded transition-all"
                        style={{
                          background: post.saved ? "var(--surface-alt)" : "var(--primary)",
                          color: post.saved ? "var(--muted)" : "#fff",
                          border: post.saved ? "1px solid var(--border)" : "none",
                        }}
                        onClick={() => savePost(post)}
                        disabled={post.saved}>
                        {post.saved ? "已保存" : "保存"}
                      </button>
                    </div>
                  </div>

                  {editingId === post.id ? (
                    <textarea
                      className="input-field w-full min-h-[200px] text-xs font-mono leading-relaxed"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                  ) : (
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                      <p className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>{post.headline}</p>
                      <div className="text-xs leading-relaxed whitespace-pre-wrap mb-2" style={{ color: "var(--text-secondary)" }}>{post.body}</div>
                      <p className="text-[11px]" style={{ color: "var(--primary)" }}>{post.hashtags}</p>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-[9px]" style={{ color: "var(--muted)" }}>
                    <span>{post.platform}</span>
                    <span>·</span>
                    <span>{post.contentType}</span>
                    <span>·</span>
                    <span>{post.tone}</span>
                    <span>·</span>
                    <span>约 {post.fullText.length} 字</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 已保存文案 */}
          {savedPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>💾 已保存文案 ({savedPosts.length})</h3>
              {savedPosts.slice(0, 10).map((post) => (
                <div key={post.id} className="smart-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{post.headline.slice(0, 40)}...</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>
                        {post.platform} · {post.tone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="text-[10px] px-2 py-0.5 rounded"
                        style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                        onClick={() => copyToClipboard(post.fullText)}>复制</button>
                      <button className="text-[10px] px-2 py-0.5 rounded"
                        style={{ border: "1px solid #EF444420", color: "#EF4444" }}
                        onClick={() => deleteSaved(post.id)}>删除</button>
                    </div>
                  </div>
                  <p className="text-[10px] whitespace-pre-wrap line-clamp-2" style={{ color: "var(--muted)" }}>
                    {post.body.slice(0, 120)}...
                  </p>
                </div>
              ))}
              {savedPosts.length > 10 && (
                <p className="text-[10px] text-center" style={{ color: "var(--muted)" }}>仅显示最近 10 条，共 {savedPosts.length} 条</p>
              )}
            </div>
          )}
        </div>

        {!embedded && (
          <SmartSuggestionCard suggestion={suggestion} />
        )}
      </div>
    </div>
  );
}
