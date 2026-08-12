/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Brain, ShieldAlert, Award, Compass, HelpCircle, GraduationCap } from 'lucide-react';

interface RLControlArenaProps {
  onAnalyze: (moduleName: string, stateDesc: string, params: any) => void;
  aiLoading: boolean;
}

export default function RLControlArena({ onAnalyze, aiLoading }: RLControlArenaProps) {
  // Reward parameters
  const [goalReward, setGoalReward] = useState<number>(100);
  const [lavaPenalty, setLavaPenalty] = useState<number>(-80);
  const [stepCost, setStepCost] = useState<number>(-3);

  // Core Start and Goal Positions (Interactive)
  const [startPos, setStartPos] = useState({ r: 9, c: 0 });
  const [goalPos, setGoalPos] = useState({ r: 1, c: 8 });

  // Agent State (Initializes at start position)
  const [agentPos, setAgentPos] = useState({ r: 9, c: 0 }); 
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [episodesRun, setEpisodesRun] = useState<number>(42);

  // Drag-and-drop / hover interaction state
  const [draggedNode, setDraggedNode] = useState<'start' | 'goal' | null>(null);
  const [hoveredNode, setHoveredNode] = useState<'start' | 'goal' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState<number>(0);
  const displayXRef = useRef<number | null>(null);
  const displayYRef = useRef<number | null>(null);

  // Synchronize agent's position with start position if it's updated
  useEffect(() => {
    setAgentPos((curr) => {
      // Only snap if agent is at the old start or resetting
      return startPos;
    });
  }, [startPos]);

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

  // Grid definition
  const ROWS = 10;
  const COLS = 10;

  // Lava traps coordinates
  const lavaTraces = [
    { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 },
    { r: 4, c: 5 }, { r: 5, c: 5 }, { r: 6, c: 5 },
    { r: 6, c: 4 }, { r: 6, c: 3 },
  ];

  // Solved value function & policy table
  const [values, setValues] = useState<number[][]>([]);
  const [policy, setPolicy] = useState<string[][]>([]);

  // Value Iteration solver (runs instant in <1ms)
  useEffect(() => {
    // Initial arrays
    let V = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    let P = Array(ROWS).fill(null).map(() => Array(COLS).fill('R')); // Default right

    const actions = [
      { name: 'U', dr: -1, dc: 0 },
      { name: 'D', dr: 1, dc: 0 },
      { name: 'L', dr: 0, dc: -1 },
      { name: 'R', dr: 0, dc: 1 },
    ];

    const isLava = (r: number, c: number) => {
      return lavaTraces.some((l) => l.r === r && l.c === c);
    };

    const isGoal = (r: number, c: number) => {
      return r === goalPos.r && c === goalPos.c;
    };

    // Run 30 iterations of value iteration
    for (let iter = 0; iter < 30; iter++) {
      let VNew = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (isGoal(r, c)) {
            VNew[r][c] = goalReward;
            continue;
          }
          if (isLava(r, c)) {
            VNew[r][c] = lavaPenalty;
            continue;
          }

          // Evaluate maximum expected value
          let maxVal = -999999;
          let bestAction = 'R';

          actions.forEach((act) => {
            let nr = r + act.dr;
            let nc = c + act.dc;

            // Clamp inside bounds
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
              nr = r;
              nc = c;
            }

            // Expected reward: reward + discount * V
            const reward = isGoal(nr, nc) ? goalReward : (isLava(nr, nc) ? lavaPenalty : stepCost);
            const val = reward + 0.9 * V[nr][nc];

            if (val > maxVal) {
              maxVal = val;
              bestAction = act.name;
            }
          });

          VNew[r][c] = maxVal;
          P[r][c] = bestAction;
        }
      }
      V = VNew;
    }

    setValues(V);
    setPolicy(P);

  }, [goalReward, lavaPenalty, stepCost, goalPos]);

  // Game Loop for agent sliding
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAgentPos((curr) => {
        if (curr.r === goalPos.r && curr.c === goalPos.c) {
          // Reset after reaching goal
          setEpisodesRun((e) => e + 1);
          return startPos;
        }

        // Move according to optimal solved policy
        const actSymbol = policy[curr.r]?.[curr.c] || 'R';
        let nr = curr.r;
        let nc = curr.c;

        if (actSymbol === 'U') nr = Math.max(0, curr.r - 1);
        else if (actSymbol === 'D') nr = Math.min(ROWS - 1, curr.r + 1);
        else if (actSymbol === 'L') nc = Math.max(0, curr.c - 1);
        else if (actSymbol === 'R') nc = Math.min(COLS - 1, curr.c + 1);

        // Check lava trap reset
        const hitLava = lavaTraces.some((l) => l.r === nr && l.c === nc);
        if (hitLava) {
          setEpisodesRun((e) => e + 1);
          return startPos; // Respawns at start due to failure
        }

        return { r: nr, c: nc };
      });
    }, 380);

    return () => clearInterval(interval);

  }, [isPlaying, policy]);

  // Draw Grid Arena on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / COLS;
    const cellHeight = canvas.height / ROWS;

    // Draw grid values
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = values[r]?.[c] || 0;
        
        // Heat values mapping
        let fillStyle = '#ffffff';
        if (r === goalPos.r && c === goalPos.c) {
          fillStyle = 'rgba(16, 185, 129, 0.15)'; // Goal shade
        } else if (lavaTraces.some((l) => l.r === r && l.c === c)) {
          fillStyle = 'rgba(239, 68, 68, 0.2)'; // lava shade
        } else {
          // Dynamic gradient mapping for value function
          const normalized = Math.max(-1, Math.min(1, val / 100));
          if (normalized >= 0) {
            fillStyle = `rgba(14, 165, 233, ${normalized * 0.18})`; // Blue positive
          } else {
            fillStyle = `rgba(244, 63, 94, ${Math.abs(normalized) * 0.12})`; // Purple/Red negative
          }
        }

        ctx.fillStyle = fillStyle;
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);

        // Grid boundaries
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);

        // Draw policy arrows (faint symbols in each regular cell)
        const isSp = (r === goalPos.r && c === goalPos.c) || (r === startPos.r && c === startPos.c) || lavaTraces.some((l) => l.r === r && l.c === c);
        if (!isSp && policy[r]?.[c]) {
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '10px Roboto';
          const act = policy[r][c];
          let sym = '→';
          if (act === 'U') sym = '↑';
          else if (act === 'D') sym = '↓';
          else if (act === 'L') sym = '←';
          
          ctx.fillText(sym, c * cellWidth + cellWidth / 2 - 4, r * cellHeight + cellHeight / 2 + 3);
        }

        // Render numerical Value Estimate inside cell
        if (values[r] && values[r][c] !== undefined) {
          ctx.fillStyle = '#64748b';
          ctx.font = '8px monospace';
          ctx.fillText(values[r][c].toFixed(0), c * cellWidth + 4, r * cellHeight + 11);
        }
      }
    }

    // Start Marker (Orange/Amber)
    ctx.save();
    ctx.fillStyle = '#f59e0b'; // Amber
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(startPos.c * cellWidth + cellWidth / 2, startPos.r * cellHeight + cellHeight / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏠', startPos.c * cellWidth + cellWidth / 2, startPos.r * cellHeight + cellHeight / 2);
    ctx.restore();

    // Goal Marker (Golden/Emerald flag)
    ctx.save();
    ctx.fillStyle = '#10b981'; // Emerald
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(goalPos.c * cellWidth + cellWidth / 2, goalPos.r * cellHeight + cellHeight / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏁', goalPos.c * cellWidth + cellWidth / 2, goalPos.r * cellHeight + cellHeight / 2);
    ctx.restore();

    // Lava Traps (Red skull emoji or lava mark)
    lavaTraces.forEach((lv) => {
      ctx.fillStyle = '#f43f5e';
      ctx.font = '9px sans-serif';
      ctx.fillText('🌋 LAVA', lv.c * cellWidth + 4, lv.r * cellHeight + cellHeight / 2 + 5);
    });

    // Draw Agent particle with smooth physical linear interpolation (continuous flow)
    const targetX = agentPos.c * cellWidth + cellWidth / 2;
    const targetY = agentPos.r * cellHeight + cellHeight / 2;

    if (displayXRef.current === null) {
      displayXRef.current = targetX;
      displayYRef.current = targetY;
    } else {
      // Smooth lerp Approach
      displayXRef.current += (targetX - displayXRef.current) * 0.16;
      displayYRef.current += (targetY - displayYRef.current) * 0.16;

      // Reset immediately if agent respawns to avoid drawing a giant slide across the grid
      if (Math.hypot(displayXRef.current - targetX, displayYRef.current - targetY) > cellWidth * 2.2) {
        displayXRef.current = targetX;
        displayYRef.current = targetY;
      }
    }

    const cx = displayXRef.current;
    const cy = displayYRef.current;

    // Draw previous motion trail (glow rings)
    const trailPulse = 12 + Math.sin(tick * 0.12) * 3;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, trailPulse, 0, Math.PI * 2);
    ctx.stroke();

    // Premium Indigo agent
    ctx.fillStyle = '#6366f1'; 
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // inner white focal particle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [agentPos, values, policy, tick, startPos, goalPos, hoveredNode, draggedNode]);

  // Handle Dragging / Clicking interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = canvas.width / COLS;
    const cellHeight = canvas.height / ROWS;

    const clickC = Math.max(0, Math.min(COLS - 1, Math.floor(x / cellWidth)));
    const clickR = Math.max(0, Math.min(ROWS - 1, Math.floor(y / cellHeight)));

    if (clickR === startPos.r && clickC === startPos.c) {
      setDraggedNode('start');
    } else if (clickR === goalPos.r && clickC === goalPos.c) {
      setDraggedNode('goal');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = canvas.width / COLS;
    const cellHeight = canvas.height / ROWS;

    const hoverC = Math.max(0, Math.min(COLS - 1, Math.floor(x / cellWidth)));
    const hoverR = Math.max(0, Math.min(ROWS - 1, Math.floor(y / cellHeight)));

    // Track active hover node
    if (hoverR === startPos.r && hoverC === startPos.c) {
      setHoveredNode('start');
    } else if (hoverR === goalPos.r && hoverC === goalPos.c) {
      setHoveredNode('goal');
    } else {
      setHoveredNode(null);
    }

    if (!draggedNode) return;

    // Check if dragging onto a dangerous lava cell
    const isLava = lavaTraces.some((l) => l.r === hoverR && l.c === hoverC);

    if (draggedNode === 'start') {
      const isOverlapWithGoal = hoverR === goalPos.r && hoverC === goalPos.c;
      if (!isLava && !isOverlapWithGoal) {
        setStartPos({ r: hoverR, c: hoverC });
        setAgentPos({ r: hoverR, c: hoverC });
      }
    } else if (draggedNode === 'goal') {
      const isOverlapWithStart = hoverR === startPos.r && hoverC === startPos.c;
      if (!isLava && !isOverlapWithStart) {
        setGoalPos({ r: hoverR, c: hoverC });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const cellWidth = canvas.width / COLS;
    const cellHeight = canvas.height / ROWS;

    const clickC = Math.max(0, Math.min(COLS - 1, Math.floor(x / cellWidth)));
    const clickR = Math.max(0, Math.min(ROWS - 1, Math.floor(y / cellHeight)));

    if (clickR === startPos.r && clickC === startPos.c) {
      setDraggedNode('start');
    } else if (clickR === goalPos.r && clickC === goalPos.c) {
      setDraggedNode('goal');
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!draggedNode || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const cellWidth = canvas.width / COLS;
    const cellHeight = canvas.height / ROWS;

    const moveC = Math.max(0, Math.min(COLS - 1, Math.floor(x / cellWidth)));
    const moveR = Math.max(0, Math.min(ROWS - 1, Math.floor(y / cellHeight)));

    const isLava = lavaTraces.some((l) => l.r === moveR && l.c === moveC);

    if (draggedNode === 'start') {
      const isOverlapWithGoal = moveR === goalPos.r && moveC === goalPos.c;
      if (!isLava && !isOverlapWithGoal) {
        setStartPos({ r: moveR, c: moveC });
        setAgentPos({ r: moveR, c: moveC });
      }
    } else if (draggedNode === 'goal') {
      const isOverlapWithStart = moveR === startPos.r && moveC === startPos.c;
      if (!isLava && !isOverlapWithStart) {
        setGoalPos({ r: moveR, c: moveC });
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggedNode(null);
  };

  const triggerAI = () => {
    const desc = `RL 强化学习仿真系统状态：
- 地图规模: 10x10 网格空间, 训练循环已完成 episodes: ${episodesRun} 
- 当前奖励矩阵设计：
  * Target Goal 旗帜奖励: +${goalReward}
  * Lava 熔岩陷阱惩罚: ${lavaPenalty}
  * 每秒运行步长摩擦损耗: ${stepCost}
- 数值分析：算法已经完美求解基于 Bellman 各状态变分矩阵方程。智能体将平滑寻找流场极值避开火山抵达旗点，验证了自适应最大积分类最优路径收敛。`;

    onAnalyze('rl', desc, {
      goalReward, lavaPenalty, stepCost, episodesRun
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="rl-arena-module">
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Stage board */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
            <div>
              <h2 className="text-zinc-800 font-semibold flex items-center gap-1.5 text-base">
                <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
                智能马尔可夫决策与全图策略寻优
              </h2>
              <p className="text-xs text-zinc-500">
                可任意拖动 <strong>🏠 起点</strong> 与 <strong>🏁 终点</strong>，配合右侧奖惩算子实时重新求解贝尔曼方程
              </p>
            </div>
            <div>
              <span className="px-2 py-0.5 bg-indigo-50 text-[10px] font-mono text-indigo-600 rounded">
                贝尔曼公式: V*(s) = max [R(s,a) + γΣP(s'|s,a)V*(s')]
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-lg border border-zinc-100 flex justify-center">
            <canvas
              ref={canvasRef}
              width={480}
              height={360}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: draggedNode ? 'grabbing' : (hoveredNode ? 'grab' : 'default') }}
              className="w-full max-w-[480px] h-auto block select-none"
              id="rl-grid-canvas"
            />
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                id="btn-rl-play"
              >
                {isPlaying ? '停止智能寻路' : '启动自由求索'}
              </button>
              <button
                onClick={() => setAgentPos(startPos)}
                className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-md transition-colors"
                id="btn-rl-reset"
                title="重置到起点位置"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <span className="text-xs text-zinc-400 font-mono">
                自主寻路成功完成: {episodesRun} 个周期
              </span>
            </div>

            <button
              onClick={triggerAI}
              disabled={aiLoading}
              className="px-4 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100/70 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              id="btn-ai-insight-rl"
            >
              {aiLoading ? 'AI 策略学习中...' : '💡 AI 策略收敛洞察'}
            </button>
          </div>
        </div>

        {/* Dynamic reinforcement detail */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-zinc-800 font-semibold text-xs mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            连续最优决策与变分机制的映射
          </h3>
          <p className="text-xs text-zinc-650 leading-relaxed">
            马尔可夫决策过程 (MDP) 寻找最佳动作策略的行为，本质上也是在计算一条<strong>全局回报期望最高的泛函极值路径</strong>。
            背景网格的蓝色深浅象征单元格的“对终点期望价值期望高低 $V(s)$”。 
            智能求索小球总是顺着这个价值的<strong>数值变分梯度 $\nabla V$ </strong>上升移动，从而生成最优决策避障轨迹。
          </p>
        </div>
      </div>

      {/* Inputs side controller */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm flex flex-col">
          <h3 className="font-bold text-zinc-800 text-xs mb-3 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-indigo-500" />
            奖励收益函数调试器
          </h3>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>终点旗帜奖赏值 (Goal)</span>
                <span className="font-mono text-emerald-600">+{goalReward}</span>
              </div>
              <input
                type="range" min="30" max="200" step="10"
                value={goalReward} onChange={(e) => setGoalReward(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-zinc-100 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>熔岩致命惩罚 (Danger)</span>
                <span className="font-mono text-rose-600">{lavaPenalty}</span>
              </div>
              <input
                type="range" min="-150" max="-10" step="10"
                value={lavaPenalty} onChange={(e) => setLavaPenalty(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-zinc-100 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>步长时间耗散损耗 (Cost/Step)</span>
                <span className="font-mono text-zinc-800">{stepCost}</span>
              </div>
              <input
                type="range" min="-10" max="-1" step="0.5"
                value={stepCost} onChange={(e) => setStepCost(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-zinc-100 rounded"
              />
              <span className="text-[9px] text-zinc-400 block mt-1">
                步长损耗过低，智能体动作会磨蹭犹豫；步长损失过高，小球将急于抵达终点甚至宁肯去踩岩浆自毁完结。
              </span>
            </div>
          </div>
        </div>

        {/* Learn core info */}
        <div className="bg-indigo-50/20 border border-indigo-100/40 rounded-xl p-4">
          <h4 className="text-indigo-800 font-medium text-xs mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            强化学习的最优路径统一论
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            经典物理的世界里，粒子选择使得“作用量达到极值”的曲线。人在决策、AI演化中，智能体寻找期望奖励累计（Bellman累加）最高的值函数。
            这两者具有惊人的数学同构性：从哈密顿-雅可比-贝尔曼 (HJB) 极值控制方程，到现代大模型的近端策略优化 (PPO)，极值统一的美感把经典牛顿力学与前沿人工智能桥接起来。
          </p>
        </div>
      </div>
    </div>
  );
}
