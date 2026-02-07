import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, Zap, Shield, Target, Network, Eye, 
  Terminal, Cpu, Activity, Lock, Unlock, AlertTriangle,
  ChevronRight, Play, Pause, RotateCcw, Download,
  Search, Scan, Database, GitBranch, Binary, 
  Fingerprint, Key, Hash, Layers, Radio, Radar,
  TrendingDown, TrendingUp, Crosshair, Bug, Skull,
  Grid3X3, Table, Shuffle, Clock, Code
} from "lucide-react";
import { SECP256K1, modInverse, toFullHex, recoverPrivateKey, safeBigInt } from "@/lib/crypto-math";

// NEXUS v3.0 Module Imports
import PollardsRhoVisualizer from "@/components/nexus/PollardsRhoVisualizer";
import BSGSVisualizer from "@/components/nexus/BSGSVisualizer";
import MersenneTwisterAnalyzer from "@/components/nexus/MersenneTwisterAnalyzer";
import TimingAttackSimulator from "@/components/nexus/TimingAttackSimulator";
import BitcoinScriptAnalyzer from "@/components/nexus/BitcoinScriptAnalyzer";
import WeakKeyDatabase from "@/components/nexus/WeakKeyDatabase";
import HNPLatticeAttack from "@/components/nexus/HNPLatticeAttack";
import TransactionGraphExplorer from "@/components/nexus/TransactionGraphExplorer";
import UnifiedResearchDashboard from "@/components/nexus/UnifiedResearchDashboard";

// ═══════════════════════════════════════════════════════════════════════════════
// NEXUS v3.0 - CRYPTOGRAPHIC INTELLIGENCE CONSOLE
// ═══════════════════════════════════════════════════════════════════════════════
// 
// WISSENSCHAFTLICHE STUDIE - EDUCATIONAL PURPOSE ONLY
// 
// Dies ist nicht nur Visualisierung. Dies ist ein vollständiges Analyse-Werkzeug.
// 
// Features:
// - ECDSA Signature Analysis mit Nonce-Reuse Detection
// - Entropy Quality Assessment für RNG-Analyse
// - Historical Attack Database (PS3, Android, Blockchain)
// - Real-time Attack Path Simulation
// - Mathematical Proof Chains
//
// ═══════════════════════════════════════════════════════════════════════════════

// Historische Angriffe - Dokumentiert und verifiziert
const HISTORICAL_ATTACKS = [
  {
    id: 'ps3_ecdsa',
    name: 'Sony PlayStation 3 ECDSA',
    year: 2010,
    type: 'Nonce Reuse',
    description: 'Sony verwendete einen FESTEN k-Wert für alle Signaturen. fail0verflow extrahierte den privaten Schlüssel.',
    formula: 'd = (z₁ - z₂) × (s₁ - s₂)⁻¹ mod n',
    entropy_loss: 256,
    affected: '77 Millionen PSN Accounts',
    lesson: 'k MUSS für jede Signatur kryptographisch zufällig sein'
  },
  {
    id: 'android_securesandom',
    name: 'Android SecureRandom Bug',
    year: 2013,
    type: 'Weak PRNG',
    description: 'PRNG wurde nicht korrekt initialisiert. Mehrere Bitcoin-Wallets verwendeten identische k-Werte.',
    formula: 'Xₙ₊₁ = (aXₙ + c) mod m → vorhersagbar',
    entropy_loss: 224,
    affected: '55 BTC gestohlen',
    lesson: 'System-RNG ist nicht immer kryptographisch sicher'
  },
  {
    id: 'debian_openssl',
    name: 'Debian OpenSSL',
    year: 2008,
    type: 'Entropy Collapse',
    description: 'Ein Debian-Entwickler entfernte "uninitialisierten" Speicher aus dem RNG. Nur 32.768 mögliche Schlüssel.',
    formula: 'H(K) = log₂(32768) = 15 bits statt 256 bits',
    entropy_loss: 241,
    affected: '2 Jahre vulnerable Keys',
    lesson: 'Vermeintliche "Bugs" können kritische Entropiequellen sein'
  },
  {
    id: 'blockchain_reuse',
    name: 'Blockchain.info Nonce Reuse',
    year: 2014,
    type: 'Nonce Reuse',
    description: 'RNG-Bug führte zu identischen k-Werten bei verschiedenen Transaktionen.',
    formula: 'k₁ = k₂ → d = (z₁ - z₂) / (s₁ - s₂)',
    entropy_loss: 256,
    affected: '~300 BTC',
    lesson: 'Selbst große Plattformen machen RNG-Fehler'
  },
  {
    id: 'minerva',
    name: 'Minerva Attack',
    year: 2019,
    type: 'Timing Side-Channel',
    description: 'Timing-Unterschiede bei der Nonce-Generierung ermöglichten Lattice-Angriffe.',
    formula: 'HNP: |k - ⌊k⌋| < n^(1/2+ε)',
    entropy_loss: 128,
    affected: 'TPM, Smart Cards',
    lesson: 'Konstante Zeit ist Pflicht für alle krypto Operationen'
  },
  {
    id: 'hnp_lattice',
    name: 'Hidden Number Problem',
    year: 2020,
    type: 'Lattice Reduction',
    description: 'Teilweise bekannte Nonces ermöglichen Key Recovery via LLL/BKZ.',
    formula: 'LLL: δ^(n-1)/4 × det(L)^(1/n)',
    entropy_loss: 0, // Mathematisch, nicht RNG
    affected: 'Theoretisch alle ECDSA',
    lesson: 'Auch partielle Nonce-Leaks sind fatal'
  }
];

// Signature für Analyse
interface SignaturePair {
  id: string;
  r: string;
  s: string;
  z: string; // message hash
  timestamp?: number;
}

// Schwachstellen-Detektion
interface VulnerabilityResult {
  type: 'nonce_reuse' | 'weak_entropy' | 'biased_nonce' | 'timing' | 'safe';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  message: string;
  formula?: string;
  recoveredKey?: string;
  signatures?: [SignaturePair, SignaturePair];
}

// Attack Graph Node
interface AttackNode {
  id: string;
  name: string;
  type: 'entry' | 'vulnerability' | 'technique' | 'target' | 'success';
  x: number;
  y: number;
  connections: string[];
  entropy: number;
  active: boolean;
  description: string;
  formula?: string;
  realWorld?: string;
}

const ATTACK_SURFACE: AttackNode[] = [
  // Entry Points - Erweitert
  { id: 'rng', name: 'RNG Source', type: 'entry', x: 50, y: 80, connections: ['weak_rng', 'timing', 'bias'], entropy: 256, active: false, description: 'Zufallszahlengenerator - Quelle aller Entropie', formula: 'H(X) = -Σ p(x) log₂ p(x)', realWorld: 'SecureRandom, /dev/urandom' },
  { id: 'user', name: 'User Input', type: 'entry', x: 50, y: 160, connections: ['weak_pass', 'reuse', 'pattern'], entropy: 40, active: false, description: 'Menschliche Eingaben - oft vorhersagbar', realWorld: 'Passwörter, Seeds, PINs' },
  { id: 'time', name: 'Timestamp', type: 'entry', x: 50, y: 240, connections: ['timing', 'predictable'], entropy: 32, active: false, description: 'Zeitstempel - reduziert Suchraum drastisch', formula: 'Suchraum = 2³² statt 2²⁵⁶', realWorld: 'Sony PS3 (2010)' },
  { id: 'hardware', name: 'Hardware RNG', type: 'entry', x: 50, y: 320, connections: ['side_channel', 'fault'], entropy: 256, active: false, description: 'Hardware-basierte Entropie', realWorld: 'TPM, HSM, RDRAND' },
  { id: 'network', name: 'Network Data', type: 'entry', x: 50, y: 400, connections: ['timing', 'mitm'], entropy: 64, active: false, description: 'Netzwerk-basierte Zufälligkeit', realWorld: 'TCP Sequence Numbers' },
  
  // Vulnerabilities - Erweitert
  { id: 'weak_rng', name: 'Weak PRNG', type: 'vulnerability', x: 220, y: 60, connections: ['nonce_reuse', 'predict'], entropy: 32, active: false, description: 'LCG, Mersenne Twister ungeseeded', formula: 'Xₙ₊₁ = (aXₙ + c) mod m', realWorld: 'Android SecureRandom (2013)' },
  { id: 'timing', name: 'Timing Leak', type: 'vulnerability', x: 220, y: 130, connections: ['side_channel', 'cache'], entropy: 128, active: false, description: 'Zeitbasierte Seitenkanalangriffe', formula: 'Δt = f(secret)', realWorld: 'Minerva Attack (2019)' },
  { id: 'weak_pass', name: 'Weak Password', type: 'vulnerability', x: 220, y: 200, connections: ['brute_force', 'rainbow'], entropy: 20, active: false, description: 'Schwaches Passwort unter 8 Zeichen', formula: 'H ≈ log₂(charset^length)', realWorld: '123456, password' },
  { id: 'reuse', name: 'Key/Nonce Reuse', type: 'vulnerability', x: 220, y: 270, connections: ['nonce_reuse'], entropy: 0, active: false, description: 'Identische k-Werte bei ECDSA', formula: 'k₁ = k₂ → d exposed', realWorld: 'Sony PS3, Blockchain.info' },
  { id: 'predictable', name: 'Predictable Seed', type: 'vulnerability', x: 220, y: 340, connections: ['lattice', 'predict'], entropy: 48, active: false, description: 'Vorhersagbarer Seed-Wert', formula: 'seed = f(time, pid)', realWorld: 'Debian OpenSSL (2008)' },
  { id: 'bias', name: 'Biased Nonce', type: 'vulnerability', x: 220, y: 410, connections: ['lattice', 'hnp'], entropy: 200, active: false, description: 'Nonce mit bekannten Bits', formula: 'k = k_low ∈ [0, 2^b]', realWorld: 'Minerva, TPM-FAIL' },
  { id: 'pattern', name: 'Pattern Detection', type: 'vulnerability', x: 220, y: 480, connections: ['ml_attack'], entropy: 100, active: false, description: 'Erkennbare Muster in Signaturen', realWorld: 'Machine Learning Analysis' },
  
  // Techniques - Erweitert
  { id: 'nonce_reuse', name: 'Nonce Reuse Attack', type: 'technique', x: 420, y: 80, connections: ['ecdsa_break'], entropy: 0, active: false, description: 'Sofortige Key Recovery bei k₁=k₂', formula: 'd = (z₁-z₂)(s₁-s₂)⁻¹ mod n', realWorld: 'Trivial, O(1)' },
  { id: 'side_channel', name: 'Side Channel', type: 'technique', x: 420, y: 150, connections: ['key_extract'], entropy: 64, active: false, description: 'Cache-Timing, Power Analysis, EM', formula: 'k_bits via timing', realWorld: 'Flush+Reload, PRIME+PROBE' },
  { id: 'brute_force', name: 'Brute Force', type: 'technique', x: 420, y: 220, connections: ['key_extract'], entropy: 0, active: false, description: 'Erschöpfende Suche', formula: 'T = 2ⁿ / hashrate', realWorld: 'GPU/ASIC Clusters' },
  { id: 'lattice', name: 'Lattice Reduction', type: 'technique', x: 420, y: 290, connections: ['ecdsa_break'], entropy: 0, active: false, description: 'LLL/BKZ für HNP', formula: '||v|| ≤ 2^(n/4) × det(L)^(1/n)', realWorld: 'fpLLL, fplll' },
  { id: 'predict', name: 'State Prediction', type: 'technique', x: 420, y: 360, connections: ['ecdsa_break'], entropy: 0, active: false, description: 'PRNG State Recovery', formula: 'Xₙ = f(X₀...Xₘ)', realWorld: 'MT19937: 624 outputs' },
  { id: 'hnp', name: 'Hidden Number', type: 'technique', x: 420, y: 430, connections: ['ecdsa_break'], entropy: 0, active: false, description: 'HNP via Lattice', formula: '|k - round(k)| small', realWorld: '2-4 bits leak → break' },
  { id: 'ml_attack', name: 'ML Analysis', type: 'technique', x: 420, y: 500, connections: ['key_extract'], entropy: 50, active: false, description: 'Deep Learning auf Signaturen', realWorld: 'Neural Networks, SVM' },
  
  // Additional Techniques
  { id: 'cache', name: 'Cache Attack', type: 'technique', x: 420, y: 570, connections: ['key_extract'], entropy: 32, active: false, description: 'CPU Cache Timing', realWorld: 'Spectre, Meltdown' },
  { id: 'rainbow', name: 'Rainbow Tables', type: 'technique', x: 420, y: 640, connections: ['key_extract'], entropy: 0, active: false, description: 'Precomputed Hash Chains', formula: 'Space-Time Tradeoff', realWorld: 'ophcrack, RainbowCrack' },
  { id: 'fault', name: 'Fault Injection', type: 'technique', x: 420, y: 710, connections: ['key_extract'], entropy: 0, active: false, description: 'Glitching, Voltage Fault', realWorld: 'Bellcore Attack, Rowhammer' },
  { id: 'mitm', name: 'MITM Attack', type: 'technique', x: 420, y: 780, connections: ['key_extract'], entropy: 0, active: false, description: 'Man in the Middle', realWorld: 'SSL Stripping, ARP Poison' },
  
  // Targets
  { id: 'ecdsa_break', name: 'ECDSA Break', type: 'target', x: 620, y: 180, connections: ['private_key'], entropy: 0, active: false, description: 'Kompromittierung der ECDSA-Signatur', formula: 's = k⁻¹(z + rd) mod n', realWorld: 'Bitcoin, Ethereum, TLS' },
  { id: 'key_extract', name: 'Key Extraction', type: 'target', x: 620, y: 380, connections: ['private_key'], entropy: 0, active: false, description: 'Extraktion des privaten Schlüssels', realWorld: 'Wallet, HSM, Smartcard' },
  
  // Success
  { id: 'private_key', name: 'Private Key', type: 'success', x: 780, y: 280, connections: [], entropy: 0, active: false, description: '🎯 VOLLSTÄNDIGE KOMPROMITTIERUNG', formula: 'd ∈ [1, n-1]', realWorld: 'Game Over' }
];

// Entropy Analysis Types
interface EntropySource {
  name: string;
  bits: number;
  quality: 'high' | 'medium' | 'low' | 'compromised';
  source: string;
}

const Nexus = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('scanner');
  
  // Attack Surface State
  const [nodes, setNodes] = useState<AttackNode[]>(ATTACK_SURFACE);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AttackNode | null>(null);
  const [attackPath, setAttackPath] = useState<string[]>([]);
  const [systemEntropy, setSystemEntropy] = useState(256);
  const [compromiseLevel, setCompromiseLevel] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  // Signature Scanner State
  const [signatures, setSignatures] = useState<SignaturePair[]>([]);
  const [newSig, setNewSig] = useState({ r: '', s: '', z: '' });
  const [scanResults, setScanResults] = useState<VulnerabilityResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // Entropy Analyzer State
  const [entropyInput, setEntropyInput] = useState('');
  const [entropyScore, setEntropyScore] = useState<number | null>(null);
  const [entropyBreakdown, setEntropyBreakdown] = useState<EntropySource[]>([]);
  
  // Console Logs
  const [logs, setLogs] = useState<string[]>([
    '[NEXUS] v2.0 Cryptographic Intelligence Console',
    '[NEXUS] WISSENSCHAFTLICHE STUDIE - Educational Purpose',
    '[NEXUS] Attack Surface: 24 Knoten geladen',
    '[NEXUS] Historische Angriffe: 6 dokumentiert',
    '[NEXUS] Bereit für Analyse...'
  ]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // SIGNATURE SCANNER - Echte ECDSA Analyse
  // ═══════════════════════════════════════════════════════════════════════════
  
  const addSignature = () => {
    if (!newSig.r || !newSig.s || !newSig.z) return;
    
    const sig: SignaturePair = {
      id: `sig_${Date.now()}`,
      r: newSig.r,
      s: newSig.s,
      z: newSig.z,
      timestamp: Date.now()
    };
    
    setSignatures(prev => [...prev, sig]);
    setNewSig({ r: '', s: '', z: '' });
    addLog(`[SCANNER] Signatur hinzugefügt: r=${sig.r.substring(0, 16)}...`);
  };

  const scanSignatures = useCallback(() => {
    if (signatures.length < 2) {
      addLog('[SCANNER] Mindestens 2 Signaturen für Analyse benötigt');
      return;
    }
    
    setIsScanning(true);
    addLog('[SCANNER] Starte Schwachstellen-Analyse...');
    
    const results: VulnerabilityResult[] = [];
    
    // Check for nonce reuse (same r value)
    for (let i = 0; i < signatures.length; i++) {
      for (let j = i + 1; j < signatures.length; j++) {
        const sig1 = signatures[i];
        const sig2 = signatures[j];
        
        if (sig1.r === sig2.r && sig1.z !== sig2.z) {
          // NONCE REUSE DETECTED - Calculate private key
          addLog(`[CRITICAL] NONCE REUSE DETECTED zwischen Signatur ${i+1} und ${j+1}!`);
          
          try {
            const r = safeBigInt(sig1.r);
            const s1 = safeBigInt(sig1.s);
            const s2 = safeBigInt(sig2.s);
            const z1 = safeBigInt(sig1.z);
            const z2 = safeBigInt(sig2.z);
            
            if (r && s1 && s2 && z1 && z2) {
              const N = SECP256K1.N;
              
              // k = (z1 - z2) / (s1 - s2) mod N
              const zDiff = ((z1 - z2) % N + N) % N;
              const sDiff = ((s1 - s2) % N + N) % N;
              const sDiffInv = modInverse(sDiff, N);
              const k = (zDiff * sDiffInv) % N;
              
              // d = (s1 * k - z1) / r mod N
              const recovery = recoverPrivateKey(k, r, s1, z1);
              
              results.push({
                type: 'nonce_reuse',
                severity: 'critical',
                message: `KRITISCH: Identische Nonce (k) bei Signaturen ${i+1} und ${j+1}. Privater Schlüssel extrahiert!`,
                formula: 'd = (z₁ - z₂) × (s₁ - s₂)⁻¹ × r⁻¹ mod n',
                recoveredKey: recovery.dHex,
                signatures: [sig1, sig2]
              });
              
              addLog(`[EXPLOIT] Privater Schlüssel: ${recovery.dHex.substring(0, 32)}...`);
            }
          } catch (e) {
            addLog(`[ERROR] Berechnung fehlgeschlagen: ${e}`);
          }
        }
      }
    }
    
    // Check for biased r values (potential weak RNG)
    const rValues = signatures.map(s => safeBigInt(s.r)).filter(Boolean) as bigint[];
    const highBitsIdentical = rValues.every(r => (r >> 248n) === (rValues[0] >> 248n));
    
    if (highBitsIdentical && rValues.length > 1) {
      results.push({
        type: 'biased_nonce',
        severity: 'high',
        message: 'WARNUNG: Identische obere Bits in r-Werten. Möglicher Bias im RNG.',
        formula: 'k_high = const → Lattice Attack möglich'
      });
      addLog('[WARNING] Biased Nonces erkannt - Lattice-Angriff möglich');
    }
    
    // Check entropy of values
    for (const sig of signatures) {
      const r = safeBigInt(sig.r);
      if (r && r < 2n ** 200n) {
        results.push({
          type: 'weak_entropy',
          severity: 'medium',
          message: `Signatur ${sig.id}: r-Wert hat weniger als 200 Bit Entropie.`
        });
      }
    }
    
    if (results.length === 0) {
      results.push({
        type: 'safe',
        severity: 'none',
        message: 'Keine offensichtlichen Schwachstellen in den analysierten Signaturen gefunden.'
      });
      addLog('[SCANNER] Keine Schwachstellen gefunden');
    }
    
    setScanResults(results);
    setIsScanning(false);
  }, [signatures, addLog]);

  // Demo Signatures mit bekannter Schwachstelle (Sony PS3 Style)
  const loadDemoSignatures = () => {
    const k = "0x" + "7".repeat(64); // Fester k-Wert (wie Sony)
    const r = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"; // G.x
    
    setSignatures([
      { id: 'demo1', r, s: '0x' + '1234567890abcdef'.repeat(4), z: '0x' + 'a'.repeat(64), timestamp: Date.now() },
      { id: 'demo2', r, s: '0x' + 'fedcba0987654321'.repeat(4), z: '0x' + 'b'.repeat(64), timestamp: Date.now() + 1000 }
    ]);
    addLog('[DEMO] Sony PS3-Style Signaturen geladen (identisches k)');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTROPY ANALYZER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const analyzeEntropy = useCallback(() => {
    if (!entropyInput) return;
    
    addLog('[ENTROPY] Starte Analyse...');
    
    // Calculate Shannon entropy
    const bytes = entropyInput.replace(/[^0-9a-fA-F]/g, '');
    const byteArray: number[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
      byteArray.push(parseInt(bytes.substr(i, 2), 16) || 0);
    }
    
    if (byteArray.length === 0) {
      addLog('[ENTROPY] Ungültige Eingabe');
      return;
    }
    
    // Count byte frequencies
    const freq: Record<number, number> = {};
    for (const byte of byteArray) {
      freq[byte] = (freq[byte] || 0) + 1;
    }
    
    // Calculate Shannon entropy
    let entropy = 0;
    const total = byteArray.length;
    for (const count of Object.values(freq)) {
      const p = count / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    
    // Normalize to 0-8 bits per byte
    const normalizedEntropy = entropy;
    const effectiveBits = normalizedEntropy * byteArray.length;
    
    setEntropyScore(effectiveBits);
    
    // Breakdown analysis
    const breakdown: EntropySource[] = [
      {
        name: 'Shannon Entropie',
        bits: normalizedEntropy,
        quality: normalizedEntropy > 7.5 ? 'high' : normalizedEntropy > 6 ? 'medium' : 'low',
        source: `${normalizedEntropy.toFixed(3)} bits/byte`
      },
      {
        name: 'Effektive Bits',
        bits: effectiveBits,
        quality: effectiveBits > 200 ? 'high' : effectiveBits > 100 ? 'medium' : 'low',
        source: `${effectiveBits.toFixed(0)} von ${byteArray.length * 8} bits`
      }
    ];
    
    // Check for patterns
    const uniqueBytes = Object.keys(freq).length;
    breakdown.push({
      name: 'Eindeutige Bytes',
      bits: Math.log2(uniqueBytes) * byteArray.length / 8,
      quality: uniqueBytes > 200 ? 'high' : uniqueBytes > 100 ? 'medium' : uniqueBytes > 50 ? 'low' : 'compromised',
      source: `${uniqueBytes} von 256 möglichen`
    });
    
    // Check for sequential patterns
    let sequential = 0;
    for (let i = 1; i < byteArray.length; i++) {
      if (byteArray[i] === byteArray[i-1] + 1 || byteArray[i] === byteArray[i-1] - 1) {
        sequential++;
      }
    }
    const seqRatio = sequential / byteArray.length;
    breakdown.push({
      name: 'Sequenzielle Muster',
      bits: (1 - seqRatio) * 8,
      quality: seqRatio < 0.05 ? 'high' : seqRatio < 0.15 ? 'medium' : 'compromised',
      source: `${(seqRatio * 100).toFixed(1)}% sequenziell`
    });
    
    setEntropyBreakdown(breakdown);
    addLog(`[ENTROPY] Analyse abgeschlossen: ${effectiveBits.toFixed(0)} effektive Bits`);
  }, [entropyInput, addLog]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTACK SIMULATION
  // ═══════════════════════════════════════════════════════════════════════════

  const calculateTotalEntropy = useCallback(() => {
    return nodes.reduce((sum, node) => {
      if (node.active && node.type !== 'success') {
        return sum - (256 - node.entropy) / nodes.length;
      }
      return sum;
    }, 256);
  }, [nodes]);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setNodes(prev => {
        const newNodes = [...prev];
        const activeNodes = newNodes.filter(n => n.active);
        
        if (activeNodes.length === 0) {
          const entryPoints = newNodes.filter(n => n.type === 'entry');
          const randomEntry = entryPoints[Math.floor(Math.random() * entryPoints.length)];
          randomEntry.active = true;
          setAttackPath([randomEntry.id]);
          addLog(`[ATTACK] Einstiegspunkt: ${randomEntry.name}`);
          if (randomEntry.realWorld) {
            addLog(`[ATTACK] Real-World: ${randomEntry.realWorld}`);
          }
        } else {
          for (const node of activeNodes) {
            if (node.connections.length > 0 && Math.random() > 0.4) {
              const nextId = node.connections[Math.floor(Math.random() * node.connections.length)];
              const nextNode = newNodes.find(n => n.id === nextId);
              if (nextNode && !nextNode.active) {
                nextNode.active = true;
                setAttackPath(p => [...p, nextId]);
                addLog(`[EXPLOIT] ${node.name} → ${nextNode.name}`);
                if (nextNode.formula) {
                  addLog(`[MATH] ${nextNode.formula}`);
                }
                
                setCompromiseLevel(c => Math.min(100, c + 15));
                
                if (nextNode.type === 'success') {
                  setCompromiseLevel(100);
                  addLog(`[SUCCESS] 🎯 PRIVATER SCHLÜSSEL KOMPROMITTIERT!`);
                  setIsSimulating(false);
                }
              }
            }
          }
        }
        
        return newNodes;
      });

      setSystemEntropy(calculateTotalEntropy());
    }, 1500 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, calculateTotalEntropy, addLog]);

  // Canvas Rendering - Verbessert
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = 'rgba(5, 5, 10, 0.98)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid with gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.03)');
    gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.02)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0.03)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < rect.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw connections
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        const target = nodes.find(n => n.id === connId);
        if (!target) return;

        const isActive = node.active || target.active;
        const isBothActive = node.active && target.active;
        
        ctx.beginPath();
        
        // Curved lines
        const midX = (node.x + 80 + target.x) / 2;
        const midY = (node.y + 18 + target.y + 18) / 2;
        
        ctx.moveTo(node.x + 80, node.y + 18);
        ctx.quadraticCurveTo(midX, midY - 20, target.x, target.y + 18);
        
        if (isBothActive) {
          ctx.strokeStyle = 'rgba(255, 50, 50, 0.9)';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ff3333';
          ctx.shadowBlur = 15;
        } else if (isActive) {
          ctx.strokeStyle = 'rgba(255, 150, 50, 0.5)';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Flow animation
        if (isBothActive) {
          const t = (Date.now() / 400) % 1;
          const flowX = node.x + 80 + (target.x - node.x - 80) * t;
          const flowY = node.y + 18 + (target.y - node.y) * t;
          
          ctx.beginPath();
          ctx.arc(flowX, flowY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ff3333';
          ctx.shadowColor = '#ff3333';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    });

    // Draw nodes
    const colors: Record<string, string> = {
      entry: '#00ff88',
      vulnerability: '#ffaa00',
      technique: '#ff6600',
      target: '#ff3333',
      success: '#ff0000'
    };

    nodes.forEach(node => {
      const baseColor = colors[node.type];
      const isSelected = selectedNode?.id === node.id;
      const nodeWidth = 80;
      const nodeHeight = 36;

      // Node glow for active
      if (node.active) {
        ctx.beginPath();
        ctx.roundRect(node.x - 5, node.y - 5, nodeWidth + 10, nodeHeight + 10, 10);
        ctx.fillStyle = baseColor + '20';
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Node background
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, nodeWidth, nodeHeight, 6);
      
      if (node.active) {
        const grad = ctx.createLinearGradient(node.x, node.y, node.x + nodeWidth, node.y + nodeHeight);
        grad.addColorStop(0, baseColor + '40');
        grad.addColorStop(1, baseColor + '20');
        ctx.fillStyle = grad;
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = 'rgba(15, 15, 20, 0.95)';
        ctx.strokeStyle = baseColor + '50';
        ctx.lineWidth = 1;
      }
      
      ctx.fill();
      ctx.stroke();

      // Selection indicator
      if (isSelected) {
        ctx.beginPath();
        ctx.roundRect(node.x - 3, node.y - 3, nodeWidth + 6, nodeHeight + 6, 8);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Type icon
      const iconX = node.x + 8;
      const iconY = node.y + 12;
      ctx.fillStyle = node.active ? baseColor : baseColor + '80';
      ctx.font = '10px monospace';
      const icons: Record<string, string> = {
        entry: '◉',
        vulnerability: '⚠',
        technique: '⚡',
        target: '◎',
        success: '🎯'
      };
      ctx.fillText(icons[node.type] || '●', iconX, iconY);

      // Node label
      ctx.fillStyle = node.active ? '#ffffff' : '#888888';
      ctx.font = node.active ? 'bold 9px monospace' : '9px monospace';
      ctx.textAlign = 'left';
      const label = node.name.length > 10 ? node.name.substring(0, 10) + '…' : node.name;
      ctx.fillText(label, node.x + 18, node.y + 14);

      // Entropy bar
      if (node.entropy > 0) {
        const barWidth = (node.entropy / 256) * (nodeWidth - 10);
        const barColor = node.entropy > 200 ? '#00ff88' : node.entropy > 100 ? '#ffaa00' : '#ff3333';
        ctx.fillStyle = node.active ? barColor : barColor + '40';
        ctx.fillRect(node.x + 5, node.y + 28, barWidth, 3);
        
        // Entropy text
        ctx.fillStyle = '#666666';
        ctx.font = '7px monospace';
        ctx.fillText(`${node.entropy}b`, node.x + nodeWidth - 20, node.y + 31);
      }
    });

    // Title & Stats
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NEXUS ATTACK SURFACE v2.0', 10, 18);

    ctx.fillStyle = '#666666';
    ctx.font = '10px monospace';
    ctx.fillText(`Knoten: ${nodes.length} | Aktiv: ${nodes.filter(n => n.active).length}`, 10, 32);

    // Bottom stats
    ctx.fillStyle = systemEntropy > 200 ? '#00ff88' : systemEntropy > 100 ? '#ffaa00' : '#ff3333';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ENTROPIE: ${systemEntropy.toFixed(1)} bits`, 10, rect.height - 10);

    ctx.fillStyle = compromiseLevel > 50 ? '#ff3333' : compromiseLevel > 20 ? '#ffaa00' : '#00ff88';
    ctx.fillText(`KOMPROMITTIERUNG: ${compromiseLevel}%`, 200, rect.height - 10);

  }, [nodes, selectedNode, systemEntropy, compromiseLevel]);

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodes.find(node => 
      x >= node.x && x <= node.x + 80 &&
      y >= node.y && y <= node.y + 36
    );

    if (clicked) {
      setSelectedNode(clicked);
      addLog(`[SELECT] ${clicked.name}: ${clicked.description}`);
      if (clicked.formula) {
        addLog(`[FORMULA] ${clicked.formula}`);
      }
    } else {
      setSelectedNode(null);
    }
  };

  const resetSimulation = () => {
    setNodes(ATTACK_SURFACE.map(n => ({ ...n, active: false })));
    setAttackPath([]);
    setSystemEntropy(256);
    setCompromiseLevel(0);
    setIsSimulating(false);
    addLog('[NEXUS] Simulation zurückgesetzt');
  };

  const exportAnalysis = () => {
    const analysis = {
      timestamp: new Date().toISOString(),
      system: 'NEXUS v2.0 - Cryptographic Intelligence Console',
      disclaimer: 'WISSENSCHAFTLICHE STUDIE - Educational Purpose Only',
      attackPath,
      finalEntropy: systemEntropy,
      compromiseLevel,
      signatures: signatures,
      scanResults: scanResults,
      entropyAnalysis: {
        score: entropyScore,
        breakdown: entropyBreakdown
      },
      activeNodes: nodes.filter(n => n.active).map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        entropy: n.entropy,
        formula: n.formula,
        realWorld: n.realWorld
      })),
      logs: logs.slice(-100)
    };
    
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('[EXPORT] Analyse exportiert');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-15" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-destructive/20 flex items-center justify-center border border-primary/30">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary font-mono tracking-wide">NEXUS v2.0</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cryptographic Intelligence Console</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs border-primary/50">
                <Radar className="w-3 h-3 mr-1 animate-pulse" />
                WISSENSCHAFTLICHE STUDIE
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                ← Zurück
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Hero */}
        <Card className="mb-6 p-6 bg-gradient-to-br from-primary/5 via-background to-destructive/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-destructive/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
              <Eye className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-2">Kryptographische Intelligenz</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl mb-3">
                NEXUS analysiert ECDSA-Signaturen auf Schwachstellen, visualisiert Angriffspfade und 
                dokumentiert historische Krypto-Katastrophen. <span className="text-primary font-semibold">Nicht nur Visualisierung — echte Analyse.</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs"><Scan className="w-3 h-3 mr-1" /> Signature Scanner</Badge>
                <Badge variant="secondary" className="text-xs"><Database className="w-3 h-3 mr-1" /> Attack Database</Badge>
                <Badge variant="secondary" className="text-xs"><Activity className="w-3 h-3 mr-1" /> Entropy Analyzer</Badge>
                <Badge variant="secondary" className="text-xs"><GitBranch className="w-3 h-3 mr-1" /> Attack Paths</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max gap-1">
              <TabsTrigger value="scanner" className="font-mono text-xs whitespace-nowrap">
                <Scan className="w-4 h-4 mr-1" /> Scanner
              </TabsTrigger>
              <TabsTrigger value="attacks" className="font-mono text-xs whitespace-nowrap">
                <Skull className="w-4 h-4 mr-1" /> Historisch
              </TabsTrigger>
              <TabsTrigger value="entropy" className="font-mono text-xs whitespace-nowrap">
                <Activity className="w-4 h-4 mr-1" /> Entropie
              </TabsTrigger>
              <TabsTrigger value="graph" className="font-mono text-xs whitespace-nowrap">
                <Network className="w-4 h-4 mr-1" /> Graph
              </TabsTrigger>
              <TabsTrigger value="pollard" className="font-mono text-xs whitespace-nowrap">
                <Zap className="w-4 h-4 mr-1" /> Pollard Rho
              </TabsTrigger>
              <TabsTrigger value="bsgs" className="font-mono text-xs whitespace-nowrap">
                <Table className="w-4 h-4 mr-1" /> BSGS
              </TabsTrigger>
              <TabsTrigger value="hnp" className="font-mono text-xs whitespace-nowrap">
                <Grid3X3 className="w-4 h-4 mr-1" /> HNP
              </TabsTrigger>
              <TabsTrigger value="mt" className="font-mono text-xs whitespace-nowrap">
                <Shuffle className="w-4 h-4 mr-1" /> MT19937
              </TabsTrigger>
              <TabsTrigger value="timing" className="font-mono text-xs whitespace-nowrap">
                <Clock className="w-4 h-4 mr-1" /> Timing
              </TabsTrigger>
              <TabsTrigger value="script" className="font-mono text-xs whitespace-nowrap">
                <Code className="w-4 h-4 mr-1" /> Script
              </TabsTrigger>
              <TabsTrigger value="txgraph" className="font-mono text-xs whitespace-nowrap">
                <GitBranch className="w-4 h-4 mr-1" /> TX Graph
              </TabsTrigger>
              <TabsTrigger value="weakkeys" className="font-mono text-xs whitespace-nowrap">
                <Database className="w-4 h-4 mr-1" /> Weak Keys
              </TabsTrigger>
              <TabsTrigger value="research" className="font-mono text-xs whitespace-nowrap bg-gradient-to-r from-red-500/10 to-orange-500/10">
                <Brain className="w-4 h-4 mr-1 text-red-400" /> Master-Formeln
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SIGNATURE SCANNER TAB */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="scanner" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Panel */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm font-semibold">ECDSA Signatur-Eingabe</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">r (x-Koordinate von k×G)</label>
                    <Input 
                      value={newSig.r} 
                      onChange={(e) => setNewSig(prev => ({ ...prev, r: e.target.value }))}
                      placeholder="0x79BE667EF9DCBBAC..." 
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">s (Signaturwert)</label>
                    <Input 
                      value={newSig.s} 
                      onChange={(e) => setNewSig(prev => ({ ...prev, s: e.target.value }))}
                      placeholder="0x..." 
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">z (Message Hash)</label>
                    <Input 
                      value={newSig.z} 
                      onChange={(e) => setNewSig(prev => ({ ...prev, z: e.target.value }))}
                      placeholder="0x..." 
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addSignature} size="sm" className="flex-1">
                      <Key className="w-4 h-4 mr-1" /> Hinzufügen
                    </Button>
                    <Button onClick={loadDemoSignatures} size="sm" variant="outline">
                      <Bug className="w-4 h-4 mr-1" /> Demo (PS3)
                    </Button>
                  </div>
                </div>

                {/* Signature List */}
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground mb-2">Geladene Signaturen ({signatures.length})</div>
                  <ScrollArea className="h-32 border rounded-lg p-2">
                    {signatures.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Keine Signaturen geladen
                      </div>
                    ) : (
                      signatures.map((sig, i) => (
                        <div key={sig.id} className="text-xs font-mono p-2 bg-muted/30 rounded mb-1">
                          <span className="text-primary">#{i+1}</span>
                          <span className="text-muted-foreground ml-2">r: {sig.r.substring(0, 20)}...</span>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </div>

                <Button 
                  onClick={scanSignatures} 
                  disabled={signatures.length < 2 || isScanning}
                  className="w-full mt-4"
                  variant={signatures.length >= 2 ? "default" : "secondary"}
                >
                  {isScanning ? (
                    <><Activity className="w-4 h-4 mr-1 animate-spin" /> Analysiere...</>
                  ) : (
                    <><Scan className="w-4 h-4 mr-1" /> Schwachstellen-Scan</>
                  )}
                </Button>
              </Card>

              {/* Results Panel */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="font-mono text-sm font-semibold">Scan-Ergebnisse</span>
                </div>

                <ScrollArea className="h-[400px]">
                  {scanResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Noch keine Analyse durchgeführt</p>
                      <p className="text-xs mt-1">Lade Signaturen und starte den Scan</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scanResults.map((result, i) => (
                        <div 
                          key={i}
                          className={`p-3 rounded-lg border ${
                            result.severity === 'critical' ? 'bg-destructive/20 border-destructive' :
                            result.severity === 'high' ? 'bg-orange-500/20 border-orange-500' :
                            result.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500' :
                            result.severity === 'none' ? 'bg-green-500/20 border-green-500' :
                            'bg-muted/50 border-border'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {result.severity === 'critical' && <Skull className="w-5 h-5 text-destructive flex-shrink-0" />}
                            {result.severity === 'high' && <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                            {result.severity === 'none' && <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] ${
                                    result.severity === 'critical' ? 'border-destructive text-destructive' :
                                    result.severity === 'high' ? 'border-orange-500 text-orange-500' :
                                    'border-green-500 text-green-500'
                                  }`}
                                >
                                  {result.severity.toUpperCase()}
                                </Badge>
                                <span className="text-xs font-mono text-muted-foreground">{result.type}</span>
                              </div>
                              <p className="text-sm">{result.message}</p>
                              {result.formula && (
                                <div className="mt-2 p-2 bg-background/50 rounded font-mono text-xs text-primary">
                                  {result.formula}
                                </div>
                              )}
                              {result.recoveredKey && (
                                <div className="mt-2 p-2 bg-destructive/30 rounded">
                                  <div className="text-xs text-destructive font-semibold mb-1">🔓 PRIVATER SCHLÜSSEL EXTRAHIERT:</div>
                                  <div className="font-mono text-[10px] break-all text-destructive">
                                    {result.recoveredKey}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>

            {/* Formula Explanation */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Binary className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm font-semibold">ECDSA Nonce Reuse - Mathematischer Beweis</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">Signatur-Gleichungen:</div>
                  <div className="text-primary">s₁ = k⁻¹(z₁ + rd) mod n</div>
                  <div className="text-primary">s₂ = k⁻¹(z₂ + rd) mod n</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">Bei k₁ = k₂:</div>
                  <div className="text-orange-500">s₁ - s₂ = k⁻¹(z₁ - z₂)</div>
                  <div className="text-orange-500">k = (z₁ - z₂) / (s₁ - s₂)</div>
                </div>
                <div className="p-3 bg-destructive/20 rounded-lg border border-destructive">
                  <div className="text-xs text-destructive mb-2">Private Key Recovery:</div>
                  <div className="text-destructive font-bold">d = (s₁k - z₁) × r⁻¹ mod n</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HISTORICAL ATTACKS TAB */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="attacks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HISTORICAL_ATTACKS.map((attack) => (
                <Card key={attack.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      attack.type === 'Nonce Reuse' ? 'bg-destructive/20' :
                      attack.type === 'Weak PRNG' ? 'bg-orange-500/20' :
                      attack.type === 'Entropy Collapse' ? 'bg-yellow-500/20' :
                      'bg-primary/20'
                    }`}>
                      {attack.type === 'Nonce Reuse' && <Key className="w-5 h-5 text-destructive" />}
                      {attack.type === 'Weak PRNG' && <Cpu className="w-5 h-5 text-orange-500" />}
                      {attack.type === 'Entropy Collapse' && <TrendingDown className="w-5 h-5 text-yellow-500" />}
                      {attack.type === 'Timing Side-Channel' && <Activity className="w-5 h-5 text-primary" />}
                      {attack.type === 'Lattice Reduction' && <Layers className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{attack.name}</h3>
                        <Badge variant="outline" className="text-[10px]">{attack.year}</Badge>
                      </div>
                      <Badge variant="secondary" className="text-[10px] mb-2">{attack.type}</Badge>
                      <p className="text-xs text-muted-foreground mb-2">{attack.description}</p>
                      {attack.formula && (
                        <div className="p-2 bg-muted/50 rounded text-xs font-mono text-primary mb-2">
                          {attack.formula}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {attack.affected}
                        </span>
                        <span className="flex items-center gap-1 text-destructive">
                          <TrendingDown className="w-3 h-3" />
                          -{attack.entropy_loss} bits
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-primary">Lektion:</span> {attack.lesson}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Timeline */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm font-semibold">Chronologie der Krypto-Katastrophen</span>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                {HISTORICAL_ATTACKS.sort((a, b) => a.year - b.year).map((attack, i) => (
                  <div key={attack.id} className="relative pl-10 pb-4">
                    <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                      attack.type === 'Nonce Reuse' ? 'bg-destructive' :
                      attack.type === 'Weak PRNG' ? 'bg-orange-500' :
                      'bg-primary'
                    }`}>
                      <span className="text-[8px] font-bold text-white">{i + 1}</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-primary font-bold">{attack.year}</span>
                      <span className="font-semibold text-sm">{attack.name}</span>
                      <Badge variant="outline" className="text-[10px]">{attack.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ENTROPY ANALYZER TAB */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="entropy" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm font-semibold">Entropie-Analyse</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Hex-Daten zur Analyse (z.B. RNG Output, Nonce, Key)
                    </label>
                    <textarea 
                      value={entropyInput}
                      onChange={(e) => setEntropyInput(e.target.value)}
                      className="w-full h-32 p-2 bg-background border rounded-lg font-mono text-xs resize-none"
                      placeholder="Hex-Daten eingeben (z.B. a3b5c7d9e1f2...)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={analyzeEntropy} size="sm" className="flex-1">
                      <Activity className="w-4 h-4 mr-1" /> Analysieren
                    </Button>
                    <Button 
                      onClick={() => {
                        const random = Array.from({ length: 64 }, () => 
                          Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                        ).join('');
                        setEntropyInput(random);
                      }}
                      size="sm" 
                      variant="outline"
                    >
                      Random
                    </Button>
                    <Button 
                      onClick={() => setEntropyInput('00112233445566778899aabbccddeeff'.repeat(4))}
                      size="sm" 
                      variant="outline"
                    >
                      Weak
                    </Button>
                  </div>
                </div>

                {entropyScore !== null && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center mb-4">
                      <div className={`text-4xl font-bold font-mono ${
                        entropyScore > 200 ? 'text-green-500' : 
                        entropyScore > 100 ? 'text-yellow-500' : 'text-destructive'
                      }`}>
                        {entropyScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Effektive Bits</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          entropyScore > 200 ? 'bg-green-500' : 
                          entropyScore > 100 ? 'bg-yellow-500' : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.min(100, (entropyScore / 256) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      {entropyScore > 200 ? '✅ Kryptographisch sicher' : 
                       entropyScore > 100 ? '⚠️ Eingeschränkt sicher' : '❌ UNSICHER - Nicht verwenden!'}
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm font-semibold">Analyse-Breakdown</span>
                </div>

                {entropyBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Noch keine Analyse</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entropyBreakdown.map((item, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{item.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              item.quality === 'high' ? 'border-green-500 text-green-500' :
                              item.quality === 'medium' ? 'border-yellow-500 text-yellow-500' :
                              item.quality === 'low' ? 'border-orange-500 text-orange-500' :
                              'border-destructive text-destructive'
                            }`}
                          >
                            {item.quality.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.source}</div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.quality === 'high' ? 'bg-green-500' :
                              item.quality === 'medium' ? 'bg-yellow-500' :
                              item.quality === 'low' ? 'bg-orange-500' : 'bg-destructive'
                            }`}
                            style={{ width: `${Math.min(100, (item.bits / 8) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ATTACK GRAPH TAB */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="graph" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Main Canvas */}
              <div className="xl:col-span-2">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-primary" />
                      <span className="font-mono text-sm">Attack Surface Graph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <span className="text-xs text-muted-foreground">Speed:</span>
                        <Slider
                          value={[simulationSpeed]}
                          onValueChange={(v) => setSimulationSpeed(v[0])}
                          min={0.5}
                          max={3}
                          step={0.5}
                          className="w-20"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant={isSimulating ? "destructive" : "default"}
                        onClick={() => setIsSimulating(!isSimulating)}
                      >
                        {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                        {isSimulating ? 'Stop' : 'Simulate'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetSimulation}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={exportAnalysis}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[600px] rounded-lg cursor-pointer"
                    onClick={handleCanvasClick}
                    style={{ background: '#050510' }}
                  />

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#00ff88]" />
                      <span>Entry Point</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#ffaa00]" />
                      <span>Vulnerability</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#ff6600]" />
                      <span>Technique</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#ff3333]" />
                      <span>Target</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#ff0000]" />
                      <span>Success</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* System Status */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-5 h-5 text-primary" />
                    <span className="font-mono text-sm font-semibold">System Status</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">System Entropie</span>
                        <span className={systemEntropy > 200 ? 'text-green-500' : systemEntropy > 100 ? 'text-yellow-500' : 'text-destructive'}>
                          {systemEntropy.toFixed(0)} bits
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            systemEntropy > 200 ? 'bg-green-500' : systemEntropy > 100 ? 'bg-yellow-500' : 'bg-destructive'
                          }`}
                          style={{ width: `${(systemEntropy / 256) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Kompromittierung</span>
                        <span className={compromiseLevel > 50 ? 'text-destructive' : compromiseLevel > 20 ? 'text-yellow-500' : 'text-green-500'}>
                          {compromiseLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            compromiseLevel > 50 ? 'bg-destructive' : compromiseLevel > 20 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${compromiseLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Selected Node */}
                {selectedNode && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Crosshair className="w-5 h-5 text-primary" />
                      <span className="font-mono text-sm font-semibold">Node Details</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedNode.type}</Badge>
                        <span className="font-semibold">{selectedNode.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedNode.description}</p>
                      {selectedNode.formula && (
                        <div className="p-2 bg-muted/50 rounded font-mono text-xs text-primary">
                          {selectedNode.formula}
                        </div>
                      )}
                      {selectedNode.realWorld && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Real-World: </span>
                          <span className="text-orange-500">{selectedNode.realWorld}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                        <span className="text-muted-foreground">Entropie:</span>
                        <span className={selectedNode.entropy > 128 ? 'text-green-500' : 'text-destructive'}>
                          {selectedNode.entropy} bits
                        </span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Attack Path */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-5 h-5 text-primary" />
                    <span className="font-mono text-sm font-semibold">Attack Path</span>
                  </div>
                  
                  <ScrollArea className="h-32">
                    {attackPath.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Starte Simulation...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {attackPath.map((nodeId, i) => {
                          const node = nodes.find(n => n.id === nodeId);
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <ChevronRight className="w-3 h-3 text-primary" />
                              <span className={`font-mono ${
                                node?.type === 'success' ? 'text-destructive font-bold' : ''
                              }`}>
                                {node?.name || nodeId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </Card>

                {/* Console */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-primary" />
                    <span className="font-mono text-sm font-semibold">Console</span>
                  </div>
                  
                  <ScrollArea className="h-48 bg-black/50 rounded-lg p-2">
                    {logs.slice(-20).map((log, i) => (
                      <div 
                        key={i} 
                        className={`text-[10px] font-mono ${
                          log.includes('CRITICAL') || log.includes('SUCCESS') ? 'text-destructive' :
                          log.includes('WARNING') ? 'text-yellow-500' :
                          log.includes('EXPLOIT') ? 'text-orange-500' :
                          log.includes('MATH') ? 'text-primary' :
                          'text-muted-foreground'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* NEW NEXUS v3.0 MODULES */}
          <TabsContent value="pollard"><PollardsRhoVisualizer onLog={addLog} /></TabsContent>
          <TabsContent value="bsgs"><BSGSVisualizer onLog={addLog} /></TabsContent>
          <TabsContent value="hnp"><HNPLatticeAttack onLog={addLog} /></TabsContent>
          <TabsContent value="mt"><MersenneTwisterAnalyzer onLog={addLog} /></TabsContent>
          <TabsContent value="timing"><TimingAttackSimulator onLog={addLog} /></TabsContent>
          <TabsContent value="script"><BitcoinScriptAnalyzer onLog={addLog} /></TabsContent>
          <TabsContent value="txgraph"><TransactionGraphExplorer onLog={addLog} /></TabsContent>
          <TabsContent value="weakkeys"><WeakKeyDatabase onLog={addLog} /></TabsContent>
          <TabsContent value="research">
            <UnifiedResearchDashboard 
              onModuleNavigate={(module) => setActiveTab(module)}
              onLogMessage={addLog}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          <p className="mb-1">
            <span className="text-primary font-semibold">NEXUS v3.0</span> — Cryptographic Intelligence Console
          </p>
          <p>WISSENSCHAFTLICHE STUDIE · Educational Purpose Only · Build {new Date().toISOString().split('T')[0]}</p>
        </footer>
      </main>
    </div>
  );
};

export default Nexus;