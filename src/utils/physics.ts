/**
 * High-precision physics and variational calculus engine for Brachistochrone Lab
 */
import { Point2D, CurvePhysicsData } from "../types";

/**
 * Solve Cycloid parameter theta_2 and radius r given target (X, Y) where (0,0) is start,
 * X > 0 is horizontal distance, Y > 0 is vertical downward drop.
 */
export function solveCycloidParameters(X: number, Y: number): { r: number; theta2: number } {
  if (X <= 0 || Y <= 0) {
    return { r: 1, theta2: Math.PI };
  }

  const targetRatio = Y / X;

  // Objective function: (1 - cos(theta)) / (theta - sin(theta)) - targetRatio = 0
  const f = (th: number) => (1 - Math.cos(th)) / (th - Math.sin(th)) - targetRatio;

  // Bracket root search
  let low = 0.001;
  let high = 2 * Math.PI;

  // Check if root exceeds 2*PI (looping cycloid)
  if (f(high) > 0) {
    high = 4 * Math.PI;
  }

  // Bisection + Newton-Raphson
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const val = f(mid);
    if (Math.abs(val) < 1e-9) {
      low = mid;
      break;
    }
    if (val > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const theta2 = (low + high) / 2;
  const r = Y / (1 - Math.cos(theta2));
  return { r, theta2 };
}

/**
 * Generate discrete point path for Brachistochrone (Cycloid)
 */
export function generateCycloidPoints(X: number, Y: number, N = 200): Point2D[] {
  const { r, theta2 } = solveCycloidParameters(X, Y);
  const points: Point2D[] = [];
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * theta2;
    const x = r * (th - Math.sin(th));
    const y = r * (1 - Math.cos(th));
    points.push({ x, y });
  }
  // Ensure precise endpoint
  points[points.length - 1] = { x: X, y: Y };
  return points;
}

/**
 * Generate Straight line points
 */
export function generateLinePoints(X: number, Y: number, N = 200): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    points.push({ x: t * X, y: t * Y });
  }
  return points;
}

/**
 * Generate Parabola path: y = Y * (x / X)^0.5 (concave fast-start) or convex
 */
export function generateConcaveParabolaPoints(X: number, Y: number, N = 200): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * X;
    // Square root parabola gives rapid initial drop
    const y = Y * Math.sqrt(t);
    points.push({ x, y });
  }
  return points;
}

/**
 * Generate Convex Parabola path: y = Y * (x / X)^2 (slow start)
 */
export function generateConvexParabolaPoints(X: number, Y: number, N = 200): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * X;
    const y = Y * Math.pow(t, 2);
    points.push({ x, y });
  }
  return points;
}

/**
 * Generate Circular Arc path passing through (0,0) and (X,Y)
 */
export function generateCircularArcPoints(X: number, Y: number, N = 200): Point2D[] {
  const points: Point2D[] = [];
  // Center of circle with vertical tangent at origin: x_c = R, y_c = 0 => (x - R)^2 + y^2 = R^2 => R = (X^2 + Y^2)/(2X)
  const R = (X * X + Y * Y) / (2 * X);
  if (R >= X) {
    const sinAngle = Y / R;
    const maxAngle = Math.asin(Math.min(1, Math.max(-1, sinAngle)));
    // Sample along circular arc from (0,0) to (X,Y)
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      // Parametric circle centered at (R, 0)
      // x = R - R * cos(alpha), y = R * sin(alpha)
      // alpha from 0 to alpha_end
      const alphaEnd = Math.atan2(Y, R - X);
      const alpha = u * alphaEnd;
      const x = R - R * Math.cos(alpha);
      const y = R * Math.sin(alpha);
      points.push({ x, y });
    }
  } else {
    // Fallback smooth spline
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = u * X;
      const y = Y * (1 - Math.cos((u * Math.PI) / 2));
      points.push({ x, y });
    }
  }
  points[points.length - 1] = { x: X, y: Y };
  return points;
}

/**
 * Generate Cubic Curve: y = Y * sin(pi/2 * (x/X))
 */
export function generateSinusoidalPoints(X: number, Y: number, N = 200): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = u * X;
    const y = Y * Math.sin((u * Math.PI) / 2);
    points.push({ x, y });
  }
  return points;
}

/**
 * Numerical trajectory integrator for ANY discrete point curve
 * Calculates exact slide time, velocity profile, and distance with Coulomb friction AND Aerodynamic Air Drag.
 * 
 * Tangential equation of motion:
 * dv/dt = g * sin(alpha) - mu * g * cos(alpha) - (F_drag / m)
 * where:
 * - Linear (Stokes) drag: F_drag / m = k_lin * v
 * - Quadratic (Newtonian aerodynamic) drag: F_drag / m = k_quad * v^2
 */
export function computeTrajectoryPhysics(
  points: Point2D[],
  gravity: number = 9.8,
  friction: number = 0.0,
  airDrag: number = 0.0,
  dragModel: "none" | "linear" | "quadratic" = "none"
): {
  totalTime: number;
  finalVelocity: number;
  arcLength: number;
  timeMap: number[]; // time at each point index
  velMap: number[]; // velocity at each point index
  distMap: number[]; // cumulative distance at each point index
} {
  const N = points.length;
  if (N < 2) {
    return { totalTime: 0, finalVelocity: 0, arcLength: 0, timeMap: [0], velMap: [0], distMap: [0] };
  }

  const timeMap = new Array<number>(N).fill(0);
  const velMap = new Array<number>(N).fill(0);
  const distMap = new Array<number>(N).fill(0);

  let totalDist = 0;
  let totalTime = 0;
  let currentVel = 0;

  velMap[0] = 0;
  timeMap[0] = 0;
  distMap[0] = 0;

  for (let i = 0; i < N - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const ds = Math.hypot(dx, dy);
    totalDist += ds;
    distMap[i + 1] = totalDist;

    if (ds < 1e-7) {
      velMap[i + 1] = currentVel;
      timeMap[i + 1] = totalTime;
      continue;
    }

    const sinAlpha = dy / ds; // downward slope positive
    const cosAlpha = dx / ds; // horizontal projection

    // Gravity and Coulomb Friction base acceleration
    const aGravityFriction = gravity * (sinAlpha - friction * cosAlpha);

    // Compute Drag Acceleration based on model
    const calcDragDecel = (v: number): number => {
      if (dragModel === "none" || airDrag <= 0) return 0;
      if (dragModel === "linear") return airDrag * v;
      if (dragModel === "quadratic") return airDrag * v * v;
      return 0;
    };

    // Net acceleration at entry: a(v) = a_base - a_drag(v)
    const aEntry = aGravityFriction - calcDragDecel(currentVel);

    let nextVel = 0;
    let dt = 0;

    if (currentVel === 0 && aEntry <= 0) {
      // Stuck due to static/kinetic friction on flat or negative slope
      dt = 999;
      nextVel = 0;
    } else if (currentVel === 0) {
      // Starting from rest: ds = 0.5 * a * dt^2 => dt = sqrt(2*ds / a)
      const effectiveA = Math.max(1e-5, aEntry);
      dt = Math.sqrt((2 * ds) / effectiveA);
      // Half-step drag correction
      const estV = effectiveA * dt;
      const midA = Math.max(1e-5, aGravityFriction - calcDragDecel(estV * 0.5));
      dt = Math.sqrt((2 * ds) / midA);
      nextVel = Math.max(0, midA * dt);
    } else {
      // Non-zero velocity: predictor-corrector integration
      // Predictor: v_est^2 = v^2 + 2 * aEntry * ds
      const vPredSq = currentVel * currentVel + 2 * aEntry * ds;
      const vPred = vPredSq > 0 ? Math.sqrt(vPredSq) : 0;
      const vMid = (currentVel + vPred) / 2;
      const aMid = aGravityFriction - calcDragDecel(vMid);

      const vNextSq = currentVel * currentVel + 2 * aMid * ds;
      if (vNextSq <= 0) {
        nextVel = 0;
        dt = (2 * ds) / Math.max(1e-4, currentVel);
      } else {
        nextVel = Math.sqrt(vNextSq);
        const avgV = Math.max(1e-5, (currentVel + nextVel) / 2);
        dt = ds / avgV;
      }
    }

    totalTime += dt;
    currentVel = nextVel;
    velMap[i + 1] = currentVel;
    timeMap[i + 1] = totalTime;
  }

  return {
    totalTime,
    finalVelocity: velMap[N - 1],
    arcLength: totalDist,
    timeMap,
    velMap,
    distMap,
  };
}

/**
 * Build complete comparative dataset for standard curves
 */
export function buildComparativeCurves(
  X: number,
  Y: number,
  gravity: number = 9.8,
  friction: number = 0.0,
  airDrag: number = 0.0,
  dragModel: "none" | "linear" | "quadratic" = "none"
): CurvePhysicsData[] {
  const configs = [
    {
      id: "cycloid",
      name: "摆线（最速降线）",
      nameEn: "Cycloid (Brachistochrone)",
      color: "#059669", // Emerald Green
      formula: "x = r(\\theta - \\sin\\theta), \\; y = r(1 - \\cos\\theta)",
      generator: () => generateCycloidPoints(X, Y, 200),
    },
    {
      id: "concave_parabola",
      name: "快速前倾抛物线",
      nameEn: "Fast-Drop Parabola (y ∝ √x)",
      color: "#0284c7", // Sky Blue
      formula: "y = Y \\cdot \\sqrt{x / X}",
      generator: () => generateConcaveParabolaPoints(X, Y, 200),
    },
    {
      id: "circular_arc",
      name: "圆弧轨道",
      nameEn: "Circular Arc",
      color: "#d97706", // Amber
      formula: "(x - R)^2 + y^2 = R^2",
      generator: () => generateCircularArcPoints(X, Y, 200),
    },
    {
      id: "straight_line",
      name: "直线（几何最短路径）",
      nameEn: "Straight Line (Shortest Distance)",
      color: "#dc2626", // Crimson Red
      formula: "y = \\frac{Y}{X} x",
      generator: () => generateLinePoints(X, Y, 200),
    },
    {
      id: "convex_parabola",
      name: "平缓下坡抛物线",
      nameEn: "Slow-Start Parabola (y ∝ x²)",
      color: "#7c3aed", // Violet
      formula: "y = Y \\cdot (x / X)^2",
      generator: () => generateConvexParabolaPoints(X, Y, 200),
    },
  ];

  return configs.map((cfg) => {
    const points = cfg.generator();
    const phys = computeTrajectoryPhysics(points, gravity, friction, airDrag, dragModel);
    return {
      id: cfg.id,
      name: cfg.name,
      nameEn: cfg.nameEn,
      color: cfg.color,
      formula: cfg.formula,
      points,
      totalTime: phys.totalTime,
      finalVelocity: phys.finalVelocity,
      arcLength: phys.arcLength,
      timeMap: phys.timeMap,
      velMap: phys.velMap,
      distMap: phys.distMap,
      progress: 0,
      currentPos: points[0],
      currentVelocity: 0,
      timeElapsed: 0,
      isFinished: false,
      velocityHistory: [],
    };
  });
}

/**
 * Tautochrone Isochronism exact position solver
 * Cycloid parameter: x = r(theta - sin(theta)), y = r(1 - cos(theta))
 * For ball starting at initial angle theta0 in (0, pi):
 * s(t) = 4*r * sin(theta0/2) * cos(omega * t)
 * where omega = sqrt(g / (4*r)), theta(t) = 2 * asin( sin(theta0/2) * cos(omega * t) )
 */
export function computeTautochronePosition(
  r: number,
  g: number,
  theta0: number,
  t: number
): { theta: number; pos: Point2D; velocity: number; isAtBottom: boolean } {
  const omega = Math.sqrt(g / (4 * r));
  const periodQuarter = Math.PI / (2 * omega); // = pi * sqrt(r/g)

  // Clamp time up to quarter period (arrival at bottom vertex)
  const clampedT = Math.min(t, periodQuarter);
  const isAtBottom = t >= periodQuarter;

  const sinHalfTheta0 = Math.sin(theta0 / 2);
  const sinHalfTheta = sinHalfTheta0 * Math.cos(omega * clampedT);
  const halfTheta = Math.asin(Math.max(-1, Math.min(1, sinHalfTheta)));
  const theta = 2 * halfTheta;

  const x = r * (theta - Math.sin(theta));
  const y = r * (1 - Math.cos(theta));

  // Tangential velocity: v = -4*r*omega * sin(theta0/2) * sin(omega*t)
  const velocity = Math.abs(4 * r * omega * sinHalfTheta0 * Math.sin(omega * clampedT));

  return {
    theta,
    pos: { x, y },
    velocity,
    isAtBottom,
  };
}
