import { TerminalHeader } from "@/components/TerminalHeader";
import { HeroSection } from "@/components/HeroSection";
import { AddressLookup } from "@/components/AddressLookup";
import { MathFormulaPanel } from "@/components/MathFormulaPanel";
import { SATSolverVisualizer } from "@/components/SATSolverVisualizer";
import { ECDSACalculator } from "@/components/ECDSACalculator";
import { DynamicSystemVisualizer } from "@/components/DynamicSystemVisualizer";
import { UlamSpiralVisualizer } from "@/components/UlamSpiralVisualizer";
import { SystemConsole } from "@/components/SystemConsole";
import { SHA256Visualizer } from "@/components/SHA256Visualizer";
import { BackwardOperator } from "@/components/BackwardOperator";
import { OmnigenesisPipeline } from "@/components/OmnigenesisPipeline";
import { QuantumEntropyVisualizer } from "@/components/QuantumEntropyVisualizer";
import { ResearchAIChat } from "@/components/ResearchAIChat";
import { LoomBusTelemetry } from "@/components/LoomBusTelemetry";
import { SRILCalculator } from "@/components/SRILCalculator";
import { ChronoplastVisualizer } from "@/components/ChronoplastVisualizer";
import { BitcoinFixpointSync } from "@/components/BitcoinFixpointSync";
import { EllipticCurveVisualizer } from "@/components/EllipticCurveVisualizer";
import { LLLLatticeVisualizer } from "@/components/LLLLatticeVisualizer";
import { EntropyComparator } from "@/components/EntropyComparator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-20" />
      
      {/* Header */}
      <TerminalHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <HeroSection />

        {/* Bitcoin Address Lookup - Echte API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <AddressLookup />
          <ResearchAIChat />
        </div>

        {/* OMNIGENESIS Pipeline - Full Width */}
        <div className="mb-6">
          <OmnigenesisPipeline />
        </div>

        {/* LoomBus Telemetry & SRIL Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <LoomBusTelemetry />
          <SRILCalculator />
        </div>

        {/* Chronoplast & Bitcoin Fixpunkt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChronoplastVisualizer />
          <BitcoinFixpointSync />
        </div>

        {/* Wissenschaftliche Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <EllipticCurveVisualizer />
            <MathFormulaPanel />
            <SHA256Visualizer />
          </div>

          {/* Center Column */}
          <div className="space-y-4">
            <LLLLatticeVisualizer />
            <SATSolverVisualizer />
            <ECDSACalculator />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <EntropyComparator />
            <QuantumEntropyVisualizer />
            <BackwardOperator />
          </div>
        </div>

        {/* Additional Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <DynamicSystemVisualizer />
          <UlamSpiralVisualizer />
          <SystemConsole />
        </div>

        {/* Footer mit Credits */}
        <footer className="border-t border-border pt-4 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <span className="font-semibold text-primary">Wissenschaftliches Forschungsprojekt</span>
              <span className="text-border">|</span>
              <span>Kryptographie · SAT-Logik · Dynamische Systeme · OMNIGENESIS</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Alle Berechnungen lokal · Keine Zensur
              </span>
            </div>
          </div>
          <div className="text-center mt-3 text-[10px] text-muted-foreground">
            Gemeinsame wissenschaftliche Arbeit · Build {new Date().toISOString().split('T')[0]}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
