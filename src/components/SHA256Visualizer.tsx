import { useState, useMemo } from "react";
import { Hash, Play, ChevronRight, ChevronLeft, Copy, Check, Download, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { sha256Steps, SHA256_K, SHA256_H, type SHA256Step } from "@/lib/crypto-math";
import { useToast } from "@/hooks/use-toast";

export function SHA256Visualizer() {
  const [input, setInput] = useState("Bitcoin");
  const [currentRound, setCurrentRound] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const result = useMemo(() => sha256Steps(input || ""), [input]);
  
  const currentStep = result.steps[currentRound] || result.steps[0];
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Kopiert", description: `${field} in Zwischenablage` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const exportFullData = () => {
    const data = {
      input,
      paddedMessage: Array.from(result.paddedMessage).map(b => b.toString(16).padStart(2, "0")).join(""),
      messageSchedule: result.messageSchedule.map(w => w.toString(16).padStart(8, "0")),
      steps: result.steps.map(s => ({
        round: s.round,
        W: s.W.toString(16).padStart(8, "0"),
        K: s.K.toString(16).padStart(8, "0"),
        state: {
          a: s.a.toString(16).padStart(8, "0"),
          b: s.b.toString(16).padStart(8, "0"),
          c: s.c.toString(16).padStart(8, "0"),
          d: s.d.toString(16).padStart(8, "0"),
          e: s.e.toString(16).padStart(8, "0"),
          f: s.f.toString(16).padStart(8, "0"),
          g: s.g.toString(16).padStart(8, "0"),
          h: s.h.toString(16).padStart(8, "0"),
        },
        T1: s.T1.toString(16).padStart(8, "0"),
        T2: s.T2.toString(16).padStart(8, "0"),
      })),
      finalHash: result.finalHash
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sha256-${input.slice(0, 20)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: "Vollständige SHA-256 Daten" });
  };

  const toHex8 = (n: number) => n.toString(16).padStart(8, "0");

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Hash className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          SHA-256 VISUALIZER
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-secondary/10 text-secondary border-secondary/30">
            64 RUNDEN
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div>
          <label className="text-[10px] text-muted-foreground">Eingabe-Nachricht</label>
          <Input
            value={input}
            onChange={(e) => { setInput(e.target.value); setCurrentRound(0); }}
            className="h-8 text-xs font-mono"
            placeholder="Nachricht eingeben..."
          />
        </div>

        {/* Final Hash */}
        <div className="p-3 rounded bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Finaler Hash (256 Bit)</span>
            <button
              onClick={() => copyToClipboard(result.finalHash, "Hash")}
              className="p-1 hover:bg-muted rounded"
            >
              {copiedField === "Hash" ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="font-mono text-xs text-primary break-all glow-green">
            {result.finalHash}
          </div>
        </div>

        {/* Round Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground">Runde {currentRound}/63</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => setCurrentRound(Math.max(0, currentRound - 1))}
                disabled={currentRound === 0}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => setCurrentRound(Math.min(63, currentRound + 1))}
                disabled={currentRound === 63}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Slider
            value={[currentRound]}
            onValueChange={([v]) => setCurrentRound(v)}
            max={63}
            step={1}
            className="my-2"
          />
        </div>

        {/* Current Round State */}
        {currentStep && (
          <div className="space-y-3">
            {/* Message Schedule & Constant */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-background/50 border border-border/30">
                <div className="text-[10px] text-muted-foreground">W[{currentRound}]</div>
                <div className="font-mono text-[11px] text-secondary break-all">
                  {toHex8(currentStep.W)}
                </div>
              </div>
              <div className="p-2 rounded bg-background/50 border border-border/30">
                <div className="text-[10px] text-muted-foreground">K[{currentRound}]</div>
                <div className="font-mono text-[11px] text-muted-foreground break-all">
                  {toHex8(currentStep.K)}
                </div>
              </div>
            </div>

            {/* State Variables a-h */}
            <div className="p-2 rounded bg-background/30 border border-border/20">
              <div className="text-[10px] text-muted-foreground mb-2">Zustandsvariablen (a-h)</div>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                {[
                  { name: "a", val: currentStep.a },
                  { name: "b", val: currentStep.b },
                  { name: "c", val: currentStep.c },
                  { name: "d", val: currentStep.d },
                  { name: "e", val: currentStep.e },
                  { name: "f", val: currentStep.f },
                  { name: "g", val: currentStep.g },
                  { name: "h", val: currentStep.h },
                ].map(({ name, val }) => (
                  <div key={name} className="p-1 rounded bg-background/50 text-center">
                    <span className="text-primary">{name}:</span>
                    <div className="text-muted-foreground break-all">{toHex8(val)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Round Functions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-background/50 border border-border/30">
                <div className="text-[10px] text-muted-foreground">T₁ = h + Σ₁(e) + Ch(e,f,g) + K + W</div>
                <div className="font-mono text-[11px] text-primary">{toHex8(currentStep.T1)}</div>
              </div>
              <div className="p-2 rounded bg-background/50 border border-border/30">
                <div className="text-[10px] text-muted-foreground">T₂ = Σ₀(a) + Maj(a,b,c)</div>
                <div className="font-mono text-[11px] text-secondary">{toHex8(currentStep.T2)}</div>
              </div>
            </div>

            {/* Intermediate Values */}
            <div className="grid grid-cols-4 gap-1 text-[9px]">
              <div className="p-1 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground">Ch:</span>
                <div className="font-mono">{toHex8(currentStep.Ch)}</div>
              </div>
              <div className="p-1 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground">Maj:</span>
                <div className="font-mono">{toHex8(currentStep.Maj)}</div>
              </div>
              <div className="p-1 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground">Σ₀:</span>
                <div className="font-mono">{toHex8(currentStep.Σ0)}</div>
              </div>
              <div className="p-1 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground">Σ₁:</span>
                <div className="font-mono">{toHex8(currentStep.Σ1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Message Schedule Preview */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Message Schedule W[0..15]</div>
          <ScrollArea className="h-16">
            <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
              {result.messageSchedule.slice(0, 16).map((w, i) => (
                <div 
                  key={i} 
                  className={`p-1 rounded text-center ${i === currentRound && currentRound < 16 ? 'bg-primary/20 text-primary' : 'bg-muted/20'}`}
                >
                  W{i}: {toHex8(w)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Initial Hash Values */}
        <div className="p-2 rounded bg-muted/20 border border-border/20">
          <div className="text-[10px] text-muted-foreground mb-1">Initialwerte H₀...H₇ (Quadratwurzeln der ersten 8 Primzahlen)</div>
          <div className="font-mono text-[9px] text-muted-foreground flex flex-wrap gap-1">
            {SHA256_H.map((h, i) => (
              <span key={i}>{toHex8(h)}</span>
            ))}
          </div>
        </div>

        {/* Export */}
        <Button size="sm" variant="outline" className="w-full gap-2" onClick={exportFullData}>
          <Download className="w-3 h-3" />
          Vollständige Daten exportieren (JSON)
        </Button>
      </CardContent>
    </Card>
  );
}
