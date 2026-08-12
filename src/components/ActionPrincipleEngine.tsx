/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, HelpCircle, Variable, ShieldCheck, Hammer } from 'lucide-react';

interface ActionPrincipleEngineProps {
  onAnalyze: (moduleName: string, stateDesc: string, params: any) => void;
  aiLoading: boolean;
}

export default function ActionPrincipleEngine({ onAnalyze, aiLoading }: ActionPrincipleEngineProps) {
  // Path deviation parameter (representing delta q variation)
  const [perturbation, setPerturbation] = useState<number>(30); // in pixels
  const [potentialStrength, setPotentialStrength] = useState<number>(0.8);
  const [activePathType, setActivePathType] = useState<string>('perturbed');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState<number>(0);

  // Animation frame loop ticker
  useEffect(() => {
    let frameId: number;
    const run = () => {
      setTick((t) => t + 1);
      frameId = requestAnimationFrame(run);
    };
    frameId = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Configuration metrics
  const N = 80; // Discrete steps
  const dt = 1.0; // Time segment step
  const m = 1.5; // Particle mass
  const stableY = 190; // Center stable point of harmonic potential well (1D oscillator along Y)

  // Pre-calculate physical pathway (Classical Action Minimizer)
  // Under potential V(y) = k * (y - stableY)^2, the physics equation is d2y/dt2 = -k/m * (y - stableY).
  // This is a simple sine/harmonic motion.
  // We can solve for boundary conditions y(0) = y_start, y(T) = y_end easily!
  const startPt = { x: 50, y: 120 };
  const endPt = { x: 550, y: 170 };

  const getTheoreticalPath = () => {
    const arr: { x: number, y: number }[] = [];
    const kFactor = potentialStrength * 0.009; // Adjusted natural frequency
    const omega = Math.sqrt(kFactor / m);

    // Exact solution parameters for y(t) = A cos(omega t) + B sin(omega t) + stableY
    // Let total steps be N.
    const tEnd = N * dt;
    const yS = startPt.y - stableY;
    const yE = endPt.y - stableY;

    // yS = A
    // yE = A cos(omega tEnd) + B sin(omega tEnd)
    // -> B = (yE - yS * cos(omega tEnd)) / sin(omega tEnd)
    const A = yS;
    const sinOmD = Math.sin(omega * tEnd);
    const B = sinOmD === 0 ? 0 : (yE - yS * Math.cos(omega * tEnd)) / sinOmD;

    for (let i = 0; i <= N; i++) {
      const t = i * dt;
      const x = startPt.x + (endPt.x - startPt.x) * (i / N);
      const y = A * Math.cos(omega * t) + B * Math.sin(omega * t) + stableY;
      arr.push({ x, y });
    }
    return arr;
  };

  // Construct other paths
  // Straight space-time path
  const getStraightPath = () => {
    const arr: { x: number, y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const alpha = i / N;
      const x = startPt.x + (endPt.x - startPt.x) * alpha;
      const y = startPt.y + (endPt.y - startPt.y) * alpha;
      arr.push({ x, y });
    }
    return arr;
  };

  // User-perturbed trajectory path = PhysicalPath + deltaY * sin(pi * progress)
  const getPerturbedPath = (pVal: number) => {
    const theory = getTheoreticalPath();
    const arr: { x: number, y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const progress = i / N;
      const sinOffset = Math.sin(Math.PI * progress);
      const dy = pVal * sinOffset;
      arr.push({
        x: theory[i].x,
        y: theory[i].y + dy
      });
    }
    return arr;
  };

  // Helper: calculate Lagrangian action S = sum (T - V) * dt for a path list
  const computeActionS = (pts: { x: number, y: number }[]) => {
    let actionS = 0;
    const kFactor = potentialStrength * 0.05; // potential multiplier

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i+1];

      // velocities dx, dy
      const dx = (p2.x - p1.x);
      const dy = (p2.y - p1.y);
      const T = 0.5 * m * (dx * dx + dy * dy); // Kinetic

      // Potential at center segment
      const avgY = (p1.y + p2.y) / 2;
      const V = 0.5 * kFactor * Math.pow(avgY - stableY, 2);

      actionS += (T - V) * dt;
    }
    return actionS;
  };

  const classicalS = computeActionS(getTheoreticalPath());
  const straightS = computeActionS(getStraightPath());
  const currentS = computeActionS(getPerturbedPath(perturbation));

  // Generate range array of Actions for plotting the energy basin
  const getBasinPlotPoints = () => {
    const plot: { perturbation: number, actionValue: number }[] = [];
    for (let pIdx = -80; pIdx <= 80; pIdx += 10) {
      const somePath = getPerturbedPath(pIdx);
      plot.push({
        perturbation: pIdx,
        actionValue: computeActionS(somePath)
      });
    }
    return plot;
  };

  const basinPlot = getBasinPlotPoints();

  // Render simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Harmonic potential energy well background (elegant gradient lines representing force toward the center stableY)
    for (let y = 0; y < canvas.height; y += 15) {
      const distance = Math.abs(y - stableY);
      const opacity = Math.min(0.18, distance / stableY * 0.22);
      ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Stable center axis line
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, stableY);
    ctx.lineTo(canvas.width, stableY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.font = '9px system-ui';
    ctx.fillText('势能稳态势阱底部 V_min (y = 190)', 20, stableY - 6);

    // 2. Draw candidates path
    // Theoretical Physical Path (Blue glows)
    const theory = getTheoreticalPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(theory[0].x, theory[0].y);
    for (let i = 1; i <= N; i++) ctx.lineTo(theory[i].x, theory[i].y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 1.8 Draw Feynman Path Integral Alternatives (Shimmering quantum background trials)
    const alternativePerturbations = [-60, -35, 35, 60];
    alternativePerturbations.forEach((pVal) => {
      // Don't draw if near current perturbation to keep visual clean
      if (Math.abs(pVal - perturbation) < 15) return;
      
      const altRoute = getPerturbedPath(pVal);
      ctx.strokeStyle = '#c084fc'; // slightly brighter violet/purple for light background visibility
      ctx.lineWidth = 0.9;
      ctx.globalAlpha = 0.16 + Math.sin(tick * 0.04 + pVal) * 0.06; // shimmering wave effect
      ctx.beginPath();
      ctx.moveTo(altRoute[0].x, altRoute[0].y);
      for (let i = 1; i <= N; i++) ctx.lineTo(altRoute[i].x, altRoute[i].y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // Actual user-perturbed path
    const activeRoute = getPerturbedPath(perturbation);
    ctx.strokeStyle = '#a855f7'; // Purple perturbed path
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(activeRoute[0].x, activeRoute[0].y);
    for (let i = 1; i <= N; i++) ctx.lineTo(activeRoute[i].x, activeRoute[i].y);
    ctx.stroke();

    // Shadow highlights
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.15;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw little sliding bead reflecting action path with trailing particles
    const beadSegmentIdx = Math.floor((tick / 1.5) % N);
    if (beadSegmentIdx < activeRoute.length) {
      // Draw faded trailing points
      const trailLen = 6;
      for (let tStep = 1; tStep <= trailLen; tStep++) {
        const altSegment = (beadSegmentIdx - tStep + N) % N;
        if (altSegment < activeRoute.length) {
          const tPt = activeRoute[altSegment];
          ctx.fillStyle = '#a855f7';
          ctx.globalAlpha = (1 - (tStep / trailLen)) * 0.35;
          ctx.beginPath();
          ctx.arc(tPt.x, tPt.y, 4 - (tStep * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      const bd = activeRoute[beadSegmentIdx];
      
      // Ring of potential intensity
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bd.x, bd.y, 14 + Math.sin(tick * 0.08) * 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(bd.x, bd.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bd.x, bd.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boundary points
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, 5, 0, Math.PI * 2);
    ctx.arc(endPt.x, endPt.y, 5, 0, Math.PI * 2);
    ctx.fill();

  }, [perturbation, potentialStrength, tick]);

  const triggerAI = () => {
    const desc = `最小作用量宇宙引擎：
- 起始点 (t1): (${startPt.x}, ${startPt.y}), 终止点 (t2): (${endPt.x}, ${endPt.y}), 稳态势能轴: stableY=${stableY}
- 势阱刚度系数 (Potential Stiffness): ${potentialStrength}
- 路径微观比较结果：
  * 自然演化真实物理解的“驻极动作量” S_classical: ${classicalS.toFixed(2)}
  * 空间直线演化路径(非自然) 动作量 S_straight: ${straightS.toFixed(2)}
  * 用户施加的扰动偏离 $\delta q = ${perturbation}$ 像素：
    当前积分作用量 S_current: ${currentS.toFixed(2)}`;

    onAnalyze('action', desc, {
      perturbation,
      potentialStrength,
      classicalS,
      straightS,
      currentS,
      deviationS: currentS - classicalS
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="action-principle-module">
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Main interactive section */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
            <div>
              <h2 className="text-zinc-800 font-semibold flex items-center gap-1.5 text-base">
                <Sparkles className="w-4 h-4 text-purple-500" />
                欧拉-拉格朗日作用量最小化仿真
              </h2>
              <p className="text-xs text-zinc-500">
                调节路径的变分扰动（偏离大小），观察哈密顿量与作用量泛函 S 的驻值演变
              </p>
            </div>
            <div>
              <span className="px-2 py-0.5 bg-purple-50 text-[10px] font-mono text-purple-600 rounded">
                泛函式: S = ∫(T - V) dt
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/20 rounded-lg border border-slate-200 shadow-sm">
            <canvas
              ref={canvasRef}
              width={600}
              height={330}
              className="w-full h-auto block"
              id="action-engine-canvas"
            />
          </div>

          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-zinc-500">
              紫线：当前含扰动路径 · 蓝白点线：经典最优解（拉格朗日力学路径）
            </p>
            <button
              onClick={triggerAI}
              disabled={aiLoading}
              className="px-4 py-1.5 bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100/70 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              id="btn-ai-insight-action"
            >
              {aiLoading ? 'AI 广义极值求解中...' : '💡 AI 作用量极驻洞察'}
            </button>
          </div>
              {/* Custom Action Basin diagram in canvas shape */}
          <div className="flex items-center justify-between gap-6 border border-zinc-100 rounded-lg p-3 bg-slate-50/50">
            <div className="flex-1 space-y-3">
              <div className="text-[10px] font-mono text-zinc-400">泛函值实时数值累加 S = ∫ L dt</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">经典力学驻解 (理应最低):</span>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{classicalS.toFixed(1)} J·s</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">直线几何解:</span>
                  <span className="font-mono font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">{straightS.toFixed(1)} J·s</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-850 font-semibold">当前变分变动后作用量:</span>
                  <span className="font-mono font-bold text-purple-650 bg-purple-50 px-1.5 py-0.5 rounded">{currentS.toFixed(1)} J·s</span>
                </div>
              </div>
            </div>

            <div className="w-56 h-20 bg-slate-100 rounded border border-slate-200/80 shadow-inner relative flex items-end pb-1.5">
              {/* Plot stationary basin parabola using custom bars */}
              <div className="absolute inset-0 flex justify-between px-3 items-end pb-1 pointer-events-none">
                {basinPlot.map((item, key) => {
                  // Normalize item value to bar height
                  const someH = Math.max(8, Math.min(65, ((item.actionValue - classicalS) * 0.04) + 8));
                  const isCurrent = Math.abs(item.perturbation - perturbation) < 6;
                  return (
                    <div
                      key={key}
                      className={`w-2.5 rounded-t-sm transition-all ${isCurrent ? 'bg-purple-600 shadow-xs' : 'bg-slate-300'}`}
                      style={{ height: `${someH}px` }}
                      title={`扰动:${item.perturbation} S:${item.actionValue.toFixed(0)}`}
                    ></div>
                  );
                })}
              </div>
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-zinc-400 font-medium">δq 路径微增量 →</span>
              <div className="absolute top-1 left-2 text-[9px] font-medium text-purple-700/85">S 积分作用量极驻盆</div>
            </div>
          </div>
        </div>
      </div>

      {/* Side parameters */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* Sliders */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-zinc-800 text-xs mb-3 flex items-center gap-1">
            <Hammer className="w-3.5 h-3.5 text-purple-500" />
            路径极微摄动控制
          </h3>
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>正弦微扰幅度 (δq)</span>
                <span className="font-mono text-purple-600">
                  {perturbation > 0 ? `+${perturbation}` : perturbation} 像素
                </span>
              </div>
              <input
                type="range" min="-80" max="80" step="1"
                value={perturbation} onChange={(e) => setPerturbation(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-1 bg-zinc-100 rounded"
              />
              <span className="text-[10px] text-zinc-400 block leading-tight">
                将扰动置于 0 即可完全契合物理真实轨迹。
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>势能井拉应力 (弹性k)</span>
                <span className="font-mono text-zinc-800">{potentialStrength.toFixed(2)}</span>
              </div>
              <input
                type="range" min="0.2" max="2.0" step="0.1"
                value={potentialStrength} onChange={(e) => setPotentialStrength(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1 bg-zinc-100 rounded"
              />
            </div>
          </div>
        </div>

        {/* Education principles */}
        <div className="bg-purple-50/20 border border-purple-100/40 rounded-xl p-4">
          <h4 className="text-purple-800 font-medium text-xs mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            统一的作用量原理 (Action Principle)
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            在现代量子和宇宙物理大一统结构中，事物并不是根据“力”去即时运动，而是大自然对一整场事件过程进行了“极值变分审计”。
            一个物理运动对应的<strong>拉格朗日量 L = 动能 T - 势能 V</strong>。 
            当把时间区段上的拉格朗日量累积起来（即作用量 S = ∫ L dt），真实的轨迹会让这个 S 维持在不可扰动的<strong>静态变分极值（δS = 0）</strong>状态。 
            量子力学中的费曼路径积分（Path Integral）更是用相位证明了非最优演化路径全部因为干涉而相消毁灭。
          </p>
        </div>
      </div>
    </div>
  );
}
