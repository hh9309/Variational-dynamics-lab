import React, { useState } from "react";
import { SandboxConfig, CurvePhysicsData } from "../types";
import {
  FileDown,
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  Code,
  Table,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  Award,
  Sliders,
} from "lucide-react";
import { BlockMath, InlineMath } from "../utils/mathRender";

interface ReportExportModuleProps {
  config: SandboxConfig;
  curves: CurvePhysicsData[];
}

export const ReportExportModule: React.FC<ReportExportModuleProps> = ({
  config,
  curves,
}) => {
  const [activeFormat, setActiveFormat] = useState<"markdown" | "latex" | "csv">("markdown");
  const [copied, setCopied] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>("最速降线与变分法原理科学实验研究报告");
  const [authorName, setAuthorName] = useState<string>("物理学实验室研究员");

  const cycloidCurve = curves.find((c) => c.id === "cycloid") || curves[0];
  const lineCurve = curves.find((c) => c.id === "straight_line") || curves[1];

  const timeDiff = lineCurve && cycloidCurve ? (lineCurve.totalTime - cycloidCurve.totalTime).toFixed(4) : "0";
  const diffPercent =
    lineCurve && cycloidCurve && lineCurve.totalTime > 0
      ? (((lineCurve.totalTime - cycloidCurve.totalTime) / lineCurve.totalTime) * 100).toFixed(2)
      : "0";

  const sortedCurves = [...curves].sort((a, b) => a.totalTime - b.totalTime);

  // Generate 5+ Section Refined Markdown Content
  const markdownContent = `# ${reportTitle}
**报告编号**: BRACH-${Date.now().toString().slice(-6)}
**实验日期**: ${new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
**研究学者**: ${authorName}
**实验平台**: Brachistochrone Variational Physics Engine

---

## 一、 实验背景与科学目的 (Background & Objectives)
1. **历史背景**: 1696 年约翰·伯努利（Johann Bernoulli）向全欧数学家提出最速降线挑战，开启了经典变分法（Calculus of Variations）的历史纪元。
2. **科学目的**:
   - 验证在均匀重力场中，质点自静止沿光滑无摩擦/有摩擦约束曲线由高点 $A(0,0)$ 滑行至低点 $B(X_B, Y_B)$ 时，摆线（旋轮线）具有绝对最短下滑时间；
   - 探究路径几何弧长（$L$）与时间泛函积分值（$T$）之间的非线性权衡关系，证实“几何最短路径 $\\neq$ 物理最速路径”；
   - 检验旋轮线的等时降落特性（Tautochrone Property）与能量转化动力学规律。

## 二、 实验环境与物理边界设定 (Experimental Setup & Boundaries)
- **起点坐标 $A$**: $(x_A, y_A) = (${config.startX.toFixed(2)}, ${config.startY.toFixed(2)})$ m
- **终点坐标 $B$**: $(x_B, y_B) = (${config.endX.toFixed(2)}, ${config.endY.toFixed(2)})$ m
- **重力加速度 $g$**: $g = ${config.gravity.toFixed(2)}$ m/s²
- **表面滑动摩擦因数 $\\mu$**: $\\mu = ${config.friction.toFixed(3)}$
- **质点初始速度 $v_0$**: $v_0 = 0.00$ m/s（自静止释放）
- **势能参考面**: 设起点 $A$ 处重力势能 $E_p(0) = 0$ J

## 三、 各轨道动力学数值积分与性能对比 (Comparative Dynamic Data)

| 排名 | 轨道曲线类型 (Track Type) | 下滑总耗时 $T$ (s) | 轨道几何弧长 $L$ (m) | 终点线速度 $v_{\\text{end}}$ (m/s) | 相对最速降线时延 $\\Delta T$ (s) | 相对直线效率提升 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
${sortedCurves
  .map((c, idx) => {
    const deltaT = (c.totalTime - cycloidCurve.totalTime).toFixed(4);
    const lineDelta = lineCurve ? (((lineCurve.totalTime - c.totalTime) / lineCurve.totalTime) * 100).toFixed(2) : "0";
    return `| **第 ${idx + 1} 名** | **${c.name}** (${c.nameEn}) | **${c.totalTime.toFixed(4)}** | ${c.arcLength.toFixed(3)} | ${c.finalVelocity.toFixed(2)} | +${deltaT} s | ${Number(lineDelta) >= 0 ? `+${lineDelta}%` : `${lineDelta}%`} |`;
  })
  .join("\n")}

## 四、 变分法数学推导与微分方程求解 (Variational Derivation)
1. **时间泛函建立**:
   根据能量守恒定律，质点下落深度为 $y$ 时的瞬时线速度为 $v(y) = \\sqrt{2gy}$。微元弧长为 $ds = \\sqrt{1 + (y')^2}\\,dx$。
   质点全程下滑时间为积分泛函：
   $$T[y] = \\int_0^{X_B} \\frac{\\sqrt{1 + (y')^2}}{\\sqrt{2gy}} \\, dx = \\int_0^{X_B} F(y, y') \\, dx$$

2. **贝尔特拉米恒等式 (Beltrami Identity)**:
   由于被积函数 $F(y, y') = \\frac{\\sqrt{1 + (y')^2}}{\\sqrt{2gy}}$ 不显含自变量 $x$，欧拉-拉格朗日方程可降阶为第一积分：
   $$F - y' \\frac{\\partial F}{\\partial y'} = C \\implies \\frac{1}{\\sqrt{2gy} \\sqrt{1 + (y')^2}} = C$$

3. **旋轮线解析参数方程**:
   引入无量纲参数 $2r = \\frac{1}{2g C^2}$，令 $y' = \\cot(\\theta/2)$，积分得到摆线标准参数解：
   $$\\begin{cases} x(\\theta) = r(\\theta - \\sin\\theta) \\\\ y(\\theta) = r(1 - \\cos\\theta) \\end{cases} \\quad (\\theta \\in [0, \\theta_B])$$

## 五、 物理机制分析与动量-能量演化 (Kinematic & Energy Analysis)
1. **先蓄速、后巡航（Early Acceleration Advantage）**:
   摆线在起始段拥有近乎垂直的超大切线倾角（$\\alpha \\to 90^\\circ$），重力切向分量 $g\\sin\\alpha$ 达到最大，使小球以极高加速度率先将重力势能转化为动能，在中后段以远超其他轨道的线速度飞速穿越平缓区域。
2. **几何弧长代价被速度优势超越**:
   虽然摆线弧长（${cycloidCurve.arcLength.toFixed(3)} m）大于直线路径（${lineCurve.arcLength.toFixed(3)} m），但平均速度 $\\bar{v} = L/T$ 显著优于直线，完美实现时间泛函极小化。
3. **摩擦力影响机制**:
   当 $\\mu > 0$ 时，法向支持力 $N = mg\\cos\\alpha + m\\frac{v^2}{\\rho}$ 引起的摩擦做功 $W_f = \\int \\mu N ds$ 会导致机械能耗散，最速降线方程将发生轻微前倾变形。

## 六、 科学结论与工程应用建议 (Conclusions & Engineering Insights)
1. **最优性证实**: 本次实验中，摆线耗时 **${cycloidCurve.totalTime.toFixed(4)} s**，相比直线路径效率提升 **${diffPercent}%**，严格验证了最速降线定理。
2. **等时降落**: 摆线不仅是最速降线，更具备等时性（惠更斯摆时钟原理）。
3. **工程应用建议**:
   - **重力滑道与仓储分拣**: 物流重力溜槽采用旋轮线截面可最大化滑落吞吐率；
   - **滑雪跳台与游乐过山车**: 陡坡急速俯冲曲线可兼顾极致加速度体验与平稳过渡。
`;

  // Generate 5+ Section LaTeX Content
  const latexContent = `% ==============================================================================
% Brachistochrone Variational Physics Lab Report
% Generated automatically by Brachistochrone Simulation Suite
% ==============================================================================
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{booktabs}
\\usepackage{geometry}
\\usepackage{cite}
\\geometry{top=2.5cm, bottom=2.5cm, left=2.5cm, right=2.5cm}

\\title{\\textbf{${reportTitle}}}
\\author{${authorName} \\\\ \\textit{Brachistochrone Variational Physics Laboratory}}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
This report investigates the classical Brachistochrone problem formulated by Johann Bernoulli in 1696. Using variational calculus and the Euler-Lagrange framework, we analyze the descent kinematics of particles moving along various constrained trajectories under gravity. Numerical simulations confirm that the cycloid curve minimizes the total travel time ($T = ${cycloidCurve.totalTime.toFixed(4)}\\text{ s}$), outperforming the linear path by ${diffPercent}\\%$.
\\end{abstract}

\\section{Introduction and Objectives}
The Brachistochrone problem seeks the planar curve connecting two points $A(0,0)$ and $B(X_B, Y_B)$ such that a point mass slides down frictionless in the minimum possible time under uniform gravity $g$. The objectives of this study include:
\\begin{enumerate}
  \\item Numerically validating the time-optimality of the cycloid over alternate geometry curves.
  \\item Formulating the descent time functional and deriving the first integral via the Beltrami identity.
  \\item Analyzing the energy breakdown and trade-off between geometric distance and instantaneous velocity accumulation.
\\end{enumerate}

\\section{Experimental Setup and System Parameters}
The physical coordinate frame and parameter boundary conditions are defined as follows:
\\begin{itemize}
  \\item Initial Position $A$: $(x_A, y_A) = (0.00, 0.00)$~m
  \\item Target Position $B$: $(x_B, y_B) = (${config.endX.toFixed(2)}, ${config.endY.toFixed(2)})$~m
  \\item Gravitational Acceleration $g$: $${config.gravity.toFixed(2)}$~m/s$^2$
  \\item Kinetic Friction Coefficient $\\mu$: $${config.friction.toFixed(3)}$
  \\item Initial Velocity: $v_0 = 0.00$~m/s
\\end{itemize}

\\section{Comparative Kinematics and Numerical Results}
Table~\\ref{tab:results} summarizes the integrated kinematic metrics for all evaluated trajectories.

\\begin{table}[h!]
\\centering
\\begin{tabular}{clcccc}
\\toprule
\\textbf{Rank} & \\textbf{Track Type} & \\textbf{Descent Time $T$ (s)} & \\textbf{Arc Length $L$ (m)} & \\textbf{Final Vel $v$ (m/s)} & \\textbf{Time Gap $\\Delta T$ (s)} \\\\
\\midrule
${sortedCurves
  .map(
    (c, idx) =>
      `${idx + 1} & ${c.nameEn} & \\textbf{${c.totalTime.toFixed(4)}} & ${c.arcLength.toFixed(3)} & ${c.finalVelocity.toFixed(2)} & +${(c.totalTime - cycloidCurve.totalTime).toFixed(4)} \\\\`
  )
  .join("\n")}
\\bottomrule
\\end{tabular}
\\caption{Descent time and dynamic kinematic metrics across different trajectory profiles.}
\\label{tab:results}
\\end{table}

\\section{Variational Derivation and Euler-Lagrange Formulation}
The travel time functional $T[y]$ is expressed as:
\\begin{equation}
T[y] = \\int_0^{X_B} \\frac{\\sqrt{1+(y')^2}}{\\sqrt{2gy}} \\, dx
\\end{equation}
Since the Lagrangian density $F(y, y') = \\frac{\\sqrt{1+(y')^2}}{\\sqrt{2gy}}$ lacks explicit $x$-dependence, the Beltrami identity yields:
\\begin{equation}
F - y' \\frac{\\partial F}{\\partial y'} = C \\implies y \\left[ 1 + (y')^2 \\right] = 2r
\\end{equation}
Integrating with boundary conditions $(0,0)$ gives the standard cycloid parametric form:
\\begin{equation}
x(\\theta) = r(\\theta - \\sin\\theta), \\quad y(\\theta) = r(1 - \\cos\\theta)
\\end{equation}

\\section{Kinematic Mechanism and Energy Conservation}
The cycloid's superiority arises from early kinetic energy acquisition. By dropping steeply near $A$, the mass acquires high velocity early in the descent, allowing it to traverse the remaining flatter section rapidly. Although the cycloid's total arc length ($L=${cycloidCurve.arcLength.toFixed(3)}~m) exceeds the straight line ($L=${lineCurve.arcLength.toFixed(3)}~m), the substantially higher average velocity yields a net reduction in transit time.

\\section{Conclusions}
In conclusion, the cycloid achieves the minimum transit duration ($T = ${cycloidCurve.totalTime.toFixed(4)}\\text{ s}$), delivering a ${diffPercent}\\%$ time reduction over the linear trajectory. These findings reinforce foundational principles in optimal control, roller-coaster design, and gravitational transport systems.

\\end{document}
`;

  // Generate Comprehensive CSV Content
  const csvContent = `Rank,Track_Name_ZH,Track_Name_EN,Total_Time_s,Arc_Length_m,Final_Velocity_mps,Time_Delta_vs_Cycloid_s,Efficiency_Gain_vs_Line_Percent,Start_X_m,Start_Y_m,End_X_m,End_Y_m,Gravity_mps2,Friction_mu
${sortedCurves
  .map((c, idx) => {
    const deltaT = (c.totalTime - cycloidCurve.totalTime).toFixed(4);
    const lineDelta = lineCurve ? (((lineCurve.totalTime - c.totalTime) / lineCurve.totalTime) * 100).toFixed(2) : "0";
    return `${idx + 1},"${c.name}","${c.nameEn}",${c.totalTime.toFixed(4)},${c.arcLength.toFixed(4)},${c.finalVelocity.toFixed(4)},${deltaT},${lineDelta},${config.startX},${config.startY},${config.endX},${config.endY},${config.gravity},${config.friction}`;
  })
  .join("\n")}
`;

  const getExportText = () => {
    if (activeFormat === "markdown") return markdownContent;
    if (activeFormat === "latex") return latexContent;
    return csvContent;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = getExportText();
    const ext = activeFormat === "markdown" ? "md" : activeFormat === "latex" ? "tex" : "csv";
    const mime = activeFormat === "csv" ? "text/csv" : "text/plain";
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brachistochrone_scientific_report.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
                MODULE 08
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
                实验报告与轨道参数一键导出引擎
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              具备 6 大标准核心结构（实验背景、参数设定、积分数据对比、变分数学推导、动力学能量分析、工程结论），支持 Markdown / LaTeX / CSV 实时生成与导出。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-[#E0E4E8] bg-white px-3.5 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] shadow-2xs transition cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "已复制全量报告" : "复制报告内容"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-[#34495E] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2C3E50] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>下载报告文件 (.{(activeFormat === "markdown" ? "md" : activeFormat === "latex" ? "tex" : "csv")})</span>
            </button>
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E0E4E8] pt-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "markdown", label: "Markdown 精炼学术报告 (.md)", icon: FileText },
              { id: "latex", label: "LaTeX 论文出版格式 (.tex)", icon: Code },
              { id: "csv", label: "CSV 全量轨道指标表 (.csv)", icon: Table },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setActiveFormat(fmt.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeFormat === fmt.id
                    ? "bg-[#34495E] text-white font-semibold shadow-2xs"
                    : "border border-[#E0E4E8] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#2C3E50]"
                }`}
              >
                <fmt.icon className="h-3.5 w-3.5" />
                <span>{fmt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>6 大精炼结构已全量就绪</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Structure Map + Live Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 6-Section Visual Structure Navigator (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2">
              <span className="font-serif text-sm font-bold text-[#2C3E50]">
                报告 6 大精炼结构导航
              </span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-emerald-800">
                6 SECTIONS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { num: "一", title: "实验背景与科学目的", desc: "伯努利历史挑战、时间泛函极值目标" },
                { num: "二", title: "实验环境与物理边界", desc: `A(0,0) → B(${config.endX}m, ${config.endY}m), g=${config.gravity}` },
                { num: "三", title: "各轨道动力学对比数据", desc: "多轨道耗时、弧长、末速与效率排名表" },
                { num: "四", title: "变分法数学推导与方程", desc: "欧拉-拉格朗日与贝尔特拉米恒等式积分" },
                { num: "五", title: "动力学与能量演化分析", desc: "前期超大加速度蓄速 vs 几何距离权衡" },
                { num: "六", title: "科学结论与工程应用建议", desc: "最速降线最优性、等时性与重力滑道设计" },
              ].map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5 transition hover:bg-[#EEF2F5]"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#2C3E50]">
                    <span className="rounded bg-[#34495E] text-white px-1.5 py-0.2 text-[10px] font-mono">
                      {sec.num}
                    </span>
                    <span>{sec.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#64748B] pl-6">
                    {sec.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics Quick Box */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-2 text-xs">
            <span className="font-serif font-bold text-[#2C3E50] block border-b border-[#E0E4E8] pb-1.5">
              核心实验结论速览
            </span>
            <div className="flex justify-between p-2 rounded-md bg-[#EEF2F5] text-[#2C3E50]">
              <span>最速降线用时:</span>
              <span className="font-mono font-bold text-emerald-800">{cycloidCurve.totalTime.toFixed(4)} s</span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-[#F8FAFC] text-[#64748B]">
              <span>直线路径用时:</span>
              <span className="font-mono font-bold text-[#2C3E50]">{lineCurve.totalTime.toFixed(4)} s</span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
              <span>摆线节省时间:</span>
              <span className="font-mono font-bold">+{diffPercent}% ({timeDiff}s)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Code & Text Live Document Preview (8 cols) */}
        <div className="flex flex-col rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#2C3E50]">
                学术报告实时渲染预览
              </span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-800">
                {activeFormat.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-xs text-[#34495E] hover:text-[#2C3E50] underline cursor-pointer"
              >
                一键复制
              </button>
              <button
                onClick={handleDownload}
                className="text-xs text-[#34495E] hover:text-[#2C3E50] underline cursor-pointer"
              >
                下载文件
              </button>
            </div>
          </div>

          <div className="relative flex-1">
            <pre className="max-h-[640px] overflow-auto rounded-lg border border-[#CBD5E1] bg-[#0F172A] p-4 font-mono text-xs leading-relaxed text-slate-100 no-scrollbar">
              <code>{getExportText()}</code>
            </pre>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
            <span>字符数: {getExportText().length} 字符 | 包含完整 LaTeX 数学公式与 Markdown 表格</span>
            <span>编码: UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
