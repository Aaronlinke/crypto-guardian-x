import { useState, useMemo } from "react";
import { Key, Lock, Unlock, RefreshCw, Copy, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// secp256k1 Kurvenordnung (vereinfacht für Demo)
const N = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");

// Modulare Inverse mit Extended Euclidean Algorithm
function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [a % m, m];
  let [old_s, s] = [1n, 0n];
  
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  
  return ((old_s % m) + m) % m;
}

// Sichere BigInt Konvertierung
function safeBigInt(hex: string): bigint | null {
  try {
    const cleaned = hex.replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "");
    if (!cleaned || cleaned.length === 0) return null;
    return BigInt("0x" + cleaned);
  } catch {
    return null;
  }
}

export function ECDSACalculator() {
  const [h, setH] = useState("1");  // Entropie
  const [n, setN] = useState("1");  // Navigation
  const [g, setG] = useState("1");  // Geometrie
  const [offset, setOffset] = useState("0");
  const [rValue, setRValue] = useState(""); // Signatur R-Wert
  const [batchIndex, setBatchIndex] = useState("0");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  // Berechnungen basierend auf OMNIGENESIS Pipeline
  const calculations = useMemo(() => {
    try {
      const hNum = BigInt(h || "0");
      const nNum = BigInt(n || "0");
      const gNum = BigInt(g || "0");
      const oNum = BigInt(offset || "0");
      const iNum = BigInt(batchIndex || "0");
      
      // k_i = (h + n*g + o + i) mod N
      const k = ((hNum + nNum * gNum + oNum + iNum) % N + N) % N;
      
      // Wenn R-Wert gegeben, berechne d = k * r^-1 mod N
      let d: bigint | null = null;
      let rInv: bigint | null = null;
      
      const rBig = safeBigInt(rValue);
      if (rBig && rBig > 0n) {
        rInv = modInverse(rBig, N);
        d = (k * rInv) % N;
      }
      
      // Hex-Darstellung
      const kHex = k.toString(16).padStart(64, "0");
      const dHex = d ? d.toString(16).padStart(64, "0") : null;
      
      return {
        k,
        kHex,
        rInv,
        d,
        dHex,
        formula: `k = (${hNum} + ${nNum}×${gNum} + ${oNum} + ${iNum}) mod N`,
        success: true
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }, [h, n, g, offset, rValue, batchIndex]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Kopiert", description: `${field} in Zwischenablage` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Key className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          ECDSA MATHEMATIK · secp256k1
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-secondary/10 text-secondary border-secondary/30">
            OMNIGENESIS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Parameters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">h (Entropie)</label>
            <Input
              type="number"
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">n (Navigation)</label>
            <Input
              type="number"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">g (Geometrie)</label>
            <Input
              type="number"
              value={g}
              onChange={(e) => setG(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">o (Offset)</label>
            <Input
              type="number"
              value={offset}
              onChange={(e) => setOffset(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">i (Batch-Index)</label>
            <Input
              type="number"
              value={batchIndex}
              onChange={(e) => setBatchIndex(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">r (Signatur, opt.)</label>
            <Input
              type="text"
              value={rValue}
              onChange={(e) => setRValue(e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="0x..."
            />
          </div>
        </div>

        {/* Formula Display */}
        <div className="p-2 rounded bg-background/50 border border-border/30">
          <div className="text-[10px] text-muted-foreground mb-1">Seed-Formel:</div>
          <div className="font-mono text-xs text-primary">
            kᵢ = (h + n·g + o + i) mod N
          </div>
          {calculations.success && (
            <div className="font-mono text-[10px] text-muted-foreground mt-1">
              {calculations.formula}
            </div>
          )}
        </div>

        {/* Results */}
        {calculations.success && (
          <div className="space-y-2">
            {/* k Value */}
            <div className="p-2 rounded bg-background/30 border border-border/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Ephemeral Key (k)
                </span>
                <button
                  onClick={() => copyToClipboard(calculations.kHex!, "k")}
                  className="p-1 hover:bg-muted rounded"
                >
                  {copiedField === "k" ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="font-mono text-[10px] text-secondary break-all">
                0x{calculations.kHex}
              </div>
            </div>

            {/* d Value (if r provided) */}
            {calculations.d !== null && (
              <div className="p-2 rounded bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Private Key (d = k·r⁻¹ mod N)
                  </span>
                  <button
                    onClick={() => copyToClipboard(calculations.dHex!, "d")}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {copiedField === "d" ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] text-primary break-all glow-green">
                  0x{calculations.dHex}
                </div>
              </div>
            )}

            {/* Modulare Inverse */}
            {calculations.rInv !== null && (
              <div className="p-2 rounded bg-background/20 border border-border/10">
                <div className="text-[10px] text-muted-foreground">r⁻¹ mod N:</div>
                <div className="font-mono text-[9px] text-muted-foreground break-all">
                  {calculations.rInv.toString(16).slice(0, 32)}...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-amber-300/80">
            Wissenschaftliche Demonstration der ECDSA-Mathematik. 
            Kurvenordnung N = secp256k1. Alle Berechnungen sind deterministisch und reproduzierbar.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
