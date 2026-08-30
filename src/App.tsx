import React, { useState, useMemo } from "react";
import { ModuleTab, SandboxConfig, CaseStudy } from "./types";
import { Navbar } from "./components/Navbar";
import { MathModelingModule } from "./components/MathModelingModule";
import { RaceSandboxModule } from "./components/RaceSandboxModule";
import { CycloidRollingModule } from "./components/CycloidRollingModule";
import { TautochroneModule } from "./components/TautochroneModule";
import { ClassicCasesModule } from "./components/ClassicCasesModule";
import { CodeEngineModule } from "./components/CodeEngineModule";
import { KnowledgeGuideModule } from "./components/KnowledgeGuideModule";
import { ReportExportModule } from "./components/ReportExportModule";
import { AiAssistantModule } from "./components/AiAssistantModule";
import { buildComparativeCurves } from "./utils/physics";

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>("sandbox");
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

  // Shared Sandbox Parameters
  const [config, setConfig] = useState<SandboxConfig>({
    startX: 0,
    startY: 0,
    endX: 10,
    endY: 8,
    gravity: 9.8,
    friction: 0.0,
    airDrag: 0.0,
    dragModel: "none",
    timeScale: 1.0,
    ballRadius: 0.3,
    showGrid: true,
    showTrails: true,
    showVectors: false,
    showEnergy: false,
  });

  // Calculate curves data
  const curvesData = useMemo(() => {
    return buildComparativeCurves(
      config.endX,
      config.endY,
      config.gravity,
      config.friction,
      config.airDrag,
      config.dragModel
    );
  }, [config.endX, config.endY, config.gravity, config.friction, config.airDrag, config.dragModel]);

  const handleOpenAiWithQuestion = (question: string) => {
    setAiPrompt(question);
    setIsAiOpen(true);
  };

  const handleLoadCaseToSandbox = (caseItem: CaseStudy) => {
    setConfig((prev) => ({
      ...prev,
      startX: caseItem.parameters.startX,
      startY: caseItem.parameters.startY,
      endX: caseItem.parameters.endX,
      endY: caseItem.parameters.endY,
      gravity: caseItem.parameters.gravity,
      friction: caseItem.parameters.friction,
      airDrag: 0.0,
      dragModel: "none",
    }));
    setActiveTab("sandbox");
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#2C3E50] antialiased font-sans flex flex-col justify-between">
      {/* Top Fixed / Sticky Navigation */}
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAi={() => {
            setAiPrompt(undefined);
            setIsAiOpen(true);
          }}
          onResetAll={() => {
            setConfig({
              startX: 0,
              startY: 0,
              endX: 10,
              endY: 8,
              gravity: 9.8,
              friction: 0.0,
              airDrag: 0.0,
              dragModel: "none",
              timeScale: 1.0,
              ballRadius: 0.3,
              showGrid: true,
              showTrails: true,
              showVectors: false,
              showEnergy: false,
            });
          }}
        />

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "modeling" && (
            <MathModelingModule onNavigateToSandbox={() => setActiveTab("sandbox")} />
          )}

          {activeTab === "sandbox" && (
            <RaceSandboxModule
              config={config}
              setConfig={setConfig}
              onOpenAiWithContext={(curves) => {
                setAiPrompt("🔬 请对当前沙盒实验的各轨道下滑耗时与物理数据进行变分物理深度诊断。");
                setIsAiOpen(true);
              }}
            />
          )}

          {activeTab === "rolling" && <CycloidRollingModule />}

          {activeTab === "tautochrone" && <TautochroneModule />}

          {activeTab === "cases" && (
            <ClassicCasesModule onLoadCaseToSandbox={handleLoadCaseToSandbox} />
          )}

          {activeTab === "code" && <CodeEngineModule />}

          {activeTab === "knowledge" && <KnowledgeGuideModule />}

          {activeTab === "report" && (
            <ReportExportModule config={config} curves={curvesData} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#E0E4E8] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#2C3E50]">
              最速降线与变分法原理实验室
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="font-mono text-[11px] text-[#64748B]">Brachistochrone Curve Lab</span>
          </div>

          <div className="flex items-center gap-4 text-[#64748B] font-mono text-[11px]">
            <span>Euler-Lagrange Equation</span>
            <span>•</span>
            <span>Beltrami Identity</span>
            <span>•</span>
            <span>Gemini 3.7 AI</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Drawer */}
      <AiAssistantModule
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        config={config}
        curves={curvesData}
        initialPrompt={aiPrompt}
      />
    </div>
  );
}
