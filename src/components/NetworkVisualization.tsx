import { Globe, Server, Cpu, Network } from "lucide-react";
import { useEffect, useState } from "react";

interface Node {
  id: string;
  region: string;
  type: "validator" | "analyzer" | "sentinel" | "guardian";
  status: "online" | "syncing" | "offline";
  connections: number;
}

const nodes: Node[] = [
  { id: "EU-C1", region: "EU-CENTRAL", type: "validator", status: "online", connections: 847 },
  { id: "US-E1", region: "US-EAST", type: "analyzer", status: "online", connections: 1203 },
  { id: "AP-S1", region: "AP-SOUTHEAST", type: "sentinel", status: "syncing", connections: 654 },
  { id: "SA-E1", region: "SA-EAST", type: "guardian", status: "online", connections: 432 },
  { id: "EU-W1", region: "EU-WEST", type: "validator", status: "online", connections: 789 },
  { id: "US-W1", region: "US-WEST", type: "analyzer", status: "online", connections: 956 },
];

export const NetworkVisualization = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [totalConnections, setTotalConnections] = useState(0);

  useEffect(() => {
    setTotalConnections(nodes.reduce((acc, n) => acc + n.connections, 0));
    
    // Simulate node activity
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nodes.length);
      setActiveNode(nodes[randomIndex].id);
      
      setTimeout(() => setActiveNode(null), 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "validator": return <Server className="w-4 h-4" />;
      case "analyzer": return <Cpu className="w-4 h-4" />;
      case "sentinel": return <Globe className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-primary bg-primary/20";
      case "syncing": return "text-warning bg-warning/20 animate-pulse";
      default: return "text-destructive bg-destructive/20";
    }
  };

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-secondary animate-rotate-slow" />
          <h2 className="font-display text-sm font-semibold tracking-wider">
            🕸️ DECENTRALIZED IMMUNE NETWORK
          </h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {totalConnections.toLocaleString()} active connections
        </div>
      </div>

      {/* Network Visualization */}
      <div className="relative h-32 mb-4 bg-background/50 border border-border rounded overflow-hidden">
        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Connecting lines animation */}
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={`${10 + i * 15}%`}
              y1="50%"
              x2={`${25 + i * 15}%`}
              y2={`${30 + (i % 2) * 40}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>

        {/* Central hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center pulse-green">
            <Network className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Orbiting nodes */}
        {nodes.slice(0, 4).map((node, index) => {
          const angle = (index * 90) * (Math.PI / 180);
          const radius = 50;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <div
              key={node.id}
              className={`absolute w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                activeNode === node.id 
                  ? "border-primary bg-primary/30 scale-125" 
                  : "border-border bg-muted/50"
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className={`text-xs ${activeNode === node.id ? "text-primary" : "text-muted-foreground"}`}>
                {getNodeIcon(node.type)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node List */}
      <div className="grid grid-cols-2 gap-2">
        {nodes.map((node) => (
          <div 
            key={node.id}
            className={`p-2 rounded border border-border bg-muted/30 text-xs transition-all ${
              activeNode === node.id ? "border-primary/50 bg-primary/10" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                {getNodeIcon(node.type)}
                <span className="font-bold text-foreground">{node.id}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusColor(node.status)}`}>
                {node.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{node.region}</span>
              <span>{node.connections} conn</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
