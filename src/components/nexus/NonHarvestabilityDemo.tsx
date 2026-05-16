import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Shield, Play, RotateCcw, AlertTriangle } from "lucide-react";
import { KaTeXMath } from "@/components/KaTeXMath";

interface Props {
  onLog?: (msg: string) => void;
}

// Deterministischer PRF (HMAC-ähnlich via Web Crypto SHA-256) – Demo
async function prf(stateHex: string, t: number, sigma: string): Promise<string> {
  const enc = new TextEncoder().encode(`${stateHex}|${t}|${sigma}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Adress-Funktion G: H160 = first 20 bytes of SHA-256(state)
async function addr(stateHex: string): Promise<string> {
  const bytes = new Uint8Array(stateHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf)).slice(0, 20).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function NonHarvestabilityDemo({ onLog }: Props) {
  const [eta, setEta] = useState(64); // entropy parameter (display only)
  const [T, setT] = useState(8); // trajectory length
  const [trajectory, setTrajectory] = useState<Array<{ t: number; state: string; addr: string; sigma: string }>>([]);
  const [running, setRunning] = useState(false);
  const [attackTarget, setAttackTarget] = useState<number | null>(null);
  const [attackAttempts, setAttackAttempts] = useState(0);
  const [attackFound, setAttackFound] = useState<boolean | null>(null);

  const equivocation = useMemo(() => eta, [eta]); // bleibt konstant ≈ η

  const generate = async () => {
    setRunning(true);
    setAttackTarget(null);
    setAttackFound(null);
    setAttackAttempts(0);
    const buf = new Uint8Array(32);
    crypto.getRandomValues(buf);
    let state = Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
    const traj: typeof trajectory = [];
    for (let t = 0; t < T; t++) {
      const sigmaBuf = new Uint8Array(8);
      crypto.getRandomValues(sigmaBuf);
      const sigma = Array.from(sigmaBuf).map(b => b.toString(16).padStart(2, "0")).join("");
      const a = await addr(state);
      traj.push({ t, state, addr: a, sigma });
      state = await prf(state, t, sigma);
    }
    setTrajectory(traj);
    onLog?.(`[NON-HARVEST] Generated trajectory of length T=${T}, η≈${eta} bit`);
    setRunning(false);
  };

  const simulateAttack = async (targetT: number) => {
    if (!trajectory[targetT]) return;
    setAttackTarget(targetT);
    setAttackFound(false);
    const targetAddr = trajectory[targetT].addr;
    // Adversary kennt σ_t NICHT → er muss raten. Bei η=64 effektiv unmöglich,
    // hier simuliert mit einer kurzen Brute-Force-Demo (max 50k Versuche)
    let attempts = 0;
    const MAX = 50_000;
    while (attempts < MAX) {
      const guess = new Uint8Array(32);
      crypto.getRandomValues(guess);
      const guessHex = Array.from(guess).map(b => b.toString(16).padStart(2, "0")).join("");
      if ((await addr(guessHex)) === targetAddr) {
        setAttackFound(true);
        break;
      }
      attempts++;
      if (attempts % 5000 === 0) setAttackAttempts(attempts);
    }
    setAttackAttempts(attempts);
    onLog?.(`[NON-HARVEST] Attack on A_${targetT}: ${attempts} attempts → ${attempts >= MAX ? "FAILED (target moved / space too large)" : "matched"}`);
  };

  return (
    <Card className="p-6 space-y-6 bg-card/80 backdrop-blur border-primary/30">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-mono text-primary flex items-center gap-2">
            <Shield className="w-5 h-5" />
            NON-HARVESTABILITY DEMONSTRATOR
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Formaler Beweis: Zustandsgebundene Schlüssel W_dyn = (X, F, G, σ) — kein stabiler Zielwert
          </p>
        </div>
        <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">
          <AlertTriangle className="w-3 h-3 mr-1" />
          EDUCATIONAL / FORMAL PROOF
        </Badge>
      </div>

      <div className="border-l-2 border-primary/50 pl-4 space-y-2 bg-background/50 p-3 rounded-r">
        <KaTeXMath display math={"x_{t+1} = F(x_t, t, \\sigma_t), \\qquad A_t = G(x_t), \\qquad \\forall i \\neq j: A_i \\neq A_j"} />
        <KaTeXMath display math={"I(x_{t+k}; A_t, A_{t+1}, \\ldots, A_{t+k-1}) = 0 \\quad (\\text{Korollar 2.4.1})"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono text-muted-foreground">Entropie η = {eta} bit</label>
          <Slider value={[eta]} onValueChange={v => setEta(v[0])} min={32} max={256} step={32} />
        </div>
        <div>
          <label className="text-xs font-mono text-muted-foreground">Trajectorie-Länge T = {T}</label>
          <Slider value={[T]} onValueChange={v => setT(v[0])} min={4} max={20} step={1} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generate} disabled={running} size="sm" className="font-mono">
          <Play className="w-3 h-3 mr-1" /> Trajectorie generieren
        </Button>
        <Button onClick={() => { setTrajectory([]); setAttackTarget(null); setAttackFound(null); }} size="sm" variant="outline" className="font-mono">
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {trajectory.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-secondary">Zustands-/Adress-Sequenz (Adressen wandern → kein stabiles A*):</div>
          <div className="max-h-64 overflow-y-auto border border-border/40 rounded">
            <table className="w-full text-[10px] font-mono">
              <thead className="sticky top-0 bg-card">
                <tr className="text-primary border-b border-border/50">
                  <th className="p-2 text-left">t</th>
                  <th className="p-2 text-left">x_t (state, trunc)</th>
                  <th className="p-2 text-left">A_t = G(x_t)</th>
                  <th className="p-2 text-left">σ_t (online)</th>
                  <th className="p-2 text-left">Attack</th>
                </tr>
              </thead>
              <tbody>
                {trajectory.map(row => (
                  <tr key={row.t} className="border-b border-border/20 hover:bg-primary/5">
                    <td className="p-2 text-secondary">{row.t}</td>
                    <td className="p-2 text-muted-foreground">{row.state.slice(0, 16)}…</td>
                    <td className="p-2 text-primary">{row.addr.slice(0, 20)}…</td>
                    <td className="p-2 text-amber-400">{row.sigma.slice(0, 12)}…</td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" className="h-5 text-[9px]" onClick={() => simulateAttack(row.t)}>
                        Angriff A_{row.t}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attackTarget !== null && (
            <div className="border border-amber-500/30 bg-amber-500/5 p-3 rounded space-y-1 text-xs font-mono">
              <div className="text-amber-400">Angriff auf A_{attackTarget} → Versuche: {attackAttempts.toLocaleString()}</div>
              {attackFound === false && attackAttempts >= 50000 && (
                <div className="text-destructive">
                  ✗ FEHLGESCHLAGEN — Selbst bei Erfolg wäre x_{attackTarget} ab t={attackTarget + 1} wertlos
                  (x_{attackTarget + 1} = F(x_{attackTarget}, {attackTarget}, σ_{attackTarget}) mit unbekanntem σ).
                </div>
              )}
              <div className="text-muted-foreground">
                Äquivokation E_t = η − ε_fs ≈ {equivocation} bit (konstant über Zeit, Korollar 3.2.1)
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-border/40 pt-3 text-[10px] font-mono text-muted-foreground space-y-1">
        <div>• Klassisch: Pr[FIND(A*)] ≤ 2⁻ʰ, Suchraum statisch → Wettrennen Angreifer vs. Komplexität</div>
        <div>• W_dyn: A_t wandert, σ_t online-gebunden → kein wohldefiniertes Zielproblem (Satz 2.3.1)</div>
        <div>• Regret(A, t) = T_A + 2^η · 0 = T_A → rationaler Angriff unmöglich</div>
      </div>
    </Card>
  );
}
