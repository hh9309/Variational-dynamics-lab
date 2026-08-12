import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle2, Circle, Flame, Sun, Sparkles, 
  Target, Brain, Info, HelpCircle, Award, RefreshCw, Star
} from 'lucide-react';

interface ExperimentTask {
  id: string;
  category: 'brachistochrone' | 'fermat' | 'action' | 'trajectory' | 'rl';
  title: string;
  difficulty: '入门' | '进阶' | '核心探索';
  description: string;
  targetMetric: string;
  tip: string;
}

export default function ExperimentGuide() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'brach-1': true,
    'fermat-1': false,
  });
  const [activeCategory, setActiveCategory] = useState<'all' | 'brachistochrone' | 'fermat' | 'action' | 'trajectory' | 'rl'>('all');

  const tasks: ExperimentTask[] = [
    {
      id: 'brach-1',
      category: 'brachistochrone',
      title: '验证摆线等时性（等时降线探索）',
      difficulty: '入门',
      description: '将起点水平高度任意拉高或减低，观察无论起始高低如何，多颗小球在纯摆线轨迹（Cycloid）上运动到最底部所消耗的时间是否完全恒定。',
      targetMetric: '时间差 𝛥t ≈ 0 ms',
      tip: '在“最速降线仿真器”中，分别让小球在不同高度释放，摆线小球到达终点时，你会惊奇地发现它们的总周期保持了宇宙级别的同步！'
    },
    {
      id: 'brach-2',
      category: 'brachistochrone',
      title: '极值变分比较（拉开落差）',
      difficulty: '核心探索',
      description: '将目标点拉到极低且水平距离较大的位置，开启五轨竞速，对比直线槽、圆弧槽、抛物线槽与最速降线的最终跑秒。',
      targetMetric: '摆线用时最少，比直线通道节约 25%+ 耗时',
      tip: '当落差加大时，早期极速坠落积累的大幅度重力加速度惯性优势，能够最大化抛离直线槽的匀速加速状态。'
    },
    {
      id: 'fermat-1',
      category: 'fermat',
      title: '折射率阶跃下的折合传播',
      difficulty: '入门',
      description: '拖动折射率边界的分界控制点，将下半部分的折射率 n 设至 2.4 (相当于金刚石重介质)，观察光线发生折射时偏折角度的变化。',
      targetMetric: '入射角与折射角严格遵从斯涅尔定律 sin 𝜃₁ / sin 𝜃₂ = n₂ / n₁',
      tip: '因为下部稠密介质传播阻滞严重，光线变分求和会自动选择在稠密区滑行最短水平距离，因此更接近法线！'
    },
    {
      id: 'fermat-2',
      category: 'fermat',
      title: '逆温层渐变全反射极限',
      difficulty: '核心探索',
      description: '在费马光程仿真器中，将起点拉高至空气层中央，将目标向水平最远侧拉，观察光线是如何在渐变边界中弯曲并达到全反射“彩虹弯弧”。',
      targetMetric: '连续变分状态下 δS = 0 弯弯弧线形成',
      tip: '这就是沙漠蜃景中路面看起来波光粼粼的物理本质，因为贴近地面的热空气折射率低，光弯曲向上走射向眼睛！'
    },
    {
      id: 'action-1',
      category: 'action',
      title: '摆锤变分波动探针（寻找能量凹点）',
      difficulty: '进阶',
      description: '调节左右偏离正弦微扰幅度 Slider。仔细观察“当前变分作用量”S 的数据反馈，记录它何时下降到与“经典分析驻解”完全一致。',
      targetMetric: '寻找极驻重心点 δS = 0; S ≈ 经典驻值 (L_min)',
      tip: '一旦你偏离经典物理路径，系统积分中的 (T - V) 就会在各微元切片中急剧失调。在 0 刻度时，作用量 S 曲线呈盆底极度对称。'
    },
    {
      id: 'trajectory-1',
      category: 'trajectory',
      title: '无人控制律天平配平（安全避障）',
      difficulty: '核心探索',
      description: '添加 2 颗大型障碍物阻止直接前行。随后拉大“安全避障惩罚权重”w₃，重新点击 AI 算力优化解算航迹。',
      targetMetric: '红色安全寻优路径以饱满的圆弧完美绕过红色高能重压障碍物',
      tip: '最优控制函数就像一台天平：增大安全权重后无人机选择绕远；增大时间权重后无人机选择紧贴边缘冒险穿梭。'
    },
    {
      id: 'rl-1',
      category: 'rl',
      title: '马尔可夫期望控制训练',
      difficulty: '核心探索',
      description: '在强化学习控制场中，启动智能体控制小球越障，观察经过多次训练（100步以上）后，背景价值场网格渐变对控制梯度的指引效果。',
      targetMetric: '小球路径逐步逼近纯深蓝色高价值网格中央，逃离红色惩罚火坑',
      tip: '网格上的蓝色深浅代表贝尔曼状态值的值估计 V(s)，经过变分收敛，小球将像水流下滑一样自然汇入蓝色价值深谷，完成智能避障。'
    }
  ];

  const handleToggleTask = (id: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);

  const completedCount = tasks.filter(t => completedTasks[t.id]).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'brachistochrone': return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'fermat': return <Sun className="w-3.5 h-3.5 text-sky-500" />;
      case 'action': return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'trajectory': return <Target className="w-3.5 h-3.5 text-rose-500" />;
      case 'rl': return <Brain className="w-3.5 h-3.5 text-indigo-500" />;
      default: return null;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'brachistochrone': return '最速降线';
      case 'fermat': return '费马光学';
      case 'action': return '最小作用量';
      case 'trajectory': return '航迹控制';
      case 'rl': return '强化学习';
      default: return '通用';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-fadeIn" id="experiment-guide-root">
      
      {/* 顶部任务报告卡 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12">
          <ClipboardList className="w-48 h-48" />
        </div>
        <div className="space-y-1.5 relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-100" />
            实验室推荐科学探索实验任务
          </h2>
          <p className="text-xs text-emerald-50/90 leading-relaxed max-w-xl">
            点击左侧大仿真窗口，进行多重控制变量调整。在下方跟踪您的科研打卡，达成标准物理极值量后，即可点击勾选标记通关！
          </p>
        </div>

        {/* 环形进度/百分比条 */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto relative z-10">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider font-mono">MILITARY EXPLORE PROGRESS</span>
            <span className="text-sm font-bold font-mono">科研达成率: {progressPercent}%</span>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-emerald-300/30 flex items-center justify-center font-mono font-bold text-xs relative">
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin-slow opacity-15"></div>
            {completedCount}/{tasks.length}
          </div>
        </div>
      </div>

      {/* 任务流过滤器 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all ${
              activeCategory === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            全选任务 ({tasks.length})
          </button>
          {(['brachistochrone', 'fermat', 'action', 'trajectory', 'rl'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-all ${
                activeCategory === cat ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {getCategoryIcon(cat)}
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setCompletedTasks({})}
          className="text-[10px] text-slate-400 hover:text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1 font-mono transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          重置进度
        </button>
      </div>

      {/* 任务列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((t) => {
          const isDone = completedTasks[t.id];
          return (
            <div 
              key={t.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                isDone 
                  ? 'border-emerald-200 bg-emerald-50/5 shadow-xs' 
                  : 'border-slate-150 hover:border-slate-300 bg-white shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2.5 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    {getCategoryIcon(t.category)}
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                      {getCategoryLabel(t.category)}
                    </span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    t.difficulty === '入门' ? 'bg-emerald-50 text-emerald-600' :
                    t.difficulty === '进阶' ? 'bg-sky-50 text-sky-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {t.difficulty}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <button 
                    onClick={() => handleToggleTask(t.id)}
                    className="shrink-0 mt-0.5 text-slate-300 hover:text-emerald-500 transition-all"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-scaleIn" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold transition-all ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                      {t.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 达标底线与小贴士 */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[9px] text-slate-550 border-b border-slate-100 pb-1.5 font-sans">
                  <span className="font-semibold text-slate-500">🏆 极值达成度指标:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded shrink-0">{t.targetMetric}</span>
                </div>
                <div className="text-[9px] leading-normal text-slate-400 font-mono flex gap-1 items-start">
                  <Info className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t.tip}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 补充：学术探究日志框 */}
      <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/15 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
          <Star className="w-4 h-4 text-emerald-400 animate-pulse" />
          拓展科学素养：撰写您的变分学日志 (Scientific Research Log)
        </h3>
        <p className="text-[10px] text-slate-400">
          通过自主变量演化探索，总结在极小时间、极小光程、最小作用量三大物理泛函中您观察到的共同和谐之美。在脑海中体悟数学在力学、声、光及现代无人自适应控制中的完美自恰。
        </p>
        <div className="text-[9px] text-slate-400 italic font-mono flex justify-between">
          <span>“造物主创造宇宙时总是选择最不浪费、最简单、最和谐的方式行进。 —— 莱昂哈德·欧拉”</span>
          <span>VARIATIONAL COHERENCY</span>
        </div>
      </div>

    </div>
  );
}
