/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sun, ShieldAlert, Award, Compass, HelpCircle, Activity } from 'lucide-react';

interface FermatOpticsStudioProps {
  onAnalyze: (moduleName: string, stateDesc: string, params: any) => void;
  aiLoading: boolean;
}

export default function FermatOpticsStudio({ onAnalyze, aiLoading }: FermatOpticsStudioProps) {
  // Configurable medium refractive indices
  const [nAir, setNAir] = useState<number>(1.0);
  const [nWater, setNWater] = useState<number>(1.33);
  const [nGlass, setNGlass] = useState<number>(1.6);
  const [nDiamond, setNDiamond] = useState<number>(2.1);

  // Position coordinates on canvas (600w x 360h)
  const [source, setSource] = useState({ x: 50, y: 40 });
  const [receiver, setReceiver] = useState({ x: 520, y: 320 });
  const [draggedNode, setDraggedNode] = useState<'source' | 'receiver' | null>(null);

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

  // Optical layers config
  const layers = [
    { name: '空气 (Air)', index: nAir, color: 'rgba(240, 249, 255, 0.4)', y0: 0, y1: 90 },
    { name: '水体 (Water)', index: nWater, color: 'rgba(224, 242, 254, 0.55)', y0: 90, y1: 180 },
    { name: '轻冕玻璃 (Light Glass)', index: nGlass, color: 'rgba(186, 230, 253, 0.65)', y0: 180, y1: 270 },
    { name: '重冕金刚介质 (Heavy Medium)', index: nDiamond, color: 'rgba(125, 211, 252, 0.75)', y0: 270, y1: 360 },
  ];

  // Store solved paths
  const [fermatPath, setFermatPath] = useState<{ x: number, y: number }[]>([]);
  const [straightPath, setStraightPath] = useState<{ x: number, y: number }[]>([]);

  const [fermatTime, setFermatTime] = useState<number>(0);
  const [straightTime, setStraightTime] = useState<number>(0);

  // Solver for Fermat Time Minimization
  useEffect(() => {
    // We have three interfaces at y = 90, 180, 270.
    // The points are (source.x, source.y) inside layer 0
    // and (receiver.x, receiver.y) inside layer 3.
    // We want to find x1, x2, x3 on lines y=90, y=180, y=270 respectively
    // to minimize Total Time T = sum_i n_i * distance_i / c.
    // We can solve this extremely fast using gradient descent or coordinate descent.
    
    let x1 = source.x + (receiver.x - source.x) * 0.25;
    let x2 = source.x + (receiver.x - source.x) * 0.50;
    let x3 = source.x + (receiver.x - source.x) * 0.75;

    const yVal = [source.y, 90, 180, 270, receiver.y];
    const indices = [nAir, nWater, nGlass, nDiamond];

    // Simple solver for Fermat path
    for (let iter = 0; iter < 150; iter++) {
      // 1. Evaluate Gradient for x1
      const d1 = Math.hypot(x1 - source.x, yVal[1] - yVal[0]);
      const d2 = Math.hypot(x2 - x1, yVal[2] - yVal[1]);
      if (d1 === 0 || d2 === 0) break;
      const t1_dx = indices[0] * (x1 - source.x) / d1;
      const t2_dx1 = indices[1] * (x1 - x2) / d2;
      const grad_x1 = t1_dx + t2_dx1;
      x1 -= grad_x1 * 4.0; // learning rate

      // 2. Evaluate Gradient for x2
      const d2_new = Math.hypot(x2 - x1, yVal[2] - yVal[1]);
      const d3 = Math.hypot(x3 - x2, yVal[3] - yVal[2]);
      if (d2_new === 0 || d3 === 0) break;
      const t2_dx2 = indices[1] * (x2 - x1) / d2_new;
      const t3_dx2 = indices[2] * (x2 - x3) / d3;
      const grad_x2 = t2_dx2 + t3_dx2;
      x2 -= grad_x2 * 4.0;

      // 3. Evaluate Gradient for x3
      const d3_new = Math.hypot(x3 - x2, yVal[3] - yVal[2]);
      const d4 = Math.hypot(receiver.x - x3, yVal[4] - yVal[3]);
      if (d3_new === 0 || d4 === 0) break;
      const t3_dx3 = indices[2] * (x3 - x2) / d3_new;
      const t4_dx3 = indices[3] * (x3 - receiver.x) / d4;
      const grad_x3 = t3_dx3 + t4_dx3;
      x3 -= grad_x3 * 4.0;
    }

    const solvedPts = [
      { x: source.x, y: source.y },
      { x: x1, y: 90 },
      { x: x2, y: 180 },
      { x: x3, y: 270 },
      { x: receiver.x, y: receiver.y },
    ];
    setFermatPath(solvedPts);

    // Compute total refractive index times
    // We treat speed of light as 100 px/sec in vacuum for proportional scaled values.
    const computeTravelTime = (pts: {x: number, y: number}[]) => {
      let tTotal = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const segLen = Math.hypot(pts[i+1].x - pts[i].x, pts[i+1].y - pts[i].y);
        // Find which layer this midpoint belongs to
        const midY = (pts[i+1].y + pts[i].y) / 2;
        let index = nAir;
        if (midY >= 90 && midY < 180) index = nWater;
        else if (midY >= 180 && midY < 270) index = nGlass;
        else if (midY >= 270) index = nDiamond;

        tTotal += (segLen * index) / 100; // in "micro-epochs"
      }
      return tTotal;
    };

    setFermatTime(computeTravelTime(solvedPts));

    // Construct straight Line to compare
    const straightPts: { x: number, y: number }[] = [];
    const N = 4;
    for (let i = 0; i <= N; i++) {
      const alpha = i / N;
      const currentY = source.y + (receiver.y - source.y) * alpha;
      const currentX = source.x + (receiver.x - source.x) * alpha;
      straightPts.push({ x: currentX, y: currentY });
    }
    setStraightPath(straightPts);
    setStraightTime(computeTravelTime(straightPts));

  }, [source, receiver, nAir, nWater, nGlass, nDiamond]);

  // Render optics canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw solid shaded medium layers with boundary labels
    layers.forEach((lyr) => {
      ctx.fillStyle = lyr.color;
      ctx.fillRect(0, lyr.y0, canvas.width, lyr.y1 - lyr.y0);

      // Boundary line
      if (lyr.y1 < 360) {
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, lyr.y1);
        ctx.lineTo(canvas.width, lyr.y1);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Layer labels
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${lyr.name} (n = ${lyr.index.toFixed(2)})`, 15, lyr.y0 + 20);
    });

    // 1.5 Dynamic Refracting Huygens Wavefront Propagation (Wave-Particle Duality)
    const renderWavefronts = true;
    if (renderWavefronts) {
      const timeOffset = (Date.now() / 1500) % 1;
      const numRays = 30;
      const stepOPL = 26; // spacing of wavefronts in Optical Path Length
      const maxOPL = 550;

      // Trace rays downwards with angular expansion
      const rays: { x: number, y: number, opl: number }[][] = [];
      const angles: number[] = [];
      for (let i = 0; i < numRays; i++) {
        // spread angularly from left-down to right-down
        const angleFromNormal = -1.38 + (i / (numRays - 1)) * 2.76;
        angles.push(angleFromNormal);
      }

      angles.forEach((uAngle) => {
        const rayPts: { x: number, y: number, opl: number }[] = [];
        let currX = source.x;
        let currY = source.y;
        let currOPL = 0;
        rayPts.push({ x: currX, y: currY, opl: currOPL });

        const interfaceY = [90, 180, 270, 360];
        let currentSin = Math.sin(uAngle);
        let currentCos = Math.cos(uAngle);
        let nPrev = nAir;

        for (let bIdx = 0; bIdx < interfaceY.length; bIdx++) {
          const nextY = interfaceY[bIdx];
          if (currY >= nextY) continue;
          
          const dy = nextY - currY;
          if (currentCos <= 1e-4) break; 

          const dx = dy * (currentSin / currentCos);
          const nextX = currX + dx;

          const segLen = Math.hypot(dx, dy);
          const segOPL = segLen * nPrev;

          currX = nextX;
          currY = nextY;
          currOPL += segOPL;
          rayPts.push({ x: currX, y: currY, opl: currOPL });

          const nNext = layers[bIdx + 1]?.index || nDiamond;
          const nextSin = (nPrev / nNext) * currentSin;
          if (Math.abs(nextSin) > 0.999) {
            break; // total internal reflection
          }
          currentSin = nextSin;
          currentCos = Math.sqrt(1 - currentSin * currentSin);
          nPrev = nNext;
        }

        if (currY < canvas.height && currentCos > 1e-4) {
          const dy = canvas.height - currY;
          const dx = dy * (currentSin / currentCos);
          const segLen = Math.hypot(dx, dy);
          currOPL += segLen * nPrev;
          rayPts.push({ x: currX + dx, y: canvas.height, opl: currOPL });
        }

        rays.push(rayPts);
      });

      const getCoordAtOPL = (ray: { x: number, y: number, opl: number }[], targetOPL: number) => {
        if (targetOPL <= 0) return { x: source.x, y: source.y };
        for (let i = 0; i < ray.length - 1; i++) {
          const p1 = ray[i];
          const p2 = ray[i+1];
          if (targetOPL >= p1.opl && targetOPL <= p2.opl) {
            const frac = (targetOPL - p1.opl) / (p2.opl - p1.opl);
            return {
              x: p1.x + (p2.x - p1.x) * frac,
              y: p1.y + (p2.y - p1.y) * frac
            };
          }
        }
        return null;
      };

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.lineWidth = 1.2;
      for (let wOPL = stepOPL * timeOffset; wOPL < maxOPL; wOPL += stepOPL) {
        ctx.beginPath();
        let first = true;
        for (let rIdx = 0; rIdx < rays.length; rIdx++) {
          const pt = getCoordAtOPL(rays[rIdx], wOPL);
          if (pt && pt.x >= 0 && pt.x <= canvas.width && pt.y >= 0 && pt.y <= canvas.height) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        ctx.stroke();
      }
    }

    // 2. Draw Straight direct path (Red, dashed, slower total refractive time)
    if (straightPath.length > 0) {
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(straightPath[0].x, straightPath[0].y);
      for (let i = 1; i < straightPath.length; i++) {
        ctx.lineTo(straightPath[i].x, straightPath[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw Beautiful Optically Refracted Fermat Path (Glow, Solid, Green-sky)
    if (fermatPath.length > 0) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fermatPath[0].x, fermatPath[0].y);
      for (let i = 1; i < fermatPath.length; i++) {
        ctx.lineTo(fermatPath[i].x, fermatPath[i].y);
      }
      ctx.stroke();

      // Glowing trail
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.15;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Draw wavefront pulses propagating
      const pulseTime = (Date.now() / 400) % 1;
      for (let i = 0; i < fermatPath.length - 1; i++) {
        const p1 = fermatPath[i];
        const p2 = fermatPath[i+1];
        const px = p1.x + (p2.x - p1.x) * pulseTime;
        const py = p1.y + (p2.y - p1.y) * pulseTime;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 4. Source and Receiver Node markers
    ctx.fillStyle = '#f59e0b'; // Gold source
    ctx.beginPath();
    ctx.arc(source.x, source.y, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(source.x, source.y, 3, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#3b82f6'; // Blue receiver
    ctx.beginPath();
    ctx.arc(receiver.x, receiver.y, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(receiver.x, receiver.y, 3, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = '9px JetBrains Mono, sans-serif';
    ctx.fillText('光源 A', source.x - 16, source.y - 12);
    ctx.fillText('探测仪 B', receiver.x - 20, receiver.y + 20);

  }, [source, receiver, fermatPath, straightPath, nAir, nWater, nGlass, nDiamond, tick]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (Math.hypot(x - source.x, y - source.y) < 15) {
      setDraggedNode('source');
    } else if (Math.hypot(x - receiver.x, y - receiver.y) < 15) {
      setDraggedNode('receiver');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(10, Math.min(canvas.width - 10, e.clientX - rect.left));
    const y = Math.max(10, Math.min(canvas.height - 10, e.clientY - rect.top));

    if (draggedNode === 'source') {
      setSource({ x, y: Math.min(80, y) }); // Keep source in top layer
    } else if (draggedNode === 'receiver') {
      setReceiver({ x, y: Math.max(280, y) }); // Keep target in bottom layers
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const triggerAI = () => {
    const desc = `费马变分光学状态：
- 光源: A(${source.x}, ${source.y}), 探测位置: B(${receiver.x}, ${receiver.y})
- 当前介质折射率层配置：
  1. 空气层 n1 = ${nAir.toFixed(2)}
  2. 水体层 n2 = ${nWater.toFixed(2)}
  3. 冕玻璃 n3 = ${nGlass.toFixed(2)}
  4. 金刚石极值层 n4 = ${nDiamond.toFixed(2)}
- 模拟光程时间 (微秒单位)：
  * 直线最短几何路径：${straightTime.toFixed(4)} μs
  * 变分最短时间路径 (Fermat Path)：${fermatTime.toFixed(4)} μs
  * 费马算法节省了：${((straightTime - fermatTime)/straightTime * 100).toFixed(2)}% 的绝对能量损耗与传递时间！`;

    onAnalyze('fermat', desc, {
      nAir, nWater, nGlass, nDiamond,
      source, receiver,
      fermatTime, straightTime,
      percentFaster: ((straightTime - fermatTime)/straightTime * 100)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="fermat-optics-module">
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Main Stage */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
            <div>
              <h2 className="text-zinc-800 font-semibold flex items-center gap-1.5 text-base">
                <Sun className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                费马原理多介质光路追迹
              </h2>
              <p className="text-xs text-zinc-500">
                上下拖动 <span className="text-amber-500 font-semibold">光源A</span> 或 <span className="text-blue-500 font-semibold">探测器B</span>，观察折射线在不同密度的边界质感
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-[10px] font-mono text-emerald-600 rounded">
                折射方程：n₁sinθ₁ = n₂sinθ₂
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-zinc-950 rounded-lg">
            <canvas
              ref={canvasRef}
              width={600}
              height={360}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-auto cursor-grab active:cursor-grabbing block"
              id="optics-canvas"
            />
          </div>

          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-zinc-400">
              绿色实体：大自然真实选择的最速路径 · 红色虚线：纯直线传导路径（忽略折射效应）
            </p>
            <button
              onClick={triggerAI}
              disabled={aiLoading}
              className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/70 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              id="btn-ai-insight-fermat"
            >
              {aiLoading ? 'AI 泛函求解中...' : '💡 AI 费马折射洞察'}
            </button>
          </div>
        </div>

        {/* Real-time comparison metrics */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-zinc-800 font-semibold text-xs mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            路径传播速度 & 变分折射光程对比
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-lg p-3">
              <div className="text-xs font-semibold text-emerald-800 flex justify-between items-center mb-1">
                <span>🟢 费马极速路径 (Fermat Path)</span>
                <span className="font-mono">{fermatTime.toFixed(3)} μs</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                光线依据变分原理，自动在折射率高的介质中压缩行进距离，并在低折射率区加大跨步，从而让总时间达到极度最优化。
              </p>
            </div>
            <div className="bg-red-50/20 border border-red-100/50 rounded-lg p-3">
              <div className="text-xs font-semibold text-red-800 flex justify-between items-center mb-1">
                <span>🔴 直线几何路径 (Straight Path)</span>
                <span className="font-mono text-zinc-500">{straightTime.toFixed(3)} μs</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                虽然直线是几何距离最短的路径，但因为在高折射率层（如重冕介质）中滞留时间过长，总光程时间反而比折射路径更长。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Parameters control */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm flex flex-col">
          <h3 className="font-bold text-zinc-800 text-xs mb-3 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-500" />
            各介质折射率调制器
          </h3>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>空气折射率 (n₁)</span>
                <span className="font-mono text-zinc-800">{nAir.toFixed(2)}</span>
              </div>
              <input
                type="range" min="1.0" max="1.5" step="0.05"
                value={nAir} onChange={(e) => setNAir(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-100 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>水体折射率 (n₂)</span>
                <span className="font-mono text-zinc-800">{nWater.toFixed(2)}</span>
              </div>
              <input
                type="range" min="1.1" max="1.6" step="0.05"
                value={nWater} onChange={(e) => setNWater(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-100 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>轻冕玻璃折射率 (n₃)</span>
                <span className="font-mono text-zinc-800">{nGlass.toFixed(2)}</span>
              </div>
              <input
                type="range" min="1.3" max="1.9" step="0.05"
                value={nGlass} onChange={(e) => setNGlass(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-100 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>重冕金刚层折射率 (n₄)</span>
                <span className="font-mono text-zinc-800">{nDiamond.toFixed(2)}</span>
              </div>
              <input
                type="range" min="1.5" max="3.0" step="0.05"
                value={nDiamond} onChange={(e) => setNDiamond(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-100 rounded"
              />
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-neutral-50 rounded-lg border border-zinc-100 text-[10px] text-zinc-500 font-mono space-y-1">
            <span className="font-bold text-zinc-700 block">偏折度指标 ΔT</span>
            <span>当前时间节省差: {Math.max(0, straightTime - fermatTime).toFixed(4)}s</span>
            <span className="block text-emerald-600 font-semibold">折射优化比: {((straightTime - fermatTime)/straightTime * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Fermat description */}
        <div className="bg-emerald-50/20 border border-emerald-100/40 rounded-xl p-4">
          <h4 className="text-emerald-800 font-medium text-xs mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            费马最短时间原理是什么？
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            法国数学家皮埃尔·德·费马指出：<strong>“光传播的路径总是耗时最短的路径”</strong>。 
            当光跨越不同介质时，由于其在介质中的速度不一样，直扑对方并不是最快的。相反，多在速度快的介质里跑点、速度慢的地方赶快偏折，才能获得“全局时间效率最速”。
            这构成了光学乃至相对论引力透镜的核心变分数学机制。
          </p>
        </div>
      </div>
    </div>
  );
}
