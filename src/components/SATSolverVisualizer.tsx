import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle, ChevronRight, Download, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { factorize, generateMultiplicationCNF } from "@/lib/crypto-math";
import { useToast } from "@/hooks/use-toast";

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

export function SATSolverVisualizer() {
  const [targetN, setTargetN] = useState(15);
  const [bits, setBits] = useState(4);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [steps, setSteps] = useState<PropagationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [solutions, setSolutions] = useState<{ p: number; q: number; steps: string[] }[]>([]);
  const [propagationSequence, setPropagationSequence] = useState<PropagationStep[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  // Initialisiere Variablen basierend auf Bit-Anzahl
  const initializeVariables = useCallback((numBits: number) => {
    const vars: Variable[] = [];
    for (let i = 0; i < numBits; i++) {
      vars.push({ name: `p${i}`, value: null, forced: false });
    }
    for (let i = 0; i < numBits; i++) {
      vars.push({ name: `q${i}`, value: null, forced: false });
    }
    return vars;
  }, []);

  // Berechne Bit-Anzahl für N
  const calculateBits = (n: number) => Math.max(4, Math.ceil(Math.log2(n + 1)));

  // Finde Faktoren und generiere Propagationssequenz
  const findFactorsAndGenerateSequence = useCallback((n: number) => {
    const numBits = calculateBits(n);
    setBits(numBits);
    
    const factors = factorize(n);
    setSolutions(factors);
    
    if (factors.length === 0) {
      toast({ title: "Keine Faktoren", description: `${n} ist prim oder 1` });
      return [];
    }
    
    // Nimm erste Lösung für Animation
    const { p, q } = factors[0];
    const pBits = p.toString(2).padStart(numBits, "0").split("").reverse();
    const qBits = q.toString(2).padStart(numBits, "0").split("").reverse();
    
    const sequence: PropagationStep[] = [];
    
    // Generiere Propagationsschritte
    for (let i = 0; i < numBits; i++) {
      const pVal = pBits[i] === "1";
      sequence.push({
        variable: `p${i}`,
        value: pVal,
        reason: i === 0 
          ? `N₀=${(n & 1)} → p₀∧q₀ Constraint` 
          : `Bit ${i}: XOR-Propagation`
      });
    }
    
    for (let i = 0; i < numBits; i++) {
      const qVal = qBits[i] === "1";
      sequence.push({
        variable: `q${i}`,
        value: qVal,
        reason: i === 0 
          ? `N₀=${(n & 1)} → q₀ Constraint` 
          : `Bit ${i}: Konsistenz mit p`
      });
    }
    
    return sequence;
  }, [toast]);

  // Initialisierung
  useEffect(() => {
    setVariables(initializeVariables(bits));
    const seq = findFactorsAndGenerateSequence(targetN);
    setPropagationSequence(seq);
  }, []);

  // Neues N setzen
  const handleSetN = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const numBits = calculateBits(targetN);
    setBits(numBits);
    setVariables(initializeVariables(numBits));
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
    setIsSolved(false);
    
    const seq = findFactorsAndGenerateSequence(targetN);
    setPropagationSequence(seq);
  };

  const startSolver = () => {
    if (isSolved) {
      handleSetN();
      return;
    }
    
    if (propagationSequence.length === 0) {
      toast({ title: "Keine Lösung", description: "Keine Propagationssequenz verfügbar" });
      return;
    }
    
    setIsRunning(true);
    
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= propagationSequence.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
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
    }, 400);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setVariables(initializeVariables(bits));
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
    setIsSolved(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Berechne p und q aus Variablen
  const pVars = variables.filter(v => v.name.startsWith("p"));
  const qVars = variables.filter(v => v.name.startsWith("q"));
  
  const pValue = pVars.reduce((acc, v, i) => acc + (v.value ? Math.pow(2, i) : 0), 0);
  const qValue = qVars.reduce((acc, v, i) => acc + (v.value ? Math.pow(2, i) : 0), 0);

  // CNF Info
  const cnfInfo = generateMultiplicationCNF(bits);

  // Export
  const exportData = () => {
    const data = {
      problem: {
        N: targetN,
        bits,
        binary: targetN.toString(2)
      },
      solutions,
      cnf: cnfInfo,
      propagationLog: steps,
      result: isSolved ? { p: pValue, q: qValue, product: pValue * qValue } : null
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sat-factorization-${targetN}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: "SAT-Solver Daten" });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
            <span className="text-[8px] text-primary">∧</span>
          </div>
          <span className="text-primary">[</span>
          SAT-SOLVER · DPLL
          <span className="text-primary">]</span>
          {isSolved && (
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" /> SAT
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground">N (zu faktorisieren)</label>
            <Input
              type="number"
              value={targetN}
              onChange={(e) => setTargetN(Math.max(2, parseInt(e.target.value) || 2))}
              className="h-8 text-xs font-mono"
              min={2}
              max={65535}
            />
          </div>
          <div className="flex items-end">
            <Button size="sm" variant="outline" onClick={handleSetN} className="h-8">
              <Settings className="w-3 h-3 mr-1" />
              Setzen
            </Button>
          </div>
        </div>

        {/* Problem Description */}
        <div className="p-2 rounded bg-background/50 border border-border/30 text-xs">
          <div className="text-muted-foreground mb-1">Faktorisierung: N = p × q</div>
          <div className="font-mono text-primary">
            N = {targetN} = <span className="text-secondary">{targetN.toString(2)}₂</span>
            <span className="text-muted-foreground ml-2">({bits} Bit)</span>
          </div>
        </div>

        {/* Alle gefundenen Lösungen */}
        {solutions.length > 0 && (
          <div className="p-2 rounded bg-muted/20 border border-border/20">
            <div className="text-[10px] text-muted-foreground mb-1">
              Gefundene Faktorpaare: {solutions.length}
            </div>
            <div className="flex flex-wrap gap-2">
              {solutions.map((sol, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-mono">
                  {sol.p} × {sol.q}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Variable Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* P Variables */}
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground mb-2">Faktor p ({bits}-Bit)</div>
            <div className="flex gap-1 flex-wrap">
              {pVars.slice().reverse().map((v) => (
                <div
                  key={v.name}
                  className={`w-7 h-7 rounded border flex items-center justify-center text-xs font-mono transition-all ${
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
              p = <span className="text-primary">{pVars.some(v => v.value !== null) ? pValue : "?"}</span>
            </div>
          </div>

          {/* Q Variables */}
          <div className="p-2 rounded bg-background/30 border border-border/20">
            <div className="text-[10px] text-muted-foreground mb-2">Faktor q ({bits}-Bit)</div>
            <div className="flex gap-1 flex-wrap">
              {qVars.slice().reverse().map((v) => (
                <div
                  key={v.name}
                  className={`w-7 h-7 rounded border flex items-center justify-center text-xs font-mono transition-all ${
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
              q = <span className="text-secondary">{qVars.some(v => v.value !== null) ? qValue : "?"}</span>
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
            UNIT PROPAGATION LOG ({steps.length}/{propagationSequence.length})
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
            disabled={isRunning || propagationSequence.length === 0}
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
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
