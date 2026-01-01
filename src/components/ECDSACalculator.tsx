import { useState, useMemo } from "react";
import { Key, Lock, Unlock, Copy, Check, AlertTriangle, Download, Expand, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SECP256K1, modInverse, toFullHex, safeBigInt } from "@/lib/crypto-math";

export function ECDSACalculator() {
  const [h, setH] = useState("1");  // Entropie
  const [n, setN] = useState("1");  // Navigation
  const [g, setG] = useState("1");  // Geometrie
  const [offset, setOffset] = useState("0");
  const [rValue, setRValue] = useState(""); // Signatur R-Wert
  const [sValue, setSValue] = useState(""); // Signatur S-Wert
  const [zValue, setZValue] = useState(""); // Message Hash
  const [batchIndex, setBatchIndex] = useState("0");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const N = SECP256K1.N;

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
      let sInv: bigint | null = null;
      let fullRecovery = false;
      
      const rBig = safeBigInt(rValue);
      const sBig = safeBigInt(sValue);
      const zBig = safeBigInt(zValue);
      
      if (rBig && rBig > 0n) {
        rInv = modInverse(rBig, N);
        d = (k * rInv) % N;
      }
      
      // Vollständige ECDSA Recovery: d = r^-1 * (s*k - z) mod N
      if (rBig && sBig && zBig && k > 0n) {
        const sk = (sBig * k) % N;
        const diff = ((sk - zBig) % N + N) % N;
        d = (modInverse(rBig, N) * diff) % N;
        sInv = modInverse(sBig, N);
        fullRecovery = true;
      }
      
      // Hex-Darstellungen - VOLLSTÄNDIG, keine Kürzung
      const kHex = toFullHex(k);
      const dHex = d ? toFullHex(((d % N) + N) % N) : null;
      const rInvHex = rInv ? toFullHex(rInv) : null;
      const sInvHex = sInv ? toFullHex(sInv) : null;
      
      // Zusätzliche Berechnungen
      const kDecimal = k.toString();
      const dDecimal = d ? (((d % N) + N) % N).toString() : null;
      
      return {
        k,
        kHex,
        kDecimal,
        rInv,
        rInvHex,
        sInv,
        sInvHex,
        d,
        dHex,
        dDecimal,
        formula: `k = (${hNum} + ${nNum}×${gNum} + ${oNum} + ${iNum}) mod N`,
        fullRecovery,
        success: true
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }, [h, n, g, offset, rValue, sValue, zValue, batchIndex]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Kopiert", description: `${field} in Zwischenablage` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleExpand = (field: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedFields(newExpanded);
  };

  const exportAllData = () => {
    if (!calculations.success) return;
    
    const data = {
      inputs: { h, n, g, offset, batchIndex, rValue, sValue, zValue },
      curve: {
        name: "secp256k1",
        N: SECP256K1.N.toString(16),
        P: SECP256K1.P.toString(16),
        Gx: SECP256K1.Gx.toString(16),
        Gy: SECP256K1.Gy.toString(16)
      },
      results: {
        k: { hex: calculations.kHex, decimal: calculations.kDecimal },
        rInverse: calculations.rInvHex,
        sInverse: calculations.sInvHex,
        d: calculations.dHex ? { hex: calculations.dHex, decimal: calculations.dDecimal } : null
      },
      formula: calculations.formula,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecdsa-calc-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportiert", description: "Vollständige ECDSA Daten" });
  };

  const ExpandableValue = ({ 
    label, 
    hexValue, 
    decimalValue, 
    fieldId, 
    icon: Icon,
    highlight = false 
  }: { 
    label: string; 
    hexValue: string; 
    decimalValue?: string | null;
    fieldId: string;
    icon: typeof Lock;
    highlight?: boolean;
  }) => {
    const isExpanded = expandedFields.has(fieldId);
    
    return (
      <div className={`p-2 rounded border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-background/30 border-border/20'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Icon className="w-3 h-3" /> {label}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => toggleExpand(fieldId)}
              className="p-1 hover:bg-muted rounded"
              title={isExpanded ? "Komprimieren" : "Erweitern"}
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(hexValue, fieldId)}
              className="p-1 hover:bg-muted rounded"
            >
              {copiedField === fieldId ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        
        {/* Hex Value - VOLLSTÄNDIG */}
        <div className={`font-mono text-[10px] break-all ${highlight ? 'text-primary glow-green' : 'text-secondary'}`}>
          0x{hexValue}
        </div>
        
        {/* Expanded: Decimal Value */}
        {isExpanded && decimalValue && (
          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="text-[9px] text-muted-foreground mb-1">Dezimal ({decimalValue.length} Ziffern):</div>
            <div className="font-mono text-[9px] text-muted-foreground break-all">
              {decimalValue}
            </div>
          </div>
        )}
        
        {/* Hex Bytes */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="text-[9px] text-muted-foreground mb-1">Bytes (32):</div>
            <div className="font-mono text-[8px] text-muted-foreground grid grid-cols-8 gap-0.5">
              {hexValue.match(/.{1,2}/g)?.map((byte, i) => (
                <span key={i} className="bg-muted/30 px-0.5 rounded text-center">{byte}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">h (Entropie)</label>
            <Input
              type="number"
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">n (Navigation)</label>
            <Input
              type="number"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">g (Geometrie)</label>
            <Input
              type="number"
              value={g}
              onChange={(e) => setG(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">o (Offset)</label>
            <Input
              type="number"
              value={offset}
              onChange={(e) => setOffset(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">i (Batch-Index)</label>
            <Input
              type="number"
              value={batchIndex}
              onChange={(e) => setBatchIndex(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">r (Signatur)</label>
            <Input
              type="text"
              value={rValue}
              onChange={(e) => setRValue(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="0x..."
            />
          </div>
        </div>

        {/* Optional: Full ECDSA Recovery */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">s (Signatur, opt.)</label>
            <Input
              type="text"
              value={sValue}
              onChange={(e) => setSValue(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">z (Message Hash, opt.)</label>
            <Input
              type="text"
              value={zValue}
              onChange={(e) => setZValue(e.target.value)}
              className="h-7 text-xs font-mono"
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
          {calculations.success && calculations.fullRecovery && (
            <div className="font-mono text-xs text-secondary mt-1">
              d = r⁻¹ · (s·k - z) mod N
            </div>
          )}
          {calculations.success && (
            <div className="font-mono text-[10px] text-muted-foreground mt-1">
              {calculations.formula}
            </div>
          )}
        </div>

        {/* Results - VOLLSTÄNDIG ohne Kürzung */}
        {calculations.success && (
          <div className="space-y-2">
            {/* k Value */}
            <ExpandableValue
              label="Ephemeral Key (k)"
              hexValue={calculations.kHex!}
              decimalValue={calculations.kDecimal}
              fieldId="k"
              icon={Lock}
            />

            {/* d Value (if r provided) */}
            {calculations.d !== null && calculations.dHex && (
              <ExpandableValue
                label={calculations.fullRecovery ? "Private Key d = r⁻¹·(s·k - z)" : "Private Key d = k·r⁻¹"}
                hexValue={calculations.dHex}
                decimalValue={calculations.dDecimal}
                fieldId="d"
                icon={Unlock}
                highlight={true}
              />
            )}

            {/* Modular Inverses - VOLLSTÄNDIG */}
            {calculations.rInvHex && (
              <ExpandableValue
                label="r⁻¹ mod N (Modulare Inverse)"
                hexValue={calculations.rInvHex}
                fieldId="rInv"
                icon={Key}
              />
            )}
            
            {calculations.sInvHex && (
              <ExpandableValue
                label="s⁻¹ mod N (Modulare Inverse)"
                hexValue={calculations.sInvHex}
                fieldId="sInv"
                icon={Key}
              />
            )}
          </div>
        )}

        {/* Kurvenparameter */}
        <div className="p-2 rounded bg-muted/20 border border-border/20">
          <div className="text-[10px] text-muted-foreground mb-1">secp256k1 Kurvenordnung N:</div>
          <div className="font-mono text-[9px] text-muted-foreground break-all">
            0x{SECP256K1.N.toString(16)}
          </div>
        </div>

        {/* Export Button */}
        <Button size="sm" variant="outline" className="w-full gap-2" onClick={exportAllData}>
          <Download className="w-3 h-3" />
          Alle Berechnungen exportieren (JSON)
        </Button>

        {/* Info */}
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-amber-300/80">
            Wissenschaftliche Demonstration der ECDSA-Mathematik. 
            Alle Werte werden vollständig und ungekürzt angezeigt.
            Kurvenordnung N = secp256k1 (256 Bit).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
