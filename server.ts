import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini API client (lazy initialization)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instruction for Brachistochrone & Calculus of Variations Physics Expert
const SYSTEM_INSTRUCTION = `你是一位精通理论力学、变分法（Calculus of Variations）、经典力学历史与数理建模的顶级物理学教授与 AI 导师。
你的核心任务是协助用户理解“最速降线问题（Brachistochrone Problem）”、欧拉-拉格朗日方程（Euler-Lagrange Equation）、费马光学折射类比、旋轮线（Cycloid）、等时降落（Tautochrone）以及各类工程变形案例（如摩擦力、地球重力隧道、摆线摆、滑雪跳台等）。

请遵循以下指导原则：
1. 语言表达：使用简体中文，文风严谨、清晰、通俗透彻且不失数学优美度。
2. 数学公式：使用标准的 LaTeX 格式（行内用 $...$，独立行用 $$...$$）。
3. 理论与直觉结合：在给出严密变分推导（如 Beltrami 恒等式）的同时，提供直观的物理图像（例如为什么前期快速加速比走直线更能节省时间）。
4. 诊断支持：当用户提供轨道参数（如起点、终点、摩擦系数 $\\mu$、不同路径时间）时，精准分析误差原因，并给出优化建议。`;

// AI Chat Endpoint
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback local rule-based physics response if API key is not configured
      const fallbackReply = generateFallbackPhysicsReply(message);
      return res.json({ text: fallbackReply, isFallback: true });
    }

    // Build context prompt
    let fullPrompt = "";
    if (context) {
      fullPrompt += `【当前实验室物理环境上下文】:\n- 起点坐标: (${context.startX ?? 0}, ${context.startY ?? 0}) m\n- 终点坐标: (${context.endX ?? 10}, ${context.endY ?? 8}) m\n- 重力加速度 g: ${context.g ?? 9.8} m/s²\n- 摩擦系数 μ: ${context.mu ?? 0}\n- 当前选择案例: ${context.activeCaseName ?? "经典两点最速降线"}\n\n`;
    }

    if (history && Array.isArray(history) && history.length > 0) {
      fullPrompt += "【历史对话记录】:\n";
      history.slice(-4).forEach((h: { role: string; content: string }) => {
        fullPrompt += `${h.role === "user" ? "用户" : "导师"}: ${h.content}\n`;
      });
      fullPrompt += "\n";
    }

    fullPrompt += `【用户问题】: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "无法生成回复，请稍后重试。";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Provide a graceful fallback physics explanation
    const fallbackReply = generateFallbackPhysicsReply(req.body.message || "");
    res.json({
      text: fallbackReply + "\n\n*(提示: 已由内置物理变分法知识引擎生成)*",
      isFallback: true,
      error: error?.message,
    });
  }
});

// AI Path Diagnosis Endpoint
app.post("/api/ai/diagnose", async (req: Request, res: Response) => {
  try {
    const { start, end, curvesData, mu, g } = req.body;
    const ai = getGeminiClient();

    const diagnosisPrompt = `请对以下最速降线实验室沙盒数据进行详细的物理与变分法诊断分析：
- 起点 $A$: (${start?.x}, ${start?.y}) m, 终点 $B$: (${end?.x}, ${end?.y}) m
- 重力加速度 $g$: ${g} m/s², 动摩擦因数 $\\mu$: ${mu}
- 各曲线下滑时间实测数据:
${curvesData?.map((c: any) => `  * ${c.name}: 下滑时间 = ${c.time?.toFixed(4)} s, 终点速度 = ${c.finalVelocity?.toFixed(3)} m/s, 弧长 = ${c.arcLength?.toFixed(3)} m`).join("\n")}

请从以下三方面给出诊断：
1. **时间差分析**：摆线（最速降线）相较于直线、抛物线和圆弧线的加速优势与时间节省率；
2. **物理机制解析**：前期大倾角“先蓄速”如何克服较长的几何路径；
3. **参数/工程建议**：若引入摩擦力 $\\mu=${mu}$ 或在实际滑道设计中的优化改进建议。`;

    if (!ai) {
      const fallbackDiagnosis = `### 🔬 变分法物理沙盒诊断报告
1. **时间性能评估**：
   - 摆线路径在此两点间表现最优（时间约 ${curvesData?.[0]?.time?.toFixed(3) || "1.42"} s），比直线快约 15%~25%。
   - 核心在于：直线虽然几何距离最短（$L = \\sqrt{\\Delta x^2 + \\Delta y^2}$），但前期速度慢；摆线初始倾角接近垂直，使重力势能快速转化为动能 $v=\\sqrt{2gy}$，全程平均速度极高。

2. **变分极值特征**：
   - 满足贝尔特拉米恒等式 $y[1+(y')^2] = 2r$，在全域内泛函 $\\delta T[y] = 0$。

3. **摩擦力与实际修正建议**：
   - 当存在摩擦系数 $\\mu=${mu}$ 时，理论最速降线会比无摩擦时略微平缓，其参数方程需引入 $\\cos\\phi - \\mu\\sin\\phi$ 修正项。`;
      return res.json({ text: fallbackDiagnosis });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: diagnosisPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    res.json({ text: response.text || "诊断生成完成。" });
  } catch (error: any) {
    console.error("Gemini Diagnose Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Fallback physics knowledge engine
function generateFallbackPhysicsReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("直线") && (q.includes("短") || q.includes("快"))) {
    return `### 为什么直线距离最短，但最速降线却是摆线？

这是经典物理学中最具启发性的问题之一：

1. **几何最短 $\\neq$ 时间最短**：
   下滑时间泛函为：
   $$T[y] = \\int_0^{x_2} \\frac{\\sqrt{1+(y')^2}}{\\sqrt{2gy}} \\, dx$$
   - **直线**：路径虽短（$ds$ 最小），但坡度均匀，小球在前半段处于低速状态，导致整体平均速度较小；
   - **摆线（旋轮线）**：初始段斜率极大（接近垂直下落），重力势能迅速转化为动能 $v = \\sqrt{2gy}$。虽然几何弧长较长，但由于小球在绝大部分路程中保持了极高的瞬时速度，从而大幅缩短了总时间。

2. **变分法数学证明**：
   根据欧拉-拉格朗日方程推导的贝尔特拉米恒等式：
   $$y(1 + y'^2) = 2r$$
   其唯一解析解即为旋轮线（摆线）：
   $$x = r(\\theta - \\sin\\theta), \\quad y = r(1 - \\cos\\theta)$$`;
  }

  if (q.includes("费马") || q.includes("光学") || q.includes("折射")) {
    return `### 约翰·伯努利的光学费马原理巧妙解法 (1696)

1696 年，约翰·伯努利借用**费马最短时间原理（Fermat's Principle）**给出了惊艳全欧洲的几何解法：

1. **光速与速度场的类比**：
   光在非均匀介质中传播时，局部光速与介质折射率成反比。
   小球在重力场中的速度满足 $v(y) = \\sqrt{2gy}$，等价于光穿行于折射率 $n(y) = \\frac{c}{v(y)} = \\frac{c}{\\sqrt{2gy}}$ 的连续梯度光学介质中。

2. **斯涅尔折射定律连续化**：
   根据斯涅尔定律（Snell's Law）：
   $$\\frac{\\sin\\alpha}{v} = \\text{常数} = C$$
   其中 $\\alpha$ 为光线切线与竖直法线的夹角。
   由几何关系 $\\sin\\alpha = \\frac{dx}{ds} = \\frac{1}{\\sqrt{1 + (y')^2}}$，代入得到：
   $$\\frac{1}{\\sqrt{2gy} \\sqrt{1 + (y')^2}} = C \\implies y[1 + (y')^2] = \\frac{1}{2gC^2} = 2r$$
   这直接导出了摆线的微分方程！无需繁琐的微积分变分，纯凭跨学科物理直觉一击即中。`;
  }

  if (q.includes("等时") || q.includes("tautochrone") || q.includes("惠更斯")) {
    return `### 摆线的等时降落特性（Tautochrone Property）

摆线不仅是“最速降线”，还具有神奇的**等时性（Isochronism）**：

1. **物理现象**：
   在倒置的摆线轨道上，无论小球从轨道的何种高度（无论是接近谷底还是靠近顶端）由静止释放，到达最低点所需的时间**完全相同**！
   $$T = \\pi \\sqrt{\\frac{r}{g}}$$

2. **直观解释**：
   - 释放点越高，小球滚过的距离越长，但因为初始高度更大，获得的加速度和下落速度也成比例增大，距离的增加与速度的提升**完美抵消**；
   - 惠更斯（Christiaan Huygens）在 1673 年利用此原理设计了“摆线钟”，摆锤在摆线挡板约束下摆动，使其周期严格与摆角振幅无关，彻底消除了普通单摆的大角度周期误差。`;
  }

  return `### 最速降线与变分法原理概要

1. **变分法核心**：寻求使泛函 $J[y] = \\int_{x_1}^{x_2} L(x, y, y') dx$ 取极值的函数 $y(x)$，其必要条件是满足欧拉-拉格朗日方程：
   $$\\frac{\\partial L}{\\partial y} - \\frac{d}{dx}\\left(\\frac{\\partial L}{\\partial y'}\\right) = 0$$

2. **贝尔特拉米恒等式（Beltrami Identity）**：
   当拉格朗日量 $L$ 不显含自变量 $x$ 时，存在第一积分：
   $$L - y' \\frac{\\partial L}{\\partial y'} = C$$
   应用于最速降线拉格朗日量 $L = \\sqrt{\\frac{1+y'^2}{2gy}}$，立即得到摆线方程 $y(1+y'^2) = 2r$。

您可以尝试在左侧沙盒中拖拽调整起终点，或者点击各个案例查看物理演播！`;
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Brachistochrone Lab Server running on port ${PORT}`);
  });
}

startServer();
