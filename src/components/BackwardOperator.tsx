import { useState, useMemo, useRef, useEffect } from "react";
import { Undo2, Play, RotateCcw, Download, Target, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Rückwärts-Operator für dynamische Systeme
// F⁻¹(X) = {y ∈ S | F(y) ∈ X}

interface PreimageResult {
  x: number;
  y: number;
  iteration: number;
}

export function BackwardOperator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState(0.5);
  const [r, setR] = useState(3.8);
  const [depth, setDepth] = useState(5);
  const [preimages, setPreimages] = useState<PreimageResult[][]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  // Logistische Abbildung: f(x) = r*x*(1-x)
  const logisticMap = (x: number) => r * x * (1 - x);
  
  // Rückwärts-Operator: Finde x sodass f(x) = target
  // r*x*(1-x) = target
  // r*x - r*x² = target
  // x² - x + target/r = 0
  // x = (1 ± √(1 - 4*target/r)) / 2
  const findPreimages = (y: number): number[] => {
    const discriminant = 1 - 4 * y / r;
    if (discriminant < 0) return [];
    if (discriminant === 0) return [0.5];
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (1 - sqrtD) / 2;
    const x2 = (1 + sqrtD) / 2;
    return [x1, x2].filter(x => x >= 0 && x <= 1);
  };

  // Berechne alle Urbilder bis zur gegebenen Tiefe
  const calculateBackwardTree = () => {
    setIsCalculating(true);
    const tree: PreimageResult[][] = [];
    
    // Level 0: Zielwert
    tree.push([{ x: target, y: target, iteration: 0 }]);
    
    // Rückwärts-Iteration
    for (let d = 1; d <= depth; d++) {
      const currentLevel: PreimageResult[] = [];
      const prevLevel = tree[d - 1];
      
      for (const node of prevLevel) {
        const preimgs = findPreimages(node.x);
        for (const pre of preimgs) {
          currentLevel.push({ 
            x: pre, 
            y: node.x, 
            iteration: d 
          });
        }
      }
      
      tree.push(currentLevel);
    }
    
    setPreimages(tree);
    setIsCalculating(false);
  };

  // Canvas zeichnen
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
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Logistische Kurve
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < width; px++) {
      const x = px / width;
      const y = logisticMap(x);
      const py = height - y * height;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    
    // Diagonale y=x
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Zielwert Linie
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    const targetY = height - target * height;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    
    // Urbilder zeichnen
    const colors = ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
    
    preimages.forEach((level, levelIdx) => {
      const color = colors[levelIdx % colors.length];
      ctx.fillStyle = color;
      
      level.forEach(node => {
        const px = node.x * width;
        const py = height - logisticMap(node.x) * height;
        
        // Punkt
        ctx.beginPath();
        ctx.arc(px, py, 4 - levelIdx * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Verbindungslinie zu y-Wert
        if (levelIdx > 0) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, height - node.x * height);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    });
    
  }, [preimages, target, r]);

  // Export
  const exportData = () => {
    const data = {
      system: "Logistic Map",
      parameter: r,
      target,
      depth,
      preimages: preimages.map((level, i) => ({
        iteration: -i,
        count: level.length,
        values: level.map(n => n.x)
      })),
      formula: "F⁻¹(y) = {x ∈ [0,1] | r·x·(1-x) = y}"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backward-operator-r${r}-target${target}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: "Urbildbaum-Daten" });
  };

  const totalPreimages = preimages.reduce((sum, level) => sum + level.length, 0);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Undo2 className="w-4 h-4 text-amber-400" />
          <span className="text-primary">[</span>
          RÜCKWÄRTS-OPERATOR F⁻¹
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
            URBILDER
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formel */}
        <div className="p-2 rounded bg-background/50 border border-border/30">
          <div className="text-[10px] text-muted-foreground mb-1">Definition</div>
          <div className="font-mono text-xs text-primary">
            F⁻¹(X) = {"{"} y ∈ S | F(y) ∈ X {"}"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Logistische Abbildung: f(x) = r·x·(1-x), r = {r.toFixed(2)}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="w-full rounded border border-border/30 bg-background/30"
          />
          <div className="absolute top-2 right-2 text-[10px] bg-background/80 px-2 py-1 rounded">
            <span className="text-muted-foreground">Urbilder:</span>{" "}
            <span className="text-primary font-mono">{totalPreimages}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground">Zielwert y*</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[target]}
                onValueChange={([v]) => setTarget(v)}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <span className="text-xs font-mono w-10">{target.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Parameter r</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[r]}
                onValueChange={([v]) => setR(v)}
                min={2.5}
                max={4}
                step={0.01}
                className="flex-1"
              />
              <span className="text-xs font-mono w-10">{r.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground">Iterationstiefe</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[depth]}
              onValueChange={([v]) => setDepth(v)}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-xs font-mono w-10">{depth}</span>
          </div>
        </div>

        {/* Berechnen Button */}
        <Button 
          size="sm" 
          className="w-full gap-2" 
          onClick={calculateBackwardTree}
          disabled={isCalculating}
        >
          <ArrowLeft className="w-3 h-3" />
          Urbilder berechnen (F⁻¹ bis Tiefe {depth})
        </Button>

        {/* Ergebnisse */}
        {preimages.length > 0 && (
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {preimages.map((level, i) => (
                <div key={i} className="p-2 rounded bg-background/30 border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">
                      F^{-i}(y*) = Tiefe {i}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {level.length} Urbilder
                    </Badge>
                  </div>
                  <div className="font-mono text-[10px] text-primary flex flex-wrap gap-1">
                    {level.map((node, j) => (
                      <span key={j} className="bg-primary/10 px-1 rounded">
                        {node.x.toFixed(6)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Info */}
        <div className="p-2 rounded bg-muted/20 border border-border/20 text-[10px] text-muted-foreground">
          <strong>Wissenschaftliche Bedeutung:</strong> Die Anzahl der Urbilder wächst exponentiell 
          mit der Tiefe (≈ 2^n für chaotische Systeme). Dies visualisiert die 
          Nichtumkehrbarkeit dynamischer Systeme und das Konzept der Entropieerzeugung.
        </div>

        {/* Export */}
        <Button size="sm" variant="outline" className="w-full gap-2" onClick={exportData}>
          <Download className="w-3 h-3" />
          Vollständige Daten exportieren
        </Button>
      </CardContent>
    </Card>
  );
}
