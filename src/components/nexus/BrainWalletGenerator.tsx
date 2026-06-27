import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { KeyRound, Wallet, RefreshCw, Search, AlertTriangle, Copy, Check } from "lucide-react";
import {
  deriveBrainWallet,
  generateRandomPhrase,
  type BrainWalletKey,
} from "@/lib/brain-wallet";
import { useScienceMode } from "@/contexts/ScienceModeContext";

const BLOCKSTREAM_API = "https://blockstream.info/api";

interface Props {
  onLog?: (message: string) => void;
}

interface CheckedAddress {
  address: string;
  type: "compressed" | "uncompressed";
  funded: number | null;
  balance: number | null;
  txCount: number | null;
  error?: string;
}

interface WalletEntry {
  key: BrainWalletKey;
  checks: CheckedAddress[];
  checking: boolean;
}

async function fetchBalance(address: string): Promise<Omit<CheckedAddress, "address" | "type">> {
  try {
    const res = await fetch(`${BLOCKSTREAM_API}/address/${address}`);
    if (!res.ok) return { funded: null, balance: null, txCount: null, error: `HTTP ${res.status}` };
    const data = await res.json();
    const funded = data.chain_stats.funded_txo_sum as number;
    const spent = data.chain_stats.spent_txo_sum as number;
    return {
      funded,
      balance: funded - spent,
      txCount: data.chain_stats.tx_count as number,
    };
  } catch (e) {
    return { funded: null, balance: null, txCount: null, error: e instanceof Error ? e.message : "Netzwerkfehler" };
  }
}

function sats(n: number): string {
  return (n / 1e8).toFixed(8) + " BTC";
}

export default function BrainWalletGenerator({ onLog }: Props) {
  const { limits, isScientist } = useScienceMode();
  const [wordCount, setWordCount] = useState<1 | 2 | 3>(2);
  const [customPhrase, setCustomPhrase] = useState("");
  const [autoCheck, setAutoCheck] = useState(true);
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const checkEntry = useCallback(
    async (key: BrainWalletKey): Promise<CheckedAddress[]> => {
      if (!limits.liveData) {
        onLog?.(`[BRAIN-WALLET] Live-Guthabenprüfung nur im Wissenschaftsmodus verfügbar.`);
        return [
          { address: key.uncompressedAddress, type: "uncompressed", funded: null, balance: null, txCount: null, error: "Nur im Wissenschaftsmodus" },
          { address: key.compressedAddress, type: "compressed", funded: null, balance: null, txCount: null, error: "Nur im Wissenschaftsmodus" },
        ];
      }
      const targets: Array<{ address: string; type: "compressed" | "uncompressed" }> = [
        { address: key.uncompressedAddress, type: "uncompressed" },
        { address: key.compressedAddress, type: "compressed" },
      ];
      const results = await Promise.all(
        targets.map(async (t) => ({ ...t, ...(await fetchBalance(t.address)) }))
      );
      const hit = results.find((r) => (r.balance ?? 0) > 0 || (r.txCount ?? 0) > 0);
      if (hit) {
        onLog?.(`[BRAIN-WALLET] AKTIVITÄT: "${key.passphrase}" → ${hit.address} (${hit.txCount} txs, ${sats(hit.balance ?? 0)})`);
      } else {
        onLog?.(`[BRAIN-WALLET] "${key.passphrase}" → leer / nie benutzt`);
      }
      return results;
    },
    [onLog, limits.liveData]
  );

  const handleGenerate = useCallback(
    async (phraseOverride?: string) => {
      setWorking(true);
      try {
        const phrase = phraseOverride ?? generateRandomPhrase(wordCount);
        const key = await deriveBrainWallet(phrase);
        onLog?.(`[BRAIN-WALLET] Erzeugt: "${phrase}" → ${key.uncompressedAddress}`);
        const entry: WalletEntry = { key, checks: [], checking: autoCheck };
        setEntries((prev) => [entry, ...prev].slice(0, 25));

        if (autoCheck) {
          const checks = await checkEntry(key);
          setEntries((prev) =>
            prev.map((e) => (e.key.privateKeyHex === key.privateKeyHex ? { ...e, checks, checking: false } : e))
          );
        }
      } finally {
        setWorking(false);
      }
    },
    [wordCount, autoCheck, checkEntry, onLog]
  );

  const handleCheck = useCallback(
    async (key: BrainWalletKey) => {
      setEntries((prev) => prev.map((e) => (e.key.privateKeyHex === key.privateKeyHex ? { ...e, checking: true } : e)));
      const checks = await checkEntry(key);
      setEntries((prev) =>
        prev.map((e) => (e.key.privateKeyHex === key.privateKeyHex ? { ...e, checks, checking: false } : e))
      );
    },
    [checkEntry]
  );

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="text-primary">[</span>BRAIN-WALLET GENERATOR &amp; GUTHABENPRÜFER<span className="text-primary">]</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
              <span className="text-destructive font-bold">EDUKATIV / WISSENSCHAFTLICH.</span> Dieses Modul
              demonstriert, warum „Brain Wallets" (1–3 Wörter als Passphrase) katastrophal unsicher sind. Der private
              Schlüssel ist exakt SHA-256(Passphrase). Solche Adressen werden seit Jahren in Sekunden von Bots
              leergeräumt. Verwende dies <span className="text-destructive font-bold">niemals</span> für echte Wallets
              und niemals, um auf fremde Guthaben zuzugreifen.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-mono text-muted-foreground">Wortanzahl</Label>
              <div className="flex gap-1">
                {([1, 2, 3] as const).map((n) => (
                  <Button
                    key={n}
                    size="sm"
                    variant={wordCount === n ? "default" : "outline"}
                    className="font-mono h-8 w-8 p-0"
                    onClick={() => setWordCount(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1.5">
              <Switch id="autocheck" checked={autoCheck} onCheckedChange={setAutoCheck} />
              <Label htmlFor="autocheck" className="text-[10px] font-mono text-muted-foreground">
                Auto-Guthabenprüfung
              </Label>
            </div>

            <Button
              size="sm"
              className="font-mono ml-auto"
              disabled={working}
              onClick={() => handleGenerate()}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${working ? "animate-spin" : ""}`} />
              Zufalls-Phrase erzeugen
            </Button>
          </div>

          {/* Custom phrase */}
          <div className="flex gap-2">
            <Input
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="Eigene Passphrase eingeben (1–3 Wörter)…"
              className="font-mono text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customPhrase.trim()) {
                  handleGenerate(customPhrase.trim());
                  setCustomPhrase("");
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="font-mono shrink-0"
              disabled={working || !customPhrase.trim()}
              onClick={() => {
                handleGenerate(customPhrase.trim());
                setCustomPhrase("");
              }}
            >
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              Ableiten
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => {
            const k = entry.key;
            const hasFunds = entry.checks.some((c) => (c.balance ?? 0) > 0);
            const hasHistory = entry.checks.some((c) => (c.txCount ?? 0) > 0);
            return (
              <Card
                key={k.privateKeyHex}
                className={`bg-card/60 ${
                  hasFunds
                    ? "border-destructive/60"
                    : hasHistory
                    ? "border-yellow-500/50"
                    : "border-border/50"
                }`}
              >
                <CardContent className="p-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">"{k.passphrase}"</span>
                    {hasFunds && (
                      <Badge variant="destructive" className="text-[9px]">GUTHABEN!</Badge>
                    )}
                    {!hasFunds && hasHistory && (
                      <Badge className="text-[9px] bg-yellow-500/20 text-yellow-500 border-yellow-500/40">
                        EINST BENUTZT (leer)
                      </Badge>
                    )}
                    {entry.checks.length > 0 && !hasHistory && (
                      <Badge variant="outline" className="text-[9px]">unbenutzt</Badge>
                    )}
                    {!entry.checking && entry.checks.length === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-6 text-[10px]"
                        onClick={() => handleCheck(k)}
                      >
                        <Search className="w-3 h-3 mr-1" /> Guthaben prüfen
                      </Button>
                    )}
                    {entry.checking && (
                      <span className="ml-auto text-muted-foreground flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> prüfe…
                      </span>
                    )}
                  </div>

                  <div className="grid gap-1 text-muted-foreground">
                    <KeyValueRow
                      label="privkey"
                      value={k.privateKeyHex}
                      copied={copied}
                      onCopy={copy}
                    />
                    <KeyValueRow label="WIF" value={k.compressedWif} copied={copied} onCopy={copy} />
                  </div>

                  <div className="space-y-1 pt-1 border-t border-border/40">
                    {([
                      { addr: k.uncompressedAddress, type: "uncompressed" as const },
                      { addr: k.compressedAddress, type: "compressed" as const },
                    ]).map(({ addr, type }) => {
                      const chk = entry.checks.find((c) => c.address === addr);
                      return (
                        <div key={addr} className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] text-muted-foreground w-[88px]">{type}</span>
                          <button
                            onClick={() => copy(addr)}
                            className="text-foreground hover:text-primary transition-colors break-all text-left"
                          >
                            {addr}
                          </button>
                          {chk && !chk.error && (
                            <span
                              className={`ml-auto ${
                                (chk.balance ?? 0) > 0 ? "text-destructive font-bold" : "text-muted-foreground"
                              }`}
                            >
                              {sats(chk.balance ?? 0)} · {chk.txCount} tx
                            </span>
                          )}
                          {chk?.error && <span className="ml-auto text-destructive/70">{chk.error}</span>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KeyValueRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] w-[88px] shrink-0">{label}</span>
      <span className="break-all text-foreground/80">{value}</span>
      <button onClick={() => onCopy(value)} className="shrink-0 hover:text-primary">
        {copied === value ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}
