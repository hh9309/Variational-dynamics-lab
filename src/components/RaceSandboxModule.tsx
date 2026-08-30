import React, { useState, useEffect, useRef, useMemo } from "react";
import { SandboxConfig, CurvePhysicsData, Point2D } from "../types";
import {
  buildComparativeCurves,
  computeTrajectoryPhysics,
} from "../utils/physics";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Trophy,
  Activity,
  Gauge,
  Sliders,
  Settings2,
  Sparkles,
  BarChart3,
  Zap,
  TrendingUp,
  Flame,
  ShieldCheck,
  Layers,
  ArrowDownRight,
  Info,
} from "lucide-react";
import { BlockMath, InlineMath } from "../utils/mathRender";

interface RaceSandboxModuleProps {
  config: SandboxConfig;
  setConfig: React.Dispatch<React.SetStateAction<SandboxConfig>>;
  onOpenAiWithContext: (curves: CurvePhysicsData[]) => void;
}

export const RaceSandboxModule: React.FC<RaceSandboxModuleProps> = ({
  config,
  setConfig,
  onOpenAiWithContext,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [selectedCurveId, setSelectedCurveId] = useState<string>("cycloid");
  const [dashboardTab, setDashboardTab] = useState<"energy" | "velocity" | "comparison">("energy");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);

  // Compute curve geometries and physics profiles
  const curves = useMemo(() => {
    const dx = Math.abs(config.endX - config.startX);
    const dy = Math.abs(config.endY - config.startY);
    return buildComparativeCurves(
      dx,
      dy,
      config.gravity,
      config.friction,
      config.airDrag,
      config.dragModel
    );
  }, [
    config.startX,
    config.startY,
    config.endX,
    config.endY,
    config.gravity,
    config.friction,
    config.airDrag,
    config.dragModel,
  ]);

  // Track real-time progress for each curve at simTime
  const activeCurvesState = useMemo(() => {
    const validSimTime = Number.isFinite(simTime) ? Math.max(0, simTime) : 0;
    const sorted = [...curves].sort((a, b) => a.totalTime - b.totalTime);

    return curves.map((c) => {
      const isDone = validSimTime >= c.totalTime - 1e-5;
      const t = Math.min(validSimTime, c.totalTime);
      const ratio = c.totalTime > 0 ? Math.min(1, Math.max(0, t / c.totalTime)) : 0;

      // Sample position and velocity along curve
      let pos: Point2D = c.points[0];
      let vel = 0;
      let tangentSlope = 0;

      // Use precalculated points and maps
      const timeMap =
        c.timeMap ||
        computeTrajectoryPhysics(
          c.points,
          config.gravity,
          config.friction,
          config.airDrag,
          config.dragModel
        ).timeMap;
      const velMap =
        c.velMap ||
        computeTrajectoryPhysics(
          c.points,
          config.gravity,
          config.friction,
          config.airDrag,
          config.dragModel
        ).velMap;

      // Find segment matching time t
      for (let i = 0; i < timeMap.length - 1; i++) {
        if (t >= timeMap[i] && t <= timeMap[i + 1]) {
          const segDt = timeMap[i + 1] - timeMap[i];
          const localFrac = segDt > 1e-7 ? Math.min(1, Math.max(0, (t - timeMap[i]) / segDt)) : 0;
          pos = {
            x: c.points[i].x + localFrac * (c.points[i + 1].x - c.points[i].x),
            y: c.points[i].y + localFrac * (c.points[i + 1].y - c.points[i].y),
          };
          vel = velMap[i] + localFrac * (velMap[i + 1] - velMap[i]);
          
          const dx = c.points[i + 1].x - c.points[i].x;
          const dy = c.points[i + 1].y - c.points[i].y;
          const ds = Math.hypot(dx, dy);
          tangentSlope = ds > 1e-6 ? dy / ds : 0; // sin(alpha)
          break;
        }
      }

      if (isDone || ratio >= 0.999) {
        pos = c.points[c.points.length - 1];
        vel = c.finalVelocity;
        const lastIdx = c.points.length - 1;
        const dx = c.points[lastIdx].x - c.points[lastIdx - 1].x;
        const dy = c.points[lastIdx].y - c.points[lastIdx - 1].y;
        const ds = Math.hypot(dx, dy);
        tangentSlope = ds > 1e-6 ? dy / ds : 0;
      }

      const rankIndex = sorted.findIndex((s) => s.id === c.id);

      // Energy calculations (benchmarked with unit mass m = 1.0 kg)
      const mass = 1.0; // kg
      const worldDy = Math.abs(config.endY - config.startY);
      const totalPotentialEnergy = mass * config.gravity * worldDy; // J
      const currentHeightAboveBottom = Math.max(0, worldDy - pos.y);
      const potentialEnergy = mass * config.gravity * currentHeightAboveBottom; // J
      const kineticEnergy = 0.5 * mass * vel * vel; // J
      const mechanicalEnergy = kineticEnergy + potentialEnergy;
      const totalLoss = Math.max(0, totalPotentialEnergy - mechanicalEnergy);

      // Tangential forces and accelerations
      const cosAlpha = Math.sqrt(Math.max(0, 1 - tangentSlope * tangentSlope));
      const aGravityFriction = Math.max(0, config.gravity * (tangentSlope - config.friction * cosAlpha));
      const dragDecel =
        config.dragModel === "linear"
          ? config.airDrag * vel
          : config.dragModel === "quadratic"
          ? config.airDrag * vel * vel
          : 0;
      const localAccel = Math.max(0, aGravityFriction - dragDecel);

      return {
        ...c,
        progress: ratio,
        currentPos: pos,
        currentVelocity: vel,
        tangentSlope,
        localAccel,
        dragDecel,
        kineticEnergy,
        potentialEnergy,
        mechanicalEnergy,
        frictionLoss: totalLoss,
        totalPotentialEnergy,
        timeElapsed: t,
        isFinished: isDone,
        rank: rankIndex + 1,
      };
    });
  }, [
    curves,
    simTime,
    config.startX,
    config.startY,
    config.endX,
    config.endY,
    config.gravity,
    config.friction,
    config.airDrag,
    config.dragModel,
  ]);

  // Max simulation time among all curves
  const maxFinishTime = useMemo(() => {
    return Math.max(...curves.map((c) => c.totalTime), 0.1);
  }, [curves]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimestamp.current = null;
      return;
    }

    let animId: number;
    const step = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp;
      }
      const deltaSec = Math.min((timestamp - lastTimestamp.current) / 1000, 0.05);
      lastTimestamp.current = timestamp;

      setSimTime((prev) => {
        const timeScale = (config.timeScale && Number.isFinite(config.timeScale) && config.timeScale > 0)
          ? config.timeScale
          : 1.0;
        const currentPrev = Number.isFinite(prev) ? prev : 0;
        const next = currentPrev + deltaSec * timeScale;
        if (next >= maxFinishTime) {
          setIsPlaying(false);
          return maxFinishTime;
        }
        return next;
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [isPlaying, config.timeScale, maxFinishTime]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#FCFDFF";
    ctx.fillRect(0, 0, width, height);

    // Padding ensuring all labels and markers are well within view
    const padding = { top: 45, right: 90, bottom: 55, left: 75 };
    const drawWidth = width - padding.left - padding.right;
    const drawHeight = height - padding.top - padding.bottom;

    const worldDx = Math.max(0.1, Math.abs(config.endX - config.startX));
    const worldDy = Math.max(0.1, Math.abs(config.endY - config.startY));

    const scaleX = drawWidth / worldDx;
    const scaleY = drawHeight / worldDy;

    const toScreenX = (wx: number) => padding.left + wx * scaleX;
    const toScreenY = (wy: number) => padding.top + wy * scaleY;

    // Draw Grid
    if (config.showGrid) {
      ctx.strokeStyle = "#EEF2F6";
      ctx.lineWidth = 1;
      const xSteps = 10;
      for (let i = 0; i <= xSteps; i++) {
        const wx = (i / xSteps) * worldDx;
        const sx = toScreenX(wx);
        ctx.beginPath();
        ctx.moveTo(sx, padding.top - 5);
        ctx.lineTo(sx, height - padding.bottom + 5);
        ctx.stroke();

        // X tick numbers
        ctx.fillStyle = "#94A3B8";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`${wx.toFixed(1)}m`, sx, height - padding.bottom + 8);
      }

      const ySteps = 6;
      for (let j = 0; j <= ySteps; j++) {
        const wy = (j / ySteps) * worldDy;
        const sy = toScreenY(wy);
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, sy);
        ctx.lineTo(width - padding.right + 5, sy);
        ctx.stroke();

        // Y tick numbers
        ctx.fillStyle = "#94A3B8";
        ctx.font = "10px monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(`${wy.toFixed(1)}m`, padding.left - 10, sy);
      }
    }

    // Draw Finish Line (Checkered pattern & line)
    const finishX = toScreenX(worldDx);
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(finishX, padding.top);
    ctx.lineTo(finishX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Finish Goal Marker banner
    ctx.fillStyle = "#34495E";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(finishX - 14, padding.top - 20, 28, 16, 3) : ctx.rect(finishX - 14, padding.top - 20, 28, 16);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FINISH", finishX, padding.top - 12);

    // Draw All Curves Track
    activeCurvesState.forEach((curve) => {
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = curve.id === "cycloid" ? 3.5 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      curve.points.forEach((pt, idx) => {
        const sx = toScreenX(pt.x);
        const sy = toScreenY(pt.y);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();

      // Motion Trail ribbon behind ball if enabled
      if (config.showTrails && curve.progress > 0.01) {
        const traversedPoints = curve.points.filter((pt) => pt.x <= curve.currentPos.x);
        if (traversedPoints.length > 1) {
          ctx.strokeStyle = curve.color;
          ctx.lineWidth = curve.id === "cycloid" ? 5 : 3.5;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          traversedPoints.forEach((pt, idx) => {
            const sx = toScreenX(pt.x);
            const sy = toScreenY(pt.y);
            if (idx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          });
          const currSx = toScreenX(curve.currentPos.x);
          const currSy = toScreenY(curve.currentPos.y);
          ctx.lineTo(currSx, currSy);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    });

    // Draw Starting and Ending Boundary markers & Pins
    // Start Point A
    const startSx = toScreenX(0);
    const startSy = toScreenY(0);
    ctx.fillStyle = "#2C3E50";
    ctx.beginPath();
    ctx.arc(startSx, startSy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#2C3E50";
    ctx.fillText(`起点 A (0, 0)`, startSx, startSy - 10);

    // End Point B
    const endSx = toScreenX(worldDx);
    const endSy = toScreenY(worldDy);
    ctx.fillStyle = "#34495E";
    ctx.beginPath();
    ctx.arc(endSx, endSy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#2C3E50";
    ctx.fillText(
      `终点 B (${worldDx.toFixed(1)}m, ${worldDy.toFixed(1)}m)`,
      endSx,
      endSy + 10
    );

    // Draw Balls and Particle Sparks
    activeCurvesState.forEach((curve) => {
      const sx = toScreenX(curve.currentPos.x);
      const sy = toScreenY(curve.currentPos.y);

      // Ball shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.beginPath();
      ctx.ellipse(sx, sy + 5, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tangent velocity vector arrow
      if (config.showVectors && curve.currentVelocity > 0.05) {
        const vNorm = Math.min(30, curve.currentVelocity * 2.5);
        const cosA = Math.sqrt(Math.max(0, 1 - curve.tangentSlope * curve.tangentSlope));
        const sinA = curve.tangentSlope;
        const vx = sx + cosA * vNorm;
        const vy = sy + sinA * vNorm;

        ctx.strokeStyle = curve.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(vx, vy);
        ctx.stroke();

        // Arrow head
        const headLen = 5;
        const angle = Math.atan2(vy - sy, vx - sx);
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(
          vx - headLen * Math.cos(angle - Math.PI / 6),
          vy - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          vx - headLen * Math.cos(angle + Math.PI / 6),
          vy - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = curve.color;
        ctx.fill();
      }

      // Ball Outer Halo if selected
      if (curve.id === selectedCurveId) {
        ctx.strokeStyle = curve.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ball Body with metallic lighting
      ctx.fillStyle = curve.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Specular shine glint
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(sx - 2.5, sy - 2.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Finish rank badge if done
      if (curve.isFinished) {
        ctx.fillStyle = curve.color;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `#${curve.rank} (${curve.totalTime.toFixed(3)}s)`,
          sx + 12,
          sy - 6
        );
      }
    });
  }, [activeCurvesState, config, simTime, selectedCurveId]);

  const handlePlayPause = () => {
    if (simTime >= maxFinishTime - 0.01) {
      setSimTime(0);
      lastTimestamp.current = null;
      setIsPlaying(true);
    } else {
      lastTimestamp.current = null;
      setIsPlaying((p) => !p);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    lastTimestamp.current = null;
    setSimTime(0);
  };
  const handleStepForward = () => {
    setIsPlaying(false);
    setSimTime((t) => Math.min(t + 0.05, maxFinishTime));
  };

  const cycloidCurve = activeCurvesState.find((c) => c.id === "cycloid");
  const lineCurve = activeCurvesState.find((c) => c.id === "straight_line");

  const timeDiffPercent =
    cycloidCurve && lineCurve && lineCurve.totalTime > 0
      ? (((lineCurve.totalTime - cycloidCurve.totalTime) / lineCurve.totalTime) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
                MODULE 02
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
                2D 多曲线小球下滑赛跑沙盒
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              同屏物理对比摆线（最速降线）、直线、抛物线与圆弧轨道小球下落动力学过程。
            </p>
          </div>

          {/* Quick AI Diagnostic Button */}
          <button
            onClick={() => onOpenAiWithContext(curves)}
            className="flex items-center gap-1.5 rounded-lg border border-[#34495E]/20 bg-[#F0F4F8] px-3.5 py-2 text-xs font-semibold text-[#2C3E50] shadow-2xs transition hover:bg-[#E2E8F0]"
          >
            <Sparkles className="h-4 w-4 text-[#34495E]" />
            <span>AI 沙盒轨道诊断</span>
          </button>
        </div>

        {/* Playback Control Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E0E4E8] pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-2xs transition ${
                isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-[#34495E] hover:bg-[#2C3E50]"
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? "暂停赛跑" : "释放小球 / 开始"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-[#E0E4E8] bg-white px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] shadow-2xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>复位</span>
            </button>

            <button
              onClick={handleStepForward}
              className="flex items-center gap-1 rounded-lg border border-[#E0E4E8] bg-white px-2.5 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] shadow-2xs transition"
              title="单步前进 0.05s"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">微步</span>
            </button>

            {/* Time Scale Multipliers */}
            <div className="flex items-center rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-0.5 text-[11px] font-mono">
              {[0.25, 0.5, 1.0, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setConfig((prev) => ({ ...prev, timeScale: rate }))}
                  className={`rounded px-2.5 py-1 font-semibold transition ${
                    config.timeScale === rate
                      ? "bg-[#34495E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Simulation Timer Display */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#1E293B] px-3.5 py-1.5 font-mono text-white shadow-2xs border border-slate-700">
              <span className="text-[10px] text-slate-400">下滑耗时 t: </span>
              <span className="text-sm font-bold text-emerald-400">{simTime.toFixed(3)} s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas & Leaderboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 2D Canvas Viewport */}
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-3">
            <span className="font-serif text-sm font-bold text-[#2C3E50] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#34495E]" />
              <span>2D 多轨道小球运动视口 (XY 平面)</span>
            </span>

            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#64748B] hover:text-[#2C3E50]">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => setConfig((p) => ({ ...p, showGrid: e.target.checked }))}
                  className="rounded text-[#34495E]"
                />
                <span>网格</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-[#64748B] hover:text-[#2C3E50]">
                <input
                  type="checkbox"
                  checked={config.showTrails}
                  onChange={(e) => setConfig((p) => ({ ...p, showTrails: e.target.checked }))}
                  className="rounded text-[#34495E]"
                />
                <span>轨迹拖尾</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-[#64748B] hover:text-[#2C3E50]">
                <input
                  type="checkbox"
                  checked={config.showVectors}
                  onChange={(e) => setConfig((p) => ({ ...p, showVectors: e.target.checked }))}
                  className="rounded text-[#34495E]"
                />
                <span>速度矢量</span>
              </label>
            </div>
          </div>

          <div className="relative mt-3 flex items-center justify-center overflow-hidden rounded-lg border border-[#E0E4E8] bg-[#FDFDFD]">
            <canvas
              ref={canvasRef}
              width={720}
              height={420}
              className="w-full h-auto max-h-[460px]"
            />
          </div>

          {/* Real-time Velocity Cards below canvas */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
            {activeCurvesState.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCurveId(c.id)}
                className={`cursor-pointer rounded-lg border p-2 text-xs transition ${
                  selectedCurveId === c.id
                    ? "border-[#34495E] bg-[#F0F4F8] shadow-2xs font-medium ring-1 ring-[#34495E]/30"
                    : "border-[#E0E4E8] bg-[#F8FAFC] hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-center gap-1 font-semibold" style={{ color: c.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="truncate">{c.name}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#2C3E50]">
                  v = {c.currentVelocity.toFixed(2)} m/s
                </div>
                <div className="font-mono text-[10px] text-[#64748B]">
                  {c.isFinished ? `到达: ${c.totalTime.toFixed(3)}s` : `已行进 ${(c.progress * 100).toFixed(0)}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Parameters & Live Leaderboard */}
        <div className="space-y-5 lg:col-span-4">
          {/* Live Leaderboard Card */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2.5">
              <span className="font-serif text-sm font-bold text-[#2C3E50] flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>实时到达排行榜</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                摆线快 {timeDiffPercent}%
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {[...activeCurvesState]
                .sort((a, b) => a.totalTime - b.totalTime)
                .map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCurveId(c.id)}
                    className={`flex items-center justify-between rounded-lg border p-2 text-xs transition cursor-pointer ${
                      c.id === selectedCurveId
                        ? "border-[#34495E] bg-[#F0F4F8] ring-1 ring-[#34495E]/20"
                        : c.id === "cycloid"
                        ? "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50"
                        : "border-[#E0E4E8] bg-[#F8FAFC] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                          idx === 0
                            ? "bg-amber-400 text-stone-900"
                            : idx === 1
                            ? "bg-stone-300 text-stone-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-[#2C3E50] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          弧长 L = {c.arcLength.toFixed(2)} m
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-[#2C3E50]">{c.totalTime.toFixed(4)} s</div>
                      <div className="text-[10px] text-[#64748B]">
                        {idx === 0 ? "🏆 最速到达" : `+${(c.totalTime - (cycloidCurve?.totalTime || 0)).toFixed(3)}s`}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Physical Parameter Sliders */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#E0E4E8] pb-2 font-serif text-sm font-bold text-[#2C3E50]">
              <Settings2 className="h-4 w-4 text-[#34495E]" />
              <span>实验场参数调节</span>
            </div>

            {/* Gravity Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                <span>重力加速度 g:</span>
                <span className="font-mono text-[#34495E]">{config.gravity.toFixed(2)} m/s²</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.1}
                value={config.gravity}
                onChange={(e) => {
                  setConfig((p) => ({ ...p, gravity: parseFloat(e.target.value) }));
                  handleReset();
                }}
                className="mt-1 w-full accent-[#34495E]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[#64748B] font-mono">
                <button onClick={() => { setConfig((p) => ({ ...p, gravity: 1.62 })); handleReset(); }} className="hover:text-[#2C3E50]">月球 1.62</button>
                <button onClick={() => { setConfig((p) => ({ ...p, gravity: 9.8 })); handleReset(); }} className="font-bold text-[#34495E] hover:underline">地球 9.8</button>
                <button onClick={() => { setConfig((p) => ({ ...p, gravity: 24.8 })); handleReset(); }} className="hover:text-[#2C3E50]">木星 24.8</button>
              </div>
            </div>

            {/* Friction Coefficient */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#2C3E50]">
                <span>动摩擦因数 μ:</span>
                <span className="font-mono text-[#34495E]">{config.friction.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.3}
                step={0.01}
                value={config.friction}
                onChange={(e) => {
                  setConfig((p) => ({ ...p, friction: parseFloat(e.target.value) }));
                  handleReset();
                }}
                className="mt-1 w-full accent-[#34495E]"
              />
              <div className="mt-1 text-[10px] text-[#64748B]">
                μ &gt; 0 时小球受接触面滑动摩擦 <InlineMath math="f = \mu N = \mu mg \cos\alpha" /> 阻力。
              </div>
            </div>

            {/* Aerodynamic Air Drag Model Selector & Coefficient */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2C3E50] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-rose-500" />
                  <span>空气动力学阻力 (Air Drag)</span>
                </span>
                <span className="font-mono text-[10px] font-bold text-[#34495E]">
                  {config.dragModel === "none"
                    ? "关闭"
                    : config.dragModel === "linear"
                    ? "一阶 Stokes (F=-kv)"
                    : "二阶 Newton (F=-kv²)"}
                </span>
              </div>

              {/* Model Choice Buttons */}
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <button
                  onClick={() => {
                    setConfig((p) => ({ ...p, dragModel: "none" }));
                    handleReset();
                  }}
                  className={`rounded py-1 px-1.5 font-medium transition ${
                    config.dragModel === "none"
                      ? "bg-[#34495E] text-white font-bold shadow-2xs"
                      : "bg-white border border-[#E0E4E8] text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  无阻力
                </button>
                <button
                  onClick={() => {
                    setConfig((p) => ({
                      ...p,
                      dragModel: "linear",
                      airDrag: p.airDrag > 0 ? p.airDrag : 0.08,
                    }));
                    handleReset();
                  }}
                  className={`rounded py-1 px-1.5 font-medium transition ${
                    config.dragModel === "linear"
                      ? "bg-[#34495E] text-white font-bold shadow-2xs"
                      : "bg-white border border-[#E0E4E8] text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  一阶 -kv
                </button>
                <button
                  onClick={() => {
                    setConfig((p) => ({
                      ...p,
                      dragModel: "quadratic",
                      airDrag: p.airDrag > 0 ? p.airDrag : 0.03,
                    }));
                    handleReset();
                  }}
                  className={`rounded py-1 px-1.5 font-medium transition ${
                    config.dragModel === "quadratic"
                      ? "bg-[#34495E] text-white font-bold shadow-2xs"
                      : "bg-white border border-[#E0E4E8] text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  二阶 -kv²
                </button>
              </div>

              {/* Drag Coefficient Slider (if active) */}
              {config.dragModel !== "none" && (
                <div className="pt-1.5 border-t border-[#E0E4E8]/80">
                  <div className="flex justify-between text-[11px] font-semibold text-[#2C3E50]">
                    <span>阻力系数 k ({config.dragModel === "linear" ? "s⁻¹" : "m⁻¹"}):</span>
                    <span className="font-mono text-[#34495E]">{config.airDrag.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.005}
                    max={config.dragModel === "linear" ? 0.35 : 0.15}
                    step={0.005}
                    value={config.airDrag}
                    onChange={(e) => {
                      setConfig((p) => ({ ...p, airDrag: parseFloat(e.target.value) }));
                      handleReset();
                    }}
                    className="mt-1 w-full accent-rose-600"
                  />
                  <div className="mt-1 text-[10px] text-[#64748B] leading-tight">
                    {config.dragModel === "linear" ? (
                      <span>低雷诺数粘性阻力：<InlineMath math="a_{\text{drag}} = k v" /></span>
                    ) : (
                      <span>高雷诺数气动压差阻力：<InlineMath math="a_{\text{drag}} = k v^2" /></span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Target Distance X & Y */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B]">水平跨度 X:</span>
                <input
                  type="number"
                  min={5}
                  max={30}
                  step={1}
                  value={config.endX}
                  onChange={(e) => {
                    setConfig((p) => ({ ...p, endX: Math.max(5, parseFloat(e.target.value) || 5) }));
                    handleReset();
                  }}
                  className="mt-1 w-full rounded border border-[#E0E4E8] bg-[#F8FAFC] p-1.5 text-xs font-mono text-[#2C3E50] focus:border-[#34495E] focus:outline-hidden"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#64748B]">下落落差 Y:</span>
                <input
                  type="number"
                  min={3}
                  max={25}
                  step={1}
                  value={config.endY}
                  onChange={(e) => {
                    setConfig((p) => ({ ...p, endY: Math.max(3, parseFloat(e.target.value) || 3) }));
                    handleReset();
                  }}
                  className="mt-1 w-full rounded border border-[#E0E4E8] bg-[#F8FAFC] p-1.5 text-xs font-mono text-[#2C3E50] focus:border-[#34495E] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Dedicated Real-time Physical Telemetry & Energy Dashboard */}
      {(() => {
        const currentTrack = activeCurvesState.find((c) => c.id === selectedCurveId) || activeCurvesState[0];
        const worldDy = Math.abs(config.endY - config.startY);
        const maxTheoreticalVel = Math.sqrt(2 * config.gravity * worldDy);
        const speedPercent = maxTheoreticalVel > 0 ? Math.min(100, (currentTrack.currentVelocity / maxTheoreticalVel) * 100) : 0;
        
        const totalE = Math.max(0.001, currentTrack.totalPotentialEnergy);
        const ekPercent = Math.min(100, Math.max(0, (currentTrack.kineticEnergy / totalE) * 100));
        const epPercent = Math.min(100, Math.max(0, (currentTrack.potentialEnergy / totalE) * 100));
        const lossPercent = Math.min(100, Math.max(0, (currentTrack.frictionLoss / totalE) * 100));

        return (
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs space-y-5">
            {/* Dashboard Header & Track Switcher */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-[#E0E4E8] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34495E] text-white shadow-2xs">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-[#2C3E50]">
                      实时物理数据仪表盘与能量演播
                    </h3>
                    <span className="rounded-md bg-[#EEF2F5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#34495E] border border-[#E0E4E8]">
                      TELEMETRY v1.0
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    正在监测轨道：<strong style={{ color: currentTrack.color }}>{currentTrack.name}</strong>（基准质量 <InlineMath math="m = 1.0\,\text{kg}" />）
                  </p>
                </div>
              </div>

              {/* View Tab Buttons */}
              <div className="flex items-center gap-1.5 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-1 text-xs">
                <button
                  onClick={() => setDashboardTab("energy")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                    dashboardTab === "energy"
                      ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                      : "text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>动能 vs 势能对比</span>
                </button>
                <button
                  onClick={() => setDashboardTab("velocity")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                    dashboardTab === "velocity"
                      ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                      : "text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span>瞬时速度与加速度</span>
                </button>
                <button
                  onClick={() => setDashboardTab("comparison")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                    dashboardTab === "comparison"
                      ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                      : "text-[#64748B] hover:text-[#2C3E50]"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>五轨道能量转化对比</span>
                </button>
              </div>
            </div>

            {/* Track Selector Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B] mr-1">选择探测目标:</span>
              {activeCurvesState.map((c) => {
                const isSelected = c.id === selectedCurveId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCurveId(c.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition border ${
                      isSelected
                        ? "bg-[#34495E] text-white border-[#34495E] shadow-2xs"
                        : "bg-[#F8FAFC] text-[#64748B] border-[#E0E4E8] hover:bg-white hover:text-[#2C3E50]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: isSelected ? "#ffffff" : c.color }}
                    />
                    <span>{c.name}</span>
                    <span
                      className={`ml-1 font-mono text-[10px] ${
                        isSelected ? "text-emerald-300" : "text-[#64748B]"
                      }`}
                    >
                      {c.currentVelocity.toFixed(1)}m/s
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: KINETIC VS POTENTIAL ENERGY BAR & CARDS */}
            {dashboardTab === "energy" && (
              <div className="space-y-4">
                {/* Visual Stacked Energy Proportional Bar */}
                <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#2C3E50]">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>实时能量分配比例条形图 (Total <InlineMath math="E_0 = mgH" /> = {totalE.toFixed(1)} J)</span>
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-emerald-600 font-bold">动能 {ekPercent.toFixed(1)}%</span>
                      <span className="text-amber-600 font-bold">势能 {epPercent.toFixed(1)}%</span>
                      {config.friction > 0 && (
                        <span className="text-rose-600 font-bold">摩擦损耗 {lossPercent.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>

                  {/* Multi-segment Bar */}
                  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200 flex shadow-inner">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-100"
                      style={{ width: `${ekPercent}%` }}
                      title={`动能: ${currentTrack.kineticEnergy.toFixed(2)} J (${ekPercent.toFixed(1)}%)`}
                    />
                    <div
                      className="h-full bg-amber-400 transition-all duration-100"
                      style={{ width: `${epPercent}%` }}
                      title={`重力势能: ${currentTrack.potentialEnergy.toFixed(2)} J (${epPercent.toFixed(1)}%)`}
                    />
                    {config.friction > 0 && (
                      <div
                        className="h-full bg-rose-500 transition-all duration-100"
                        style={{ width: `${lossPercent}%` }}
                        title={`摩擦热损耗: ${currentTrack.frictionLoss.toFixed(2)} J (${lossPercent.toFixed(1)}%)`}
                      />
                    )}
                  </div>

                  <div className="flex justify-between text-[11px] text-[#64748B] pt-0.5">
                    <span>起点释放 (纯势能 100%)</span>
                    <span>当前深度 <InlineMath math={`y = ${currentTrack.currentPos.y.toFixed(2)}\\,\\text{m}`} /></span>
                    <span>到达终点 (纯动能 100%{config.friction > 0 ? " - 摩擦损耗" : ""})</span>
                  </div>
                </div>

                {/* 3 Detailed Energy Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Kinetic Energy Card */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span>瞬时动能 (Kinetic Energy)</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        E_k
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-bold text-emerald-900">
                        {currentTrack.kineticEnergy.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs text-emerald-700">焦耳 (J)</span>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      公式：<InlineMath math="E_k = \frac{1}{2} m v^2" />
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-100"
                        style={{ width: `${ekPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Potential Energy Card */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <ArrowDownRight className="h-4 w-4 text-amber-600" />
                        <span>重力势能 (Potential Energy)</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        E_p
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-bold text-amber-900">
                        {currentTrack.potentialEnergy.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs text-amber-700">焦耳 (J)</span>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      公式：<InlineMath math="E_p = mg(\Delta Y - y)" />
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                      <div
                        className="h-full bg-amber-500 transition-all duration-100"
                        style={{ width: `${epPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Mechanical Energy Conservation / Loss Card */}
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2C3E50] flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#34495E]" />
                        <span>机械能总量与守恒状态</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-[#34495E] bg-[#EEF2F5] px-1.5 py-0.5 rounded border border-[#E0E4E8]">
                        E_mech
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-bold text-[#2C3E50]">
                        {currentTrack.mechanicalEnergy.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs text-[#64748B]">/ {totalE.toFixed(2)} J</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {config.friction === 0 && config.dragModel === "none" ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          理想真空无摩擦：机械能严格守恒
                        </span>
                      ) : (
                        <span className="text-rose-700 font-medium flex items-center gap-1">
                          <Flame className="h-3 w-3 text-rose-500" />
                          耗散总损失：<InlineMath math={`W_{\\text{loss}} = ${currentTrack.frictionLoss.toFixed(2)}\\,\\text{J}`} />
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#34495E] transition-all duration-100"
                        style={{ width: `${Math.min(100, (currentTrack.mechanicalEnergy / totalE) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INSTANTANEOUS VELOCITY & DYNAMICS GAUGE */}
            {dashboardTab === "velocity" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Speedometer Card */}
                <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-[#2C3E50] block">瞬时线速度 (Velocity)</span>
                  <div className="font-mono text-3xl font-bold text-[#34495E]">
                    {currentTrack.currentVelocity.toFixed(2)}
                    <span className="text-xs text-[#64748B] ml-1">m/s</span>
                  </div>
                  <div className="font-mono text-xs text-[#64748B]">
                    ≈ {(currentTrack.currentVelocity * 3.6).toFixed(1)} km/h
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-[#64748B] font-mono mb-1">
                      <span>0</span>
                      <span>理论极速: {maxTheoreticalVel.toFixed(1)} m/s</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-100"
                        style={{ width: `${speedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tangential Acceleration Card */}
                <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-[#2C3E50] block">切向瞬时加速度 (Tangential Accel)</span>
                  <div className="font-mono text-3xl font-bold text-amber-700">
                    {currentTrack.localAccel.toFixed(2)}
                    <span className="text-xs text-[#64748B] ml-1">m/s²</span>
                  </div>
                  <div className="text-xs text-[#64748B]">
                    当前坡度角 <InlineMath math={`\\alpha = ${(Math.asin(Math.min(1, currentTrack.tangentSlope)) * (180 / Math.PI)).toFixed(1)}^\\circ`} />
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-[#64748B] font-mono mb-1">
                      <span>0</span>
                      <span>重力加速度 g: {config.gravity.toFixed(1)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-amber-500 transition-all duration-100"
                        style={{ width: `${Math.min(100, (currentTrack.localAccel / config.gravity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Spatial Coordinates & Progress */}
                <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 space-y-2">
                  <span className="text-xs font-bold text-[#2C3E50] block">空间坐标与路程进度</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white p-2 rounded border border-[#E0E4E8]">
                      <span className="text-[#64748B] text-[10px] block">当前水平 X</span>
                      <span className="font-bold text-[#2C3E50]">{currentTrack.currentPos.x.toFixed(2)} m</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-[#E0E4E8]">
                      <span className="text-[#64748B] text-[10px] block">当前下落 Y</span>
                      <span className="font-bold text-[#2C3E50]">{currentTrack.currentPos.y.toFixed(2)} m</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-[#64748B] font-mono mb-1">
                      <span>已完成弧长比例:</span>
                      <span className="font-bold text-[#34495E]">{(currentTrack.progress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#34495E] transition-all duration-100"
                        style={{ width: `${currentTrack.progress * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-TRACK REAL-TIME ENERGY COMPARISON */}
            {dashboardTab === "comparison" && (
              <div className="space-y-3">
                <div className="text-xs text-[#64748B] flex items-center justify-between">
                  <span>所有 5 种轨道在当前时刻 <InlineMath math={`t = ${simTime.toFixed(3)}\\,\\text{s}`} /> 的动能转化横向对比：</span>
                  <span className="font-mono text-[11px] text-[#34495E]">基准总势能 <InlineMath math="E_0" /> = {totalE.toFixed(1)} J</span>
                </div>

                <div className="space-y-2.5">
                  {activeCurvesState.map((c) => {
                    const cEkPercent = totalE > 0 ? Math.min(100, (c.kineticEnergy / totalE) * 100) : 0;
                    const isCycloid = c.id === "cycloid";

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCurveId(c.id)}
                        className={`cursor-pointer rounded-lg border p-3 transition ${
                          c.id === selectedCurveId
                            ? "border-[#34495E] bg-[#F0F4F8] shadow-2xs"
                            : isCycloid
                            ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
                            : "border-[#E0E4E8] bg-[#F8FAFC] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                            <span className="text-[#2C3E50]">{c.name}</span>
                            {isCycloid && (
                              <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold">
                                最优能量转化
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] space-x-3 text-[#2C3E50]">
                            <span>v = <strong>{c.currentVelocity.toFixed(2)}</strong> m/s</span>
                            <span className="text-emerald-700 font-bold">E_k = {c.kineticEnergy.toFixed(2)} J ({cEkPercent.toFixed(1)}%)</span>
                          </div>
                        </div>

                        {/* Horizontal Energy Conversion Bar */}
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full transition-all duration-100"
                            style={{
                              width: `${cEkPercent}%`,
                              backgroundColor: c.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Core Physical Insight Note */}
                <div className="rounded-lg border border-[#E0E4E8] bg-[#EEF2F5] p-3 text-xs text-[#2C3E50] flex items-start gap-2">
                  <Info className="h-4 w-4 text-[#34495E] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>物理核心洞见：</strong>摆线（最速降线）在前半程以最陡峭的切角率先将大量重力势能快速转化为动能（<InlineMath math="E_k \uparrow" />），从而在整个运动过程中维持极高的平均巡航速率；直线路径虽然距离最短，但在前期加速过于迟缓，导致总滑落时间反而落后！
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
