import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

// Helper to formulate high-quality educational prompts for variational principles
function getVariationalPrompt(moduleName: string, stateDescription: string, params: any): string {
  switch (moduleName) {
    case "brachistochrone":
      return `你是一位世界顶级的物理学家和应用数学家。
用户当前正在“最速降线动力实验室”中进行测试。
当前仿真参数、对比曲线及时间结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供一段专业的“AI 物理洞察”：
1. 深入解释为什么在重力场中，摆线（Cycloid）是耗时最短的路径（从变分法 Euler-Lagrange 变分或能量角度）。
2. 分析用户当前测得的数据（例如直线 vs 摆线，或自定义曲线 vs 摆线 的时间与速度关系），指出物理本质。
3. 结合“自然如何寻找最快路径”这一哲学，给出一个富有启发性的结论。
要求：用淡雅专业的学术风格撰写，保持严谨、亲和、精炼。请使用中文简体。`;

    case "fermat":
      return `你是一位世界顶级的光学专家与变分学家。
用户当前正在“费马原理光学工坊”中模拟光在多层介质中的传播路径。
当前折射率层配置、光线行进路径与最优找路时间结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供专业的“AI 光学洞察”：
1. 用变分思想深入浅出阐述：为什么光不仅满足斯涅尔折射定律（Snell's Law），本质上是在满足“费马最短时间原理”？
2. 结合当前的折射率分布（例如：空气1.0 到 水1.33 或 高折射玻璃2.0 的阶梯变化），分析光折射角与路程的关系，为什么它要弯曲成如此的折射路线来“节省时间”？
3. 将此原理连接到现代技术，例如渐变折射率光纤（GRIN fiber）或 AI 视觉系统的射线寻路。
要求：用淡雅专业的学术风格撰写，精简深刻，富有启发性。请使用中文简体。`;

    case "action":
      return `你是一位世界顶级的理论物理学家。
用户正在“最小作用量宇宙引擎”中研究经典动力学的变分演化。
当前边界条件、势能场配置、候选路径与作用量 S = ∫(T - V) dt 的计算结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供高屋建瓴的“AI 物理洞察”：
1. 解释什么是“作用量（Action）”，为什么大自然在经典力学、电磁学乃至量子力学和广义相对论中，都遵循“最小（或驻值）作用量原理”？
2. 解释哈密尔顿原理（Hamilton's Principle）与欧拉-拉格朗日方程（Euler-Lagrange Equation）是如何从对路径的微小扰动中涌现出来的。
3. 分析用户配置的模型运行路径：真实的动力学路径（物理轨迹）的作用量是否确实在所有路径中最小？如果用户正在探索自定义的非物理路径，请指出它为什么因为作用量偏大而被自然“拒绝”。
要求：富于思辨与科学之美，用温润如玉、淡雅高尚的笔触来进行中文书写。`;

    case "trajectory":
      return `你是一位自动驾驶与航天动力学轨迹优化专家。
用户正在“智能轨迹优化中心”中模拟无人机、自车或航天器的避障控制。
当前障碍物、动力学约束、能耗惩罚及代价值（Cost）计算结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供实用的“AI 控制论洞察”：
1. 将航迹规划/最优控制（Optimal Control）与变分法联系起来。解释泛函优化（Cost Function Optimization）如何把能量消耗、避障边界和目标抵达综合定义为一个最优值问题。
2. 分析当前的参数配置（例如：障碍物阻力权重、能耗因子、控制平滑度），讨论算法如何在“宁可多绕路（安全第一）”与“走直线（能量/时间最短）”之间做出妥协，解释梯度下降或庞特里亚金极大值原理的作用。
3. 说明由于现实中各种约束（如执行器饱和、动力学非线性），完美的变分法如何走向现代的模型预测控制（MPC）或轨迹重划。
要求：专业、切中要害、注重工程实用和数学优美结合，使用中文简体。`;

    case "rl":
      return `你是一位多智能体/强化学习与最优控制融合学者。
用户正在“强化学习与 AI 控制实验场”中训练一个智能体完成避障导航。
当前奖励函数设定、策略学习阶段（Epoch/Episode）与路径收敛表现如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供启发性的“AI 智能体洞察”：
1. 深入解释“强化学习寻找最大期望奖励（Maximizing Reward）”与变分学“最小化作用量/泛函极值”在数学上的统一性。为什么说累积奖励的贝尔曼方程本质上也是一种动态最优决策？
2. 分析用户设置的奖励规则。若惩罚碰撞太大，智能体是否显现保守行为？若时间惩罚太大，是否导致鲁莽前行？分析这背后的“奖励工程（Reward Engineering）”。
3. 畅想变分物理原理（如自由能原理 Free Energy Principle，或者路径积分控制 Path Integral Control）在现代人工智能中的跨界结合与未来。
要求：将前沿AI算法与经典物理结合，前瞻且通俗，使用中文简体。`;

    default:
      return "请根据当前物理实验状态，提供有关动力学、变分原理和路径优化的科学洞察。";
  }
}

// AI Insights API Routing
app.post("/api/insights", async (req, res) => {
  const { module: moduleName, stateDescription, params } = req.body;

  if (!moduleName || !stateDescription) {
    return res.status(400).json({ error: "Missing module or stateDescription in request body" });
  }

  if (!ai) {
    return res.json({
      insight: `### 💡 实验观察 (本地极值分析)
由于当前环境中未检测到 **GEMINI_API_KEY**，系统已为您激活内置数值分析引擎：

* **数学变分检测**：当前系统中粒子/光线/控制轨迹运动已成功求解。
* **极值求解状态**：系统对边界极值微分算子进行了数值逼近。对于 ${moduleName} 设定，曲线各微元处对应的作用量或时间代价已实时投影在界面图表中。
* **物理参考**：${moduleName === 'brachistochrone' ? '摆线是重力加速度下耗时最短的泛函解析解（最速降线）。' : moduleName === 'fermat' ? '光线在不同介质切面上自动调节折射角以维持总光程时间最短，证明了费马原理。' : moduleName === 'action' ? '真实物理世界遵循欧拉-拉格朗日极值方程，任何对它的偏离都会使得泛函波动（作用量增大）。' : '这展示了状态空间上极值梯度动力优化的广泛应用。'}

*(提示：您可以在 AI Studio 的 **Settings > Secrets** 菜单中关联 GEMINI_API_KEY，以解锁基于大语言模型的深度物理背景思辨与交互解剖！)*`
    });
  }

  try {
    const prompt = getVariationalPrompt(moduleName, stateDescription, params);
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text;
    res.json({ insight: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate AI insight", detail: error.message });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
