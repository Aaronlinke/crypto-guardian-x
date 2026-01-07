import { useState, useEffect, useRef, useCallback } from "react";
import { Compass, Target, Crosshair, RefreshCw, Maximize2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// Linke-Chronoplast Konstanten
const CHRONOPLAST_ANGLE = 33; // Der charakteristische 33°-Winkel
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

// SRIL-Koeffizienten
const SRIL_COEFFICIENTS = {
  alpha: 0.245,
  beta: 0.152,
  gamma: 0.985,
  delta: 0.112,
  eta: 0.088
};

interface ChronoplastState {
  H: number;  // Enthalpie (Winkel)
  N: number;  // Navigation (Intentions-Vektor)
  G: number;  // Geometrie (Ereignis-Horizont Radius)
}

export function ChronoplastVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const [state, setState] = useState<ChronoplastState>({
    H: -4.256,
    N: 5.824,
    G: 1.952
  });
  
  const [projectionAngle, setProjectionAngle] = useState(CHRONOPLAST_ANGLE);
  const [isAnimating, setIsAnimating] = useState(false);
  const [futureProjection, setFutureProjection] = useState<{x: number, y: number} | null>(null);
  const [intersectionPoint, setIntersectionPoint] = useState<{x: number, y: number, t: number} | null>(null);

  // Berechne Schnittpunkt von Intentions-Vektor (N) und Ereignis-Horizont (G)
  const calculateIntersection = useCallback((H: number, N: number, G: number, angle: number) => {
    // Der Intentions-Vektor hat Länge N und startet vom Ursprung
    // Der Ereignis-Horizont ist ein Kreis mit Radius proportional zu G
    // Der Winkel H bestimmt die Richtung
    
    const horizonRadius = Math.abs(G) * 50;
    const angleRad = (angle + H * 10) * Math.PI / 180;
    
    // Schnittpunkt auf dem Horizont
    const intersectX = Math.cos(angleRad) * horizonRadius;
    const intersectY = Math.sin(angleRad) * horizonRadius;
    
    // Zeitkoordinate basierend auf der Vektorlänge
    const t = N / GOLDEN_RATIO;
    
    return { x: intersectX, y: intersectY, t };
  }, []);

  // SRIL Forward-Projektion
  const projectFuture = useCallback((steps: number) => {
    let { H, N, G } = state;
    const { alpha, beta, gamma, delta, eta } = SRIL_COEFFICIENTS;
    
    for (let i = 0; i < steps; i++) {
      const H_next = H + alpha * N - beta * G;
      const N_next = gamma * N + delta * Math.abs(H);
      const G_next = G + eta * (H_next + N_next);
      H = H_next;
      N = N_next;
      G = G_next;
    }
    
    return { H, N, G };
  }, [state]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Hintergrund
      ctx.fillStyle = "rgba(5, 10, 15, 0.98)";
      ctx.fillRect(0, 0, width, height);

      // Radiales Gitter
      ctx.strokeStyle = "rgba(0, 255, 150, 0.08)";
      ctx.lineWidth = 1;
      for (let r = 20; r < 200; r += 30) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Winkel-Linien
      for (let a = 0; a < 360; a += 15) {
        const rad = a * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rad) * 180, centerY + Math.sin(rad) * 180);
        ctx.stroke();
      }

      // 33°-Referenzlinie (Linke-Chronoplast Charakteristik)
      const refAngleRad = projectionAngle * Math.PI / 180;
      ctx.strokeStyle = "rgba(255, 200, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(refAngleRad) * 200, centerY - Math.sin(refAngleRad) * 200);
      ctx.stroke();
      ctx.setLineDash([]);

      // 33° Label
      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.fillText(`${projectionAngle}°`, centerX + Math.cos(refAngleRad) * 160, centerY - Math.sin(refAngleRad) * 160);

      // EREIGNIS-HORIZONT (G) - Der Kreis
      const horizonRadius = Math.abs(state.G) * 50;
      
      // Outer Glow
      const horizonGradient = ctx.createRadialGradient(centerX, centerY, horizonRadius - 10, centerX, centerY, horizonRadius + 20);
      horizonGradient.addColorStop(0, "rgba(0, 200, 255, 0.3)");
      horizonGradient.addColorStop(0.5, "rgba(0, 200, 255, 0.1)");
      horizonGradient.addColorStop(1, "rgba(0, 200, 255, 0)");
      ctx.fillStyle = horizonGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, horizonRadius + 20, 0, Math.PI * 2);
      ctx.fill();

      // Horizont-Kreis
      ctx.strokeStyle = "rgba(0, 200, 255, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, horizonRadius, 0, Math.PI * 2);
      ctx.stroke();

      // G-Label
      ctx.fillStyle = "#00ccff";
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`G = ${state.G.toFixed(3)}`, centerX, centerY + horizonRadius + 18);
      ctx.fillText("EREIGNIS-HORIZONT", centerX, centerY + horizonRadius + 32);

      // INTENTIONS-VEKTOR (N) - Der Pfeil
      const intentionLength = Math.abs(state.N) * 25;
      const intentionAngle = (projectionAngle + state.H * 5) * Math.PI / 180;
      const intentionEndX = centerX + Math.cos(intentionAngle) * intentionLength;
      const intentionEndY = centerY - Math.sin(intentionAngle) * intentionLength;

      // Vektor-Linie
      const vecGradient = ctx.createLinearGradient(centerX, centerY, intentionEndX, intentionEndY);
      vecGradient.addColorStop(0, "rgba(0, 255, 100, 0.5)");
      vecGradient.addColorStop(1, "rgba(0, 255, 100, 1)");
      ctx.strokeStyle = vecGradient;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(intentionEndX, intentionEndY);
      ctx.stroke();

      // Pfeilspitze
      ctx.fillStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(intentionEndX, intentionEndY);
      ctx.lineTo(intentionEndX - 12 * Math.cos(intentionAngle - 0.3), intentionEndY + 12 * Math.sin(intentionAngle - 0.3));
      ctx.lineTo(intentionEndX - 12 * Math.cos(intentionAngle + 0.3), intentionEndY + 12 * Math.sin(intentionAngle + 0.3));
      ctx.closePath();
      ctx.fill();

      // N-Label
      ctx.fillStyle = "#00ff66";
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      const labelX = centerX + Math.cos(intentionAngle) * (intentionLength + 25);
      const labelY = centerY - Math.sin(intentionAngle) * (intentionLength + 25);
      ctx.fillText(`N = ${state.N.toFixed(3)}`, labelX, labelY);

      // SCHNITTPUNKT berechnen und zeichnen
      const intersection = calculateIntersection(state.H, state.N, state.G, projectionAngle);
      const intersectScreenX = centerX + intersection.x;
      const intersectScreenY = centerY - intersection.y;

      // Schnittpunkt-Marker
      ctx.fillStyle = "#ff3366";
      ctx.beginPath();
      ctx.arc(intersectScreenX, intersectScreenY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pulsierender Ring
      const pulseSize = 12 + Math.sin(Date.now() / 200) * 4;
      ctx.strokeStyle = "rgba(255, 51, 102, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(intersectScreenX, intersectScreenY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Schnittpunkt-Label
      ctx.fillStyle = "#ff3366";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.fillText(`ZUKUNFT t=${intersection.t.toFixed(2)}`, intersectScreenX, intersectScreenY - 20);

      // H-WINKEL Anzeige (Enthalpie)
      const HAngleRad = state.H * 10 * Math.PI / 180;
      ctx.strokeStyle = "rgba(255, 100, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, -refAngleRad, -refAngleRad - HAngleRad, state.H > 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // H-Label
      ctx.fillStyle = "#ff66ff";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`H = ${state.H.toFixed(3)}`, centerX - 80, centerY - 60);

      // Zentrum-Punkt
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Formeln anzeigen
      ctx.fillStyle = "rgba(0, 255, 150, 0.7)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("Linke-Chronoplast: Schnittpunkt(N⃗, G○) → Zukunft", 10, height - 50);
      ctx.fillText(`Projektion: ∠${projectionAngle}° + H×10° = ${(projectionAngle + state.H * 10).toFixed(1)}°`, 10, height - 35);
      ctx.fillText(`Horizont-Radius: |G| × 50 = ${horizonRadius.toFixed(1)}px`, 10, height - 20);

      setIntersectionPoint(intersection);

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [state, projectionAngle, isAnimating, calculateIntersection]);

  // Animation toggle
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setState(prev => {
        const { alpha, beta, gamma, delta, eta } = SRIL_COEFFICIENTS;
        const H_next = prev.H + alpha * prev.N - beta * prev.G;
        const N_next = gamma * prev.N + delta * Math.abs(prev.H);
        const G_next = prev.G + eta * (H_next + N_next);
        return { H: H_next, N: N_next, G: G_next };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const reset = () => {
    setState({ H: -4.256, N: 5.824, G: 1.952 });
    setProjectionAngle(CHRONOPLAST_ANGLE);
    setIsAnimating(false);
  };

  const project5Steps = () => {
    const future = projectFuture(5);
    setState(future);
    setFutureProjection({ x: future.N, y: future.G });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Compass className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          LINKE-CHRONOPLAST
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
            33° PROJEKTION
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

        {/* Legende */}
        <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30">
            <Circle className="w-3 h-3 mx-auto text-cyan-400 mb-1" />
            <span className="text-cyan-400">G: Ereignis-Horizont</span>
          </div>
          <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
            <Target className="w-3 h-3 mx-auto text-green-400 mb-1" />
            <span className="text-green-400">N: Intentions-Vektor</span>
          </div>
          <div className="p-2 rounded bg-pink-500/10 border border-pink-500/30">
            <Crosshair className="w-3 h-3 mx-auto text-pink-400 mb-1" />
            <span className="text-pink-400">∩: Zukunfts-Punkt</span>
          </div>
        </div>

        {/* Winkel-Slider */}
        <div>
          <label className="text-[10px] text-muted-foreground">
            Projektions-Winkel: {projectionAngle}° (Standard: 33°)
          </label>
          <Slider
            value={[projectionAngle]}
            onValueChange={([v]) => setProjectionAngle(v)}
            min={0}
            max={90}
            step={1}
            className="my-2"
          />
        </div>

        {/* Input-Felder */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[9px] text-pink-400">H (Winkel)</label>
            <Input
              type="number"
              step="0.1"
              value={state.H.toFixed(3)}
              onChange={(e) => setState(s => ({ ...s, H: parseFloat(e.target.value) || 0 }))}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-green-400">N (Vektor)</label>
            <Input
              type="number"
              step="0.1"
              value={state.N.toFixed(3)}
              onChange={(e) => setState(s => ({ ...s, N: parseFloat(e.target.value) || 0 }))}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-cyan-400">G (Horizont)</label>
            <Input
              type="number"
              step="0.1"
              value={state.G.toFixed(3)}
              onChange={(e) => setState(s => ({ ...s, G: parseFloat(e.target.value) || 0 }))}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        {/* Schnittpunkt-Anzeige */}
        {intersectionPoint && (
          <div className="p-2 rounded bg-pink-500/10 border border-pink-500/30 text-center">
            <div className="text-[9px] text-pink-400 mb-1">ZUKUNFTS-PROJEKTION</div>
            <div className="text-xs font-mono text-pink-300">
              x: {intersectionPoint.x.toFixed(2)} | y: {intersectionPoint.y.toFixed(2)} | t: {intersectionPoint.t.toFixed(3)}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isAnimating ? "destructive" : "default"}
            className="flex-1"
            onClick={() => setIsAnimating(!isAnimating)}
          >
            {isAnimating ? "STOPP" : "ANIMIEREN"}
          </Button>
          <Button size="sm" variant="outline" onClick={project5Steps}>
            <Maximize2 className="w-3 h-3 mr-1" />
            T+5
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {/* Signatur */}
        <div className="text-[8px] text-center text-muted-foreground">
          Linke-Chronoplast: "Zukunft nicht berechnen, sondern zeichnen"
        </div>
      </CardContent>
    </Card>
  );
}
