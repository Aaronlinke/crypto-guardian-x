import { Brain, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Threat {
  name: string;
  probability: number;
  impact: string;
  timeframe: string;
}

const threats: Threat[] = [
  { name: "Mobile RNG Weakness", probability: 87, impact: "CRITICAL", timeframe: "Q1 2025" },
  { name: "Cloud Key Leakage", probability: 72, impact: "HIGH", timeframe: "Q2 2025" },
  { name: "MultiSig Implementation Flaw", probability: 65, impact: "MEDIUM", timeframe: "Q3 2025" },
  { name: "Cross-Chain Bridge Exploit", probability: 58, impact: "HIGH", timeframe: "Q2 2025" },
];

export const ThreatPredictionPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % threats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "CRITICAL": return "text-destructive glow-red";
      case "HIGH": return "text-warning glow-amber";
      case "MEDIUM": return "text-secondary glow-cyan";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="terminal-card box-glow-green relative overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent animate-scan" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">
          🔮 QUANTUM THREAT PREDICTOR
        </h2>
        <div className="ml-auto flex items-center gap-1">
          <Zap className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] text-primary">AI ACTIVE</span>
        </div>
      </div>

      {/* Main Threat Display */}
      <div className="mb-4 p-3 bg-background/50 border border-border rounded relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">NEXT PREDICTED THREAT:</span>
          <span className={`text-xs font-bold ${getImpactColor(threats[activeIndex].impact)}`}>
            {threats[activeIndex].impact}
          </span>
        </div>
        <h3 className="font-display text-lg glow-green mb-2">
          {threats[activeIndex].name}
        </h3>
        
        {/* Probability Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Probability</span>
            <span className="text-primary">{threats[activeIndex].probability}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
              style={{ width: `${threats[activeIndex].probability}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Predicted timeframe: <span className="text-secondary">{threats[activeIndex].timeframe}</span>
        </div>
      </div>

      {/* Threat List */}
      <div className="space-y-2 relative z-10">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          EMERGING THREATS
        </div>
        {threats.map((threat, index) => (
          <div 
            key={threat.name}
            className={`flex items-center justify-between p-2 rounded text-xs transition-all duration-300 ${
              index === activeIndex 
                ? "bg-primary/10 border border-primary/30" 
                : "bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-3 h-3 ${getImpactColor(threat.impact)}`} />
              <span className={index === activeIndex ? "text-primary" : "text-muted-foreground"}>
                {threat.name}
              </span>
            </div>
            <span className="text-primary font-mono">{threat.probability}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
