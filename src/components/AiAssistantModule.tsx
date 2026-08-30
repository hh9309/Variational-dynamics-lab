import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, SandboxConfig, CurvePhysicsData } from "../types";
import {
  BotMessageSquare,
  Send,
  Sparkles,
  X,
  RotateCcw,
  User,
  Zap,
  HelpCircle,
  Stethoscope,
  Settings,
  Key,
  Cpu,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Globe,
  Sliders,
} from "lucide-react";

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  config: SandboxConfig;
  curves: CurvePhysicsData[];
  initialPrompt?: string;
}

type SupportedModel = "gemini-3-flash" | "deepseek-v4-pro";

const MODEL_INFO: Record<
  SupportedModel,
  {
    displayName: string;
    tag: string;
    description: string;
    apiEndpointPlaceholder: string;
    defaultBaseUrl: string;
  }
> = {
  "gemini-3-flash": {
    displayName: "Gemini 3 Flash",
    tag: "Google DeepMind",
    description: "多模态高速数学物理引擎，擅长变分法推导、泛函极值分析与几何图像构建",
    apiEndpointPlaceholder: "https://generativelanguage.googleapis.com",
    defaultBaseUrl: "https://generativelanguage.googleapis.com",
  },
  "deepseek-v4-pro": {
    displayName: "DeepSeek-V4-Pro",
    tag: "DeepSeek Reasoning",
    description: "深度数理逻辑与物理方程求解模型，支持深度链式思考与复杂微积分降阶",
    apiEndpointPlaceholder: "https://api.deepseek.com",
    defaultBaseUrl: "https://api.deepseek.com",
  },
};

const PRESET_QUESTIONS = [
  "为什么直线路径最短，但最速降线是摆线？",
  "如何直观理解费马光学折射原理推导最速降线？",
  "如果有滑动摩擦力 μ，最速降线方程会变成什么样？",
  "为什么摆线具有等时降落特性 (Tautochrone)？",
  "地球重力隧道中，为什么内摆线比直线穿行更快？",
];

const SYSTEM_INSTRUCTION = `你是一位精通理论力学、变分法（Calculus of Variations）、经典力学历史与数理建模的顶级物理学教授与 AI 导师。
你的核心任务是协助用户理解“最速降线问题（Brachistochrone Problem）”、欧拉-拉格朗日方程（Euler-Lagrange Equation）、费马光学折射类比、旋轮线（Cycloid）、等时降落（Tautochrone）以及各类工程变形案例（如摩擦力、地球重力隧道、摆线摆、滑雪跳台等）。

请遵循以下指导原则：
1. 语言表达：使用简体中文，文风严谨、清晰、通俗透彻且不失数学优美度。
2. 数学公式：使用标准的 LaTeX 格式（行内用 $...$，独立行用 $$...$$）。
3. 理论与直觉结合：在给出严密变分推导（如 Beltrami 恒等式）的同时，提供直观的物理图像（例如为什么前期快速加速比走直线更能节省时间）。
4. 诊断支持：当用户提供轨道参数（如起点、终点、摩擦系数 μ、不同路径时间）时，精准分析误差原因，并给出优化建议。`;

export const AiAssistantModule: React.FC<AiAssistantProps> = ({
  isOpen,
  onClose,
  config,
  curves,
  initialPrompt,
}) => {
  // Model & API Key Settings State with LocalStorage persistence
  const [selectedModel, setSelectedModel] = useState<SupportedModel>(() => {
    return (localStorage.getItem("brachistochrone_llm_model") as SupportedModel) || "gemini-3-flash";
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("brachistochrone_llm_apikey") || "";
  });
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => {
    return localStorage.getItem("brachistochrone_llm_baseurl") || "";
  });

  // Temp state for settings modal
  const [tempModel, setTempModel] = useState<SupportedModel>(selectedModel);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [tempBaseUrl, setTempBaseUrl] = useState<string>(customBaseUrl);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [apiKeyMissingNotice, setApiKeyMissingNotice] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `您好！我是您的**变分法与最速降线 AI 物理导师**。

请在右上角 **⚙️ 设置** 中输入您的 **API-Key** 并选择 **Gemini 3 Flash** 或 **DeepSeek-V4-Pro** 模型。

我可以为您：
1. **推导变分公式**：深入拆解欧拉-拉格朗日方程、贝尔特拉米恒等式与费马光学折射原理；
2. **解答直觉疑难**：探讨为什么直线不是最快、等时降落的本质；
3. **实时沙盒诊断**：分析当前实验场中的下滑时间差距并提供物理优化建议。

您可以点击下方快捷问题，或者直接输入您的疑问！`,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Open settings modal and sync temp state
  const handleOpenSettings = () => {
    setTempModel(selectedModel);
    setTempApiKey(apiKey);
    setTempBaseUrl(customBaseUrl);
    setIsSettingsOpen(true);
    setSaveSuccessNotice(false);
  };

  // Confirm and Save Model Configuration
  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = tempApiKey.trim();
    setSelectedModel(tempModel);
    setApiKey(cleanKey);
    setCustomBaseUrl(tempBaseUrl.trim());

    localStorage.setItem("brachistochrone_llm_model", tempModel);
    localStorage.setItem("brachistochrone_llm_apikey", cleanKey);
    localStorage.setItem("brachistochrone_llm_baseurl", tempBaseUrl.trim());

    setSaveSuccessNotice(true);
    setApiKeyMissingNotice(false);
    setTimeout(() => {
      setIsSettingsOpen(false);
      setSaveSuccessNotice(false);
    }, 900);
  };

  // Direct Browser-side LLM Call (Supports static GitHub deployment)
  const callLlmDirect = async (promptText: string): Promise<string> => {
    if (selectedModel === "gemini-3-flash") {
      // Call Google Gemini API directly from browser
      const baseUrl = customBaseUrl || "https://generativelanguage.googleapis.com";
      const modelEndpoint = `${baseUrl.replace(/\/+$/, "")}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const historyFormatted = messages.slice(-4).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const requestBody = {
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          ...historyFormatted,
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(modelEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson?.error?.message || `Gemini API 请求失败 (HTTP ${response.status})`
        );
      }

      const resData = await response.json();
      return (
        resData?.candidates?.[0]?.content?.parts?.[0]?.text || "未能生成回答，请重试。"
      );
    } else {
      // Call DeepSeek-V4-Pro API (OpenAI Compatible)
      const baseUrl = customBaseUrl || "https://api.deepseek.com";
      const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

      const formattedMessages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...messages.slice(-4).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
        { role: "user", content: promptText },
      ];

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat", // DeepSeek standard model identifier
          messages: formattedMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson?.error?.message || `DeepSeek API 请求失败 (HTTP ${response.status})`
        );
      }

      const resData = await response.json();
      return (
        resData?.choices?.[0]?.message?.content || "未能生成回答，请重试。"
      );
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    // Check if API Key is configured
    if (!apiKey.trim()) {
      setApiKeyMissingNotice(true);
      handleOpenSettings();
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    const contextPrompt = `【沙盒环境上下文】: 起点(0,0), 终点(${config.endX}m, ${config.endY}m), g=${config.gravity}m/s², μ=${config.friction}。\n【用户问题】: ${query}`;

    try {
      // Direct browser-side execution for GitHub static deployment
      const replyText = await callLlmDirect(contextPrompt);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("LLM Calling error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **大模型调用异常**：\n\n${err?.message || "连接失败"}\n\n*请检查：*\n1. API-Key 是否正确无误且额度充足；\n2. 所选模型（${MODEL_INFO[selectedModel].displayName}）是否支持当前网络直接访问。点击右上角 **⚙️ 齿轮** 可重新配置。`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDiagnosis = async () => {
    if (isLoading) return;

    if (!apiKey.trim()) {
      setApiKeyMissingNotice(true);
      handleOpenSettings();
      return;
    }

    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `diag-user-${Date.now()}`,
      role: "user",
      content: "🔬 请求对当前沙盒各曲线的下滑数据进行变分物理诊断。",
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    const diagnosisPrompt = `请对以下最速降线实验室沙盒数据进行详细的物理与变分法诊断分析：
- 起点 A: (${config.startX}, ${config.startY}) m, 终点 B: (${config.endX}, ${config.endY}) m
- 重力加速度 g: ${config.gravity} m/s², 动摩擦因数 μ: ${config.friction}
- 各曲线下滑时间实测数据:
${curves.map((c) => `  * ${c.name}: 下滑时间 = ${c.totalTime.toFixed(4)} s, 终点速度 = ${c.finalVelocity.toFixed(3)} m/s, 弧长 = ${c.arcLength.toFixed(3)} m`).join("\n")}

请从以下三方面给出诊断：
1. **时间差分析**：摆线（最速降线）相较于直线、抛物线和圆弧线的加速优势与时间节省率；
2. **物理机制解析**：前期大倾角“先蓄速”如何克服较长的几何路径；
3. **参数/工程建议**：若引入摩擦力 μ=${config.friction} 或在实际滑道设计中的优化改进建议。`;

    try {
      const diagText = await callLlmDirect(diagnosisPrompt);
      setMessages((prev) => [
        ...prev,
        {
          id: `diag-ai-${Date.now()}`,
          role: "assistant",
          content: diagText,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `diag-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ 诊断调用失败：${e?.message || "请检查 API Key 配置"}`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-[#E0E4E8] bg-white shadow-2xl transition-all duration-300">
      {/* Header with Title and Model Setting Gear */}
      <div className="flex h-14 items-center justify-between border-b border-[#E0E4E8] bg-[#F8FAFC] px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34495E] text-white shadow-2xs">
            <BotMessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="font-serif text-sm font-bold text-[#2C3E50] flex items-center gap-1.5">
              <span>AI 变分法物理导师</span>
              <span className="rounded-md bg-[#EEF2F5] px-1.5 py-0.2 font-mono text-[10px] text-[#34495E] font-semibold border border-[#E0E4E8]">
                {MODEL_INFO[selectedModel].displayName}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              {apiKey.trim() ? "🟢 API-Key 已就绪" : "⚠️ 未配置 API-Key (点击齿轮设置)"}
            </p>
          </div>
        </div>

        {/* Action Controls: Settings Gear, Diagnosis, Close */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenSettings}
            title="大模型与 API-Key 设置"
            className="flex items-center gap-1 rounded-md border border-[#CBD5E1] bg-white p-1.5 text-xs font-semibold text-[#34495E] hover:bg-[#EEF2F5] hover:text-[#2C3E50] shadow-2xs transition cursor-pointer"
          >
            <Settings className="h-4 w-4 text-[#34495E]" />
          </button>

          <button
            onClick={handleRunDiagnosis}
            title="一键诊断当前沙盒"
            className="flex items-center gap-1 rounded-md border border-amber-300/80 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100 shadow-2xs cursor-pointer"
          >
            <Stethoscope className="h-3.5 w-3.5 text-amber-700" />
            <span>沙盒诊断</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Model & API-Key Configuration Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xs p-5 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-[#34495E] p-1.5 text-white">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#2C3E50]">
                大模型与 API-Key 设置
              </h3>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-md p-1 text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="mt-4 space-y-5 flex-1">
            {apiKeyMissingNotice && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  本应用已针对 GitHub 静态部署进行纯浏览器直调设计。请先手工输入并确认您的 API-Key，方可发起大模型调用。
                </span>
              </div>
            )}

            {/* 1. Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C3E50] flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-[#34495E]" />
                <span>1. 选择大模型 (Select Model)</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* Model A: Gemini 3 Flash */}
                <div
                  onClick={() => setTempModel("gemini-3-flash")}
                  className={`relative cursor-pointer rounded-xl border p-3.5 transition ${
                    tempModel === "gemini-3-flash"
                      ? "border-[#34495E] bg-[#EEF2F5] shadow-xs"
                      : "border-[#E0E4E8] bg-white hover:border-[#94A3B8]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2C3E50]">Gemini 3 Flash</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-semibold text-blue-800">
                      Google
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#64748B] leading-snug">
                    擅长变分几何推导与泛函分析
                  </p>
                </div>

                {/* Model B: DeepSeek-V4-Pro */}
                <div
                  onClick={() => setTempModel("deepseek-v4-pro")}
                  className={`relative cursor-pointer rounded-xl border p-3.5 transition ${
                    tempModel === "deepseek-v4-pro"
                      ? "border-[#34495E] bg-[#EEF2F5] shadow-xs"
                      : "border-[#E0E4E8] bg-white hover:border-[#94A3B8]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2C3E50]">DeepSeek-V4-Pro</span>
                    <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-800">
                      DeepSeek
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#64748B] leading-snug">
                    高阶物理方程链式推理与数值极值
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Manual API-Key Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C3E50] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-[#34495E]" />
                  <span>2. 手工输入 API-Key (Manual Key Input)</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  仅保存在浏览器本地 (LocalStorage)
                </span>
              </label>

              <div className="relative flex items-center">
                <input
                  type={showKeyText ? "text" : "password"}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={
                    tempModel === "gemini-3-flash"
                      ? "输入 Google Gemini API Key (AIzaSy...)"
                      : "输入 DeepSeek API Key (sk-...)"
                  }
                  className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2.5 pr-10 font-mono text-xs text-[#2C3E50] placeholder-[#94A3B8] focus:border-[#34495E] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#34495E]"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute right-2.5 text-[#64748B] hover:text-[#2C3E50] cursor-pointer"
                >
                  {showKeyText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#64748B]">
                说明：GitHub 静态托管下无后端代理，所有 API 请求由用户浏览器直接向官方/代理服务器安全发起。
              </p>
            </div>

            {/* Optional Custom Base URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>自定义 API 代理基址 (可选，留空使用官方默认)</span>
              </label>
              <input
                type="text"
                value={tempBaseUrl}
                onChange={(e) => setTempBaseUrl(e.target.value)}
                placeholder={MODEL_INFO[tempModel].apiEndpointPlaceholder}
                className="w-full rounded-md border border-[#E0E4E8] bg-[#F8FAFC] px-3 py-1.5 font-mono text-xs text-[#2C3E50] placeholder-[#94A3B8] focus:border-[#34495E] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* 3. Confirm Model & Save Button */}
            <div className="pt-3 border-t border-[#E0E4E8] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                取消
              </button>

              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#34495E] px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#2C3E50] cursor-pointer"
              >
                {saveSuccessNotice ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>设置已保存！</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>确认大模型与保存设置</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed no-scrollbar bg-[#F8FAFC]">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#34495E] text-white mt-0.5 shadow-2xs">
                  <BotMessageSquare className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs ${
                  isUser
                    ? "bg-[#34495E] text-white rounded-br-xs"
                    : "bg-white text-[#2C3E50] border border-[#E0E4E8] rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed space-y-2">
                  {msg.content}
                </div>
                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    isUser ? "text-slate-300 text-right" : "text-[#64748B]"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2C3E50] text-white mt-0.5 shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-[#E0E4E8] bg-white p-3 text-xs text-[#64748B] shadow-2xs">
            <Sparkles className="h-4 w-4 animate-spin text-[#34495E]" />
            <span>AI 导师（{MODEL_INFO[selectedModel].displayName}）正在推导演算中...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Pills */}
      <div className="border-t border-[#E0E4E8] bg-white p-2.5">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 rounded-full border border-[#E0E4E8] bg-[#F8FAFC] px-2.5 py-1 text-[11px] text-[#64748B] transition hover:border-[#34495E] hover:bg-[#EEF2F5] hover:text-[#2C3E50] cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-[#E0E4E8] bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              apiKey.trim()
                ? "询问变分法推导、费马光学类比或沙盒疑难..."
                : "⚠️ 请先在右上角 ⚙️ 输入 API-Key..."
            }
            className="flex-1 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] px-3 py-2 text-xs text-[#2C3E50] placeholder-[#64748B] focus:border-[#34495E] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#34495E]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34495E] text-white transition hover:bg-[#2C3E50] shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
