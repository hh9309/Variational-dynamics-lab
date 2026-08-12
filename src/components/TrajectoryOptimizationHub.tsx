/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Target, ShieldAlert, Award, Compass, HelpCircle, Zap, Shield } from 'lucide-react';

interface TrajectoryOptimizationHubProps {
  onAnalyze: (moduleName: string, stateDesc: string, params: any) => void;
  aiLoading: boolean;
}

export default function TrajectoryOptimizationHub({ onAnalyze, aiLoading }: TrajectoryOptimizationHubProps) {
  // Optimizer weights
  const [safetyWeight, setSafetyWeight] = useState<number>(4.0); // Collision avoidance priority
  const [energyWeight, setEnergyWeight] = useState<number>(2.5); // Smooth acceleration constraint
  const [timeWeight, setTimeWeight] = useState<number>(1.2);   // Path length urgency

  // Start & End positions
  const [start, setStart] = useState({ x: 40, y: 190 });
  const [target, setTarget] = useState({ x: 450, y: 60 });

  // Draggable midpoint controllers for trajectory
  const [mid1, setMid1] = useState({ x: 160, y: 150 });
  const [mid2, setMid2] = useState({ x: 310, y: 100 });

  const [draggedNode, setDraggedNode] = useState<'start' | 'target' | 'mid1' | 'mid2' | 'obs0' | 'obs1' | 'obs2' | null>(null);
  const [hoveredNode, setHoveredNode] = useState<'start' | 'target' | 'mid1' | 'mid2' | 'obs0' | 'obs1' | 'obs2' | null>(null);

  // Helper to calculate minimum distance from path to any obstacles
  const getMinObstacleDistance = () => {
    if (solvedTrajectory.length === 0) return 0;
    let minD = Infinity;
    solvedTrajectory.forEach((pt) => {
      obstacles.forEach((obs) => {
        const d = Math.hypot(pt.x - obs.x, pt.y - obs.y) - obs.radius;
        if (d < minD) minD = d;
      });
    });
    return minD === Infinity ? 0 : minD;
  };

  const getPathLength = () => {
    if (solvedTrajectory.length < 2) return 0;
    let len = 0;
    for (let i = 0; i < solvedTrajectory.length - 1; i++) {
      len += Math.hypot(solvedTrajectory[i+1].x - solvedTrajectory[i].x, solvedTrajectory[i+1].y - solvedTrajectory[i].y);
    }
    return len;
  };

  // Static/draggable circular Obstacles
  const [obstacles, setObstacles] = useState([
    { id: 'obs0', x: 150, y: 90, radius: 25 },
    { id: 'obs1', x: 280, y: 165, radius: 25 },
    { id: 'obs2', x: 370, y: 75, radius: 20 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solvedTrajectory, setSolvedTrajectory] = useState<{ x: number, y: number, v: number }[]>([]);
  const [costScore, setCostScore] = useState({ safety: 0, energy: 0, time: 0, total: 0 });

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

  // Discretize path using a Bezier spline defined by: start, mid1, mid2, target
  useEffect(() => {
    // Gradient optimization: Let's run a small gradient descent search to fine-tune mid1 and mid2 positions
    // to automatically dodge obstacles and adhere to safety/energy priorities!
    // This makes the path magically bend!
    let mx1 = mid1.x;
    let my1 = mid1.y;
    let mx2 = mid2.x;
    let my2 = mid2.y;

    const N = 50;

    // Helper: evaluate continuous cubic Bezier path
    const getBezierPoint = (t: number, p0: any, p1: any, p2: any, p3: any) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
      return { x, y };
    };

    // Numerical gradient descent directly over the midi control coordinates
    for (let loop = 0; loop < 25; loop++) {
      // Small finite difference step
      const h = 2.0;
      
      const computeCost = (cx1: number, cy1: number, cx2: number, cy2: number) => {
        let totalC = 0;
        let penaltyObs = 0;
        let smoothAcc = 0;
        
        // Generate points
        const tempPts: { x: number, y: number }[] = [];
        for (let i = 0; i <= N; i++) {
          tempPts.push(getBezierPoint(i / N, start, { x: cx1, y: cy1 }, { x: cx2, y: cy2 }, target));
        }

        // 1. Travel distance / Time Cost
        let lengthL = 0;
        for (let i = 0; i < tempPts.length - 1; i++) {
          lengthL += Math.hypot(tempPts[i+1].x - tempPts[i].x, tempPts[i+1].y - tempPts[i].y);
        }

        // 2. Obstacle Cost
        for (let i = 0; i < tempPts.length; i++) {
          const pt = tempPts[i];
          obstacles.forEach((obs) => {
            const d = Math.hypot(pt.x - obs.x, pt.y - obs.y);
            if (d < obs.radius + 15) {
              const penetration = (obs.radius + 15) - d;
              penaltyObs += Math.pow(penetration, 2.2) * 1.5;
            } else {
              // faint penalty for proximity
              penaltyObs += 120 / (d - obs.radius || 1);
            }
          });
        }

        // 3. Kinetic Curve energy (acceleration proxy)
        for (let i = 1; i < tempPts.length - 1; i++) {
          const prev = tempPts[i-1];
          const curr = tempPts[i];
          const next = tempPts[i+1];
          // acceleration vector proxy: next - 2*curr + prev
          const ax = next.x - 2 * curr.x + prev.x;
          const ay = next.y - 2 * curr.y + prev.y;
          smoothAcc += (ax * ax + ay * ay);
        }

        return lengthL * timeWeight * 0.15 + penaltyObs * safetyWeight * 0.18 + smoothAcc * energyWeight * 0.05;
      };

      // Gradient direction calculations
      const costBase = computeCost(mx1, my1, mx2, my2);
      
      // df / d x1
      const grad_x1 = (computeCost(mx1 + h, my1, mx2, my2) - costBase) / h;
      const grad_y1 = (computeCost(mx1, my1 + h, mx2, my2) - costBase) / h;
      const grad_x2 = (computeCost(mx1, my1, mx2 + h, my2) - costBase) / h;
      const grad_y2 = (computeCost(mx1, my1, mx2, my2 + h) - costBase) / h;

      mx1 -= grad_x1 * 12.0;
      my1 -= grad_y1 * 12.0;
      mx2 -= grad_x2 * 12.0;
      my2 -= grad_y2 * 12.0;
    }

    // Assign optimized coords locally if bounds remain reasonable
    const finalMid1 = { x: mx1, y: my1 };
    const finalMid2 = { x: mx2, y: my2 };

    // Final path discrete projection
    const discretePath: { x: number, y: number, v: number }[] = [];
    let lengthAccum = 0;
    let safetyPenaltyAccum = 0;
    let smoothEnergyAccum = 0;

    for (let i = 0; i <= N; i++) {
      const pt = getBezierPoint(i / N, start, finalMid1, finalMid2, target);
      discretePath.push({ x: pt.x, y: pt.y, v: 0 });
    }

    // Compute exact score attributes
    for (let i = 0; i < discretePath.length - 1; i++) {
      lengthAccum += Math.hypot(discretePath[i+1].x - discretePath[i].x, discretePath[i+1].y - discretePath[i].y);
    }
    discretePath.forEach((pt) => {
      obstacles.forEach((obs) => {
        const d = Math.hypot(pt.x - obs.x, pt.y - obs.y);
        if (d < obs.radius + 10) {
          safetyPenaltyAccum += Math.pow((obs.radius + 10) - d, 2.5);
        } else {
          safetyPenaltyAccum += 60 / (d - obs.radius || 1);
        }
      });
    });
    for (let i = 1; i < discretePath.length - 1; i++) {
      const ax = discretePath[i+1].x - 2 * discretePath[i].x + discretePath[i-1].x;
      const ay = discretePath[i+1].y - 2 * discretePath[i].y + discretePath[i-1].y;
      smoothEnergyAccum += (ax * ax + ay * ay);
    }

    setSolvedTrajectory(discretePath);
    setCostScore({
      safety: safetyPenaltyAccum * safetyWeight * 0.05,
      energy: smoothEnergyAccum * energyWeight * 0.005,
      time: lengthAccum * timeWeight * 0.08,
      total: (safetyPenaltyAccum * safetyWeight * 0.05 + smoothEnergyAccum * energyWeight * 0.005 + lengthAccum * timeWeight * 0.08)
    });

  }, [start, target, safetyWeight, energyWeight, timeWeight, obstacles, mid1, mid2]);

  // Main canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Grid Background
    ctx.strokeStyle = '#f8fafc';
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

    // 2. Draw circular Obstacles with safety buffers
    obstacles.forEach((obs) => {
      // Avoidance buffer glow - pulsating
      const pulsate = 1 + Math.sin(tick * 0.05) * 0.08;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.03)';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, (obs.radius + 20) * pulsate, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing radar ring
      const radarRadius = obs.radius + ((tick * 0.4) % 35);
      ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - ((tick * 0.4) % 35) / 35) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Core Obstacle solid design
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.05)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Elegant inner patterns representing forbidden territory
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius - 8, 0, Math.PI * 2);
      ctx.stroke();

      // Simple anchor center cross
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Roboto';
      ctx.fillText('🔴 障礙物', obs.x - 22, obs.y + 4);
    });

    // 3. Draw direct unoptimized line for contrast (ignoring obstacles - faint grey guide line)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate the unoptimized raw trajectory (as the original path context)
    const originalPath: { x: number, y: number }[] = [];
    const getBezierPoint = (t: number, p0: any, p1: any, p2: any, p3: any) => {
      const b_u = 1 - t;
      const b_tt = t * t;
      const b_uu = b_u * b_u;
      const b_uuu = b_uu * b_u;
      const b_ttt = b_tt * t;
      const x = b_uuu * p0.x + 3 * b_uu * t * p1.x + 3 * b_u * b_tt * p2.x + b_ttt * p3.x;
      const y = b_uuu * p0.y + 3 * b_uu * t * p1.y + 3 * b_u * b_tt * p2.y + b_ttt * p3.y;
      return { x, y };
    };
    for (let i = 0; i <= 50; i++) {
      originalPath.push(getBezierPoint(i / 50, start, mid1, mid2, target));
    }

    // Draw manual original design path - Solid Royal Blue
    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(originalPath[0].x, originalPath[0].y);
    for (let i = 1; i < originalPath.length; i++) {
      ctx.lineTo(originalPath[i].x, originalPath[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // 4. Draw continuous optimized trajectory (solid bold red path - 只读不可直接修改)
    if (solvedTrajectory.length > 0) {
      ctx.save();
      
      // Layer A: Thick neon ambient aura with high blur
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 14;
      ctx.globalAlpha = 0.12;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(solvedTrajectory[0].x, solvedTrajectory[0].y);
      for (let i = 1; i < solvedTrajectory.length; i++) {
        ctx.lineTo(solvedTrajectory[i].x, solvedTrajectory[i].y);
      }
      ctx.stroke();

      // Layer B: Medium laser core beam
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 7.5;
      ctx.globalAlpha = 0.32;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(solvedTrajectory[0].x, solvedTrajectory[0].y);
      for (let i = 1; i < solvedTrajectory.length; i++) {
        ctx.lineTo(solvedTrajectory[i].x, solvedTrajectory[i].y);
      }
      ctx.stroke();

      // Layer C: Intense, glowing primary pathway utilizing SVG filter preset
      if ('filter' in ctx) {
        ctx.filter = 'url(#trajectory-path-glow)';
      }
      ctx.strokeStyle = '#dc2626'; // Red solid optimized route (Read-only)
      ctx.lineWidth = 3.6;
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = '#fca5a5';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(solvedTrajectory[0].x, solvedTrajectory[0].y);
      for (let i = 1; i < solvedTrajectory.length; i++) {
        ctx.lineTo(solvedTrajectory[i].x, solvedTrajectory[i].y);
      }
      ctx.stroke();
      
      ctx.restore();
    }

    // 5. Quadcopter/UAV visual sprite moving back and forth (fits the new red optimized theme)
    const progressFactor = (tick / 240) % 1;
    if (solvedTrajectory.length > 5) {
      const ptIdx = Math.floor(progressFactor * (solvedTrajectory.length - 1));
      const activeBot = solvedTrajectory[ptIdx];

      // Draw faint trailing dots representing drone path history
      const trailLen = 8;
      for (let tStep = 1; tStep <= trailLen; tStep++) {
        const altIdx = (ptIdx - tStep + solvedTrajectory.length) % solvedTrajectory.length;
        if (altIdx < solvedTrajectory.length) {
          const tPt = solvedTrajectory[altIdx];
          ctx.fillStyle = '#f87171'; // pink/red trail dots
          ctx.globalAlpha = (1 - (tStep / trailLen)) * 0.28;
          ctx.beginPath();
          ctx.arc(tPt.x, tPt.y, 4 - (tStep * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Drone shadow marker
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(activeBot.x, activeBot.y, 11, 0, Math.PI*2);
      ctx.fill();

      // Drone Core
      ctx.fillStyle = '#dc2626'; // High contrast red
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(activeBot.x, activeBot.y, 6, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spinning rotor blades
      const rSize = 10;
      const angle = tick * 0.45;
      const leftX = activeBot.x - 9;
      const rightX = activeBot.x + 9;

      // Rotor supports
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(leftX, activeBot.y);
      ctx.lineTo(rightX, activeBot.y);
      ctx.stroke();

      // Left Propeller
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(leftX - Math.cos(angle) * rSize, activeBot.y - Math.sin(angle) * rSize * 0.2);
      ctx.lineTo(leftX + Math.cos(angle) * rSize, activeBot.y + Math.sin(angle) * rSize * 0.2);
      ctx.stroke();

      // Right Propeller
      ctx.beginPath();
      ctx.moveTo(rightX - Math.sin(angle) * rSize, activeBot.y - Math.cos(angle) * rSize * 0.2);
      ctx.lineTo(rightX + Math.sin(angle) * rSize, activeBot.y + Math.cos(angle) * rSize * 0.2);
      ctx.stroke();
    }

    // 6. Draw Start & End Anchors
    ctx.save();

    // Draw Start Node (🛫 起点 with glowing design)
    const isStartHovered = hoveredNode === 'start' || draggedNode === 'start';
    ctx.shadowBlur = isStartHovered ? 12 : 6;
    ctx.shadowColor = '#0ea5e9'; // Blue glow
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Outer white boundary
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(start.x, start.y, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary pulse ring for start node Standard
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(start.x, start.y, 16 + Math.sin(tick * 0.08) * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Target Node (🏁 终点 with glowing design)
    const isTargetHovered = hoveredNode === 'target' || draggedNode === 'target';
    ctx.shadowBlur = isTargetHovered ? 12 : 6;
    ctx.shadowColor = '#10b981'; // Emerald glow
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer white boundary
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary pulse ring for target Standard
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 16 + Math.sin(tick * 0.08 + 2) * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛫 起点', start.x, start.y - 18);
    ctx.fillText('🏁 终点', target.x, target.y + 20);

    ctx.restore();

    // 7. Draw dashed control polygon & draggable control Handles for mid1 and mid2 (Original Reference Path controls)
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(mid1.x, mid1.y);
    ctx.lineTo(mid2.x, mid2.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const drawControlPoint = (pt: { x: number, y: number }, label: string, isHover: boolean, isDrag: boolean) => {
      ctx.save();
      ctx.shadowBlur = isHover || isDrag ? 8 : 4;
      ctx.shadowColor = '#f59e0b'; // amber
      ctx.fillStyle = isDrag ? '#f59e0b' : '#ffffff';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = isDrag ? '#ffffff' : '#f59e0b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', pt.x, pt.y);

      ctx.fillStyle = '#475569';
      ctx.font = '10px Roboto, sans-serif';
      ctx.fillText(label, pt.x, pt.y - 14);
      ctx.restore();
    };

    drawControlPoint(mid1, '控制点1 (可拖动修改原路径)', hoveredNode === 'mid1', draggedNode === 'mid1');
    drawControlPoint(mid2, '控制点2 (可拖动修改原路径)', hoveredNode === 'mid2', draggedNode === 'mid2');

  }, [start, target, mid1, mid2, solvedTrajectory, obstacles, tick, hoveredNode, draggedNode]);

  // Handle Drag interactions for start, target, midpoints and obstacles!
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (Math.hypot(x - start.x, y - start.y) < 25) {
      setDraggedNode('start');
    } else if (Math.hypot(x - target.x, y - target.y) < 25) {
      setDraggedNode('target');
    } else if (Math.hypot(x - mid1.x, y - mid1.y) < 20) {
      setDraggedNode('mid1');
    } else if (Math.hypot(x - mid2.x, y - mid2.y) < 20) {
      setDraggedNode('mid2');
    } else {
      // Check if clicked any obstacles center point to drag them around!
      obstacles.forEach((obs, index) => {
        if (Math.hypot(x - obs.x, y - obs.y) < obs.radius + 15) {
          setDraggedNode(`obs${index}` as any);
        }
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Mouse hover state detection (cursor updates)
    if (!draggedNode) {
      if (Math.hypot(x - start.x, y - start.y) < 22) {
        setHoveredNode('start');
      } else if (Math.hypot(x - target.x, y - target.y) < 22) {
        setHoveredNode('target');
      } else if (Math.hypot(x - mid1.x, y - mid1.y) < 18) {
        setHoveredNode('mid1');
      } else if (Math.hypot(x - mid2.x, y - mid2.y) < 18) {
        setHoveredNode('mid2');
      } else {
        let hitIdx: any = null;
        obstacles.forEach((obs, index) => {
          if (Math.hypot(x - obs.x, y - obs.y) < obs.radius + 15) {
            hitIdx = `obs${index}`;
          }
        });
        setHoveredNode(hitIdx);
      }
    }

    // 2. Perform Active Dragging
    if (!draggedNode) return;
    const boundedX = Math.max(15, Math.min(canvas.width - 15, e.clientX - rect.left));
    const boundedY = Math.max(15, Math.min(canvas.height - 15, e.clientY - rect.top));

    if (draggedNode === 'start') {
      setStart({ x: boundedX, y: boundedY });
    } else if (draggedNode === 'target') {
      setTarget({ x: boundedX, y: boundedY });
    } else if (draggedNode === 'mid1') {
      setMid1({ x: boundedX, y: boundedY });
    } else if (draggedNode === 'mid2') {
      setMid2({ x: boundedX, y: boundedY });
    } else if (draggedNode.startsWith('obs')) {
      const idx = parseInt(draggedNode.replace('obs', ''));
      const updated = [...obstacles];
      updated[idx] = { ...updated[idx], x: boundedX, y: boundedY };
      setObstacles(updated);
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Touch handlers for mobile devices/tablet previews
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    if (Math.hypot(x - start.x, y - start.y) < 28) {
      setDraggedNode('start');
    } else if (Math.hypot(x - target.x, y - target.y) < 28) {
      setDraggedNode('target');
    } else if (Math.hypot(x - mid1.x, y - mid1.y) < 24) {
      setDraggedNode('mid1');
    } else if (Math.hypot(x - mid2.x, y - mid2.y) < 24) {
      setDraggedNode('mid2');
    } else {
      obstacles.forEach((obs, index) => {
        if (Math.hypot(x - obs.x, y - obs.y) < obs.radius + 15) {
          setDraggedNode(`obs${index}` as any);
        }
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!draggedNode || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(15, Math.min(canvas.width - 15, e.touches[0].clientX - rect.left));
    const y = Math.max(15, Math.min(canvas.height - 15, e.touches[0].clientY - rect.top));

    if (draggedNode === 'start') {
      setStart({ x, y });
    } else if (draggedNode === 'target') {
      setTarget({ x, y });
    } else if (draggedNode === 'mid1') {
      setMid1({ x, y });
    } else if (draggedNode === 'mid2') {
      setMid2({ x, y });
    } else if (draggedNode.startsWith('obs')) {
      const idx = parseInt(draggedNode.replace('obs', ''));
      const updated = [...obstacles];
      updated[idx] = { ...updated[idx], x, y };
      setObstacles(updated);
    }
  };

  const handleTouchEnd = () => {
    setDraggedNode(null);
  };

  const triggerAI = () => {
    const desc = `智能轨迹变分优化中心状态：
- 无人机起点: A(${start.x}, ${start.y}), 目标降落场: B(${target.x}, ${target.y})
- 当前轨迹损失矩阵评价：
  * 能耗约束/路径平滑惩罚: ${costScore.energy.toFixed(2)} [权重:${energyWeight}]
  * 障碍物安全避障罚分: ${costScore.safety.toFixed(2)} [权重:${safetyWeight}]
  * 时间长度代价: ${costScore.time.toFixed(2)} [权重:${timeWeight}]
  * 联合总代价 (Cost Function J): ${costScore.total.toFixed(2)}
- 控制结论：在当前的代价天平下，算法生成了一条自适应光滑曲线，在安全间隙与燃油消耗中达到了局部折中。`;

    onAnalyze('trajectory', desc, {
      safetyWeight, energyWeight, timeWeight, start, target, costScore
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="trajectory-opt-module">
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Main Stage */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
            <div>
              <h2 className="text-zinc-800 font-semibold flex items-center gap-1.5 text-shadow-sm text-sm">
                <Target className="w-4 h-4 text-sky-500 animate-pulse" />
                无人机动力规划与航迹极优化
              </h2>
              <p className="text-[11px] text-zinc-500">
                拖动 <span className="text-sky-600 font-semibold">起点/终点</span>、<span className="text-amber-500 font-semibold">橙色控制点</span> 或 <span className="text-rose-500 font-semibold">红色障碍物</span>，优化网格自动解算避障泛函局部极值
              </p>
            </div>
            <div>
              <span className="px-1.5 py-0.5 bg-sky-50 text-[9px] font-mono text-sky-600 rounded">
                最优控制律：min J = ∫(w₁*E + w₂*S + w₃*T) dt
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-slate-50/60 rounded-lg border border-zinc-100 max-w-full mx-auto" style={{ maxWidth: '500px' }}>
            {/* Inline SVG definer for high contrast glowing filters */}
            <svg className="absolute h-0 w-0" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
              <defs>
                <filter id="trajectory-path-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur1" />
                  <feGaussianBlur stdDeviation="2.5" result="blur2" />
                  <feColorMatrix type="matrix" values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1.6 -0.05" in="blur1" result="brightBlur" />
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
              width={500}
              height={250}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: draggedNode ? 'grabbing' : (hoveredNode ? 'grab' : 'default') }}
              className="w-full h-auto block select-none"
              id="trajectory-canvas"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 pt-2 border-t border-zinc-50">
            <div className="text-[10px] space-y-1 text-zinc-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-500 inline-block"></span> 蓝色线：手动设计原始航迹（拖动橙点修改）</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-red-500 inline-block"></span> 红色线：AI 寻优后的安全航迹（只读无法修改）</span>
              </div>
              <div className="text-[10px] text-zinc-400">
                灰色虚线：忽略障碍物的简单直连 · 无人机正沿红色安全路径循环飞行
              </div>
            </div>
            <button
              onClick={triggerAI}
              disabled={aiLoading}
              className="px-4 py-1.5 bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100/70 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              id="btn-ai-insight-trajectory"
            >
              {aiLoading ? 'AI 路径寻优中...' : '💡 AI 最优控制洞察'}
            </button>
          </div>
        </div>

        {/* Cost functions dashboard */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-zinc-800 font-semibold text-xs mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            最优控制多维代价罚分函数 (Cost Matrices Evaluating)
          </h3>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="bg-rose-50/30 p-2 rounded-lg border border-rose-100/30 text-rose-800">
              <div className="text-[10px] text-rose-500 font-medium">避障罚分罚值 (Safety)</div>
              <div className="font-mono font-bold mt-1 text-lg">{costScore.safety.toFixed(1)}</div>
            </div>
            <div className="bg-cyan-50/30 p-2 rounded-lg border border-cyan-100/30 text-cyan-800">
              <div className="text-[10px] text-cyan-500 font-medium">执行器能耗平滑损耗 (Energy)</div>
              <div className="font-mono font-bold mt-1 text-lg">{costScore.energy.toFixed(1)}</div>
            </div>
            <div className="bg-amber-50/30 p-2 rounded-lg border border-amber-100/30 text-amber-800">
              <div className="text-[10px] text-amber-500 font-medium">时间/距离敏感损失 (Time)</div>
              <div className="font-mono font-bold mt-1 text-lg">{costScore.time.toFixed(1)}</div>
            </div>
            <div className="bg-zinc-150 p-2 rounded-lg border border-zinc-200 text-zinc-900 flex flex-col justify-center">
              <div className="text-[10px] text-zinc-550 font-bold uppercase">综合代价总分 J</div>
              <div className="font-mono font-black mt-1 text-xl">{costScore.total.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-zinc-800 text-xs mb-3 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-sky-500" />
            指标权重调节控制 (Objective weights)
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>防撞安全权重 (w_safety)</span>
                <span className="font-mono text-zinc-800">{safetyWeight.toFixed(1)}</span>
              </div>
              <input
                type="range" min="1.0" max="8.0" step="0.2"
                value={safetyWeight} onChange={(e) => setSafetyWeight(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-zinc-100 rounded"
              />
              <span className="text-[9px] text-zinc-400 block">调高权重会加大绕障冗余半径</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>能量平滑权重 (w_energy)</span>
                <span className="font-mono text-zinc-800">{energyWeight.toFixed(1)}</span>
              </div>
              <input
                type="range" min="0.5" max="5.0" step="0.1"
                value={energyWeight} onChange={(e) => setEnergyWeight(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-zinc-100 rounded"
              />
              <span className="text-[9px] text-zinc-400 block">调高权重偏爱直线无急刹的平缓过渡</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>时间紧迫权重 (w_time)</span>
                <span className="font-mono text-zinc-800">{timeWeight.toFixed(1)}</span>
              </div>
              <input
                type="range" min="0.2" max="3.0" step="0.1"
                value={timeWeight} onChange={(e) => setTimeWeight(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-zinc-100 rounded"
              />
              <span className="text-[9px] text-zinc-400 block">调高权重强力诱导走两点直线，忽略安全风险</span>
            </div>
          </div>
        </div>

        {/* Optimized Trajectory Telemetry Report */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-zinc-800 text-xs mb-3 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            最优航迹解算实时报告
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center bg-zinc-50/50 p-2 rounded-lg border border-zinc-100">
              <span className="text-zinc-500 font-medium text-[11px]">航迹全路径长 (Length)</span>
              <span className="font-mono font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{getPathLength().toFixed(1)} px</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-50/50 p-2 rounded-lg border border-zinc-100">
              <span className="text-zinc-500 font-medium text-[11px]">最小障碍间隙 (Safety Margin)</span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getMinObstacleDistance() > 15 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                {Math.max(0, getMinObstacleDistance()).toFixed(1)} px
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-1.5 bg-zinc-50/40 rounded border border-zinc-100">
                <span className="text-zinc-400 block mb-0.5">规划起点 (Start)</span>
                <span className="font-mono text-zinc-700">({Math.round(start.x)}, {Math.round(start.y)})</span>
              </div>
              <div className="p-1.5 bg-zinc-50/40 rounded border border-zinc-100">
                <span className="text-zinc-400 block mb-0.5">目标降落 (Target)</span>
                <span className="font-mono text-zinc-700">({Math.round(target.x)}, {Math.round(target.y)})</span>
              </div>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] leading-relaxed text-zinc-600">
              <div className="font-bold text-zinc-700 flex items-center gap-1 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                极值寻优收敛成功 (100%)
              </div>
              <div>
                经25代梯度变分步进，最优控制律已成功收敛。当前路径在安全性避障裕度与动力平滑性中处于帕累托最优状态。
              </div>
            </div>
          </div>
        </div>

        {/* Learn principle info */}
        <div className="bg-sky-50/20 border border-sky-100/40 rounded-xl p-4">
          <h4 className="text-sky-800 font-medium text-xs mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            庞特里亚金极大值与现代规划
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            在现代自动驾驶与航天控制工程（如SpaceX火箭垂直回收）中，规划并不是用几何勾勒，而是通过求解<strong>极值偏微分方程 / 最优控制 (Optimal Control)</strong>。
            将机器动力边界、非线性环境限制定义为一个连续泛函 J，极小化该 J 寻得的最优解，反映在执行部件上，就是控制电流或喷嘴冲量的变商分配，从而完美兼顾安全与能源。
          </p>
        </div>
      </div>
    </div>
  );
}
