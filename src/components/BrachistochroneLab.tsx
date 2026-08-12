/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, HelpCircle, Flame, Layers, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface BrachistochroneLabProps {
  onAnalyze: (moduleName: string, stateDesc: string, params: any) => void;
  aiLoading: boolean;
}

export default function BrachistochroneLab({ onAnalyze, aiLoading }: BrachistochroneLabProps) {
  const [gravity, setGravity] = useState<number>(9.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [activeBallIndex, setActiveBallIndex] = useState<number>(-1); // For energy inspector

  // Curve control points
  const [startPoint, setStartPoint] = useState({ x: 50, y: 50 });
  const [endPoint, setEndPoint] = useState({ x: 530, y: 350 });
  // Custom curve control point (Bezier)
  const [controlPoint1, setControlPoint1] = useState({ x: 180, y: 120 });
  const [controlPoint2, setControlPoint2] = useState({ x: 380, y: 320 });

  const [draggedNode, setDraggedNode] = useState<'start' | 'end' | 'ctrl1' | 'ctrl2' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-generate discrete paths
  const [linePath, setLinePath] = useState<{x: number, y: number, t: number, v: number}[]>([]);
  const [cycloidPath, setCycloidPath] = useState<{x: number, y: number, t: number, v: number}[]>([]);
  const [arcPath, setArcPath] = useState<{x: number, y: number, t: number, v: number}[]>([]);
  const [customPath, setCustomPath] = useState<{x: number, y: number, t: number, v: number}[]>([]);

  // Physics parameter conversion
  const scale = 0.05; // 1px = 5cm = 0.05 meters

  // Generate paths based on physics equations
  useEffect(() => {
    const N = 150;
    const g = gravity;

    // Helper: calculate cumulative physical times for any sequence of points
    const computePhysicsPath = (pts: {x: number, y: number}[]) => {
      if (pts.length === 0) return [];
      const res: {x: number, y: number, t: number, v: number}[] = [];
      const y0 = pts[0].y;
      
      let runningTime = 0;
      res.push({ x: pts[0].x, y: pts[0].y, t: 0, v: 0 });

      for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i-1];
        const p2 = pts[i];
        
        const dx = (p2.x - p1.x) * scale;
        const dy = (p2.y - p1.y) * scale; // screen down is gravity direction
        const ds = Math.sqrt(dx * dx + dy * dy);
        
        // Mid-point energy elevation
        const dyAvg = ((p1.y + p2.y) / 2 - y0) * scale;
        // Avoid negative or zero speed at start
        const v = Math.sqrt(Math.max(0.01, 2 * g * dyAvg));
        const dt = ds / v;
        
        runningTime += dt;
        res.push({ x: p2.x, y: p2.y, t: runningTime, v: v });
      }
      return res;
    };

    // 1. 直线路径
    const linePts: {x: number, y: number}[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      linePts.push({
        x: startPoint.x + (endPoint.x - startPoint.x) * t,
        y: startPoint.y + (endPoint.y - startPoint.y) * t,
      });
    }
    setLinePath(computePhysicsPath(linePts));

    // 2. 自定义贝塞尔曲线
    const customPts: {x: number, y: number}[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = Math.pow(1 - t, 3) * startPoint.x +
                3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
                3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
                Math.pow(t, 3) * endPoint.x;
      const y = Math.pow(1 - t, 3) * startPoint.y +
                3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
                3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
                Math.pow(t, 3) * endPoint.y;
      customPts.push({ x, y });
    }
    setCustomPath(computePhysicsPath(customPts));

    // 3. 圆弧路径 (Arc of Circle)
    // 寻找两点之间凹向下的圆弧。我们简单用正弦/圆拟合或二次贝塞尔等作近似
    const arcPts: {x: number, y: number}[] = [];
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2 + Math.abs(endPoint.x - startPoint.x) * 0.15; // 凹下
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // 用二次贝塞尔来逼近圆弧
      const x = (1-t)*(1-t)*startPoint.x + 2*(1-t)*t*midX + t*t*endPoint.x;
      const y = (1-t)*(1-t)*startPoint.y + 2*(1-t)*t*midY + t*t*endPoint.y;
      arcPts.push({ x, y });
    }
    setArcPath(computePhysicsPath(arcPts));

    // 4. 最速降线（摆线 Cycloid）
    // 解析法：通过求解参数式 x = R(θ - sin θ), y = R(1 - cos θ) 拟合两端点
    // 我们在这里用数学逼近摆线：在起止点之间加入旋轮线。
    const cycloidPts: {x: number, y: number}[] = [];
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    
    // 求解摆线方程的 θ 终止参数: (1 - cos θ) / (θ - sin θ) = dy / dx;
    let thetaE = Math.PI; // 初始猜测
    const ratio = dy / dx;
    // 简易牛顿法求 thetaE
    for (let loop = 0; loop < 15; loop++) {
      const f = (1 - Math.cos(thetaE)) / (thetaE - Math.sin(thetaE)) - ratio;
      const df = (Math.sin(thetaE) * (thetaE - Math.sin(thetaE)) - (1 - Math.cos(thetaE)) * (1 - Math.cos(thetaE))) / Math.pow(thetaE - Math.sin(thetaE), 2);
      thetaE = thetaE - f / (df || 1);
    }
    thetaE = Math.max(0.5, Math.min(2 * Math.PI, thetaE));
    
    const R = dy / (1 - Math.cos(thetaE));
    
    for (let i = 0; i <= N; i++) {
      const progress = i / N;
      const theta = progress * thetaE;
      // 缩放到起止点
      const fitX = R * (theta - Math.sin(theta));
      const fitY = R * (1 - Math.cos(theta));
      
      // 映射到绝对屏幕坐标
      const x = startPoint.x + fitX * (dx / (R * (thetaE - Math.sin(thetaE)) || 1));
      const y = startPoint.y + fitY;
      cycloidPts.push({ x, y });
    }
    setCycloidPath(computePhysicsPath(cycloidPts));

  }, [startPoint, endPoint, controlPoint1, controlPoint2, gravity]);

  // Animation Loop for simulation
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const start = Date.now();
      const maxDuration = Math.max(
        linePath[linePath.length-1]?.t || 1,
        cycloidPath[cycloidPath.length-1]?.t || 1,
        arcPath[arcPath.length-1]?.t || 1,
        customPath[customPath.length-1]?.t || 1
      ) * 1000; // in ms

      const run = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(1, elapsed / maxDuration);
        setAnimProgress(progress);
        if (progress < 1) {
          animId = requestAnimationFrame(run);
        } else {
          setIsPlaying(false);
        }
      };
      animId = requestAnimationFrame(run);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, linePath, cycloidPath, arcPath, customPath]);

  // Find exact coordinate / energy at current progress
  const getBallAtTimer = (path: {x: number, y: number, t: number, v: number}[], progress: number) => {
    if (path.length === 0) return { x: 0, y: 0, v: 0, t: 0, ek: 0, ep: 0 };
    const maxT = path[path.length - 1].t;
    const currentT = progress * maxT;

    // Find correct segment
    let index = 0;
    while (index < path.length - 1 && path[index].t < currentT) {
      index++;
    }
    const p1 = path[index === 0 ? 0 : index - 1];
    const p2 = path[index];
    const dt = p2.t - p1.t;
    const ratio = dt === 0 ? 0 : (currentT - p1.t) / dt;

    const x = p1.x + (p2.x - p1.x) * ratio;
    const y = p1.y + (p2.y - p1.y) * ratio;
    const v = p1.v + (p2.v - p1.v) * ratio;

    // Energy calculations
    // Ep = m * g * (H - y)
    // Ek = 0.5 * m * v^2
    const totalHeight = (350 - startPoint.y) * scale;
    const heightFromFloor = Math.max(0, (350 - y) * scale);
    const m = 1.0; // 1 kg standard mass for simplicity
    const ep = m * gravity * heightFromFloor;
    const ek = 0.5 * m * v * v;

    return { x, y, v, t: currentT, ek, ep };
  };

  const balls = [
    { name: '直线黄昏', path: linePath, color: '#f59e0b', label: '直线' },
    { name: '最速降线', path: cycloidPath, color: '#0ea5e9', label: '摆线 (最速)' },
    { name: '圆弧下落', path: arcPath, color: '#10b981', label: '圆弧' },
    { name: '自定义路径', path: customPath, color: '#ec4899', label: '自定义' },
  ];

  // Draw speed vector fields background & traces
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw elegant physics grid
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Vector Speed Fields (Faint gravity acceleration arrows)
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    for (let x = 60; x < canvas.width; x += 60) {
      for (let y = 60; y < canvas.height; y += 50) {
        if (y > startPoint.y && y < endPoint.y + 20) {
          // speed factor grows with depth
          const depth = (y - startPoint.y) * scale;
          const mag = Math.min(15, Math.sqrt(2 * gravity * depth) * 2.5);
          ctx.beginPath();
          ctx.moveTo(x, y - mag/2);
          ctx.lineTo(x, y + mag/2);
          ctx.stroke();

          // Arrow head
          ctx.beginPath();
          ctx.moveTo(x - 2, y + mag/2 - 2);
          ctx.lineTo(x, y + mag/2);
          ctx.lineTo(x + 2, y + mag/2 - 2);
          ctx.fill();
        }
      }
    }

    // 3. Draw the compared curves with SVG glow filter
    balls.forEach((b, idx) => {
      if (b.path.length === 0) return;
      
      ctx.save();
      // Set the SVG filter standard for glowing dynamic paths
      if ('filter' in ctx) {
        ctx.filter = 'url(#brach-path-glow)';
      }
      
      ctx.strokeStyle = b.color;
      ctx.lineWidth = activeBallIndex === idx ? 4 : 2.2;
      ctx.beginPath();
      ctx.moveTo(b.path[0].x, b.path[0].y);
      for (let i = 1; i < b.path.length; i++) {
        ctx.lineTo(b.path[i].x, b.path[i].y);
      }
      ctx.stroke();

      // Additional faint outer ambient glow (thick backdrop stroke)
      ctx.strokeStyle = b.color;
      ctx.lineWidth = activeBallIndex === idx ? 12 : 8;
      ctx.globalAlpha = 0.12;
      ctx.stroke();
      
      ctx.restore();
    });

    // 4. Draw control lines for the custom curve (pink)
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(controlPoint1.x, controlPoint1.y);
    ctx.moveTo(endPoint.x, endPoint.y);
    ctx.lineTo(controlPoint2.x, controlPoint2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Beads/Balls sliding with beautiful kinetic trailing particles
    balls.forEach((b, idx) => {
      const state = getBallAtTimer(b.path, animProgress);
      if (!state) return;

      // Draw elegant fading trail particles behind the current ball
      if (animProgress > 0) {
        const trailLen = 8;
        for (let tStep = 1; tStep <= trailLen; tStep++) {
          const trailProgress = Math.max(0, animProgress - (tStep * 0.015));
          const trailState = getBallAtTimer(b.path, trailProgress);
          if (trailState) {
            ctx.fillStyle = b.color;
            ctx.globalAlpha = (1 - (tStep / trailLen)) * 0.45;
            ctx.beginPath();
            ctx.arc(trailState.x, trailState.y, 6 - (tStep * 0.4), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Outer highlight
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(state.x, state.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // Inner elegant core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.x, state.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vectors overlay if moving
      if (isPlaying) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5;
        // Vector pointing to direction (approximated)
        const nextState = getBallAtTimer(b.path, Math.min(1, animProgress + 0.01));
        const dx = nextState.x - state.x;
        const dy = nextState.y - state.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          ctx.beginPath();
          ctx.moveTo(state.x, state.y);
          ctx.lineTo(state.x + (dx/len) * (state.v * 6), state.y + (dy/len) * (state.v * 6));
          ctx.stroke();

          // Elegant arrow head for speed velocity vector
          const vx = state.x + (dx/len) * (state.v * 6);
          const vy = state.y + (dy/len) * (state.v * 6);
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(vx, vy, 2.5, 0, Math.PI*2);
          ctx.fill();
        }
      }
    });

    // 6. Draw main Start & End nodes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // 7. Label labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, sans-serif';
    ctx.fillText('A (起点)', startPoint.x - 20, startPoint.y - 12);
    ctx.fillText('B (终点)', endPoint.x - 10, endPoint.y + 20);

  }, [linePath, cycloidPath, arcPath, customPath, animProgress, isPlaying, controlPoint1, controlPoint2, activeBallIndex]);

  // Handle Drag Nodes inside canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dist = (p1: {x:number, y:number}, p2: {x:number, y:number}) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    if (dist({x, y}, startPoint) < 15) {
      setDraggedNode('start');
    } else if (dist({x, y}, endPoint) < 15) {
      setDraggedNode('end');
    } else if (dist({x, y}, controlPoint1) < 15) {
      setDraggedNode('ctrl1');
    } else if (dist({x, y}, controlPoint2) < 15) {
      setDraggedNode('ctrl2');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(10, Math.min(canvas.width - 10, e.clientX - rect.left));
    const y = Math.max(10, Math.min(canvas.height - 10, e.clientY - rect.top));

    if (draggedNode === 'start') {
      // Must remain higher than endpoint generally for physics.
      setStartPoint({ x, y: Math.min(endPoint.y - 30, y) });
    } else if (draggedNode === 'end') {
      setEndPoint({ x, y: Math.max(startPoint.y + 30, y) });
    } else if (draggedNode === 'ctrl1') {
      setControlPoint1({ x, y });
    } else if (draggedNode === 'ctrl2') {
      setControlPoint2({ x, y });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const requestAIAnalysis = () => {
    const linesT = linePath[linePath.length-1]?.t.toFixed(4) || '0';
    const cycloidT = cycloidPath[cycloidPath.length-1]?.t.toFixed(4) || '0';
    const arcT = arcPath[arcPath.length-1]?.t.toFixed(4) || '0';
    const customT = customPath[customPath.length-1]?.t.toFixed(4) || '0';

    const desc = `最速降线仿真状态：
- 起点 (Screen coordinates): A(${startPoint.x}, ${startPoint.y}), 终点: B(${endPoint.x}, ${endPoint.y})
- 当前重力常数 g: ${gravity} m/s²
- 测量用时：
  1. 直线路径 (Line Path) 运行时间: ${linesT} 秒
  2. 数学最速降线 (摆线 Cycloid) 运行时间: ${cycloidT} 秒
  3. 二次圆弧路径 (Arc Path) 运行时间: ${arcT} 秒
  4. 用户自定义贝塞尔曲线 (Custom Path) 运行时间: ${customT} 秒

自定义控制折点1: (${controlPoint1.x}, ${controlPoint1.y}), 控制折点2: (${controlPoint2.x}, ${controlPoint2.y})
物理规律反映结果：摆线耗时为 ${cycloidT}s。当前自定义曲线耗时为 ${customT}s，较摆线慢 ${((Number(customT) - Number(cycloidT)) / Number(cycloidT) * 100).toFixed(1)}%。`;

    onAnalyze('brachistochrone', desc, {
      gravity,
      startPoint,
      endPoint,
      controlPoint1,
      controlPoint2,
      lineTime: Number(linesT),
      cycloidTime: Number(cycloidT),
      arcTime: Number(arcT),
      customTime: Number(customT)
    });
  };

  const lineTotalT = linePath[linePath.length-1]?.t || 0;
  const cycloidTotalT = cycloidPath[cycloidPath.length-1]?.t || 0;
  const arcTotalT = arcPath[arcPath.length-1]?.t || 0;
  const customTotalT = customPath[customPath.length-1]?.t || 0;

  // Render selected ball energy
  const activeInsp = activeBallIndex >= 0 ? balls[activeBallIndex] : balls[1];
  const inspState = getBallAtTimer(activeInsp.path, animProgress);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="brachistoche-module">
      {/* Simulation Stage */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-xs relative">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
            <div>
              <h2 className="text-zinc-800 font-semibold flex items-center gap-1.5 text-base">
                <Flame className="w-4 h-4 text-sky-500" />
                最速降线重力粒子加速器
              </h2>
              <p className="text-xs text-zinc-500">
                拖动起点、终点或 <span className="text-pink-500 font-medium">粉色控制折线</span> 改变路径
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500 font-mono">重力 G: {gravity}m/s²</label>
              <input
                type="range"
                min="3"
                max="25"
                step="0.5"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-20 accent-sky-500 h-1 bg-zinc-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Area */}
          <div className="relative overflow-hidden bg-neutral-50/50 rounded-lg border border-zinc-100/60" ref={containerRef}>
            {/* Inline SVG definer for high contrast glowing filters */}
            <svg className="absolute h-0 w-0" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
              <defs>
                <filter id="brach-path-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feGaussianBlur stdDeviation="3" result="blur2" />
                  <feColorMatrix type="matrix" values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1.8 -0.1" in="blur1" result="brightBlur" />
                  <feMerge>
                    <feMergeNode in="brightBlur" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            <canvas
              ref={canvasRef}
              width={600}
              height={380}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-auto cursor-grab active:cursor-grabbing block"
              id="brachistochrone-canvas"
            />

            {/* Draggable Indicator Overlay markers */}
            <div
              className="absolute w-6 h-6 rounded-full border border-zinc-400 bg-white shadow-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-[9px] font-bold text-zinc-600"
              style={{ left: controlPoint1.x - 12, top: controlPoint1.y - 12, pointerEvents: 'none' }}
            >
              C1
            </div>
            <div
              className="absolute w-6 h-6 rounded-full border border-zinc-400 bg-white shadow-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-[9px] font-bold text-zinc-600"
              style={{ left: controlPoint2.x - 12, top: controlPoint2.y - 12, pointerEvents: 'none' }}
            >
              C2
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                id="btn-brachistochrone-play"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? '仿真中...' : '启动竞速加速'}
              </button>
              <button
                onClick={() => {
                  setAnimProgress(0);
                  setIsPlaying(false);
                }}
                className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-md transition-colors"
                title="重置"
                id="btn-brachistochrone-reset"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

            <button
              onClick={requestAIAnalysis}
              disabled={aiLoading}
              className="px-4 py-1.5 bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100/70 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              id="btn-ai-insight-brach"
            >
              {aiLoading ? 'AI 正在计算求解...' : '💡 AI 泛函解剖与洞察'}
            </button>
          </div>
        </div>

        {/* Energy dynamic transformation view */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-800 text-xs font-semibold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-500" />
              机械能转化实时监测仪
            </h3>
            <div className="flex gap-1.5">
              {balls.map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBallIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    (activeBallIndex === idx || (activeBallIndex === -1 && idx === 1))
                      ? 'text-white'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                  style={{ backgroundColor: (activeBallIndex === idx || (activeBallIndex === -1 && idx === 1)) ? b.color : undefined }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Split Ep / Ek */}
            <div className="border border-zinc-100/80 rounded-lg p-3 bg-neutral-50/20">
              <div className="text-[10px] text-zinc-400 font-mono mb-2">能量守恒状态 (E_total = E_k + E_p)</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-600 mb-1">
                    <span>重力势能 Eₚ (mgh)</span>
                    <span className="text-emerald-600">{(inspState?.ep || 0).toFixed(1)} J</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-75"
                      style={{ width: `${Math.min(100, ((inspState?.ep || 0) / (1 * gravity * (300*scale)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-600 mb-1">
                    <span>动能 Eₖ (½mv²)</span>
                    <span className="text-sky-600">{(inspState?.ek || 0).toFixed(1)} J</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-75"
                      style={{ width: `${Math.min(100, ((inspState?.ek || 0) / (0.5 * 1 * 60) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Physics statistics */}
            <div className="border border-zinc-100/80 rounded-lg p-3 bg-neutral-50/20 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-mono mb-1">实时微元运动参量 ({activeInsp.label})</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-1.5 rounded border border-zinc-50">
                  <div className="text-[10px] text-zinc-400">瞬时速度 v</div>
                  <div className="font-mono font-medium text-zinc-700">{(inspState?.v || 0).toFixed(2)} m/s</div>
                </div>
                <div className="bg-white p-1.5 rounded border border-zinc-50">
                  <div className="text-[10px] text-zinc-400">已用时间 t</div>
                  <div className="font-mono font-medium text-zinc-700">{(inspState?.t || 0).toFixed(3)} s</div>
                </div>
                <div className="bg-white p-1.5 rounded border border-zinc-50">
                  <div className="text-[10px] text-zinc-400">坐标 X</div>
                  <div className="font-mono font-medium text-zinc-700">{(inspState?.x * scale).toFixed(1)} m</div>
                </div>
                <div className="bg-white p-1.5 rounded border border-zinc-50">
                  <div className="text-[10px] text-zinc-400">高度 H (从地表)</div>
                  <div className="font-mono font-medium text-zinc-700">{Math.max(0, (350 - inspState?.y) * scale).toFixed(1)} m</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Speed comparisons and facts */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* Race Rankings */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-xs">
          <h3 className="text-zinc-800 font-semibold text-xs mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            竞速曲线用时排行榜 (变分优化)
          </h3>
          <div className="space-y-3">
            {balls.map((b, idx) => {
              const t = b.path[b.path.length-1]?.t || 0;
              const isCycloid = b.label.includes('摆线');
              return (
                <div key={idx} className="border border-zinc-50 rounded-lg p-2.5 bg-neutral-50/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium flex items-center gap-1.5 text-zinc-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.label}
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-900">
                      {t > 0 ? `${t.toFixed(4)}s` : '无法解析'}
                    </span>
                  </div>
                  {/* Visual Bar representation */}
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: b.color,
                        width: `${Math.max(10, (cycloidTotalT / (t || 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1 font-mono">
                    <span>起动至终点路径总长: {(b.path.length * scale * 2.5).toFixed(1)}m</span>
                    <span>{isCycloid ? '完美最理解' : `比摆线慢 ${(((t - cycloidTotalT) / (cycloidTotalT || 1)) * 100).toFixed(1)}%`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physics Education Card */}
        <div className="bg-emerald-50/20 border border-emerald-100/40 rounded-xl p-4">
          <h4 className="text-emerald-800 font-medium text-xs mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            最速降线与摆线的科学奥秘
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed space-y-1">
            <span>
              1696年，约翰·伯努利向欧洲数学家提出著名难题：重力粒子从高点滑落到低点，什么形状的曲线最省时间？他与莱布尼茨、牛顿等人发现这一最快通道并非直线，而是一条<strong>摆线（Cycloid）</strong>。
            </span>
            <span className="block mt-1">
              <strong>为什么不是直线？</strong> 因为在滑行初期，曲线越陡峭，滚轮加速越剧烈！摆线正是通过“前期极端加速、后期高效滑行”来缩短总用时的。它构成了数学分支——<strong>变分法 (Calculus of Variations)</strong> 的开端！
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
