/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LabTab = 'brachistochrone' | 'fermat' | 'action' | 'trajectory' | 'rl' | 'knowledge_guide' | 'experiment_guide';

export interface Point2D {
  x: number;
  y: number;
  id?: string;
  isControl?: boolean;
}

// 1. 最速降线动力学类型
export interface BrachistochronePreset {
  id: string;
  name: string;
  description: string;
  curveType: 'straight' | 'linear' | 'arc' | 'cycloid' | 'parabola' | 'custom';
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
  pathIndex: number;
  energyK: number;
  energyV: number;
  history: Point2D[];
  finished: boolean;
}

// 2. 费马光学工坊类型
export interface OpticLayer {
  id: string;
  name: string;
  yStart: number;
  yEnd: number;
  n: number; // 折射率
  color: string;
}

export interface LightRay {
  points: Point2D[];
  totalTime: number;
  pathLength: number;
}

// 3. 最小作用量引擎类型
export interface ActionPath {
  id: string;
  name: string;
  points: Point2D[];
  actionS: number; // 作用量 S = ∫(T - V) dt
  color: string;
  isPhysical?: boolean;
}

// 4. 轨迹优化中心类型
export interface Obstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  pulse?: boolean;
}

export interface TrajectoryPoint extends Point2D {
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  t: number;
}

export interface ControlCost {
  timeCost: number;
  energyCost: number;
  obstaclePenalty: number;
  totalCost: number;
}

// 5. 强化学习控制类型
export interface RLAgent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cumulativeReward: number;
  steps: number;
  history: Point2D[];
}

export interface RLGridCell {
  x: number;
  y: number;
  value: number; // 奖励值/值函数估计
}
