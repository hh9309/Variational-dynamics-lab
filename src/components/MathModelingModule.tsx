import React, { useState } from "react";
import { BlockMath, InlineMath } from "../utils/mathRender";
import {
  Compass,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Eye,
  Zap,
  BookOpen,
} from "lucide-react";

export const MathModelingModule: React.FC<{ onNavigateToSandbox: () => void }> = ({
  onNavigateToSandbox,
}) => {
  const [activeSlice, setActiveSlice] = useState<
    "derivation" | "beltrami" | "fermat" | "parameters" | "drag"
  >("derivation");
  const [demoRadius, setDemoRadius] = useState<number>(2.5);
  const [demoTheta, setDemoTheta] = useState<number>(Math.PI);

  const demoX = demoRadius * (demoTheta - Math.sin(demoTheta));
  const demoY = demoRadius * (1 - Math.cos(demoTheta));
  const demoSlope = Math.tan(demoTheta / 2); // dx/dy = tan(theta/2)

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
                MODULE 01
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
                变分法与最速降线数学精细化建模
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              从能量守恒与时间泛函出发，通过欧拉-拉格朗日方程与贝尔特拉米恒等式推导旋轮线参数方程。
            </p>
          </div>

          <button
            onClick={onNavigateToSandbox}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#34495E] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2C3E50]"
          >
            <span>进入 2D 赛跑沙盒演播</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Slice Navigation Pills */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E0E4E8] pt-4">
          {[
            { id: "derivation", label: "1. 泛函构建与变分推导", icon: Compass },
            { id: "beltrami", label: "2. 贝尔特拉米第一积分", icon: Zap },
            { id: "fermat", label: "3. 伯努利费马光学类比", icon: Lightbulb },
            { id: "parameters", label: "4. 摆线参数方程微观拆解", icon: Eye },
            { id: "drag", label: "5. 空气阻力与非线性变分拓展", icon: BookOpen },
          ].map((slice) => (
            <button
              key={slice.id}
              onClick={() => setActiveSlice(slice.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                activeSlice === slice.id
                  ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                  : "border border-[#E0E4E8] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#2C3E50]"
              }`}
            >
              <slice.icon className="h-3.5 w-3.5" />
              <span>{slice.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area based on Slice */}
      {activeSlice === "derivation" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Step-by-step Math Derivation Cards */}
          <div className="space-y-4 lg:col-span-8">
            {/* Step 1 */}
            <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF2F5] font-mono text-xs font-bold text-[#34495E] border border-[#E0E4E8]">
                  1
                </span>
                <span>物理模型设定与时间泛函建立</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                设质点质量为 <InlineMath math="m" />，由静止从原点 <InlineMath math="A(0,0)" /> 沿光滑轨道在重力场中滑向点 <InlineMath math="B(x_2, y_2)" />（取竖直向下为 <InlineMath math="y" /> 轴正方向）。
              </p>
              <div className="my-3 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3.5">
                <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-[#2C3E50]">能量守恒定律：</span>
                    <BlockMath math="\frac{1}{2}mv^2 = mgy \implies v(y) = \sqrt{2gy}" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#2C3E50]">曲线路径微元：</span>
                    <BlockMath math="ds = \sqrt{dx^2 + dy^2} = \sqrt{1 + (y')^2} \, dx" />
                  </div>
                </div>
                <div className="mt-2 border-t border-[#E0E4E8] pt-2 text-center">
                  <span className="text-xs font-semibold text-[#34495E]">总下滑时间泛函 <InlineMath math="T[y]" />：</span>
                  <BlockMath math="T[y] = \int_A^B \frac{ds}{v} = \int_0^{x_2} \frac{\sqrt{1 + (y')^2}}{\sqrt{2gy}} \, dx = \int_0^{x_2} F(y, y') \, dx" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF2F5] font-mono text-xs font-bold text-[#34495E] border border-[#E0E4E8]">
                  2
                </span>
                <span>变分原理与欧拉-拉格朗日方程</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                要使泛函 <InlineMath math="T[y]" /> 取得极小值，对任意满足固定端点边界条件 <InlineMath math="\eta(0)=\eta(x_2)=0" /> 的微扰函数 <InlineMath math="\eta(x)" />，其一阶变分必须恒为零：
              </p>
              <div className="my-3 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3.5">
                <BlockMath math="\delta T = \left. \frac{d}{d\epsilon} T[y + \epsilon \eta] \right|_{\epsilon=0} = \int_0^{x_2} \left( \frac{\partial F}{\partial y}\eta + \frac{\partial F}{\partial y'}\eta' \right) dx = 0" />
                <p className="text-[11px] text-[#64748B] text-center my-1">
                  分部积分第二项并利用端点条件 <InlineMath math="\eta(0)=\eta(x_2)=0" />：
                </p>
                <BlockMath math="\int_0^{x_2} \left[ \frac{\partial F}{\partial y} - \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) \right] \eta(x) \, dx = 0" />
                <div className="mt-2 rounded-md bg-[#EEF2F5] p-2.5 text-center text-xs font-bold text-[#2C3E50] border border-[#E0E4E8]">
                  欧拉-拉格朗日方程 (Euler-Lagrange Equation)：
                  <BlockMath math="\frac{\partial F}{\partial y} - \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) = 0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary & Key Insights */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs">
              <h3 className="font-serif text-sm font-bold text-[#2C3E50] flex items-center gap-1.5 border-b border-[#E0E4E8] pb-2">
                <Lightbulb className="h-4 w-4 text-[#34495E]" />
                <span>变分法的精妙之处</span>
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-[#64748B] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>普通微积分求的是使“函数取极值的<b>数</b>”；变分法求的是使“泛函取极值的<b>曲线函数</b>”。</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>被积函数 <InlineMath math="F(y, y')" /> 显式不含自变量 <InlineMath math="x" />，这是能大幅简化计算的关键物理对称性。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#E0E4E8] bg-[#F8FAFC] p-4">
              <span className="text-xs font-bold text-[#2C3E50]">核心思考题：</span>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                为什么最短距离的直线不是时间最短的曲线？因为直线全程加速度平缓；而摆线在起点迅速垂直俯冲，早期获得巨大速度，用高平均速度补偿了略微增加的几何距离！
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSlice === "beltrami" && (
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-[#E0E4E8] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#2C3E50]">
              贝尔特拉米恒等式（Beltrami Identity）与微分方程求解
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              当拉格朗日函数 <InlineMath math="F" /> 不显含自变量 <InlineMath math="x" />（即 <InlineMath math="\frac{\partial F}{\partial x} = 0" />）时，欧拉-拉格朗日方程拥有第一积分（守恒量）。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4">
              <h4 className="font-bold text-xs text-[#2C3E50]">1. 恒等式推导：</h4>
              <p className="text-xs text-[#64748B]">计算全微分：</p>
              <BlockMath math="\frac{d}{dx}\left[ F - y'\frac{\partial F}{\partial y'} \right] = \frac{\partial F}{\partial y}y' + \frac{\partial F}{\partial y'}y'' - y''\frac{\partial F}{\partial y'} - y'\frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right)" />
              <p className="text-xs text-[#64748B]">提取公因式 <InlineMath math="y'" />：</p>
              <BlockMath math="= y'\left[ \frac{\partial F}{\partial y} - \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) \right] = y' \cdot 0 = 0" />
              <div className="rounded-md bg-white border border-[#E0E4E8] p-2 text-center text-xs font-semibold text-[#2C3E50] shadow-2xs">
                第一积分恒定：
                <BlockMath math="F - y'\frac{\partial F}{\partial y'} = C = \text{常数}" />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4">
              <h4 className="font-bold text-xs text-[#2C3E50]">2. 代入最速降线被积函数：</h4>
              <p className="text-xs text-[#64748B]">代入 <InlineMath math="F = \frac{\sqrt{1 + (y')^2}}{\sqrt{2gy}}" />，求偏导：</p>
              <BlockMath math="\frac{\partial F}{\partial y'} = \frac{y'}{\sqrt{2gy}\sqrt{1 + (y')^2}}" />
              <p className="text-xs text-[#64748B]">通分化简：</p>
              <BlockMath math="F - y'\frac{\partial F}{\partial y'} = \frac{1}{\sqrt{2gy}\sqrt{1 + (y')^2}} = C" />
              <div className="rounded-md bg-[#34495E] p-3 text-center text-white text-xs shadow-2xs">
                令常数 <InlineMath math="C = \frac{1}{\sqrt{2gr}}" />，两边平方整理得到：
                <BlockMath math="y \left[ 1 + (y')^2 \right] = 2r" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4">
            <h4 className="text-xs font-bold text-[#2C3E50]">3. 参数化求解旋轮线（摆线）：</h4>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              令 <InlineMath math="y' = \cot(\theta / 2)" />，代入 <InlineMath math="1 + (y')^2 = \csc^2(\theta/2)" />，得到：
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded bg-white p-2.5 text-center shadow-2xs border border-[#E0E4E8]">
                <span className="text-[11px] font-semibold text-[#64748B]">纵坐标参数方程：</span>
                <BlockMath math="y = 2r \sin^2\frac{\theta}{2} = r(1 - \cos\theta)" />
              </div>
              <div className="rounded bg-white p-2.5 text-center shadow-2xs border border-[#E0E4E8]">
                <span className="text-[11px] font-semibold text-[#64748B]">横坐标参数方程（对 <InlineMath math="dx = \frac{dy}{y'}" /> 积分）：</span>
                <BlockMath math="x = \int r(1 - \cos\theta) \, d\theta = r(\theta - \sin\theta)" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSlice === "fermat" && (
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-[#E0E4E8] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#2C3E50] flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <span>约翰·伯努利的光学费马原理跨学科直觉 (1696)</span>
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              1696年，瑞士数学家约翰·伯努利巧妙地将重力下滑问题等价转化为光在连续梯度折射率介质中的传播！
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="space-y-4 md:col-span-7">
              <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 text-xs leading-relaxed text-[#2C3E50]">
                <h4 className="font-bold text-[#2C3E50]">费马最短时间原理 (Fermat's Principle of Least Time)：</h4>
                <p className="mt-1 text-[#64748B]">
                  光在两点之间传播，总是选择所需时间最短的路径。在非均匀介质中，光速 <InlineMath math="v(y)" /> 随深度变化。
                </p>
                <div className="my-2 rounded bg-white p-2 text-center border border-[#E0E4E8]">
                  <span className="font-semibold text-[#2C3E50]">斯涅尔折射定律 (Snell's Law)：</span>
                  <BlockMath math="\frac{\sin\alpha_1}{v_1} = \frac{\sin\alpha_2}{v_2} = \dots = \frac{\sin\alpha(y)}{v(y)} = \text{常数} \, C" />
                </div>
                <p className="mt-1 text-[#64748B]">
                  其中 <InlineMath math="\alpha" /> 为光线切线与竖直法线的夹角。由几何关系：
                  <InlineMath math="\sin\alpha = \frac{dx}{ds} = \frac{1}{\sqrt{1 + (y')^2}}" />。
                </p>
              </div>

              <div className="rounded-lg border border-[#E0E4E8] bg-[#EEF2F5] p-4 text-xs text-[#2C3E50]">
                <span className="font-bold">两式联立一击即中：</span>
                <BlockMath math="\frac{1}{\sqrt{2gy}\sqrt{1 + (y')^2}} = C \implies y[1 + (y')^2] = \frac{1}{2gC^2} = 2r" />
                <p className="mt-1 text-[11px] text-[#64748B]">
                  无需繁琐的二阶微分变分推导，纯凭光学的斯涅尔定律即可在数行内直接导出摆线微分方程！这成为数学与物理跨学科统一的传世典范。
                </p>
              </div>
            </div>

            {/* Visual Optical Analogy Diagram */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 md:col-span-5">
              <div className="text-center w-full">
                <span className="font-mono text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                  Optical Gradient Slice
                </span>
                <div className="mt-3 flex flex-col gap-1.5 w-52 mx-auto">
                  <div className="h-7 rounded border border-slate-200 bg-white text-[10px] flex items-center justify-between px-2 font-mono text-[#2C3E50]">
                    <span>y = 0.5 (v小, n大)</span>
                    <span className="text-[#64748B]">α₁ 陡峭</span>
                  </div>
                  <div className="h-7 rounded border border-slate-200 bg-slate-100/70 text-[10px] flex items-center justify-between px-2 font-mono text-[#2C3E50]">
                    <span>y = 1.5</span>
                    <span className="text-[#64748B]">α₂ 弯曲</span>
                  </div>
                  <div className="h-7 rounded border border-slate-200 bg-[#34495E] text-[10px] flex items-center justify-between px-2 font-mono text-white">
                    <span>y = 3.0 (v大, n小)</span>
                    <span className="text-slate-200">α₃ 平缓</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#64748B]">
                  折射率 <InlineMath math="n(y) \propto \frac{1}{\sqrt{y}}" /> 随着深度递减，光线向下弯曲形成旋轮线。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSlice === "parameters" && (
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-[#E0E4E8] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#2C3E50]">
              旋轮线（摆线）微观参数方程交互演播
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              调节发生圆半径 <InlineMath math="r" /> 与滚动参变量 <InlineMath math="\theta" />，实时查看坐标与几何切线斜率。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Controls */}
            <div className="space-y-4 md:col-span-5">
              <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                    <span>发生圆半径 r:</span>
                    <span className="font-mono text-[#34495E]">{demoRadius.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={demoRadius}
                    onChange={(e) => setDemoRadius(parseFloat(e.target.value))}
                    className="mt-1.5 w-full accent-[#34495E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                    <span>滚动角参数 θ:</span>
                    <span className="font-mono text-[#34495E]">
                      {demoTheta.toFixed(2)} rad ({(demoTheta / Math.PI).toFixed(2)}π)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={2 * Math.PI}
                    step={0.05}
                    value={demoTheta}
                    onChange={(e) => setDemoTheta(parseFloat(e.target.value))}
                    className="mt-1.5 w-full accent-[#34495E]"
                  />
                </div>

                <div className="border-t border-[#E0E4E8] pt-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between bg-white p-2 rounded border border-[#E0E4E8]">
                    <span className="text-[#64748B]">横坐标 x:</span>
                    <span className="font-bold text-[#2C3E50]">{demoX.toFixed(3)} m</span>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-[#E0E4E8]">
                    <span className="text-[#64748B]">纵坐标 y (下落深度):</span>
                    <span className="font-bold text-[#2C3E50]">{demoY.toFixed(3)} m</span>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-[#E0E4E8]">
                    <span className="text-[#64748B]">瞬时速度 v (√(2gy)):</span>
                    <span className="font-bold text-[#34495E]">
                      {Math.sqrt(2 * 9.8 * demoY).toFixed(3)} m/s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual SVG Mini Plot */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 md:col-span-7">
              <svg viewBox="0 0 320 180" className="w-full max-w-md h-auto">
                {/* Axes */}
                <line x1="20" y1="20" x2="300" y2="20" stroke="#94A3B8" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="160" stroke="#94A3B8" strokeWidth="1" />
                <text x="305" y="24" fontSize="10" fill="#64748B" fontFamily="monospace">x</text>
                <text x="14" y="165" fontSize="10" fill="#64748B" fontFamily="monospace">y</text>

                {/* Cycloid Curve */}
                {(() => {
                  const pts: string[] = [];
                  for (let i = 0; i <= 100; i++) {
                    const th = (i / 100) * 2 * Math.PI;
                    const px = 20 + ((demoRadius * (th - Math.sin(th))) / (demoRadius * 2 * Math.PI)) * 260;
                    const py = 20 + ((demoRadius * (1 - Math.cos(th))) / (demoRadius * 2)) * 120;
                    pts.push(`${px},${py}`);
                  }
                  return <polyline points={pts.join(" ")} fill="none" stroke="#10B981" strokeWidth="2.5" />;
                })()}

                {/* Active Demo Point */}
                {(() => {
                  const px = 20 + ((demoX) / (demoRadius * 2 * Math.PI)) * 260;
                  const py = 20 + ((demoY) / (demoRadius * 2)) * 120;
                  return (
                    <g>
                      <circle cx={px} cy={py} r="5" fill="#EF4444" />
                      <circle cx={px} cy={py} r="8" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="2,2" />
                      <text x={px + 8} y={py - 6} fontSize="10" fill="#991B1B" fontWeight="bold">
                        P({demoX.toFixed(1)}, {demoY.toFixed(1)})
                      </text>
                    </g>
                  );
                })()}
              </svg>
              <span className="mt-2 font-mono text-[11px] text-[#64748B]">
                旋轮线拱底顶点处于 θ = π, (x = πr, y = 2r)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NEW SLICE 5: AERODYNAMIC AIR DRAG & NON-LINEAR VARIATIONAL EXTENSION */}
      {activeSlice === "drag" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 font-mono text-xs font-bold text-rose-700 border border-rose-200">
                  5
                </span>
                <span>引入空气动力学阻力：非守恒场的广义变分方程</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                在真实大气环境中，质点不仅受重力场与法向约束反力作用，还会受到流体粘性阻力（低速 Stokes 线性阻力）或气动压差阻力（高速 Newtonian 二阶阻力）：
              </p>

              <div className="my-3 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-[#2C3E50]">切向牛顿第二定律方程：</span>
                  <BlockMath math="m \frac{dv}{dt} = mg \sin\alpha - \mu mg \cos\alpha - F_{\text{drag}}(v)" />
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-xs">
                  <div className="p-2.5 rounded bg-white border border-[#E0E4E8]">
                    <span className="font-semibold text-rose-800">1. 线性 Stokes 阻力（低速/高粘度）：</span>
                    <BlockMath math="F_{\text{drag}} = k_1 v \implies \frac{dv}{dt} = g\sin\alpha - \frac{k_1}{m}v" />
                  </div>
                  <div className="p-2.5 rounded bg-white border border-[#E0E4E8]">
                    <span className="font-semibold text-rose-800">2. 二阶牛顿阻力（高速/空气湍流）：</span>
                    <BlockMath math="F_{\text{drag}} = \frac{1}{2} C_d \rho A v^2 = k_2 v^2 \implies \frac{dv}{dt} = g\sin\alpha - \frac{k_2}{m}v^2" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[#64748B]">
                <p>
                  <strong>核心物理洞察</strong>：在纯无阻力情况下，由于机械能守恒 <InlineMath math="v(y) = \sqrt{2gy}" />，速度纯粹是下落深度 <InlineMath math="y" /> 的代数显函数，因此泛函极值解可以通过贝尔特拉米恒等式积分出标准的圆旋轮线。
                </p>
                <p>
                  而在空气阻力存在下，机械能不断被阻力做功耗散 <InlineMath math="\Delta E = -\int F_{\text{drag}} ds" />，质点速度不再仅取决于当前高度 <InlineMath math="y" />，还强烈依赖于<strong>历史路径积分</strong>。此时的最速降线不再是标准单摆线，而是向<strong>“更陡峭的初始俯冲角（更大初始曲率）”</strong>发生微调偏转，以尽早获取较高初始动能来抵消后半程更剧烈的空气阻力损耗。
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF2F5] font-mono text-xs font-bold text-[#34495E] border border-[#E0E4E8]">
                  ★
                </span>
                <span>二阶非线性微分方程与数值解算</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                对于带有二阶阻力项的最速降线变分问题，可构造带有拉格朗日乘子 <InlineMath math="\lambda(s)" /> 的最优控制哈密顿系统（Hamiltonian System）：
              </p>
              <div className="my-3 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3.5">
                <BlockMath math="\mathcal{H} = \lambda_v \left( g \sin\phi - \frac{k}{m} v^2 \right) + \lambda_x v \cos\phi + \lambda_y v \sin\phi - 1" />
              </div>
              <p className="text-xs leading-relaxed text-[#64748B]">
                在 2D 赛跑沙盒模块中，系统通过高精度的切向预估-校正积分算法（Predictor-Corrector RK 步进）实时计算每条轨道在不同空气阻力系数下的精准耗时与速度剖面，可在控制面板中自由调节对比。
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#2C3E50]">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>实验场对比建议</span>
              </div>
              <ul className="space-y-2 text-xs text-[#64748B]">
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span><strong>无阻力</strong>：摆线相比直线有最大耗时优势（快约 20%~28%）。</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span><strong>大阻力极速下落</strong>：由于高速下阻力按 <InlineMath math="v^2" /> 急剧暴增，各曲线终点速度差异被空气阻力收敛。</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={onNavigateToSandbox}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#34495E] py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2C3E50]"
                >
                  <span>前往沙盒体验空气阻力</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
