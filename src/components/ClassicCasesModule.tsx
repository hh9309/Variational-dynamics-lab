import React, { useState } from "react";
import { CaseStudy } from "../types";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Gauge,
  TrendingDown,
  Globe2,
  Clock,
} from "lucide-react";
import { BlockMath, InlineMath } from "../utils/mathRender";

interface ClassicCasesModuleProps {
  onLoadCaseToSandbox: (caseItem: CaseStudy) => void;
}

const CASES_DATA: CaseStudy[] = [
  {
    id: "case-standard",
    title: "1. 经典两点最速降线",
    category: "理论基准",
    subtitle: "无摩擦力理想重力场下的极值路径",
    description:
      "最标准的质点在恒定重力场中由静止滑落问题，展示重力势能以最高效率转化为动能的理论最优曲线。",
    formula: "x = r(\\theta - \\sin\\theta), \\quad y = r(1 - \\cos\\theta)",
    parameters: { startX: 0, startY: 0, endX: 12, endY: 8, gravity: 9.8, friction: 0 },
    keyInsight:
      "前期以近乎垂直的俯冲让小球迅速达到高速，牺牲少量几何距离换取全称极高平均速度。",
    historyNote: "1696 年约翰·伯努利在《教师学报》向全欧学者发起挑战的经典原型。",
  },
  {
    id: "case-friction",
    title: "2. 摩擦力约束下滑线",
    category: "工程力学",
    subtitle: "引入库仑滑动摩擦因数 μ > 0 的修正最速降线",
    description:
      "实际轨道存在滑动摩擦阻力 f = μN = μmg cosα。欧拉-拉格朗日方程在耗散力作用下修正，最优路径相较无摩擦时更加平缓。",
    formula: "y[1 + (y')^2] = 2r (1 - \\mu y')^2",
    parameters: { startX: 0, startY: 0, endX: 15, endY: 7, gravity: 9.8, friction: 0.12 },
    keyInsight:
      "摩擦力做功与法向压力正相关。在陡峭段法向力较小，因此前期仍需陡降，但中后段坡度需比无摩擦摆线更早变平以减少摩擦耗能。",
    historyNote: "欧拉在 1744 年变分法专著中首次给出了含干摩擦的变分极值解析近似解。",
  },
  {
    id: "case-pendulum",
    title: "3. 惠更斯等时摆线摆",
    category: "精密仪器",
    subtitle: "彻底消除单摆大角度振动周期误差的等时钟",
    description:
      "普通单摆周期 T = 2π√(L/g) 仅在小角度 θ << 1 时成立。惠更斯发现摆线的渐屈线（Evolute）仍然是相同的摆线，通过摆线挡板约束摆绳，实现任意振幅严格等时。",
    formula: "T = 4\\pi \\sqrt{\\frac{r}{g}} = 2\\pi \\sqrt{\\frac{L}{g}} \\quad (\\forall \\theta_{\\max})",
    parameters: { startX: 0, startY: 0, endX: 10, endY: 10, gravity: 9.8, friction: 0 },
    keyInsight:
      "摆绳在摆动过程中贴靠两侧摆线挡板，使得摆锤质点的实际轨迹是一条完整的反向摆线，回复力严格正比于弧长 s。",
    historyNote: "惠更斯于 1673 年在《摆钟论》(Horologium Oscillatorium) 中发表此发明，成为航海经度测量的重要里程碑。",
  },
  {
    id: "case-ski",
    title: "4. 滑雪跳台助滑道弧度设计",
    category: "体育工程",
    subtitle: "冬奥会高山滑雪助滑道最大起跳速度与姿态优化",
    description:
      "高山滑雪运动员在助滑道（Inrun）下滑需在起跳台达到最高离地水平速度，同时限制下凹段最大向心加速度不超过人体耐受极限（3~4G）。",
    formula: "v_{\\text{takeoff}} = \\sqrt{2gH - 2\\mu g L_x}",
    parameters: { startX: 0, startY: 0, endX: 25, endY: 15, gravity: 9.8, friction: 0.04 },
    keyInsight:
      "最速降线不仅提供最高起跳初速，而且过渡圆弧与摆线无缝拼接可消除法向冲击力（Jerk）突变。",
    historyNote: "国际雪联 (FIS) 现代跳台标准助滑道纵断面曲线大量借鉴变分法曲率连续过渡优化算法。",
  },
  {
    id: "case-rollercoaster",
    title: "5. 过山车轨道过渡段设计",
    category: "游乐装备",
    subtitle: "回转环与俯冲段的曲率连续性与 G 值过载控制",
    description:
      "传统圆形回环在入口处曲率突变产生巨大颈部冲击；采用旋轮线与回旋线（Clothoid）复合过渡轨道，可使向心加速度线性平稳上升。",
    formula: "\\kappa(s) = \\frac{1}{R(s)} = \\frac{s}{A^2}, \\quad a_n = v^2 \\kappa(s)",
    parameters: { startX: 0, startY: 0, endX: 18, endY: 12, gravity: 9.8, friction: 0.02 },
    keyInsight:
      "变分法不仅能优化时间泛函，还能构造加速度变化率泛函（Minimizing Jerk Functional），保证乘员极度平稳舒适。",
    historyNote: "1976 年美国革命号 (Revolution) 过山车首次应用变分过渡轨道，彻底解决了过山车断颈安全隐患。",
  },
  {
    id: "case-earth-tunnel",
    title: "6. 引力场下行星过洞 (地球重力隧道)",
    category: "天体物理",
    subtitle: "穿透均匀密度地球两点间的最速降线 (Hypocycloid)",
    description:
      "在均匀密度地球内部，引力随半径线性衰减 g(r) = g₀ (r/R)。两城市间若开凿真空隧道，直线隧道需 42.2 分钟；而最速降线内摆线仅需 38.0 分钟！",
    formula: "T_{\\text{hypocycloid}} = \\frac{2\\pi}{\\sqrt{g_0/R}} \\sqrt{\\frac{d}{2R}} \\approx 38.0 \\text{ min}",
    parameters: { startX: 0, startY: 0, endX: 20, endY: 10, gravity: 9.8, friction: 0 },
    keyInsight:
      "直线隧道做简谐运动周期恒为 42.2 分钟；深入地心更深处的内摆线隧道利用深层更强引力分量加速，成为行星际最速交通网络理论极限。",
    historyNote: "引力隧道最速降线问题由爱德华·皮尔斯在 1966 年发表于《美国物理学杂志》。",
  },
];

export const ClassicCasesModule: React.FC<ClassicCasesModuleProps> = ({
  onLoadCaseToSandbox,
}) => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy>(CASES_DATA[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
            MODULE 05
          </span>
          <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
            六大经典应用案例库与工程演播
          </h2>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">
          从理论基准到干摩擦力、惠更斯摆线摆、滑雪跳台、过山车过渡段与地球重力隧道的完整跨学科变分演播。
        </p>
      </div>

      {/* Case Grid and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Case Selector List */}
        <div className="space-y-2.5 lg:col-span-5">
          {CASES_DATA.map((c) => {
            const isSelected = selectedCase.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  isSelected
                    ? "border-[#34495E] bg-[#EEF2F5] shadow-2xs ring-1 ring-[#34495E]/20"
                    : "border-[#E0E4E8] bg-white hover:border-slate-300 hover:bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[#2C3E50]">{c.title}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold border ${
                      isSelected ? "bg-white text-[#34495E] border-[#E0E4E8]" : "bg-[#F8FAFC] text-[#64748B] border-[#E0E4E8]"
                    }`}
                  >
                    {c.category}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#64748B] line-clamp-2">{c.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Right Case Detailed Breakdown View */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-[#E0E4E8] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E0E4E8] pb-3 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#34495E] border border-[#E0E4E8]">
                  {selectedCase.category}
                </span>
                <h3 className="mt-1.5 font-serif text-lg font-bold text-[#2C3E50]">
                  {selectedCase.title}
                </h3>
              </div>

              {/* Load Case to Sandbox Button */}
              <button
                onClick={() => onLoadCaseToSandbox(selectedCase)}
                className="flex items-center gap-2 rounded-lg bg-[#34495E] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2C3E50]"
              >
                <span>一键载入 2D 赛跑沙盒</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs leading-relaxed text-[#2C3E50]">
              {selectedCase.description}
            </p>

            {/* Formula Card */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 text-center">
              <span className="text-[11px] font-semibold text-[#64748B]">核心控制微分 / 参数方程：</span>
              <BlockMath math={selectedCase.formula} />
            </div>

            {/* Key Insights */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#EEF2F5] p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E50]">
                <Sparkles className="h-4 w-4 text-[#34495E]" />
                <span>变分物理核心洞见 (Core Physical Insight)</span>
              </div>
              <p className="text-xs leading-relaxed text-[#64748B]">
                {selectedCase.keyInsight}
              </p>
            </div>

            {/* History Note */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 text-xs text-[#64748B]">
              <span className="font-semibold text-[#2C3E50]">历史与科学史注记：</span>
              <p className="mt-0.5">{selectedCase.historyNote}</p>
            </div>

            {/* Preset Parameters Table */}
            <div className="rounded-lg border border-[#E0E4E8] p-3 text-xs bg-white">
              <span className="font-semibold text-[#2C3E50]">沙盒预设物理参数：</span>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono sm:grid-cols-4">
                <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E0E4E8] text-center">
                  <span className="text-[#64748B] text-[10px] block">水平跨度 X</span>
                  <span className="font-bold text-[#2C3E50]">{selectedCase.parameters.endX} m</span>
                </div>
                <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E0E4E8] text-center">
                  <span className="text-[#64748B] text-[10px] block">落差 Y</span>
                  <span className="font-bold text-[#2C3E50]">{selectedCase.parameters.endY} m</span>
                </div>
                <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E0E4E8] text-center">
                  <span className="text-[#64748B] text-[10px] block">重力 g</span>
                  <span className="font-bold text-[#2C3E50]">{selectedCase.parameters.gravity} m/s²</span>
                </div>
                <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E0E4E8] text-center">
                  <span className="text-[#64748B] text-[10px] block">摩擦系数 μ</span>
                  <span className="font-bold text-[#2C3E50]">{selectedCase.parameters.friction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
