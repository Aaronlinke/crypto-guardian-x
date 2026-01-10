import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Play, Pause, RotateCcw, AlertTriangle, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

interface HashAttempt {
  input: string;
  hash: string;
  timestamp: number;
}

// Simples Hash für Demo (nicht kryptographisch!)
function simpleHash(input: string, bits: number): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Reduziere auf gewünschte Bits
  const maxVal = Math.pow(2, bits);
  hash = Math.abs(hash) % maxVal;
  return hash.toString(16).padStart(Math.ceil(bits / 4), '0');
}

// SHA-256 (echtes kryptographisches Hashing)
async function sha256Hex(input: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function HashCollisionDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [hashBits, setHashBits] = useState(16);
  const [attempts, setAttempts] = useState<HashAttempt[]>([]);
  const [collisionFound, setCollisionFound] = useState<{ input1: string; input2: string; hash: string } | null>(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [hashMap, setHashMap] = useState<Map<string, string>>(new Map());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Theoretische Kollisionswahrscheinlichkeit (Birthday Problem)
  const expectedAttempts = useMemo(() => {
    // Für n Bits: ~1.177 * sqrt(2^n)
    return Math.floor(1.177 * Math.sqrt(Math.pow(2, hashBits)));
  }, [hashBits]);
  
  // SHA-256 Vergleich
  const sha256ExpectedAttempts = useMemo(() => {
    // 2^128 für SHA-256 (256/2 bits für Birthday Attack)
    return Math.pow(2, 128);
  }, []);
  
  const generateRandomInput = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const runCollisionSearch = () => {
    if (collisionFound) return;
    
    const batchSize = 100;
    const newAttempts: HashAttempt[] = [];
    const newHashMap = new Map(hashMap);
    
    for (let i = 0; i < batchSize; i++) {
      const input = generateRandomInput();
      const hash = simpleHash(input, hashBits);
      const timestamp = Date.now();
      
      // Check for collision
      if (newHashMap.has(hash)) {
        const existingInput = newHashMap.get(hash)!;
        if (existingInput !== input) {
          setCollisionFound({ input1: existingInput, input2: input, hash });
          setIsRunning(false);
          return;
        }
      } else {
        newHashMap.set(hash, input);
      }
      
      newAttempts.push({ input, hash, timestamp });
    }
    
    setHashMap(newHashMap);
    setAttempts(prev => [...newAttempts.slice(-5), ...prev].slice(0, 10));
    setTotalAttempts(prev => prev + batchSize);
  };
  
  // Timer
  useEffect(() => {
    if (isRunning && startTime) {
      const timerInterval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(timerInterval);
    }
  }, [isRunning, startTime]);
  
  // Main search loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(runCollisionSearch, 50);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isRunning, hashBits, hashMap, collisionFound]);
  
  const start = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };
  
  const pause = () => {
    setIsRunning(false);
  };
  
  const reset = () => {
    setIsRunning(false);
    setAttempts([]);
    setCollisionFound(null);
    setTotalAttempts(0);
    setHashMap(new Map());
    setStartTime(null);
    setElapsedTime(0);
  };
  
  const progress = Math.min(100, (totalAttempts / expectedAttempts) * 100);
  
  // Format large numbers
  const formatNumber = (n: number): string => {
    if (n >= 1e78) return `~10⁷⁸`;
    if (n >= 1e38) return `~2¹²⁸`;
    if (n >= 1e15) return n.toExponential(2);
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  };
  
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}.${Math.floor((ms % 1000) / 100)}s`;
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-primary">[</span>
          HASH-KOLLISIONS-DEMONSTRATOR
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
            Birthday Attack
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hash Bits Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Hash-Größe: {hashBits} Bits</span>
            <span>Mögliche Werte: 2^{hashBits} = {formatNumber(Math.pow(2, hashBits))}</span>
          </div>
          <Slider
            value={[hashBits]}
            onValueChange={([v]) => {
              if (!isRunning) {
                setHashBits(v);
                reset();
              }
            }}
            min={8}
            max={32}
            step={1}
            disabled={isRunning}
          />
        </div>
        
        {/* Expected vs Actual */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <div className="text-[9px] text-amber-400">Erwartete Versuche (Birthday)</div>
            <div className="font-mono text-sm text-amber-300">~{formatNumber(expectedAttempts)}</div>
            <div className="text-[8px] text-muted-foreground">≈ 1.177 × √(2^{hashBits})</div>
          </div>
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <div className="text-[9px] text-blue-400">Aktuelle Versuche</div>
            <div className="font-mono text-sm text-blue-300">{formatNumber(totalAttempts)}</div>
            <div className="text-[8px] text-muted-foreground">{formatTime(elapsedTime)}</div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Fortschritt zur erwarteten Kollision</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" className="flex-1 gap-2" onClick={start} disabled={collisionFound !== null}>
              <Play className="w-3 h-3" />
              {collisionFound ? "Kollision gefunden!" : "Start Suche"}
            </Button>
          ) : (
            <Button size="sm" className="flex-1 gap-2" variant="secondary" onClick={pause}>
              <Pause className="w-3 h-3" />
              Pause
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Collision Found */}
        {collisionFound && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
              <Zap className="w-4 h-4" />
              KOLLISION GEFUNDEN!
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex gap-2">
                <span className="text-muted-foreground">Input 1:</span>
                <span className="text-primary">{collisionFound.input1}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Input 2:</span>
                <span className="text-secondary">{collisionFound.input2}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Hash:</span>
                <span className="text-red-400">{collisionFound.hash}</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Gefunden nach {formatNumber(totalAttempts)} Versuchen in {formatTime(elapsedTime)}
            </div>
          </div>
        )}
        
        {/* Recent Attempts */}
        {attempts.length > 0 && !collisionFound && (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground">Letzte Versuche:</div>
            <div className="max-h-32 overflow-y-auto space-y-0.5 font-mono text-[10px]">
              {attempts.map((attempt, idx) => (
                <div key={idx} className="flex justify-between text-muted-foreground">
                  <span>{attempt.input}</span>
                  <span className="text-primary">→ {attempt.hash}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* SHA-256 Comparison */}
        <div className="p-3 rounded bg-green-500/10 border border-green-500/20 space-y-2">
          <div className="flex items-center gap-2 text-green-400 font-medium text-xs">
            <ShieldCheck className="w-4 h-4" />
            SHA-256 Kollisionsresistenz
          </div>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Hash-Größe:</span>
              <span className="text-green-300 font-mono">256 Bits</span>
            </div>
            <div className="flex justify-between">
              <span>Birthday Attack Versuche:</span>
              <span className="text-green-300 font-mono">~2¹²⁸ ≈ 10³⁸</span>
            </div>
            <div className="flex justify-between">
              <span>Bei 1 Billion/s:</span>
              <span className="text-green-300 font-mono">~10¹⁹ Jahre</span>
            </div>
          </div>
          <div className="text-[9px] text-green-400/70 mt-2">
            Das ist länger als das Alter des Universums (13.8 × 10⁹ Jahre) × 10⁹!
          </div>
        </div>
        
        {/* Math Explanation */}
        <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-2">
          <div className="text-[10px] font-medium text-muted-foreground">Birthday Paradox:</div>
          <div className="font-mono text-[9px] text-primary">
            P(Kollision) ≈ 1 - e^(-n²/2H)
          </div>
          <div className="text-[9px] text-muted-foreground">
            Bei n Versuchen und H möglichen Hashwerten. 50% Wahrscheinlichkeit bei n ≈ 1.177 × √H
          </div>
          <div className="mt-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
            <div className="flex items-center gap-1 text-amber-400 text-[9px]">
              <AlertTriangle className="w-3 h-3" />
              <span>Demo verwendet vereinfachtes Hashing!</span>
            </div>
            <div className="text-[8px] text-muted-foreground mt-1">
              SHA-256 ist in der Praxis kollisionsresistent.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function useMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const [value, setValue] = useState<T>(factory);
  
  useEffect(() => {
    setValue(factory());
  }, deps);
  
  return value;
}
