import { useState, useEffect, useRef, useCallback } from "react";
import { Grid3X3, Play, RotateCcw, ChevronRight, Download, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Vector {
  x: number;
  y: number;
}

interface LLLStep {
  iteration: number;
  operation: string;
  basis: Vector[];
  mu: number[][];
  orthogonalized: Vector[];
}

export function LLLLatticeVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [v1, setV1] = useState<Vector>({ x: 4, y: 1 });
  const [v2, setV2] = useState<Vector>({ x: 2, y: 3 });
  const [steps, setSteps] = useState<LLLStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [delta, setDelta] = useState(0.75); // LLL Parameter
  const { toast } = useToast();

  // Gram-Schmidt Orthogonalisierung
  const gramSchmidt = useCallback((basis: Vector[]): { orthogonal: Vector[], mu: number[][] } => {
    const n = basis.length;
    const orthogonal: Vector[] = [];
    const mu: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      orthogonal[i] = { ...basis[i] };
      
      for (let j = 0; j < i; j++) {
        // μ_ij = <b_i, b*_j> / <b*_j, b*_j>
        const dotBiBj = basis[i].x * orthogonal[j].x + basis[i].y * orthogonal[j].y;
        const dotBjBj = orthogonal[j].x * orthogonal[j].x + orthogonal[j].y * orthogonal[j].y;
        
        if (dotBjBj !== 0) {
          mu[i][j] = dotBiBj / dotBjBj;
          orthogonal[i].x -= mu[i][j] * orthogonal[j].x;
          orthogonal[i].y -= mu[i][j] * orthogonal[j].y;
        }
      }
    }
    
    return { orthogonal, mu };
  }, []);

  // Vektornorm
  const norm = (v: Vector): number => Math.sqrt(v.x * v.x + v.y * v.y);

  // LLL Algorithmus mit Schritt-Aufzeichnung
  const runLLL = useCallback(() => {
    const basis: Vector[] = [{ ...v1 }, { ...v2 }];
    const allSteps: LLLStep[] = [];
    let iteration = 0;

    const addStep = (operation: string, b: Vector[], m: number[][], orth: Vector[]) => {
      allSteps.push({
        iteration: iteration++,
        operation,
        basis: b.map(v => ({ ...v })),
        mu: m.map(row => [...row]),
        orthogonalized: orth.map(v => ({ ...v }))
      });
    };

    // Initial
    let { orthogonal, mu } = gramSchmidt(basis);
    addStep("Initial Basis", basis, mu, orthogonal);

    let k = 1;
    const maxIterations = 100;
    let iterations = 0;

    while (k < basis.length && iterations < maxIterations) {
      iterations++;
      
      // Size Reduction
      for (let j = k - 1; j >= 0; j--) {
        if (Math.abs(mu[k][j]) > 0.5) {
          const round = Math.round(mu[k][j]);
          basis[k].x -= round * basis[j].x;
          basis[k].y -= round * basis[j].y;
          
          const result = gramSchmidt(basis);
          mu = result.mu;
          orthogonal = result.orthogonal;
          
          addStep(`Size Reduce: b${k+1} -= ${round}·b${j+1}`, basis, mu, orthogonal);
        }
      }

      // Lovász Condition
      const normBkStar = norm(orthogonal[k]);
      const normBk1Star = norm(orthogonal[k - 1]);
      const lovaszValue = (delta - mu[k][k - 1] * mu[k][k - 1]) * normBk1Star * normBk1Star;
      
      if (normBkStar * normBkStar >= lovaszValue) {
        k++;
        addStep(`Lovász OK: k → ${k + 1}`, basis, mu, orthogonal);
      } else {
        // Swap
        const temp = basis[k];
        basis[k] = basis[k - 1];
        basis[k - 1] = temp;
        
        const result = gramSchmidt(basis);
        mu = result.mu;
        orthogonal = result.orthogonal;
        
        addStep(`Swap: b${k} ↔ b${k + 1}`, basis, mu, orthogonal);
        
        k = Math.max(k - 1, 1);
      }
    }

    addStep("LLL Reduzierte Basis", basis, mu, orthogonal);
    setSteps(allSteps);
    setCurrentStep(0);
    
    return allSteps;
  }, [v1, v2, delta, gramSchmidt]);

  // Animation
  useEffect(() => {
    if (!isAnimating || currentStep >= steps.length - 1) {
      setIsAnimating(false);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAnimating, currentStep, steps.length]);

  // Canvas zeichnen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 30;

    // Hintergrund
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * scale, 0);
      ctx.lineTo(centerX + i * scale, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * scale);
      ctx.lineTo(width, centerY + i * scale);
      ctx.stroke();
    }

    // Achsen
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Aktuelle Basis
    const currentBasis = currentStep >= 0 && steps[currentStep] 
      ? steps[currentStep].basis 
      : [v1, v2];

    // Gitterpunkte zeichnen
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const px = centerX + (i * currentBasis[0].x + j * currentBasis[1].x) * scale;
        const py = centerY - (i * currentBasis[0].y + j * currentBasis[1].y) * scale;
        
        if (px > 0 && px < width && py > 0 && py < height) {
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Vektor zeichnen
    const drawVector = (v: Vector, color: string, label: string) => {
      const endX = centerX + v.x * scale;
      const endY = centerY - v.y * scale;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Pfeilspitze
      const angle = Math.atan2(centerY - endY, endX - centerX);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 10 * Math.cos(angle - 0.3), endY + 10 * Math.sin(angle - 0.3));
      ctx.lineTo(endX - 10 * Math.cos(angle + 0.3), endY + 10 * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = "bold 12px monospace";
      ctx.fillText(label, endX + 10, endY - 10);
    };

    // Ursprüngliche Vektoren (schwach)
    if (currentStep > 0) {
      ctx.globalAlpha = 0.3;
      drawVector(v1, "#f59e0b", "b₁°");
      drawVector(v2, "#3b82f6", "b₂°");
      ctx.globalAlpha = 1;
    }

    // Aktuelle Vektoren
    drawVector(currentBasis[0], "#22c55e", "b₁");
    drawVector(currentBasis[1], "#ef4444", "b₂");

    // Orthogonalisierte Vektoren (gestrichelt)
    if (currentStep >= 0 && steps[currentStep]) {
      const orth = steps[currentStep].orthogonalized;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.5;
      
      orth.forEach((v, i) => {
        const endX = centerX + v.x * scale;
        const endY = centerY - v.y * scale;
        ctx.strokeStyle = i === 0 ? "#22c55e" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
      
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Info-Box
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(5, 5, 180, 60);
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.fillText(`|b₁| = ${norm(currentBasis[0]).toFixed(3)}`, 10, 20);
    ctx.fillText(`|b₂| = ${norm(currentBasis[1]).toFixed(3)}`, 10, 35);
    ctx.fillText(`Hadamard ratio: ${(norm(currentBasis[0]) * norm(currentBasis[1]) / 
      (norm(v1) * norm(v2) || 1)).toFixed(3)}`, 10, 50);

  }, [v1, v2, currentStep, steps]);

  const startAnimation = () => {
    runLLL();
    setIsAnimating(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const reset = () => {
    setSteps([]);
    setCurrentStep(-1);
    setIsAnimating(false);
  };

  const exportData = () => {
    if (steps.length === 0) {
      toast({ title: "Keine Daten", description: "Führe zuerst LLL aus" });
      return;
    }
    
    const data = {
      initialBasis: { v1, v2 },
      delta,
      steps: steps.map(s => ({
        iteration: s.iteration,
        operation: s.operation,
        basis: s.basis,
        norms: s.basis.map(v => norm(v))
      })),
      finalBasis: steps[steps.length - 1]?.basis || [v1, v2],
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lll-reduction-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: "LLL-Reduktionsdaten" });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          LLL GITTER-REDUKTION
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
            Lenstra³
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={350}
          className="w-full rounded border border-border/30"
        />

        {/* Schritt-Info */}
        {currentStep >= 0 && steps[currentStep] && (
          <div className="p-2 rounded bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">
                Schritt {currentStep + 1} / {steps.length}
              </span>
              <Badge variant="outline" className="text-[9px]">
                Iteration {steps[currentStep].iteration}
              </Badge>
            </div>
            <div className="font-mono text-xs text-primary">
              {steps[currentStep].operation}
            </div>
          </div>
        )}

        {/* Input Vektoren */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">b₁ = (x, y)</label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={v1.x}
                onChange={(e) => setV1({ ...v1, x: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs font-mono"
                disabled={isAnimating}
              />
              <Input
                type="number"
                value={v1.y}
                onChange={(e) => setV1({ ...v1, y: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs font-mono"
                disabled={isAnimating}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">b₂ = (x, y)</label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={v2.x}
                onChange={(e) => setV2({ ...v2, x: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs font-mono"
                disabled={isAnimating}
              />
              <Input
                type="number"
                value={v2.y}
                onChange={(e) => setV2({ ...v2, y: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs font-mono"
                disabled={isAnimating}
              />
            </div>
          </div>
        </div>

        {/* Delta Parameter */}
        <div>
          <label className="text-[10px] text-muted-foreground">
            δ (Lovász-Parameter): {delta.toFixed(2)}
          </label>
          <Input
            type="number"
            value={delta}
            onChange={(e) => setDelta(Math.max(0.25, Math.min(1, parseFloat(e.target.value) || 0.75)))}
            className="h-7 text-xs font-mono"
            step={0.05}
            min={0.25}
            max={1}
            disabled={isAnimating}
          />
        </div>

        {/* Formeln */}
        <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-1">
          <div className="text-[10px] text-muted-foreground">Lovász-Bedingung:</div>
          <div className="font-mono text-[10px] text-primary">
            |b*ₖ|² ≥ (δ - μₖ,ₖ₋₁²) · |b*ₖ₋₁|²
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Size Reduction:</div>
          <div className="font-mono text-[10px] text-secondary">
            bₖ ← bₖ - ⌊μₖⱼ⌉ · bⱼ   wenn |μₖⱼ| {">"} 0.5
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-2" onClick={startAnimation} disabled={isAnimating}>
            <Zap className="w-3 h-3" />
            LLL Starten
          </Button>
          <Button size="sm" variant="outline" onClick={nextStep} disabled={currentStep >= steps.length - 1}>
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={exportData} disabled={steps.length === 0}>
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
