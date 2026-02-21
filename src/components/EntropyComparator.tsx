import { useState, useEffect, useMemo } from "react";
import { BarChart3, Play, RotateCcw, AlertTriangle, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RNGSource {
  name: string;
  description: string;
  generator: () => number[];
  quality: "good" | "weak" | "bad";
}

interface AnalysisResult {
  source: string;
  samples: number[];
  shannonEntropy: number;
  chiSquare: number;
  monobitTest: boolean;
  runsTest: boolean;
  quality: "good" | "weak" | "bad";
  verdict: string;
}

export function EntropyComparator() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sampleSize, setSampleSize] = useState(256);

  // Verschiedene RNG-Quellen
  const rngSources: RNGSource[] = useMemo(() => [
    {
      name: "crypto.getRandomValues",
      description: "Browser CSPRNG (kryptographisch sicher)",
      quality: "good",
      generator: () => {
        const arr = new Uint8Array(sampleSize);
        crypto.getRandomValues(arr);
        return Array.from(arr);
      }
    },
    {
      name: "Math.random()",
      description: "JavaScript PRNG (Mersenne Twister variant)",
      quality: "weak",
      generator: () => {
        return Array.from({ length: sampleSize }, () => Math.floor(Math.random() * 256));
      }
    },
    {
      name: "Zeit-Seed LCG",
      description: "Linear Congruential Generator mit Zeitstempel",
      quality: "bad",
      generator: () => {
        // Simpler LCG mit Zeit-Seed (UNSICHER!)
        let seed = Date.now() % 2147483647;
        const a = 1103515245;
        const c = 12345;
        const m = 2147483648;
        
        return Array.from({ length: sampleSize }, () => {
          seed = (a * seed + c) % m;
          return (seed >> 16) & 0xFF;
        });
      }
    },
    {
      name: "PID-basiert (Debian Bug)",
      description: "Simulation des Debian OpenSSL Bugs (2006-2008)",
      quality: "bad",
      generator: () => {
        // Reproduziert den Debian-Bug: RNG wurde nur mit PID geseeded (max 32768 Möglichkeiten)
        const pidBuf = new Uint16Array(1);
        crypto.getRandomValues(pidBuf);
        const pid = pidBuf[0] % 32768;
        const hash = pid.toString();
        
        return Array.from({ length: sampleSize }, (_, i) => {
          // Pseudo-Hash basierend auf PID
          const val = (pid * (i + 1) * 7) % 256;
          return val;
        });
      }
    },
    {
      name: "Konstante XOR",
      description: "Deterministisches Muster (extrem unsicher)",
      quality: "bad",
      generator: () => {
        const pattern = 0xAB;
        return Array.from({ length: sampleSize }, (_, i) => (i ^ pattern) % 256);
      }
    }
  ], [sampleSize]);

  // Shannon-Entropie berechnen
  const calculateShannonEntropy = (data: number[]): number => {
    const freq = new Map<number, number>();
    data.forEach(byte => freq.set(byte, (freq.get(byte) || 0) + 1));
    
    let entropy = 0;
    freq.forEach(count => {
      const p = count / data.length;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    
    return entropy;
  };

  // Chi-Quadrat-Test
  const calculateChiSquare = (data: number[]): number => {
    const expected = data.length / 256;
    const freq = new Array(256).fill(0);
    data.forEach(byte => freq[byte]++);
    
    let chiSquare = 0;
    freq.forEach(observed => {
      chiSquare += Math.pow(observed - expected, 2) / expected;
    });
    
    return chiSquare;
  };

  // Monobit-Test (NIST SP 800-22)
  const monobitTest = (data: number[]): boolean => {
    let ones = 0;
    data.forEach(byte => {
      for (let i = 0; i < 8; i++) {
        if ((byte >> i) & 1) ones++;
      }
    });
    
    const totalBits = data.length * 8;
    const s = Math.abs(ones - totalBits / 2) / Math.sqrt(totalBits / 2);
    
    // P-value > 0.01 gilt als bestanden
    return s < 2.576; // 99% Konfidenz
  };

  // Runs-Test
  const runsTest = (data: number[]): boolean => {
    const bits: number[] = [];
    data.forEach(byte => {
      for (let i = 7; i >= 0; i--) {
        bits.push((byte >> i) & 1);
      }
    });
    
    const ones = bits.filter(b => b === 1).length;
    const n = bits.length;
    const pi = ones / n;
    
    // Tau-Test
    if (Math.abs(pi - 0.5) >= 2 / Math.sqrt(n)) {
      return false;
    }
    
    // Runs zählen
    let runs = 1;
    for (let i = 1; i < bits.length; i++) {
      if (bits[i] !== bits[i - 1]) runs++;
    }
    
    const expectedRuns = 2 * n * pi * (1 - pi);
    const variance = 2 * Math.sqrt(2 * n) * pi * (1 - pi);
    
    if (variance === 0) return false;
    
    const z = Math.abs(runs - expectedRuns) / variance;
    return z < 2.576;
  };

  // Analyse durchführen
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setResults([]);
    
    setTimeout(() => {
      const newResults: AnalysisResult[] = rngSources.map(source => {
        const samples = source.generator();
        const shannon = calculateShannonEntropy(samples);
        const chi = calculateChiSquare(samples);
        const mono = monobitTest(samples);
        const runs = runsTest(samples);
        
        // Bewertung
        let verdict = "";
        if (shannon >= 7.5 && mono && runs && chi < 300) {
          verdict = "Kryptographisch geeignet";
        } else if (shannon >= 6 && (mono || runs)) {
          verdict = "Schwach - nur für nicht-kritische Anwendungen";
        } else {
          verdict = "UNSICHER - niemals für Kryptographie verwenden!";
        }
        
        return {
          source: source.name,
          samples,
          shannonEntropy: shannon,
          chiSquare: chi,
          monobitTest: mono,
          runsTest: runs,
          quality: source.quality,
          verdict
        };
      });
      
      setResults(newResults);
      setIsAnalyzing(false);
    }, 500);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "good": return "text-primary bg-primary/10 border-primary/30";
      case "weak": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
      case "bad": return "text-destructive bg-destructive/10 border-destructive/30";
      default: return "";
    }
  };

  const getEntropyColor = (entropy: number) => {
    if (entropy >= 7.5) return "text-primary";
    if (entropy >= 6) return "text-amber-400";
    return "text-destructive";
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          RNG QUALITÄTS-VERGLEICH
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-secondary/10 text-secondary border-secondary/30">
            NIST SP 800-22
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Erklärung */}
        <div className="p-2 rounded bg-muted/20 border border-border/20">
          <div className="text-[10px] text-muted-foreground">
            Vergleicht verschiedene Zufallszahlengeneratoren anhand statistischer Tests.
            Zeigt, warum sichere RNGs für Kryptographie essentiell sind.
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 gap-2" 
            onClick={runAnalysis} 
            disabled={isAnalyzing}
          >
            <Play className="w-3 h-3" />
            {isAnalyzing ? "Analysiere..." : "Analyse starten"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setResults([])}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Ergebnisse */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded border ${getQualityColor(result.quality)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold">{result.source}</span>
                  <Badge variant="outline" className={`text-[9px] ${getQualityColor(result.quality)}`}>
                    {result.quality.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Entropie-Balken */}
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-muted-foreground">Shannon Entropie</span>
                    <span className={getEntropyColor(result.shannonEntropy)}>
                      {result.shannonEntropy.toFixed(4)} / 8.0 bits
                    </span>
                  </div>
                  <Progress 
                    value={(result.shannonEntropy / 8) * 100} 
                    className="h-2"
                  />
                </div>
                
                {/* Tests */}
                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  <div className="flex items-center gap-1">
                    {result.monobitTest ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-destructive" />
                    )}
                    <span>Monobit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {result.runsTest ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-destructive" />
                    )}
                    <span>Runs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {result.chiSquare < 300 ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-destructive" />
                    )}
                    <span>χ²={result.chiSquare.toFixed(0)}</span>
                  </div>
                </div>
                
                {/* Verdict */}
                <div className="mt-2 pt-2 border-t border-current/20">
                  <div className="text-[9px] font-mono">{result.verdict}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Erklärung der Tests */}
        <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-2">
          <div className="text-[10px] font-bold text-muted-foreground">Statistische Tests:</div>
          <div className="text-[9px] text-muted-foreground space-y-1">
            <div><strong>Shannon H:</strong> Maß für Informationsgehalt (ideal: 8 bits/byte)</div>
            <div><strong>Monobit:</strong> Gleichverteilung von 0en und 1en</div>
            <div><strong>Runs:</strong> Keine Muster in Bitfolgen</div>
            <div><strong>Chi²:</strong> Statistische Gleichverteilung aller Bytewerte</div>
          </div>
        </div>

        {/* Warnung */}
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-amber-300/80">
            <strong>Bildungszweck:</strong> Zeigt, warum der Debian OpenSSL Bug (2006-2008) 
            so kritisch war - der RNG war vorhersagbar und ermöglichte Key-Rekonstruktion.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
