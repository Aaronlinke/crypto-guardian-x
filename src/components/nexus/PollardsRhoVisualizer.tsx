import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, Zap, Target } from "lucide-react";
import { 
  pollardRho, 
  scalarMult, 
  DEMO_CURVE,
  type ECPoint,
  type RhoStep 
} from "@/lib/crypto-advanced";

interface PollardsRhoVisualizerProps {
  onLog?: (msg: string) => void;
}

const PollardsRhoVisualizer = ({ onLog }: PollardsRhoVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<RhoStep[]>([]);
  const [solution, setSolution] = useState<bigint | null>(null);
  const [targetK, setTargetK] = useState<bigint>(42n);
  
  // Generator point and target
  const G: ECPoint = { x: DEMO_CURVE.Gx, y: DEMO_CURVE.Gy };
  const [Q, setQ] = useState<ECPoint>(() => scalarMult(targetK, G));
  
  const log = useCallback((msg: string) => {
    onLog?.(`[POLLARD-RHO] ${msg}`);
  }, [onLog]);
  
  const reset = useCallback(() => {
    setSteps([]);
    setCurrentStep(0);
    setSolution(null);
    setIsRunning(false);
    
    // Random target between 1 and curve order
    const newK = BigInt(Math.floor(Math.random() * 500) + 1);
    setTargetK(newK);
    setQ(scalarMult(newK, G));
    log(`Neues Ziel: Q = ${newK}·G`);
  }, [G, log]);
  
  const startAlgorithm = useCallback(() => {
    log("Starte Pollard's Rho Algorithmus...");
    log(`Kurvenordnung n = ${DEMO_CURVE.n}`);
    log(`Suche x sodass Q = x·G`);
    
    const result = pollardRho(G, Q, DEMO_CURVE.n, 5000);
    setSteps(result.steps);
    
    if (result.solution) {
      setSolution(result.solution);
      log(`LÖSUNG GEFUNDEN: x = ${result.solution} nach ${result.iterations} Iterationen`);
    } else {
      log(`Keine Lösung nach ${result.iterations} Iterationen`);
    }
    
    setCurrentStep(0);
    setIsRunning(true);
  }, [G, Q, log]);
  
  // Animation loop
  useEffect(() => {
    if (!isRunning || currentStep >= steps.length) {
      if (currentStep >= steps.length && steps.length > 0) {
        setIsRunning(false);
      }
      return;
    }
    
    const timeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 200 - speed[0] * 1.8);
    
    return () => clearTimeout(timeout);
  }, [isRunning, currentStep, steps.length, speed]);
  
  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Scale points to canvas
    const scale = (p: ECPoint): [number, number] => {
      const x = (Number(p.x) / Number(DEMO_CURVE.p)) * (width - 40) + 20;
      const y = height - ((Number(p.y) / Number(DEMO_CURVE.p)) * (height - 40) + 20);
      return [x, y];
    };
    
    // Draw generator point G
    const [gx, gy] = scale(G);
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(gx, gy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00ff88';
    ctx.font = '10px monospace';
    ctx.fillText('G', gx + 10, gy);
    
    // Draw target point Q
    const [qx, qy] = scale(Q);
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(qx, qy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Q', qx + 10, qy);
    
    // Draw walk path
    if (steps.length > 0 && currentStep > 0) {
      ctx.strokeStyle = '#00aaff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let i = 0; i < Math.min(currentStep, steps.length); i++) {
        const step = steps[i];
        const [x, y] = scale(step.X);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = step.partition === 0 ? '#ff00ff' : 
                       step.partition === 1 ? '#ffff00' : '#00ffff';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
      ctx.stroke();
      
      // Highlight current position
      if (currentStep < steps.length) {
        const current = steps[currentStep - 1];
        const [cx, cy] = scale(current.X);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText("Pollard's Rho Random Walk", 10, 25);
    
    // Draw legend
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('● X + Q', width - 80, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillText('● 2X', width - 80, 35);
    ctx.fillStyle = '#00ffff';
    ctx.fillText('● X + P', width - 80, 50);
    
  }, [steps, currentStep, G, Q]);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Pollard's Rho ECDLP Solver
          </h3>
          <p className="text-xs text-muted-foreground">
            Floyd's Cycle Detection auf Demo-Kurve (Ordnung ≈ {DEMO_CURVE.n.toString()})
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          O(√n) = O({Math.floor(Math.sqrt(Number(DEMO_CURVE.n)))})
        </Badge>
      </div>
      
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            onClick={() => isRunning ? setIsRunning(false) : startAlgorithm()}
          >
            {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              max={100}
              step={1}
              className="w-32"
            />
          </div>
          
          <Badge variant="secondary" className="font-mono">
            Step {currentStep} / {steps.length}
          </Badge>
        </div>
      </Card>
      
      {/* Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full rounded-lg"
          />
        </Card>
        
        <div className="space-y-4">
          {/* Current State */}
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Aktueller Zustand
            </h4>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ziel k:</span>
                <span className="text-orange-500">{targetK.toString()}</span>
              </div>
              
              {currentStep > 0 && currentStep <= steps.length && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">a:</span>
                    <span>{steps[currentStep - 1].a.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">b:</span>
                    <span>{steps[currentStep - 1].b.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">X.x:</span>
                    <span>{steps[currentStep - 1].X.x.toString()}</span>
                  </div>
                </>
              )}
              
              {solution !== null && (
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-green-500">
                    <span>LÖSUNG:</span>
                    <span className="font-bold">{solution.toString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mt-1">
                    <span>Verifikation:</span>
                    <span className={solution === targetK ? 'text-green-500' : 'text-destructive'}>
                      {solution === targetK ? '✓ Korrekt' : '✗ Fehler'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Formula */}
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3">Mathematik</h4>
            <div className="space-y-2 text-xs font-mono bg-muted/30 p-2 rounded">
              <div className="text-primary">Walk-Funktion f(X):</div>
              <div className="pl-2 text-muted-foreground">
                X mod 3 = 0 → X + Q<br/>
                X mod 3 = 1 → 2X<br/>
                X mod 3 = 2 → X + P
              </div>
              <div className="text-primary mt-2">Kollision:</div>
              <div className="pl-2 text-muted-foreground">
                a₁P + b₁Q = a₂P + b₂Q<br/>
                x = (a₁-a₂)(b₂-b₁)⁻¹ mod n
              </div>
            </div>
          </Card>
          
          {/* Walk Log */}
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3">Walk Log</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1 text-[10px] font-mono">
                {steps.slice(Math.max(0, currentStep - 10), currentStep).map((step, i) => (
                  <div key={i} className="flex gap-2 text-muted-foreground">
                    <span className="text-primary">{step.index}:</span>
                    <span>({step.X.x.toString()}, {step.X.y.toString()})</span>
                    <span className={
                      step.partition === 0 ? 'text-pink-500' :
                      step.partition === 1 ? 'text-yellow-500' : 'text-cyan-500'
                    }>
                      P{step.partition}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PollardsRhoVisualizer;
