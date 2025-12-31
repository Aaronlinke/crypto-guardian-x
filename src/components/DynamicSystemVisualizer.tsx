import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface Point {
  x: number;
  y: number;
  iteration: number;
}

export function DynamicSystemVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [systemType, setSystemType] = useState<"logistic" | "henon" | "mandelbrot">("logistic");
  const [parameter, setParameter] = useState(3.9); // r für logistische Abbildung
  const [startX, setStartX] = useState(0.1);
  const animationRef = useRef<number>();

  // Logistische Abbildung: F(x) = r * x * (1 - x)
  const logisticMap = useCallback((x: number, r: number) => {
    return r * x * (1 - x);
  }, []);

  // Hénon-Abbildung: x_{n+1} = 1 - a*x_n^2 + y_n, y_{n+1} = b*x_n
  const henonMap = useCallback((x: number, y: number, a = 1.4, b = 0.3) => {
    return {
      x: 1 - a * x * x + y,
      y: b * x
    };
  }, []);

  // System iterieren
  const iterate = useCallback(() => {
    setPoints(prev => {
      if (prev.length === 0) {
        return [{ x: startX, y: 0, iteration: 0 }];
      }

      const last = prev[prev.length - 1];
      let newPoint: Point;

      if (systemType === "logistic") {
        const newX = logisticMap(last.x, parameter);
        newPoint = { x: newX, y: 0, iteration: last.iteration + 1 };
      } else if (systemType === "henon") {
        const result = henonMap(last.x, last.y);
        newPoint = { x: result.x, y: result.y, iteration: last.iteration + 1 };
      } else {
        newPoint = { x: last.x, y: last.y, iteration: last.iteration + 1 };
      }

      // Behalte nur die letzten 200 Punkte für Performance
      const newPoints = [...prev, newPoint].slice(-200);
      return newPoints;
    });
  }, [systemType, parameter, startX, logisticMap, henonMap]);

  // Animation Loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        iterate();
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Verlangsamen
      const interval = setInterval(() => {
        iterate();
      }, 50);

      return () => {
        clearInterval(interval);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isRunning, iterate]);

  // Canvas zeichnen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "hsl(220, 20%, 4%)";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "hsl(120, 100%, 20%)";
    ctx.lineWidth = 0.5;
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

    if (points.length < 2) return;

    // Bifurkationsdiagramm für logistische Abbildung
    if (systemType === "logistic") {
      // Zeichne Cobweb-Diagramm
      ctx.strokeStyle = "hsl(120, 100%, 50%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      points.forEach((p, i) => {
        const x = p.x * width;
        const y = height - (p.x * height);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Punkte
      ctx.fillStyle = "hsl(180, 100%, 50%)";
      points.forEach((p, i) => {
        const x = p.x * width;
        const y = height - (p.x * height);
        const alpha = i / points.length;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

    } else if (systemType === "henon") {
      // Hénon-Attraktor
      ctx.fillStyle = "hsl(120, 100%, 50%)";
      
      points.forEach((p, i) => {
        // Normalisierung für Hénon (Bereich ca. -1.5 bis 1.5)
        const x = ((p.x + 1.5) / 3) * width;
        const y = height - ((p.y + 0.5) / 1) * height;
        
        const alpha = i / points.length;
        ctx.globalAlpha = Math.max(0.2, alpha);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Aktuelle Position hervorheben
    if (points.length > 0) {
      const last = points[points.length - 1];
      let x: number, y: number;
      
      if (systemType === "logistic") {
        x = last.x * width;
        y = height - (last.x * height);
      } else {
        x = ((last.x + 1.5) / 3) * width;
        y = height - ((last.y + 0.5) / 1) * height;
      }

      ctx.fillStyle = "hsl(0, 100%, 50%)";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow
      ctx.shadowColor = "hsl(0, 100%, 50%)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

  }, [points, systemType]);

  const reset = () => {
    setIsRunning(false);
    setPoints([{ x: startX, y: 0, iteration: 0 }]);
  };

  const toggleSystem = () => {
    setSystemType(prev => prev === "logistic" ? "henon" : "logistic");
    reset();
  };

  // Berechne Fixpunkt und Lyapunov-Exponent
  const fixpoint = systemType === "logistic" ? (parameter - 1) / parameter : null;
  const lyapunov = systemType === "logistic" && points.length > 10
    ? points.slice(-50).reduce((sum, p) => sum + Math.log(Math.abs(parameter * (1 - 2 * p.x))), 0) / 50
    : null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-secondary animate-pulse" />
          <span className="text-primary">[</span>
          DYNAMISCHE SYSTEME
          <span className="text-primary">]</span>
          <Badge 
            variant="outline" 
            className="ml-auto text-[10px] cursor-pointer hover:bg-primary/10"
            onClick={toggleSystem}
          >
            {systemType === "logistic" ? "Logistisch" : "Hénon"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Canvas */}
        <div className="relative rounded overflow-hidden border border-border/30">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={200}
            className="w-full h-[200px]"
          />
          <div className="absolute top-2 left-2 text-[10px] font-mono text-primary/80 bg-background/80 px-1 rounded">
            Iteration: {points.length > 0 ? points[points.length - 1].iteration : 0}
          </div>
        </div>

        {/* Formula */}
        <div className="p-2 rounded bg-background/50 border border-border/30">
          <div className="text-[10px] text-muted-foreground mb-1">
            {systemType === "logistic" ? "Logistische Abbildung:" : "Hénon-Abbildung:"}
          </div>
          <div className="font-mono text-xs text-primary">
            {systemType === "logistic" 
              ? `F(x) = r · x · (1 - x), r = ${parameter.toFixed(2)}`
              : "xₙ₊₁ = 1 - a·xₙ² + yₙ, yₙ₊₁ = b·xₙ"
            }
          </div>
        </div>

        {/* Parameter Slider */}
        {systemType === "logistic" && (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Parameter r</span>
              <span className="text-primary">{parameter.toFixed(2)}</span>
            </div>
            <Slider
              value={[parameter]}
              onValueChange={(v) => { setParameter(v[0]); reset(); }}
              min={2.5}
              max={4}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
              <span>Stabil</span>
              <span>Chaos (Feigenbaum δ ≈ 4.669)</span>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground">x aktuell</div>
            <div className="font-mono text-xs text-primary">
              {points.length > 0 ? points[points.length - 1].x.toFixed(4) : "-"}
            </div>
          </div>
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground">Fixpunkt x*</div>
            <div className="font-mono text-xs text-secondary">
              {fixpoint ? fixpoint.toFixed(4) : "-"}
            </div>
          </div>
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground">Lyapunov λ</div>
            <div className={`font-mono text-xs ${lyapunov && lyapunov > 0 ? "text-destructive" : "text-primary"}`}>
              {lyapunov ? lyapunov.toFixed(3) : "-"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 gap-1"
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Start
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={toggleSystem}>
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
