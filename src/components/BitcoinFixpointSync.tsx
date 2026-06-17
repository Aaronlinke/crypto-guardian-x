import { useState, useCallback } from "react";
import { Bitcoin, RefreshCw, CheckCircle2, XCircle, Link2, Calculator, Zap, Info, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBlockstreamAPI } from "@/hooks/useBlockstreamAPI";
import { satoshiToBTC, shortenAddress, formatTimestamp } from "@/lib/bitcoin-utils";

// SRIL-Koeffizienten
const SRIL_COEFFICIENTS = {
  alpha: 0.245,
  beta: 0.152,
  gamma: 0.985,
  delta: 0.112,
  eta: 0.088
};

// Maass-Formen Faktor (aus wissenschaftlicher Dokumentation)
const MAASS_FACTOR = 2; // n=2

// DVL-Toleranzschwelle (4%)
const DVL_TOLERANCE = 0.04;

interface ValidationResult {
  calculatedValue: number;
  btcValue: number;
  deviation: number;
  isValid: boolean;
  timestamp: number;
  txid?: string;
}

export function BitcoinFixpointSync() {
  const [H, setH] = useState("-3.425");
  const [N, setN] = useState("6.591");
  const [G, setG] = useState("2.834");
  const [targetAddress, setTargetAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  
  const { data, loading, error, fetchAddressData, reset } = useBlockstreamAPI();
  const { toast } = useToast();

  // SRIL Forward-Iteration
  const srilForward = useCallback((H: number, N: number, G: number, steps: number = 1) => {
    const { alpha, beta, gamma, delta, eta } = SRIL_COEFFICIENTS;
    let h = H, n = N, g = G;
    
    for (let i = 0; i < steps; i++) {
      const h_next = h + alpha * n - beta * g;
      const n_next = gamma * n + delta * Math.abs(h);
      const g_next = g + eta * (h_next + n_next);
      h = h_next;
      n = n_next;
      g = g_next;
    }
    
    return { H: h, N: n, G: g };
  }, []);

  // Berechne N(t)/2 und vergleiche mit BTC-Werten
  const calculateFixpoint = useCallback((n: number) => {
    // N(t) / Maass-Faktor = erwarteter BTC-Wert
    return n / MAASS_FACTOR;
  }, []);

  // Validierung gegen echte Blockchain-Daten
  const validateAgainstBlockchain = async () => {
    const currentN = parseFloat(N);
    if (isNaN(currentN)) {
      toast({ title: "Fehler", description: "Ungültiger N-Wert" });
      return;
    }

    setIsValidating(true);
    
    try {
      await fetchAddressData(targetAddress);
    } catch (err) {
      toast({ title: "Fehler", description: "Konnte Blockchain-Daten nicht laden" });
    }
    
    setIsValidating(false);
  };

  // Verarbeite Transaktionen nach dem Laden
  const processTransactions = useCallback(() => {
    if (!data.transactions || data.transactions.length === 0) return;

    const currentN = parseFloat(N);
    const calculatedBTC = calculateFixpoint(currentN);
    
    const results: ValidationResult[] = [];

    // Prüfe jede Transaktion auf Resonanz
    data.transactions.forEach(tx => {
      tx.vout.forEach(output => {
        const btcValue = output.value / 100000000; // Satoshi → BTC
        
        // Berechne Abweichung
        const deviation = Math.abs(btcValue - calculatedBTC) / calculatedBTC;
        
        // Prüfe ob innerhalb der DVL-Toleranz
        const isValid = deviation <= DVL_TOLERANCE;
        
        if (btcValue > 0.001) { // Ignoriere Dust
          results.push({
            calculatedValue: calculatedBTC,
            btcValue: btcValue,
            deviation: deviation,
            isValid: isValid,
            timestamp: tx.status.block_time || Date.now() / 1000,
            txid: tx.txid
          });
        }
      });
    });

    // Sortiere nach Abweichung (beste Matches zuerst)
    results.sort((a, b) => a.deviation - b.deviation);
    
    setValidationResults(results.slice(0, 10)); // Top 10 Matches
    
    const bestMatch = results.find(r => r.isValid);
    if (bestMatch) {
      toast({
        title: "FIXPUNKT GEFUNDEN!",
        description: `Abweichung: ${(bestMatch.deviation * 100).toFixed(2)}% - Innerhalb DVL-Toleranz`
      });
    }
  }, [data.transactions, N, calculateFixpoint, toast]);

  // Automatische Verarbeitung wenn Daten geladen
  useState(() => {
    if (data.transactions.length > 0) {
      processTransactions();
    }
  });

  // Manuelles Trigger
  const runValidation = async () => {
    await validateAgainstBlockchain();
    setTimeout(processTransactions, 500);
  };

  // Berechne T+3 Projektion (wie in der Dokumentation)
  const projectT3 = () => {
    const currentH = parseFloat(H);
    const currentN = parseFloat(N);
    const currentG = parseFloat(G);
    
    if (isNaN(currentH) || isNaN(currentN) || isNaN(currentG)) return;
    
    const result = srilForward(currentH, currentN, currentG, 3);
    setH(result.H.toFixed(6));
    setN(result.N.toFixed(6));
    setG(result.G.toFixed(6));
    
    toast({
      title: "T+3 Projektion",
      description: `N(3) = ${result.N.toFixed(4)} → N/2 = ${calculateFixpoint(result.N).toFixed(4)} BTC`
    });
  };

  const calculatedBTC = calculateFixpoint(parseFloat(N) || 0);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Bitcoin className="w-4 h-4 text-amber-500" />
          <span className="text-primary">[</span>
          BITCOIN FIXPUNKT-SYNC
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
            DVL ±4%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formel-Anzeige */}
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30">
          <div className="text-[10px] text-amber-400 mb-2">Resonanz-Formel (Maass-Formen n=2):</div>
          <div className="text-sm font-mono text-center text-amber-300">
            N(t) / 2 = BTC-Fixpunkt
          </div>
          <div className="text-[9px] text-amber-400/70 text-center mt-1">
            Abweichung ≤ 4% = DVL-Toleranzschwelle erfüllt
          </div>
        </div>

        {/* SRIL-Eingaben */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[9px] text-muted-foreground">H(t)</label>
            <Input
              value={H}
              onChange={(e) => setH(e.target.value)}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-primary font-bold">N(t) ⬅</label>
            <Input
              value={N}
              onChange={(e) => setN(e.target.value)}
              className="h-7 text-xs font-mono border-primary/50"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground">G(t)</label>
            <Input
              value={G}
              onChange={(e) => setG(e.target.value)}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        {/* Berechneter Wert */}
        <div className="p-3 rounded bg-primary/10 border border-primary/30 text-center">
          <div className="text-[10px] text-muted-foreground">Berechneter BTC-Fixpunkt (N/2):</div>
          <div className="text-2xl font-mono text-primary font-bold">
            {calculatedBTC.toFixed(6)} BTC
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">
            = {(calculatedBTC * 100000000).toFixed(0)} Satoshi
          </div>
        </div>

        {/* Ziel-Adresse */}
        <div>
          <label className="text-[9px] text-muted-foreground">Blockchain-Adresse zur Validierung:</label>
          <Input
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="h-7 text-xs font-mono"
            placeholder="bc1q..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={projectT3}
            className="gap-1"
          >
            <Calculator className="w-3 h-3" />
            T+3
          </Button>
          <Button
            size="sm"
            onClick={runValidation}
            disabled={loading || isValidating}
            className="flex-1 gap-1"
          >
            <Link2 className="w-3 h-3" />
            {loading ? "Lädt..." : "BLOCKCHAIN VALIDIEREN"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { reset(); setValidationResults([]); }}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {/* Fehler-Anzeige */}
        {error && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Validierungs-Ergebnisse */}
        {validationResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-muted-foreground">
              Fixpunkt-Matches ({validationResults.length} gefunden):
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-terminal">
              {validationResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-xs font-mono flex items-center gap-2 ${
                    result.isValid 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : "bg-muted/20 border border-border/30"
                  }`}
                >
                  {result.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">{result.btcValue.toFixed(6)} BTC</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="text-primary">{result.calculatedValue.toFixed(6)}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground truncate">
                      Δ {(result.deviation * 100).toFixed(2)}% | {result.txid?.slice(0, 16)}...
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[8px] ${result.isValid ? "text-green-400 border-green-500/30" : "text-muted-foreground"}`}
                  >
                    {result.isValid ? "MATCH" : `+${(result.deviation * 100).toFixed(1)}%`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adress-Info */}
        {data.addressInfo && (
          <div className="p-2 rounded bg-muted/20 border border-border/30">
            <div className="text-[9px] text-muted-foreground mb-1">Adress-Daten:</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-muted-foreground">Balance: </span>
                <span className="text-primary font-mono">
                  {satoshiToBTC(
                    data.addressInfo.chain_stats.funded_txo_sum - 
                    data.addressInfo.chain_stats.spent_txo_sum
                  )} BTC
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">TXs: </span>
                <span className="text-secondary font-mono">
                  {data.addressInfo.chain_stats.tx_count}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Signatur */}
        <div className="text-[8px] text-center text-muted-foreground">
          Validierung: <span className="font-mono text-amber-400">07e935fa</span> | 
          Maass-Formen n=2 | DVL-Toleranz &lt;4%
        </div>
      </CardContent>
    </Card>
  );
}
