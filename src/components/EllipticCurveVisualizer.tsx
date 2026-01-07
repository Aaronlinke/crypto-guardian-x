import { useState, useEffect, useRef, useMemo } from "react";
import { Circle, Plus, ArrowRight, RotateCcw, Play, Pause, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SECP256K1, modInverse } from "@/lib/crypto-math";

interface Point {
  x: bigint;
  y: bigint;
}

// Vereinfachte Kurvenparameter für Visualisierung (kleine Werte)
const DEMO_CURVE = {
  a: 0n,
  b: 7n,
  p: 97n // Kleine Primzahl für Demo
};

export function EllipticCurveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scalarK, setScalarK] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showTrace, setShowTrace] = useState(true);
  const [curveP, setCurveP] = useState(97);

  // Generator Punkt für Demo-Kurve
  const G: Point = useMemo(() => {
    // Finde einen gültigen Punkt auf der Kurve y² = x³ + 7 (mod p)
    for (let x = 1n; x < BigInt(curveP); x++) {
      const rhs = (x * x * x + DEMO_CURVE.b) % BigInt(curveP);
      // Prüfe ob rhs ein quadratischer Rest ist
      for (let y = 0n; y < BigInt(curveP); y++) {
        if ((y * y) % BigInt(curveP) === rhs) {
          return { x, y };
        }
      }
    }
    return { x: 1n, y: 1n };
  }, [curveP]);

  // Punkt-Addition auf elliptischer Kurve
  const pointAdd = (P: Point | null, Q: Point | null): Point | null => {
    if (P === null) return Q;
    if (Q === null) return P;
    
    const p = BigInt(curveP);
    
    if (P.x === Q.x && P.y !== Q.y) {
      return null; // Punkt im Unendlichen
    }
    
    let lambda: bigint;
    
    if (P.x === Q.x && P.y === Q.y) {
      // Punkt-Verdopplung
      if (P.y === 0n) return null;
      const num = (3n * P.x * P.x + DEMO_CURVE.a) % p;
      const denom = modInverse((2n * P.y) % p + p, p);
      lambda = (num * denom) % p;
    } else {
      // Normale Addition
      const num = ((Q.y - P.y) % p + p) % p;
      const denom = modInverse(((Q.x - P.x) % p + p) % p, p);
      lambda = (num * denom) % p;
    }
    
    const x3 = ((lambda * lambda - P.x - Q.x) % p + p) % p;
    const y3 = ((lambda * (P.x - x3) - P.y) % p + p) % p;
    
    return { x: x3, y: y3 };
  };

  // Skalarmultiplikation k * G
  const scalarMul = (k: number): { result: Point | null; steps: (Point | null)[] } => {
    const steps: (Point | null)[] = [];
    let result: Point | null = null;
    let addend: Point | null = G;
    let kBits = k;
    
    while (kBits > 0) {
      if (kBits & 1) {
        result = pointAdd(result, addend);
        steps.push(result);
      }
      addend = pointAdd(addend, addend);
      kBits >>= 1;
    }
    
    return { result, steps };
  };

  // Berechne alle Punkte auf der Kurve
  const curvePoints = useMemo(() => {
    const points: Point[] = [];
    const p = BigInt(curveP);
    
    for (let x = 0n; x < p; x++) {
      const rhs = (x * x * x + DEMO_CURVE.b) % p;
      for (let y = 0n; y < p; y++) {
        if ((y * y) % p === rhs) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, [curveP]);

  // Animation
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= scalarK) {
          setIsAnimating(false);
          return scalarK;
        }
        return prev + 1;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isAnimating, scalarK]);

  // Canvas zeichnen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const scale = (width - 2 * padding) / curveP;
    
    // Hintergrund
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= curveP; i += Math.max(1, Math.floor(curveP / 10))) {
      const x = padding + i * scale;
      const y = height - padding - i * scale;
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Achsenbeschriftung
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("x", width / 2, height - 5);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("y", 0, 0);
    ctx.restore();
    
    // Alle Punkte auf der Kurve
    curvePoints.forEach(point => {
      const x = padding + Number(point.x) * scale;
      const y = height - padding - Number(point.y) * scale;
      
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Generator Punkt G
    const gx = padding + Number(G.x) * scale;
    const gy = height - padding - Number(G.y) * scale;
    
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(gx, gy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("G", gx, gy);
    
    // Multiplikations-Pfad visualisieren
    if (showTrace && animationStep > 0) {
      const { steps } = scalarMul(animationStep);
      
      let prevPoint = G;
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      steps.forEach((point, idx) => {
        if (point && prevPoint) {
          const x1 = padding + Number(prevPoint.x) * scale;
          const y1 = height - padding - Number(prevPoint.y) * scale;
          const x2 = padding + Number(point.x) * scale;
          const y2 = height - padding - Number(point.y) * scale;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          // Zwischenpunkt
          ctx.fillStyle = `rgba(34, 197, 94, ${0.3 + (idx / steps.length) * 0.7})`;
          ctx.beginPath();
          ctx.arc(x2, y2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        if (point) prevPoint = point;
      });
      
      ctx.setLineDash([]);
    }
    
    // Ergebnis k*G
    const { result } = scalarMul(animationStep || scalarK);
    if (result) {
      const rx = padding + Number(result.x) * scale;
      const ry = height - padding - Number(result.y) * scale;
      
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P", rx, ry);
    }
    
    // Legende
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Kurve: y² = x³ + ${DEMO_CURVE.b} (mod ${curveP})`, 10, 15);
    ctx.fillText(`Punkte auf Kurve: ${curvePoints.length}`, 10, 28);
    
  }, [curvePoints, G, animationStep, scalarK, showTrace, curveP]);

  const { result } = scalarMul(scalarK);

  const startAnimation = () => {
    setAnimationStep(0);
    setIsAnimating(true);
  };

  const reset = () => {
    setAnimationStep(0);
    setIsAnimating(false);
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Circle className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          ELLIPTIC CURVE VISUALIZER
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-secondary/10 text-secondary border-secondary/30">
            secp256k1 Demo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full rounded border border-border/30"
        />
        
        {/* Kurvenparameter */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Primzahl p (Kurvenordnung)</label>
            <Input
              type="number"
              value={curveP}
              onChange={(e) => setCurveP(Math.max(17, Math.min(997, parseInt(e.target.value) || 97)))}
              className="h-7 text-xs font-mono"
              min={17}
              max={997}
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Skalar k (Multiplikator)</label>
            <Input
              type="number"
              value={scalarK}
              onChange={(e) => setScalarK(Math.max(1, Math.min(curvePoints.length, parseInt(e.target.value) || 1)))}
              className="h-7 text-xs font-mono"
              min={1}
              max={curvePoints.length}
            />
          </div>
        </div>
        
        {/* Slider für k */}
        <div>
          <label className="text-[10px] text-muted-foreground">k = {scalarK}</label>
          <Slider
            value={[scalarK]}
            onValueChange={([v]) => setScalarK(v)}
            min={1}
            max={Math.min(curvePoints.length, 100)}
            step={1}
            className="mt-1"
          />
        </div>
        
        {/* Ergebnis */}
        <div className="p-3 rounded bg-background/50 border border-border/30 space-y-2">
          <div className="text-[10px] text-muted-foreground">Skalarmultiplikation:</div>
          <div className="font-mono text-sm text-primary">
            P = k × G = {scalarK} × G
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <div className="text-[9px] text-amber-400">Generator G:</div>
              <div className="text-xs font-mono text-amber-300">
                ({G.x.toString()}, {G.y.toString()})
              </div>
            </div>
            <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
              <div className="text-[9px] text-red-400">Ergebnis P:</div>
              <div className="text-xs font-mono text-red-300">
                {result ? `(${result.x.toString()}, ${result.y.toString()})` : "∞"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mathematische Erklärung */}
        <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-1">
          <div className="text-[10px] text-muted-foreground">Punkt-Addition (P ≠ Q):</div>
          <div className="font-mono text-[10px] text-primary">
            λ = (y₂ - y₁) / (x₂ - x₁) mod p
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Punkt-Verdopplung (P = Q):</div>
          <div className="font-mono text-[10px] text-primary">
            λ = (3x₁² + a) / 2y₁ mod p
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Neue Koordinaten:</div>
          <div className="font-mono text-[10px] text-secondary">
            x₃ = λ² - x₁ - x₂   |   y₃ = λ(x₁ - x₃) - y₁
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-2" onClick={startAnimation} disabled={isAnimating}>
            <Play className="w-3 h-3" />
            Animation
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant={showTrace ? "default" : "outline"} 
            onClick={() => setShowTrace(!showTrace)}
          >
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Info */}
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-blue-300/80">
            <strong>Bitcoin secp256k1:</strong> p = 2²⁵⁶ - 2³² - 977, 
            n ≈ 1.158 × 10⁷⁷ Punkte. Hier Demo mit p = {curveP} ({curvePoints.length} Punkte).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
