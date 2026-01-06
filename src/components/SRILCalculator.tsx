import { useState, useCallback } from "react";
import { Calculator, ArrowRight, ArrowLeft, RotateCcw, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// SRIL-Koeffizienten aus der wissenschaftlichen Dokumentation
const SRIL_COEFFICIENTS = {
  alpha: 0.245,  // Harmonische Kopplung (Gewicht der Navigation)
  beta: 0.152,   // Entropie-Drain (Energieverbrauch des Wachstums)
  gamma: 0.985,  // Drift-Dämpfung (DVL-Korrekturfaktor)
  delta: 0.112,  // Phasen-Kopplung (Einfluss der Enthalpie auf die Drift)
  eta: 0.088     // Wachstums-Impuls (Hyle-zu-Eidos-Konversion)
};

// Initiale T=0 Werte aus der wissenschaftlichen Dokumentation
const INITIAL_STATE = {
  H0: -4.256,  // Harmonisches Enthalpie-Potential
  N0: 5.824,   // Navigations-Konstante  
  G0: 1.952    // Gibbs-Wachstums-Basis
};

interface IterationStep {
  t: number;
  H: number;
  N: number;
  G: number;
  direction: "forward" | "backward";
}

export function SRILCalculator() {
  const [H, setH] = useState(INITIAL_STATE.H0.toString());
  const [N, setN] = useState(INITIAL_STATE.N0.toString());
  const [G, setG] = useState(INITIAL_STATE.G0.toString());
  const [iterations, setIterations] = useState<IterationStep[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // SRIL Forward-Iteration: T → T+1
  const srilForward = useCallback((H: number, N: number, G: number) => {
    const { alpha, beta, gamma, delta, eta } = SRIL_COEFFICIENTS;
    
    // Schritt 1: H(t+1) = H(t) + α·N(t) − β·G(t)
    const H_next = H + alpha * N - beta * G;
    
    // Schritt 2: N(t+1) = γ·N(t) + δ·|H(t)|
    const N_next = gamma * N + delta * Math.abs(H);
    
    // Schritt 3: G(t+1) = G(t) + η·(H(t+1) + N(t+1))
    const G_next = G + eta * (H_next + N_next);
    
    return { H: H_next, N: N_next, G: G_next };
  }, []);

  // SRIL Backward-Inversion: T → T-1
  const srilBackward = useCallback((H: number, N: number, G: number) => {
    // Aus dem Master-Dokument - die "Zeitmaschine":
    // H(t-1) = (H(t) + N(t) - (G(t)/2)) / 2.5
    // N(t-1) = H(t-1) - N(t)  
    // G(t-1) = (G(t) + H(t-1)) / 2
    
    const H_prev = (H + N - (G / 2)) / 2.5;
    const N_prev = H_prev - N;
    const G_prev = (G + H_prev) / 2;
    
    return { H: H_prev, N: N_prev, G: G_prev };
  }, []);

  const calculateForward = () => {
    const currentH = parseFloat(H);
    const currentN = parseFloat(N);
    const currentG = parseFloat(G);

    if (isNaN(currentH) || isNaN(currentN) || isNaN(currentG)) {
      toast({ title: "Fehler", description: "Ungültige Eingabewerte" });
      return;
    }

    const lastT = iterations.length > 0 ? iterations[iterations.length - 1].t : 0;
    const result = srilForward(currentH, currentN, currentG);

    const step: IterationStep = {
      t: lastT + 1,
      H: result.H,
      N: result.N,
      G: result.G,
      direction: "forward"
    };

    setIterations(prev => [...prev, step]);
    setH(result.H.toFixed(6));
    setN(result.N.toFixed(6));
    setG(result.G.toFixed(6));
  };

  const calculateBackward = () => {
    const currentH = parseFloat(H);
    const currentN = parseFloat(N);
    const currentG = parseFloat(G);

    if (isNaN(currentH) || isNaN(currentN) || isNaN(currentG)) {
      toast({ title: "Fehler", description: "Ungültige Eingabewerte" });
      return;
    }

    const lastT = iterations.length > 0 ? iterations[iterations.length - 1].t : 2;
    const result = srilBackward(currentH, currentN, currentG);

    const step: IterationStep = {
      t: lastT - 1,
      H: result.H,
      N: result.N,
      G: result.G,
      direction: "backward"
    };

    setIterations(prev => [...prev, step]);
    setH(result.H.toFixed(6));
    setN(result.N.toFixed(6));
    setG(result.G.toFixed(6));
  };

  const reset = () => {
    setH(INITIAL_STATE.H0.toString());
    setN(INITIAL_STATE.N0.toString());
    setG(INITIAL_STATE.G0.toString());
    setIterations([]);
  };

  const copyResults = () => {
    const data = {
      coefficients: SRIL_COEFFICIENTS,
      initial_values: { H: parseFloat(H), N: parseFloat(N), G: parseFloat(G) },
      iterations: iterations
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Kopiert", description: "Berechnungen in Zwischenablage" });
  };

  // Berechne Fixpunkt und Lyapunov-Exponent
  const calculateMetrics = () => {
    const currentH = parseFloat(H);
    const currentN = parseFloat(N);
    const currentG = parseFloat(G);

    // Energie-Norm
    const energy = Math.sqrt(currentH * currentH + currentN * currentN + currentG * currentG);
    
    // Chronoplast-Winkel (33° Referenz)
    const chronoplastAngle = Math.atan2(currentN, currentG) * (180 / Math.PI);
    
    // Lyapunov-ähnliche Stabilität
    const { gamma } = SRIL_COEFFICIENTS;
    const lyapunov = Math.log(Math.abs(gamma));

    return { energy, chronoplastAngle, lyapunov };
  };

  const metrics = calculateMetrics();

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-primary">[</span>
          SRIL CALCULATOR
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-secondary/10 text-secondary border-secondary/30">
            v2.0
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Koeffizienten-Anzeige */}
        <div className="p-2 rounded bg-muted/20 border border-border/20">
          <div className="text-[9px] text-muted-foreground mb-2">SRIL-Koeffizienten (Linke & Lakschewitz, 2016):</div>
          <div className="grid grid-cols-5 gap-1 text-center">
            <div className="text-[10px]">
              <span className="text-primary">α</span> = <span className="font-mono">{SRIL_COEFFICIENTS.alpha}</span>
            </div>
            <div className="text-[10px]">
              <span className="text-primary">β</span> = <span className="font-mono">{SRIL_COEFFICIENTS.beta}</span>
            </div>
            <div className="text-[10px]">
              <span className="text-primary">γ</span> = <span className="font-mono">{SRIL_COEFFICIENTS.gamma}</span>
            </div>
            <div className="text-[10px]">
              <span className="text-primary">δ</span> = <span className="font-mono">{SRIL_COEFFICIENTS.delta}</span>
            </div>
            <div className="text-[10px]">
              <span className="text-primary">η</span> = <span className="font-mono">{SRIL_COEFFICIENTS.eta}</span>
            </div>
          </div>
        </div>

        {/* Input-Felder */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">H (Enthalpie)</label>
            <Input
              value={H}
              onChange={(e) => setH(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="-4.256"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">N (Navigation)</label>
            <Input
              value={N}
              onChange={(e) => setN(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="5.824"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">G (Geometrie)</label>
            <Input
              value={G}
              onChange={(e) => setG(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="1.952"
            />
          </div>
        </div>

        {/* Berechnungs-Buttons */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={calculateBackward}>
            <ArrowLeft className="w-3 h-3" />
            T-1 (Inversion)
          </Button>
          <Button size="sm" className="flex-1 gap-1" onClick={calculateForward}>
            T+1 (Forward)
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Formeln */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-primary/5 border border-primary/20">
            <div className="text-[9px] text-primary mb-1 font-bold">Forward (T→T+1):</div>
            <div className="text-[8px] font-mono text-muted-foreground space-y-0.5">
              <div>H(t+1) = H + α·N − β·G</div>
              <div>N(t+1) = γ·N + δ·|H|</div>
              <div>G(t+1) = G + η·(H' + N')</div>
            </div>
          </div>
          <div className="p-2 rounded bg-secondary/5 border border-secondary/20">
            <div className="text-[9px] text-secondary mb-1 font-bold">Backward (T→T-1):</div>
            <div className="text-[8px] font-mono text-muted-foreground space-y-0.5">
              <div>H(t-1) = (H+N−G/2)/2.5</div>
              <div>N(t-1) = H(t-1) − N</div>
              <div>G(t-1) = (G + H(t-1))/2</div>
            </div>
          </div>
        </div>

        {/* Metriken */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <div className="text-[9px] text-muted-foreground">Energie-Norm</div>
            <div className="text-sm font-mono text-primary">{metrics.energy.toFixed(4)}</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <div className="text-[9px] text-muted-foreground">Chronoplast ∠</div>
            <div className="text-sm font-mono text-secondary">{metrics.chronoplastAngle.toFixed(2)}°</div>
          </div>
          <div className="p-2 rounded bg-background/50 border border-border/30">
            <div className="text-[9px] text-muted-foreground">λ (Lyapunov)</div>
            <div className="text-sm font-mono text-amber-400">{metrics.lyapunov.toFixed(4)}</div>
          </div>
        </div>

        {/* Iterations-Historie */}
        {iterations.length > 0 && (
          <div className="p-2 rounded bg-muted/20 border border-border/20 max-h-32 overflow-y-auto scrollbar-terminal">
            <div className="text-[9px] text-muted-foreground mb-1">Berechnungs-Historie:</div>
            {iterations.map((step, i) => (
              <div key={i} className="text-[8px] font-mono flex items-center gap-2">
                <span className={step.direction === "forward" ? "text-primary" : "text-secondary"}>
                  {step.direction === "forward" ? "→" : "←"}
                </span>
                <span className="text-muted-foreground">t={step.t}:</span>
                <span className="text-primary">H={step.H.toFixed(3)}</span>
                <span className="text-secondary">N={step.N.toFixed(3)}</span>
                <span className="text-amber-400">G={step.G.toFixed(3)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer-Buttons */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={copyResults}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Kopiert!" : "Ergebnisse kopieren"}
          </Button>
        </div>

        {/* Signatur */}
        <div className="text-[8px] text-center text-muted-foreground">
          Validierung: <span className="font-mono text-primary">07e935fa</span> | Bitcoin-Ledger 15.04.2025
        </div>
      </CardContent>
    </Card>
  );
}
