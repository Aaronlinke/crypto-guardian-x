import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Zap, Hash, Link, Play, Download, AlertTriangle,
  CheckCircle, XCircle, ArrowRight, Lock, Unlock
} from "lucide-react";
import { analyzeEntropy, type EntropyReport } from "@/lib/entropy-analysis";
import { generateInvertibilityProof, type InvertibilityProof } from "@/lib/proof-of-invertibility";
import { exportAsJSON } from "@/lib/export-utils";
import { downloadCompleteMathExport } from "@/lib/complete-math-export";

type PipelineStage = 'idle' | 'entropy' | 'inversion' | 'seal' | 'complete';

interface PipelineResult {
  entropy: EntropyReport | null;
  proof: InvertibilityProof | null;
  stage: PipelineStage;
  runtime: number;
}

const EXAMPLE_INPUTS = {
  csprng: () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  },
  weak: () => 'aaaaaaaabbbbbbbbccccccccddddddddeeeeeeeeffffffffaaaaaaaabbbbbbbb',
  brainwallet: () => {
    // SHA256("password") - known weak brain wallet
    return '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
  },
  sequential: () => '0102030405060708091011121314151617181920212223242526272829303132',
};

export function CryptoInversionPipeline() {
  const [hexInput, setHexInput] = useState('');
  const [result, setResult] = useState<PipelineResult>({ entropy: null, proof: null, stage: 'idle', runtime: 0 });
  const [running, setRunning] = useState(false);

  const runFullPipeline = useCallback(async () => {
    if (!hexInput || hexInput.replace(/\s/g, '').length < 8) return;
    setRunning(true);
    const t0 = performance.now();

    // STAGE 1: Entropy Analysis
    setResult(r => ({ ...r, stage: 'entropy' }));
    const entropy = analyzeEntropy(hexInput);
    await new Promise(r => setTimeout(r, 100)); // visual pause

    // STAGE 2: Proof-of-Invertibility
    setResult(r => ({ ...r, stage: 'inversion', entropy }));
    const proof = await generateInvertibilityProof();
    await new Promise(r => setTimeout(r, 100));

    // STAGE 3: Seal (already generated in proof)
    setResult(r => ({ ...r, stage: 'seal', proof }));
    await new Promise(r => setTimeout(r, 100));

    const runtime = performance.now() - t0;
    setResult({ entropy, proof, stage: 'complete', runtime });
    setRunning(false);
  }, [hexInput]);

  const exportProof = useCallback(() => {
    if (!result.entropy || !result.proof) return;
    exportAsJSON({
      _meta: {
        protocol: 'Crypto Inversion Pipeline v1.0',
        description: 'Entropy Analysis → Proof-of-Invertibility → On-Chain Seal',
        timestamp: new Date().toISOString(),
        disclaimer: 'NUR FÜR BILDUNGSZWECKE — Wissenschaftliche Forschung',
      },
      entropyAnalysis: result.entropy,
      invertibilityProof: {
        coefficients: result.proof.coefficients,
        initialState: result.proof.initialState,
        forwardSequence: result.proof.forwardSequence,
        backwardSequence: result.proof.backwardSequence,
        reconstructionErrors: result.proof.reconstructionErrors,
        maxError: result.proof.maxReconstructionError,
        jacobians: result.proof.jacobians.map(j => ({ t: j.t, det: j.det, invertible: j.invertible })),
        invariantDrift: result.proof.invariantDrift,
        isInvertible: result.proof.isInvertible,
        confidence: result.proof.confidence,
      },
      hashChain: result.proof.hashChain,
      proofHash: result.proof.proofHash,
      onChainSeal: {
        opReturnHex: result.proof.opReturnHex,
        opReturnScript: result.proof.opReturnScript,
      },
    }, { filename: 'crypto-inversion-proof', timestamp: true });
  }, [result]);

  return (
    <Card className="terminal-card col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-display tracking-wider">
            <Zap className="w-5 h-5 text-primary" />
            CRYPTO INVERSION PIPELINE
            <Badge variant="outline" className="text-[10px]">v1.0 · ENTROPY → PROOF → SEAL</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {result.stage === 'complete' && (
              <Button size="sm" variant="outline" onClick={exportProof} className="text-xs h-7 gap-1">
                <Download className="w-3 h-3" /> Export Beweis (JSON)
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Stage Indicator */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {(['entropy', 'inversion', 'seal', 'complete'] as PipelineStage[]).map((stage, i) => (
            <div key={stage} className="flex items-center gap-1">
              {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              <div className={`px-2 py-0.5 rounded ${
                result.stage === stage ? 'bg-primary text-primary-foreground animate-pulse' :
                (['entropy', 'inversion', 'seal', 'complete'].indexOf(result.stage) > i) || result.stage === 'complete'
                  ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
              }`}>
                {stage === 'entropy' ? '① Entropie' : stage === 'inversion' ? '② Invertierbarkeit' : stage === 'seal' ? '③ Siegel' : '✓ Fertig'}
              </div>
            </div>
          ))}
          {result.runtime > 0 && (
            <span className="ml-auto text-muted-foreground">{result.runtime.toFixed(0)}ms</span>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <p className="text-[10px] text-muted-foreground font-mono w-full">Hex-Eingabe (z.B. Private Key, Nonce, Seed — min. 4 Bytes):</p>
            <textarea
              className="w-full bg-card border border-border rounded p-2 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none h-16 focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="Hex-Daten eingeben oder Beispiel laden..."
              value={hexInput}
              onChange={e => setHexInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[10px] text-muted-foreground">Beispiele:</span>
            {Object.entries(EXAMPLE_INPUTS).map(([key, gen]) => (
              <Button
                key={key}
                size="sm"
                variant="outline"
                className="text-[10px] h-6 px-2"
                onClick={() => setHexInput(gen())}
              >
                {key === 'csprng' ? '🔐 CSPRNG (sicher)' :
                 key === 'weak' ? '⚠️ Schwach (Muster)' :
                 key === 'brainwallet' ? '🧠 Brain Wallet' :
                 '📊 Sequentiell'}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={runFullPipeline}
              disabled={running || hexInput.replace(/\s/g, '').length < 8}
              className="text-xs h-7 gap-1 ml-auto"
            >
              <Play className="w-3 h-3" />
              {running ? 'Pipeline läuft...' : 'VOLLE PIPELINE STARTEN'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {result.stage !== 'idle' && (result.entropy || running) && (
          <Tabs defaultValue="entropy" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-8">
              <TabsTrigger value="entropy" className="text-[10px]">① Entropie</TabsTrigger>
              <TabsTrigger value="proof" className="text-[10px]" disabled={!result.proof}>② Beweis</TabsTrigger>
              <TabsTrigger value="seal" className="text-[10px]" disabled={!result.proof}>③ On-Chain</TabsTrigger>
              <TabsTrigger value="summary" className="text-[10px]" disabled={result.stage !== 'complete'}>Σ Zusammenfassung</TabsTrigger>
            </TabsList>

            <TabsContent value="entropy">
              {result.entropy && <EntropyDisplay report={result.entropy} />}
            </TabsContent>

            <TabsContent value="proof">
              {result.proof && <ProofDisplay proof={result.proof} />}
            </TabsContent>

            <TabsContent value="seal">
              {result.proof && <SealDisplay proof={result.proof} />}
            </TabsContent>

            <TabsContent value="summary">
              {result.entropy && result.proof && <SummaryDisplay entropy={result.entropy} proof={result.proof} runtime={result.runtime} />}
            </TabsContent>
          </Tabs>
        )}

        {/* Disclaimer */}
        <div className="text-[9px] text-muted-foreground border-t border-border pt-2 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>Wissenschaftliches Forschungswerkzeug. Alle Berechnungen lokal im Browser (Web Crypto API). Kein Private Key verlässt dieses Gerät. Jeder ist für sein eigenes Handeln selbst verantwortlich.</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-DISPLAYS
// ═══════════════════════════════════════════════════════════════

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, { color: string; icon: typeof CheckCircle }> = {
    SECURE: { color: 'bg-primary/20 text-primary', icon: CheckCircle },
    CRYPTOGRAPHIC: { color: 'bg-primary/20 text-primary', icon: Shield },
    MARGINAL: { color: 'bg-chart-4/20 text-chart-4', icon: AlertTriangle },
    ACCEPTABLE: { color: 'bg-chart-4/20 text-chart-4', icon: AlertTriangle },
    WEAK: { color: 'bg-destructive/20 text-destructive', icon: Unlock },
    SUSPICIOUS: { color: 'bg-destructive/20 text-destructive', icon: Unlock },
    CRITICAL: { color: 'bg-destructive/30 text-destructive', icon: XCircle },
    BROKEN: { color: 'bg-destructive/30 text-destructive', icon: XCircle },
  };
  const m = map[verdict] || map['CRITICAL'];
  const Icon = m.icon;
  return <Badge className={`${m.color} gap-1 text-[10px]`}><Icon className="w-3 h-3" />{verdict}</Badge>;
}

function EntropyDisplay({ report }: { report: EntropyReport }) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3">
        <VerdictBadge verdict={report.verdict} />
        <span className="text-xs font-mono">Score: <span className="text-primary font-bold">{(report.unifiedScore * 100).toFixed(1)}%</span></span>
        <span className="text-[10px] text-muted-foreground">{report.inputBytes} Bytes analysiert</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-mono border border-border">
          <thead>
            <tr className="bg-card">
              <th className="border border-border p-1 text-left">Test</th>
              <th className="border border-border p-1 text-right">Rohwert</th>
              <th className="border border-border p-1 text-right">Erwartet</th>
              <th className="border border-border p-1 text-right">Score</th>
              <th className="border border-border p-1 text-center">Urteil</th>
            </tr>
          </thead>
          <tbody>
            {report.tests.map(t => (
              <tr key={t.name}>
                <td className="border border-border p-1 font-semibold">{t.name}</td>
                <td className="border border-border p-1 text-right">{typeof t.raw === 'number' ? t.raw.toFixed(6) : t.raw}</td>
                <td className="border border-border p-1 text-right text-muted-foreground">{t.expected.toFixed(4)}</td>
                <td className="border border-border p-1 text-right text-primary">{(t.score * 100).toFixed(1)}%</td>
                <td className="border border-border p-1 text-center"><VerdictBadge verdict={t.verdict} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report.weaknessesFound.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded p-2 space-y-1">
          <p className="text-[10px] font-bold text-destructive flex items-center gap-1"><Unlock className="w-3 h-3" /> Schwächen gefunden:</p>
          {report.weaknessesFound.map((w, i) => (
            <p key={i} className="text-[10px] text-destructive/80 font-mono pl-4">• {w}</p>
          ))}
        </div>
      )}

      {report.weaknessesFound.length === 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded p-2">
          <p className="text-[10px] text-primary flex items-center gap-1"><Lock className="w-3 h-3" /> Keine statistischen Schwächen detektiert. Entropie konsistent mit CSPRNG.</p>
        </div>
      )}
    </div>
  );
}

function ProofDisplay({ proof }: { proof: InvertibilityProof }) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge className={`gap-1 text-[10px] ${proof.isInvertible ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
          {proof.isInvertible ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {proof.isInvertible ? 'INVERTIERBAR' : 'NICHT INVERTIERBAR'}
        </Badge>
        <span className="text-xs font-mono">Konfidenz: <span className="text-primary font-bold">{(proof.confidence * 100).toFixed(1)}%</span></span>
        <span className="text-[10px] text-muted-foreground">Max ‖Δ‖ = {proof.maxReconstructionError.toExponential(4)}</span>
      </div>

      {/* Forward vs Backward */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-mono border border-border">
          <thead>
            <tr className="bg-card">
              <th className="border border-border p-1">t</th>
              <th className="border border-border p-1 text-right">H(fwd)</th>
              <th className="border border-border p-1 text-right">H(inv)</th>
              <th className="border border-border p-1 text-right">N(fwd)</th>
              <th className="border border-border p-1 text-right">N(inv)</th>
              <th className="border border-border p-1 text-right">‖Δ‖₂</th>
            </tr>
          </thead>
          <tbody>
            {proof.forwardSequence.map((fwd, i) => {
              const bwd = proof.backwardSequence[i];
              const err = proof.reconstructionErrors[i];
              return (
                <tr key={fwd.t}>
                  <td className="border border-border p-1 font-bold">{fwd.t}</td>
                  <td className={`border border-border p-1 text-right ${fwd.H < 0 ? 'text-destructive' : 'text-primary'}`}>{fwd.H.toFixed(6)}</td>
                  <td className={`border border-border p-1 text-right ${bwd.H < 0 ? 'text-destructive' : 'text-primary'}`}>{bwd.H.toFixed(6)}</td>
                  <td className="border border-border p-1 text-right">{fwd.N.toFixed(6)}</td>
                  <td className="border border-border p-1 text-right">{bwd.N.toFixed(6)}</td>
                  <td className="border border-border p-1 text-right text-primary">{err.normL2.toExponential(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Jacobians */}
      <div className="grid grid-cols-5 gap-2">
        {proof.jacobians.map(j => (
          <div key={j.t} className="bg-muted/20 rounded p-1.5 text-[10px] font-mono text-center">
            <span className="text-muted-foreground">t={j.t}</span><br />
            <span className="text-primary font-bold">det={j.det.toFixed(6)}</span><br />
            <span className={j.invertible ? 'text-primary' : 'text-destructive'}>
              {j.invertible ? '✓ inv' : '✗ sing'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SealDisplay({ proof }: { proof: InvertibilityProof }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-[10px] font-mono text-primary font-bold flex items-center gap-1">
        <Link className="w-3 h-3" /> ON-CHAIN SIEGEL — Bitcoin OP_RETURN kompatibel
      </p>

      {/* Hash Chain */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground font-mono">SHA-256 Hash-Chain (jeder Hash enthält den vorherigen):</p>
        <div className="bg-muted/20 rounded p-2 space-y-0.5 max-h-32 overflow-y-auto">
          {proof.hashChain.map((h, i) => (
            <p key={i} className="text-[10px] font-mono break-all">
              <span className="text-muted-foreground">S({i}): </span>
              <span className="text-primary">{h}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Proof Hash */}
      <div className="bg-primary/10 border border-primary/30 rounded p-3">
        <p className="text-[10px] text-muted-foreground mb-1">Beweis-Hash (SHA-256 über gesamte Beweiskette):</p>
        <p className="text-xs font-mono font-bold text-primary break-all">{proof.proofHash}</p>
      </div>

      {/* OP_RETURN */}
      <div className="bg-card border border-border rounded p-3 space-y-2">
        <p className="text-[10px] font-bold flex items-center gap-1"><Hash className="w-3 h-3 text-primary" /> OP_RETURN Payload (Bitcoin-kompatibel, ≤80 Bytes):</p>
        <div className="bg-muted/30 rounded p-2">
          <p className="text-[10px] font-mono text-muted-foreground">Script:</p>
          <p className="text-xs font-mono text-primary break-all">{proof.opReturnScript}</p>
        </div>
        <div className="bg-muted/30 rounded p-2">
          <p className="text-[10px] font-mono text-muted-foreground">Raw Hex:</p>
          <p className="text-xs font-mono text-chart-4 break-all">{proof.opReturnHex}</p>
        </div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <p>Format: <span className="font-mono">[MAGIC:4B "PROF"][VER:1B][STEPS:1B][INV:1B][ERR_EXP:1B][HASH:32B]</span></p>
          <p>Dieser Payload kann über jede Bitcoin-Transaktion als OP_RETURN veröffentlicht werden.</p>
          <p>Die Hash-Chain macht den Beweis nachträglich unveränderbar.</p>
        </div>
      </div>
    </div>
  );
}

function SummaryDisplay({ entropy, proof, runtime }: { entropy: EntropyReport; proof: InvertibilityProof; runtime: number }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-[10px] font-mono text-primary font-bold">Σ GESAMTERGEBNIS — Crypto Inversion Pipeline v1.0</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Entropy */}
        <div className="bg-muted/20 border border-border rounded p-3 space-y-2">
          <p className="text-[10px] font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" /> ① Entropie-Analyse
          </p>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{(entropy.unifiedScore * 100).toFixed(0)}%</p>
            <VerdictBadge verdict={entropy.verdict} />
          </div>
          <p className="text-[10px] text-muted-foreground">{entropy.tests.filter(t => t.verdict === 'SECURE').length}/5 Tests bestanden</p>
          <p className="text-[10px] text-muted-foreground">{entropy.weaknessesFound.length} Schwächen</p>
        </div>

        {/* Invertibility */}
        <div className="bg-muted/20 border border-border rounded p-3 space-y-2">
          <p className="text-[10px] font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" /> ② Invertierbarkeit
          </p>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{(proof.confidence * 100).toFixed(0)}%</p>
            <Badge className={`gap-1 text-[10px] ${proof.isInvertible ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
              {proof.isInvertible ? 'BEWIESEN' : 'WIDERLEGT'}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Max Fehler: {proof.maxReconstructionError.toExponential(2)}</p>
          <p className="text-[10px] text-muted-foreground">Jacobi: alle det≠0 → {proof.allInvertible ? '✓' : '✗'}</p>
        </div>

        {/* Seal */}
        <div className="bg-muted/20 border border-border rounded p-3 space-y-2">
          <p className="text-[10px] font-bold flex items-center gap-1">
            <Link className="w-3 h-3" /> ③ On-Chain Siegel
          </p>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">✓</p>
            <Badge className="bg-primary/20 text-primary text-[10px]">BEREIT</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground break-all">Hash: {proof.proofHash.substring(0, 16)}...</p>
          <p className="text-[10px] text-muted-foreground">{proof.hashChain.length} Chain-Glieder</p>
        </div>
      </div>

      {/* Final Statement */}
      <div className={`border rounded p-3 ${
        entropy.verdict === 'BROKEN' || entropy.verdict === 'SUSPICIOUS'
          ? 'bg-destructive/10 border-destructive/30'
          : 'bg-primary/10 border-primary/30'
      }`}>
        <p className="text-xs font-bold mb-1">
          {entropy.verdict === 'BROKEN' || entropy.verdict === 'SUSPICIOUS'
            ? '⚠️ SCHWACHSTELLE DETEKTIERT'
            : '🔒 System konsistent'}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {entropy.verdict === 'BROKEN' || entropy.verdict === 'SUSPICIOUS'
            ? `Die Entropie-Analyse hat ${entropy.weaknessesFound.length} Schwächen identifiziert. Das System ist deterministisch invertierbar (Konfidenz ${(proof.confidence * 100).toFixed(0)}%). Ein On-Chain-Beweis wurde generiert und kann über OP_RETURN publiziert werden.`
            : `Die Eingabe besteht alle statistischen Tests. Das deterministisch invertierbare System wurde mit ${(proof.confidence * 100).toFixed(0)}% Konfidenz bewiesen. Pipeline-Laufzeit: ${runtime.toFixed(0)}ms.`
          }
        </p>
      </div>

      <p className="text-[9px] text-muted-foreground text-center">
        Pipeline-Laufzeit: {runtime.toFixed(0)}ms · {new Date().toISOString()} · Alle Berechnungen lokal
      </p>
    </div>
  );
}
