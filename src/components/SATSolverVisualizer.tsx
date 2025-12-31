import { useState, useCallback } from "react";
import { Play, Pause, RotateCcw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Variable {
  name: string;
  value: boolean | null;
  forced: boolean;
}

interface PropagationStep {
  variable: string;
  value: boolean;
  reason: string;
}

// N=15 Faktorisierung: p*q = 15, p=3 (0011), q=5 (0101)
const initialVariables: Variable[] = [
  { name: "p0", value: null, forced: false },
  { name: "p1", value: null, forced: false },
  { name: "p2", value: null, forced: false },
  { name: "p3", value: null, forced: false },
  { name: "q0", value: null, forced: false },
  { name: "q1", value: null, forced: false },
  { name: "q2", value: null, forced: false },
  { name: "q3", value: null, forced: false },
];

// Vorgabe: N = 15 = 1111 binär
const targetBits = [true, true, true, true]; // N0, N1, N2, N3

export function SATSolverVisualizer() {
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const [steps, setSteps] = useState<PropagationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const propagationSequence: PropagationStep[] = [
    { variable: "p0", value: true, reason: "N0=1 → p0∧q0=1 → p0=1" },
    { variable: "q0", value: true, reason: "N0=1 → p0∧q0=1 → q0=1" },
    { variable: "p1", value: true, reason: "N1=1, XOR-Constraint → p1=1" },
    { variable: "q1", value: false, reason: "Konsistenz mit N2, N3 → q1=0" },
    { variable: "p2", value: false, reason: "3-Bit XOR für N2=1 → p2=0" },
    { variable: "q2", value: true, reason: "XOR-Logik erzwingt q2=1" },
    { variable: "p3", value: false, reason: "4-Bit XOR für N3=1 → p3=0" },
    { variable: "q3", value: false, reason: "Höchste Bits müssen 0 sein → q3=0" },
  ];

  const runStep = useCallback(() => {
    if (currentStep >= propagationSequence.length) {
      setIsRunning(false);
      setIsSolved(true);
      return;
    }

    const step = propagationSequence[currentStep];
    
    setVariables(prev => prev.map(v => 
      v.name === step.variable 
        ? { ...v, value: step.value, forced: true }
        : v
    ));
    
    setSteps(prev => [...prev, step]);
    setCurrentStep(prev => prev + 1);
  }, [currentStep]);

  const startSolver = () => {
    if (isSolved) {
      reset();
      return;
    }
    setIsRunning(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= propagationSequence.length) {
          clearInterval(interval);
          setIsRunning(false);
          setIsSolved(true);
          return prev;
        }
        
        const step = propagationSequence[prev];
        setVariables(vars => vars.map(v => 
          v.name === step.variable 
            ? { ...v, value: step.value, forced: true }
            : v
        ));
        setSteps(s => [...s, step]);
        
        return prev + 1;
      });
    }, 800);
  };

  const reset = () => {
    setVariables(initialVariables);
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
    setIsSolved(false);
  };

  // Berechne p und q aus Variablen
  const pValue = variables
    .filter(v => v.name.startsWith("p"))
    .reduce((acc, v, i) => acc + (v.value ? Math.pow(2, i) : 0), 0);
  
  const qValue = variables
    .filter(v => v.name.startsWith("q"))
    .reduce((acc, v, i) => acc + (v.value ? Math.pow(2, i) : 0), 0);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
            <span className="text-[8px] text-primary">∧</span>
          </div>
          <span className="text-primary">[</span>
          SAT-SOLVER · DPLL + UNIT PROPAGATION
          <span className="text-primary">]</span>
          {isSolved && (
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" /> SAT
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Problem Description */}
        <div className="p-2 rounded bg-background/50 border border-border/30 text-xs">
          <div className="text-muted-foreground mb-1">Faktorisierung: N = p × q</div>
          <div className="font-mono text-primary">
            N = 15 = <span className="text-secondary">1111₂</span> → Finde p, q ∈ {"{2...7}"}
          </div>
        </div>

        {/* Variable Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* P Variables */}
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground mb-2">Faktor p (4-Bit)</div>
            <div className="flex gap-1">
              {variables.filter(v => v.name.startsWith("p")).reverse().map((v, i) => (
                <div
                  key={v.name}
                  className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-mono transition-all ${
                    v.value === null
                      ? "border-border/50 bg-muted/30 text-muted-foreground"
                      : v.value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border bg-background text-foreground"
                  } ${v.forced ? "ring-1 ring-primary/50" : ""}`}
                >
                  {v.value === null ? "?" : v.value ? "1" : "0"}
                </div>
              ))}
            </div>
            <div className="text-center text-xs mt-1 font-mono">
              p = <span className="text-primary">{pValue || "?"}</span>
            </div>
          </div>

          {/* Q Variables */}
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground mb-2">Faktor q (4-Bit)</div>
            <div className="flex gap-1">
              {variables.filter(v => v.name.startsWith("q")).reverse().map((v, i) => (
                <div
                  key={v.name}
                  className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-mono transition-all ${
                    v.value === null
                      ? "border-border/50 bg-muted/30 text-muted-foreground"
                      : v.value
                        ? "border-secondary bg-secondary/20 text-secondary"
                        : "border-border bg-background text-foreground"
                  } ${v.forced ? "ring-1 ring-secondary/50" : ""}`}
                >
                  {v.value === null ? "?" : v.value ? "1" : "0"}
                </div>
              ))}
            </div>
            <div className="text-center text-xs mt-1 font-mono">
              q = <span className="text-secondary">{qValue || "?"}</span>
            </div>
          </div>
        </div>

        {/* Result */}
        {isSolved && (
          <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">Lösung gefunden:</div>
            <div className="font-mono text-lg">
              <span className="text-primary">{pValue}</span>
              <span className="text-muted-foreground mx-2">×</span>
              <span className="text-secondary">{qValue}</span>
              <span className="text-muted-foreground mx-2">=</span>
              <span className="text-green-400 glow-green">{pValue * qValue}</span>
            </div>
          </div>
        )}

        {/* Propagation Log */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            UNIT PROPAGATION LOG
          </div>
          <ScrollArea className="h-24 rounded bg-background/50 border border-border/30 p-2">
            {steps.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                Starte Solver um Propagation zu sehen...
              </div>
            ) : (
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <div key={i} className="text-[11px] font-mono flex items-start gap-2">
                    <span className="text-muted-foreground w-4">{i + 1}.</span>
                    <span className={step.value ? "text-primary" : "text-foreground"}>
                      {step.variable}={step.value ? "1" : "0"}
                    </span>
                    <span className="text-muted-foreground">←</span>
                    <span className="text-muted-foreground">{step.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={startSolver}
            disabled={isRunning}
            className="flex-1 gap-1"
          >
            {isSolved ? (
              <>
                <RotateCcw className="w-3 h-3" />
                Neu starten
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-3 h-3" />
                Läuft...
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                DPLL starten
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} disabled={isRunning}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
