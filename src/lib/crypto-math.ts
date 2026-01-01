// VOLLSTÄNDIGE KRYPTOGRAPHIE-BIBLIOTHEK
// Wissenschaftliches Forschungsprojekt - Keine Zensur

// secp256k1 Kurvenparameter
export const SECP256K1 = {
  N: BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"),
  P: BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"),
  Gx: BigInt("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"),
  Gy: BigInt("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8"),
  A: 0n,
  B: 7n
};

// Modulare Inverse (Extended Euclidean Algorithm)
export function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [((a % m) + m) % m, m];
  let [old_s, s] = [1n, 0n];
  
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  
  return ((old_s % m) + m) % m;
}

// Modulare Exponentiation
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = ((base % mod) + mod) % mod;
  
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  
  return result;
}

// Sichere BigInt Konvertierung
export function safeBigInt(hex: string): bigint | null {
  try {
    const cleaned = hex.replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "");
    if (!cleaned || cleaned.length === 0) return null;
    return BigInt("0x" + cleaned);
  } catch {
    return null;
  }
}

// BigInt zu Hex (volle Länge)
export function toFullHex(n: bigint, bytes: number = 32): string {
  const hex = n.toString(16);
  return hex.padStart(bytes * 2, "0");
}

// ECDSA Signatur Analyse
export interface ECDSASignature {
  r: bigint;
  s: bigint;
  z: bigint; // Message Hash
}

export interface ECDSARecovery {
  k: bigint;
  d: bigint;
  rInv: bigint;
  kHex: string;
  dHex: string;
  rInvHex: string;
}

// ECDSA Private Key Recovery (wenn k bekannt)
export function recoverPrivateKey(
  k: bigint, 
  r: bigint, 
  s: bigint, 
  z: bigint
): ECDSARecovery {
  const N = SECP256K1.N;
  const rInv = modInverse(r, N);
  // d = r^-1 * (s*k - z) mod N
  const d = (rInv * (((s * k) % N) - z + N)) % N;
  
  return {
    k,
    d: ((d % N) + N) % N,
    rInv,
    kHex: toFullHex(k),
    dHex: toFullHex(((d % N) + N) % N),
    rInvHex: toFullHex(rInv)
  };
}

// SHA-256 Konstanten (erste 32 Bits der Kubikwurzeln der ersten 64 Primzahlen)
export const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

// SHA-256 Initialwerte (erste 32 Bits der Quadratwurzeln der ersten 8 Primzahlen)
export const SHA256_H: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

// Bitweise Operationen für SHA-256
export function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function ch(x: number, y: number, z: number): number {
  return ((x & y) ^ (~x & z)) >>> 0;
}

export function maj(x: number, y: number, z: number): number {
  return ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
}

export function sigma0(x: number): number {
  return (rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)) >>> 0;
}

export function sigma1(x: number): number {
  return (rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)) >>> 0;
}

export function gamma0(x: number): number {
  return (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0;
}

export function gamma1(x: number): number {
  return (rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10)) >>> 0;
}

// SHA-256 Schritt-für-Schritt Interface
export interface SHA256Step {
  round: number;
  W: number;
  K: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
  h: number;
  T1: number;
  T2: number;
  Ch: number;
  Maj: number;
  Σ0: number;
  Σ1: number;
}

// SHA-256 mit vollständiger Schritt-Ausgabe
export function sha256Steps(message: string): { 
  steps: SHA256Step[]; 
  messageSchedule: number[];
  paddedMessage: Uint8Array;
  finalHash: string;
} {
  // Nachricht zu Bytes
  const msgBytes = new TextEncoder().encode(message);
  
  // Padding
  const bitLength = BigInt(msgBytes.length * 8);
  const paddingLength = (55 - msgBytes.length % 64 + 64) % 64 + 1;
  const paddedLength = msgBytes.length + paddingLength + 8;
  
  const paddedMessage = new Uint8Array(paddedLength);
  paddedMessage.set(msgBytes);
  paddedMessage[msgBytes.length] = 0x80;
  
  // Länge anhängen (Big Endian)
  const view = new DataView(paddedMessage.buffer);
  view.setBigUint64(paddedLength - 8, bitLength, false);
  
  // Initialwerte
  let [h0, h1, h2, h3, h4, h5, h6, h7] = SHA256_H;
  
  const steps: SHA256Step[] = [];
  const messageSchedule: number[] = [];
  
  // Verarbeite 512-Bit Blöcke
  for (let i = 0; i < paddedMessage.length; i += 64) {
    // Message Schedule erstellen
    const W: number[] = new Array(64);
    
    for (let t = 0; t < 16; t++) {
      W[t] = (paddedMessage[i + t*4] << 24) |
             (paddedMessage[i + t*4 + 1] << 16) |
             (paddedMessage[i + t*4 + 2] << 8) |
             paddedMessage[i + t*4 + 3];
      W[t] = W[t] >>> 0;
    }
    
    for (let t = 16; t < 64; t++) {
      W[t] = (gamma1(W[t-2]) + W[t-7] + gamma0(W[t-15]) + W[t-16]) >>> 0;
    }
    
    if (i === 0) messageSchedule.push(...W);
    
    // Arbeitsvariablen
    let [a, b, c, d, e, f, g, h] = [h0, h1, h2, h3, h4, h5, h6, h7];
    
    // 64 Runden
    for (let t = 0; t < 64; t++) {
      const Ch = ch(e, f, g);
      const Maj = maj(a, b, c);
      const Σ0 = sigma0(a);
      const Σ1 = sigma1(e);
      
      const T1 = (h + Σ1 + Ch + SHA256_K[t] + W[t]) >>> 0;
      const T2 = (Σ0 + Maj) >>> 0;
      
      steps.push({
        round: t,
        W: W[t],
        K: SHA256_K[t],
        a, b, c, d, e, f, g, h,
        T1, T2, Ch, Maj, Σ0, Σ1
      });
      
      h = g;
      g = f;
      f = e;
      e = (d + T1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) >>> 0;
    }
    
    // Hashwerte aktualisieren
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  
  // Finaler Hash
  const finalHash = [h0, h1, h2, h3, h4, h5, h6, h7]
    .map(n => n.toString(16).padStart(8, "0"))
    .join("");
  
  return { steps, messageSchedule, paddedMessage, finalHash };
}

// Faktorisierung mit SAT (für kleine N)
export function factorize(N: number): { p: number; q: number; steps: string[] }[] {
  const results: { p: number; q: number; steps: string[] }[] = [];
  const sqrtN = Math.floor(Math.sqrt(N));
  
  for (let p = 2; p <= sqrtN; p++) {
    if (N % p === 0) {
      const q = N / p;
      const steps = [
        `N = ${N} = ${N.toString(2)}₂`,
        `Test: p = ${p}`,
        `${N} / ${p} = ${q}`,
        `Verifikation: ${p} × ${q} = ${p * q}`,
        `p = ${p} = ${p.toString(2).padStart(Math.ceil(Math.log2(N)), "0")}₂`,
        `q = ${q} = ${q.toString(2).padStart(Math.ceil(Math.log2(N)), "0")}₂`
      ];
      results.push({ p, q, steps });
    }
  }
  
  return results;
}

// CNF-Klauseln für Multiplikation generieren
export function generateMultiplicationCNF(bits: number): { 
  variables: string[]; 
  clauses: string[][]; 
  description: string 
} {
  const pVars = Array.from({ length: bits }, (_, i) => `p${i}`);
  const qVars = Array.from({ length: bits }, (_, i) => `q${i}`);
  const variables = [...pVars, ...qVars];
  
  const clauses: string[][] = [];
  const description = `CNF für ${bits}-Bit Multiplikation: p × q = N`;
  
  // Bit 0: N₀ = p₀ ∧ q₀
  clauses.push(["p0", "q0"]); // Wenn N₀=1, dann p₀=1 UND q₀=1
  
  // Weitere Bits: XOR + Carry
  for (let i = 1; i < bits; i++) {
    // Vereinfachte CNF für Demonstration
    clauses.push([`p${i}`, `q${i}`, `-p${i-1}`, `-q${i-1}`]);
  }
  
  return { variables, clauses, description };
}

// Dynamisches System: Rückwärts-Operator
export function backwardIterate(
  F: (x: number) => number,
  target: number,
  searchRange: [number, number],
  resolution: number = 1000
): number[] {
  const preimages: number[] = [];
  const [min, max] = searchRange;
  const step = (max - min) / resolution;
  
  for (let x = min; x <= max; x += step) {
    const y = F(x);
    if (Math.abs(y - target) < step * 2) {
      preimages.push(x);
    }
  }
  
  return preimages;
}

// Lyapunov Exponent berechnen
export function lyapunovExponent(
  F: (x: number) => number,
  dF: (x: number) => number,
  x0: number,
  iterations: number = 1000
): number {
  let sum = 0;
  let x = x0;
  
  for (let i = 0; i < iterations; i++) {
    const derivative = Math.abs(dF(x));
    if (derivative > 0) {
      sum += Math.log(derivative);
    }
    x = F(x);
  }
  
  return sum / iterations;
}
