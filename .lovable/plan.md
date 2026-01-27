

# NEXUS v3.0 - Ultimate Cryptographic Research Console

## Ueberblick

NEXUS wird von einem Analyse-Tool zu einer vollstaendigen **Cryptographic Attack Simulation Platform** erweitert. Neue Module decken ECDLP-Solver, PRNG-Analyse, Side-Channel-Simulation und Bitcoin-spezifische Angriffe ab.

---

## Neue Module

### 1. Pollard's Rho ECDLP Solver
**Zweck:** Visualisierung des wichtigsten Algorithmus zur Loesung des Elliptic Curve Discrete Logarithm Problems.

**Funktionen:**
- Interaktive Visualisierung des "Random Walk" auf der Kurve
- Collision Detection Animation (Zykluserkennung)
- Floyd's Cycle Detection vs Brent's Algorithm Vergleich
- Komplexitaetsanzeige: O(sqrt(n)) Operationen
- Demo-Modus mit kleiner Kurve (Ordnung ~1000)

**Formel-Visualisierung:**
```
Walk: Xi+1 = f(Xi) wobei f partitioniert P, Q, P+Q
Kollision: aiP + biQ = ajP + bjQ
Loesung: x = (ai - aj)(bj - bi)^(-1) mod n
```

---

### 2. Baby-step Giant-step (BSGS) Visualizer
**Zweck:** Space-Time Tradeoff Algorithmus fuer ECDLP.

**Funktionen:**
- Tabellen-Visualisierung der "Baby Steps" (jP fuer j = 0..m)
- Animation der "Giant Steps" (Q - imP)
- Hash-Table Lookup Animation
- Speicher vs Zeit Tradeoff Slider
- Vergleich mit Pollard's Rho

**Mathematik:**
```
m = ceil(sqrt(n))
Baby: {jP : j = 0, 1, ..., m}
Giant: Q - imP fuer i = 0, 1, ...
Match: x = im + j
```

---

### 3. Hidden Number Problem (HNP) Lattice Attack
**Zweck:** Zeigt wie partielle Nonce-Leaks zu Key Recovery fuehren.

**Funktionen:**
- Lattice-Matrix Konstruktion aus biased Nonces
- LLL-Reduktion Animation (nutzt existierenden LLLLatticeVisualizer)
- Visualisierung: Wie viele Bits Leak = Break?
- Minerva Attack Simulation
- TPM-FAIL Szenario

**Integration:** Verbindet mit dem existierenden `LLLLatticeVisualizer`

---

### 4. Mersenne Twister State Recovery
**Zweck:** PRNG-Analyse und Vorhersage.

**Funktionen:**
- MT19937 interne State-Visualisierung (624 x 32-bit)
- "Untemper" Funktion Animation
- State Recovery nach 624 Outputs
- Vorhersage Demo (naechste N Zahlen)
- Vergleich: Math.random() vs crypto.getRandomValues()

**Lernziel:** Warum `Math.random()` NIEMALS fuer Krypto verwenden

---

### 5. Timing Attack Simulator
**Zweck:** Side-Channel Visualisierung.

**Funktionen:**
- Modular Exponentiation mit Timing-Unterschieden
- Statistischer Angriff auf Square-and-Multiply
- Timing-Histogramme
- Cache-Timing Grundlagen (Flush+Reload Konzept)
- Montgomery Ladder als Gegenmassnahme

---

### 6. Bitcoin Script Analyzer
**Zweck:** P2SH, P2WSH Script-Analyse.

**Funktionen:**
- Script Dekompilierung und Visualisierung
- Stack-basierte Ausfuehrung Animation
- Bekannte Script-Templates erkennen
- Multisig (m-of-n) Analyse
- Timelock Visualisierung (CLTV, CSV)

---

### 7. Transaction Graph Explorer
**Zweck:** Transaktionsfluss-Analyse.

**Funktionen:**
- Address Clustering Heuristiken
- Common-Input-Ownership Visualisierung
- Change Detection Algorithmen
- Taint Analysis
- Interaktiver Graph mit D3.js-Style Rendering

**Nutzt:** Existierenden Blockstream API Hook

---

### 8. Weak Key Pattern Database
**Zweck:** Bekannte schwache Schluessel erkennen.

**Funktionen:**
- Debian OpenSSL Bug Keys (32.768 moegliche)
- Brain Wallet Woerterbuch-Angriff Demo
- Puzzle Transaction Keys (1BTC Challenges)
- "Vanitygen" Pattern Analyse
- Low-Entropy Seed Detection

---

## Erweiterte Historical Attacks Database

Neue dokumentierte Angriffe:
1. **Fail0verflow PS3** (2010) - bereits vorhanden
2. **Android SecureRandom** (2013) - bereits vorhanden
3. **Debian OpenSSL** (2008) - bereits vorhanden
4. **Blockchain.info** (2014) - bereits vorhanden
5. **Minerva** (2019) - bereits vorhanden
6. **HNP Lattice** (2020) - bereits vorhanden
7. **NEU: BitcoinJS ECDSA** (2014) - Weitere Nonce Reuse
8. **NEU: Randstorm** (2023) - BitcoinJS weak random
9. **NEU: ROCA** (2017) - RSA Key Generation in TPM
10. **NEU: Rowhammer Fault** (2015) - Hardware-based Key Recovery
11. **NEU: Hertzbleed** (2022) - Frequency Side-Channel
12. **NEU: LadderLeak** (2020) - Timing in Montgomery Ladder

---

## Technische Umsetzung

### Neue Dateien:
```
src/components/nexus/
  PollardsRhoVisualizer.tsx
  BSGSVisualizer.tsx
  HNPLatticeAttack.tsx
  MersenneTwisterAnalyzer.tsx
  TimingAttackSimulator.tsx
  BitcoinScriptAnalyzer.tsx
  TransactionGraphExplorer.tsx
  WeakKeyDatabase.tsx
```

### Erweiterung von Nexus.tsx:
- Neue Tabs fuer jedes Modul
- Unified Console fuer alle Logs
- Cross-Module Linking (z.B. HNP -> LLL)
- Export-Funktion fuer Analysen

### Neue lib Funktionen:
```
src/lib/crypto-advanced.ts
  - pollardRho(curve, P, Q)
  - babyStepGiantStep(curve, P, Q)
  - hnpLatticeConstruct(signatures, knownBits)
  - untemperMT(output)
  - recoverMTState(outputs[624])
```

---

## Aenderungen an existierenden Komponenten

1. **LLLLatticeVisualizer**: Export der Gram-Schmidt und LLL Funktionen fuer HNP-Modul
2. **EllipticCurveVisualizer**: Integration mit Pollard's Rho und BSGS
3. **EntropyComparator**: Erweiterung um MT19937 Analyse

---

## UI/UX Verbesserungen

- **Dark Theme Konsistenz**: Beibehaltung der Terminal-Aesthetik
- **Interaktive Tutorials**: Schritt-fuer-Schritt Erklaerungen
- **Code-Export**: Python/JavaScript Code fuer jeden Algorithmus
- **Dokumentations-Panel**: LaTeX-Formeln mit KaTeX
- **Progress Indicators**: Fuer lang laufende Berechnungen

---

## Wissenschaftliche Kennzeichnung

Jedes Modul erhaelt:
- Header: "WISSENSCHAFTLICHE STUDIE - EDUCATIONAL PURPOSE"
- Referenzen zu akademischen Papern
- "Responsible Disclosure" Hinweise
- Ethical Guidelines sichtbar

