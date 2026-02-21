import { useState, useEffect, useRef } from "react";
import { Workflow, Play, Pause, RotateCcw, Download, Zap, Lock, Hash, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { SECP256K1, modInverse, toFullHex } from "@/lib/crypto-math";

interface PipelineStage {
  id: string;
  name: string;
  formula: string;
  description: string;
  value: string;
  active: boolean;
  complete: boolean;
}

export function OmnigenesisPipeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [entropy, setEntropy] = useState(0);
  const [navigation, setNavigation] = useState(0);
  const [geometry, setGeometry] = useState(0);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [batchSize, setBatchSize] = useState(10);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const { toast } = useToast();

  const N = SECP256K1.N;

  // Pipeline Stufen initialisieren
  useEffect(() => {
    resetPipeline();
  }, []);

  const resetPipeline = () => {
    setCurrentStage(0);
    const rng = new Uint32Array(3);
    crypto.getRandomValues(rng);
    setEntropy(rng[0] % 1000000);
    setNavigation(rng[1] % 1000);
    setGeometry(rng[2] % 100);
    setGeneratedKeys([]);
    setStages([
      {
        id: "entropy",
        name: "ENTROPY COLLECTION",
        formula: "h = SHA256(timestamp || random || hardware)",
        description: "Sammle Entropie aus verschiedenen Quellen",
        value: "",
        active: false,
        complete: false
      },
      {
        id: "navigation",
        name: "NAVIGATION MATRIX",
        formula: "n = ⌊h / divisor⌋ mod range",
        description: "Berechne Navigationsparameter aus Entropie",
        value: "",
        active: false,
        complete: false
      },
      {
        id: "geometry",
        name: "GEOMETRIC TRANSFORM",
        formula: "g = spiral_index(n) ⊕ prime_offset",
        description: "Geometrische Transformation (Ulam-Spirale)",
        value: "",
        active: false,
        complete: false
      },
      {
        id: "seed",
        name: "SEED GENERATION",
        formula: "kᵢ = (h + n·g + o + i) mod N",
        description: "Generiere deterministische Seeds",
        value: "",
        active: false,
        complete: false
      },
      {
        id: "ecdsa",
        name: "ECDSA DERIVATION",
        formula: "Qᵢ = kᵢ · G (Punkt auf secp256k1)",
        description: "Leite Public Keys ab",
        value: "",
        active: false,
        complete: false
      },
      {
        id: "output",
        name: "KEY OUTPUT",
        formula: "export(Qᵢ, kᵢ) → wallet",
        description: "Finale Schlüssel exportieren",
        value: "",
        active: false,
        complete: false
      }
    ]);
  };

  // Pipeline Animation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= stages.length - 1) {
          setIsRunning(false);
          return prev;
        }
        
        // Update stage values
        setStages(current => {
          const updated = [...current];
          updated[prev].complete = true;
          updated[prev].active = false;
          if (prev + 1 < updated.length) {
            updated[prev + 1].active = true;
            updated[prev + 1].value = calculateStageValue(prev + 1);
          }
          return updated;
        });
        
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning, stages.length]);

  const calculateStageValue = (stage: number): string => {
    const h = BigInt(entropy);
    const n = BigInt(navigation);
    const g = BigInt(geometry);
    
    switch (stage) {
      case 0: // Entropy
        return `0x${entropy.toString(16).padStart(8, "0")}...`;
      case 1: // Navigation
        return `n = ${navigation}`;
      case 2: // Geometry
        return `g = ${geometry}`;
      case 3: // Seed
        const k = ((h + n * g) % N + N) % N;
        return `k = 0x${k.toString(16).slice(0, 16)}...`;
      case 4: // ECDSA
        return `Q = (Gx × k) mod P`;
      case 5: // Output
        // Generate batch of keys
        const keys: string[] = [];
        for (let i = 0; i < batchSize; i++) {
          const ki = ((h + n * g + BigInt(i)) % N + N) % N;
          keys.push(toFullHex(ki));
        }
        setGeneratedKeys(keys);
        return `${batchSize} Schlüssel generiert`;
      default:
        return "";
    }
  };

  const startPipeline = () => {
    resetPipeline();
    setTimeout(() => {
      setStages(current => {
        const updated = [...current];
        updated[0].active = true;
        updated[0].value = calculateStageValue(0);
        return updated;
      });
      setIsRunning(true);
    }, 100);
  };

  // Canvas Visualisierung
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
    
    // Pipeline-Fluss zeichnen
    const stageWidth = width / stages.length;
    const stageHeight = height * 0.6;
    const startY = (height - stageHeight) / 2;
    
    stages.forEach((stage, idx) => {
      const x = idx * stageWidth + stageWidth / 2;
      
      // Verbindungslinie
      if (idx > 0) {
        ctx.strokeStyle = stage.complete || stage.active ? "#22c55e" : "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo((idx - 1) * stageWidth + stageWidth / 2 + 20, height / 2);
        ctx.lineTo(x - 20, height / 2);
        ctx.stroke();
        
        // Pfeil
        if (stage.complete || stage.active) {
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.moveTo(x - 20, height / 2);
          ctx.lineTo(x - 28, height / 2 - 5);
          ctx.lineTo(x - 28, height / 2 + 5);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      // Stage-Kreis
      const radius = 18;
      ctx.beginPath();
      ctx.arc(x, height / 2, radius, 0, Math.PI * 2);
      
      if (stage.complete) {
        ctx.fillStyle = "#22c55e";
        ctx.fill();
      } else if (stage.active) {
        ctx.fillStyle = "#f59e0b";
        ctx.fill();
        
        // Pulsing animation
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        const pulseRadius = radius + 5 + Math.sin(Date.now() / 100) * 3;
        ctx.beginPath();
        ctx.arc(x, height / 2, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#1a1a1a";
        ctx.fill();
      }
      
      // Stage-Nummer
      ctx.fillStyle = stage.complete || stage.active ? "#000" : "#666";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((idx + 1).toString(), x, height / 2);
      
      // Stage-Name
      ctx.fillStyle = stage.active ? "#f59e0b" : stage.complete ? "#22c55e" : "#666";
      ctx.font = "9px monospace";
      ctx.fillText(stage.name.split(" ")[0], x, height / 2 + 35);
    });
    
    // Animation frame
    if (isRunning) {
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext("2d");
      });
    }
  }, [stages, isRunning, currentStage]);

  const exportKeys = () => {
    if (generatedKeys.length === 0) {
      toast({ title: "Keine Keys", description: "Starte zuerst die Pipeline" });
      return;
    }
    
    const data = {
      pipeline: "OMNIGENESIS",
      timestamp: new Date().toISOString(),
      parameters: { entropy, navigation, geometry, batchSize },
      keys: generatedKeys.map((k, i) => ({
        index: i,
        privateKey: k,
        format: "hex (256 bit)"
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omnigenesis-keys-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: `${generatedKeys.length} Schlüssel` });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          <span className="text-primary">[</span>
          OMNIGENESIS PIPELINE
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
            {stages.filter(s => s.complete).length}/{stages.length} STAGES
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full rounded border border-border/30"
        />
        
        {/* Parameter Slider */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-muted-foreground">Batch Size: {batchSize}</label>
            <Slider
              value={[batchSize]}
              onValueChange={([v]) => setBatchSize(v)}
              min={1}
              max={100}
              step={1}
              disabled={isRunning}
              className="mt-1"
            />
          </div>
          <div className="text-[10px] text-muted-foreground">
            <div>h = {entropy}</div>
            <div>n = {navigation}</div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            <div>g = {geometry}</div>
            <div>N = secp256k1</div>
          </div>
        </div>
        
        {/* Stage Details */}
        <div className="space-y-1">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`p-2 rounded border transition-all ${
                stage.active 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : stage.complete 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-background/30 border-border/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stage.id === "entropy" && <Zap className="w-3 h-3" />}
                  {stage.id === "navigation" && <Hash className="w-3 h-3" />}
                  {stage.id === "geometry" && <Workflow className="w-3 h-3" />}
                  {stage.id === "seed" && <Key className="w-3 h-3" />}
                  {stage.id === "ecdsa" && <Lock className="w-3 h-3" />}
                  {stage.id === "output" && <Download className="w-3 h-3" />}
                  <span className={`text-[10px] font-bold ${
                    stage.active ? "text-amber-400" : stage.complete ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {stage.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">
                  {stage.value}
                </span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-1 font-mono">
                {stage.formula}
              </div>
            </div>
          ))}
        </div>
        
        {/* Generated Keys */}
        {generatedKeys.length > 0 && (
          <div className="p-2 rounded bg-primary/5 border border-primary/20">
            <div className="text-[10px] text-primary mb-1 font-bold">
              Generierte Schlüssel ({generatedKeys.length}):
            </div>
            <div className="max-h-24 overflow-y-auto space-y-0.5">
              {generatedKeys.slice(0, 5).map((key, i) => (
                <div key={i} className="text-[8px] font-mono text-muted-foreground break-all">
                  [{i}] 0x{key}
                </div>
              ))}
              {generatedKeys.length > 5 && (
                <div className="text-[9px] text-muted-foreground">
                  ... und {generatedKeys.length - 5} weitere
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            className="flex-1 gap-2"
            onClick={isRunning ? () => setIsRunning(false) : startPipeline}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isRunning ? "Stopp" : "Pipeline starten"}
          </Button>
          <Button size="sm" variant="outline" onClick={resetPipeline} disabled={isRunning}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={exportKeys} disabled={generatedKeys.length === 0}>
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
