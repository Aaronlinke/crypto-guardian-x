import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, Zap, Shield, Target, Network, Eye, 
  Terminal, Cpu, Activity, Lock, Unlock, AlertTriangle,
  ChevronRight, Play, Pause, RotateCcw, Download, FileText,
  Search, Scan, Database, GitBranch, Binary, 
  Fingerprint, Key, Hash, Layers, Radio, Radar,
  TrendingDown, TrendingUp, Crosshair, Bug, Skull,
  Grid3X3, Table, Shuffle, Clock, Code
} from "lucide-react";
import { SECP256K1, modInverse, toFullHex, recoverPrivateKey, safeBigInt } from "@/lib/crypto-math";
import { 
  exportHistoricalAttacks, 
  exportHistoricalAttacksMarkdown,
  exportScanResults,
  exportEntropyAnalysis,
  exportAttackSimulation,
  type HistoricalAttackExport,
  type ScanResultExport,
  type SignatureExport,
  type EntropyBreakdownExport
} from "@/lib/export-utils";

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
import NonHarvestabilityDemo from "@/components/nexus/NonHarvestabilityDemo";
import ArchonEngine from "@/components/nexus/ArchonEngine";
import NexusSuite from "@/components/nexus/NexusSuite";
import BrainWalletGenerator from "@/components/nexus/BrainWalletGenerator";

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

// Historische Angriffe - VOLLSTÄNDIG DOKUMENTIERT UND VERIFIZIERT
// ═══════════════════════════════════════════════════════════════════════════════
// WARNUNG: NUR FÜR BILDUNGSZWECKE - JEDER IST FÜR SEIN HANDELN SELBST VERANTWORTLICH
// ═══════════════════════════════════════════════════════════════════════════════
interface HistoricalAttack {
  id: string;
  name: string;
  year: number;
  type: 'Nonce Reuse' | 'Weak PRNG' | 'Entropy Collapse' | 'Timing Side-Channel' | 'Lattice Reduction' | 'Fault Injection' | 'Implementation Bug' | 'Key Generation';
  category: 'ECDSA' | 'RSA' | 'RNG' | 'Hardware' | 'Software' | 'Protocol';
  description: string;
  technicalDetails: string;
  formula: string;
  entropy_loss: number;
  affected: string;
  financialImpact?: string;
  cve?: string;
  lesson: string;
  references: string[];
  exampleData?: {
    r1?: string;
    s1?: string;
    z1?: string;
    r2?: string;
    s2?: string;
    z2?: string;
    publicKey?: string;
    recoveredKey?: string;
  };
  exploitComplexity: 'Trivial' | 'Low' | 'Medium' | 'High' | 'Expert';
  patchStatus: 'Patched' | 'Partially Patched' | 'Unpatched' | 'Hardware Issue';
}

const HISTORICAL_ATTACKS: HistoricalAttack[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // NONCE REUSE ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'ps3_ecdsa',
    name: 'Sony PlayStation 3 ECDSA',
    year: 2010,
    type: 'Nonce Reuse',
    category: 'ECDSA',
    description: 'Sony verwendete einen FESTEN k-Wert für alle Signaturen. fail0verflow extrahierte den privaten Schlüssel auf dem 27C3.',
    technicalDetails: 'Sony signierte alle PS3-Firmware-Updates mit demselben statischen Nonce k=4. Dies ermöglichte triviale Private Key Recovery durch Vergleich zweier Signaturen. Der private Schlüssel wurde live auf der Bühne berechnet.',
    formula: 'd = (z₁ - z₂) × (s₁ - s₂)⁻¹ × r⁻¹ mod n',
    entropy_loss: 256,
    affected: '77 Millionen PSN Accounts',
    financialImpact: 'Sony PSN Hack 2011: $171M Schaden',
    cve: 'CVE-2010-4832',
    lesson: 'k MUSS für jede Signatur kryptographisch zufällig sein - NIEMALS wiederverwenden!',
    references: ['fail0verflow 27C3 Talk', 'Lenstra et al. 2012'],
    exampleData: {
      r1: 'Identisch für beide Signaturen (da k konstant = 4)',
      s1: 'Signatur 1 aus Firmware-Update A',
      z1: 'Hash des ersten signierten Firmware-Images',
      r2: 'r₂ = r₁ (beweis für identisches k)',
      s2: 'Signatur 2 aus Firmware-Update B',
      z2: 'Hash des zweiten signierten Firmware-Images',
      recoveredKey: 'd = (z₁-z₂)(s₁-s₂)⁻¹r⁻¹ mod n — live auf 27C3 berechnet'
    },
    exploitComplexity: 'Trivial',
    patchStatus: 'Patched'
  },
  {
    id: 'blockchain_reuse',
    name: 'Blockchain.info Nonce Reuse',
    year: 2014,
    type: 'Nonce Reuse',
    category: 'ECDSA',
    description: 'RNG-Bug in Blockchain.info führte zu identischen k-Werten bei verschiedenen Bitcoin-Transaktionen.',
    technicalDetails: 'Ein Fehler im Random Number Generator der Blockchain.info Wallet erzeugte unter bestimmten Bedingungen identische Nonces für verschiedene Transaktionen. Angreifer scannten die Blockchain nach Signaturen mit gleichem r-Wert.',
    formula: 'k₁ = k₂ → r₁ = r₂ → d = (z₁ - z₂) × (s₁ - s₂)⁻¹ mod n',
    entropy_loss: 256,
    affected: '~300 BTC gestohlen',
    financialImpact: '~$150,000 zum damaligen Kurs',
    lesson: 'Blockchain-Transaktionen sind öffentlich - jede Nonce-Wiederverwendung ist sofort erkennbar',
    references: ['Bitcoin Talk Forum', 'Heninger et al.'],
    exploitComplexity: 'Trivial',
    patchStatus: 'Patched'
  },
  {
    id: 'bitcoinjs_2014',
    name: 'BitcoinJS ECDSA Vulnerability',
    year: 2014,
    type: 'Nonce Reuse',
    category: 'ECDSA',
    description: 'BitcoinJS-Bibliothek erzeugte unter bestimmten Umständen vorhersagbare Nonces.',
    technicalDetails: 'Die populäre JavaScript Bitcoin-Bibliothek hatte einen Fehler in der Nonce-Generierung, der bei bestimmten Eingaben zu deterministischen (und damit angreifbaren) k-Werten führte.',
    formula: 'k = HMAC-SHA256(d, z) mit fehlerhafter Entropy',
    entropy_loss: 200,
    affected: 'Tausende von JavaScript Bitcoin Wallets',
    lesson: 'RFC 6979 deterministische Nonces sind NUR sicher bei korrekter Implementierung',
    references: ['GitHub BitcoinJS Issues', 'CVE-2014-0160 related'],
    exploitComplexity: 'Low',
    patchStatus: 'Patched'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // WEAK PRNG ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'android_securerandom',
    name: 'Android SecureRandom Bug',
    year: 2013,
    type: 'Weak PRNG',
    category: 'RNG',
    description: 'Android PRNG wurde nicht korrekt initialisiert. Mehrere Bitcoin-Wallets verwendeten identische k-Werte.',
    technicalDetails: 'Die Java SecureRandom Klasse auf Android wurde nicht mit ausreichend Entropie geseeded. Bei Kaltstart des Geräts oder nach App-Installation konnte der RNG-Zustand identisch sein.',
    formula: 'Xₙ₊₁ = (aXₙ + c) mod m → vorhersagbar bei bekanntem Seed',
    entropy_loss: 224,
    affected: '55 BTC gestohlen, Tausende Wallets kompromittiert',
    financialImpact: '~$50,000+',
    cve: 'CVE-2013-7372',
    lesson: 'System-RNG ist nicht immer kryptographisch sicher - zusätzliche Entropiequellen verwenden!',
    references: ['Android Security Bulletin', 'Bitcoin.org Advisory'],
    exploitComplexity: 'Medium',
    patchStatus: 'Patched'
  },
  {
    id: 'randstorm',
    name: 'Randstorm - BitcoinJS Random',
    year: 2023,
    type: 'Weak PRNG',
    category: 'RNG',
    description: 'BitcoinJS (2011-2015) verwendete Math.random() für Wallet-Generierung - komplett unsicher!',
    technicalDetails: 'Wallets, die zwischen 2011-2015 mit BitcoinJS erstellt wurden, nutzten den unsicheren Math.random() PRNG. Dieser basiert auf xorshift128+ und ist vollständig vorhersagbar, wenn genügend Outputs bekannt sind.',
    formula: 'state₆₂₄ = f(output₁...output₆₂₄) → alle Outputs vorhersagbar',
    entropy_loss: 256,
    affected: 'Wallets mit ~1.4 Millionen BTC gefährdet',
    financialImpact: 'Potenziell $50+ Milliarden',
    lesson: 'NIEMALS Math.random() für kryptographische Zwecke verwenden!',
    references: ['Unciphered Research 2023', 'CVE-2023-XXXXX'],
    exploitComplexity: 'High',
    patchStatus: 'Unpatched'
  },
  {
    id: 'mt19937_crack',
    name: 'Mersenne Twister State Recovery',
    year: 2006,
    type: 'Weak PRNG',
    category: 'RNG',
    description: 'MT19937 ist KEIN kryptographischer RNG - nach 624 Outputs ist der gesamte Zustand bekannt.',
    technicalDetails: 'Der Mersenne Twister hat einen internen Zustand von 624×32 Bits. Durch Beobachtung von 624 aufeinanderfolgenden 32-Bit-Outputs kann der komplette Zustand rekonstruiert und alle zukünftigen Outputs vorhergesagt werden.',
    formula: 'MT_state[624] = untemper(output₁...output₆₂₄)',
    entropy_loss: 256,
    affected: 'Python random, PHP rand(), Ruby rand',
    lesson: 'MT19937 ist für Simulationen, NICHT für Kryptographie!',
    references: ['Makoto Matsumoto Paper', 'Cryptopals Challenge'],
    exampleData: {
      publicKey: '624 consecutive outputs needed'
    },
    exploitComplexity: 'Low',
    patchStatus: 'Hardware Issue'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // ENTROPY COLLAPSE ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'debian_openssl',
    name: 'Debian OpenSSL Entropy Bug',
    year: 2008,
    type: 'Entropy Collapse',
    category: 'RNG',
    description: 'Debian-Entwickler entfernte "uninitialisierten" Speicher aus dem RNG. Nur 32.768 mögliche Schlüssel!',
    technicalDetails: 'Kurt Roeckx entfernte zwei Zeilen Code, die Valgrind-Warnungen erzeugten. Diese Zeilen fügten jedoch essentielle Entropie hinzu. Der RNG war nun nur noch vom Prozess-PID abhängig (max 32768 Werte).',
    formula: 'H(K) = log₂(32768) = 15 bits statt 256 bits',
    entropy_loss: 241,
    affected: '2 Jahre vulnerable Keys (2006-2008)',
    financialImpact: 'Unbekannt, aber massiv',
    cve: 'CVE-2008-0166',
    lesson: 'Vermeintliche "Bugs" können kritische Entropiequellen sein - verstehe deinen Code!',
    references: ['Debian Security Advisory DSA-1571', 'OpenSSL Advisory'],
    exampleData: {
      recoveredKey: 'Nur 32768 mögliche Private Keys - alle vorberechenbar'
    },
    exploitComplexity: 'Trivial',
    patchStatus: 'Patched'
  },
  {
    id: 'dual_ec_drbg',
    name: 'Dual EC DRBG Backdoor',
    year: 2013,
    type: 'Entropy Collapse',
    category: 'RNG',
    description: 'NSA-Backdoor in NIST-Standard - mit geheimem Schlüssel alle Outputs vorhersagbar.',
    technicalDetails: 'Dual Elliptic Curve DRBG verwendete zwei Punkte P und Q. Wenn Q = eP mit bekanntem e, kann jeder mit Kenntnis von e aus 32 Bytes Output den gesamten internen Zustand rekonstruieren.',
    formula: 'Q = eP → state = log_P(output×e⁻¹)',
    entropy_loss: 256,
    affected: 'RSA BSAFE, Juniper, Microsoft CryptoAPI',
    cve: 'CVE-2013-1474',
    lesson: 'Vertraue KEINEM Standard blind - verlange Transparenz bei der Parameter-Generierung!',
    references: ['Snowden Leaks', 'Shumow & Ferguson 2007'],
    exploitComplexity: 'Expert',
    patchStatus: 'Patched'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // TIMING SIDE-CHANNEL ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'minerva',
    name: 'Minerva Attack',
    year: 2019,
    type: 'Timing Side-Channel',
    category: 'Hardware',
    description: 'Timing-Unterschiede bei der Nonce-Generierung ermöglichten Lattice-Angriffe auf TPMs und Smart Cards.',
    technicalDetails: 'Die Signaturzeit hing von der Bitlänge des Nonce ab. Durch Messung der Signaturzeit konnten die führenden Bits des Nonce ermittelt werden - genug für einen Lattice-Angriff.',
    formula: 't_sign = f(bitlength(k)) → MSB(k) leak → HNP → d',
    entropy_loss: 128,
    affected: 'TPM, Smart Cards, HSMs von 5+ Herstellern',
    cve: 'CVE-2019-15809',
    lesson: 'ALLE kryptographischen Operationen müssen in KONSTANTER ZEIT laufen!',
    references: ['Minerva Paper 2019', 'TPM-FAIL'],
    exploitComplexity: 'High',
    patchStatus: 'Partially Patched'
  },
  {
    id: 'tpm_fail',
    name: 'TPM-FAIL',
    year: 2019,
    type: 'Timing Side-Channel',
    category: 'Hardware',
    description: 'Timing-Lecks in Intel fTPM und STMicroelectronics TPM ermöglichten ECDSA Key Recovery.',
    technicalDetails: 'Durch präzise Zeitmessungen der ECDSA-Signaturen (Nanosekundenbereich) konnten genug Bits des Nonce ermittelt werden, um den privaten Schlüssel via Lattice-Angriff zu berechnen.',
    formula: 'Δt ~ MSB(k) → HNP → LLL → d',
    entropy_loss: 128,
    affected: 'Intel fTPM, STM TPM, Millions of Devices',
    cve: 'CVE-2019-11090, CVE-2019-16863',
    lesson: 'Hardware ist nicht automatisch sicher - auch TPMs haben Bugs!',
    references: ['TPM-FAIL Paper', 'Intel Security Advisory'],
    exploitComplexity: 'High',
    patchStatus: 'Patched'
  },
  {
    id: 'hertzbleed',
    name: 'Hertzbleed',
    year: 2022,
    type: 'Timing Side-Channel',
    category: 'Hardware',
    description: 'CPU-Frequenzschwankungen durch DVFS lecken kryptographische Geheimnisse.',
    technicalDetails: 'Dynamic Voltage and Frequency Scaling (DVFS) moderner CPUs passt die Frequenz je nach Workload an. Die Frequenzänderungen sind abhängig von den verarbeiteten Daten und können remote gemessen werden.',
    formula: 'f_cpu = f(hamming_weight(secret)) → power ∝ secret',
    entropy_loss: 64,
    affected: 'Alle Intel & AMD CPUs mit DVFS',
    cve: 'CVE-2022-23823, CVE-2022-24436',
    lesson: 'Selbst Stromverbrauch leckt Informationen - konstante Hamming-Gewichte sind Pflicht!',
    references: ['Hertzbleed Paper 2022'],
    exploitComplexity: 'Expert',
    patchStatus: 'Hardware Issue'
  },
  {
    id: 'ladderleak',
    name: 'LadderLeak',
    year: 2020,
    type: 'Timing Side-Channel',
    category: 'Software',
    description: 'Timing-Lecks im Montgomery Ladder bei ECDSA-Implementierungen.',
    technicalDetails: 'Der Montgomery Ladder sollte konstante Zeit garantieren, hatte aber implementation-spezifische Timing-Variationen durch Cache-Misses und Branch Prediction.',
    formula: 'cache_timing(scalar_mult) → bits(k) → HNP',
    entropy_loss: 96,
    affected: 'OpenSSL, mbedTLS, WolfSSL (ältere Versionen)',
    lesson: 'Auch "konstante Zeit" Algorithmen können durch Mikroarchitektur lecken!',
    references: ['LadderLeak Paper', 'OpenSSL Security Advisory'],
    exploitComplexity: 'High',
    patchStatus: 'Patched'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // LATTICE REDUCTION ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'hnp_lattice',
    name: 'Hidden Number Problem (HNP)',
    year: 2020,
    type: 'Lattice Reduction',
    category: 'ECDSA',
    description: 'Teilweise bekannte Nonces ermöglichen Key Recovery via LLL/BKZ Lattice Reduktion.',
    technicalDetails: 'Wenn die oberen Bits mehrerer Nonces bekannt sind, kann das HNP als Closest Vector Problem (CVP) in einem Lattice formuliert werden. LLL oder BKZ findet dann den kürzesten Vektor = Private Key.',
    formula: 'Lattice Basis: B = [n 0; A I] → LLL(B) → shortest vector = d',
    entropy_loss: 0,
    affected: 'Jede ECDSA-Implementierung mit Bit-Leaks',
    lesson: 'Schon 2-4 Bits Leak pro Signatur reichen für vollständige Key Recovery!',
    references: ['Boneh & Venkatesan 1996', 'Howgrave-Graham & Smart 2001'],
    exampleData: {
      publicKey: 'Q = d×G (secp256k1)',
      recoveredKey: 'd via LLL nach ~200 Signaturen mit 4-bit leak'
    },
    exploitComplexity: 'Medium',
    patchStatus: 'Hardware Issue'
  },
  {
    id: 'biased_nonce',
    name: 'Biased Nonce Attack',
    year: 2019,
    type: 'Lattice Reduction',
    category: 'ECDSA',
    description: 'Nonces mit statistischer Verzerrung (z.B. führende Nullen) ermöglichen Key Recovery.',
    technicalDetails: 'Wenn Nonces eine statistische Verzerrung haben (z.B. immer k < n/2, oder führende Bits = 0), reduziert sich der effektive Suchraum und Lattice-Methoden werden anwendbar.',
    formula: 'E[MSB(k)] ≠ uniform → Bias → Lattice CVP',
    entropy_loss: 64,
    affected: 'Alle ECDSA mit biased RNG',
    lesson: 'Nonces müssen UNIFORM über [1, n-1] verteilt sein!',
    references: ['De Mulder et al. 2013'],
    exploitComplexity: 'Medium',
    patchStatus: 'Hardware Issue'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // FAULT INJECTION ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'bellcore',
    name: 'Bellcore Attack (RSA-CRT Fault)',
    year: 1997,
    type: 'Fault Injection',
    category: 'RSA',
    description: 'Ein einziger Bit-Flip während RSA-CRT-Signatur verrät den privaten Schlüssel.',
    technicalDetails: 'RSA mit Chinese Remainder Theorem berechnet s_p = m^d mod p und s_q = m^d mod q. Ein Fehler in s_p führt zu gcd(s - s_fault, n) = q, was n faktorisiert.',
    formula: 'gcd(m^e × s_faulty - m, n) = p oder q',
    entropy_loss: 256,
    affected: 'Alle RSA-CRT Implementierungen ohne Verifikation',
    lesson: 'IMMER Signatur vor Ausgabe verifizieren! Fault Countermeasures sind Pflicht!',
    references: ['Boneh, DeMillo, Lipton 1997'],
    exploitComplexity: 'Medium',
    patchStatus: 'Patched'
  },
  {
    id: 'rowhammer',
    name: 'Rowhammer Cryptographic Attack',
    year: 2016,
    type: 'Fault Injection',
    category: 'Hardware',
    description: 'DRAM-Bit-Flips durch wiederholte Speicherzugriffe können kryptographische Keys korrumpieren.',
    technicalDetails: 'Rowhammer induziert Bit-Flips in benachbarten DRAM-Reihen. Wenn kryptographische Keys im RAM liegen, können gezielte Bit-Flips den Bellcore-Angriff auf RSA ermöglichen.',
    formula: 'Adjacent Row Access → Bit-Flip in Key → Bellcore',
    entropy_loss: 128,
    affected: 'Server, Cloud VMs, alle DRAM ohne ECC',
    cve: 'CVE-2016-6728',
    lesson: 'Verwende ECC-RAM für kryptographische Anwendungen!',
    references: ['Rowhammer.js', 'Google Project Zero'],
    exploitComplexity: 'High',
    patchStatus: 'Hardware Issue'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // IMPLEMENTATION BUG ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'heartbleed',
    name: 'Heartbleed',
    year: 2014,
    type: 'Implementation Bug',
    category: 'Software',
    description: 'Buffer Over-Read in OpenSSL TLS Heartbeat leckte private Schlüssel aus dem Server-Speicher.',
    technicalDetails: 'Ein fehlendes Bounds-Checking beim TLS Heartbeat erlaubte Angreifern, bis zu 64KB Server-Speicher pro Request zu lesen - inklusive Private Keys und Session Keys.',
    formula: 'memcpy(response, payload, payload_length) ohne Längenprüfung',
    entropy_loss: 256,
    affected: '17% aller HTTPS-Server weltweit',
    cve: 'CVE-2014-0160',
    lesson: 'Bounds Checking ist KRITISCH - verwende memory-safe Languages!',
    references: ['OpenSSL Advisory', 'heartbleed.com'],
    exploitComplexity: 'Trivial',
    patchStatus: 'Patched'
  },
  {
    id: 'goto_fail',
    name: 'Apple goto fail',
    year: 2014,
    type: 'Implementation Bug',
    category: 'Protocol',
    description: 'Doppeltes "goto fail" in Apple SSL-Implementierung übersprang Signaturverifikation.',
    technicalDetails: 'Ein Copy-Paste-Fehler führte zu zwei aufeinanderfolgenden "goto fail"-Statements. Das zweite war nicht bedingt und übersprang die eigentliche Signaturprüfung.',
    formula: 'if (err) goto fail; goto fail; // ← immer ausgeführt!',
    entropy_loss: 256,
    affected: 'iOS 7, OS X Mavericks',
    cve: 'CVE-2014-1266',
    lesson: 'Code Reviews sind essentiell - eine Zeile kann alles zerstören!',
    references: ['Apple Security Update', 'Imperial Violet Blog'],
    exploitComplexity: 'Trivial',
    patchStatus: 'Patched'
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // KEY GENERATION ATTACKS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'roca',
    name: 'ROCA (Return of Coppersmith Attack)',
    year: 2017,
    type: 'Key Generation',
    category: 'RSA',
    description: 'Infineon RSA-Key-Generator erzeugte faktorisierbare Primzahlen durch spezielle Struktur.',
    technicalDetails: 'Infineon-TPMs generierten RSA-Primes der Form p = k × M + (65537^a mod M). Diese Struktur ermöglichte Faktorisierung in weniger als 100 CPU-Jahre für 2048-bit Keys.',
    formula: 'p = k × Πpᵢ + 65537^a mod Πpᵢ → Coppersmith',
    entropy_loss: 128,
    affected: '760,000+ aktive Estonian e-ID Cards, TPMs',
    cve: 'CVE-2017-15361',
    lesson: 'Auch Hardware-HSMs können kritische Fehler haben!',
    references: ['ROCA Paper ACM CCS 2017', 'Infineon Advisory'],
    exploitComplexity: 'High',
    patchStatus: 'Patched'
  },
  {
    id: 'weak_primes',
    name: 'GCD Attack on Shared Primes',
    year: 2012,
    type: 'Key Generation',
    category: 'RSA',
    description: 'Millionen RSA-Keys teilten gemeinsame Primfaktoren wegen schlechter RNG-Initialisierung.',
    technicalDetails: 'Bei der Generierung von RSA-Keys auf Embedded Devices mit wenig Entropie entstanden Keys mit gemeinsamen Faktoren. gcd(n1, n2) ≠ 1 ermöglichte triviale Faktorisierung.',
    formula: 'gcd(n₁, n₂) = p → n₁ = p×q₁, n₂ = p×q₂',
    entropy_loss: 256,
    affected: '0.2% aller HTTPS-Keys, 1.03% aller SSH-Keys',
    lesson: 'Schlechte Entropie bei Boot ist ein massives Problem!',
    references: ['Heninger et al. 2012', 'Lenstra et al. 2012'],
    exploitComplexity: 'Trivial',
    patchStatus: 'Hardware Issue'
  },
  {
    id: 'brainwallet',
    name: 'Brainwallet Cracking',
    year: 2015,
    type: 'Key Generation',
    category: 'ECDSA',
    description: 'Brainwallets mit schwachen Passphrasen wurden innerhalb von Sekunden geknackt.',
    technicalDetails: 'Brainwallets generieren den Private Key als SHA256(passphrase). Schwache Passphrasen wie "password" oder "satoshi" wurden mit GPU-Clustern in Echtzeit geknackt.',
    formula: 'd = SHA256(passphrase) → GPU Brute-Force',
    entropy_loss: 200,
    affected: 'Tausende BTC gestohlen',
    financialImpact: '$100M+ verloren',
    lesson: 'Menschliche Passphrasen haben nicht genug Entropie für 256-bit Keys!',
    references: ['Ryan Castellucci DefCon 2015', 'Brainflayer'],
    exploitComplexity: 'Low',
    patchStatus: 'Hardware Issue'
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

const VALID_TABS = [
  'scanner', 'history', 'suite', 'pollard', 'bsgs', 'hnp', 'mt',
  'timing', 'script', 'txgraph', 'weakkeys', 'nonharvest',
  'archon', 'research'
];

const Nexus = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scanner');

  // Deep-link handling via URL hash
  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace('#', '');
      if (!raw) return;

      if (raw.startsWith('suite-')) {
        setActiveTab('suite');
      } else if (VALID_TABS.includes(raw)) {
        setActiveTab(raw);
      }
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

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
    '[NEXUS] v3.0 Cryptographic Intelligence Console',
    '[NEXUS] WISSENSCHAFTLICHE STUDIE - Educational Purpose',
    '[NEXUS] Attack Surface: 24 Knoten geladen',
    '[NEXUS] Historische Angriffe: 20 dokumentiert',
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
          const rng = new Uint32Array(1);
          crypto.getRandomValues(rng);
          const randomEntry = entryPoints[rng[0] % entryPoints.length];
          randomEntry.active = true;
          setAttackPath([randomEntry.id]);
          addLog(`[ATTACK] Einstiegspunkt: ${randomEntry.name}`);
          if (randomEntry.realWorld) {
            addLog(`[ATTACK] Real-World: ${randomEntry.realWorld}`);
          }
        } else {
          for (const node of activeNodes) {
            const rng2 = new Uint32Array(2);
            crypto.getRandomValues(rng2);
            if (node.connections.length > 0 && (rng2[0] % 100) > 40) {
              const nextId = node.connections[rng2[1] % node.connections.length];
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
    ctx.fillText('NEXUS ATTACK SURFACE v3.0', 10, 18);

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
      system: 'NEXUS v3.0 - Cryptographic Intelligence Console',
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
                <h1 className="text-xl font-bold text-primary font-mono tracking-wide">NEXUS v3.0</h1>
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
              <TabsTrigger value="suite" className="font-mono text-xs whitespace-nowrap bg-gradient-to-r from-primary/15 to-secondary/15">
                <Layers className="w-4 h-4 mr-1 text-primary" /> Suite
              </TabsTrigger>
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
              <TabsTrigger value="nonharvest" className="font-mono text-xs whitespace-nowrap bg-gradient-to-r from-primary/10 to-secondary/10">
                <Shield className="w-4 h-4 mr-1 text-primary" /> Non-Harvest
              </TabsTrigger>
              <TabsTrigger value="archon" className="font-mono text-xs whitespace-nowrap bg-gradient-to-r from-secondary/10 to-primary/10">
                <Brain className="w-4 h-4 mr-1 text-secondary" /> ARCHON-100
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
                  <Button onClick={addSignature} size="sm" className="w-full">
                    <Key className="w-4 h-4 mr-1" /> Signatur hinzufügen
                  </Button>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-mono text-sm font-semibold">Scan-Ergebnisse</span>
                  </div>
                  {scanResults.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const sigExport: SignatureExport[] = signatures.map(s => ({
                          id: s.id,
                          r: s.r,
                          s: s.s,
                          z: s.z,
                          timestamp: s.timestamp
                        }));
                        const resultExport: ScanResultExport[] = scanResults.map(r => ({
                          type: r.type,
                          severity: r.severity,
                          message: r.message,
                          formula: r.formula,
                          recoveredKey: r.recoveredKey
                        }));
                        exportScanResults(resultExport, sigExport);
                        toast({ title: "Exportiert", description: `${scanResults.length} Scan-Ergebnisse` });
                        addLog('[EXPORT] Scan-Ergebnisse exportiert');
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" /> Export
                    </Button>
                  )}
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
          {/* HISTORICAL ATTACKS TAB - VOLLSTÄNDIG ERWEITERT */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="attacks" className="space-y-4">
            {/* Disclaimer Banner */}
            <Card className="p-3 bg-destructive/10 border-destructive/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">WARNUNG: NUR FÜR BILDUNGSZWECKE</p>
                  <p className="text-xs text-muted-foreground">
                    Diese Dokumentation dient ausschließlich der wissenschaftlichen Forschung und Bildung. 
                    Jeder ist für sein eigenes Handeln selbst verantwortlich. Missbrauch ist strafbar.
                  </p>
                </div>
              </div>
            </Card>

            {/* Statistics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">{HISTORICAL_ATTACKS.length}</div>
                <div className="text-[10px] text-muted-foreground">Dokumentierte Angriffe</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {HISTORICAL_ATTACKS.filter(a => a.type === 'Nonce Reuse').length}
                </div>
                <div className="text-[10px] text-muted-foreground">Nonce Reuse</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {HISTORICAL_ATTACKS.filter(a => a.type === 'Weak PRNG').length}
                </div>
                <div className="text-[10px] text-muted-foreground">Weak PRNG</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {HISTORICAL_ATTACKS.filter(a => a.type === 'Timing Side-Channel').length}
                </div>
                <div className="text-[10px] text-muted-foreground">Side-Channel</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {HISTORICAL_ATTACKS.filter(a => a.type === 'Lattice Reduction').length}
                </div>
                <div className="text-[10px] text-muted-foreground">Lattice</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-cyan-500">
                  {HISTORICAL_ATTACKS.filter(a => a.exploitComplexity === 'Trivial').length}
                </div>
                <div className="text-[10px] text-muted-foreground">Trivial Exploits</div>
              </Card>
            </div>

            {/* Filter & Export */}
            <Card className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/20 text-xs">Alle</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-destructive/20 text-xs border-destructive/50">Nonce Reuse</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-orange-500/20 text-xs border-orange-500/50">Weak PRNG</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-yellow-500/20 text-xs border-yellow-500/50">Side-Channel</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-purple-500/20 text-xs border-purple-500/50">Lattice</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      exportHistoricalAttacks(HISTORICAL_ATTACKS as HistoricalAttackExport[]);
                      toast({ title: "Exportiert", description: `${HISTORICAL_ATTACKS.length} Angriffe als JSON` });
                      addLog('[EXPORT] Historische Angriffe als JSON exportiert');
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" /> JSON
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      exportHistoricalAttacksMarkdown(HISTORICAL_ATTACKS as HistoricalAttackExport[]);
                      toast({ title: "Exportiert", description: `${HISTORICAL_ATTACKS.length} Angriffe als Markdown` });
                      addLog('[EXPORT] Historische Angriffe als Markdown exportiert');
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" /> Markdown
                  </Button>
                </div>
              </div>
            </Card>

            {/* Attack Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {HISTORICAL_ATTACKS.map((attack) => (
                <Card key={attack.id} className="p-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      attack.type === 'Nonce Reuse' ? 'bg-destructive/20' :
                      attack.type === 'Weak PRNG' ? 'bg-orange-500/20' :
                      attack.type === 'Entropy Collapse' ? 'bg-yellow-500/20' :
                      attack.type === 'Timing Side-Channel' ? 'bg-purple-500/20' :
                      attack.type === 'Lattice Reduction' ? 'bg-cyan-500/20' :
                      attack.type === 'Fault Injection' ? 'bg-pink-500/20' :
                      attack.type === 'Implementation Bug' ? 'bg-red-500/20' :
                      'bg-primary/20'
                    }`}>
                      {attack.type === 'Nonce Reuse' && <Key className="w-6 h-6 text-destructive" />}
                      {attack.type === 'Weak PRNG' && <Shuffle className="w-6 h-6 text-orange-500" />}
                      {attack.type === 'Entropy Collapse' && <TrendingDown className="w-6 h-6 text-yellow-500" />}
                      {attack.type === 'Timing Side-Channel' && <Clock className="w-6 h-6 text-purple-500" />}
                      {attack.type === 'Lattice Reduction' && <Grid3X3 className="w-6 h-6 text-cyan-500" />}
                      {attack.type === 'Fault Injection' && <Zap className="w-6 h-6 text-pink-500" />}
                      {attack.type === 'Implementation Bug' && <Bug className="w-6 h-6 text-red-500" />}
                      {attack.type === 'Key Generation' && <Fingerprint className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm">{attack.name}</h3>
                        <Badge variant="outline" className="text-[10px]">{attack.year}</Badge>
                        {attack.cve && (
                          <Badge variant="destructive" className="text-[9px]">{attack.cve}</Badge>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{attack.type}</Badge>
                        <Badge variant="outline" className="text-[10px]">{attack.category}</Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] ${
                            attack.exploitComplexity === 'Trivial' ? 'border-destructive text-destructive' :
                            attack.exploitComplexity === 'Low' ? 'border-orange-500 text-orange-500' :
                            attack.exploitComplexity === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-primary text-primary'
                          }`}
                        >
                          {attack.exploitComplexity}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-3">{attack.description}</p>

                  {/* Technical Details (expandable feel) */}
                  <div className="p-2 bg-muted/30 rounded-lg mb-3">
                    <p className="text-[11px] text-foreground/80">{attack.technicalDetails}</p>
                  </div>

                  {/* Formula */}
                  <div className="p-2 bg-background/80 border border-primary/30 rounded font-mono text-xs text-primary mb-3">
                    {attack.formula}
                  </div>

                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-muted/20 rounded">
                      <div className="text-[10px] text-muted-foreground">Betroffen</div>
                      <div className="text-xs font-semibold">{attack.affected}</div>
                    </div>
                    <div className="p-2 bg-destructive/10 rounded">
                      <div className="text-[10px] text-muted-foreground">Entropie-Verlust</div>
                      <div className="text-xs font-semibold text-destructive">-{attack.entropy_loss} bits</div>
                    </div>
                    {attack.financialImpact && (
                      <div className="p-2 bg-orange-500/10 rounded col-span-2">
                        <div className="text-[10px] text-muted-foreground">Finanzieller Schaden</div>
                        <div className="text-xs font-semibold text-orange-500">{attack.financialImpact}</div>
                      </div>
                    )}
                  </div>

                  {/* Example Data if available */}
                  {attack.exampleData && (
                    <div className="p-2 bg-muted/20 rounded mb-3">
                      <div className="text-[10px] font-semibold text-primary mb-1">Beispiel-Daten:</div>
                      <div className="font-mono text-[9px] text-muted-foreground space-y-0.5">
                        {attack.exampleData.r1 && <div>r₁: {attack.exampleData.r1.substring(0, 40)}...</div>}
                        {attack.exampleData.s1 && <div>s₁: {attack.exampleData.s1.substring(0, 40)}...</div>}
                        {attack.exampleData.recoveredKey && (
                          <div className="text-destructive font-semibold mt-1">→ {attack.exampleData.recoveredKey}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Patch Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {attack.patchStatus === 'Patched' && <Shield className="w-3 h-3 text-green-500" />}
                      {attack.patchStatus === 'Partially Patched' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                      {attack.patchStatus === 'Unpatched' && <Skull className="w-3 h-3 text-destructive" />}
                      {attack.patchStatus === 'Hardware Issue' && <Cpu className="w-3 h-3 text-orange-500" />}
                      <span className={`text-[10px] ${
                        attack.patchStatus === 'Patched' ? 'text-green-500' :
                        attack.patchStatus === 'Unpatched' ? 'text-destructive' :
                        'text-yellow-500'
                      }`}>{attack.patchStatus}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {attack.references.slice(0, 2).join(' | ')}
                    </div>
                  </div>

                  {/* Lesson */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-start gap-2">
                      <Crosshair className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-primary">Lektion: </span>
                        <span className="text-muted-foreground">{attack.lesson}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Timeline */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm font-semibold">Chronologie der Krypto-Katastrophen (1997-2023)</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{HISTORICAL_ATTACKS.length} Ereignisse</Badge>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-destructive to-primary" />
                  {HISTORICAL_ATTACKS.sort((a, b) => a.year - b.year).map((attack, i) => (
                    <div key={attack.id} className="relative pl-12 pb-4 group">
                      <div className={`absolute left-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background ${
                        attack.type === 'Nonce Reuse' ? 'bg-destructive' :
                        attack.type === 'Weak PRNG' ? 'bg-orange-500' :
                        attack.type === 'Timing Side-Channel' ? 'bg-purple-500' :
                        attack.type === 'Lattice Reduction' ? 'bg-cyan-500' :
                        attack.type === 'Fault Injection' ? 'bg-pink-500' :
                        'bg-primary'
                      }`}>
                        <span className="text-[9px] font-bold text-white">{i + 1}</span>
                      </div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="font-mono text-primary font-bold text-lg">{attack.year}</span>
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{attack.name}</span>
                        <Badge variant="outline" className="text-[10px]">{attack.type}</Badge>
                        {attack.exploitComplexity === 'Trivial' && (
                          <Badge variant="destructive" className="text-[9px]">TRIVIAL</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors">
                        {attack.affected}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Attack Type Summary */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Radar className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm font-semibold">Angriffs-Kategorien Zusammenfassung</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-sm">Nonce Reuse</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Identische k-Werte bei ECDSA ermöglichen triviale Private Key Recovery. 
                    Formel: d = (z₁-z₂)(s₁-s₂)⁻¹r⁻¹ mod n
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shuffle className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-sm">Weak PRNG</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Nicht-kryptographische PRNGs (MT19937, LCG) sind vollständig vorhersagbar 
                    wenn genügend Outputs bekannt sind.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-sm">Side-Channel</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Timing, Power, Cache und EM-Analysen lecken Bits des Geheimnisses. 
                    Konstante Zeit ist Pflicht.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Grid3X3 className="w-5 h-5 text-cyan-500" />
                    <span className="font-semibold text-sm">Lattice Attacks</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    HNP und CVP in Gittern ermöglichen Key Recovery bei partiellen Nonce-Leaks. 
                    LLL/BKZ Reduktion.
                  </p>
                </div>
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
                        const randomBytes = new Uint8Array(64);
                        crypto.getRandomValues(randomBytes);
                        const random = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <span className="font-mono text-sm font-semibold">Analyse-Breakdown</span>
                  </div>
                  {entropyBreakdown.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const breakdownExport: EntropyBreakdownExport[] = entropyBreakdown.map(b => ({
                          name: b.name,
                          bits: b.bits,
                          quality: b.quality,
                          source: b.source
                        }));
                        exportEntropyAnalysis(entropyInput, entropyScore, breakdownExport);
                        toast({ title: "Exportiert", description: "Entropie-Analyse" });
                        addLog('[EXPORT] Entropie-Analyse exportiert');
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" /> Export
                    </Button>
                  )}
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
          <TabsContent value="nonharvest"><NonHarvestabilityDemo onLog={addLog} /></TabsContent>
          <TabsContent value="suite"><NexusSuite onLog={addLog} /></TabsContent>
          <TabsContent value="archon"><ArchonEngine onLog={addLog} /></TabsContent>
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