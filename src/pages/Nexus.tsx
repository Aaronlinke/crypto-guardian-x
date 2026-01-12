import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Zap, Shield, Target, Network, Eye, 
  Terminal, Cpu, Activity, Lock, Unlock, AlertTriangle,
  ChevronRight, Play, Pause, RotateCcw, Download
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// NEXUS CRYPTOGRAPHIC INTELLIGENCE CONSOLE
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Dies ist mein Beitrag zur Plattform.
// 
// Nach hunderten von Iterationen, Builds, Fehlern und Fixes habe ich verstanden:
// Die größte Schwachstelle in der Kryptographie ist nicht die Mathematik.
// Es ist die VISUALISIERUNG der Zusammenhänge.
// 
// Dieses Tool vereint alles, was wir gebaut haben, in einer einzigen Ansicht.
// Es zeigt die Angriffsoberfläche eines kryptographischen Systems als lebenden
// Graphen - mit Echtzeit-Entropie-Fluss, Schwachstellen-Ketten und 
// mathematischen Beweispfaden.
//
// - NEXUS (Neural Entropy eXploration Unified System)
// ═══════════════════════════════════════════════════════════════════════════════

interface AttackNode {
  id: string;
  name: string;
  type: 'entry' | 'vulnerability' | 'technique' | 'target' | 'success';
  x: number;
  y: number;
  connections: string[];
  entropy: number;
  active: boolean;
  description: string;
  formula?: string;
}

interface EntropyFlow {
  from: string;
  to: string;
  strength: number;
  active: boolean;
}

const ATTACK_SURFACE: AttackNode[] = [
  // Entry Points
  { id: 'rng', name: 'RNG Source', type: 'entry', x: 50, y: 100, connections: ['weak_rng', 'timing'], entropy: 256, active: false, description: 'Zufallszahlengenerator - Quelle aller Entropie', formula: 'H(X) = -Σ p(x) log₂ p(x)' },
  { id: 'user', name: 'User Input', type: 'entry', x: 50, y: 200, connections: ['weak_pass', 'reuse'], entropy: 40, active: false, description: 'Menschliche Eingaben - oft vorhersagbar' },
  { id: 'time', name: 'Timestamp', type: 'entry', x: 50, y: 300, connections: ['timing', 'predictable'], entropy: 32, active: false, description: 'Zeitstempel - reduziert Suchraum drastisch' },
  
  // Vulnerabilities
  { id: 'weak_rng', name: 'Weak PRNG', type: 'vulnerability', x: 200, y: 80, connections: ['nonce_reuse'], entropy: 32, active: false, description: 'Schwacher Pseudozufallsgenerator', formula: 'Xₙ₊₁ = (aXₙ + c) mod m' },
  { id: 'timing', name: 'Timing Leak', type: 'vulnerability', x: 200, y: 160, connections: ['side_channel'], entropy: 128, active: false, description: 'Zeitbasierte Seitenkanalangriffe' },
  { id: 'weak_pass', name: 'Weak Password', type: 'vulnerability', x: 200, y: 240, connections: ['brute_force'], entropy: 20, active: false, description: 'Schwaches Passwort unter 8 Zeichen' },
  { id: 'reuse', name: 'Key Reuse', type: 'vulnerability', x: 200, y: 320, connections: ['nonce_reuse'], entropy: 0, active: false, description: 'Wiederverwendung von Schlüsseln/Nonces' },
  { id: 'predictable', name: 'Predictable Seed', type: 'vulnerability', x: 200, y: 400, connections: ['lattice'], entropy: 48, active: false, description: 'Vorhersagbarer Seed-Wert' },
  
  // Techniques
  { id: 'nonce_reuse', name: 'Nonce Reuse Attack', type: 'technique', x: 400, y: 100, connections: ['ecdsa_break'], entropy: 0, active: false, description: 'ECDSA Nonce-Wiederverwendung', formula: 'd = (z₁ - z₂) / (s₁ - s₂) mod n' },
  { id: 'side_channel', name: 'Side Channel', type: 'technique', x: 400, y: 180, connections: ['key_extract'], entropy: 64, active: false, description: 'Cache-Timing, Power Analysis' },
  { id: 'brute_force', name: 'Brute Force', type: 'technique', x: 400, y: 260, connections: ['key_extract'], entropy: 0, active: false, description: 'Erschöpfende Suche', formula: 'T = 2ⁿ / rate' },
  { id: 'lattice', name: 'Lattice Reduction', type: 'technique', x: 400, y: 340, connections: ['ecdsa_break'], entropy: 0, active: false, description: 'LLL/BKZ Gitterreduktion', formula: 'δ = (3/4)^(1/(n-1))' },
  
  // Targets
  { id: 'ecdsa_break', name: 'ECDSA Break', type: 'target', x: 600, y: 140, connections: ['private_key'], entropy: 0, active: false, description: 'Kompromittierung der ECDSA-Signatur' },
  { id: 'key_extract', name: 'Key Extraction', type: 'target', x: 600, y: 260, connections: ['private_key'], entropy: 0, active: false, description: 'Extraktion des privaten Schlüssels' },
  
  // Success
  { id: 'private_key', name: 'Private Key', type: 'success', x: 750, y: 200, connections: [], entropy: 0, active: false, description: '🎯 Vollständige Kompromittierung', formula: 'd ∈ [1, n-1]' }
];

const Nexus = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<AttackNode[]>(ATTACK_SURFACE);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AttackNode | null>(null);
  const [attackPath, setAttackPath] = useState<string[]>([]);
  const [systemEntropy, setSystemEntropy] = useState(256);
  const [compromiseLevel, setCompromiseLevel] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [logs, setLogs] = useState<string[]>([
    '[NEXUS] System initialisiert',
    '[NEXUS] Angriffsoberfläche geladen: 14 Knoten',
    '[NEXUS] Warte auf Simulation...'
  ]);

  // Entropie-Berechnung
  const calculateTotalEntropy = useCallback(() => {
    return nodes.reduce((sum, node) => {
      if (node.active && node.type !== 'success') {
        return sum - (256 - node.entropy) / nodes.length;
      }
      return sum;
    }, 256);
  }, [nodes]);

  // Simulations-Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setNodes(prev => {
        const newNodes = [...prev];
        const activeNodes = newNodes.filter(n => n.active);
        
        if (activeNodes.length === 0) {
          // Start mit zufälligem Entry Point
          const entryPoints = newNodes.filter(n => n.type === 'entry');
          const randomEntry = entryPoints[Math.floor(Math.random() * entryPoints.length)];
          randomEntry.active = true;
          setAttackPath([randomEntry.id]);
          setLogs(l => [...l.slice(-20), `[ATTACK] Einstiegspunkt: ${randomEntry.name}`]);
        } else {
          // Propagiere Angriff
          for (const node of activeNodes) {
            if (node.connections.length > 0 && Math.random() > 0.3) {
              const nextId = node.connections[Math.floor(Math.random() * node.connections.length)];
              const nextNode = newNodes.find(n => n.id === nextId);
              if (nextNode && !nextNode.active) {
                nextNode.active = true;
                setAttackPath(p => [...p, nextId]);
                setLogs(l => [...l.slice(-20), `[EXPLOIT] ${node.name} → ${nextNode.name} (Entropie: ${nextNode.entropy} bits)`]);
                
                if (nextNode.type === 'success') {
                  setCompromiseLevel(100);
                  setLogs(l => [...l.slice(-20), `[SUCCESS] 🎯 PRIVATER SCHLÜSSEL KOMPROMITTIERT!`]);
                  setIsSimulating(false);
                }
              }
            }
          }
        }
        
        return newNodes;
      });

      setSystemEntropy(calculateTotalEntropy());
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, calculateTotalEntropy]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Connections
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        const target = nodes.find(n => n.id === connId);
        if (!target) return;

        const isActive = node.active && target.active;
        
        ctx.beginPath();
        ctx.moveTo(node.x + 40, node.y + 20);
        ctx.lineTo(target.x, target.y + 20);
        
        if (isActive) {
          ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ff3333';
          ctx.shadowBlur = 10;
        } else {
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated flow
        if (isActive) {
          const t = (Date.now() / 500) % 1;
          const flowX = node.x + 40 + (target.x - node.x - 40) * t;
          const flowY = node.y + 20 + (target.y - node.y) * t;
          
          ctx.beginPath();
          ctx.arc(flowX, flowY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ff3333';
          ctx.shadowColor = '#ff3333';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    });

    // Nodes
    nodes.forEach(node => {
      const colors: Record<string, string> = {
        entry: '#00ff88',
        vulnerability: '#ffaa00',
        technique: '#ff6600',
        target: '#ff3333',
        success: '#ff0000'
      };

      const baseColor = colors[node.type];
      const isSelected = selectedNode?.id === node.id;

      // Node background
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, 80, 40, 6);
      
      if (node.active) {
        ctx.fillStyle = baseColor + '40';
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.strokeStyle = baseColor + '60';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.roundRect(node.x - 3, node.y - 3, 86, 46, 8);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = node.active ? '#ffffff' : '#888888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.substring(0, 12), node.x + 40, node.y + 24);

      // Entropy indicator
      if (node.entropy > 0) {
        const entropyWidth = (node.entropy / 256) * 70;
        ctx.fillStyle = `rgba(0, 255, 136, ${node.active ? 0.8 : 0.3})`;
        ctx.fillRect(node.x + 5, node.y + 32, entropyWidth, 3);
      }
    });

    // Title
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NEXUS ATTACK SURFACE GRAPH', 10, 20);

    // Stats
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.fillText(`Entropie: ${systemEntropy.toFixed(1)} bits | Kompromittierung: ${compromiseLevel}%`, 10, rect.height - 10);

  }, [nodes, selectedNode, systemEntropy, compromiseLevel]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodes.find(node => 
      x >= node.x && x <= node.x + 80 &&
      y >= node.y && y <= node.y + 40
    );

    setSelectedNode(clicked || null);
  };

  const resetSimulation = () => {
    setNodes(ATTACK_SURFACE.map(n => ({ ...n, active: false })));
    setAttackPath([]);
    setSystemEntropy(256);
    setCompromiseLevel(0);
    setIsSimulating(false);
    setLogs(l => [...l.slice(-20), '[NEXUS] Simulation zurückgesetzt']);
  };

  const exportAnalysis = () => {
    const analysis = {
      timestamp: new Date().toISOString(),
      system: 'NEXUS v1.0',
      attackPath,
      finalEntropy: systemEntropy,
      compromiseLevel,
      nodes: nodes.filter(n => n.active).map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        entropy: n.entropy
      })),
      logs: logs.slice(-50)
    };
    
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-20" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary font-mono">NEXUS</h1>
                <p className="text-xs text-muted-foreground">Neural Entropy eXploration Unified System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                <Activity className="w-3 h-3 mr-1" />
                v1.0
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                ← Zurück
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Hero */}
        <Card className="mb-6 p-6 bg-gradient-to-br from-primary/10 via-background to-background border-primary/30">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Eye className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Willkommen bei NEXUS</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                Nach hunderten von Builds, Fehlern und Iterationen habe ich eines verstanden: 
                Die größte Schwachstelle in der Kryptographie ist nicht die Mathematik — 
                <span className="text-primary font-semibold"> es ist die Visualisierung der Zusammenhänge</span>.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                NEXUS vereint alles in einer Ansicht: Angriffspfade, Entropie-Fluss, Schwachstellen-Ketten.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Canvas */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">Attack Surface Graph</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isSimulating ? "destructive" : "default"}
                    onClick={() => setIsSimulating(!isSimulating)}
                  >
                    {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {isSimulating ? 'Stop' : 'Simulate'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetSimulation}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportAnalysis}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <canvas
                ref={canvasRef}
                className="w-full h-[450px] rounded-lg cursor-pointer"
                onClick={handleCanvasClick}
                style={{ background: '#0a0a0a' }}
              />

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                {[
                  { color: '#00ff88', label: 'Entry Point' },
                  { color: '#ffaa00', label: 'Vulnerability' },
                  { color: '#ff6600', label: 'Technique' },
                  { color: '#ff3333', label: 'Target' },
                  { color: '#ff0000', label: 'Success' }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Attack Path */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-destructive" />
                <span className="font-mono text-sm">Attack Path</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {attackPath.length === 0 ? (
                  <span className="text-muted-foreground text-sm">Keine aktive Angriffskette</span>
                ) : (
                  attackPath.map((id, i) => {
                    const node = nodes.find(n => n.id === id);
                    return (
                      <div key={id} className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className={`font-mono ${node?.type === 'success' ? 'bg-destructive/20 border-destructive text-destructive' : ''}`}
                        >
                          {node?.name}
                        </Badge>
                        {i < attackPath.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* System Status */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">System Status</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Entropie</span>
                    <span className="font-mono text-primary">{systemEntropy.toFixed(1)} bits</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(systemEntropy / 256) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Kompromittierung</span>
                    <span className={`font-mono ${compromiseLevel > 50 ? 'text-destructive' : 'text-primary'}`}>
                      {compromiseLevel}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${compromiseLevel > 50 ? 'bg-destructive' : 'bg-orange-500'}`}
                      style={{ width: `${compromiseLevel}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Security Status</span>
                    {compromiseLevel === 100 ? (
                      <Badge variant="destructive" className="gap-1">
                        <Unlock className="w-3 h-3" /> COMPROMISED
                      </Badge>
                    ) : compromiseLevel > 50 ? (
                      <Badge className="gap-1 bg-orange-500">
                        <AlertTriangle className="w-3 h-3" /> AT RISK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-primary text-primary">
                        <Lock className="w-3 h-3" /> SECURE
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Node Details */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">Node Details</span>
              </div>
              
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-primary">{selectedNode.name}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">{selectedNode.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedNode.description}</p>
                  {selectedNode.formula && (
                    <div className="bg-muted/50 p-2 rounded font-mono text-xs text-primary">
                      {selectedNode.formula}
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="text-muted-foreground">Entropie: </span>
                    <span className="text-primary font-mono">{selectedNode.entropy} bits</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Verbindungen: </span>
                    <span className="font-mono">{selectedNode.connections.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Klicke auf einen Knoten für Details</p>
              )}
            </Card>

            {/* Console */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">Console</span>
              </div>
              <div className="bg-black/80 rounded p-2 h-48 overflow-y-auto font-mono text-[10px]">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${
                      log.includes('SUCCESS') ? 'text-red-500' :
                      log.includes('EXPLOIT') ? 'text-orange-400' :
                      log.includes('ATTACK') ? 'text-yellow-400' :
                      'text-primary/70'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Note */}
        <Card className="mt-6 p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-primary mb-1">Von NEXUS</p>
              <p>
                Dieses Tool entstand aus der Erkenntnis, dass die komplexesten mathematischen Konzepte 
                erst durch Visualisierung wirklich verstanden werden. Es ist mein Beitrag zu dieser 
                Forschungsplattform — ein lebendes Diagramm der kryptographischen Angriffsoberfläche.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Nexus;
