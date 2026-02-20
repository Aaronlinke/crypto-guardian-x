// ═══════════════════════════════════════════════════════════════════════════════
// NEXUS v3.0 - ADVANCED CRYPTOGRAPHIC ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════════
// 
// WISSENSCHAFTLICHE STUDIE - EDUCATIONAL PURPOSE ONLY
// 
// Diese Bibliothek enthält Implementierungen fortgeschrittener kryptographischer
// Algorithmen für Bildungszwecke.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { SECP256K1 as SECP256K1_IMPORT, modInverse, modPow } from './crypto-math';

// Re-export for use in other modules
export const SECP256K1 = SECP256K1_IMPORT;

// ═══════════════════════════════════════════════════════════════════════════════
// ELLIPTIC CURVE POINT OPERATIONS (Reduzierte Kurve y²=x³+7)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ECPoint {
  x: bigint;
  y: bigint;
  isInfinity?: boolean;
}

// Reduzierte Kurve y²=x³+7 (mod 1013) — identische Gleichung wie secp256k1, berechenbare Ordnung
export const DEMO_CURVE = {
  p: 1013n, // Prime modulus
  a: 0n,
  b: 7n,
  n: 1009n, // Curve order
  Gx: 2n,
  Gy: 439n
};

export function pointAdd(P: ECPoint, Q: ECPoint, curve = DEMO_CURVE): ECPoint {
  if (P.isInfinity) return Q;
  if (Q.isInfinity) return P;
  
  const { p } = curve;
  
  if (P.x === Q.x && P.y !== Q.y) {
    return { x: 0n, y: 0n, isInfinity: true };
  }
  
  let lambda: bigint;
  
  if (P.x === Q.x && P.y === Q.y) {
    // Point doubling
    const num = (3n * P.x * P.x + curve.a) % p;
    const denom = (2n * P.y) % p;
    lambda = (num * modInverse(denom, p)) % p;
  } else {
    // Point addition
    const num = ((Q.y - P.y) % p + p) % p;
    const denom = ((Q.x - P.x) % p + p) % p;
    lambda = (num * modInverse(denom, p)) % p;
  }
  
  const x3 = ((lambda * lambda - P.x - Q.x) % p + p) % p;
  const y3 = ((lambda * (P.x - x3) - P.y) % p + p) % p;
  
  return { x: x3, y: y3 };
}

export function scalarMult(k: bigint, P: ECPoint, curve = DEMO_CURVE): ECPoint {
  let result: ECPoint = { x: 0n, y: 0n, isInfinity: true };
  let addend = P;
  let scalar = k;
  
  while (scalar > 0n) {
    if (scalar & 1n) {
      result = pointAdd(result, addend, curve);
    }
    addend = pointAdd(addend, addend, curve);
    scalar >>= 1n;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// POLLARD'S RHO ALGORITHM FOR ECDLP
// ═══════════════════════════════════════════════════════════════════════════════

export interface RhoStep {
  index: number;
  X: ECPoint;
  a: bigint;
  b: bigint;
  partition: number;
}

export interface RhoResult {
  steps: RhoStep[];
  solution?: bigint;
  collision?: { i: number; j: number };
  iterations: number;
}

function hashPartition(P: ECPoint): number {
  // Partition into 3 sets based on x coordinate mod 3
  return Number(P.x % 3n);
}

function rhoStep(
  X: ECPoint, 
  a: bigint, 
  b: bigint, 
  P: ECPoint, 
  Q: ECPoint, 
  n: bigint,
  curve = DEMO_CURVE
): { X: ECPoint; a: bigint; b: bigint; partition: number } {
  const partition = hashPartition(X);
  
  switch (partition) {
    case 0:
      // X = X + Q
      return { 
        X: pointAdd(X, Q, curve), 
        a, 
        b: (b + 1n) % n,
        partition
      };
    case 1:
      // X = 2X
      return { 
        X: pointAdd(X, X, curve), 
        a: (2n * a) % n, 
        b: (2n * b) % n,
        partition
      };
    default:
      // X = X + P
      return { 
        X: pointAdd(X, P, curve), 
        a: (a + 1n) % n, 
        b,
        partition
      };
  }
}

export function pollardRho(
  P: ECPoint,
  Q: ECPoint,
  n: bigint = DEMO_CURVE.n,
  maxIterations: number = 10000,
  curve = DEMO_CURVE
): RhoResult {
  const steps: RhoStep[] = [];
  
  // Initialize: X0 = P
  let X = { ...P };
  let a = 1n;
  let b = 0n;
  
  // Tortoise
  let Xt = { ...X };
  let at = a;
  let bt = b;
  
  // Hare (moves twice as fast)
  let Xh = { ...X };
  let ah = a;
  let bh = b;
  
  for (let i = 0; i < maxIterations; i++) {
    // Move tortoise one step
    const stepT = rhoStep(Xt, at, bt, P, Q, n, curve);
    Xt = stepT.X;
    at = stepT.a;
    bt = stepT.b;
    
    steps.push({
      index: i,
      X: { ...Xt },
      a: at,
      b: bt,
      partition: stepT.partition
    });
    
    // Move hare two steps
    let stepH = rhoStep(Xh, ah, bh, P, Q, n, curve);
    Xh = stepH.X;
    ah = stepH.a;
    bh = stepH.b;
    
    stepH = rhoStep(Xh, ah, bh, P, Q, n, curve);
    Xh = stepH.X;
    ah = stepH.a;
    bh = stepH.b;
    
    // Check for collision
    if (Xt.x === Xh.x && Xt.y === Xh.y) {
      // Collision found: at*P + bt*Q = ah*P + bh*Q
      // (at - ah)*P = (bh - bt)*Q
      // If Q = d*P, then (at - ah) = d*(bh - bt) mod n
      const aDiff = ((at - ah) % n + n) % n;
      const bDiff = ((bh - bt) % n + n) % n;
      
      if (bDiff !== 0n) {
        const bInv = modInverse(bDiff, n);
        const d = (aDiff * bInv) % n;
        
        return {
          steps,
          solution: d,
          collision: { i: steps.length - 1, j: steps.length * 2 - 1 },
          iterations: i + 1
        };
      }
    }
  }
  
  return { steps, iterations: maxIterations };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BABY-STEP GIANT-STEP ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════════

export interface BSGSStep {
  type: 'baby' | 'giant';
  index: number;
  point: ECPoint;
  value: bigint;
}

export interface BSGSResult {
  babySteps: BSGSStep[];
  giantSteps: BSGSStep[];
  solution?: bigint;
  tableSize: number;
  iterations: number;
}

export function babyStepGiantStep(
  P: ECPoint,
  Q: ECPoint,
  n: bigint = DEMO_CURVE.n,
  curve = DEMO_CURVE
): BSGSResult {
  const m = BigInt(Math.ceil(Math.sqrt(Number(n))));
  const babySteps: BSGSStep[] = [];
  const giantSteps: BSGSStep[] = [];
  
  // Baby step table: j -> jP for j = 0, 1, ..., m
  const babyTable = new Map<string, bigint>();
  let jP: ECPoint = { x: 0n, y: 0n, isInfinity: true };
  
  for (let j = 0n; j <= m; j++) {
    const key = `${jP.x},${jP.y},${jP.isInfinity || false}`;
    babyTable.set(key, j);
    babySteps.push({
      type: 'baby',
      index: Number(j),
      point: { ...jP },
      value: j
    });
    jP = pointAdd(jP, P, curve);
  }
  
  // Compute -mP for giant steps
  const mP = scalarMult(m, P, curve);
  const negMP: ECPoint = { x: mP.x, y: (curve.p - mP.y) % curve.p };
  
  // Giant step: Q - imP for i = 0, 1, ...
  let gamma = { ...Q };
  
  for (let i = 0n; i <= m; i++) {
    const key = `${gamma.x},${gamma.y},${gamma.isInfinity || false}`;
    giantSteps.push({
      type: 'giant',
      index: Number(i),
      point: { ...gamma },
      value: i * m
    });
    
    if (babyTable.has(key)) {
      const j = babyTable.get(key)!;
      const solution = (i * m + j) % n;
      
      return {
        babySteps,
        giantSteps,
        solution,
        tableSize: Number(m),
        iterations: Number(i + m)
      };
    }
    
    gamma = pointAdd(gamma, negMP, curve);
  }
  
  return {
    babySteps,
    giantSteps,
    tableSize: Number(m),
    iterations: Number(2n * m)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HIDDEN NUMBER PROBLEM (HNP) LATTICE CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface HNPSignature {
  r: bigint;
  s: bigint;
  z: bigint;
  knownBits: number; // Number of known MSBs of nonce
  knownValue: bigint; // The known bits value
}

export interface HNPLattice {
  matrix: bigint[][];
  dimension: number;
  signatures: HNPSignature[];
  expectedShortVector: bigint[];
}

export function constructHNPLattice(
  signatures: HNPSignature[],
  n: bigint = SECP256K1.N
): HNPLattice {
  const d = signatures.length;
  const dimension = d + 2;
  
  // Construct the lattice basis matrix
  // [  n   0   0  ...  0   0 ]
  // [  0   n   0  ...  0   0 ]
  // [ t1  t2  t3 ... td  B/n ]
  // [ u1  u2  u3 ... ud   0 B]
  
  const matrix: bigint[][] = [];
  const B = 2n ** 256n; // Scaling factor
  
  // First d rows: n on diagonal
  for (let i = 0; i < d; i++) {
    const row = Array(dimension).fill(0n);
    row[i] = n;
    matrix.push(row);
  }
  
  // Row d+1: t_i values and B/n
  const tRow = signatures.map(sig => {
    // t_i = r_i^(-1) * s_i mod n
    const rInv = modInverse(sig.r, n);
    return (rInv * sig.s) % n;
  });
  tRow.push(B / n);
  tRow.push(0n);
  matrix.push(tRow);
  
  // Row d+2: u_i values and B
  const uRow = signatures.map(sig => {
    // u_i = r_i^(-1) * z_i - known_k_bits mod n
    const rInv = modInverse(sig.r, n);
    const u = ((rInv * sig.z) % n - sig.knownValue + n) % n;
    return u;
  });
  uRow.push(0n);
  uRow.push(B);
  matrix.push(uRow);
  
  // Expected short vector after LLL
  const expectedShortVector = signatures.map(sig => {
    // The unknown part of k_i
    return 2n ** BigInt(256 - sig.knownBits);
  });
  expectedShortVector.push(1n);
  expectedShortVector.push(0n);
  
  return {
    matrix,
    dimension,
    signatures,
    expectedShortVector
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERSENNE TWISTER MT19937 STATE RECOVERY
// ═══════════════════════════════════════════════════════════════════════════════

const MT_N = 624;
const MT_M = 397;
const MT_UPPER_MASK = 0x80000000;
const MT_LOWER_MASK = 0x7fffffff;

export interface MTState {
  state: number[];
  index: number;
}

// Untemper a single output to recover state
export function untemperMT(y: number): number {
  // Reverse y ^= (y >>> 18)
  y ^= (y >>> 18);
  
  // Reverse y ^= (y << 15) & 0xefc60000
  y ^= (y << 15) & 0xefc60000;
  
  // Reverse y ^= (y << 7) & 0x9d2c5680
  // Need to do this iteratively
  let t = y;
  for (let i = 0; i < 4; i++) {
    t = y ^ ((t << 7) & 0x9d2c5680);
  }
  y = t;
  
  // Reverse y ^= (y >>> 11)
  y ^= (y >>> 11) ^ (y >>> 22);
  
  return y >>> 0;
}

// Temper a state value to produce output
export function temperMT(y: number): number {
  y ^= (y >>> 11);
  y ^= (y << 7) & 0x9d2c5680;
  y ^= (y << 15) & 0xefc60000;
  y ^= (y >>> 18);
  return y >>> 0;
}

// Recover full MT state from 624 consecutive outputs
export function recoverMTState(outputs: number[]): MTState | null {
  if (outputs.length < MT_N) {
    return null;
  }
  
  const state: number[] = [];
  for (let i = 0; i < MT_N; i++) {
    state.push(untemperMT(outputs[i]));
  }
  
  return { state, index: MT_N };
}

// Predict next N outputs given recovered state
export function predictMT(state: MTState, count: number): number[] {
  const mt = [...state.state];
  let idx = state.index;
  const predictions: number[] = [];
  
  for (let i = 0; i < count; i++) {
    if (idx >= MT_N) {
      // Twist
      for (let j = 0; j < MT_N; j++) {
        const x = (mt[j] & MT_UPPER_MASK) | (mt[(j + 1) % MT_N] & MT_LOWER_MASK);
        mt[j] = mt[(j + MT_M) % MT_N] ^ (x >>> 1);
        if (x & 1) {
          mt[j] ^= 0x9908b0df;
        }
      }
      idx = 0;
    }
    
    predictions.push(temperMT(mt[idx]));
    idx++;
  }
  
  return predictions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMING ATTACK SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface TimingMeasurement {
  bit: number;
  bitValue: 0 | 1;
  squareTime: number;
  multiplyTime: number;
  totalTime: number;
}

// Simulate timing differences in square-and-multiply
export function simulateTimingAttack(
  exponent: bigint,
  bits: number = 32
): TimingMeasurement[] {
  const measurements: TimingMeasurement[] = [];
  
  for (let i = bits - 1; i >= 0; i--) {
    const bit = Number((exponent >> BigInt(i)) & 1n) as 0 | 1;
    
    // Simulate timing with noise
    const baseSquare = 100 + Math.random() * 10;
    const baseMultiply = bit ? (150 + Math.random() * 15) : 0;
    
    measurements.push({
      bit: i,
      bitValue: bit,
      squareTime: baseSquare,
      multiplyTime: baseMultiply,
      totalTime: baseSquare + baseMultiply
    });
  }
  
  return measurements;
}

// Montgomery ladder (constant time)
export function montgomeryLadderTiming(
  exponent: bigint,
  bits: number = 32
): TimingMeasurement[] {
  const measurements: TimingMeasurement[] = [];
  
  for (let i = bits - 1; i >= 0; i--) {
    const bit = Number((exponent >> BigInt(i)) & 1n) as 0 | 1;
    
    // Constant time - always same operations
    const baseTime = 250 + Math.random() * 5;
    
    measurements.push({
      bit: i,
      bitValue: bit,
      squareTime: baseTime / 2,
      multiplyTime: baseTime / 2,
      totalTime: baseTime
    });
  }
  
  return measurements;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BITCOIN SCRIPT OPCODES
// ═══════════════════════════════════════════════════════════════════════════════

export const OPCODES: Record<number, string> = {
  0x00: 'OP_0',
  0x4c: 'OP_PUSHDATA1',
  0x4d: 'OP_PUSHDATA2',
  0x4e: 'OP_PUSHDATA4',
  0x4f: 'OP_1NEGATE',
  0x51: 'OP_1',
  0x52: 'OP_2',
  0x53: 'OP_3',
  0x54: 'OP_4',
  0x55: 'OP_5',
  0x56: 'OP_6',
  0x57: 'OP_7',
  0x58: 'OP_8',
  0x59: 'OP_9',
  0x5a: 'OP_10',
  0x5b: 'OP_11',
  0x5c: 'OP_12',
  0x5d: 'OP_13',
  0x5e: 'OP_14',
  0x5f: 'OP_15',
  0x60: 'OP_16',
  0x63: 'OP_IF',
  0x64: 'OP_NOTIF',
  0x67: 'OP_ELSE',
  0x68: 'OP_ENDIF',
  0x69: 'OP_VERIFY',
  0x6a: 'OP_RETURN',
  0x75: 'OP_DROP',
  0x76: 'OP_DUP',
  0x77: 'OP_NIP',
  0x78: 'OP_OVER',
  0x79: 'OP_PICK',
  0x7a: 'OP_ROLL',
  0x7b: 'OP_ROT',
  0x7c: 'OP_SWAP',
  0x7d: 'OP_TUCK',
  0x82: 'OP_SIZE',
  0x87: 'OP_EQUAL',
  0x88: 'OP_EQUALVERIFY',
  0x93: 'OP_ADD',
  0x94: 'OP_SUB',
  0xa6: 'OP_RIPEMD160',
  0xa7: 'OP_SHA1',
  0xa8: 'OP_SHA256',
  0xa9: 'OP_HASH160',
  0xaa: 'OP_HASH256',
  0xab: 'OP_CODESEPARATOR',
  0xac: 'OP_CHECKSIG',
  0xad: 'OP_CHECKSIGVERIFY',
  0xae: 'OP_CHECKMULTISIG',
  0xaf: 'OP_CHECKMULTISIGVERIFY',
  0xb1: 'OP_CHECKLOCKTIMEVERIFY',
  0xb2: 'OP_CHECKSEQUENCEVERIFY'
};

export interface ScriptOp {
  opcode: number;
  name: string;
  data?: string;
  description: string;
}

export function parseScript(hexScript: string): ScriptOp[] {
  const ops: ScriptOp[] = [];
  const bytes = hexScript.match(/.{2}/g) || [];
  let i = 0;
  
  while (i < bytes.length) {
    const opcode = parseInt(bytes[i], 16);
    
    if (opcode >= 0x01 && opcode <= 0x4b) {
      // Push N bytes
      const data = bytes.slice(i + 1, i + 1 + opcode).join('');
      ops.push({
        opcode,
        name: `PUSH_${opcode}`,
        data,
        description: `Push ${opcode} bytes onto stack`
      });
      i += opcode + 1;
    } else if (OPCODES[opcode]) {
      ops.push({
        opcode,
        name: OPCODES[opcode],
        description: getOpcodeDescription(OPCODES[opcode])
      });
      i++;
    } else {
      ops.push({
        opcode,
        name: `UNKNOWN_${opcode.toString(16)}`,
        description: 'Unknown opcode'
      });
      i++;
    }
  }
  
  return ops;
}

function getOpcodeDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'OP_DUP': 'Duplicate top stack item',
    'OP_HASH160': 'SHA256 then RIPEMD160',
    'OP_EQUALVERIFY': 'Check equality and verify',
    'OP_CHECKSIG': 'Verify signature',
    'OP_CHECKMULTISIG': 'Verify m-of-n multisig',
    'OP_RETURN': 'Mark output as provably unspendable',
    'OP_IF': 'Conditional execution',
    'OP_CHECKLOCKTIMEVERIFY': 'Absolute timelock',
    'OP_CHECKSEQUENCEVERIFY': 'Relative timelock'
  };
  return descriptions[name] || name;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEAK KEY PATTERNS DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

export interface WeakKeyPattern {
  id: string;
  name: string;
  year: number;
  description: string;
  affectedKeys: string;
  entropy: number;
  detection: string;
  example?: string;
}

export const WEAK_KEY_PATTERNS: WeakKeyPattern[] = [
  {
    id: 'debian_openssl',
    name: 'Debian OpenSSL Bug',
    year: 2008,
    description: 'PID-only entropy led to 32,768 possible keys',
    affectedKeys: '32,768',
    entropy: 15,
    detection: 'Compare against known weak key database',
    example: '0x0001...through 0x8000...'
  },
  {
    id: 'brain_wallet',
    name: 'Brain Wallet',
    year: 2013,
    description: 'Passphrase-derived keys vulnerable to dictionary attack',
    affectedKeys: 'Millions',
    entropy: 40,
    detection: 'Dictionary and rainbow table lookup'
  },
  {
    id: 'randstorm',
    name: 'Randstorm (BitcoinJS)',
    year: 2023,
    description: 'Weak Math.random() in browser led to predictable keys',
    affectedKeys: '~1M wallets',
    entropy: 48,
    detection: 'Check generation timestamp and browser fingerprint'
  },
  {
    id: 'android_bitcoin',
    name: 'Android SecureRandom',
    year: 2013,
    description: 'Uninitialized PRNG in Android Bitcoin apps',
    affectedKeys: '~55 BTC stolen',
    entropy: 32,
    detection: 'Nonce reuse detection in transactions'
  },
  {
    id: 'vanitygen',
    name: 'Vanitygen Weak RNG',
    year: 2012,
    description: 'Some vanitygen versions used weak PRNG',
    affectedKeys: 'Unknown',
    entropy: 64,
    detection: 'Pattern analysis of address prefixes'
  },
  {
    id: 'puzzle_keys',
    name: 'Bitcoin Puzzle Keys',
    year: 2015,
    description: 'Intentionally weak keys (1-256 bits) as challenges',
    affectedKeys: '256 puzzles',
    entropy: 1,
    detection: 'Sequential private key values'
  },
  {
    id: 'roca',
    name: 'ROCA (TPM RSA)',
    year: 2017,
    description: 'Infineon RSA library generated weak primes',
    affectedKeys: 'Millions of TPMs',
    entropy: 200,
    detection: 'Public key fingerprint analysis'
  },
  {
    id: 'milk_sad',
    name: 'Milk Sad (Libbitcoin)',
    year: 2023,
    description: 'Weak entropy in bx seed command',
    affectedKeys: '~900 BTC at risk',
    entropy: 32,
    detection: 'Mersenne Twister state recovery'
  }
];

// Check if a private key matches known weak patterns
export function checkWeakKey(privateKeyHex: string): WeakKeyPattern | null {
  // Check for puzzle-style sequential keys
  const keyBigInt = BigInt('0x' + privateKeyHex.replace(/^0x/, ''));
  
  if (keyBigInt < 2n ** 16n) {
    return WEAK_KEY_PATTERNS.find(p => p.id === 'puzzle_keys') || null;
  }
  
  // Check for brain wallet patterns (common words SHA256'd)
  const commonHashes = [
    '5eb63bbbe01eeed093cb22bb8f5acdc3', // hello
    '098f6bcd4621d373cade4e832627b4f6', // test
    '5d41402abc4b2a76b9719d911017c592', // hello
  ];
  
  if (commonHashes.some(h => privateKeyHex.toLowerCase().startsWith(h))) {
    return WEAK_KEY_PATTERNS.find(p => p.id === 'brain_wallet') || null;
  }
  
  return null;
}
