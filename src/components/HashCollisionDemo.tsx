import { useState, useEffect, useRef, useMemo } from "react";
import { ShieldCheck, Play, Pause, RotateCcw, AlertTriangle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

interface HashAttempt {
  input: string;
  hash: string;
}

// Truncated SHA-256 via Web Crypto API
async function sha256Truncated(input: string, bits: number): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Truncate to desired bit length
  const maxVal = Math.pow(2, bits);
  let hashNum = 0;
  for (let i = 0; i < Math.min(4, hashArray.length); i++) {
    hashNum = (hashNum << 8) | hashArray[i];
  }
  hashNum = Math.abs(hashNum) % maxVal;
  return hashNum.toString(16).padStart(Math.ceil(bits / 4), '0');
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
  
  const expectedAttempts = useMemo(() => {
    return Math.floor(1.177 * Math.sqrt(Math.pow(2, hashBits)));
  }, [hashBits]);
  
  const generateRandomInput = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rndBuf = new Uint8Array(8);
    crypto.getRandomValues(rndBuf);
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(rndBuf[i] % chars.length);
    }
    return result;
  };
  
  const runCollisionSearch = async () => {
    if (collisionFound) return;
    
    const batchSize = 100;
    const newAttempts: HashAttempt[] = [];
    const newHashMap = new Map(hashMap);
    
    for (let i = 0; i < batchSize; i++) {
      const input = generateRandomInput();
      const hash = await sha256Truncated(input, hashBits);
      
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
      
      newAttempts.push({ input, hash });
    }
    
    setHashMap(newHashMap);
    setAttempts(prev => [...newAttempts.slice(-5), ...prev].slice(0, 10));
    setTotalAttempts(prev => prev + batchSize);
  };
  
  useEffect(() => {
    if (isRunning && startTime) {
      const timerInterval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(timerInterval);
    }
  }, [isRunning, startTime]);
  
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
  
  const formatNumber = (n: number): string => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  };
  
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}.${Math.floor((ms % 1000) / 100)}s`;
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-primary">[</span>
          HASH-KOLLISIONS-DEMO
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
            Birthday Attack
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <div className="text-[9px] text-amber-400">Erwartete Versuche</div>
            <div className="font-mono text-sm text-amber-300">~{formatNumber(expectedAttempts)}</div>
            <div className="text-[8px] text-muted-foreground">≈ 1.177 × √(2^{hashBits})</div>
          </div>
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <div className="text-[9px] text-blue-400">Aktuelle Versuche</div>
            <div className="font-mono text-sm text-blue-300">{formatNumber(totalAttempts)}</div>
            <div className="text-[8px] text-muted-foreground">{formatTime(elapsedTime)}</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Fortschritt</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" className="flex-1 gap-2" onClick={start} disabled={collisionFound !== null}>
              <Play className="w-3 h-3" />
              {collisionFound ? "Kollision gefunden!" : "Start"}
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
              Nach {formatNumber(totalAttempts)} Versuchen in {formatTime(elapsedTime)}
            </div>
          </div>
        )}
        
        {attempts.length > 0 && !collisionFound && (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground">Letzte Versuche:</div>
            <div className="max-h-24 overflow-y-auto space-y-0.5 font-mono text-[10px]">
              {attempts.map((attempt, idx) => (
                <div key={idx} className="flex justify-between text-muted-foreground">
                  <span>{attempt.input}</span>
                  <span className="text-primary">→ {attempt.hash}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
              <span>Birthday Attack:</span>
              <span className="text-green-300 font-mono">~2¹²⁸ ≈ 10³⁸ Versuche</span>
            </div>
            <div className="flex justify-between">
              <span>Bei 1 Billion/s:</span>
              <span className="text-green-300 font-mono">~10¹⁹ Jahre</span>
            </div>
          </div>
          <div className="text-[9px] text-green-400/70">
            Länger als das Alter des Universums × 10⁹!
          </div>
        </div>
        
        <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Birthday Paradox:</div>
          <div className="font-mono text-[9px] text-primary">
            P(Kollision) ≈ 1 - e^(-n²/2H)
          </div>
          <div className="flex items-center gap-1 text-primary text-[9px] mt-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Verwendet echtes SHA-256 (truncated auf {hashBits} Bit)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
