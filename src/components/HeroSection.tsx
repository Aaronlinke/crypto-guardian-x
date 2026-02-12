import { Shield, Zap, Brain, Lock } from "lucide-react";

export const HeroSection = () => {
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
                <span className="text-[10px] text-muted-foreground">DOKUMENTIERTE</span>
                <span className="text-xs text-primary font-bold">20 ANGRIFFE</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Zap className="w-5 h-5 text-secondary mb-1" />
                <span className="text-[10px] text-muted-foreground">ANALYSE</span>
                <span className="text-xs text-secondary font-bold">13 MODULE</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Brain className="w-5 h-5 text-warning mb-1" />
                <span className="text-[10px] text-muted-foreground">NEXUS</span>
                <span className="text-xs text-warning font-bold">v3.0 AKTIV</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded">
                <Lock className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] text-muted-foreground">FORSCHUNG</span>
                <span className="text-xs text-primary font-bold">OPEN SOURCE</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Build:</span>
                <span className="text-primary font-mono">{new Date().toISOString().split('T')[0]}</span>
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
