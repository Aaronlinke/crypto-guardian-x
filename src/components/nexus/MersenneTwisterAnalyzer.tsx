import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Play, RotateCcw, Eye, AlertTriangle, Check, 
  Binary, Shuffle, Target, Zap 
} from "lucide-react";
import { 
  untemperMT, 
  temperMT, 
  recoverMTState, 
  predictMT 
} from "@/lib/crypto-advanced";

interface MersenneTwisterAnalyzerProps {
  onLog?: (msg: string) => void;
}

const MersenneTwisterAnalyzer = ({ onLog }: MersenneTwisterAnalyzerProps) => {
  const [outputs, setOutputs] = useState<number[]>([]);
  const [recoveredState, setRecoveredState] = useState<number[] | null>(null);
  const [predictions, setPredictions] = useState<number[]>([]);
  const [actualNext, setActualNext] = useState<number[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showUntemper, setShowUntemper] = useState(false);
  
  const log = useCallback((msg: string) => {
    onLog?.(`[MT19937] ${msg}`);
  }, [onLog]);
  
  // Simulated MT19937 (using Math.random as proxy for demo)
  const generateOutput = useCallback(() => {
    // In real implementation, this would be actual MT19937
    return Math.floor(Math.random() * 0xFFFFFFFF);
  }, []);
  
  const collectOutputs = useCallback(() => {
    setIsCollecting(true);
    setRecoveredState(null);
    setPredictions([]);
    setActualNext([]);
    setOutputs([]);
    
    log("Sammle 624 MT19937 Outputs...");
    
    // Collect 624 outputs
    const collected: number[] = [];
    for (let i = 0; i < 624; i++) {
      collected.push(generateOutput());
    }
    setOutputs(collected);
    
    // Collect 10 more for verification
    const next: number[] = [];
    for (let i = 0; i < 10; i++) {
      next.push(generateOutput());
    }
    setActualNext(next);
    
    log(`624 Outputs gesammelt. Bereit für State Recovery.`);
    setIsCollecting(false);
  }, [generateOutput, log]);
  
  const recoverState = useCallback(() => {
    if (outputs.length < 624) {
      log("Fehler: Benötige 624 Outputs für State Recovery");
      return;
    }
    
    log("Starte State Recovery via Untemper...");
    
    const result = recoverMTState(outputs);
    if (result) {
      setRecoveredState(result.state);
      log(`State erfolgreich rekonstruiert! 624 × 32-bit Werte`);
      
      // Predict next values
      const predicted = predictMT(result, 10);
      setPredictions(predicted);
      log(`10 Vorhersagen generiert`);
    } else {
      log("State Recovery fehlgeschlagen");
    }
  }, [outputs, log]);
  
  const reset = useCallback(() => {
    setOutputs([]);
    setRecoveredState(null);
    setPredictions([]);
    setActualNext([]);
    log("Reset");
  }, [log]);
  
  // Check prediction accuracy
  const accuracy = predictions.length > 0 
    ? predictions.filter((p, i) => p === actualNext[i]).length / predictions.length * 100
    : 0;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            Mersenne Twister State Recovery
          </h3>
          <p className="text-xs text-muted-foreground">
            Rekonstruiere den internen 624×32-bit State aus 624 Outputs
          </p>
        </div>
        <Badge variant="destructive" className="font-mono">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Math.random() ist NICHT sicher!
        </Badge>
      </div>
      
      {/* Warning */}
      <Card className="p-4 bg-destructive/10 border-destructive/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-destructive">Sicherheitswarnung</h4>
            <p className="text-xs text-muted-foreground mt-1">
              MT19937 (verwendet in Math.random()) ist <strong>KEIN</strong> kryptographisch sicherer PRNG. 
              Nach nur 624 Outputs (2.5 KB) kann der komplette interne State rekonstruiert werden, 
              was alle zukünftigen Outputs vorhersagbar macht.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            size="sm"
            disabled={isCollecting}
            onClick={collectOutputs}
          >
            <Binary className="w-4 h-4 mr-1" />
            Sammle 624 Outputs
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            disabled={outputs.length < 624 || recoveredState !== null}
            onClick={recoverState}
          >
            <Eye className="w-4 h-4 mr-1" />
            State Recovery
          </Button>
          
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <div className="flex-1" />
          
          <Badge variant="outline" className="font-mono">
            {outputs.length} / 624 Outputs
          </Badge>
        </div>
        
        <Progress value={(outputs.length / 624) * 100} className="mt-4 h-2" />
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Outputs / State */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono font-semibold flex items-center gap-2">
              <Binary className="w-4 h-4 text-primary" />
              {recoveredState ? 'Recovered State' : 'Collected Outputs'}
            </h4>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowUntemper(!showUntemper)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showUntemper ? 'Tempered' : 'Untempered'}
            </Button>
          </div>
          
          <ScrollArea className="h-64">
            <div className="grid grid-cols-4 gap-1">
              {(recoveredState || outputs).slice(0, 64).map((val, i) => (
                <div 
                  key={i} 
                  className="text-[8px] font-mono p-1 bg-muted/30 rounded text-center"
                >
                  <div className="text-muted-foreground">#{i}</div>
                  <div className={recoveredState ? 'text-green-400' : 'text-primary'}>
                    {(showUntemper && !recoveredState ? untemperMT(val) : val).toString(16).padStart(8, '0').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            {outputs.length > 64 && (
              <div className="text-center text-xs text-muted-foreground py-2">
                ... und {outputs.length - 64} weitere
              </div>
            )}
          </ScrollArea>
        </Card>
        
        {/* Predictions */}
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            Vorhersagen vs Tatsächlich
          </h4>
          
          {predictions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Genauigkeit:</span>
                <Badge variant={accuracy === 100 ? "default" : "destructive"} className="font-mono">
                  {accuracy.toFixed(0)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                {predictions.map((pred, i) => (
                  <div 
                    key={i}
                    className={`flex items-center justify-between text-xs font-mono p-2 rounded ${
                      pred === actualNext[i] ? 'bg-green-500/10 border border-green-500/30' : 'bg-destructive/10 border border-destructive/30'
                    }`}
                  >
                    <span className="text-muted-foreground">#{i + 625}</span>
                    <span className="text-orange-400">
                      {pred.toString(16).padStart(8, '0')}
                    </span>
                    <span className={pred === actualNext[i] ? 'text-green-400' : 'text-destructive'}>
                      {pred === actualNext[i] ? <Check className="w-4 h-4" /> : '✗'}
                    </span>
                    <span className="text-primary">
                      {actualNext[i]?.toString(16).padStart(8, '0') || '?'}
                    </span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                {accuracy === 100 ? (
                  <span className="text-green-400">
                    <Zap className="w-3 h-3 inline mr-1" />
                    State vollständig rekonstruiert - ALLE Outputs vorhersagbar!
                  </span>
                ) : (
                  "Demo verwendet Pseudo-MT19937"
                )}
              </p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              Führe State Recovery durch um Vorhersagen zu generieren
            </div>
          )}
        </Card>
      </div>
      
      {/* Untemper Visualization */}
      <Card className="p-4">
        <h4 className="text-sm font-mono font-semibold mb-3">Untemper Transformation</h4>
        <div className="text-xs font-mono bg-muted/30 p-3 rounded space-y-1">
          <div><span className="text-primary">1.</span> y ^= (y {'>>'} 18)</div>
          <div><span className="text-primary">2.</span> y ^= (y {'<<'} 15) & 0xEFC60000</div>
          <div><span className="text-primary">3.</span> y ^= (y {'<<'} 7) & 0x9D2C5680 <span className="text-muted-foreground">(iterativ 4x)</span></div>
          <div><span className="text-primary">4.</span> y ^= (y {'>>'} 11) ^ (y {'>>'} 22)</div>
          <div className="pt-2 border-t border-border text-muted-foreground">
            Diese Operationen invertieren die Temper-Funktion und rekonstruieren den internen State.
          </div>
        </div>
      </Card>
      
      {/* Secure Alternative */}
      <Card className="p-4 bg-green-500/10 border-green-500/30">
        <h4 className="text-sm font-mono font-semibold text-green-400 mb-2">
          ✓ Sichere Alternative: crypto.getRandomValues()
        </h4>
        <p className="text-xs text-muted-foreground">
          Verwende immer <code className="text-green-400">crypto.getRandomValues()</code> oder 
          <code className="text-green-400">crypto.randomBytes()</code> für kryptographische Zwecke. 
          Diese nutzen das CSPRNG des Betriebssystems und sind nicht vorhersagbar.
        </p>
      </Card>
    </div>
  );
};

export default MersenneTwisterAnalyzer;
