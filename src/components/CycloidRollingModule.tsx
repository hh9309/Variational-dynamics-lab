import React, { useState, useEffect, useRef } from "react";
import { RollingCircleState } from "../types";
import {
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Eye,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { BlockMath, InlineMath } from "../utils/mathRender";

export const CycloidRollingModule: React.FC = () => {
  const [state, setState] = useState<RollingCircleState>({
    radius: 2.2,
    theta: 0,
    isPlaying: true,
    speed: 1.0,
    showTrail: true,
    showVectors: true,
    showAuxiliary: true,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  // Animation Loop for rolling circle
  useEffect(() => {
    if (!state.isPlaying) {
      lastTime.current = null;
      return;
    }

    const maxTheta = 2 * Math.PI;

    const loop = (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      setState((prev) => {
        let nextTheta = prev.theta + dt * prev.speed * 1.5;
        if (nextTheta > maxTheta) {
          nextTheta = 0; // Loop seamlessly
        }
        return { ...prev, theta: nextTheta };
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [state.isPlaying, state.speed]);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "#FDFDFD";
    ctx.fillRect(0, 0, width, height);

    const padding = { left: 40, right: 40, top: 40, bottom: 60 };
    const drawWidth = width - padding.left - padding.right;

    // Physical bounds: 1 full cycle is 2*PI*r
    const maxWorldX = 2 * Math.PI * state.radius;
    const maxWorldY = 2 * state.radius;

    const scale = Math.min(
      drawWidth / maxWorldX,
      (height - padding.top - padding.bottom) / (maxWorldY * 1.4)
    );

    const groundY = padding.top + 30; // Rolling on top ceiling line for inverted cycloid
    const toScreenX = (wx: number) => padding.left + wx * scale;
    const toScreenY = (wy: number) => groundY + wy * scale;

    // 1. Draw Baseline (Rolling track)
    ctx.strokeStyle = "#34495E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left - 10, groundY);
    ctx.lineTo(toScreenX(maxWorldX) + 10, groundY);
    ctx.stroke();

    // Baseline tick marks
    ctx.fillStyle = "#64748B";
    ctx.font = "10px monospace";
    ctx.fillText("θ = 0 (起点)", padding.left - 10, groundY - 10);
    ctx.fillText("θ = π (拱底)", toScreenX(Math.PI * state.radius) - 20, groundY - 10);
    ctx.fillText("θ = 2π (终点)", toScreenX(2 * Math.PI * state.radius) - 20, groundY - 10);

    // 2. Draw Full Cycloid Trace Path
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * 2 * Math.PI;
      const wx = state.radius * (th - Math.sin(th));
      const wy = state.radius * (1 - Math.cos(th));
      const sx = toScreenX(wx);
      const sy = toScreenY(wy);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 3. Draw Active Trail Up to current theta
    if (state.showTrail) {
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const curSteps = Math.floor((state.theta / (2 * Math.PI)) * 150);
      for (let i = 0; i <= curSteps; i++) {
        const th = (i / 150) * 2 * Math.PI;
        const wx = state.radius * (th - Math.sin(th));
        const wy = state.radius * (1 - Math.cos(th));
        const sx = toScreenX(wx);
        const sy = toScreenY(wy);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // 4. Circle Center and Circle Geometry
    const circleCenterX = state.radius * state.theta;
    const circleCenterY = state.radius;
    const screenCenterX = toScreenX(circleCenterX);
    const screenCenterY = toScreenY(circleCenterY);
    const screenR = state.radius * scale;

    // Draw Rolling Circle
    ctx.fillStyle = "rgba(52, 73, 94, 0.05)";
    ctx.beginPath();
    ctx.arc(screenCenterX, screenCenterY, screenR, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#34495E";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Center point
    ctx.fillStyle = "#34495E";
    ctx.beginPath();
    ctx.arc(screenCenterX, screenCenterY, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    // 5. Contact point on ground (Instantaneous Center of Rotation)
    const contactX = screenCenterX;
    const contactY = groundY;
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath();
    ctx.arc(contactX, contactY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // 6. Tracing Point P on perimeter
    const pointX = state.radius * (state.theta - Math.sin(state.theta));
    const pointY = state.radius * (1 - Math.cos(state.theta));
    const screenPointX = toScreenX(pointX);
    const screenPointY = toScreenY(pointY);

    // Draw Spokes (Radius arm from center to P)
    if (state.showAuxiliary) {
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(screenCenterX, screenCenterY);
      ctx.lineTo(screenPointX, screenPointY);
      ctx.stroke();

      // Normal line connecting P to Instantaneous Center of Rotation (contact point)
      ctx.strokeStyle = "#3B82F6";
      ctx.beginPath();
      ctx.moveTo(contactX, contactY);
      ctx.lineTo(screenPointX, screenPointY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Velocity Vector
    if (state.showVectors) {
      const nx = screenPointX - contactX;
      const ny = screenPointY - contactY;
      const normLen = Math.hypot(nx, ny);
      if (normLen > 1e-3) {
        const vx = -ny / normLen * 40;
        const vy = nx / normLen * 40;

        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenPointX, screenPointY);
        ctx.lineTo(screenPointX + vx, screenPointY + vy);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(vy, vx);
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.moveTo(screenPointX + vx, screenPointY + vy);
        ctx.lineTo(
          screenPointX + vx - 8 * Math.cos(angle - Math.PI / 6),
          screenPointY + vy - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          screenPointX + vx - 8 * Math.cos(angle + Math.PI / 6),
          screenPointY + vy - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.fill();
      }
    }

    // Draw Tracking Point P
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(screenPointX, screenPointY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text Label for P
    ctx.fillStyle = "#2C3E50";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`P(${pointX.toFixed(2)}, ${pointY.toFixed(2)})`, screenPointX + 8, screenPointY + 12);
  }, [state]);

  const currentX = state.radius * (state.theta - Math.sin(state.theta));
  const currentY = state.radius * (1 - Math.cos(state.theta));
  const arcLengthTotal = 8 * state.radius;
  const areaTotal = 3 * Math.PI * Math.pow(state.radius, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
                MODULE 03
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
                摆线发生圆 2D 滚切轨迹几何演播
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              观察圆环沿水平线无滑动纯滚动时，圆周固定点划出最速降线（旋轮线）的纯几何生成历程。
            </p>
          </div>

          {/* Controls Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState((p) => ({ ...p, isPlaying: !p.isPlaying }))}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-2xs transition ${
                state.isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-[#34495E] hover:bg-[#2C3E50]"
              }`}
            >
              {state.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{state.isPlaying ? "暂停滚动" : "开始滚切"}</span>
            </button>

            <button
              onClick={() => setState((p) => ({ ...p, theta: 0, isPlaying: false }))}
              className="flex items-center gap-1 rounded-lg border border-[#E0E4E8] bg-white px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] shadow-2xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>复位</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Canvas and Controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Canvas Viewport */}
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-3">
            <span className="font-serif text-sm font-bold text-[#2C3E50] flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-[#34495E]" />
              <span>2D 纯滚动运动学解析图</span>
            </span>

            {/* Toggle Switches */}
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <label className="flex items-center gap-1 cursor-pointer hover:text-[#2C3E50]">
                <input
                  type="checkbox"
                  checked={state.showVectors}
                  onChange={(e) => setState((p) => ({ ...p, showVectors: e.target.checked }))}
                  className="rounded text-[#34495E]"
                />
                <span>速度矢量</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-[#2C3E50]">
                <input
                  type="checkbox"
                  checked={state.showAuxiliary}
                  onChange={(e) => setState((p) => ({ ...p, showAuxiliary: e.target.checked }))}
                  className="rounded text-[#34495E]"
                />
                <span>瞬时转动轴连线</span>
              </label>
            </div>
          </div>

          <div className="relative mt-3 flex items-center justify-center overflow-hidden rounded-lg border border-[#E0E4E8] bg-[#FDFDFD]">
            <canvas ref={canvasRef} width={720} height={360} className="w-full h-auto" />
          </div>

          {/* Scrubbing Slider Bar */}
          <div className="mt-4 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3">
            <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
              <span>拖拽滚动角度 θ (0 ~ 2π):</span>
              <span className="font-mono text-[#34495E]">
                {state.theta.toFixed(3)} rad ({(state.theta / Math.PI).toFixed(2)}π)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2 * Math.PI}
              step={0.02}
              value={state.theta}
              onChange={(e) => {
                setState((p) => ({ ...p, theta: parseFloat(e.target.value), isPlaying: false }));
              }}
              className="mt-1.5 w-full accent-[#34495E]"
            />
          </div>
        </div>

        {/* Right Geometric Insights & Radius Adjuster */}
        <div className="space-y-4 lg:col-span-4">
          {/* Radius Controller */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 font-serif text-sm font-bold text-[#2C3E50] border-b border-[#E0E4E8] pb-2">
              <Sliders className="h-4 w-4 text-[#34495E]" />
              <span>发生圆半径调节</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                <span>半径 r:</span>
                <span className="font-mono text-[#34495E]">{state.radius.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min={1}
                max={4.5}
                step={0.1}
                value={state.radius}
                onChange={(e) => setState((p) => ({ ...p, radius: parseFloat(e.target.value) }))}
                className="mt-1.5 w-full accent-[#34495E]"
              />
            </div>
          </div>

          {/* Mathematical Geometry Cards */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-3">
            <div className="font-serif text-sm font-bold text-[#2C3E50] border-b border-[#E0E4E8] pb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-[#34495E]" />
              <span>旋轮线三大经典几何定理</span>
            </div>

            {/* Theorem 1 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5 text-xs">
              <span className="font-bold text-[#2C3E50]">1. 单拱弧长定理 (Arc Length)：</span>
              <p className="mt-0.5 text-[#64748B]">
                一个完整周期的摆线弧长恰好等于发生圆直径的 4 倍：
              </p>
              <div className="mt-1 font-mono font-bold text-[#34495E] text-center">
                <InlineMath math="S = 8r" /> = {arcLengthTotal.toFixed(2)} m
              </div>
            </div>

            {/* Theorem 2 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5 text-xs">
              <span className="font-bold text-[#2C3E50]">2. 单拱面积定理 (Roberval 1634)：</span>
              <p className="mt-0.5 text-[#64748B]">
                摆线与底线所围面积严格等于发生圆面积的 3 倍：
              </p>
              <div className="mt-1 font-mono font-bold text-[#34495E] text-center">
                <InlineMath math="A = 3\pi r^2" /> = {areaTotal.toFixed(2)} m²
              </div>
            </div>

            {/* Theorem 3 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5 text-xs">
              <span className="font-bold text-[#2C3E50]">3. 瞬时速度与法线定理：</span>
              <p className="mt-0.5 text-[#64748B]">
                追踪点 <InlineMath math="P" /> 的切线永远垂直于 <InlineMath math="P" /> 与地面接触点（瞬心）的连线！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
