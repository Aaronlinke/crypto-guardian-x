import { TerminalHeader } from "@/components/TerminalHeader";
import { HeroSection } from "@/components/HeroSection";
import { ThreatPredictionPanel } from "@/components/ThreatPredictionPanel";
import { BlockchainScanner } from "@/components/BlockchainScanner";
import { ProtectionStats } from "@/components/ProtectionStats";
import { SystemConsole } from "@/components/SystemConsole";
import { VulnerableWalletsList } from "@/components/VulnerableWalletsList";
import { NetworkVisualization } from "@/components/NetworkVisualization";
import { AddressLookup } from "@/components/AddressLookup";

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

        {/* Address Lookup - Full Width */}
        <div className="mb-6">
          <AddressLookup />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            <ThreatPredictionPanel />
            <ProtectionStats />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-1 space-y-4">
            <BlockchainScanner />
            <SystemConsole />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-4">
            <NetworkVisualization />
            <VulnerableWalletsList />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-4 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <span>© 2024 CryptoGuardian X</span>
              <span className="text-border">|</span>
              <span>Predictive Immune System v2.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                All Systems Operational
              </span>
              <span>Uptime: 99.97%</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
