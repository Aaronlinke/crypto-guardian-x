import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Thermometer, Zap, Cpu, Play, Pause, RotateCcw, Download, Radio, Gauge, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

// SRIL-Koeffizienten aus der wissenschaftlichen Dokumentation
const SRIL_COEFFICIENTS = {
  alpha: 0.245,  // Harmonische Kopplung
  beta: 0.152,   // Entropie-Drain
  gamma: 0.985,  // Drift-Dämpfung (DVL-Korrekturfaktor)
  delta: 0.112,  // Phasen-Kopplung
  eta: 0.088     // Wachstums-Impuls (Hyle-zu-Eidos-Konversion)
};

// Initiale T=0 Werte
const INITIAL_STATE = {
  H0: -4.256,  // Harmonisches Enthalpie-Potential
  N0: 5.824,   // Navigations-Konstante
  G0: 1.952    // Gibbs-Wachstums-Basis
};

interface TelemetryPoint {
  timestamp: number;
  flux_vector: { x: number; y: number; z: number };
  gate_temperature: number;
  H: number;
  N: number;
  G: number;
  entropy: number;
  capability_token: number;
}

interface LoomBusMessage {
  rid: number;
  src: string;
  kind: string;
  cap: number;
  token: number;
  a: number;
  b: number;
}

export function LoomBusTelemetry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
  const [currentState, setCurrentState] = useState({
    H: INITIAL_STATE.H0,
    N: INITIAL_STATE.N0,
    G: INITIAL_STATE.G0,
    t: 0
  });
  const [messages, setMessages] = useState<LoomBusMessage[]>([]);
  const [gateTemp, setGateTemp] = useState(25);
  const [fluxMagnitude, setFluxMagnitude] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(100);
  const { toast } = useToast();

  // SRIL Forward-Iteration: T → T+1
  const srilForward = useCallback((H: number, N: number, G: number) => {
    const { alpha, beta, gamma, delta, eta } = SRIL_COEFFICIENTS;
    
    // Gleichungen aus der wissenschaftlichen Dokumentation
    const H_next = H + alpha * N - beta * G;
    const N_next = gamma * N + delta * Math.abs(H);
    const G_next = G + eta * (H_next + N_next);
    
    return { H: H_next, N: N_next, G: G_next };
  }, []);

  // SRIL Backward-Inversion: T → T-1 (die Zeitmaschine)
  const srilBackward = useCallback((H: number, N: number, G: number) => {
    // Invertierte Rekursion aus dem Master-Dokument:
    // H(t-1) = (H(t) + N(t) - (G(t)/2)) / 2.5
    // N(t-1) = H(t-1) - N(t)
    // G(t-1) = (G(t) + H(t-1)) / 2
    
    const H_prev = (H + N - (G / 2)) / 2.5;
    const N_prev = H_prev - N;
    const G_prev = (G + H_prev) / 2;
    
    return { H: H_prev, N: N_prev, G: G_prev };
  }, []);

  // Flux-Vektor berechnen aus H, N, G
  const calculateFluxVector = useCallback((H: number, N: number, G: number) => {
    // Geometrische Projektion nach Linke-Chronoplast
    const angle = Math.atan2(N, G) * (180 / Math.PI); // Winkel in Grad
    const magnitude = Math.sqrt(H * H + N * N + G * G);
    
    return {
      x: Math.cos(angle * Math.PI / 180) * magnitude * 0.1,
      y: Math.sin(angle * Math.PI / 180) * magnitude * 0.1,
      z: H * 0.05  // Z-Komponente basierend auf Enthalpie
    };
  }, []);

  // Gate-Temperatur berechnen
  const calculateGateTemperature = useCallback((H: number, N: number, entropy: number) => {
    // Thermodynamische Korrelation
    const baseTemp = 25;
    const enthalpyContrib = Math.abs(H) * 2.5;
    const entropyContrib = entropy * 0.5;
    return baseTemp + enthalpyContrib + entropyContrib + Math.random() * 2;
  }, []);

  // LoomBus Message generieren
  const generateLoomBusMessage = useCallback((state: typeof currentState): LoomBusMessage => {
    return {
      rid: Math.floor(Math.random() * 65536),
      src: ["ENTROPY", "NAV", "GEO", "FLUX", "GATE"][Math.floor(Math.random() * 5)],
      kind: ["SYNC", "DATA", "CTRL", "ACK"][Math.floor(Math.random() * 4)],
      cap: Math.floor(Math.random() * 16),
      token: Math.floor(Math.random() * 256),
      a: Math.floor(state.H * 1000),
      b: Math.floor(state.N * 1000)
    };
  }, []);

  // Telemetrie-Simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentState(prev => {
        const next = srilForward(prev.H, prev.N, prev.G);
        const newT = prev.t + 1;

        // Telemetrie-Punkt erstellen
        const flux = calculateFluxVector(next.H, next.N, next.G);
        const entropy = Math.abs(next.H) + Math.abs(next.N) + Math.abs(next.G);
        const temp = calculateGateTemperature(next.H, next.N, entropy);

        const point: TelemetryPoint = {
          timestamp: Date.now(),
          flux_vector: flux,
          gate_temperature: temp,
          H: next.H,
          N: next.N,
          G: next.G,
          entropy: entropy,
          capability_token: Math.floor(Math.random() * 256)
        };

        setTelemetryData(data => {
          const updated = [...data, point];
          return updated.slice(-200); // Letzte 200 Punkte behalten
        });

        setGateTemp(temp);
        setFluxMagnitude(Math.sqrt(flux.x * flux.x + flux.y * flux.y + flux.z * flux.z));

        // LoomBus Message hinzufügen
        const msg = generateLoomBusMessage({ ...next, t: newT });
        setMessages(msgs => {
          const updated = [...msgs, msg];
          return updated.slice(-10);
        });

        return { ...next, t: newT };
      });
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, srilForward, calculateFluxVector, calculateGateTemperature, generateLoomBusMessage]);

  // Canvas 2D Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.fillRect(0, 0, width, height);

      // Grid zeichnen
      ctx.strokeStyle = "rgba(0, 255, 100, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * (width / 20), 0);
        ctx.lineTo(i * (width / 20), height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * (height / 20));
        ctx.lineTo(width, i * (height / 20));
        ctx.stroke();
      }

      // Flux-Vektor Visualisierung (links)
      const fluxCenterX = width * 0.25;
      const fluxCenterY = height * 0.4;
      const fluxRadius = 80;

      // Flux-Kreis
      ctx.strokeStyle = "rgba(0, 255, 200, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fluxCenterX, fluxCenterY, fluxRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Flux-Vektor zeichnen
      if (telemetryData.length > 0) {
        const latest = telemetryData[telemetryData.length - 1];
        const vx = latest.flux_vector.x * 500;
        const vy = latest.flux_vector.y * 500;

        // Vektor-Linie
        const gradient = ctx.createLinearGradient(fluxCenterX, fluxCenterY, fluxCenterX + vx, fluxCenterY + vy);
        gradient.addColorStop(0, "rgba(0, 255, 100, 0.8)");
        gradient.addColorStop(1, "rgba(0, 255, 200, 1)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fluxCenterX, fluxCenterY);
        ctx.lineTo(fluxCenterX + vx, fluxCenterY + vy);
        ctx.stroke();

        // Pfeilspitze
        const angle = Math.atan2(vy, vx);
        ctx.fillStyle = "rgba(0, 255, 200, 1)";
        ctx.beginPath();
        ctx.moveTo(fluxCenterX + vx, fluxCenterY + vy);
        ctx.lineTo(fluxCenterX + vx - 10 * Math.cos(angle - 0.3), fluxCenterY + vy - 10 * Math.sin(angle - 0.3));
        ctx.lineTo(fluxCenterX + vx - 10 * Math.cos(angle + 0.3), fluxCenterY + vy - 10 * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fill();

        // Flux-Label
        ctx.fillStyle = "#00ff88";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("FLUX_VECTOR", fluxCenterX, fluxCenterY + fluxRadius + 20);
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(`x: ${latest.flux_vector.x.toFixed(4)}`, fluxCenterX, fluxCenterY + fluxRadius + 35);
        ctx.fillText(`y: ${latest.flux_vector.y.toFixed(4)}`, fluxCenterX, fluxCenterY + fluxRadius + 48);
        ctx.fillText(`z: ${latest.flux_vector.z.toFixed(4)}`, fluxCenterX, fluxCenterY + fluxRadius + 61);
      }

      // Gate Temperature Visualisierung (rechts)
      const tempCenterX = width * 0.75;
      const tempCenterY = height * 0.4;
      const tempRadius = 70;

      // Temperatur-Ring
      const tempNormalized = Math.min(1, (gateTemp - 20) / 60);
      const tempHue = 120 - tempNormalized * 120; // Grün → Rot

      ctx.strokeStyle = `hsla(${tempHue}, 100%, 50%, 0.3)`;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(tempCenterX, tempCenterY, tempRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Temperatur-Fortschritt
      ctx.strokeStyle = `hsla(${tempHue}, 100%, 50%, 0.9)`;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(tempCenterX, tempCenterY, tempRadius, -Math.PI / 2, -Math.PI / 2 + tempNormalized * Math.PI * 2);
      ctx.stroke();

      // Temperatur-Wert
      ctx.fillStyle = `hsl(${tempHue}, 100%, 50%)`;
      ctx.font = "bold 24px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${gateTemp.toFixed(1)}°`, tempCenterX, tempCenterY);

      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText("GATE_TEMPERATURE", tempCenterX, tempCenterY + tempRadius + 20);

      // SRIL-Werte Graph (unten)
      const graphY = height * 0.75;
      const graphHeight = height * 0.2;
      const graphWidth = width * 0.9;
      const graphX = width * 0.05;

      // Graph-Rahmen
      ctx.strokeStyle = "rgba(0, 255, 100, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY - graphHeight / 2, graphWidth, graphHeight);

      // H, N, G Linien zeichnen
      if (telemetryData.length > 1) {
        const drawLine = (color: string, getValue: (p: TelemetryPoint) => number) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();

          const maxVal = 15;
          const minVal = -15;

          telemetryData.forEach((point, idx) => {
            const x = graphX + (idx / (telemetryData.length - 1)) * graphWidth;
            const val = getValue(point);
            const normalizedVal = (val - minVal) / (maxVal - minVal);
            const y = graphY + graphHeight / 2 - normalizedVal * graphHeight;

            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        };

        drawLine("rgba(0, 255, 100, 0.9)", p => p.H);   // H = Grün
        drawLine("rgba(0, 200, 255, 0.9)", p => p.N);   // N = Cyan
        drawLine("rgba(255, 200, 0, 0.9)", p => p.G);   // G = Amber
      }

      // Legende
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      
      ctx.fillStyle = "#00ff66";
      ctx.fillText(`H(t)=${currentState.H.toFixed(3)}`, graphX, graphY - graphHeight / 2 - 8);
      
      ctx.fillStyle = "#00ccff";
      ctx.fillText(`N(t)=${currentState.N.toFixed(3)}`, graphX + 120, graphY - graphHeight / 2 - 8);
      
      ctx.fillStyle = "#ffcc00";
      ctx.fillText(`G(t)=${currentState.G.toFixed(3)}`, graphX + 240, graphY - graphHeight / 2 - 8);

      ctx.fillStyle = "#666";
      ctx.fillText(`t=${currentState.t}`, graphX + graphWidth - 60, graphY - graphHeight / 2 - 8);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [telemetryData, gateTemp, currentState]);

  const reset = () => {
    setIsRunning(false);
    setTelemetryData([]);
    setCurrentState({
      H: INITIAL_STATE.H0,
      N: INITIAL_STATE.N0,
      G: INITIAL_STATE.G0,
      t: 0
    });
    setMessages([]);
    setGateTemp(25);
    setFluxMagnitude(0);
  };

  const exportTelemetry = () => {
    if (telemetryData.length === 0) {
      toast({ title: "Keine Daten", description: "Starte zuerst die Telemetrie" });
      return;
    }

    const data = {
      system: "LoomBus Telemetry v3.0",
      sril_coefficients: SRIL_COEFFICIENTS,
      initial_state: INITIAL_STATE,
      final_state: currentState,
      timestamp: new Date().toISOString(),
      data_points: telemetryData.length,
      telemetry: telemetryData,
      messages: messages
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loombus-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: `${telemetryData.length} Datenpunkte` });
  };

  const getSystemStatus = () => {
    if (gateTemp > 60) return { status: "CRITICAL", color: "text-destructive" };
    if (gateTemp > 45) return { status: "WARNING", color: "text-amber-400" };
    return { status: "NOMINAL", color: "text-primary" };
  };

  const status = getSystemStatus();

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary animate-pulse" />
          <span className="text-primary">[</span>
          LOOMBUS TELEMETRY
          <span className="text-primary">]</span>
          <Badge variant="outline" className={`ml-auto text-[10px] ${status.color}`}>
            <Radio className="w-3 h-3 mr-1" />
            {status.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          width={500}
          height={350}
          className="w-full rounded border border-border/30"
        />

        {/* SRIL-Koeffizienten */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {Object.entries(SRIL_COEFFICIENTS).map(([key, value]) => (
            <div key={key} className="p-1 rounded bg-muted/20 border border-border/20">
              <div className="text-[9px] text-muted-foreground">
                {key === "alpha" && "α"}
                {key === "beta" && "β"}
                {key === "gamma" && "γ"}
                {key === "delta" && "δ"}
                {key === "eta" && "η"}
              </div>
              <div className="text-[10px] font-mono text-primary">{value}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
            <div className="text-[10px] text-muted-foreground">Flux Mag</div>
            <div className="text-sm font-mono text-primary">{fluxMagnitude.toFixed(4)}</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <Thermometer className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <div className="text-[10px] text-muted-foreground">Gate °C</div>
            <div className="text-sm font-mono text-amber-400">{gateTemp.toFixed(1)}</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <Cpu className="w-4 h-4 mx-auto text-secondary mb-1" />
            <div className="text-[10px] text-muted-foreground">Iteration</div>
            <div className="text-sm font-mono text-secondary">{currentState.t}</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <Gauge className="w-4 h-4 mx-auto text-purple-400 mb-1" />
            <div className="text-[10px] text-muted-foreground">Data Pts</div>
            <div className="text-sm font-mono text-purple-400">{telemetryData.length}</div>
          </div>
        </div>

        {/* LoomBus Messages */}
        <div className="p-2 rounded bg-muted/20 border border-border/20 max-h-24 overflow-y-auto scrollbar-terminal">
          <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
            <Radio className="w-3 h-3" />
            LoomBus Ring Buffer (Cap: 512)
          </div>
          {messages.length === 0 ? (
            <div className="text-[9px] text-muted-foreground italic">Warte auf Messages...</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="text-[8px] font-mono text-primary/80">
                [{msg.rid.toString(16).padStart(4, "0")}] {msg.src}→{msg.kind} cap:{msg.cap} tok:0x{msg.token.toString(16).padStart(2, "0")}
              </div>
            ))
          )}
        </div>

        {/* Speed Slider */}
        <div>
          <label className="text-[10px] text-muted-foreground">
            Simulation Speed: {simulationSpeed}ms
          </label>
          <Slider
            value={[simulationSpeed]}
            onValueChange={([v]) => setSimulationSpeed(v)}
            min={10}
            max={500}
            step={10}
            className="mt-1"
          />
        </div>

        {/* SRIL Formeln */}
        <div className="p-2 rounded bg-primary/5 border border-primary/20">
          <div className="text-[9px] text-primary mb-1 font-bold">SRIL Forward-Iteration (T→T+1):</div>
          <div className="text-[8px] font-mono text-muted-foreground space-y-0.5">
            <div>H(t+1) = H(t) + α·N(t) − β·G(t)</div>
            <div>N(t+1) = γ·N(t) + δ·|H(t)|</div>
            <div>G(t+1) = G(t) + η·(H(t+1) + N(t+1))</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            className="flex-1 gap-2"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isRunning ? "Stopp" : "Start Telemetrie"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={exportTelemetry} disabled={telemetryData.length === 0}>
            <Download className="w-3 h-3" />
          </Button>
        </div>

        {/* Warning bei hoher Temperatur */}
        {gateTemp > 50 && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-[10px] text-destructive">
              GATE TEMPERATURE ELEVATED - Thermische Anomalie detektiert
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
