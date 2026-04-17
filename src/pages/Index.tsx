import { lazy, Suspense } from "react";
import { TerminalHeader } from "@/components/TerminalHeader";
import { HeroSection } from "@/components/HeroSection";
import { AddressLookup } from "@/components/AddressLookup";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded heavy visualization components
const MathFormulaPanel = lazy(() => import("@/components/MathFormulaPanel").then(m => ({ default: m.MathFormulaPanel })));
const SATSolverVisualizer = lazy(() => import("@/components/SATSolverVisualizer").then(m => ({ default: m.SATSolverVisualizer })));
const ECDSACalculator = lazy(() => import("@/components/ECDSACalculator").then(m => ({ default: m.ECDSACalculator })));
const DynamicSystemVisualizer = lazy(() => import("@/components/DynamicSystemVisualizer").then(m => ({ default: m.DynamicSystemVisualizer })));
const UlamSpiralVisualizer = lazy(() => import("@/components/UlamSpiralVisualizer").then(m => ({ default: m.UlamSpiralVisualizer })));
const SystemConsole = lazy(() => import("@/components/SystemConsole").then(m => ({ default: m.SystemConsole })));
const SHA256Visualizer = lazy(() => import("@/components/SHA256Visualizer").then(m => ({ default: m.SHA256Visualizer })));
const BackwardOperator = lazy(() => import("@/components/BackwardOperator").then(m => ({ default: m.BackwardOperator })));
const OmnigenesisPipeline = lazy(() => import("@/components/OmnigenesisPipeline").then(m => ({ default: m.OmnigenesisPipeline })));
const QuantumEntropyVisualizer = lazy(() => import("@/components/QuantumEntropyVisualizer").then(m => ({ default: m.QuantumEntropyVisualizer })));
const ResearchAIChat = lazy(() => import("@/components/ResearchAIChat").then(m => ({ default: m.ResearchAIChat })));
const LoomBusTelemetry = lazy(() => import("@/components/LoomBusTelemetry").then(m => ({ default: m.LoomBusTelemetry })));
const SRILCalculator = lazy(() => import("@/components/SRILCalculator").then(m => ({ default: m.SRILCalculator })));
const ChronoplastVisualizer = lazy(() => import("@/components/ChronoplastVisualizer").then(m => ({ default: m.ChronoplastVisualizer })));
const BitcoinFixpointSync = lazy(() => import("@/components/BitcoinFixpointSync").then(m => ({ default: m.BitcoinFixpointSync })));
const EllipticCurveVisualizer = lazy(() => import("@/components/EllipticCurveVisualizer").then(m => ({ default: m.EllipticCurveVisualizer })));
const LLLLatticeVisualizer = lazy(() => import("@/components/LLLLatticeVisualizer").then(m => ({ default: m.LLLLatticeVisualizer })));
const EntropyComparator = lazy(() => import("@/components/EntropyComparator").then(m => ({ default: m.EntropyComparator })));
const Base58CheckVisualizer = lazy(() => import("@/components/Base58CheckVisualizer").then(m => ({ default: m.Base58CheckVisualizer })));
const HashCollisionDemo = lazy(() => import("@/components/HashCollisionDemo").then(m => ({ default: m.HashCollisionDemo })));
const InversionEngine = lazy(() => import("@/components/InversionEngine").then(m => ({ default: m.InversionEngine })));
const CryptoInversionPipeline = lazy(() => import("@/components/CryptoInversionPipeline").then(m => ({ default: m.CryptoInversionPipeline })));

const PanelFallback = () => (
  <Skeleton className="w-full h-64 rounded-lg bg-muted/30" />
);

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
          <Suspense fallback={<PanelFallback />}><ResearchAIChat /></Suspense>
        </div>

        {/* OMNIGENESIS Pipeline - Full Width */}
        <div className="mb-6">
          <Suspense fallback={<PanelFallback />}><OmnigenesisPipeline /></Suspense>
        </div>

        {/* LoomBus Telemetry & SRIL Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Suspense fallback={<PanelFallback />}><LoomBusTelemetry /></Suspense>
          <Suspense fallback={<PanelFallback />}><SRILCalculator /></Suspense>
        </div>

        {/* Crypto Inversion Pipeline - Full Width */}
        <div className="mb-6">
          <Suspense fallback={<PanelFallback />}><CryptoInversionPipeline /></Suspense>
        </div>

        {/* Inversions-Engine - Full Width */}
        <div className="mb-6">
          <Suspense fallback={<PanelFallback />}><InversionEngine /></Suspense>
        </div>

        {/* Chronoplast & Bitcoin Fixpunkt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Suspense fallback={<PanelFallback />}><ChronoplastVisualizer /></Suspense>
          <Suspense fallback={<PanelFallback />}><BitcoinFixpointSync /></Suspense>
        </div>

        {/* Base58Check & Hash Collision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Suspense fallback={<PanelFallback />}><Base58CheckVisualizer /></Suspense>
          <Suspense fallback={<PanelFallback />}><HashCollisionDemo /></Suspense>
        </div>

        {/* Wissenschaftliche Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <Suspense fallback={<PanelFallback />}><EllipticCurveVisualizer /></Suspense>
            <Suspense fallback={<PanelFallback />}><MathFormulaPanel /></Suspense>
            <Suspense fallback={<PanelFallback />}><SHA256Visualizer /></Suspense>
          </div>

          {/* Center Column */}
          <div className="space-y-4">
            <Suspense fallback={<PanelFallback />}><LLLLatticeVisualizer /></Suspense>
            <Suspense fallback={<PanelFallback />}><SATSolverVisualizer /></Suspense>
            <Suspense fallback={<PanelFallback />}><ECDSACalculator /></Suspense>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Suspense fallback={<PanelFallback />}><EntropyComparator /></Suspense>
            <Suspense fallback={<PanelFallback />}><QuantumEntropyVisualizer /></Suspense>
            <Suspense fallback={<PanelFallback />}><BackwardOperator /></Suspense>
          </div>
        </div>
        {/* Additional Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Suspense fallback={<PanelFallback />}><DynamicSystemVisualizer /></Suspense>
          <Suspense fallback={<PanelFallback />}><UlamSpiralVisualizer /></Suspense>
          <Suspense fallback={<PanelFallback />}><SystemConsole /></Suspense>
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
