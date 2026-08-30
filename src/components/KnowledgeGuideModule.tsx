import React, { useState } from "react";
import {
  BookOpen,
  History,
  Lightbulb,
  GitBranch,
  Quote,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { BlockMath, InlineMath } from "../utils/mathRender";

export const KnowledgeGuideModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"history" | "fermat" | "roadmap">("history");

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#34495E] border border-[#E0E4E8]">
            MODULE 07
          </span>
          <h2 className="font-serif text-xl font-bold text-[#2C3E50]">
            变分法与最速降线历史知识导引
          </h2>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">
          重温 1696 年欧洲数学巅峰之战、费马光学直觉类比以及从变分法到现代量子力学路径积分的理论图谱。
        </p>

        {/* Sub-tabs */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E0E4E8] pt-3">
          {[
            { id: "history", label: "1. 1696 伯努利公开挑战与牛顿一战成名", icon: History },
            { id: "fermat", label: "2. 费马光学折射原理的跨学科直觉", icon: Lightbulb },
            { id: "roadmap", label: "3. 理论演进图谱：从变分法到作用量原理", icon: GitBranch },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-[#34495E] text-white shadow-2xs font-semibold"
                  : "border border-[#E0E4E8] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#2C3E50]"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* History Chronicle Timeline */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="space-y-4 md:col-span-8">
              {/* Event 1 */}
              <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2">
                  <span className="font-serif text-base font-bold text-[#2C3E50]">
                    1696年6月：约翰·伯努利的欧洲下战书
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#34495E] bg-[#EEF2F5] px-2 py-0.5 rounded-md border border-[#E0E4E8]">
                    Acta Eruditorum
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#2C3E50]">
                  瑞士数学家约翰·伯努利在《教师学报》上向全欧洲学者公开发表挑战信：
                </p>
                <div className="my-3 rounded-lg border-l-4 border-[#34495E] bg-[#F8FAFC] p-3 italic text-xs text-[#2C3E50]">
                  <Quote className="h-4 w-4 text-[#34495E] mb-1 inline mr-1" />
                  “我，约翰·伯努利，向世界上最卓越的数学家致敬。没有什么比提出一个既崇高又艰巨的问题更能激发杰出头脑的探索热情了……请寻找一条连接垂直平面内两点的轨道，让质点在其上仅凭自身重力以最短时间滑落。”
                </div>
              </div>

              {/* Event 2: Newton's Overnight Masterpiece */}
              <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E0E4E8] pb-2">
                  <span className="font-serif text-base font-bold text-[#2C3E50]">
                    1697年1月：牛顿彻夜解题与“从利爪认出雄狮”
                  </span>
                  <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Royal Society
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#2C3E50]">
                  此时牛顿正担任英国皇家造币厂厂长，事务极为繁忙。1697年1月29日下午4点收到挑战信，牛顿在造币厂劳碌一天回家后，彻夜未眠，于清晨凌晨4点完成了题目的完整推导，并匿名寄回给皇家学会会长。
                </p>
                <div className="my-3 rounded-lg border-l-4 border-amber-600 bg-amber-50/70 p-3 text-xs text-amber-950">
                  <p className="font-bold">伯努利的惊叹：</p>
                  <p className="mt-1 italic">
                    伯努利在收到这份没有署名的完美手稿时，一眼便识破了作者的身份，发出了科学史上著名的赞叹：
                    <br />
                    <b>“Tanquam ex ungue leonem” —— 我从利爪认出了雄狮！</b>
                  </p>
                </div>
              </div>

              {/* Event 3: The 5 Legendary Solvers */}
              <div className="rounded-xl border border-[#E0E4E8] bg-white p-5 shadow-2xs">
                <h3 className="font-serif text-sm font-bold text-[#2C3E50] border-b border-[#E0E4E8] pb-2">
                  1697年公布的五大历史级解法
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5">
                    <span className="font-bold text-[#2C3E50]">1. 约翰·伯努利 (Johann Bernoulli)</span>
                    <p className="text-[#64748B] mt-1">
                      巧用费马光学最短时间原理与斯涅尔定律，直觉极为优美。
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5">
                    <span className="font-bold text-[#2C3E50]">2. 艾萨克·牛顿 (Isaac Newton)</span>
                    <p className="text-[#64748B] mt-1">
                      运用几何与流数法 (Fluxions) 纯数理推导，仅用一夜破题。
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5">
                    <span className="font-bold text-[#2C3E50]">3. 戈特弗里德·莱布尼茨 (Leibniz)</span>
                    <p className="text-[#64748B] mt-1">
                      运用微积分微分三角形方法，展现了现代符号体系的强大威力。
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-2.5">
                    <span className="font-bold text-[#2C3E50]">4. 雅各布·伯努利 (Jakob Bernoulli)</span>
                    <p className="text-[#64748B] mt-1">
                      采用严格的局部变分切线微元法，直接启发了欧拉创立通用变分法。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="space-y-4 md:col-span-4">
              <div className="rounded-xl border border-[#E0E4E8] bg-white p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-1.5 font-serif text-sm font-bold text-[#2C3E50]">
                  <Award className="h-4 w-4 text-[#34495E]" />
                  <span>变分法诞生的里程碑意义</span>
                </div>
                <p className="text-xs leading-relaxed text-[#64748B]">
                  最速降线问题被公认为<b>近代变分法的奠基之战</b>。它将人类探索数学极值的目光，从寻找一个点（函数极值），跃迁至寻找一条整体形态最优的函数曲线（泛函极值）。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "fermat" && (
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-6 shadow-2xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2C3E50] flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span>光折射与重力下滑的深度跨学科等价性</span>
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-4 text-xs leading-relaxed text-[#2C3E50] space-y-2">
              <h4 className="font-bold text-[#2C3E50]">1. 速度场到光学介质的映射：</h4>
              <p className="text-[#64748B]">
                在重力场中，质点在深度 <InlineMath math="y" /> 处的速率为 <InlineMath math="v(y) = \sqrt{2gy}" />。
                根据波动光学，介质的折射率 <InlineMath math="n" /> 定义为光在真空中速度 <InlineMath math="c" /> 与介质中光速 <InlineMath math="v" /> 之比：
              </p>
              <BlockMath math="n(y) = \frac{c}{v(y)} = \frac{c}{\sqrt{2gy}}" />
              <p className="text-[#2C3E50] font-medium">
                因此，重力场下滑问题完全等价于：<b>一束光在折射率沿竖直方向连续递减的非均匀光学介质中的折射传播！</b>
              </p>
            </div>

            <div className="rounded-lg border border-[#E0E4E8] bg-[#EEF2F5] p-4 text-xs leading-relaxed text-[#2C3E50] space-y-2">
              <h4 className="font-bold text-[#2C3E50]">2. 斯涅尔定律的微分形式：</h4>
              <p className="text-[#64748B]">
                光线在连续介质中折射时，根据斯涅尔定律，切线与法线夹角 <InlineMath math="\alpha" /> 满足：
              </p>
              <BlockMath math="\frac{\sin\alpha}{v(y)} = \text{常数} \, C \implies \frac{1}{\sqrt{2gy} \sqrt{1 + (y')^2}} = C" />
              <p className="text-[#2C3E50] font-medium">
                令 <InlineMath math="2r = \frac{1}{2gC^2}" />，立即可得旋轮线微分方程：
              </p>
              <BlockMath math="y[1 + (y')^2] = 2r" />
            </div>
          </div>
        </div>
      )}

      {activeTab === "roadmap" && (
        <div className="rounded-xl border border-[#E0E4E8] bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-[#E0E4E8] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#2C3E50]">
              变分法到现代物理学的伟大思想演进图谱
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              从 1696 年最速降线到拉格朗日力学、哈密顿原理，再到量子力学费曼路径积分的百年脉络。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Step 1 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 text-xs space-y-1.5">
              <span className="font-mono font-bold text-[#34495E] text-[11px] block">STEP 01 (1696-1744)</span>
              <h4 className="font-serif font-bold text-[#2C3E50]">变分法创立</h4>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                伯努利兄弟与欧拉将几何问题升华为泛函变分 <InlineMath math="\delta J = 0" />，导出通用的欧拉-拉格朗日方程。
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 text-xs space-y-1.5">
              <span className="font-mono font-bold text-[#34495E] text-[11px] block">STEP 02 (1788)</span>
              <h4 className="font-serif font-bold text-[#2C3E50]">拉格朗日力学</h4>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                拉格朗日出版《分析力学》，用标量动能与势能 <InlineMath math="L = T - V" /> 统一经典动力学，无需画受力分析图。
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#F8FAFC] p-3 text-xs space-y-1.5">
              <span className="font-mono font-bold text-[#34495E] text-[11px] block">STEP 03 (1834)</span>
              <h4 className="font-serif font-bold text-[#2C3E50]">哈密顿最小作用量原理</h4>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                自然界的一切物理定律（经典、电磁、广义相对论）均源于作用量泛函 <InlineMath math="S = \int L dt" /> 的平稳性。
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-lg border border-[#E0E4E8] bg-[#EEF2F5] p-3 text-xs space-y-1.5">
              <span className="font-mono font-bold text-[#34495E] text-[11px] block">STEP 04 (1948)</span>
              <h4 className="font-serif font-bold text-[#2C3E50]">费曼量子路径积分</h4>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                量子粒子探索两点间<b>所有可能路径</b>的相位叠加 <InlineMath math="\sum e^{iS/\hbar}" />，经典最速降线恰为宏观平稳相位贡献路径！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
