import { Shield, Activity, Wifi } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { useEffect, useState } from "react";

export const TerminalHeader = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary glow-green" />
              <div className="absolute inset-0 animate-pulse-glow">
                <Shield className="w-8 h-8 text-primary opacity-50" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider glow-green">
                CRYPTOGUARDIAN X
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest">
                PREDICTIVE IMMUNE SYSTEM v2.0
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-6">
            <StatusIndicator status="active" label="Neural Engine" />
            <StatusIndicator status="active" label="Blockchain Monitor" />
            <StatusIndicator status="active" label="Rescue Protocol" />
          </div>

          {/* System Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="hidden sm:inline">LIVE</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wifi className="w-4 h-4 text-secondary" />
              <span className="hidden sm:inline">CONNECTED</span>
            </div>
            <div className="font-mono text-xs text-primary glow-green">
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
