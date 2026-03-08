// ═══════════════════════════════════════════════════════════════════════════════
// ENTROPY ANALYSIS ENGINE — Mathematisch fundierte statistische Tests
// Shannon-Entropie, Chi², Serial Correlation, Monte-Carlo-Pi, Runs-Test
// ═══════════════════════════════════════════════════════════════════════════════

export interface EntropyTestResult {
  name: string;
  score: number;       // 0-1, where 1 = perfect randomness
  raw: number;         // raw test statistic
  expected: number;    // expected value for perfect randomness
  deviation: number;   // how far from expected (0 = perfect)
  verdict: 'SECURE' | 'MARGINAL' | 'WEAK' | 'CRITICAL';
  explanation: string;
}

export interface EntropyReport {
  inputHex: string;
  inputBytes: number;
  tests: EntropyTestResult[];
  unifiedScore: number;   // weighted composite 0-1
  verdict: 'CRYPTOGRAPHIC' | 'ACCEPTABLE' | 'SUSPICIOUS' | 'BROKEN';
  weaknessesFound: string[];
  timestamp: string;
}

/**
 * Convert hex string to byte array
 */
function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/\s/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length - 1; i += 2) {
    bytes.push(parseInt(clean.substring(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Convert bytes to bit array
 */
function bytesToBits(bytes: number[]): number[] {
  const bits: number[] = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

// ═══════════════════════════════════════════════════════════════
// TEST 1: Shannon-Entropie (Byte-Level)
// H = -Σ p(x) · log₂(p(x)), max = 8 bits/byte
// ═══════════════════════════════════════════════════════════════
export function shannonEntropy(bytes: number[]): EntropyTestResult {
  const freq = new Array(256).fill(0);
  for (const b of bytes) freq[b]++;
  
  let H = 0;
  const n = bytes.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / n;
      H -= p * Math.log2(p);
    }
  }
  
  const maxH = Math.log2(Math.min(256, n)); // theoretical max
  const score = Math.min(H / 8, 1); // normalize to 0-1
  const deviation = Math.abs(8 - H) / 8;
  
  return {
    name: 'Shannon-Entropie',
    score,
    raw: H,
    expected: 8,
    deviation,
    verdict: H > 7.5 ? 'SECURE' : H > 6.0 ? 'MARGINAL' : H > 4.0 ? 'WEAK' : 'CRITICAL',
    explanation: `H = ${H.toFixed(6)} bits/byte (max 8.0). ${H > 7.5 ? 'Gleichverteilung nahe optimal' : H > 6.0 ? 'Leichte Muster erkennbar' : 'Signifikante Muster — unsicher für Kryptographie'}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// TEST 2: Chi-Quadrat-Test (Byte-Level)
// χ² = Σ (O_i - E_i)² / E_i
// ═══════════════════════════════════════════════════════════════
export function chiSquaredTest(bytes: number[]): EntropyTestResult {
  const freq = new Array(256).fill(0);
  for (const b of bytes) freq[b]++;
  
  const expected = bytes.length / 256;
  let chiSq = 0;
  for (let i = 0; i < 256; i++) {
    chiSq += (freq[i] - expected) ** 2 / expected;
  }
  
  // For 255 degrees of freedom:
  // p=0.01 → χ² ≈ 310.5, p=0.99 → χ² ≈ 198.4
  // Perfect random: χ² ≈ 255
  const expectedChiSq = 255;
  const deviation = Math.abs(chiSq - expectedChiSq) / expectedChiSq;
  const score = Math.max(0, 1 - deviation);
  
  return {
    name: 'Chi²-Test (Byte)',
    score,
    raw: chiSq,
    expected: expectedChiSq,
    deviation,
    verdict: deviation < 0.15 ? 'SECURE' : deviation < 0.35 ? 'MARGINAL' : deviation < 0.6 ? 'WEAK' : 'CRITICAL',
    explanation: `χ² = ${chiSq.toFixed(2)} (erwartet ≈ ${expectedChiSq}). ${deviation < 0.15 ? 'Verteilung konsistent mit Zufall' : 'Abweichung von Gleichverteilung detektiert'}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// TEST 3: Serial Correlation Coefficient
// SCC = (Σ x_i·x_{i+1} - n·μ²) / (Σ x_i² - n·μ²)
// Perfekt: SCC ≈ 0
// ═══════════════════════════════════════════════════════════════
export function serialCorrelation(bytes: number[]): EntropyTestResult {
  const n = bytes.length;
  if (n < 4) return { name: 'Serial Correlation', score: 0, raw: 0, expected: 0, deviation: 1, verdict: 'CRITICAL', explanation: 'Zu wenige Daten' };
  
  let sumX = 0, sumX2 = 0, sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumX += bytes[i];
    sumX2 += bytes[i] * bytes[i];
    if (i < n - 1) sumXY += bytes[i] * bytes[i + 1];
  }
  // Add wrap-around
  sumXY += bytes[n - 1] * bytes[0];
  
  const mean = sumX / n;
  const variance = sumX2 / n - mean * mean;
  
  if (variance < 1e-10) {
    return { name: 'Serial Correlation', score: 0, raw: 1, expected: 0, deviation: 1, verdict: 'CRITICAL', explanation: 'Keine Varianz — konstante Eingabe' };
  }
  
  const scc = (sumXY / n - mean * mean) / variance;
  const absScc = Math.abs(scc);
  const score = Math.max(0, 1 - absScc * 5); // scale: |SCC| > 0.2 → score=0
  
  return {
    name: 'Serial Correlation',
    score,
    raw: scc,
    expected: 0,
    deviation: absScc,
    verdict: absScc < 0.05 ? 'SECURE' : absScc < 0.15 ? 'MARGINAL' : absScc < 0.3 ? 'WEAK' : 'CRITICAL',
    explanation: `SCC = ${scc.toFixed(8)} (erwartet ≈ 0). ${absScc < 0.05 ? 'Keine serielle Abhängigkeit' : 'Aufeinanderfolgende Bytes sind korreliert — Muster vorhanden'}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// TEST 4: Monte-Carlo-Pi-Test
// Paare (x,y) → prüfe ob x²+y² ≤ 1 → π ≈ 4·hits/total
// ═══════════════════════════════════════════════════════════════
export function monteCarloPI(bytes: number[]): EntropyTestResult {
  const pairs = Math.floor(bytes.length / 2);
  if (pairs < 10) return { name: 'Monte-Carlo π', score: 0, raw: 0, expected: Math.PI, deviation: 1, verdict: 'CRITICAL', explanation: 'Zu wenige Daten' };
  
  let inside = 0;
  for (let i = 0; i < pairs; i++) {
    const x = bytes[i * 2] / 255;
    const y = bytes[i * 2 + 1] / 255;
    if (x * x + y * y <= 1) inside++;
  }
  
  const piEstimate = 4 * inside / pairs;
  const deviation = Math.abs(piEstimate - Math.PI) / Math.PI;
  const score = Math.max(0, 1 - deviation * 10);
  
  return {
    name: 'Monte-Carlo π',
    score,
    raw: piEstimate,
    expected: Math.PI,
    deviation,
    verdict: deviation < 0.02 ? 'SECURE' : deviation < 0.05 ? 'MARGINAL' : deviation < 0.15 ? 'WEAK' : 'CRITICAL',
    explanation: `π ≈ ${piEstimate.toFixed(6)} (erwartet ${Math.PI.toFixed(6)}). Abweichung ${(deviation * 100).toFixed(2)}%. ${deviation < 0.02 ? '2D-Verteilung konsistent' : 'Nicht-uniformität in 2D detektiert'}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// TEST 5: Runs-Test (Bit-Level)
// Zähle Runs von 0en und 1en. Zu wenige oder zu viele → nicht zufällig
// ═══════════════════════════════════════════════════════════════
export function runsTest(bytes: number[]): EntropyTestResult {
  const bits = bytesToBits(bytes);
  const n = bits.length;
  if (n < 20) return { name: 'Runs-Test', score: 0, raw: 0, expected: 0, deviation: 1, verdict: 'CRITICAL', explanation: 'Zu wenige Bits' };
  
  const ones = bits.filter(b => b === 1).length;
  const pi = ones / n;
  
  // Pre-test: proportion should be near 0.5
  if (Math.abs(pi - 0.5) > 2 / Math.sqrt(n)) {
    return {
      name: 'Runs-Test',
      score: 0,
      raw: pi,
      expected: 0.5,
      deviation: Math.abs(pi - 0.5),
      verdict: 'CRITICAL',
      explanation: `Bit-Proportion π = ${pi.toFixed(4)} — zu weit von 0.5 entfernt. Grundlegende Nicht-Zufälligkeit.`,
    };
  }
  
  // Count runs
  let runs = 1;
  for (let i = 1; i < n; i++) {
    if (bits[i] !== bits[i - 1]) runs++;
  }
  
  const expectedRuns = 1 + 2 * n * pi * (1 - pi);
  const varianceRuns = 2 * n * pi * (1 - pi) * (2 * n * pi * (1 - pi) - 1) / (n - 1);
  const stddev = Math.sqrt(Math.max(varianceRuns, 1));
  const zScore = Math.abs(runs - expectedRuns) / stddev;
  const score = Math.max(0, 1 - zScore / 3); // z > 3 → score = 0
  
  return {
    name: 'Runs-Test (Bit)',
    score,
    raw: runs,
    expected: expectedRuns,
    deviation: zScore,
    verdict: zScore < 1.96 ? 'SECURE' : zScore < 2.58 ? 'MARGINAL' : zScore < 3.29 ? 'WEAK' : 'CRITICAL',
    explanation: `${runs} Runs (erwartet ${expectedRuns.toFixed(1)}), z = ${zScore.toFixed(4)}. ${zScore < 1.96 ? 'Bit-Übergänge konsistent mit Zufall (p>0.05)' : 'Signifikante Abweichung — mögliche Struktur'}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED ANALYSIS — Alle 5 Tests + gewichteter Composite Score
// ═══════════════════════════════════════════════════════════════
export function analyzeEntropy(hexInput: string): EntropyReport {
  const bytes = hexToBytes(hexInput);
  
  if (bytes.length < 4) {
    return {
      inputHex: hexInput,
      inputBytes: bytes.length,
      tests: [],
      unifiedScore: 0,
      verdict: 'BROKEN',
      weaknessesFound: ['Zu wenige Bytes für Analyse (min. 4 benötigt)'],
      timestamp: new Date().toISOString(),
    };
  }
  
  const tests = [
    shannonEntropy(bytes),
    chiSquaredTest(bytes),
    serialCorrelation(bytes),
    monteCarloPI(bytes),
    runsTest(bytes),
  ];
  
  // Weighted composite: Shannon(30%) + Chi²(25%) + SCC(20%) + MC-π(15%) + Runs(10%)
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10];
  const unifiedScore = tests.reduce((sum, t, i) => sum + t.score * weights[i], 0);
  
  const weaknessesFound: string[] = [];
  for (const t of tests) {
    if (t.verdict === 'WEAK' || t.verdict === 'CRITICAL') {
      weaknessesFound.push(`${t.name}: ${t.verdict} — ${t.explanation}`);
    }
  }
  
  const verdict: EntropyReport['verdict'] = 
    unifiedScore > 0.85 ? 'CRYPTOGRAPHIC' :
    unifiedScore > 0.65 ? 'ACCEPTABLE' :
    unifiedScore > 0.40 ? 'SUSPICIOUS' : 'BROKEN';
  
  return {
    inputHex: hexInput,
    inputBytes: bytes.length,
    tests,
    unifiedScore,
    verdict,
    weaknessesFound,
    timestamp: new Date().toISOString(),
  };
}
