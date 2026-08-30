import React from "react";
import { ModuleTab } from "../types";
import {
  Compass,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  Code2,
  BookOpen,
  FileDown,
  BotMessageSquare,
  Activity,
} from "lucide-react";

interface NavbarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  onOpenAi: () => void;
  onResetAll: () => void;
}

const TABS: { id: ModuleTab; label: string; number: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "modeling", number: "01", label: "建模基础", icon: Compass },
  { id: "sandbox", number: "02", label: "2D赛跑沙盒", icon: Play },
  { id: "rolling", number: "03", label: "旋轮线动画", icon: RotateCcw },
  { id: "tautochrone", number: "04", label: "参数与等时", icon: Sliders },
  { id: "cases", number: "05", label: "六大案例", icon: Layers },
  { id: "code", number: "06", label: "代码引擎", icon: Code2 },
  { id: "knowledge", number: "07", label: "历史与理论", icon: BookOpen },
  { id: "report", number: "08", label: "报告导出", icon: FileDown },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAi,
  onResetAll,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E0E4E8] bg-white/95 backdrop-blur-md">
      {/* Top Brand Bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34495E] text-white shadow-2xs">
            <Activity className="h-5 w-5 text-slate-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-bold tracking-tight text-[#2C3E50] sm:text-lg">
                最速降线与变分法原理实验室
              </span>
              <span className="hidden rounded-full bg-[#EEF2F5] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#34495E] md:inline-block border border-[#E0E4E8]">
                Brachistochrone Lab
              </span>
            </div>
            <p className="hidden text-xs text-[#64748B] sm:block">
              Euler-Lagrange · 旋轮线滚切 · 等时降落 · 物理赛跑沙盒
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-nav-ai"
            onClick={onOpenAi}
            className="flex items-center gap-1.5 rounded-lg border border-[#34495E]/20 bg-[#F0F4F8] px-3.5 py-1.5 text-xs font-semibold text-[#2C3E50] shadow-2xs transition hover:bg-[#E2E8F0]"
          >
            <BotMessageSquare className="h-4 w-4 text-[#34495E]" />
            <span>AI 物理导师</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            id="btn-nav-reset"
            onClick={onResetAll}
            title="重置实验室参数"
            className="flex items-center gap-1 rounded-lg border border-[#E0E4E8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#64748B] shadow-2xs transition hover:bg-[#F8FAFC] hover:text-[#2C3E50]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">重置</span>
          </button>
        </div>
      </div>

      {/* Sliced Segmented Tab Navigation Bar */}
      <div className="border-t border-[#E0E4E8] bg-[#F8FAFC] px-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#2C3E50] border border-[#E0E4E8] border-b-2 border-b-[#34495E] font-semibold shadow-2xs"
                    : "text-[#64748B] hover:bg-white/80 hover:text-[#2C3E50]"
                }`}
              >
                <span
                  className={`font-mono text-[10px] ${
                    isActive ? "text-[#34495E] font-bold" : "text-[#94A3B8] group-hover:text-[#64748B]"
                  }`}
                >
                  {tab.number}
                </span>
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-[#34495E]" : "text-[#94A3B8] group-hover:text-[#64748B]"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
