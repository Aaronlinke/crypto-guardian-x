import { useState, useEffect, useRef, useCallback } from "react";
import { Atom, Play, Pause, RotateCcw, Download, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface EntropyPoint {
  x: number;
  y: number;
  value: number;
  timestamp: number;
}

export function QuantumEntropyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [entropyPool, setEntropyPool] = useState<number[]>([]);
  const [points, setPoints] = useState<EntropyPoint[]>([]);
  const [poolSize, setPoolSize] = useState(256);
  const [entropy, setEntropy] = useState(0);
  const { toast } = useToast();

  // Berechne Shannon-Entropie
  const calculateShannonEntropy = useCallback((data: number[]) => {
    if (data.length === 0) return 0;
    
    const frequency: Map<number, number> = new Map();
    data.forEach(byte => {
      frequency.set(byte, (frequency.get(byte) || 0) + 1);
    });
    
    let entropy = 0;
    frequency.forEach(count => {
      const p = count / data.length;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });
    
    return entropy;
  }, []);

  // Sammle Entropie aus verschiedenen Quellen
  const collectEntropy = useCallback(() => {
    // Zeitbasierte Entropie (Mikrosekunden-Variation)
    const timeEntropy = performance.now() * 1000;
    
    // Math.random (PRNG, aber gut für Demo)
    const randomEntropy = Math.random() * 256;
    
    // Kombiniere zu einem Byte
    const combined = Math.floor((timeEntropy + randomEntropy) % 256);
    
    return combined;
  }, []);

  // Entropie-Sammlung Animation
  useEffect(() => {
    if (!isCollecting) return;

    const interval = setInterval(() => {
      const newByte = collectEntropy();
      
      setEntropyPool(prev => {
        const updated = [...prev, newByte];
        if (updated.length > poolSize) {
          updated.shift();
        }
        setEntropy(calculateShannonEntropy(updated));
        return updated;
      });
      
      // Neuer Punkt für Visualisierung
      setPoints(prev => {
        const x = (prev.length % 16) * 25 + 12;
        const y = Math.floor((prev.length % 256) / 16) * 25 + 12;
        const newPoint: EntropyPoint = {
          x,
          y,
          value: newByte,
          timestamp: Date.now()
        };
        
        const updated = [...prev, newPoint];
        if (updated.length > 256) {
          updated.shift();
        }
        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isCollecting, poolSize, collectEntropy, calculateShannonEntropy]);

  // Canvas Zeichnen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Hintergrund
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 25, 0);
      ctx.lineTo(i * 25, 400);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * 25);
      ctx.lineTo(400, i * 25);
      ctx.stroke();
    }
    
    // Entropie-Punkte als Heatmap
    points.forEach((point, idx) => {
      const age = Date.now() - point.timestamp;
      const alpha = Math.max(0.2, 1 - age / 5000);
      
      // Farbe basierend auf Byte-Wert (Heatmap)
      const hue = (point.value / 256) * 120; // Grün (0) bis Rot (120 invertiert)
      ctx.fillStyle = `hsla(${120 - hue}, 100%, 50%, ${alpha})`;
      
      const x = (idx % 16) * 25 + 12;
      const y = Math.floor(idx / 16) * 25 + 12;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Wert anzeigen
      if (age < 2000) {
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(point.value.toString(16).toUpperCase().padStart(2, "0"), x, y);
      }
    });
    
    // Entropie-Balken
    const entropyPercent = entropy / 8; // Max 8 bits für perfekte Entropie
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, height - 30, width, 30);
    
    const gradient = ctx.createLinearGradient(0, 0, width * entropyPercent, 0);
    gradient.addColorStop(0, "#ef4444");
    gradient.addColorStop(0.5, "#f59e0b");
    gradient.addColorStop(1, "#22c55e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - 25, width * entropyPercent, 20);
    
    ctx.fillStyle = "#fff";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Shannon Entropy: ${entropy.toFixed(4)} bits/byte`, 5, height - 10);
    
  }, [points, entropy]);

  const reset = () => {
    setEntropyPool([]);
    setPoints([]);
    setEntropy(0);
    setIsCollecting(false);
  };

  const exportEntropy = () => {
    if (entropyPool.length === 0) {
      toast({ title: "Kein Pool", description: "Sammle zuerst Entropie" });
      return;
    }
    
    const hexString = entropyPool.map(b => b.toString(16).padStart(2, "0")).join("");
    const data = {
      source: "Quantum Entropy Simulator",
      timestamp: new Date().toISOString(),
      poolSize: entropyPool.length,
      shannonEntropy: entropy,
      entropyQuality: entropy >= 7.5 ? "Excellent" : entropy >= 6 ? "Good" : entropy >= 4 ? "Fair" : "Poor",
      rawBytes: hexString,
      byteArray: entropyPool
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entropy-pool-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: `${entropyPool.length} Bytes Entropie` });
  };

  const getEntropyQuality = () => {
    if (entropy >= 7.5) return { label: "EXCELLENT", color: "text-primary" };
    if (entropy >= 6) return { label: "GOOD", color: "text-secondary" };
    if (entropy >= 4) return { label: "FAIR", color: "text-amber-400" };
    return { label: "POOR", color: "text-destructive" };
  };

  const quality = getEntropyQuality();

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Atom className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          ENTROPY POOL
          <span className="text-primary">]</span>
          <Badge variant="outline" className={`ml-auto text-[10px] ${quality.color}`}>
            {quality.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={430}
          className="w-full rounded border border-border/30"
        />
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <div className="text-[10px] text-muted-foreground">Pool Size</div>
            <div className="text-lg font-mono text-primary">{entropyPool.length}</div>
            <div className="text-[9px] text-muted-foreground">/ {poolSize} bytes</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <div className="text-[10px] text-muted-foreground">Shannon H</div>
            <div className="text-lg font-mono text-secondary">{entropy.toFixed(3)}</div>
            <div className="text-[9px] text-muted-foreground">bits/byte</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <div className="text-[10px] text-muted-foreground">Max Entropy</div>
            <div className="text-lg font-mono text-muted-foreground">8.000</div>
            <div className="text-[9px] text-muted-foreground">bits/byte</div>
          </div>
        </div>
        
        {/* Pool Size Slider */}
        <div>
          <label className="text-[10px] text-muted-foreground">Pool Größe: {poolSize} bytes</label>
          <Slider
            value={[poolSize]}
            onValueChange={([v]) => setPoolSize(v)}
            min={32}
            max={1024}
            step={32}
            disabled={isCollecting}
            className="mt-1"
          />
        </div>
        
        {/* Formeln */}
        <div className="p-2 rounded bg-muted/20 border border-border/20">
          <div className="text-[10px] text-muted-foreground mb-1">Shannon-Entropie:</div>
          <div className="font-mono text-xs text-primary">
            H(X) = -∑ p(x) · log₂(p(x))
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">
            Perfekte Zufälligkeit: H = 8 bits/byte (256 gleich wahrscheinliche Werte)
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isCollecting ? "destructive" : "default"}
            className="flex-1 gap-2"
            onClick={() => setIsCollecting(!isCollecting)}
          >
            {isCollecting ? <Pause className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            {isCollecting ? "Stopp" : "Sammeln"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={exportEntropy} disabled={entropyPool.length === 0}>
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
