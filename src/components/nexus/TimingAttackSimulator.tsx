import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, RotateCcw, Clock, Shield, AlertTriangle, 
  BarChart3, Lock, Eye 
} from "lucide-react";
import { 
  simulateTimingAttack, 
  montgomeryLadderTiming,
  type TimingMeasurement 
} from "@/lib/crypto-advanced";

interface TimingAttackSimulatorProps {
  onLog?: (msg: string) => void;
}

const TimingAttackSimulator = ({ onLog }: TimingAttackSimulatorProps) => {
  const [secretKey, setSecretKey] = useState("0xDEADBEEF");
  const [squareMultiply, setSquareMultiply] = useState<TimingMeasurement[]>([]);
  const [montgomery, setMontgomery] = useState<TimingMeasurement[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [recoveredBits, setRecoveredBits] = useState<string>("");
  
  const log = useCallback((msg: string) => {
    onLog?.(`[TIMING] ${msg}`);
  }, [onLog]);
  
  const runSimulation = useCallback(() => {
    const keyBigInt = BigInt(secretKey.startsWith('0x') ? secretKey : '0x' + secretKey);
    const bits = 32;
    
    log(`Simuliere Timing-Angriff auf ${bits}-bit Exponent...`);
    
    const sqm = simulateTimingAttack(keyBigInt, bits);
    const mont = montgomeryLadderTiming(keyBigInt, bits);
    
    setSquareMultiply(sqm);
    setMontgomery(mont);
    
    // "Recover" bits based on timing (simplified)
    const recovered = sqm.map(m => m.totalTime > 200 ? '1' : '0').join('');
    setRecoveredBits(recovered);
    
    log(`Square-and-Multiply: Timing-Varianz detektiert`);
    log(`Montgomery Ladder: Konstante Zeit (keine Leaks)`);
  }, [secretKey, log]);
  
  const reset = useCallback(() => {
    setSquareMultiply([]);
    setMontgomery([]);
    setRecoveredBits("");
    log("Reset");
  }, [log]);
  
  // Calculate timing statistics
  const sqmStats = useMemo(() => {
    if (squareMultiply.length === 0) return null;
    const times = squareMultiply.map(m => m.totalTime);
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      variance: Math.max(...times) - Math.min(...times)
    };
  }, [squareMultiply]);
  
  const montStats = useMemo(() => {
    if (montgomery.length === 0) return null;
    const times = montgomery.map(m => m.totalTime);
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      variance: Math.max(...times) - Math.min(...times)
    };
  }, [montgomery]);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Timing Attack Simulator
          </h3>
          <p className="text-xs text-muted-foreground">
            Visualisierung von Timing Side-Channels bei modularer Exponentiation
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          Square-and-Multiply vs Montgomery Ladder
        </Badge>
      </div>
      
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Secret Key:</span>
            <Input
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-40 font-mono text-xs"
              placeholder="0xDEADBEEF"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSecret(!showSecret)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          
          <Button size="sm" onClick={runSimulation}>
            <Play className="w-4 h-4 mr-1" />
            Simulate
          </Button>
          
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        
        {showSecret && (
          <div className="mt-2 text-xs font-mono text-muted-foreground">
            Binary: {BigInt(secretKey.startsWith('0x') ? secretKey : '0x' + secretKey).toString(2).padStart(32, '0')}
          </div>
        )}
      </Card>
      
      {/* Timing Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Square-and-Multiply (Vulnerable) */}
        <Card className="p-4 border-destructive/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Square-and-Multiply
            </h4>
            <Badge variant="destructive">VULNERABLE</Badge>
          </div>
          
          {sqmStats && (
            <div className="flex gap-4 text-xs font-mono mb-3">
              <span>Min: {sqmStats.min.toFixed(1)}μs</span>
              <span>Max: {sqmStats.max.toFixed(1)}μs</span>
              <span className="text-destructive">Δ: {sqmStats.variance.toFixed(1)}μs</span>
            </div>
          )}
          
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {squareMultiply.map((m, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 text-[10px] font-mono"
                >
                  <span className="text-muted-foreground w-8">b{m.bit}</span>
                  <div className="flex-1 relative h-4 bg-muted/30 rounded overflow-hidden">
                    <div 
                      className="absolute h-full bg-blue-500/50"
                      style={{ width: `${(m.squareTime / 300) * 100}%` }}
                    />
                    {m.multiplyTime > 0 && (
                      <div 
                        className="absolute h-full bg-orange-500/50"
                        style={{ 
                          left: `${(m.squareTime / 300) * 100}%`,
                          width: `${(m.multiplyTime / 300) * 100}%` 
                        }}
                      />
                    )}
                  </div>
                  <span className={m.bitValue === 1 ? 'text-orange-400' : 'text-blue-400'}>
                    {m.totalTime.toFixed(0)}μs
                  </span>
                  <span className="w-4 text-center">
                    {m.bitValue}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500/50 rounded" />
                <span className="text-muted-foreground">Square</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500/50 rounded" />
                <span className="text-muted-foreground">Multiply (wenn bit=1)</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Montgomery Ladder (Secure) */}
        <Card className="p-4 border-green-500/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-mono font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Montgomery Ladder
            </h4>
            <Badge variant="outline" className="text-green-400 border-green-400">SECURE</Badge>
          </div>
          
          {montStats && (
            <div className="flex gap-4 text-xs font-mono mb-3">
              <span>Min: {montStats.min.toFixed(1)}μs</span>
              <span>Max: {montStats.max.toFixed(1)}μs</span>
              <span className="text-green-400">Δ: {montStats.variance.toFixed(1)}μs</span>
            </div>
          )}
          
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {montgomery.map((m, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 text-[10px] font-mono"
                >
                  <span className="text-muted-foreground w-8">b{m.bit}</span>
                  <div className="flex-1 relative h-4 bg-muted/30 rounded overflow-hidden">
                    <div 
                      className="absolute h-full bg-green-500/50"
                      style={{ width: `${(m.totalTime / 300) * 100}%` }}
                    />
                  </div>
                  <span className="text-green-400">
                    {m.totalTime.toFixed(0)}μs
                  </span>
                  <span className="w-4 text-center text-muted-foreground">
                    ?
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Konstante Zeit unabhängig vom Bit-Wert. Kein Timing-Leak möglich.
            </p>
          </div>
        </Card>
      </div>
      
      {/* Attack Result */}
      {recoveredBits && (
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Timing-Analyse Ergebnis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-destructive/10 p-3 rounded border border-destructive/30">
              <div className="text-xs text-muted-foreground mb-1">Aus Timing extrahiert:</div>
              <div className="font-mono text-xs text-destructive break-all">
                {recoveredBits}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                = 0x{parseInt(recoveredBits, 2).toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            
            {showSecret && (
              <div className="bg-muted/30 p-3 rounded">
                <div className="text-xs text-muted-foreground mb-1">Tatsächlicher Schlüssel:</div>
                <div className="font-mono text-xs text-primary break-all">
                  {BigInt(secretKey.startsWith('0x') ? secretKey : '0x' + secretKey).toString(2).padStart(32, '0')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  = {secretKey}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Info */}
      <Card className="p-4">
        <h4 className="text-sm font-mono font-semibold mb-3">Timing Attack Grundlagen</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="font-semibold text-destructive">Square-and-Multiply (unsicher)</div>
            <div className="font-mono bg-muted/30 p-2 rounded">
              for each bit b in exponent:<br/>
              &nbsp;&nbsp;result = result²<br/>
              &nbsp;&nbsp;if b == 1: <span className="text-orange-400">// Timing leak!</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;result = result × base
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-green-400">Montgomery Ladder (sicher)</div>
            <div className="font-mono bg-muted/30 p-2 rounded">
              for each bit b in exponent:<br/>
              &nbsp;&nbsp;if b == 0:<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;R1 = R0 × R1; R0 = R0²<br/>
              &nbsp;&nbsp;else:<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;R0 = R0 × R1; R1 = R1²
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          <strong>Real-World Attacks:</strong> Minerva (2019), LadderLeak (2020), Hertzbleed (2022)
        </p>
      </Card>
    </div>
  );
};

export default TimingAttackSimulator;
