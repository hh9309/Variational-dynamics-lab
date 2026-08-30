/**
 * Core type definitions for the Brachistochrone Curve Lab
 */

export interface Point2D {
  x: number;
  y: number;
}

export type ModuleTab =
  | "modeling"
  | "sandbox"
  | "rolling"
  | "tautochrone"
  | "cases"
  | "code"
  | "ai"
  | "knowledge"
  | "report";

export interface CurvePhysicsData {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  formula: string;
  points: Point2D[];
  totalTime: number; // in seconds
  finalVelocity: number; // in m/s
  arcLength: number; // in meters
  progress: number; // 0 to 1
  currentPos: Point2D;
  currentVelocity: number;
  timeElapsed: number;
  isFinished: boolean;
  rank?: number;
  timeMap?: number[];
  velMap?: number[];
  distMap?: number[];
  velocityHistory: { t: number; v: number; x: number; y: number }[];
}

export interface SandboxConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  gravity: number; // m/s^2, default 9.8
  friction: number; // friction coefficient mu, default 0
  airDrag: number; // aerodynamic drag coefficient, default 0.0
  dragModel: "none" | "linear" | "quadratic"; // Stokes (F=-k*v) or Newtonian (F=-k*v^2)
  timeScale: number; // 0.2, 0.5, 1, 2, 5
  ballRadius: number; // meters in world coordinates
  showGrid: boolean;
  showTrails: boolean;
  showVectors: boolean;
  showEnergy: boolean;
}

export interface RollingCircleState {
  radius: number;
  theta: number; // 0 to 2*PI or more
  isPlaying: boolean;
  speed: number;
  showTrail: boolean;
  showVectors: boolean;
  showAuxiliary: boolean;
}

export interface TautochroneBall {
  id: number;
  startRatio: number; // 0.1 to 1.0 (starting height fraction)
  currentTheta: number;
  startTheta: number;
  pos: Point2D;
  velocity: number;
  timeElapsed: number;
  isFinished: boolean;
  color: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  formula: string;
  parameters: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    gravity: number;
    friction: number;
  };
  keyInsight: string;
  historyNote: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

export interface PythonCodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  outputMock: string;
  category: "bvp" | "optimization" | "analytical" | "rk4";
}
