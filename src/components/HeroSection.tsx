import { Shield, Zap, Brain, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export const HeroSection = () => {
  const [cycleCount, setCycleCount] = useState(42847);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleCount(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden py-8 mb-6">
      {/* Background effects */}
      <div className="absolute inset-0 matrix-bg" />
      <div className="absolute inset-0 scanlines opacity-30" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* ASCII Art Header */}
        <pre className="text-primary text-[8px] sm:text-xs font-mono leading-tight mb-4 glow-green text-center overflow-hidden">
{`╔══════════════════════════════════════════════════════════════════════════╗
║   ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗  ██████╗ ██╗   ██╗   ║
║  ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗██╔════╝ ██║   ██║   ║
║  ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║██║  ███╗██║   ██║   ║
║  ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║██║   ██║██║   ██║   ║
║  ╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝╚██████╔╝╚██████╔╝   ║
║   ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝    ║
║                    ██╗  ██╗                                               ║
║                    ╚═╝  ╚═╝    GUARDIAN X                                 ║
╚══════════════════════════════════════════════════════════════════════════╝`}
        </pre>

        {/* System Status Box */}
        <div className="max-w-2xl mx-auto">
          <div className="terminal-card box-glow-green">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">SYSTEM STATUS:</span>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded animate-pulse">
                FULLY OPERATIONAL
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Shield className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] text-muted-foreground">QUANTUM THREAT</span>
                <span className="text-xs text-primary font-bold">PREDICTOR ✓</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Zap className="w-5 h-5 text-secondary mb-1" />
                <span className="text-[10px] text-muted-foreground">BLOCKCHAIN</span>
                <span className="text-xs text-secondary font-bold">MONITOR ✓</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Brain className="w-5 h-5 text-warning mb-1" />
                <span className="text-[10px] text-muted-foreground">RESCUE</span>
                <span className="text-xs text-warning font-bold">COORDINATOR ✓</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Lock className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] text-muted-foreground">IMMUNE</span>
                <span className="text-xs text-primary font-bold">NETWORK ✓</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Protection Cycles:</span>
                <span className="text-primary font-mono">{cycleCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Mission:</span>
                <span className="text-secondary">Proactive Crypto Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-muted-foreground text-xs mt-4 tracking-wider">
          PREDICTIVE IMMUNE SYSTEM FOR BLOCKCHAIN SECURITY
        </p>
      </div>
    </div>
  );
};
