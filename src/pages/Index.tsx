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
        <div className="mb-6">
          <AddressLookup />
        </div>

        {/* Wissenschaftliche Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <MathFormulaPanel />
            <SHA256Visualizer />
            <SystemConsole />
          </div>

          {/* Center Column */}
          <div className="space-y-4">
            <SATSolverVisualizer />
            <ECDSACalculator />
            <BackwardOperator />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <DynamicSystemVisualizer />
            <UlamSpiralVisualizer />
          </div>
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
