import React, { useState, useEffect, useRef, useMemo } from "react";
import { TautochroneBall, Point2D } from "../types";
import {
  computeTautochronePosition,
  solveCycloidParameters,
} from "../utils/physics";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import { BlockMath, InlineMath } from "../utils/mathRender";

const BALL_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#9333ea"];

export const TautochroneModule: React.FC = () => {
  const [radius, setRadius] = useState<number>(3.0);
  const [gravity, setGravity] = useState<number>(9.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [ballCount, setBallCount] = useState<number>(4);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  // Exact quarter-period (arrival time at bottom vertex)
  const theoreticalArrivalTime = useMemo(() => {
    return Math.PI * Math.sqrt(radius / gravity);
  }, [radius, gravity]);

  // Initial ball configurations at different starting angles along cycloid
  // Theta ranges from ~0.2*PI to 0.95*PI
  const initialThetas = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < ballCount; i++) {
      const frac = 0.25 + (i / Math.max(1, ballCount - 1)) * 0.7;
      arr.push(frac * Math.PI);
    }
    return arr;
  }, [ballCount]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTime.current = null;
      return;
    }

    const loop = (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      setSimTime((prev) => {
        const next = prev + dt;
        if (next >= theoreticalArrivalTime + 0.3) {
          setIsPlaying(false);
          return theoreticalArrivalTime;
        }
        return next;
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, theoreticalArrivalTime]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#FDFDFD";
    ctx.fillRect(0, 0, width, height);

    const padding = { left: 40, right: 40, top: 40, bottom: 50 };
    const drawWidth = width - padding.left - padding.right;
    const drawHeight = height - padding.top - padding.bottom;

    // Symmetrical full cycloid arch from theta = 0 to theta = 2*PI, bottom vertex at theta = PI
    const maxWorldX = 2 * Math.PI * radius;
    const maxWorldY = 2 * radius;

    const scaleX = drawWidth / maxWorldX;
    const scaleY = drawHeight / (maxWorldY * 1.1);

    const toScreenX = (wx: number) => padding.left + wx * scaleX;
    const toScreenY = (wy: number) => padding.top + wy * scaleY;

    // 1. Draw Full Symmetric Cycloid Arch
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * 2 * Math.PI;
      const wx = radius * (th - Math.sin(th));
      const wy = radius * (1 - Math.cos(th));
      const sx = toScreenX(wx);
      const sy = toScreenY(wy);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 2. Draw Lowest Point (Vertex) Marker
    const vertexX = toScreenX(Math.PI * radius);
    const vertexY = toScreenY(2 * radius);

    ctx.strokeStyle = "#E0E4E8";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(vertexX, padding.top);
    ctx.lineTo(vertexX, vertexY + 15);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#34495E";
    ctx.beginPath();
    ctx.arc(vertexX, vertexY, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "#34495E";
    ctx.fillText("最低点 (θ = π)", vertexX - 35, vertexY + 24);

    // 3. Draw All Balls
    const isFinished = simTime >= theoreticalArrivalTime - 1e-4;

    initialThetas.forEach((startTh, idx) => {
      const color = BALL_COLORS[idx % BALL_COLORS.length];
      const ballState = computeTautochronePosition(radius, gravity, startTh, simTime);

      const sx = toScreenX(ballState.pos.x);
      const sy = toScreenY(ballState.pos.y);

      // Start ghost marker
      const startX = toScreenX(radius * (startTh - Math.sin(startTh)));
      const startY = toScreenY(radius * (1 - Math.cos(startTh)));
      ctx.fillStyle = "rgba(44, 62, 80, 0.12)";
      ctx.beginPath();
      ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Active Ball
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sx, sy, 7.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ball label
      ctx.fillStyle = color;
      ctx.font = "bold 10px monospace";
      ctx.fillText(`球 ${idx + 1}`, sx + 9, sy - 4);
    });

    // 4. Convergence Flash when arrived
    if (isFinished) {
      ctx.strokeStyle = "#D97706";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vertexX, vertexY, 20, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "#92400E";
      ctx.font = "bold 12px monospace";
      ctx.fillText("🎉 所有小球严格同时到达最低点！", vertexX - 100, padding.top + 20);
    }
  }, [radius, gravity, simTime, theoreticalArrivalTime, initialThetas]);

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
                MODULE 04
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
                摆线等时降落 (Tautochrone) 物理演播
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              验证惠更斯等时性定理：无论从摆线上何种高度同时释放小球，它们到达谷底耗时严格相同！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-2xs transition ${
                isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-[#34495E] hover:bg-[#2C3E50]"
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? "暂停下落" : "同时释放所有小球"}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setSimTime(0);
              }}
              className="flex items-center gap-1 rounded-lg border border-[#E0E4E8] bg-white px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] shadow-2xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>复位</span>
            </button>
          </div>
        </div>

        {/* Stopwatch Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E0E4E8] pt-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#34495E] px-3.5 py-1.5 font-mono text-white shadow-2xs">
              <span className="text-[10px] text-slate-300">实时计时 t: </span>
              <span className="text-sm font-bold text-emerald-400">{simTime.toFixed(4)} s</span>
            </div>
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] px-3.5 py-1.5 font-mono text-[#2C3E50]">
              <span className="text-[10px] text-[#64748B]">理论等时到达时间 T = π√(r/g): </span>
              <span className="text-sm font-bold text-[#34495E]">{theoreticalArrivalTime.toFixed(4)} s</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">测试小球数量:</span>
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setBallCount(num);
                  setSimTime(0);
                  setIsPlaying(false);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-mono font-bold transition ${
                  ballCount === num
                    ? "bg-[#34495E] text-white shadow-2xs"
                    : "border border-[#E0E4E8] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50]"
                }`}
              >
                {num} 个
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas and Mathematical Proof */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Viewport */}
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2.5">
            <span className="font-serif text-sm font-bold text-[#2C3E50] flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#34495E]" />
              <span>多高度小球同步下落 2D 视口</span>
            </span>
            <span className="font-mono text-[11px] text-[#64748B]">
              r = {radius.toFixed(1)}m, g = {gravity.toFixed(1)}m/s²
            </span>
          </div>

          <div className="relative mt-3 flex items-center justify-center overflow-hidden rounded-lg border border-[#E0E4E8] bg-[#FDFDFD]">
            <canvas ref={canvasRef} width={720} height={380} className="w-full h-auto" />
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                <span>发生圆半径 r:</span>
                <span className="font-mono text-[#34495E]">{radius.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={5.0}
                step={0.1}
                value={radius}
                onChange={(e) => {
                  setRadius(parseFloat(e.target.value));
                  setSimTime(0);
                  setIsPlaying(false);
                }}
                className="mt-1 w-full accent-[#34495E]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                <span>重力加速度 g:</span>
                <span className="font-mono text-[#34495E]">{gravity.toFixed(2)} m/s²</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={20.0}
                step={0.2}
                value={gravity}
                onChange={(e) => {
                  setGravity(parseFloat(e.target.value));
                  setSimTime(0);
                  setIsPlaying(false);
                }}
                className="mt-1 w-full accent-[#34495E]"
              />
            </div>
          </div>
        </div>

        {/* Right Mathematical Proof Card */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs space-y-4">
            <div className="font-serif text-sm font-bold text-[#2C3E50] border-b border-[#E0E4E8] pb-2 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>等时降落数学证明 (简谐振动)</span>
            </div>

            <div className="text-xs leading-relaxed text-[#64748B] space-y-2.5">
              <p>
                定义沿摆线弧长坐标 <InlineMath math="s" />（以最低点 <InlineMath math="\theta=\pi" /> 为原点），弧长微元为：
              </p>
              <BlockMath math="s = 4r \sin\frac{\theta}{2}" />

              <p className="text-[#2C3E50]">小球受重力沿切线方向的合加速度为：</p>
              <BlockMath math="a = \frac{d^2 s}{dt^2} = -g \sin\frac{\theta}{2} = -\left( \frac{g}{4r} \right) s" />

              <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 text-[#2C3E50] font-medium">
                这是一个<b>严格的简谐振动方程</b>（无任何小角度近似！）：
                <BlockMath math="\ddot{s} + \omega^2 s = 0, \quad \omega = \sqrt{\frac{g}{4r}}" />
                振动全周期为 <InlineMath math="T_{\text{full}} = \frac{2\pi}{\omega} = 4\pi\sqrt{\frac{r}{g}}" />。
              </div>

              <p className="text-[#2C3E50]">
                质点滑到最低点恰好为四分之一周期：
              </p>
              <div className="rounded-lg bg-[#34495E] p-2.5 text-center text-white font-mono font-bold text-xs shadow-2xs">
                <BlockMath math="T = \frac{T_{\text{full}}}{4} = \pi \sqrt{\frac{r}{g}}" />
              </div>
              <p className="text-[11px] text-[#64748B]">
                此时间仅取决于圆半径 <InlineMath math="r" /> 与重力 <InlineMath math="g" />，与释放位置（振幅）彻底无关！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
