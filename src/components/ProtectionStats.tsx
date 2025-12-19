import { Shield, Users, Lock, TrendingUp, Activity, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  trend?: number;
}

export const ProtectionStats = () => {
  const [stats, setStats] = useState<Stat[]>([
    { icon: <Shield className="w-5 h-5" />, label: "Protected Wallets", value: 12847, color: "text-primary", trend: 12 },
    { icon: <Users className="w-5 h-5" />, label: "Active Guardians", value: 347, color: "text-secondary", trend: 5 },
    { icon: <Lock className="w-5 h-5" />, label: "Threats Blocked", value: 892, color: "text-warning", trend: 23 },
    { icon: <Zap className="w-5 h-5" />, label: "Rescue Operations", value: 156, color: "text-destructive", trend: 8 },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.value + Math.floor(Math.random() * 3),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-card">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">
          🛡️ PROTECTION STATISTICS
        </h2>
        <div className="ml-auto">
          <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded">
            LIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="p-3 bg-muted/30 rounded border border-border hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className={`font-display text-2xl ${stat.color}`}>
                {stat.value.toLocaleString()}
                {stat.suffix}
              </span>
              {stat.trend && (
                <div className="flex items-center gap-0.5 text-primary text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +{stat.trend}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Protection Gauge */}
      <div className="mt-4 p-3 bg-background/50 border border-border rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">GLOBAL PROTECTION LEVEL</span>
          <span className="text-xs text-primary font-bold">94.7%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden relative">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-data-stream"
            style={{ width: "94.7%" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Last 24h: +2.3%</span>
          <span>Target: 99.9%</span>
        </div>
      </div>
    </div>
  );
};
