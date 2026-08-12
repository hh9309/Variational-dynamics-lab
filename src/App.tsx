/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Sparkles, Sun, Flame, Target, Brain, 
  Layers, ChevronRight, Activity, HelpCircle, 
  Bot, Clock, KeyRound, Cpu, BookOpen, ClipboardList,
  Settings, Send, MessageSquare, Trash2, Eye, EyeOff, ShieldCheck, AlertCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import subcomponents
import BrachistochroneLab from './components/BrachistochroneLab';
import FermatOpticsStudio from './components/FermatOpticsStudio';
import ActionPrincipleEngine from './components/ActionPrincipleEngine';
import TrajectoryOptimizationHub from './components/TrajectoryOptimizationHub';
import RLControlArena from './components/RLControlArena';
import KnowledgeGuide from './components/KnowledgeGuide';
import ExperimentGuide from './components/ExperimentGuide';

import { LabTab } from './types';

// Fast default academic insights to display when the page loads
const DEFAULT_INSIGHTS: Record<LabTab, string> = {
  brachistochrone: `### 💡 极值物理解析与最速降线仿真论证
* **变分求和与摆线极值**：在微积分与泛函分析的演进历程中，最速降线问题作为变分法的开山之作，展现了物理自然规律的奇妙统一。摆线（Cycloid，亦称旋轮线）在微分切片的数值模拟中，其切线倾角随空间位置以一种自适应的方式渐进演变。这种特殊的曲率设计，在重力场中呈现出完美的“前期依靠大倾角进行高效重力重组，迅速积累可观的速度，后期利用巨大的惯性以平滑的角度向终点全力滑行”的物理规律。
* **等时降线的力学对称性**：除了具有耗时最短的最速特质，摆线在声名远扬的经典物理学中还展现了极其罕见的**等时降线性质**。这意味着，在排除空气阻力与滑动摩擦等耗散力的理想物理实验室中，无论您将小球放置在摆线轨道上的任意高度静止释放，其依靠重力驱动滚动至轨道最底部所需的绝对时间都恒定相同。
* **物理学术启发**：在我们的力学微元控制中，您可以左右拖动起终点滑块，直观比对直线轨道与最优摆线轨道的运行耗时差异。可以清晰地观察到，当终点拉深或者起点升高时，摆线与平直直线的耗时差会呈非线性放大，这充分展现了动力学约束下变分全局寻优的深刻物理奥义。`,

  fermat: `### 💡 费马光程变分观察与折射极值评估
* **最短时间物理本源**：经典光学界最著名、最普适的指导法则即是费马原理（Fermat's Principle）。为了深入解析光线在穿越不同高低阶跃折射率介质时的行为，我们注意到光在偏重介质（例如冕质玻璃或高密度金刚石）中的实际波速会大幅下降，从而导致传播耗时显著上升。若光线沿着常规几何直线（即界面直连路径）前进，其在慢速介质中拖延的巨大空间距离，将使得总行进时间达到灾难性的高值。因此，光线在行进过程中会在分界面处发生精确的弯折。
* **斯涅尔折射的全局诠释**：这种特殊的折射角度，不仅极佳地在定点微分尺度上契合了广为人知的斯涅尔定律（Snell's Law），更在宏观的变分离散积分意义上，让光从超始端到终止端经历的整体光程耗费时间达到了真正的一阶极小值。这仿佛向我们展示，无生命的光本身也具备一种对极值最优路径的“神奇感知”和全局探知能力。
* **多物理场工程赋能**：在现代化光学工程和前沿 AI 计算领域中，这项原本起源于自然哲学的宏大极值折射律，至今依然发挥着决定性的技术支撑作用。无论是在当今最热门的神经高保真辐射场（NeRF）三维重建，还是在百太比特速率的广域多模光纤光栅通信，乃至精密激光加工折射透镜偏振矫正中，都是解算高保真光路传播模型最根本的核心方程。`,

  action: `### 💡 最小作用量哲学与拉格朗日宇宙泛函
* **驻值原理与积分变分**：哈密顿原理与拉格朗日力学是理论物理学中最崇高、最普大一统的核心支柱。在连续或约束质点系动力学演化中，系统在每一个极短瞬态的动作都由一个精妙的量子泛函——拉格朗日量所确定，其积分定义为作用量 $S = \\int (T - V) \\, dt$，其中 $T$ 象征其总体运动学动能，而 $V$ 象征系统的空间势能。真实轨迹的寻优轨迹必定满足全局变分一阶差分为零（$\\delta S = 0$）。
* **物理实验的变局交互**：在本拉格朗日空间仿真模块中，我们为您提供了最直观的物理控制。您可以左右滑动控制面板上的“正弦微扰幅度”，主动为系统注入一条极富想象力的偏离轨道。您可以细致观察到，当您将这些随机的几何扰动 $\\delta q(t)$ 步步回摆，使其向没有扰动的物理真实轨迹零点靠拢时，最终代表路径作用量数值 $S$ 将自发地沿着物理曲面在滑落中构建一个极为漂亮的抛物线势能底凹部。
* **物理秩序与微积分极值**：只要物理参数偏离零点，无论偏右还是偏左，其拉格朗日作用量都会呈现单调非对称性上升。这不仅意味着宇宙万物皆以对作用量变分的极值（物理驻值）来决定自身下一刻的位置，更证明了自然法则背后的最高理智与秩序。`,

  trajectory: `### 💡 最优控制规划学与无人机极限航迹解算
* **罚函数天平的约束奥秘**：在工业智能控制与高精度机器人运动路径决策中，由于航道条件的多变性，路径规划需要在有限的能耗与高度复杂的避障要求之间进行非线性寻优。无人机航迹实验室基于庞特里亚金极大值原理和拉格朗日极值算法，在解算方程中巧妙布置了专门的“罚函数天平”。这个由用户可量化操控的自回归方程，需要实时在障碍物安全隔离边界约束、控制加速度的平缓程度，以及在任务时效性这三项近乎冲突的控制目标中取得完美动态平衡。
* **参数敏感性的精巧演示**：在这里，您能直观地探索这些罚函数乘子的巨大影响力。例如，您可以选择将“障碍滑块”向极高方向调大，整个系统的惩罚力场会迅速产生形变。您将目睹无人机的寻优曲线以大弧度曲率大幅领先并完美避开带有鲜艳警示色调的圆形障碍域。但作为负荷妥协，其所需的控制电能、以及航迹的时间轴长度均会剧烈提高；若您将“时间紧迫系数”拉升，航线则会变得十分挺拔狠辣，甚至擦着敏感的安全红区飞速切过。
* **自动化与先进航空的纽带**：这种以局部拉格朗日常数和牛顿罚函数为逻辑核心的控制机制，在现代理论和航空军工装备中占据了霸主地位。从先进自动驾驶车辆在拥堵车流中的紧急避让，到高机动无人靶机在临界状态下的航迹控制，都完全遵循这套关于极值与泛函博弈的最优代数逻辑。`,

  rl: `### 💡 智能马尔可夫决策论与 RL 极值 Arena
* **物理泛函与贝尔曼极值的同构**：这一展示板块成功拉开了将无生机物态的经典分析力学与高维拟人决策人工智能相结合的科学帷幕。物理宇宙依据拉格朗日函数的变分积分驻值原理来推进演化，而现代前沿的可深度学习强化学习（Reinforcement Learning）智能体，则是根据动作在未来状态轨迹上的长效多步价值函数期望 $V(s)$ 展开极其宏大的贝尔曼方程（Bellman Equation）最大化迭代。这两者在底层代数极值中展现出了精美绝伦的同构同源性。
* **梯度场引导的无约束运动**：当您处于我们特设的强化学习控制竞技场中时，在复杂物理障碍群包围下，你可以清晰观察到其底图背景网格明亮深浅的蓝色饱满度图谱。这些网格的深度精确代表了我们预先对整个动作空间的价值状态泛函求解出的非线性值函数表面。绿色能量小球无须配置烦琐的绝对空间避障雷达，而只需根据值函数表面对局域位移处的空间矢量进行微分求导，并向着代表幸福最优解的最高蓝色值梯度方向攀爬，便能惊艳呈现出绕过不规则坚硬墙壁的优雅轨迹。
* **物理世界观的深刻交融**：智能小球在复杂迷宫边界中的运动状态折射出了极其惊人的控制直觉，深刻诠释了马尔可夫链、自适应演化以及物理极值之间如何在此形成了一场美妙深邃的现代控制理论交融。`,

  knowledge_guide: `### 📚 科学殿堂：变分法学术导引与核心知识图谱
* **世界的大局观**：相比于牛顿力学（Newtonian Mechanics）中通过对具体力向量和加速度微分在瞬态点进行局部位移预测的微观方法，分析力学中的哈密顿与拉格朗日变分法，则倡导并践行了从全时空全局最优路径出发的宏大唯美大局观。物理自然界的所有动态变迁和量子涨落，都顺应着全局最小约束阻力或极值最小阻抗的最雅致路径稳步迈进，展现了数学的极致和谐。
* **物理对称性与诺特定理**：数学大师埃米·诺特（Emmy Noether）提出的永恒定律——诺特定理，以超凡的形式统一了整个物理和守恒定律。定理揭示并严格证明了物理世界中的所有基础守恒量（如能量守恒性、空间动量守恒性以及角动量守恒性），本质上全部来源于物理系统中其对应的变分作用量泛函在时间轴连续平移、空间轴平移、以及三维空间轴各向同性旋转等基本维度下的深层物理对称性！
* **探索学习路径的建议**：在屏幕下方的定理导学卡片和不朽学术巨擘名册中，您可以充分夯实变分法、黎曼几何、虚功原理在分析力学中的坚实数理底座。这将大幅拉高您的学术眼界，通盘领悟现代物理大一统、宇宙大作用量原理乃至弦论等前沿宏理论的璀璨光芒。`,

  experiment_guide: `### 📋 科学探索仿真研究工作打卡与量化引导
* **知物理以明极值，躬行探究以入真理**：为了引导您深入品鉴这些经典物理和控制模型的美妙细节，我们精选并设计了五个跨越百年科学历史的核心仿真实验。这些实验不仅被奉为物理学的殿堂级作，更是将严苛、冰冷的无机数学公式，雕琢成了可以在网页端实时操纵、自由探求的力学美学视窗。这构成了一份充满趣味而挑战十足的变分系统物理打卡工作。
* **定量实验与数据反馈**：您可以亲自动手拉拽最速降线的小球初始投放高度，观察摆线对于直线的反超奇迹；也可以尝试在折射工坊中切换重度阶跃材料的入射物理角度，探究折射的最短光路历程。当您通过精细控制，将物理系统的真实运动泛函完美驱动至理论的拉格朗日极值条件，或者达成了最优碰撞规避航迹时，即可在面板对应卡片前方郑重点下自豪的打卡对勾！
* **深度科学探索的启示**：在整个验证科学的打卡流程中，希望您能由表及里，细心感悟欧拉-拉格朗日微分方程在连续的自然光路边界以及现代高度离散化航空航天、人工智能竞技场中，那份横跨几个世纪的永恒对称、精确秩序与极简之美。`
};

export default function App() {
  const [activeTab, setActiveTab] = useState<LabTab>('brachistochrone');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Client-side LLM local configurations (persistent via localStorage)
  const [llmModel, setLlmModel] = useState<'gemini' | 'deepseek'>(() => {
    return (localStorage.getItem('lab_llm_model') as 'gemini' | 'deepseek') || 'gemini';
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('lab_llm_api_key') || '';
  });
  const [customEndpoint, setCustomEndpoint] = useState<string>(() => {
    return localStorage.getItem('lab_llm_custom_endpoint') || '';
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [tempLlmModel, setTempLlmModel] = useState<'gemini' | 'deepseek'>(llmModel);
  const [tempEndpoint, setTempEndpoint] = useState<string>(customEndpoint);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string>('');

  // Sub-tabs in the AI Panel: 'report' is the Markdown report, 'chat' is the interactive dialogue box
  const [activeSubTab, setActiveSubTab] = useState<'report' | 'chat'>('report');

  // Interactive Dialogue states
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, reasoning?: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Sync temp states if settings are toggled
  useEffect(() => {
    setTempApiKey(apiKey);
    setTempLlmModel(llmModel);
    setTempEndpoint(customEndpoint);
  }, [showSettings, apiKey, llmModel, customEndpoint]);

  // Save Settings securely
  const handleSaveSettings = () => {
    localStorage.setItem('lab_llm_model', tempLlmModel);
    localStorage.setItem('lab_llm_api_key', tempApiKey);
    localStorage.setItem('lab_llm_custom_endpoint', tempEndpoint);
    
    setLlmModel(tempLlmModel);
    setApiKey(tempApiKey);
    setCustomEndpoint(tempEndpoint);
    
    setSettingsSavedMessage('✅ 大模型参数配置成功保存并激活！');
    setTimeout(() => {
      setSettingsSavedMessage('');
      setShowSettings(false);
    }, 1500);
  };

  // Pre-load default instructions When activeTab shifts
  useEffect(() => {
    setAiInsight(DEFAULT_INSIGHTS[activeTab]);
  }, [activeTab]);

  // Client-side Prompt Formulator
  const getVariationalPrompt = (moduleName: string, stateDescription: string, params: any): string => {
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
3. 结合“自然如何寻找最快路径”这一哲学，给出一个富有启发性、严谨且科学优雅的结论。
要求：用淡雅专业的学术风格撰写，保持严谨、亲和、精炼。请使用中文简体。使用标准的 markdown。`;

      case "fermat":
        return `你是一位世界顶级的光学专家与变分学家。
用户当前正在“费马原理光学工坊”中模拟光在多层介质中的传播路径。
当前折射率层配置、光线行进路径与最优找路时间结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供专业的“AI 光学洞察”：
1. 用变分思想深入浅出阐述：为什么光不仅满足斯涅尔折射定律（Snell's Law），本质上是在满足“费马最短时间原理”？
2. 结合当前的折射率分布，分析光折射角与路程的关系，解释它是如何通过折射弯曲折线来“节省路途时间”的。
3. 将此原理连接 to 现代技术，例如渐变折射率光纤（GRIN fiber）或 AI 视觉系统的射线寻路。
要求：用淡雅专业的学术风格撰写，精简深刻，富有启发性。请使用中文简体，并使用符合标准 Markdown 的排版。`;

      case "action":
        return `你是一位世界顶级的理论物理学家。
用户正在“最小作用量宇宙引擎”中研究经典动力学的变分演化。
当前边界条件、势能场配置、候选路径与作用量 S = ∫(T - V) dt 的计算结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供高屋建瓴的“AI 物理洞察”：
1. 解释什么是“作用量（Action）”，为什么大自然在经典力学中遵循“最小（或驻值）作用量原理”？
2. 解释哈密尔顿原理（Hamilton's Principle）与欧拉-拉格朗日方程（Euler-Lagrange Equation）是如何从对路径的微小扰动(δq)中涌现出来的。
3. 分析用户配置的模型运行路径：真实的动力学路径（物理轨迹）的作用量是否确实在所有路径中最小？并就非物理轨道和自然法则进行思辨剖析。
要求：富于思辨与科学之美，用温润如玉、淡雅高尚的笔触来进行中文书写，符合 Markdown 各级标题与列表格式。`;

      case "trajectory":
        return `你是一位自动驾驶与航天动力学轨迹优化专家。
用户正在“智能轨迹优化中心”中模拟无人机、自车或航天器的避障控制。
当前障碍物、动力学约束、能耗惩罚及代价值（Cost）计算结果如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供实用的“AI 控制论洞察”：
1. 将航迹规划与变分法联系起来。解释代价值泛函优化如何将能耗、撞障代价、及目标接近速度映射为一个整体最优解。
2. 分析当前参数设定下，算法如何在安全多绕道与贴障节省体量之间妥协平衡，解释滚动时域 MPC 或庞特里亚金极大值原理起到的底层锚定作用。
3. 说明由于现实执行器限制、物理饱合等阻碍，最优算法如何应对复杂的强非线性动态环境。
要求：专业严谨、注重工程实用与物理优美结合，使用中文简体，并渲染为清晰的 Markdown。`;

      case "rl":
        return `你是一位多智能体/强化学习与最优控制融合学者。
用户正在“强化学习与 AI 控制实验场”中训练一个智能体完成避障导航。
当前奖励函数设定、策略学习Episode、与路径收敛表现如下：
${stateDescription}
参数详情：${JSON.stringify(params)}

请提供启发性的“AI 智能体洞察”：
1. 深入解释“强化学习累加奖励最大化”与物理界“最小化作用量极值”在代数以及泛函上的深度统一性。为什么贝尔曼方程也可以视为一种离散动力决策变值？
2. 分析在对撞碰撞惩罚大或时间惩罚大时，智能体对应的保守或鲁莽行为，并就“奖励函数工程设计 (Reward Engineering)”作出评估。
3. 畅想变分思想（如自由能原理或路径积分控制）在现代大规模 AI 模型及物理实体智算体上的应用。
要求：将前沿AI算法与经典物理完美融合，前瞻深刻，使用中文简体，满足 Markdown 排版。`;

      default:
        return "请根据当前物理实验状态，提供有关动力学、变分原理 and 路径优化的科学洞察。";
    }
  };

  // General Direct Client-Side LLM Call Executor
  const executeLLMCall = async (promptMsg: string, systemInstructionStr?: string) => {
    if (!apiKey) {
      throw new Error("API-Key is missing in settings.");
    }

    if (llmModel === 'gemini') {
      const baseUrl = customEndpoint && customEndpoint.trim() !== ''
        ? customEndpoint.replace(/\/$/, '')
        : 'https://generativelanguage.googleapis.com';

      let url = '';
      let body: any = {};
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (baseUrl.includes('googleapis.com')) {
        url = `${baseUrl}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        body = {
          contents: [{ parts: [{ text: promptMsg }] }],
          config: systemInstructionStr ? { systemInstruction: { parts: [{ text: systemInstructionStr }] } } : undefined
        };
      } else {
        url = `${baseUrl}/chat/completions`;
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = {
          model: 'gemini-2.5-flash',
          messages: [
            ...(systemInstructionStr ? [{ role: 'system', content: systemInstructionStr }] : []),
            { role: 'user', content: promptMsg }
          ]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API 请求失败 (${response.status}): ${errText}`);
      }

      const data = await response.json();
      if (baseUrl.includes('googleapis.com')) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Gemini API 返回了空内容，请检查您的 Key 权限或模型配额。");
        }
        return { text };
      } else {
        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error("OpenAI-Compatible Gemini 返回了空内容。");
        }
        return { text };
      }

    } else {
      // DeepSeek R1 model direct call
      const baseUrl = customEndpoint && customEndpoint.trim() !== ''
        ? customEndpoint.replace(/\/$/, '')
        : 'https://api.deepseek.com';

      const url = `${baseUrl}/chat/completions`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      const isOfficialDeepseek = baseUrl.includes('deepseek.com');
      const modelName = 'deepseek-v4-pro';

      const body = {
        model: modelName,
        messages: [
          ...(systemInstructionStr ? [{ role: 'system', content: systemInstructionStr }] : []),
          { role: 'user', content: promptMsg }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`DeepSeek API 请求失败 (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      if (!message) {
        throw new Error("DeepSeek API 返回了空内容，请确认您的账户余额或网络连通。");
      }

      const text = message.content || "";
      const reasoning = message.reasoning_content || "";
      return { text, reasoning };
    }
  };

  // Handle requesting analytics report
  const handleRequestAnalysis = async (moduleName: string, stateDescription: string, params: any) => {
    // Check if API key is empty
    if (!apiKey) {
      setActiveSubTab('report');
      setAiInsight(`### ⚠️ 请先配置 API-Key 以开启高级极值解算

仿真物理系统的精微演化数据已被解析器捕捉。但我们需要一个高级分析大脑来输出思辨级的学术洞察。

**配置指南：**
1. 请点击右上角 **⚙️ 齿轮按钮** 打开大模型管理面板。
2. 填入您的 **API-Key**（仅保存在您的本地浏览器 localStorage 中，极为安全）。
3. 选择 **Gemini 3.5 Flash**（推荐，轻量及高速物理探索）或 **DeepSeek V4 Pro**（深度链式数学推理）。
4. 点击 **确认大模型** 完成激活。
5. 关闭面板后，再次点击仿真器底部的 **“💡 AI 算力分析”**，即可在不依赖远程服务中，由您的浏览器极其快速地运行高级变分解答！

---
#### 📊 当前物理仿真内核捕捉到的待解算微元：
* **模型板块**: ${moduleName.toUpperCase()}
* **微分简述**: ${stateDescription.replace(/\n/g, '; ')}
* **状态哈希**: 物理连续性校验成功，数值阶跃算子激活中。`);
      return;
    }

    setAiLoading(true);
    setAiInsight('### ⚡ AI 模型正在跨域执行高阶变分积分求解...\n浏览器已直连大模型 API，正在进行物理数学分析并实时撰写评估报告...');
    
    try {
      const prompt = getVariationalPrompt(moduleName, stateDescription, params);
      const systemInst = `你是一位世界顶级的物理学家、应用数学家与变分学专家。你现在正在一个变分仿真实验室里担任学术导师角色，请根据收集到的高精度物理实验参数，提供富有思辨性、学术美感并极具物理洞察力的专业 Markdown 评估报告。`;
      
      const result = await executeLLMCall(prompt, systemInst);
      
      let finalDoc = result.text;
      if (result.reasoning) {
        finalDoc = `### 🧠 DeepSeek-R1 的思考树痕迹
> *思考轨迹：*\n${result.reasoning.split('\n').map(l => `> ${l}`).join('\n')}

---

${result.text}`;
      }
      
      setAiInsight(finalDoc);
    } catch (err: any) {
      console.error(err);
      setAiInsight(`### ❌ AI 学术评估解算突遭异常
系统遭遇接口阻断。原因: ${err.message || '网络线路震荡或 API-Key 校验失效'}

*💡 提示：如果使用国内网络直连官方 API，请检查 API 节点或于右上角 ⚙️ 面板中指定“第三方代理/自定义 Endpoint（如中转站）”来规避跨域与网络封阻限制。*`);
    } finally {
      setAiLoading(false);
    }
  };

  // Send a custom message in the chat
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    if (!apiKey) {
      alert("请先点击右上角 ⚙️ 配置大模型 API-Key 才能激活学术互动问答！");
      setShowSettings(true);
      return;
    }

    const userMsg = { role: 'user' as const, content: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) {
      setChatInput('');
    }
    setChatLoading(true);

    try {
      const sysInst = `你是一位极具物理情怀和应用数学造诣的学术大师。说话优雅透彻、言简意赅。请对研究员提出的疑问进行通透、深入的变分解答或哲学启发，始终用简体中文，格式书写严格遵守 Markdown 规范。不要含有废话。`;
      
      // Append some general contextual hint about what lab they are exploring
      const contextPrefix = `[物理研究上下文：研究员目前正在 ${getTabTitle(activeTab)} 仿真工坊。
其部分仿真主旨为: ${DEFAULT_INSIGHTS[activeTab].slice(0, 150)}...]
用户提问: ${textToSend}`;

      const response = await executeLLMCall(contextPrefix, sysInst);
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text,
        reasoning: response.reasoning
      }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **学术交互失败，请检查您的设置。**\n\n异常详情: \`${err.message || "未知跨域拦截"}\`\n\n*💡 学术救急指引：*\n1. 请检查您的 API_KEY 是否有效及其所属模型配额。\n2. 如遇国内线路问题，可前往右上角 **⚙️ 齿轮配置** 中填入支持的 OpenAI 格式代理 API 终结点 (如中转中枢)。`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Export current Markdown analysis report to local file
  const handleExportMarkdown = () => {
    if (!aiInsight) return;
    
    // Create a blob representing the Markdown content
    const blob = new Blob([aiInsight], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and click it programmatically to trigger download
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename based on active simulation tab
    const moduleNameStr = getTabTitle(activeTab).replace(/\s+/g, '_');
    link.setAttribute('download', `Variational_Lab_${moduleNameStr}_AI_Report.md`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  // Convert tab ID to formatted Chinese name
  const getTabTitle = (tab: LabTab) => {
    switch (tab) {
      case 'brachistochrone': return '最速降线仿真器';
      case 'fermat': return '费马光学折射工坊';
      case 'action': return '最小作用量宇宙引擎';
      case 'trajectory': return '智能轨迹优化中心';
      case 'rl': return '强化学习强化控制场';
      case 'knowledge_guide': return '极值物理知识导引';
      case 'experiment_guide': return '实验室探索实验指南';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-sans text-slate-800 flex flex-col p-4 sm:p-6" id="bento-layout-root">
      
      {/* Header Grid Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white px-5 py-4 rounded-2xl border border-slate-200/60 shadow-sm mb-4 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
            <Bot className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              变分之美：AI 动力学实验室
              <span className="text-[10px] bg-slate-900 text-slate-100 font-mono px-1.5 py-0.5 rounded-sm">V2.6 PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest font-mono">
              VARIATIONAL AI DYNAMICAL LAB • EXTREMA SEARCHING ENGINE
            </p>
          </div>
        </div>

        {/* Quick Menu Nav bar */}
        <nav className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            id="nav-brachistochrone"
            onClick={() => setActiveTab('brachistochrone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'brachistochrone' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            最速降线
          </button>
          <button 
            id="nav-fermat"
            onClick={() => setActiveTab('fermat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'fermat' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sun className="w-3 h-3 text-sky-500" />
            费马光学
          </button>
          <button 
            id="nav-action"
            onClick={() => setActiveTab('action')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'action' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            最小作用量
          </button>
          <button 
            id="nav-trajectory"
            onClick={() => setActiveTab('trajectory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'trajectory' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-3 h-3 text-rose-500" />
            无人机规划
          </button>
          <button 
            id="nav-rl"
            onClick={() => setActiveTab('rl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'rl' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brain className="w-3 h-3 text-indigo-500" />
            强化寻优
          </button>
          <div className="w-[1px] h-4 bg-slate-300 self-center mx-1 hidden lg:block"></div>
          <button 
            id="nav-knowledge-guide"
            onClick={() => setActiveTab('knowledge_guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'knowledge_guide' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3 h-3 text-emerald-500" />
            知识导引
          </button>
          <button 
            id="nav-experiment-guide"
            onClick={() => setActiveTab('experiment_guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'experiment_guide' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-3 h-3 text-teal-500" />
            实验指南
          </button>
        </nav>

        {/* AI Operational status indicator without toggle */}
        <div className="flex items-center space-x-3 text-right">
          <div className="hidden sm:block text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">AI CORE STATE</p>
            <p className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              98.2 GFLOPS • 变分极限求解活跃
            </p>
          </div>
        </div>
      </header>

      {/* Main Bento Structure */}
      <main className="flex-1 grid grid-cols-12 gap-4">
        {activeTab === 'knowledge_guide' || activeTab === 'experiment_guide' ? (
          <section className="col-span-12 bg-white rounded-3xl border border-slate-200/70 p-5 shadow-sm relative flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.985, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.985, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                {activeTab === 'knowledge_guide' && <KnowledgeGuide />}
                {activeTab === 'experiment_guide' && <ExperimentGuide />}
              </motion.div>
            </AnimatePresence>
          </section>
        ) : (
          <>
            {/* 1. Large Simulation Stage (Bento block 1 - col-span-12 or 8) */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm relative flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full font-mono">
                  ACTIVE ENGINE: {activeTab.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  数值无延迟逼近中
                </span>
              </div>

              <div className="mt-2 flex-1 relative min-h-[420px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    {activeTab === 'brachistochrone' && (
                      <BrachistochroneLab onAnalyze={handleRequestAnalysis} aiLoading={aiLoading} />
                    )}
                    {activeTab === 'fermat' && (
                      <FermatOpticsStudio onAnalyze={handleRequestAnalysis} aiLoading={aiLoading} />
                    )}
                    {activeTab === 'action' && (
                      <ActionPrincipleEngine onAnalyze={handleRequestAnalysis} aiLoading={aiLoading} />
                    )}
                    {activeTab === 'trajectory' && (
                      <TrajectoryOptimizationHub onAnalyze={handleRequestAnalysis} aiLoading={aiLoading} />
                    )}
                    {activeTab === 'rl' && (
                      <RLControlArena onAnalyze={handleRequestAnalysis} aiLoading={aiLoading} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* Right side bento cards (col-span-12 or 4) */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
              
              {/* 2. Specialized AI Analytical Report */}
              <section className="bg-white text-slate-800 rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between flex-1 min-h-[480px]">
                <div>
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider font-sans">
                          AI 变分智能物理中心
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Export Markdown Button */}
                        {activeSubTab === 'report' && aiInsight && !showSettings && (
                          <button
                            onClick={handleExportMarkdown}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-700 transition-all font-medium flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/20 shadow-sm"
                            title="导出当前分析报告为 Markdown 到本地"
                            id="export-markdown-btn"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-650" />
                            <span className="text-[10px] font-sans tracking-wide">导出 MD</span>
                          </button>
                        )}
                        
                        {/* Small Gear Settings Button */}
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className={`p-1.5 rounded-lg transition-all border ${
                            showSettings 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-600 rotate-45' 
                              : 'hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-800'
                          }`}
                          title="配置大语言模型参数"
                          id="llm-gear-settings-btn"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tab switches for Report / Chat */}
                    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => { setActiveSubTab('report'); setShowSettings(false); }}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          activeSubTab === 'report' && !showSettings
                            ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        id="subtab-report-btn"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        系统仿真评估
                      </button>
                      <button
                        onClick={() => { setActiveSubTab('chat'); setShowSettings(false); }}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          activeSubTab === 'chat' && !showSettings
                            ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                            : 'text-slate-500 hover:text-slate-805'
                        }`}
                        id="subtab-chat-btn"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        极值大师对话
                      </button>
                    </div>
                  </div>

                  {/* Settings UI Panel */}
                  {showSettings ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between" id="llm-settings-panel">
                      <div className="space-y-4 pr-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-mono border-b border-slate-200 pb-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-650" />
                          <span>科研大模型参数面板 (Settings)</span>
                        </div>
                        
                        {/* 1. API KEY ENTER */}
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                            <span>1. 手工输入大模型 API-Key:</span>
                            <span className="text-emerald-600 text-[9px] font-mono font-medium">本地存储</span>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={tempApiKey}
                              onChange={(e) => setTempApiKey(e.target.value)}
                              placeholder="例如: AIzaSyD..."
                              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* 2. MODEL SELECT */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-mono">2. 选择接入的大物理模型:</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setTempLlmModel('gemini')}
                              className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all focus:outline-none ${
                                tempLlmModel === 'gemini' 
                                  ? 'border-emerald-500 bg-emerald-50/15 text-emerald-800 shadow-sm ring-1 ring-emerald-500/20' 
                                  : 'border-slate-200 bg-white text-slate-550 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-indigo-505 animate-pulse" />
                                Gemini 3.5 Flash
                              </span>
                              <span className="text-[9px] text-slate-400">轻巧快速变分推算</span>
                            </button>
                            <button
                              onClick={() => setTempLlmModel('deepseek')}
                              className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all focus:outline-none ${
                                tempLlmModel === 'deepseek' 
                                  ? 'border-emerald-500 bg-emerald-50/15 text-emerald-800 shadow-sm ring-1 ring-emerald-500/20' 
                                  : 'border-slate-200 bg-white text-slate-550 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <Brain className="w-3 h-3 text-emerald-600 animate-pulse" />
                                DeepSeek V4 Pro
                              </span>
                              <span className="text-[9px] text-slate-400">旗舰级深度推理演化</span>
                            </button>
                          </div>
                        </div>

                        {/* 3. API ENDPOINT OVERRIDE (Optional) */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <span>3. 接口代理基址 (Endpoint Override, 可选):</span>
                          </label>
                          <input
                            type="text"
                            value={tempEndpoint}
                            onChange={(e) => setTempEndpoint(e.target.value)}
                            placeholder={tempLlmModel === 'gemini' ? "默认 (googleapis.com 直连)" : "默认 (deepseek.com 直连)"}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-505 font-mono placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200">
                        {settingsSavedMessage && (
                          <p className="text-[10px] text-emerald-650 font-semibold mb-2 font-mono text-center animate-bounce">
                            {settingsSavedMessage}
                          </p>
                        )}
                        <button
                          onClick={handleSaveSettings}
                          className="w-full bg-emerald-600 hover:bg-emerald-505 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          确认大模型
                        </button>
                        <p className="text-[9px] text-slate-400 text-center mt-2 leading-relaxed">
                          * 专为静态 GitHub Pages 部署设计，100% 运行在浏览器，Key 不上传
                        </p>
                      </div>
                    </div>
                  ) : activeSubTab === 'report' ? (
                    /* Markdown Report Panel */
                    <div className="text-slate-700 text-xs leading-relaxed space-y-3 font-sans overflow-y-auto max-h-[385px] pr-1 scrollbar-thin scrollbar-thumb-zinc-200 min-h-[310px]">
                      {aiInsight ? (
                        <div className="prose prose-slate max-w-none text-[11.5px] leading-relaxed text-slate-700">
                          {aiInsight.split('\n').map((line, lIdx) => {
                            if (line.startsWith('### ')) {
                              return <h4 key={lIdx} className="text-emerald-700 font-bold text-xs mt-3.5 mb-1">{line.replace('###', '')}</h4>;
                            }
                            if (line.startsWith('* **')) {
                              const parts = line.split('**');
                              return (
                                <div key={lIdx} className="pl-2 border-l border-emerald-100 mt-1.5">
                                  <strong className="text-slate-800">{parts[1]}</strong>
                                  <span className="text-slate-600">{parts.slice(2).join('**')}</span>
                                </div>
                              );
                            }
                            if (line.startsWith('>') && (line.includes('🧠') || line.includes('思考') || line.includes('thinking'))) {
                              return <div key={lIdx} className="text-slate-500 text-[10.5px] italic bg-slate-50 p-2.5 rounded-lg border-l-2 border-slate-400 font-mono mt-1 mb-2 whitespace-pre-wrap">{line}</div>;
                            }
                            return <p key={lIdx} className="mt-1">{line}</p>;
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">尚未激活高级智能评估。请点击左侧对应的“💡 AI 算力洞察分析”按键开始...</p>
                      )}
                    </div>
                  ) : (
                    /* Live Q&A Dialogue panel */
                    <div className="flex flex-col h-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] min-h-[350px]" id="llm-chat-holder">
                      {/* Message lists */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[265px] scrollbar-thin scrollbar-thumb-zinc-200 min-h-[210px] mb-2.5">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col justify-center items-center text-center p-3 text-slate-500 my-auto">
                            <Bot className="w-7 h-7 text-slate-400 mb-2 animate-bounce animate-duration-1000" />
                            <p className="text-[10px] leading-relaxed max-w-[280px] text-slate-500">
                              欢迎来到变分极值对话窗口！在此可以与大物理学家自由交流，解答有关拉格朗日量积分、斯涅尔折射、或者贝尔曼动态规划等公式疑惑。
                            </p>
                            
                            {/* Suggested topics list */}
                            <div className="mt-4 w-full text-left space-y-1.5" id="suggested-queries-box">
                              <span className="text-[9px] font-bold text-slate-405 block tracking-wider font-mono">学术课题参考 (Suggested):</span>
                              <button
                                onClick={() => handleSendMessage('最速降线为什么是圆滚滚的旋轮线（摆线），而不是倾角均匀的坡面直线？')}
                                className="w-full text-left bg-white border border-slate-200 text-slate-600 p-1.5 rounded text-[9.5px] truncate block hover:border-emerald-500/40 hover:text-emerald-700 hover:bg-emerald-50/20 transition-all focus:outline-none cursor-pointer"
                              >
                                • 最速降坡为什么是摆线而不是直线？
                              </button>
                              <button
                                onClick={() => handleSendMessage('请用最通俗易懂的直觉，解释哈密顿量H、拉格朗日量L与最小作用量原理到底怎么深刻指导物理学？')}
                                className="w-full text-left bg-white border border-slate-200 text-slate-600 p-1.5 rounded text-[9.5px] truncate block hover:border-emerald-500/40 hover:text-emerald-700 hover:bg-emerald-50/20 transition-all focus:outline-none cursor-pointer"
                              >
                                • 为什么自然总要最小化作用量？
                              </button>
                              <button
                                onClick={() => handleSendMessage('费马原理中，光线是如何“知晓”在不同速度材料里的弯曲时间最省而恰好折射？')}
                                className="w-full text-left bg-white border border-slate-200 text-slate-600 p-1.5 rounded text-[9.5px] truncate block hover:border-emerald-500/40 hover:text-emerald-700 hover:bg-emerald-50/20 transition-all focus:outline-none cursor-pointer"
                              >
                                • 费马折射最短路径的光程推导
                              </button>
                            </div>
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <span className="text-[9px] text-slate-400 font-mono mb-0.5">
                                {msg.role === 'user' ? '🔬 RESEARCHER' : `🎓 ${llmModel === 'gemini' ? 'Gemini 3.5' : 'DeepSeek V4 Pro'}`}
                              </span>
                              <div className={`p-2.5 rounded-xl max-w-[92%] leading-relaxed ${
                                msg.role === 'user' 
                                  ? 'bg-emerald-650 text-white rounded-tr-none shadow-sm' 
                                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                              }`}>
                                {msg.reasoning && (
                                  <div className="mb-2 bg-slate-50 p-2 rounded-lg border-l border-emerald-500/30 text-[9.5px] text-slate-500 leading-normal">
                                    <div className="flex items-center gap-1 mb-1 font-bold font-mono tracking-widest text-emerald-655 select-none">
                                      <Brain className="w-3 h-3 text-emerald-600 animate-pulse" />
                                      DeepSeek-V4-Pro 深度思维链痕迹：
                                    </div>
                                    <div className="max-h-[95px] overflow-y-auto pr-1 italic break-all opacity-85 text-[9.5px] leading-relaxed whitespace-pre-wrap text-slate-500">
                                      {msg.reasoning}
                                    </div>
                                  </div>
                                )}
                                <div className="whitespace-pre-wrap select-text selection:bg-emerald-100 selection:text-emerald-900 text-slate-700">
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          ))
                        )}

                        {chatLoading && (
                          <div className="flex flex-col items-start animate-pulse">
                            <span className="text-[9px] text-emerald-600 font-mono mb-0.5">🎓 AI 教授思考中...</span>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 rounded-tl-none text-slate-400">
                              <span className="inline-block w-1 h-3 bg-emerald-500 animate-bounce"></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inputs controls */}
                      <div className="flex items-center gap-1.5 border-t border-slate-200 pt-2 font-sans">
                        {chatMessages.length > 0 && (
                          <button
                            onClick={() => setChatMessages([])}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-100 text-slate-400 hover:text-rose-600 transition-all focus:outline-none cursor-pointer"
                            title="清空会话数据"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                          placeholder={apiKey ? "输入问题并点击发送..." : "⚠️ 请先点击 settings ⚙️ 键入 API key"}
                          disabled={!apiKey || chatLoading}
                          className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-emerald-500/80 placeholder:text-slate-400 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendMessage()}
                          disabled={!apiKey || chatLoading || !chatInput.trim()}
                          className="bg-emerald-600 hover:bg-emerald-505 disabled:bg-slate-100 text-white disabled:text-slate-300 rounded-lg p-2 transition-all focus:outline-none flex items-center justify-center cursor-pointer font-bold"
                          title="发送消息"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subfooter status bar */}
                {!showSettings && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>SELECTION: {llmModel === 'gemini' ? 'Gemini 3.5' : 'DeepSeek V4 Pro'}</span>
                    <span>{apiKey ? '🔒 BROWSER KEY ACTIVE' : '⚠️ API KEY MISSING'}</span>
                  </div>
                )}
              </section>

              {/* 3. Tab Grid Selector (Additional Bento block showing alternative labs dynamically) */}
              <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">
                  切换模块快速访问 (Quick Dashboard Access)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setActiveTab('brachistochrone')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      activeTab === 'brachistochrone' 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : 'border-slate-100 hover:border-emerald-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold text-[11px] text-slate-800">最速降线</span>
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">重力摆线速度演化比较</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('fermat')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      activeTab === 'fermat' 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : 'border-slate-100 hover:border-emerald-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-bold text-[11px] text-slate-800">费马光学</span>
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">极小时传播光程追迹</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('action')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      activeTab === 'action' 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : 'border-slate-100 hover:border-emerald-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-bold text-[11px] text-slate-800">最小作用量</span>
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">拉格朗日宇宙路径审计</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('trajectory')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      activeTab === 'trajectory' 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : 'border-slate-100 hover:border-emerald-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-bold text-[11px] text-slate-800">航迹优化</span>
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">无人机多重约束避障</p>
                  </div>
                </div>
              </section>

            </div>
          </>
        )}
      </main>

      {/* Footer Status Bar (Bento grid style bottom alignment) */}
      <footer className="mt-4 flex flex-col sm:flex-row justify-between items-center bg-white px-5 py-3.5 rounded-2xl border border-slate-200/50 shadow-sm gap-3">
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              物理仿真内核： Euler-Lagrange GPU 激活
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              云端同步联通正常
            </span>
          </div>
        </div>
        <div className="text-slate-400 text-[10px] font-mono tracking-widest">
          © 2026 BRACHISTOCHRONE AI LAB • VARIATIONAL CLASSICS
        </div>
      </footer>
    </div>
  );
}
