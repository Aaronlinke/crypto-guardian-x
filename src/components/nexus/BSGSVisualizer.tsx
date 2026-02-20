import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Table, Footprints, Rocket } from "lucide-react";
import { 
  babyStepGiantStep, 
  scalarMult, 
  DEMO_CURVE,
  type ECPoint,
  type BSGSResult
} from "@/lib/crypto-advanced";

interface BSGSVisualizerProps {
  onLog?: (msg: string) => void;
}

const BSGSVisualizer = ({ onLog }: BSGSVisualizerProps) => {
  const [result, setResult] = useState<BSGSResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [targetK, setTargetK] = useState<bigint>(42n);
  const [activePhase, setActivePhase] = useState<'baby' | 'giant' | 'done'>('baby');
  
  const G: ECPoint = { x: DEMO_CURVE.Gx, y: DEMO_CURVE.Gy };
  const [Q, setQ] = useState<ECPoint>(() => scalarMult(targetK, G));
  
  const log = useCallback((msg: string) => {
    onLog?.(`[BSGS] ${msg}`);
  }, [onLog]);
  
  const reset = useCallback(() => {
    setResult(null);
    setActivePhase('baby');
    
    const rndBuf = new Uint32Array(1);
    crypto.getRandomValues(rndBuf);
    const newK = BigInt((rndBuf[0] % 500) + 1);
    setTargetK(newK);
    setQ(scalarMult(newK, G));
    log(`Neues Ziel: Q = ${newK}·G`);
  }, [G, log]);
  
  const runBSGS = useCallback(async () => {
    setIsComputing(true);
    setActivePhase('baby');
    log("Starte Baby-step Giant-step Algorithmus...");
    log(`m = ⌈√n⌉ = ${Math.ceil(Math.sqrt(Number(DEMO_CURVE.n)))}`);
    
    await new Promise(r => setTimeout(r, 500));
    log("Phase 1: Berechne Baby Steps (j·P für j = 0..m)...");
    
    await new Promise(r => setTimeout(r, 1000));
    setActivePhase('giant');
    log("Phase 2: Berechne Giant Steps (Q - i·mP)...");
    
    const bsgsResult = babyStepGiantStep(G, Q, DEMO_CURVE.n);
    setResult(bsgsResult);
    
    await new Promise(r => setTimeout(r, 500));
    setActivePhase('done');
    
    if (bsgsResult.solution !== undefined) {
      log(`LÖSUNG GEFUNDEN: x = ${bsgsResult.solution}`);
      log(`Speicher: ${bsgsResult.tableSize} Einträge | Iterationen: ${bsgsResult.iterations}`);
    } else {
      log("Keine Lösung gefunden");
    }
    
    setIsComputing(false);
  }, [G, Q, log]);
  
  const m = Math.ceil(Math.sqrt(Number(DEMO_CURVE.n)));
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Table className="w-5 h-5 text-primary" />
            Baby-step Giant-step (BSGS)
          </h3>
          <p className="text-xs text-muted-foreground">
            Space-Time Tradeoff: O(√n) Zeit und O(√n) Speicher
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          m = {m} | Speicher: {m} × 48 Bytes
        </Badge>
      </div>
      
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            disabled={isComputing}
            onClick={runBSGS}
          >
            <Play className="w-4 h-4 mr-1" />
            {isComputing ? 'Berechne...' : 'Start BSGS'}
          </Button>
          
          <Button size="sm" variant="outline" onClick={reset} disabled={isComputing}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <div className="flex-1" />
          
          <Badge variant="secondary" className="font-mono">
            Ziel k = {targetK.toString()}
          </Badge>
        </div>
        
        {/* Progress */}
        {isComputing && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Footprints className={`w-4 h-4 ${activePhase === 'baby' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              <span className={activePhase === 'baby' ? 'text-primary' : ''}>Baby Steps</span>
              <Progress value={activePhase === 'baby' ? 50 : 100} className="flex-1 h-2" />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Rocket className={`w-4 h-4 ${activePhase === 'giant' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              <span className={activePhase === 'giant' ? 'text-primary' : ''}>Giant Steps</span>
              <Progress value={activePhase === 'giant' ? 50 : activePhase === 'done' ? 100 : 0} className="flex-1 h-2" />
            </div>
          </div>
        )}
      </Card>
      
      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Baby Steps Table */}
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Footprints className="w-4 h-4 text-green-500" />
            Baby Steps Table
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            j·P für j = 0, 1, ..., m-1
          </p>
          
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {result?.babySteps.slice(0, 50).map((step, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between text-[10px] font-mono p-1 rounded ${
                    result.solution !== undefined && 
                    BigInt(step.index) === result.solution % BigInt(m) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <span className="text-muted-foreground">j={step.index}</span>
                  <span className="text-primary">
                    ({step.point.x.toString()}, {step.point.y.toString()})
                  </span>
                </div>
              ))}
              {(result?.babySteps.length || 0) > 50 && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  ... und {(result?.babySteps.length || 0) - 50} weitere
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Giant Steps */}
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-orange-500" />
            Giant Steps
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Q - i·mP für i = 0, 1, ...
          </p>
          
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {result?.giantSteps.map((step, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between text-[10px] font-mono p-1 rounded ${
                    i === result.giantSteps.length - 1 && result.solution !== undefined
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <span className="text-muted-foreground">i={step.index}</span>
                  <span className="text-orange-400">
                    ({step.point.x.toString()}, {step.point.y.toString()})
                  </span>
                  {i === result.giantSteps.length - 1 && result.solution !== undefined && (
                    <span className="text-green-400">← MATCH!</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
      
      {/* Solution */}
      {result?.solution !== undefined && (
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-mono font-semibold text-green-400">
                🎯 Lösung gefunden!
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                x = i·m + j = {Math.floor(Number(result.solution) / m)}·{m} + {Number(result.solution) % m} = {result.solution.toString()}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="font-mono text-green-400">
                {result.solution === targetK ? '✓ Verifiziert' : '✗ Fehler'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {result.iterations} Operationen | {result.tableSize} Speichereinträge
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Formula Card */}
      <Card className="p-4">
        <h4 className="text-sm font-mono font-semibold mb-3">Algorithmus</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-green-400 mb-1">1. Baby Steps</div>
            <div className="text-muted-foreground">
              Berechne jP für j = 0..m<br/>
              Speichere in Hash-Tabelle
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-orange-400 mb-1">2. Giant Steps</div>
            <div className="text-muted-foreground">
              Berechne Q - imP für i = 0..m<br/>
              Suche in Hash-Tabelle
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-primary mb-1">3. Lösung</div>
            <div className="text-muted-foreground">
              Match bei j: x = im + j<br/>
              Verifiziere: xP = Q
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BSGSVisualizer;
