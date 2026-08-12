import React, { useState } from 'react';
import { 
  BookOpen, Brain, Sparkles, Sun, Flame, Target, 
  History, Library, ArrowRight, HelpCircle, GraduationCap,
  Compass, Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface PrincipleCard {
  id: string;
  title: string;
  formula: string;
  desc: string;
  story: string;
  era: string;
  author: string;
  icon: React.ReactNode;
  colorClass: string;
  badge: string;
}

export default function KnowledgeGuide() {
  const [activeCard, setActiveCard] = useState<string>('brachistochrone');

  const principles: PrincipleCard[] = [
    {
      id: 'brachistochrone',
      title: '最速降线原理解析',
      formula: 'T = ∫ [√(1 + y\'²) / √(2gy)] dx → δT = 0',
      desc: '最速降线是在一动点在重力场中无摩擦下滑时，求解连结不在同一竖直线上两点之最快移动轨道。其解析解为倒置摆线（旋轮线），其背后的物理变分奥秘在于重力势能释放的最佳时间重组：在降落初期通过抖峭的斜劈式断崖跌落，倾泻势能换取峰值速度与巨大的惯性动能；当逼近中后期阻尼偏角变缓时，再借由这股庞大的前瞻惯性平滑越过水平阻隔。这种瞬间陡峭与高效平移的完美妥协，不仅揭示了重力加速度的积分配对，更在全球域（非局部域）微分积分中，奇妙而庄严地实现了整体传播时间之绝对极小化，闪耀着自然规律极致优雅、毫厘不差的极值变分法则光辉。',
      story: '1696年，约翰·伯努利借此向全欧洲数学家发起公开挑战。牛顿、莱布尼茨、雅各布·伯努利及洛必达均参与了解答。牛顿收到信后数小时内即用莱布尼茨未发表的微积分方法解决了此题，署名发表。伯努利感叹道：“我从爪印中认出了那头雄狮。”',
      era: '1696 年',
      author: '约翰·伯努利、艾萨克·牛顿',
      icon: <Flame className="w-5 h-5" />,
      colorClass: 'from-amber-500/10 to-orange-500/5 hover:border-amber-400 text-amber-600',
      badge: '重力势能与摆线拓扑'
    },
    {
      id: 'fermat',
      title: '费马极短时间原理',
      formula: 'S = ∫ n(s) ds = c * T → δS = 0',
      desc: '费马极短时间原理阐明了光在空间中自两点传播时，其真实路径总是使光程（折射率与路径几何弧长的积分乘积）取平稳驻值。在经典的连续变折射率介质或分层非均匀材料中，这几乎表现为纯粹的光程时间局域极小。光在穿透低光速的稠密重介质（如高密度玻璃、金刚石）时，通过自主弯曲、非线性妥协乃至折射转折，在宏观上寻求距离损耗与迟滞延时的最佳物理天平。这是一种令人赞叹、高妙绝伦的全局大局观：每一束微光在射出之瞬，便仿佛以变分算子探知了前路的所有阻力结构，并通过自适应匹配路径的极速权衡，以绝对最优的时间效率跨越时空障碍，成了几何光学与现代偏振波技术的最底层基石。',
      story: '皮埃尔·德·费马在 1662 年提出这一公式，用来反对勒内·笛卡尔声称的光速在重介质中更快的唯心理论。它是第一个宏观变分原理，为波动光学、波动方程、甚至量子重整化中波粒二象性积分奠定了基础。',
      era: '1662 年',
      author: '皮埃尔·德·费马',
      icon: <Sun className="w-5 h-5" />,
      colorClass: 'from-sky-500/10 to-blue-500/5 hover:border-sky-400 text-sky-600',
      badge: '几何光学与全反射几何'
    },
    {
      id: 'action',
      title: '哈密顿最小作用量原理',
      formula: 'S = ∫ (T - V) dt → δS = 0',
      desc: '哈密顿最小作用量原理是统治整个经典宏观力学直至狭义相对论、量子场论的自然终极哲学。它表明实体粒子或连续物理系统在给定拓扑起点与终点的时空穿梭中，其实际发生的演进轨道，必使作用量 S（即拉格朗日量力学动能 T 与势能 V 的时间积分累积）的一阶变分精确归零。在浩瀚的物理宇宙中，世界从未选择盲目、暴力的局部碰撞，而是时刻遵循着一种超越人类理性的、最省能且最不挥霍一分微元的极简自洽路径前行。一切力学系统呈现出的抛物、自转或对称演化，在泛函极值空间内均只是此作用量势阱底部那一道和谐统一的物理平衡解，昭示着自然规律神圣而无懈可击的内在简约纯真。',
      story: '威廉·哈密顿在1834年将它推广到所有动力系统中，它是物理学、高能强子碰撞、引力相对论、标准粒子等物理学大统一理论的基石，真正体现了上帝从不挥霍微元做功的简约法则。',
      era: '1834 年',
      author: '威廉·哈密顿、拉格朗日',
      icon: <Sparkles className="w-5 h-5" />,
      colorClass: 'from-purple-500/10 to-indigo-500/5 hover:border-purple-400 text-purple-600',
      badge: '分析力学与经典宇宙观'
    },
    {
      id: 'trajectory',
      title: '庞特里亚金极大值原理',
      formula: 'H(x, u, p) = pᵀ f(x, u) - L(x, u) → min J',
      desc: '庞特里亚金极大值原理构成了现代最优控制理论最权威、最深广的理论支柱，标志着经典变分法在二十世纪全面步入多维约束下的工程实战时代。当面对包含燃料局限、过载防撞、飞行速度等强非线性多重物理边界限制时，庞氏极大值原理独辟蹊径地构造了哈密顿控制函数，巧妙地将动态无穷维的路径变分，降维映射为时间轴各切片控制输入（如推力、迎角）的即时静态哈密顿全域极值解。这一数学重组极大地规避了雅可比矩阵奇异性，使人类获得了精确引导洲际导弹与阿波罗登月舱飞向特定天体轨迹的计算神力。其在工程中与滚动时域规划（MPC）的交融，使避障与效率在复杂限制边界下达到了惊人的对立统一。',
      story: '当时这标志着变分法跨入工程现代控制时代。无人机避障算法目前采用的滚动时域控制（MPC），在数学底层就是不断解算此极大极小极值罚值函数的过程。',
      era: '1956 年',
      author: '列夫·庞特里亚金',
      icon: <Target className="w-5 h-5" />,
      colorClass: 'from-rose-500/10 to-red-500/5 hover:border-rose-400 text-rose-600',
      badge: '最优控制与罚函数边界'
    },
    {
      id: 'rl',
      title: '贝尔曼方程与强最优控制',
      formula: 'V*(s) = max_u [ R(s,u) + γ ∑ P(s\'|s,u) V*(s\') ]',
      desc: '贝尔曼最优方程是动态规划与近代自适应控制、强化学习的绝对灵魂。它通过将旷日持久、维度灾难级别的长序列全局变分最优化，解构成极其雅致的“多阶段决策递归链条”：在每一个时序切片，智能体将面临即时高奖励与未来衰减预期的动态剪枝平衡，以此导出状态价值函数 V*(s) 的唯一最佳回溯算子。该方程的等价离散 Bellman 迭代成了人工智能（AlphaGo、大语言系统序列规划、高动态自动驾驶）迈向端到端最优动作自进化的极值判定准则。它彻底打通了物理世界粒子追迹的变分积分路线，与数学不确定性状态空间图上梯度场上升路线的无缝融合，引导着智算体在无数次随机碰撞后逼近完美的智慧解集。',
      story: '理查德·贝尔曼于1950年代为解决运筹规划中组合爆炸问题提出。它巧妙地统一了物理中的连续轨迹搜索与多维状态图上的概率梯度搜索，是 AI 自我迭代、在无数局挫败后寻出局部极佳行动链的代码法则。',
      era: '1957 年',
      author: '理查德·贝尔曼',
      icon: <Brain className="w-5 h-5" />,
      colorClass: 'from-indigo-500/10 to-blue-500/5 hover:border-indigo-400 text-indigo-600',
      badge: '马尔可夫强化学习与智算寻优'
    }
  ];

  const selectedPrinciple = principles.find(p => p.id === activeCard) || principles[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 max-h-[85vh] overflow-y-auto" id="knowledge-guide-root">
      
      {/* 顶部总览 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Library className="w-5 h-5 text-emerald-500" />
            变分力学与最优化理论知识导引
          </h2>
          <p className="text-xs text-slate-400">
            物理世界之所以如此精妙与平衡，是因为宇宙在宏观变分学上有选择地采取了极值运行。
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start shrink-0 bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-700 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          变分物理学术通识级
        </div>
      </div>

      {/* 1. 核心极值定理展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧选择导航 */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono px-1">
            三大古典泛函与现代极值代换
          </div>
          {principles.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveCard(p.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col gap-1 transition-all duration-200 ${
                activeCard === p.id 
                  ? 'border-emerald-500 bg-emerald-50/10 ring-2 ring-emerald-500/10' 
                  : 'border-slate-100 hover:border-slate-300 bg-slate-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-1 rounded-lg ${activeCard === p.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-650'}`}>
                  {p.icon}
                </span>
                <span className="text-[9px] font-mono font-medium text-slate-400">{p.era}</span>
              </div>
              <h4 className="font-bold text-xs text-slate-800 mt-1">{p.title}</h4>
              <p className="text-[10px] text-zinc-400 truncate pl-0.5">{p.author}</p>
            </button>
          ))}
        </div>

        {/* 右侧详细视窗 */}
        <div className={`lg:col-span-8 rounded-2xl border border-slate-200/80 p-5 bg-gradient-to-br from-slate-50/40 via-white to-slate-50/10 flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded font-mono">
                {selectedPrinciple.badge}
              </span>
              <div className="text-xs text-slate-400">
                主贡献：<span className="font-semibold text-slate-700">{selectedPrinciple.author}</span> ({selectedPrinciple.era})
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{selectedPrinciple.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed text-justify">{selectedPrinciple.desc}</p>
            </div>

            {/* 核心公式展示牌 */}
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl shadow-inner border border-slate-800 font-mono text-center flex flex-col justify-center py-5 relative overflow-hidden">
              <div className="absolute top-1 left-2 text-[8px] text-slate-500 tracking-widest uppercase">变分积分泛函极值形式</div>
              <p className="text-base font-bold tracking-wide mt-1 select-all">{selectedPrinciple.formula}</p>
            </div>

            {/* 趣事与史学背景 */}
            <div className="bg-amber-50/45 border border-amber-200/50 p-3.5 rounded-xl text-amber-900 space-y-1">
              <div className="text-[10px] font-bold text-amber-700/80 uppercase flex items-center gap-1 font-mono">
                <Compass className="w-3.5 h-3.5" />
                科学界逸闻轶事 (Historical Story)
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans italic">
                "{selectedPrinciple.story}"
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>泛函一阶变分值: δL/δq = d(∂L/∂q')/dt</span>
            <span>经典解析解激活</span>
          </div>
        </div>
      </div>

      {/* 2. 变分史诗长河 Timeline */}
      <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/20 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1">
          <History className="w-4 h-4 text-emerald-500" />
          变分科学史史诗长河 (Variational Giants Timeline)
        </h3>
        <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-5">
          <div className="relative">
            <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-emerald-500 border border-white rounded-full"></span>
            <div className="text-xs font-mono font-bold text-emerald-600">1662 年 · 极短光程确立</div>
            <p className="text-xs font-bold text-slate-800">皮埃尔·德·费马提出折射极值原理</p>
            <p className="text-[10px] text-slate-400">提出光的速度在中介质降低，光选择总体耗时最小的曲线传播，首次确立宏观极值哲学。</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-amber-500 border border-white rounded-full"></span>
            <div className="text-xs font-mono font-bold text-amber-600">1696 年 · 伯努利速降挑战</div>
            <p className="text-xs font-bold text-slate-800">最速降线催生古典变分数学诞生</p>
            <p className="text-[10px] text-slate-400">约翰·伯努利发起擂台，诱导牛顿用初创微积分算力展现神迹。全欧学界震恐，开创物理泛函变分求和新元。</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-purple-500 border border-white rounded-full"></span>
            <div className="text-xs font-mono font-bold text-purple-600">1744 年 · 欧拉拉格朗日极限方程</div>
            <p className="text-xs font-bold text-slate-800">Euler-Lagrange Equation 标准形式</p>
            <p className="text-[10px] text-slate-400">大数学家欧拉与拉格朗日合作，不依赖繁重几何公式，完全应用变分符号算子。将所有力学问题一锤定音地归于泛函微分方程。</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-blue-500 border border-white rounded-full"></span>
            <div className="text-xs font-mono font-bold text-blue-600">1834 年 · 量子跃迁的数学前夕</div>
            <p className="text-xs font-bold text-slate-800">哈密顿提出作用量稳态泛函驻值</p>
            <p className="text-[10px] text-slate-400">哈密顿用拉格朗日乘子，完美合并动能与势能的时间累次，完成了全部广义坐标系的力学大归一，启发了经典变分力学并直通波动力学。</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-rose-500 border border-white rounded-full"></span>
            <div className="text-xs font-mono font-bold text-rose-600">1950 - 1980 年 · 直达现代人工智能</div>
            <p className="text-xs font-bold text-slate-800">庞特里亚金极大值与贝尔曼最优决策</p>
            <p className="text-[10px] text-slate-400">变分科学转入工程自洽自适应寻优（Apollo导弹、自进化网络），最终促成了二十一世纪强化学习深度神经网络与自动控制控制场之爆发。</p>
          </div>
        </div>
      </div>

    </div>
  );
}
