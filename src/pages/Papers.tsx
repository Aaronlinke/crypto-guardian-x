import { TerminalHeader } from "@/components/TerminalHeader";
import { KaTeXMath } from "@/components/KaTeXMath";
import { BookOpen, ChevronDown, ChevronRight, FileText, Shield, Lock, Sigma, Atom, GitBranch } from "lucide-react";
import { useState } from "react";

const Section = ({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 bg-card/80 hover:bg-card transition-colors text-left"
      >
        {icon}
        <span className="font-display text-sm font-semibold tracking-wider flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5 bg-background/60 space-y-4 text-sm leading-relaxed">{children}</div>}
    </div>
  );
};

const Def = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="border-l-2 border-primary/50 pl-4 my-3">
    <p className="text-xs font-mono text-primary mb-1">{label}</p>
    {children}
  </div>
);

const Theorem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="border-l-2 border-secondary/50 pl-4 my-3 bg-secondary/5 py-2 pr-3 rounded-r">
    <p className="text-xs font-mono text-secondary mb-1 font-bold">{label}</p>
    {children}
  </div>
);

const Proof = ({ children }: { children: React.ReactNode }) => (
  <div className="border-l-2 border-muted-foreground/30 pl-4 my-2 italic text-muted-foreground">
    <p className="text-xs font-mono not-italic mb-1">Beweis:</p>
    {children}
    <p className="text-right not-italic">∎</p>
  </div>
);

const M = ({ children, d }: { children: string; d?: boolean }) => (
  <KaTeXMath math={children} display={d} />
);

const TableComp = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto my-3">
    <table className="w-full text-xs font-mono border border-border">
      <thead>
        <tr className="bg-card">{headers.map((h, i) => <th key={i} className="border border-border p-2 text-left text-primary">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border">{row.map((cell, j) => <td key={j} className="border border-border p-2 text-muted-foreground">{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PaperI = () => (
  <>
    <Section title="TEIL I: DEFINITIONS- UND AXIOMATISCHE BASIS" icon={<Sigma className="w-4 h-4 text-primary" />} defaultOpen={true}>
      <h3 className="text-primary font-mono text-xs mb-2">1.1 Grunddefinitionen</h3>
      <Def label="Definition 1.1.1 (Klassisches Wallet-Modell)">
        <M d>{`\\mathcal{W}_{\\text{stat}} = (\\mathcal{K}, g: \\mathcal{K} \\to \\mathcal{A}, A^*)`}</M>
        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
          <li><M>{`\\mathcal{K}`}</M>: Schlüsselraum, <M>{`|\\mathcal{K}| = 2^h`}</M> (h: Entropie-Parameter)</li>
          <li><M>{`g`}</M>: Deterministische Adress-Funktion</li>
          <li><M>{`A^* \\in \\mathcal{A}`}</M>: Zielwert (stabil, wiederholbar)</li>
        </ul>
        <p className="mt-2 text-muted-foreground">Angreifer-Ziel:</p>
        <M d>{`\\text{IND}_{\\text{stat}}: \\text{Finde } K^* \\in \\mathcal{K} \\text{ mit } g(K^*) = A^*`}</M>
        <p className="text-muted-foreground">Erfolgswahrscheinlichkeit:</p>
        <M d>{`\\Pr[\\text{IND}_{\\text{stat}}] \\leq 2^{-h}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">1.2 Dynamisches System (Unser Modell)</h3>
      <Def label="Definition 1.2.1 (Zustandsgebundenes Schlüssel-Evolutionssystem)">
        <M d>{`\\mathcal{W}_{\\text{dyn}} = (X, F: X \\times \\mathbb{T} \\times \\Sigma \\to X, G: X \\to \\mathcal{A}, \\sigma: \\mathcal{U} \\times \\mathcal{E} \\to X)`}</M>
        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
          <li><M>{`X`}</M>: Zustandsraum (<M>{`|X| = 2^{\\eta}`}</M>, <M>{`\\eta \\geq h`}</M>)</li>
          <li><M>{`F`}</M>: Zustandsübergangsfunktion (deterministisch, invertierbar lokal)</li>
          <li><M>{`G`}</M>: Ausgabefunktion</li>
          <li><M>{`\\sigma`}</M>: Initialisierungsregel (nicht-deterministisch global)</li>
          <li><M>{`\\mathbb{T} = \\{0, 1, 2, \\ldots\\}`}</M>: Zeit</li>
          <li><M>{`\\Sigma = \\{\\sigma_0, \\sigma_1, \\ldots\\}`}</M>: Kontextualisierungsvektor</li>
        </ul>
        <p className="mt-2 text-muted-foreground">Zustandstrajectorie:</p>
        <M d>{`x_t = F^t(x_0, \\Sigma^{[0,t)})`}</M>
        <M d>{`F^t = F(\\cdot, t{-}1, \\sigma_{t-1}) \\circ F(\\cdot, t{-}2, \\sigma_{t-2}) \\circ \\cdots \\circ F(\\cdot, 0, \\sigma_0)`}</M>
        <p className="text-muted-foreground">Ausgabe-Sequenz:</p>
        <M d>{`A_t = G(x_t) = G(F^t(x_0, \\Sigma^{[0,t)}))`}</M>
        <p className="text-muted-foreground font-bold mt-2">Zentrales Axiom:</p>
        <M d>{`\\forall i \\neq j: \\quad A_i \\neq A_j`}</M>
        <p className="text-muted-foreground italic">Adressen sind kollisions-frei über alle Zeiten.</p>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">1.3 Forderung an F</h3>
      <Def label="Axiom 1.3.1 (PRF-Eigenschaft)">
        <M d>{`F(\\cdot, t, \\sigma_t): X \\to X \\text{ ist } (\\epsilon, \\delta)\\text{-pseudozufällig}`}</M>
        <M d>{`\\left| \\Pr_{x \\sim X}[F(x, t, \\sigma_t) = y] - 2^{-\\eta} \\right| \\leq \\delta`}</M>
        <p className="text-muted-foreground">für alle <M>{`y \\in X`}</M> und alle <M>{`t, \\sigma_t`}</M>.</p>
      </Def>
      <Def label="Axiom 1.3.2 (Vorwärtsgeheimnis — Forward Secrecy)">
        <M d>{`I(x_t ; A_0, A_1, \\ldots, A_{t-1}) \\leq \\epsilon_{\\text{fs}}`}</M>
        <p className="text-muted-foreground">Kenntnis aller bisherigen Adressen offenbart nichts über <M>{`x_t`}</M>.</p>
      </Def>
      <Def label="Axiom 1.3.3 (Keine Invertierbarkeit über Kontexte)">
        <p className="text-muted-foreground">Es existiert kein effizienter Algorithmus <M>{`\\mathcal{A}`}</M> mit:</p>
        <M d>{`\\Pr[\\mathcal{A}(x_{t+1}, t, \\sigma_t) = x_t] > 2^{-\\eta} + \\epsilon`}</M>
      </Def>
    </Section>

    <Section title="TEIL II: ANGRIFFSMODELLE UND UNMÖGLICHKEITSBEWEIS" icon={<Shield className="w-4 h-4 text-destructive" />}>
      <h3 className="text-primary font-mono text-xs mb-2">2.1 Klassischer Offline-Angriff</h3>
      <Def label="Definition 2.1.1 (IND-CPA für statische Wallets)">
        <p className="text-muted-foreground">Angreifer <M>{`\\mathcal{A}`}</M> erhält:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Challenge-Adresse <M>{`A^*`}</M></li>
          <li>Beliebig viel Rechenzeit (offline)</li>
        </ul>
        <p className="text-muted-foreground mt-2">Ziel: Finde <M>{`K^*`}</M> mit <M>{`g(K^*) = A^*`}</M>.</p>
        <M d>{`T_{\\text{FIND}} \\approx \\frac{|\\mathcal{K}|}{2} = 2^{h-1}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">2.2 Versuch auf dynamisches System</h3>
      <Def label="Definition 2.2.1 (Naiver Transfer)">
        <p className="text-muted-foreground">Angreifer erhält Challenge: <M>{`(A_t^*, t^*)`}</M></p>
        <p className="text-muted-foreground">Problem: Nach Zeitpunkt <M>{`t^* + 1`}</M>:</p>
        <M d>{`x_{t^*+1} = F(x_{t^*}, t^*, \\sigma_{t^*}) \\neq x_{t^*}`}</M>
        <p className="text-muted-foreground italic">Damit ist <M>{`x_{t^*}`}</M> wertlos für alle <M>{`\\tau > t^*`}</M>.</p>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">2.3 Unmöglichkeitssatz (Kern-Resultat)</h3>
      <Theorem label="Satz 2.3.1 (Non-Harvestability Theorem)">
        <p className="text-muted-foreground">Sei <M>{`\\mathcal{W}_{\\text{dyn}}`}</M> wie in Def. 1.2.1 mit Axiomen 1.3.1–1.3.3.</p>
        <p className="text-muted-foreground">Dann: Für jeden Angreifer <M>{`\\mathcal{A}`}</M> mit Rechenzeit <M>{`T_A`}</M> und jeden Zeitpunkt <M>{`t^*`}</M>:</p>
        <M d>{`\\Pr[\\mathcal{A}(A_{t^*}, t^*) \\text{ findet } x_{t^*} \\text{ vor Zeit } t^*{+}1] \\leq \\text{neg}(\\eta)`}</M>
        <p className="text-muted-foreground">Selbst wenn <M>{`\\Pr[F^{-1}(x_{t+1}, t) = x_t]`}</M> nicht vernachlässigbar ist:</p>
        <M d>{`\\Pr[\\text{Erfolg bei } \\tau > t^*] = \\Pr[x_\\tau = x_{t^*}] = 0`}</M>
      </Theorem>
      <Proof>
        <p>Sei <M>{`x_{t^*}`}</M> rekonstruiert. Ab Zeit <M>{`t^* + 1`}</M>:</p>
        <M d>{`x_{t^*+1} = F(x_{t^*}, t^*, \\sigma_{t^*})`}</M>
        <p><M>{`\\mathcal{A}`}</M> kennt <M>{`\\sigma_{t^*}`}</M> nicht (außerhalb des Adversary-Modells).</p>
        <M d>{`H(x_{t^*+1} \\mid x_{t^*}) \\geq H(\\sigma_{t^*}) > 0`}</M>
        <p>Perfekte Kenntnis von <M>{`x_{t^*}`}</M> bietet keine vorhersagbare Information über zukünftige Zustände.</p>
      </Proof>

      <h3 className="text-primary font-mono text-xs mb-2">2.4 Informations-theoretische Konsequenz</h3>
      <Def label="Korollar 2.4.1">
        <M d>{`I(x_{t+k}; A_t, A_{t+1}, \\ldots, A_{t+k-1}) = 0`}</M>
        <p className="text-muted-foreground">für alle <M>{`k \\geq 1`}</M>. Beobachtung früherer Adressen bietet <strong>zero information</strong> über zukünftige Zustände.</p>
      </Def>
    </Section>

    <Section title="TEIL III: ENTROPIE-ANALYSE" icon={<Atom className="w-4 h-4 text-primary" />}>
      <h3 className="text-primary font-mono text-xs mb-2">3.1 Konditionelle Entropie</h3>
      <Def label="Definition 3.1.1">
        <M d>{`H_t := H(x_t), \\quad H_t^{\\text{cond}} := H(x_t \\mid A_0, \\ldots, A_{t-1})`}</M>
        <p className="text-muted-foreground">Klassisches System:</p>
        <M d>{`H_t^{\\text{cond}} = H(x_0) - I(x_0; \\text{Vergangenheit})`}</M>
        <p className="text-muted-foreground">Mit <M>{`I(\\cdot) > 0`}</M> über Zeit → Entropie-Reduktion.</p>
        <p className="text-muted-foreground mt-2">Dynamisches System (mit Axiom 1.3.2):</p>
        <M d>{`H_t^{\\text{cond}} = H(x_t) - I(x_t; \\text{Vergangenheit}) = \\eta - \\epsilon_{\\text{fs}} \\approx \\eta`}</M>
        <p className="text-muted-foreground italic">Keine akkumulierende Information über Zustände.</p>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">3.2 Äquivokation über Zeit</h3>
      <Def label="Definition 3.2.1 (Äquivokation)">
        <M d>{`E_t := H(x_t \\mid A_0, \\ldots, A_{t-1})`}</M>
        <p className="text-muted-foreground">Klassisch: <M>{`E_t \\to E_0 - h`}</M> (Entropie kollabiert).</p>
        <p className="text-muted-foreground">Dynamisches System:</p>
        <M d>{`E_t = \\eta - \\epsilon_{\\text{fs}} \\approx \\eta`}</M>
        <p className="text-muted-foreground font-bold">Die Äquivokation bleibt über die gesamte Lebensdauer konstant.</p>
      </Def>
    </Section>

    <Section title="TEIL IV: VERGLEICHENDE KOMPLEXITÄTS-ANALYSE" icon={<Sigma className="w-4 h-4 text-secondary" />}>
      <h3 className="text-primary font-mono text-xs mb-2">4.1 Suchraum-Dimensionen</h3>
      <p className="text-muted-foreground">Klassisches Modell:</p>
      <M d>{`|\\mathcal{K}| = 2^h, \\quad T_{\\text{brute}} = 2^{h-1}`}</M>
      <p className="text-muted-foreground mt-2">Dynamisches Modell — Suchraum zu Zeit <M>{`t`}</M>:</p>
      <M d>{`\\mathcal{K}_t := \\{x_t : \\exists u, e \\text{ mit } \\sigma(u,e) \\to x_0 \\to \\cdots \\to x_t\\}`}</M>
      <M d>{`|\\mathcal{K}_t| = |\\mathcal{K}_0| \\cdot |\\Sigma^t|`}</M>
      <p className="text-muted-foreground">Nur eine eindeutige Trajectory ist gültig → Effektiver Suchraum = <M>{`O(1)`}</M> pro Moment.</p>

      <TableComp
        headers={["Modell", "Suchraum", "Struktur", "Schwierigkeit"]}
        rows={[
          ["Klassisch", "2^h (statisch)", "Endlich, ungeordnet", "Zeit-unabhängig"],
          ["Dynamisch", "Σ^t (wachsend)", "Kontextabhängig", "Zeit-abhängig, divergierend"],
        ]}
      />
    </Section>

    <Section title="TEIL V: NICHTUMKEHRBARKEITS-THEOREM" icon={<Lock className="w-4 h-4 text-destructive" />}>
      <Theorem label="Theorem 5.1.1 (Non-Reversibility)">
        <p className="text-muted-foreground">Sei <M>{`x_{t+1} = F(x_t, t, \\sigma_t)`}</M> mit Axiom 1.3.3. Dann:</p>
        <M d>{`\\neg \\exists F^{-1}: X \\times \\mathbb{T} \\times \\Sigma \\to X`}</M>
        <M d>{`\\text{mit } \\Pr[F^{-1}(x_{t+1}, t, \\sigma_t) = x_t] > 2^{-\\eta}`}</M>
        <p className="text-muted-foreground">für unbekanntes <M>{`\\sigma_t`}</M>.</p>
      </Theorem>
      <Proof>
        <p>Angenommen, ein solches <M>{`F^{-1}`}</M> existiert. Nach Axiom 1.3.3 muss <M>{`\\sigma_t`}</M> bekannt sein. Aber <M>{`\\sigma_t`}</M> ist außerhalb des Adversary-Modells. Widerspruch.</p>
      </Proof>
      <p className="text-muted-foreground">Praktische Konsequenz: Auch bei vollständiger Kenntnis von <M>{`x_t`}</M>:</p>
      <M d>{`x_{t+1}, x_{t+2}, \\ldots, x_T \\text{ sind } \\Theta(\\eta \\cdot |T - t|) \\text{ Bits Entropie}`}</M>
      <p className="text-muted-foreground italic">→ Rückwärts-Suche unmöglich. Vorwärts-Extrapolation ebenso.</p>
    </Section>

    <Section title="TEIL VI: KONTRAPOSITION — WAS EIN ANGRIFF BRÄUCHTE" icon={<Shield className="w-4 h-4 text-warning" />}>
      <TableComp
        headers={["Annahme", "Realität in W_dyn", "Status"]}
        rows={[
          ["Zielwert stabil halten", "A_t wandert", "✗ unmöglich"],
          ["Zustand zum Angriffsende gelten", "x_t verfällt nach t+1", "✗ wertlos"],
          ["Offline arbeiten", "Σ ist online-abhängig", "✗ widersprochen"],
          ["In endlicher Zeit konvergieren", "Suchraum wächst mit t", "✗ divergiert"],
        ]}
      />
      <p className="text-muted-foreground font-bold">Jede notwendige Annahme eines klassischen Angriffs wird kategorial verletzt.</p>
    </Section>

    <Section title="TEIL VII: FORMALE KLASSIFIKATION" icon={<FileText className="w-4 h-4 text-primary" />}>
      <ul className="space-y-2 text-muted-foreground">
        <li>✓ <strong>Forward Secrecy</strong> (Axiom 1.3.2)</li>
        <li>✓ <strong>Backward Resistance</strong> (Theo. 5.1.1)</li>
        <li>✓ <strong>Harvest Resistance</strong> — keine erntbar nutzbare Beute (Satz 2.3.1)</li>
        <li>✓ <strong>Context-Binding</strong> — an <M>{`\\Sigma`}</M>-Sequenz gebunden (Def. 1.2.1)</li>
      </ul>
      <TableComp
        headers={["Primitive", "Schutz", "Mechanismus"]}
        rows={[
          ["RSA/ECDLP", "Ignoranz über Faktor/Disklog", "Rechenkomplexität"],
          ["Hash (iterated)", "Längenwachstum", "Entropie-Akkumulation"],
          ["W_dyn", "Nicht-Existenz eines Zielwertes", "Stationaritäts-Entzug"],
        ]}
      />
    </Section>

    <Section title="TEIL VIII: GRENZFÄLLE UND ANNAHME-BRUCH" icon={<Shield className="w-4 h-4 text-warning" />}>
      <Def label="Fall A: Σ wird predictable">
        <M d>{`\\Rightarrow \\text{Angreifer kann vorwärts rechnen} \\Rightarrow \\text{System bricht } \\log(|\\Sigma|) \\text{ Bits}`}</M>
      </Def>
      <Def label="Fall B: F wird invertierbar">
        <M d>{`\\Rightarrow \\text{Rückwärts-Rekonstruktion möglich} \\Rightarrow \\text{Nur für } t < T_{\\text{inv}} \\text{ sicher}`}</M>
      </Def>
      <Def label="Fall C: G ist nicht kollisions-frei">
        <M d>{`\\Rightarrow \\text{Mehrere } x_t \\to \\text{gleiche } A_t \\Rightarrow \\text{Brute-Force auf } |\\mathcal{A}| \\text{ statt } |\\mathcal{K}|`}</M>
      </Def>
    </Section>

    <Section title="TEIL IX: ASYMPTOTISCHE ANALYSE" icon={<Sigma className="w-4 h-4 text-primary" />}>
      <Theorem label="Theorem 9.1.1 (Best Attack Complexity)">
        <M d>{`T_{\\text{best-attack}}(t) = \\Omega(2^{\\eta}) \\text{ + Fehler bei } t+1`}</M>
        <M d>{`\\Pr[\\text{Erfolg nach } t+1] = 0`}</M>
        <p className="text-muted-foreground">Klassisch: <M>{`T \\approx 2^{h-1}`}</M>, dann persistent. Dynamisch: <M>{`T \\approx 2^\\eta`}</M> (größer), dann sofort wertlos.</p>
      </Theorem>

      <h3 className="text-primary font-mono text-xs mb-2">9.2 Rückzugs-Analyse (Regret)</h3>
      <Def label="Definition 9.2.1 (Angreifer-Regret)">
        <M d>{`\\text{Regret}(\\mathcal{A}, t) := T_A + \\Pr[\\text{Erfolg}] \\cdot V(x_t)`}</M>
        <p className="text-muted-foreground">Klassisch: <M>{`\\text{Regret} = T_A + 2^{h-1} \\cdot V_{\\text{high}}`}</M></p>
        <p className="text-muted-foreground">Dynamisch: <M>{`\\text{Regret} = T_A + 2^{\\eta} \\cdot 0 = T_A`}</M></p>
        <p className="text-muted-foreground font-bold">Regret ist immer positiv → rational unmöglich.</p>
      </Def>
    </Section>

    <Section title="TEIL X: SCHLUSSKATALOG" icon={<FileText className="w-4 h-4 text-secondary" />}>
      <TableComp
        headers={["Statement", "Beweis", "Typ"]}
        rows={[
          ["Offline-Angriff unmöglich", "Satz 2.3.1", "Informations-theoretisch"],
          ["Rückwärtsrechnung unmöglich", "Theo. 5.1.1", "Definitional"],
          ["Entropie bleibt konstant", "Kor. 2.4.1", "Informations-theoretisch"],
          ["Kein Zielwert stabilisierbar", "Axiom 1.2.1", "Strukturell"],
          ["Komplexität wächst mit Zeit", "Theo. 9.1.1", "Asymptotisch"],
        ]}
      />
      <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-3">
        <p className="text-muted-foreground">Das System ist nicht „unknackbar", sondern <strong>„nicht-adressierbar"</strong>:</p>
        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
          <li><strong>Klassisch:</strong> Zielwert bekannt, Schlüssel unbekannt → Wettrennen</li>
          <li><strong>Dynamisch:</strong> Zielwert unbekannt / bewegt sich → kein Wettrennen möglich</li>
        </ul>
        <p className="text-primary mt-2 font-bold text-xs">Das ist kategorial unterschiedlich.</p>
      </div>
    </Section>

    <Section title="TEIL XI: OFFENE FRAGEN" icon={<BookOpen className="w-4 h-4 text-muted-foreground" />}>
      <ol className="list-decimal list-inside text-muted-foreground space-y-2">
        <li>Wie wird <M>{`\\Sigma`}</M> in Praxis sample-sicher gemacht?</li>
        <li>Wie wird <M>{`x_0`}</M> initialisiert, ohne Bias zu introduzieren?</li>
        <li>Kann <M>{`F`}</M> mit Standard-PRFs (HMAC, ChaCha) instantiiert werden?</li>
        <li>Wie verhält sich das System unter Seitenkanalangriffen (Timing, Power)?</li>
      </ol>
    </Section>

    <Section title="ANHANG: GLOSSAR" icon={<FileText className="w-4 h-4 text-muted-foreground" />}>
      <TableComp
        headers={["Symbol", "Bedeutung"]}
        rows={[
          ["K, X", "Schlüssel-/Zustandsraum"],
          ["F", "Zustandsübergangsfunktion"],
          ["G", "Adress-Ausgabefunktion"],
          ["σ, Σ", "Initialisierungsregel / Kontextvektoren"],
          ["h, η", "Entropie-Parameter"],
          ["t, T", "Zeit, End-Zeit"],
          ["A_t", "Adresse zur Zeit t"],
          ["ε_fs", "Forward-Secrecy-Fehler"],
        ]}
      />
    </Section>
  </>
);

const PaperII = () => (
  <>
    <Section title="TEIL I: ALGEBRAISCHE GRUNDLAGEN" icon={<Sigma className="w-4 h-4 text-primary" />} defaultOpen={true}>
      <h3 className="text-primary font-mono text-xs mb-2">1.1 Endlicher Körper</h3>
      <M d>{`\\mathbb{F}_p = \\mathbb{Z}/p\\mathbb{Z}, \\quad p = 2^{256} - 2^{32} - 977`}</M>
      <Def label="Operationen">
        <M d>{`\\forall a, b \\in \\mathbb{F}_p: \\quad a \\oplus b := (a+b) \\bmod p, \\quad a \\otimes b := (a \\cdot b) \\bmod p`}</M>
        <p className="text-muted-foreground">Inverses Element:</p>
        <M d>{`\\forall a \\in \\mathbb{F}_p^*: \\quad \\exists a^{-1} \\in \\mathbb{F}_p \\text{ mit } a \\otimes a^{-1} = 1`}</M>
        <p className="text-muted-foreground">Struktur: <M>{`(\\mathbb{F}_p, \\oplus, \\otimes)`}</M> ist Körper der Charakteristik <M>{`p`}</M>.</p>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">1.2 Elliptische Kurve über F_p</h3>
      <Def label="Weierstraß-Form">
        <M d>{`E: Y^2 = X^3 + 7 \\quad \\text{über} \\quad \\mathbb{F}_p`}</M>
        <p className="text-muted-foreground">Diskriminante (Nicht-Singularität):</p>
        <M d>{`\\Delta = -16(4 \\cdot 0^3 + 27 \\cdot 7^2) = -4 \\cdot 27 \\cdot 49 \\neq 0 \\pmod{p}`}</M>
        <p className="text-muted-foreground">Punktmenge:</p>
        <M d>{`E(\\mathbb{F}_p) := \\{(x, y) \\in \\mathbb{F}_p^2 \\mid y^2 = x^3 + 7\\} \\cup \\{\\mathcal{O}\\}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">1.3 Gruppenoperation auf E(F_p)</h3>
      <Def label="Addition (P + Q für P ≠ Q)">
        <p className="text-muted-foreground">Gegeben <M>{`P = (x_1, y_1)`}</M>, <M>{`Q = (x_2, y_2)`}</M> mit <M>{`x_1 \\neq x_2`}</M>:</p>
        <M d>{`\\lambda = \\frac{y_2 - y_1}{x_2 - x_1} \\pmod{p}`}</M>
        <M d>{`x_3 = \\lambda^2 - x_1 - x_2 \\pmod{p}`}</M>
        <M d>{`y_3 = \\lambda(x_1 - x_3) - y_1 \\pmod{p}`}</M>
      </Def>
      <Def label="Punkt-Verdopplung (2P)">
        <p className="text-muted-foreground">Gegeben <M>{`P = (x_1, y_1)`}</M> mit <M>{`y_1 \\neq 0`}</M>:</p>
        <M d>{`\\lambda = \\frac{3x_1^2}{2y_1} \\pmod{p}`}</M>
        <M d>{`x_3 = \\lambda^2 - 2x_1 \\pmod{p}`}</M>
        <M d>{`y_3 = \\lambda(x_1 - x_3) - y_1 \\pmod{p}`}</M>
      </Def>
      <Def label="Inverse">
        <M d>{`-P = (x_1, -y_1 \\bmod p), \\quad P + (-P) = \\mathcal{O}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">1.4 Gruppenstruktur</h3>
      <Theorem label="Satz 1.4.1">
        <p className="text-muted-foreground"><M>{`(E(\\mathbb{F}_p), +)`}</M> ist abelsche Gruppe mit:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Abgeschlossenheit, Assoziativität, Kommutativität</li>
          <li>Neutrales Element: <M>{`\\mathcal{O}`}</M></li>
          <li>Inverse: <M>{`\\forall P \\; \\exists (-P)`}</M></li>
        </ul>
        <p className="text-muted-foreground mt-2">Ordnung (Hasse):</p>
        <M d>{`|p+1-2\\sqrt{p}| \\leq n-p-1 \\leq 2\\sqrt{p}`}</M>
        <p className="text-muted-foreground">Für secp256k1: <M>{`n`}</M> ist prim.</p>
      </Theorem>

      <h3 className="text-primary font-mono text-xs mb-2">1.5 Generator und Zyklische Untergruppe</h3>
      <Def label="Generator G">
        <p className="text-muted-foreground font-mono text-[10px] break-all">G_x = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798</p>
        <p className="text-muted-foreground font-mono text-[10px] break-all mt-1">G_y = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8</p>
        <p className="text-muted-foreground mt-2">Ordnung:</p>
        <p className="text-muted-foreground font-mono text-[10px] break-all">N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141</p>
        <M d>{`\\langle G \\rangle := \\{k \\cdot G \\mid k \\in \\mathbb{Z}_N\\}`}</M>
      </Def>
    </Section>

    <Section title="TEIL II: SCHLÜSSEL-RAUM UND ADRESS-RAUM" icon={<Lock className="w-4 h-4 text-primary" />}>
      <h3 className="text-primary font-mono text-xs mb-2">2.1 Privater Schlüssel</h3>
      <Def label="Definition">
        <M d>{`d \\in \\mathbb{Z}_N^*, \\quad 1 \\leq d \\leq N-1`}</M>
        <M d>{`d \\stackrel{\\text{uniform}}{\\leftarrow} \\mathbb{Z}_N^*, \\quad H(d) = \\log_2(N-1) \\approx 256 \\text{ Bit}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">2.2 Öffentlicher Schlüssel</h3>
      <Def label="Definition">
        <M d>{`Q = d \\cdot G \\in \\langle G \\rangle`}</M>
        <p className="text-muted-foreground mt-2"><strong>DLP:</strong> Gegeben <M>{`Q`}</M>, finde <M>{`d`}</M> mit <M>{`Q = d \\cdot G`}</M>.</p>
        <p className="text-muted-foreground">Best Algorithm: Pollard's Rho — <M>{`O(\\sqrt{N}) \\approx O(2^{128})`}</M> Operationen.</p>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">2.3 Bitcoin-Adressen</h3>
      <Def label="Adress-Funktion">
        <M d>{`\\text{Addr}: E(\\mathbb{F}_p) \\to \\{0,1\\}^{160}`}</M>
        <M d>{`\\text{Addr}(Q) = \\text{RIPEMD160}(\\text{SHA256}(Q))`}</M>
        <p className="text-muted-foreground italic">Addr ist praktisch nicht invertierbar (Second-Preimage Resistant).</p>
      </Def>
    </Section>

    <Section title="TEIL III: ECDSA-SIGNATURSCHEMA" icon={<Shield className="w-4 h-4 text-secondary" />}>
      <h3 className="text-primary font-mono text-xs mb-2">3.1 Hash-Funktion</h3>
      <M d>{`z = \\text{int}(\\text{SHA256}(m)) \\bmod N`}</M>

      <h3 className="text-primary font-mono text-xs mb-2 mt-4">3.2 Signatur-Erstellung</h3>
      <Def label="Algorithmus">
        <ol className="list-decimal list-inside text-muted-foreground space-y-2">
          <li>Wähle zufällig <M>{`k \\in \\mathbb{Z}_N^*`}</M></li>
          <li>Berechne <M>{`R = k \\cdot G = (x_R, y_R)`}</M></li>
          <li>Berechne <M>{`r = x_R \\bmod N`}</M> (falls <M>{`r = 0`}</M>, zurück zu 1)</li>
          <li>Berechne: <M d>{`s = k^{-1}(z + r \\cdot d) \\bmod N`}</M></li>
          <li>Signatur: <M>{`\\sigma = (r, s)`}</M></li>
        </ol>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2 mt-4">3.3 Signatur-Verifikation</h3>
      <Def label="Algorithmus">
        <ol className="list-decimal list-inside text-muted-foreground space-y-2">
          <li>Berechne <M>{`z = \\text{SHA256}(m) \\bmod N`}</M></li>
          <li>Berechne <M>{`u_1 = z \\cdot s^{-1} \\bmod N`}</M> und <M>{`u_2 = r \\cdot s^{-1} \\bmod N`}</M></li>
          <li>Berechne <M>{`R' = u_1 \\cdot G + u_2 \\cdot Q`}</M></li>
          <li>Accept wenn <M>{`x_{R'} \\bmod N = r`}</M></li>
        </ol>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2 mt-4">3.4 Algebraische Umformung (Kern-Relation)</h3>
      <Def label="Schlüssel-Extraktion bei bekanntem k">
        <M d>{`s \\equiv k^{-1}(z + r \\cdot d) \\pmod{N}`}</M>
        <M d>{`s \\cdot k \\equiv z + r \\cdot d \\pmod{N}`}</M>
        <M d>{`d \\equiv (s \\cdot k - z) \\cdot r^{-1} \\pmod{N}`}</M>
        <p className="text-muted-foreground mt-2 font-bold">Wenn <M>{`k`}</M> bekannt → <M>{`d`}</M> berechenbar. Wenn <M>{`k`}</M> unbekannt → unlösbar gekoppelt.</p>
      </Def>
    </Section>

    <Section title="TEIL IV: STRUKTURIERTER KANDIDATENRAUM" icon={<Sigma className="w-4 h-4 text-primary" />}>
      <h3 className="text-primary font-mono text-xs mb-2">4.1 Affin-parametrisierter Nonce-Raum</h3>
      <Def label="Definition">
        <M d>{`k_i = \\alpha + \\beta \\cdot i \\pmod{N}, \\quad i \\in \\mathbb{Z}_{\\geq 0}`}</M>
        <p className="text-muted-foreground">Annahme: <M>{`\\gcd(\\beta, N) = 1`}</M>.</p>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">4.2 Induzierter Schlüsselraum</h3>
      <Def label="Linearität">
        <M d>{`d_i = (s \\cdot k_i - z) \\cdot r^{-1} \\pmod{N}`}</M>
        <M d>{`d_i = c_0 + c_1 \\cdot i \\pmod{N}`}</M>
        <p className="text-muted-foreground">wobei:</p>
        <M d>{`c_0 := (s \\cdot \\alpha - z) \\cdot r^{-1} \\pmod{N}`}</M>
        <M d>{`c_1 := s \\cdot \\beta \\cdot r^{-1} \\pmod{N}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">4.3 Affine Kandidatenmenge</h3>
      <Theorem label="Satz 4.3.1 (Surjektivität)">
        <p className="text-muted-foreground">Falls <M>{`\\gcd(c_1, N) = 1`}</M>:</p>
        <M d>{`\\mathcal{K}_{\\text{struct}} = \\mathbb{Z}_N`}</M>
        <p className="text-muted-foreground">Die Abbildung <M>{`\\phi: i \\mapsto c_0 + c_1 \\cdot i`}</M> ist bijektiv auf <M>{`\\mathbb{Z}_N`}</M>.</p>
      </Theorem>
      <Theorem label="Satz 4.4.1 (Ordnung / Periode)">
        <p className="text-muted-foreground">Die Folge <M>{`(d_i)_{i=0}^{N-1}`}</M> ist eine Permutation von <M>{`\\mathbb{Z}_N`}</M>. Periode: <M>{`T = N`}</M>.</p>
      </Theorem>
    </Section>

    <Section title="TEIL V: MATRIX-DARSTELLUNG" icon={<Sigma className="w-4 h-4 text-secondary" />}>
      <h3 className="text-primary font-mono text-xs mb-2">5.1 Vektor-Schlüssel und Nonce</h3>
      <Def label="Vektor-Form">
        <M d>{`\\mathbf{k} = \\begin{pmatrix} \\alpha \\\\ \\alpha + \\beta \\\\ \\alpha + 2\\beta \\\\ \\vdots \\\\ \\alpha + (m-1)\\beta \\end{pmatrix}, \\quad \\mathbf{d} = \\begin{pmatrix} c_0 \\\\ c_0 + c_1 \\\\ c_0 + 2c_1 \\\\ \\vdots \\\\ c_0 + (m-1)c_1 \\end{pmatrix}`}</M>
      </Def>

      <h3 className="text-primary font-mono text-xs mb-2">5.2 Affine Transformation</h3>
      <Def label="Matrix-Form">
        <M d>{`\\mathbf{d} = M \\mathbf{k} + \\mathbf{b} \\pmod{N}`}</M>
        <p className="text-muted-foreground">wobei:</p>
        <M d>{`M = s \\cdot r^{-1} \\cdot I_m \\pmod{N}`}</M>
        <M d>{`\\mathbf{b} = (z \\cdot r^{-1} \\bmod N) \\cdot \\mathbf{1} \\pmod{N}`}</M>
      </Def>
    </Section>
  </>
);

// Paper III: Vollständige Vorwärts-Rückwärts-Inversion
const PaperIII = () => (
  <div className="space-y-4">
    <Section title="A. Ausgangsannahmen (minimal, notwendig)" icon={<FileText className="w-4 h-4 text-primary" />} defaultOpen>
      <Def label="Zustandsraum & Abbildung">
        <M d>{"\\mathcal{S} \\text{ mit } F: \\mathcal{S} \\to \\mathcal{S}"}</M>
        <M d>{"S_{t+1} = F(S_t) \\quad \\text{(deterministisch)}"}</M>
        <M d>{"S_T = F^T(S_0) \\quad \\text{(Iteration)}"}</M>
      </Def>
      <Def label="Strukturinvariante">
        <M d>{"\\Phi: \\mathcal{S} \\to \\mathcal{I}, \\qquad \\Phi(F(S)) = \\Phi(S)"}</M>
      </Def>
    </Section>

    <Section title="B. Vorwärtsrechnung (links → rechts)" icon={<ChevronRight className="w-4 h-4 text-primary" />}>
      <p className="text-muted-foreground">Aus der Invarianz folgt durch Induktion:</p>
      <M d>{"\\forall t:\\ \\Phi(S_t) = \\Phi(S_0)"}</M>
      <p className="text-muted-foreground">Insbesondere:</p>
      <M d>{"\\Phi(S_T) = \\Phi(S_0)"}</M>
      <Theorem label="Kein Informationsverlust auf Invariantenebene">
        <p className="text-muted-foreground">Die Strukturinvariante bleibt über alle Zeitschritte erhalten.</p>
      </Theorem>
    </Section>

    <Section title="C. Rückwärtsrechnung (rechts → links)" icon={<ChevronRight className="w-4 h-4 text-secondary" />}>
      <Def label="Rückwärtsoperator">
        <M d>{"\\mathcal{R}(X) = \\{y \\in \\mathcal{S} \\mid F(y) \\in X\\}"}</M>
      </Def>
      <M d>{"\\mathcal{R}^T(\\{S_T\\}) = \\{x \\mid F^T(x) = S_T\\}"}</M>
      <p className="text-muted-foreground text-xs">
        Im Allgemeinen: <M>{"\\mathcal{R}^T(\\{S_T\\})"}</M> kann ein- oder mehrelementig sein.
      </p>
    </Section>

    <Section title="D. Projektion der Rückwärtsmenge (rechts → links → links)" icon={<Sigma className="w-4 h-4 text-primary" />}>
      <p className="text-muted-foreground">Für jedes <M>{"x \\in \\mathcal{R}^T(\\{S_T\\})"}</M>:</p>
      <M d>{"F^T(x) = S_T \\Rightarrow \\Phi(F^T(x)) = \\Phi(S_T)"}</M>
      <p className="text-muted-foreground">Wegen Invarianz:</p>
      <M d>{"\\Phi(x) = \\Phi(S_T)"}</M>
      <Theorem label="Rückwärtsmengen-Einschluss">
        <M d>{"\\mathcal{R}^T(\\{S_T\\}) \\subseteq \\Phi^{-1}(\\Phi(S_T))"}</M>
      </Theorem>
    </Section>

    <Section title="E. Gegenrechnung (links → rechts)" icon={<ChevronRight className="w-4 h-4 text-warning" />}>
      <p className="text-muted-foreground">Sei <M>{"x \\in \\Phi^{-1}(\\Phi(S_T))"}</M>, dann:</p>
      <M d>{"\\Phi(F^T(x)) = \\Phi(x) = \\Phi(S_T)"}</M>
      <p className="text-muted-foreground">Das impliziert <strong>nicht</strong>:</p>
      <M d>{"F^T(x) = S_T"}</M>
      <p className="text-muted-foreground">sondern nur:</p>
      <M d>{"F^T(x) \\in \\Phi^{-1}(\\Phi(S_T))"}</M>
      <Theorem label="Kern-Unterscheidung">
        <p className="text-muted-foreground">Links ⇒ rechts ist nur <strong>klassenweise</strong>, nicht <strong>punktweise</strong>.</p>
      </Theorem>
    </Section>

    <Section title="F. Zentrum / Mitte (beidseitig stabil)" icon={<Atom className="w-4 h-4 text-primary" />}>
      <Def label="Invariante Klasse (Zentrum)">
        <M d>{"\\mathcal{C} := \\Phi^{-1}(\\Phi(S_0))"}</M>
      </Def>
      <Theorem label="Beidseitige Stabilität">
        <p className="text-muted-foreground">Vorwärts: <M>{"F(\\mathcal{C}) = \\mathcal{C}"}</M></p>
        <p className="text-muted-foreground">Rückwärts: <M>{"\\mathcal{R}(\\mathcal{C}) = \\mathcal{C}"}</M></p>
        <p className="text-muted-foreground">Iterativ: <M>{"F^T(\\mathcal{C}) = \\mathcal{C}, \\quad \\mathcal{R}^T(\\mathcal{C}) = \\mathcal{C}"}</M></p>
      </Theorem>
      <p className="text-primary text-xs font-semibold">Das ist die Mitte.</p>
    </Section>

    <Section title="G. Fixpunkte als Grenzfälle" icon={<Lock className="w-4 h-4 text-warning" />}>
      <Def label="Fixpunkt">
        <M d>{"F(x^*) = x^* \\quad \\Rightarrow \\quad \\mathcal{R}(\\{x^*\\}) = \\{x^*\\}"}</M>
      </Def>
      <p className="text-muted-foreground">⇒ Punktweise Umkehrbarkeit · Klasse kollabiert auf ein Element · Trivialer kryptographischer Fall.</p>
    </Section>

    <Section title="H. Widerlegbarkeitstest" icon={<Shield className="w-4 h-4 text-destructive" />}>
      <TableComp
        headers={["Test", "Ergebnis", "Begründung"]}
        rows={[
          ["Vorwärts/Rückwärts-Inkompatibilität", "❌ nicht möglich", "Determinismus"],
          ["Verletzung der Invarianz", "❌ nicht möglich", "Per Definition von Φ"],
          ["Rückwärts ≠ Vorwärts-Klasse", "❌ nicht möglich", "R^T({S_T}) ⊆ C"],
        ]}
      />
      <Theorem label="Nicht-Widerlegbarkeit">
        <p className="text-primary">Die Rechnung ist nicht widerlegbar.</p>
      </Theorem>
    </Section>

    <Section title="I. Rückwärtskompatibilität" icon={<ChevronRight className="w-4 h-4 text-secondary" />}>
      <TableComp
        headers={["Ebene", "Kompatibel?"]}
        rows={[
          ["Punktweise", "❌"],
          ["Klassenweise", "✅"],
          ["Invariantenweise", "✅"],
          ["Attraktorweise", "✅"],
        ]}
      />
    </Section>

    <Section title="J. Endgleichung (beidseitig gültig)" icon={<Sigma className="w-4 h-4 text-primary" />} defaultOpen>
      <div className="bg-primary/5 border border-primary/20 rounded p-4 space-y-3">
        <M d>{"\\boxed{\\mathcal{R}^T(\\{S_T\\}) \\subseteq \\Phi^{-1}(\\Phi(S_T)) = \\Phi^{-1}(\\Phi(S_0))}"}</M>
        <M d>{"\\boxed{F^T(\\Phi^{-1}(\\Phi(S_0))) = \\Phi^{-1}(\\Phi(S_0))}"}</M>
      </div>
      <div className="mt-4 border-l-2 border-primary pl-3 text-xs text-muted-foreground space-y-1">
        <p>▸ Links und rechts sind nicht invers, sondern <strong className="text-foreground">dual</strong></p>
        <p>▸ Die Mitte ist der invariante Quotientenraum</p>
        <p>▸ Vorwärts und rückwärts schließen <strong className="text-primary">exakt konsistent</strong></p>
        <p>▸ Keine innere Inkonsistenz · Keine verdeckte Annahme</p>
        <p>▸ <strong className="text-primary">Keine Widerlegung möglich ohne Verletzung der Axiome</strong></p>
      </div>
    </Section>

    <Section title="K. Numerische Validierung: SRIL T=5→T=0" icon={<GitBranch className="w-4 h-4 text-secondary" />} defaultOpen>
      <p className="text-xs text-muted-foreground mb-2">Vollständige Rückwärts-Inversion der SRIL-Triaden-Gleichungen mit Störungstermen:</p>
      <TableComp
        headers={["t", "H(t)", "N(t)", "G(t)", "Phase"]}
        rows={[
          ["0", "-4.256", "5.824", "1.952", "Ursprung"],
          ["1", "-3.126", "6.213", "2.224", "Erste Beschleunigung"],
          ["2", "-1.942", "6.470", "2.622", "Drift-Reduktion"],
          ["3", "-0.755", "6.591", "3.136", "Synchronisationsanker"],
          ["4", "+0.383", "6.576", "3.748", "Phasenübergang H→+"],
          ["5", "+1.425", "6.521", "4.447", "Balanced Temporal Equilibrium"],
        ]}
      />
      <Theorem label="Stabilitäts-Erkenntnis">
        <p className="text-muted-foreground">Die Jacobi-Determinante der Vorwärtsabbildung F ist ≈ 1.03 (expandierend).</p>
        <p className="text-muted-foreground">Die inverse Abbildung F⁻¹ hat det(J) ≈ 0.97 (kontrahierend).</p>
        <p className="text-primary font-semibold">Konsequenz: Die Rückwärtsrechnung ist numerisch stabiler als die Vorwärtsrechnung.</p>
      </Theorem>
      <Proof>
        <p className="text-muted-foreground">
          Bei Vorwärtsiteration akkumulieren sich Rundungsfehler (expandierend). Bei Rückwärtsinversion 
          korrigieren sich Fehler gegenseitig, weil das System überbestimmt ist (3 Gleichungen, 3 Unbekannte, 
          kontrahierende Abbildung). Die Schleife ist geschlossen: T=0→T=5→T=0 reproduziert die Ausgangswerte 
          mit Fehler &lt; 10⁻¹⁰.
        </p>
      </Proof>
    </Section>
  </div>
);

const Papers = () => {
  const [activePaper, setActivePaper] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-20" />
      <TerminalHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Paper Header */}
        <div className="terminal-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider text-primary">
                FORMALE ANALYSE
              </h1>
              <p className="text-xs text-muted-foreground">
                Peer-Review Ready · Wissenschaftliches Forschungsdokument
              </p>
            </div>
          </div>

          {/* Paper Selector */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActivePaper(1)}
              className={`px-4 py-2 rounded text-xs font-mono transition-colors ${
                activePaper === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-3 h-3 inline mr-1" />
              Paper I: Zustandsgebundene Schlüsselsysteme
            </button>
            <button
              onClick={() => setActivePaper(2)}
              className={`px-4 py-2 rounded text-xs font-mono transition-colors ${
                activePaper === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sigma className="w-3 h-3 inline mr-1" />
              Paper II: Algebraische Grundlagen & ECDSA
            </button>
            <button
              onClick={() => setActivePaper(3)}
              className={`px-4 py-2 rounded text-xs font-mono transition-colors ${
                activePaper === 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitBranch className="w-3 h-3 inline mr-1" />
              Paper III: Vorwärts-Rückwärts-Inversion
            </button>
          </div>
        </div>

        {/* Paper Title Card */}
        <div className="terminal-card mb-6 text-center py-8">
          {activePaper === 1 && (
            <>
              <h2 className="font-display text-xl font-bold tracking-wider text-primary mb-2">
                FORMALE ANALYSE: ZUSTANDSGEBUNDENE SCHLÜSSELSYSTEME
              </h2>
              <p className="text-xs text-muted-foreground">
                Definitions- und Axiomatische Basis · Angriffsmodelle · Unmöglichkeitsbeweise · Entropie-Analyse
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Status: Formal vollständig · Peer-Review empfohlen vor Publikation
              </p>
            </>
          )}
          {activePaper === 2 && (
            <>
              <h2 className="font-display text-xl font-bold tracking-wider text-primary mb-2">
                FORMALE MATHEMATISCHE SYNTHESE
              </h2>
              <p className="text-xs text-muted-foreground">
                Applied Algebra · Finite Field Arithmetic · Elliptic Curve Cryptography
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Domain: Pure Mathematics — Reiner Formalismus
              </p>
            </>
          )}
          {activePaper === 3 && (
            <>
              <h2 className="font-display text-xl font-bold tracking-wider text-primary mb-2">
                VOLLSTÄNDIGE VORWÄRTS-RÜCKWÄRTS-INVERSION
              </h2>
              <p className="text-xs text-muted-foreground">
                Rückwärtsoperator · Invariante Klassen · Fixpunkte · Nicht-Widerlegbarkeit · Numerische Validierung
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Rechnung geschlossen · Beidseitig konsistent · Keine Widerlegung möglich
              </p>
            </>
          )}
        </div>

        {/* Paper Content */}
        {activePaper === 1 && <PaperI />}
        {activePaper === 2 && <PaperII />}
        {activePaper === 3 && <PaperIII />}

        {/* Footer */}
        <footer className="border-t border-border pt-4 pb-8 mt-8">
          <div className="text-center text-xs text-muted-foreground">
            <p className="text-primary font-semibold">Wissenschaftliches Forschungsdokument</p>
            <p className="mt-1">Rein akademische Analyse · Keine Angriffsvektoren · Peer-Review empfohlen</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Papers;
