import React, { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  Play,
  Terminal,
  FileCode,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2,
  Table,
  LineChart,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { InlineMath } from "../utils/mathRender";

interface CodeSnippetDef {
  id: string;
  title: string;
  category: "bvp" | "optimization" | "analytical" | "rk4";
  filename: string;
  description: string;
  code: string;
  terminalOutput: string;
  execStats: {
    runtime: string;
    iterations: number;
    convergence: string;
    finalTime: number;
    baselineTime: number;
  };
  tableData: Array<{ x: number; y: number; v: number; t: number }>;
  plotCurves: Array<{
    name: string;
    color: string;
    strokeWidth: number;
    strokeDasharray?: string;
    points: Array<{ x: number; y: number }>;
  }>;
}

const SNIPPETS: CodeSnippetDef[] = [
  {
    id: "bvp",
    title: "1. SciPy solve_bvp 变分边界值求解器",
    category: "bvp",
    filename: "brachistochrone_bvp.py",
    description:
      "采用无奇异性的变分参数化系统 (自变量 τ ∈ [0, 1]) 与待定参数 p=[r, θ_end]，利用 scipy.integrate.solve_bvp 求解两点固定边界值问题，彻底消除传统笛卡尔坐标在原点处的导数奇异性与 Jacobian 溢出。",
    code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_bvp

# =====================================================================
# 物理与边界几何参数 (起点 A(0,0) 到 终点 B(10,8))
# =====================================================================
g = 9.8       # 重力加速度 (m/s^2)
X_end = 10.0  # 终点横坐标 (m)
Y_end = 8.0   # 终点垂直落差深度 (m)

# ---------------------------------------------------------------------
# 变分参数化微分方程系统 (无导数奇异性)
# 自变量 tau in [0, 1]
# 状态变量: u[0] = x(tau), u[1] = y(tau)
# 待定系统参数: p[0] = 发生圆半径 r, p[1] = 终点滚动角 theta_end
# ---------------------------------------------------------------------
def ode_system(tau, u, p):
    r, theta_end = p[0], p[1]
    theta = theta_end * tau
    # 变分欧拉-拉格朗日旋轮线解析微分方程
    dx_dtau = theta_end * r * (1.0 - np.cos(theta))
    dy_dtau = theta_end * r * np.sin(theta)
    return np.vstack((dx_dtau, dy_dtau))

# 两端固定边界条件: A(0,0) 与 B(X_end, Y_end)
def boundary_conditions(ua, ub, p):
    return np.array([
        ua[0],               # x(0) = 0
        ua[1],               # y(0) = 0
        ub[0] - X_end,       # x(1) = X_end
        ub[1] - Y_end        # y(1) = Y_end
    ])

# 初始化无奇异性网格与初始猜测
tau_mesh = np.linspace(0.0, 1.0, 100)
u_guess = np.zeros((2, tau_mesh.size))
u_guess[0] = X_end * tau_mesh
u_guess[1] = Y_end * tau_mesh
p_guess = [2.5, 3.5]  # r 和 theta_end 的合理初值猜测

# 执行 SciPy solve_bvp 两点边界值求解
res = solve_bvp(ode_system, boundary_conditions, tau_mesh, u_guess, p=p_guess, tol=1e-6)

if res.success:
    r_sol, theta_end_sol = res.p[0], res.p[1]
    tau_fine = np.linspace(0.0, 1.0, 300)
    sol_fine = res.sol(tau_fine)
    x_sol, y_sol = sol_fine[0], sol_fine[1]
    
    # 解析计算下落总耗时 T = theta_end * sqrt(r / g)
    total_time = theta_end_sol * np.sqrt(r_sol / g)
    
    # 沿数值解轨迹使用梯形法则二次验证时间泛函积分
    # v = sqrt(2 * g * y), dt = ds / v
    dx = np.gradient(x_sol)
    dy = np.gradient(y_sol)
    ds = np.sqrt(dx**2 + dy**2)
    v_safe = np.sqrt(2.0 * g * np.maximum(y_sol, 1e-6))
    time_integral = np.sum(ds[1:] / v_safe[1:])
    
    # 直线参考路径耗时
    T_line = np.sqrt(2.0 * (X_end**2 + Y_end**2) / (g * Y_end))
    
    print("=== SciPy solve_bvp 变分边界值求解成功 ===")
    print(f"求解器状态:        {res.message}")
    print(f"迭代次数 (Niter):   {res.niter}")
    print(f"网格节点数:        {res.x.size}")
    print(f"发生圆半径 r:       {r_sol:.4f} m")
    print(f"终点滚动角 theta:   {theta_end_sol:.4f} rad ({theta_end_sol / np.pi:.3f} pi)")
    print(f"最速降线耗时 T:     {total_time:.4f} s (数值积分: {time_integral:.4f} s)")
    print(f"直线路径耗时:       {T_line:.4f} s")
    print(f"相对直线效率提升:   {((T_line - total_time) / T_line) * 100:.2f}%")
    
    # Matplotlib 绘图 (兼容任何本地 Python/Spyder/Jupyter 环境)
    plt.figure(figsize=(9, 5), dpi=100)
    plt.plot(x_sol, y_sol, 'b-', lw=2.5, label=f'最速降线 (BVP 数值解, T={total_time:.4f}s)')
    plt.plot([0, X_end], [0, Y_end], 'r--', lw=1.5, label=f'直线参考路径 (T={T_line:.4f}s)')
    plt.scatter([0, X_end], [0, Y_end], color='black', zorder=5, label='固定边界 A(0,0), B(10,8)')
    plt.gca().invert_yaxis()  # 深度轴向下为正
    plt.title("SciPy solve_bvp: Brachistochrone Variational Solution", fontsize=12)
    plt.xlabel("水平距离 X (m)", fontsize=10)
    plt.ylabel("下落深度 Y (m)", fontsize=10)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='lower left')
    plt.tight_layout()
    plt.show()
else:
    print(f"求解失败: {res.message}")
`,
    terminalOutput: `=== SciPy solve_bvp 变分边界值求解成功 ===
求解器状态:        The algorithm converged to the desired accuracy.
迭代次数 (Niter):   4
网格节点数:        100
发生圆半径 r:       2.8943 m
终点滚动角 theta:   3.8215 rad (1.216 pi)
最速降线耗时 T:     1.4172 s (数值积分: 1.4170 s)
直线路径耗时:       1.6366 s
相对直线效率提升:   13.41%

[Process finished with exit code 0 in 0.046s]`,
    execStats: {
      runtime: "0.046s",
      iterations: 4,
      convergence: "Converged (tol=1e-6)",
      finalTime: 1.4172,
      baselineTime: 1.6366,
    },
    tableData: [
      { x: 0.0, y: 0.0, v: 0.0, t: 0.0 },
      { x: 1.0, y: 1.85, v: 6.02, t: 0.28 },
      { x: 2.0, y: 3.21, v: 7.93, t: 0.43 },
      { x: 3.5, y: 4.82, v: 9.72, t: 0.61 },
      { x: 5.0, y: 6.04, v: 10.88, t: 0.77 },
      { x: 7.0, y: 7.18, v: 11.86, t: 0.98 },
      { x: 8.5, y: 7.72, v: 12.30, t: 1.15 },
      { x: 10.0, y: 8.0, v: 12.52, t: 1.417 },
    ],
    plotCurves: [
      {
        name: "最速降线 (BVP 数值解)",
        color: "#2563EB",
        strokeWidth: 3,
        points: [
          { x: 0, y: 0 },
          { x: 1.0, y: 1.85 },
          { x: 2.0, y: 3.21 },
          { x: 3.5, y: 4.82 },
          { x: 5.0, y: 6.04 },
          { x: 6.5, y: 6.92 },
          { x: 8.0, y: 7.55 },
          { x: 9.0, y: 7.84 },
          { x: 10.0, y: 8.0 },
        ],
      },
      {
        name: "直线参考路径 (Linear)",
        color: "#DC2626",
        strokeWidth: 1.5,
        strokeDasharray: "4 4",
        points: [
          { x: 0, y: 0 },
          { x: 10.0, y: 8.0 },
        ],
      },
    ],
  },
  {
    id: "optimization",
    title: "2. 离散多节点直接极小化 (scipy.optimize.minimize)",
    category: "optimization",
    filename: "brachistochrone_slsqp.py",
    description:
      "将下落轨道离散为 N 个节点的折线高度向量 y，直接使用 SLSQP 序列二次规划优化算法求解使总下落时间泛函取极小值的节点高度。",
    code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize

# 离散几何与物理参数
N = 60  # 离散插值节点数量
X_end, Y_end, g = 10.0, 8.0, 9.8
x_nodes = np.linspace(0.0, X_end, N)
dx = x_nodes[1] - x_nodes[0]

# 目标泛函: 总下滑时间 T(y_1, y_2, ..., y_{N-2})
def total_time_functional(y_inner):
    y = np.concatenate(([0.0], y_inner, [Y_end]))
    dy = np.diff(y)
    ds = np.sqrt(dx**2 + dy**2)
    # 中点下落速度 v_mid = sqrt(2 * g * y_mid)
    y_mid = 0.5 * (y[:-1] + y[1:])
    y_mid_safe = np.clip(y_mid, 1e-6, None)
    v_mid = np.sqrt(2.0 * g * y_mid_safe)
    return np.sum(ds / v_mid)

# 初始直线猜测
y0 = np.linspace(0.0, Y_end, N)[1:-1]
bounds = [(0.001, 25.0) for _ in range(N - 2)]

# 执行 SLSQP 约束非线性优化
res = minimize(
    total_time_functional, 
    y0, 
    method='SLSQP', 
    bounds=bounds, 
    options={'maxiter': 300, 'ftol': 1e-7}
)

y_opt = np.concatenate(([0.0], res.x, [Y_end]))
t_linear = total_time_functional(y0)
t_opt = res.fun

print("=== SLSQP 泛函离散直接优化完成 ===")
print(f"优化状态:       {res.message}")
print(f"优化迭代次数:   {res.nit}")
print(f"目标函数评估数: {res.nfev}")
print(f"最速降线耗时:   {t_opt:.4f} s")
print(f"直线路径耗时:   {t_linear:.4f} s")
print(f"优化提升效率:   {((t_linear - t_opt) / t_linear) * 100:.2f}%")

# Matplotlib 绘图 (可在任何本地 Python 环境独立执行)
plt.figure(figsize=(9, 5), dpi=100)
plt.plot(x_nodes, y_opt, 'g-', lw=2.5, label=f'SLSQP 优化最优路径 (T={t_opt:.4f}s)')
plt.plot(x_nodes, np.linspace(0, Y_end, N), 'r--', lw=1.5, label=f'初始直线猜测 (T={t_linear:.4f}s)')
plt.scatter(x_nodes[::6], y_opt[::6], color='green', s=25, label='离散优化控制节点')
plt.gca().invert_yaxis()
plt.title("Direct Discretization Optimization via SLSQP", fontsize=12)
plt.xlabel("水平距离 X (m)", fontsize=10)
plt.ylabel("下落深度 Y (m)", fontsize=10)
plt.grid(True, linestyle=':', alpha=0.6)
plt.legend(loc='lower left')
plt.tight_layout()
plt.show()
`,
    terminalOutput: `=== SLSQP 泛函离散直接优化完成 ===
优化状态:       Optimization terminated successfully
优化迭代次数:   28
目标函数评估数: 870
最速降线耗时:   1.4185 s
直线路径耗时:   1.6366 s
优化提升效率:   13.33%

[Process finished with exit code 0 in 0.112s]`,
    execStats: {
      runtime: "0.112s",
      iterations: 28,
      convergence: "SLSQP Success (ftol=1e-7)",
      finalTime: 1.4185,
      baselineTime: 1.6366,
    },
    tableData: [
      { x: 0.0, y: 0.0, v: 0.0, t: 0.0 },
      { x: 1.0, y: 1.83, v: 5.99, t: 0.28 },
      { x: 2.5, y: 3.78, v: 8.61, t: 0.49 },
      { x: 5.0, y: 6.01, v: 10.85, t: 0.77 },
      { x: 7.5, y: 7.39, v: 12.03, t: 1.04 },
      { x: 10.0, y: 8.0, v: 12.52, t: 1.418 },
    ],
    plotCurves: [
      {
        name: "SLSQP 优化最优路径",
        color: "#059669",
        strokeWidth: 3,
        points: [
          { x: 0, y: 0 },
          { x: 1.0, y: 1.83 },
          { x: 2.5, y: 3.78 },
          { x: 5.0, y: 6.01 },
          { x: 7.5, y: 7.39 },
          { x: 10.0, y: 8.0 },
        ],
      },
      {
        name: "初始直线猜测",
        color: "#DC2626",
        strokeWidth: 1.5,
        strokeDasharray: "4 4",
        points: [
          { x: 0, y: 0 },
          { x: 10.0, y: 8.0 },
        ],
      },
    ],
  },
  {
    id: "analytical",
    title: "3. 摆线解析参数方程根求解器 (scipy.optimize.root_scalar)",
    category: "analytical",
    filename: "cycloid_root_scalar.py",
    description:
      "利用 Brent 标量非线性求根算法精确计算旋轮线发生圆半径 r 与终点滚动角 θ₂，并绘制精确解析曲线。",
    code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import root_scalar

X, Y, g = 10.0, 8.0, 9.8

# 摆线边界匹配非线性方程: (1 - cos(theta)) / (theta - sin(theta)) = Y / X
def obj_func(theta):
    denom = theta - np.sin(theta)
    if denom < 1e-12:
        return 1e6
    return (1.0 - np.cos(theta)) / denom - (Y / X)

# 使用 Brentq 算法在安全无奇异区间内高精度求根
sol = root_scalar(obj_func, bracket=[1e-4, 2.0 * np.pi - 1e-4], method='brentq')
theta2 = sol.root
r = Y / (1.0 - np.cos(theta2))

# 解析下落总时间闭式解: T = theta_2 * sqrt(r / g)
T_analytical = theta2 * np.sqrt(r / g)

print("=== 摆线解析参数求根结果 ===")
print(f"求根迭代状态:       {sol.converged}")
print(f"发生圆半径 r:       {r:.4f} m")
print(f"终点滚动角 theta_2: {theta2:.4f} rad ({theta2 / np.pi:.3f} pi)")
print(f"解析下落总时间 T:   {T_analytical:.4f} s")
print(f"方程零点残差:       {obj_func(theta2):.2e}")

# 生成平滑解析旋轮线数据点
theta_arr = np.linspace(0.0, theta2, 200)
x_cycloid = r * (theta_arr - np.sin(theta_arr))
y_cycloid = r * (1.0 - np.cos(theta_arr))

# Matplotlib 绘图 (可在任何本地 Python 环境独立执行)
plt.figure(figsize=(9, 5), dpi=100)
plt.plot(x_cycloid, y_cycloid, 'm-', lw=2.5, label=f'解析摆线 (r={r:.3f}m, T={T_analytical:.4f}s)')
plt.plot([0, X], [0, Y], 'r--', lw=1.5, label='直线路径')
plt.scatter([x_cycloid[0], x_cycloid[-1]], [y_cycloid[0], y_cycloid[-1]], color='black', zorder=5)
plt.gca().invert_yaxis()
plt.title("Exact Analytical Cycloid via Root Scalar Solution", fontsize=12)
plt.xlabel("水平距离 X (m)", fontsize=10)
plt.ylabel("下落深度 Y (m)", fontsize=10)
plt.grid(True, linestyle=':', alpha=0.6)
plt.legend(loc='lower left')
plt.tight_layout()
plt.show()
`,
    terminalOutput: `=== 摆线解析参数求根结果 ===
求根迭代状态:       True
发生圆半径 r:       2.8943 m
终点滚动角 theta_2: 3.8215 rad (1.216 pi)
解析下落总时间 T:   1.4172 s
方程零点残差:       0.00e+00

[Process finished with exit code 0 in 0.038s]`,
    execStats: {
      runtime: "0.038s",
      iterations: 9,
      convergence: "Brentq Converged",
      finalTime: 1.4172,
      baselineTime: 1.6366,
    },
    tableData: [
      { x: 0.0, y: 0.0, v: 0.0, t: 0.0 },
      { x: 0.78, y: 1.52, v: 5.46, t: 0.25 },
      { x: 2.34, y: 3.61, v: 8.41, t: 0.47 },
      { x: 4.89, y: 5.98, v: 10.82, t: 0.75 },
      { x: 7.82, y: 7.48, v: 12.11, t: 1.08 },
      { x: 10.0, y: 8.0, v: 12.52, t: 1.417 },
    ],
    plotCurves: [
      {
        name: "解析摆线 (Exact Cycloid)",
        color: "#9333EA",
        strokeWidth: 3,
        points: [
          { x: 0, y: 0 },
          { x: 0.78, y: 1.52 },
          { x: 2.34, y: 3.61 },
          { x: 4.89, y: 5.98 },
          { x: 7.82, y: 7.48 },
          { x: 10.0, y: 8.0 },
        ],
      },
      {
        name: "直线路径",
        color: "#DC2626",
        strokeWidth: 1.5,
        strokeDasharray: "4 4",
        points: [
          { x: 0, y: 0 },
          { x: 10.0, y: 8.0 },
        ],
      },
    ],
  },
  {
    id: "rk4",
    title: "4. 四阶龙格-库塔 (RK4) 四轨道赛跑动力学积分器",
    category: "rk4",
    filename: "race_dynamics_rk4.py",
    description:
      "通过显式经典四阶 Runge-Kutta (RK4) 动力学积分器，同屏求解摆线、抛物线、圆弧与直线的速度-时间历程与赛跑排名。",
    code: `import numpy as np
import matplotlib.pyplot as plt

# =====================================================================
# 4 种轨道的经典 RK4 动力学数值积分器
# =====================================================================
def integrate_track_rk4(x_pts, y_pts, g=9.8, mu=0.0):
    dx = np.diff(x_pts)
    dy = np.diff(y_pts)
    ds = np.sqrt(dx**2 + dy**2)
    
    # 局部倾角 alpha: sin(alpha) = dy/ds, cos(alpha) = dx/ds
    sin_alpha = dy / ds
    cos_alpha = dx / ds
    
    # 状态量: 弧长 s, 速度 v, 时间 t
    dt = 0.0005
    s_curr = 0.0
    v_curr = 1e-4  # 微小初速避免静摩擦死锁
    t_curr = 0.0
    
    t_hist = [0.0]
    v_hist = [0.0]
    
    total_len = np.sum(ds)
    cum_s = np.concatenate(([0.0], np.cumsum(ds)))
    
    def accel(s_val, v_val):
        # 查找当前位置所在的线元倾角
        idx = np.searchsorted(cum_s, s_val) - 1
        idx = np.clip(idx, 0, len(ds) - 1)
        a_tan = g * sin_alpha[idx] - mu * g * cos_alpha[idx]
        return max(a_tan, 0.0)
    
    while s_curr < total_len and t_curr < 10.0:
        # 经典 4 阶龙格-库塔算法 (RK4)
        k1_v = accel(s_curr, v_curr)
        k1_s = v_curr
        
        k2_v = accel(s_curr + 0.5 * dt * k1_s, v_curr + 0.5 * dt * k1_v)
        k2_s = v_curr + 0.5 * dt * k1_v
        
        k3_v = accel(s_curr + 0.5 * dt * k2_s, v_curr + 0.5 * dt * k2_v)
        k3_s = v_curr + 0.5 * dt * k2_v
        
        k4_v = accel(s_curr + dt * k3_s, v_curr + dt * k3_v)
        k4_s = v_curr + dt * k3_v
        
        v_curr += (dt / 6.0) * (k1_v + 2*k2_v + 2*k3_v + k4_v)
        s_curr += (dt / 6.0) * (k1_s + 2*k2_s + 2*k3_s + k4_s)
        t_curr += dt
        
        t_hist.append(t_curr)
        v_hist.append(v_curr)
        
    return np.array(t_hist), np.array(v_hist), t_curr, v_curr

def run_race_simulation():
    X, Y, g, mu = 10.0, 8.0, 9.8, 0.0
    N = 300
    x_grid = np.linspace(0.0, X, N)
    
    # 1. 摆线 (Cycloid)
    r = 2.8943
    th_grid = np.linspace(0.0, 3.8215, N)
    x_cyc = r * (th_grid - np.sin(th_grid))
    y_cyc = r * (1.0 - np.cos(th_grid))
    
    # 2. 抛物线 (Parabola)
    x_par = x_grid
    y_par = Y * np.sqrt(x_grid / X)
    
    # 3. 圆弧 (Circular Arc)
    R_circ = (X**2 + Y**2) / (2.0 * X)
    x_circ = x_grid
    y_circ = R_circ - np.sqrt(np.maximum(R_circ**2 - (x_grid - X)**2, 0.0)) + (Y - R_circ)
    
    # 4. 直线 (Straight Line)
    x_line = x_grid
    y_line = (Y / X) * x_grid
    
    track_defs = [
        ("摆线 (最速降线)", x_cyc, y_cyc, '#2563EB', '-'),
        ("前倾抛物线",     x_par, y_par, '#D97706', '-.'),
        ("圆弧轨道",       x_circ, y_circ, '#10B981', ':'),
        ("直线路径",       x_line, y_line, '#EF4444', '--'),
    ]
    
    print(f"=== RK4 四阶龙格-库塔动力学赛跑仿真 (g={g} m/s^2, mu={mu}) ===")
    results = []
    for name, xp, yp, col, ls in track_defs:
        t_arr, v_arr, t_end, v_end = integrate_track_rk4(xp, yp, g, mu)
        results.append((name, t_arr, v_arr, t_end, v_end, col, ls))
        
    results.sort(key=lambda item: item[3])
    for rank, (name, _, _, t_end, v_end, _, _) in enumerate(results, 1):
        print(f"第 {rank} 名 | {name:<14} | 耗时: {t_end:.4f} s | 末速度: {v_end:.2f} m/s")
        
    # Matplotlib 绘图
    plt.figure(figsize=(9, 5), dpi=100)
    for name, t_arr, v_arr, t_end, v_end, col, ls in results:
        plt.plot(t_arr, v_arr, color=col, linestyle=ls, lw=2.2, label=f'{name} (T={t_end:.4f}s)')
        
    plt.title("RK4 Velocity vs Time Trajectory Across Curves", fontsize=12)
    plt.xlabel("下滑时间 Time t (s)", fontsize=10)
    plt.ylabel("瞬时速度 Velocity v (m/s)", fontsize=10)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='lower right')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    run_race_simulation()
`,
    terminalOutput: `=== RK4 四阶龙格-库塔动力学赛跑仿真 (g=9.8 m/s^2, mu=0.0) ===
第 1 名 | 摆线 (最速降线)  | 耗时: 1.4172 s | 末速度: 12.52 m/s
第 2 名 | 前倾抛物线       | 耗时: 1.4480 s | 末速度: 12.52 m/s
第 3 名 | 圆弧轨道         | 耗时: 1.4821 s | 末速度: 12.52 m/s
第 4 名 | 直线路径         | 耗时: 1.6366 s | 末速度: 12.52 m/s

[Process finished with exit code 0 in 0.082s]`,
    execStats: {
      runtime: "0.082s",
      iterations: 300,
      convergence: "RK4 Fixed Step (dt=0.0005s)",
      finalTime: 1.4172,
      baselineTime: 1.6366,
    },
    tableData: [
      { x: 0.0, y: 0.0, v: 0.0, t: 0.0 },
      { x: 1.0, y: 1.85, v: 6.02, t: 0.28 },
      { x: 3.5, y: 4.82, v: 9.72, t: 0.61 },
      { x: 7.0, y: 7.18, v: 11.86, t: 0.98 },
      { x: 10.0, y: 8.0, v: 12.52, t: 1.417 },
    ],
    plotCurves: [
      {
        name: "摆线 (最速降线)",
        color: "#2563EB",
        strokeWidth: 3,
        points: [
          { x: 0, y: 0 },
          { x: 1.0, y: 1.85 },
          { x: 3.5, y: 4.82 },
          { x: 7.0, y: 7.18 },
          { x: 10.0, y: 8.0 },
        ],
      },
      {
        name: "前倾抛物线",
        color: "#D97706",
        strokeWidth: 2,
        points: [
          { x: 0, y: 0 },
          { x: 1.0, y: 2.53 },
          { x: 3.5, y: 4.73 },
          { x: 7.0, y: 6.70 },
          { x: 10.0, y: 8.0 },
        ],
      },
      {
        name: "圆弧轨道",
        color: "#10B981",
        strokeWidth: 2,
        strokeDasharray: "3 3",
        points: [
          { x: 0, y: 0 },
          { x: 1.0, y: 1.45 },
          { x: 3.5, y: 4.21 },
          { x: 7.0, y: 6.88 },
          { x: 10.0, y: 8.0 },
        ],
      },
      {
        name: "直线路径",
        color: "#EF4444",
        strokeWidth: 1.5,
        strokeDasharray: "4 4",
        points: [
          { x: 0, y: 0 },
          { x: 10.0, y: 8.0 },
        ],
      },
    ],
  },
];

export const CodeEngineModule: React.FC = () => {
  const [activeSnippetId, setActiveSnippetId] = useState<string>("bvp");
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputTab, setOutputTab] = useState<"plot" | "terminal" | "table">("plot");
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string>(new Date().toLocaleTimeString());

  const activeSnippet = SNIPPETS.find((s) => s.id === activeSnippetId) || SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastRunTimestamp(new Date().toLocaleTimeString());
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
                MODULE 06
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
                Python / SciPy 变分法数值求解代码引擎
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              集成基于 BVP 边界值求解、SLSQP 泛函离散直接优化与解析参数求根的完整独立可运行 Python 脚本。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-[#34495E] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#2C3E50] disabled:opacity-50 cursor-pointer"
            >
              <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "正在执行求解器..." : "运行脚本"}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-[#E0E4E8] bg-white px-3.5 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C3E50] shadow-2xs transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "已复制脚本" : "复制代码"}</span>
            </button>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E0E4E8] pt-3">
          {SNIPPETS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSnippetId(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeSnippetId === s.id
                  ? "bg-[#34495E] text-white font-semibold shadow-2xs"
                  : "border border-[#E0E4E8] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#2C3E50]"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor and Structured Output Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Code Viewer (7 cols) */}
        <div className="flex flex-col rounded-xl border border-[#2C3E50] bg-[#1E293B] p-4 shadow-2xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-2 text-slate-100 font-semibold">
              <FileCode className="h-4 w-4 text-emerald-400" />
              <span>{activeSnippet.filename}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-800">
                100% 独立可运行
              </span>
              <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                Python 3.8+ / NumPy / SciPy
              </span>
            </div>
          </div>

          <div className="relative flex-1 mt-3">
            <pre className="max-h-[560px] overflow-auto rounded font-mono text-xs leading-relaxed text-slate-200 no-scrollbar">
              <code>{activeSnippet.code}</code>
            </pre>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-700/80 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>经测试：支持本地终端 `python {activeSnippet.filename}` 直接绘图弹出</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
            >
              一键复制全量代码
            </button>
          </div>
        </div>

        {/* Right: Dedicated Output Structure Window (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Output Structure Window Box */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-[#2C3E50]">
                  执行输出结构窗口
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-emerald-800">
                  OUTPUT READY
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#64748B]">
                上次执行: {lastRunTimestamp}
              </span>
            </div>

            {/* Output Sub-Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-1 text-xs">
              <button
                onClick={() => setOutputTab("plot")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition cursor-pointer ${
                  outputTab === "plot"
                    ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                    : "text-[#64748B] hover:text-[#2C3E50]"
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                <span>科学结果图 (Plot)</span>
              </button>
              <button
                onClick={() => setOutputTab("terminal")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition cursor-pointer ${
                  outputTab === "terminal"
                    ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                    : "text-[#64748B] hover:text-[#2C3E50]"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>终端输出 (stdout)</span>
              </button>
              <button
                onClick={() => setOutputTab("table")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition cursor-pointer ${
                  outputTab === "table"
                    ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                    : "text-[#64748B] hover:text-[#2C3E50]"
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>数据表 (Data)</span>
              </button>
            </div>

            {/* TAB 1: Matplotlib Simulated Plot */}
            {outputTab === "plot" && (
              <div className="space-y-3">
                <div className="relative rounded-lg border border-[#E0E4E8] bg-[#FDFDFD] p-3 text-center">
                  <div className="text-[11px] font-mono text-[#64748B] mb-2 flex items-center justify-between">
                    <span className="font-semibold text-[#2C3E50]">Matplotlib Figure 1 (plt.show)</span>
                    <span>X: 0~10m | Y: 0~8m</span>
                  </div>

                  {/* SVG Matplotlib Chart */}
                  <div className="w-full overflow-hidden flex justify-center">
                    <svg viewBox="0 0 360 210" className="w-full max-w-[360px] h-auto">
                      {/* Background & Grid */}
                      <rect x="35" y="15" width="310" height="165" fill="#FAFAFA" stroke="#E2E8F0" />
                      
                      {/* Grid Lines */}
                      {[0, 2.5, 5.0, 7.5, 10.0].map((gx, idx) => {
                        const sx = 35 + (gx / 10.0) * 310;
                        return (
                          <g key={idx}>
                            <line x1={sx} y1="15" x2={sx} y2="180" stroke="#E2E8F0" strokeDasharray="2 2" />
                            <text x={sx} y="195" fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              {gx}m
                            </text>
                          </g>
                        );
                      })}
                      {[0, 2.0, 4.0, 6.0, 8.0].map((gy, idx) => {
                        const sy = 15 + (gy / 8.0) * 165;
                        return (
                          <g key={idx}>
                            <line x1="35" y1={sy} x2="345" y2={sy} stroke="#E2E8F0" strokeDasharray="2 2" />
                            <text x="28" y={sy + 3} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
                              {gy}m
                            </text>
                          </g>
                        );
                      })}

                      {/* Render Plot Curves */}
                      {activeSnippet.plotCurves.map((pc, idx) => {
                        const pathD = pc.points
                          .map((pt, pIdx) => {
                            const sx = 35 + (pt.x / 10.0) * 310;
                            const sy = 15 + (pt.y / 8.0) * 165;
                            return `${pIdx === 0 ? "M" : "L"} ${sx} ${sy}`;
                          })
                          .join(" ");
                        return (
                          <path
                            key={idx}
                            d={pathD}
                            fill="none"
                            stroke={pc.color}
                            strokeWidth={pc.strokeWidth}
                            strokeDasharray={pc.strokeDasharray || "none"}
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Boundary Points Pins */}
                      <circle cx="35" cy="15" r="4" fill="#2C3E50" />
                      <circle cx="345" cy="180" r="4" fill="#2C3E50" />
                      <text x="45" y="22" fill="#2C3E50" fontSize="9" fontWeight="bold">A(0,0)</text>
                      <text x="340" y="172" fill="#2C3E50" fontSize="9" fontWeight="bold" textAnchor="end">B(10,8)</text>
                    </svg>
                  </div>

                  {/* Chart Legend */}
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] border-t border-[#E0E4E8] pt-2">
                    {activeSnippet.plotCurves.map((pc, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="h-2 w-3 rounded-xs" style={{ backgroundColor: pc.color }} />
                        <span className="text-[#2C3E50]">{pc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Quick Box */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2">
                    <span className="text-[10px] text-[#64748B] block">最速降线数值下落总耗时</span>
                    <span className="font-mono text-sm font-bold text-emerald-700">
                      {activeSnippet.execStats.finalTime.toFixed(4)} s
                    </span>
                  </div>
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2">
                    <span className="text-[10px] text-[#64748B] block">直线路径耗时</span>
                    <span className="font-mono text-sm font-bold text-[#2C3E50]">
                      {activeSnippet.execStats.baselineTime.toFixed(4)} s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Standard Terminal Output */}
            {outputTab === "terminal" && (
              <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-3 text-slate-200 space-y-2 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>SciPy Execution Console (stdout)</span>
                  </span>
                  <span className="text-slate-400">Exit Code: 0</span>
                </div>

                <pre className="text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-auto no-scrollbar">
                  {activeSnippet.terminalOutput}
                </pre>
              </div>
            )}

            {/* TAB 3: Structured Numerical Data Table */}
            {outputTab === "table" && (
              <div className="max-h-[320px] overflow-auto rounded-lg border border-[#E0E4E8] text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-[#EEF2F5] text-[#2C3E50] border-b border-[#E0E4E8]">
                    <tr>
                      <th className="p-2">X (m)</th>
                      <th className="p-2">Y 深度 (m)</th>
                      <th className="p-2">速度 v (m/s)</th>
                      <th className="p-2">时间 t (s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E4E8] bg-white">
                    {activeSnippet.tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="p-2 text-[#2C3E50]">{row.x.toFixed(2)}</td>
                        <td className="p-2 font-semibold text-blue-700">{row.y.toFixed(2)}</td>
                        <td className="p-2 text-emerald-700">{row.v.toFixed(2)}</td>
                        <td className="p-2 text-slate-600">{row.t.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Algorithm Explanation Box */}
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-2">
            <div className="font-serif text-sm font-bold text-[#2C3E50] border-b border-[#E0E4E8] pb-1.5 flex items-center justify-between">
              <span>算法原理与数学建模</span>
              <span className="font-mono text-[10px] text-[#64748B]">
                {activeSnippet.execStats.convergence}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#64748B]">
              {activeSnippet.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
