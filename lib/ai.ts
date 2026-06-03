/**
 * Artic AI 分析工具库 — 封装 DeepSeek API 调用
 */

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

export interface AiResult {
  success: boolean;
  content: string;
  error?: string;
}

function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("artic-api-key");
}

export async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<AiResult> {
  const key = getApiKey();
  if (!key) {
    return { success: false, content: "", error: "未找到 API Key，请先在设置中配置" };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } })?.error?.message || `请求失败 (${res.status})`;
      return { success: false, content: "", error: msg };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { success: true, content };
  } catch {
    return { success: false, content: "", error: "网络连接失败，请检查网络后重试" };
  }
}

/* ==================== 各模块分析提示词 ==================== */

export const PROMPTS = {
  /** 运营节奏：分析月度活动安排 */
  rhythm(campaigns: { name: string; status: string; startDate: string; endDate: string }[], events: { title: string; platform: string; type: string; status: string; date: string }[], month: string) {
    const campList = campaigns.map(c => `- ${c.name} [${c.status}] ${c.startDate}~${c.endDate}`).join("\n");
    const evList = events.map(e => `- ${e.title} (${e.platform}/${e.type}) [${e.status}] ${e.date}`).join("\n");
    return {
      systemPrompt: "你是一位资深运营策略顾问。根据提供的活动列表和内容排期，分析运营节奏的合理性，指出潜在问题，并给出具体可执行的优化建议。使用中文，简洁直接，分点陈述。",
      userPrompt: `请分析以下 ${month} 的运营安排：\n\n【活动】\n${campList || "（无）"}\n\n【内容排期】\n${evList || "（无）"}\n\n请从以下维度分析：1. 活动密度是否合理 2. 内容类型是否多样化 3. 是否存在空档期 4. 优化建议`,
    };
  },

  /** 竞品追踪：对比分析 */
  competitor(competitors: { name: string; positioning: string; priceRange: string; channels: string; style: string }[]) {
    const list = competitors.map(c => `- ${c.name}：定位=${c.positioning}，价格=${c.priceRange}，渠道=${c.channels}，风格=${c.style}`).join("\n");
    return {
      systemPrompt: "你是一位资深商业分析师和竞品研究专家。根据提供的竞品信息，进行结构化对比分析，识别市场空白和差异化机会。使用中文，分点陈述。",
      userPrompt: `请分析以下竞品格局：\n\n${list}\n\n请输出：1. 各竞品核心优势 2. 市场空白与机会 3. 差异化策略建议`,
    };
  },

  /** 数据比对：解读 AB 测试 */
  abTest(stats: { meanA: number; meanB: number; liftPct: number; ratioSum: number; sampleA: number; sampleB: number }) {
    return {
      systemPrompt: "你是一位数据科学家。将统计数据翻译成业务语言，给出明确的行动建议。使用中文，简洁有力。",
      userPrompt: `AB 测试结果：A组均值=${stats.meanA.toLocaleString()}，B组均值=${stats.meanB.toLocaleString()}，提升=${stats.liftPct > 0 ? "+" : ""}${stats.liftPct.toFixed(1)}%，B/A比=${stats.ratioSum.toFixed(2)}，A组样本=${stats.sampleA}，B组样本=${stats.sampleB}。\n\n请给出：1. 结果解读 2. 是否建议采用B方案 3. 后续行动建议`,
    };
  },

  /** 知识库：文章摘要 */
  summarize(title: string, content: string) {
    return {
      systemPrompt: "你是一位专业的内容编辑。为给定的文章生成结构化摘要。使用中文，简洁清晰。",
      userPrompt: `请为以下文章生成摘要：\n\n标题：${title}\n\n正文：${content.slice(0, 3000)}\n\n请输出：1. 一句话总结 2. 3个关键要点 3. 适用场景`,
    };
  },
};
