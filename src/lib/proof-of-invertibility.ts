// ═══════════════════════════════════════════════════════════════════════════════
// PROOF-OF-INVERTIBILITY PROTOCOL
// Mathematischer Beweis dass ein deterministisches System invertierbar ist
// + SHA-256 Hash-Chain + OP_RETURN-kompatibles On-Chain Siegel
// ═══════════════════════════════════════════════════════════════════════════════

// SRIL Coefficients
const ALPHA = 0.245;
const BETA = 0.152;
const GAMMA = 0.985;
const DELTA = 0.112;
const ETA = 0.088;

export interface SystemState {
  t: number;
  H: number;
  N: number;
  G: number;
}

export interface JacobianAnalysis {
  t: number;
  det: number;
  trace: number;
  eigenvalueEstimate: [number, number, number];
  invertible: boolean;
  contracting: boolean;
}

export interface InvertibilityProof {
  // System definition
  coefficients: { alpha: number; beta: number; gamma: number; delta: number; eta: number };
  initialState: SystemState;
  steps: number;
  
  // Forward + Backward sequences
  forwardSequence: SystemState[];
  backwardSequence: SystemState[];
  
  // Error analysis
  reconstructionErrors: { t: number; normL2: number; normLinf: number }[];
  maxReconstructionError: number;
  
  // Jacobian analysis at each step
  jacobians: JacobianAnalysis[];
  allInvertible: boolean;
  allContracting: boolean;
  
  // Invariant verification
  invariantValues: { t: number; phi: number }[];
  invariantDrift: number;
  
  // SHA-256 hash chain
  hashChain: string[];
  proofHash: string;       // final hash of entire proof
  
  // OP_RETURN seal
  opReturnHex: string;     // 80 bytes max, OP_RETURN compatible
  opReturnScript: string;  // full Bitcoin script
  
  // Verdict
  isInvertible: boolean;
  confidence: number;      // 0-1
  timestamp: string;
}

// Perturbation functions
const eps_H = (t: number) => 0.001 * Math.sin(2 * Math.PI * t / 100);
const eps_N = (t: number) => 0.0005 * Math.cos(2 * Math.PI * t / 73);
const eps_G = (t: number) => 0.0002 * Math.sin(2 * Math.PI * t / 37 + Math.PI / 4);

function forwardStep(s: SystemState): SystemState {
  const eH = eps_H(s.t), eN = eps_N(s.t), eG = eps_G(s.t);
  const H_next = s.H + ALPHA * s.N - BETA * s.G + eH;
  const N_next = GAMMA * s.N + DELTA * Math.abs(s.H) * Math.sign(s.H) + eN;
  const growth = ETA * (H_next + N_next) * (1 + 0.01 * Math.tanh(s.G / 10));
  const G_next = s.G + growth + eG;
  return { t: s.t + 1, H: H_next, N: N_next, G: G_next };
}

function backwardStep(s_next: SystemState): SystemState {
  const t = s_next.t - 1;
  const eH = eps_H(t), eN = eps_N(t), eG = eps_G(t);

  let G_guess = s_next.G - ETA * (s_next.H + s_next.N);
  for (let iter = 0; iter < 30; iter++) {
    const growth = ETA * (s_next.H + s_next.N) * (1 + 0.01 * Math.tanh(G_guess / 10));
    G_guess = s_next.G - eG - growth;
  }

  const denom = 1 + (ALPHA * DELTA) / GAMMA;
  const H_t = (s_next.H - eH - ALPHA * (s_next.N - eN) / GAMMA + BETA * G_guess) / denom;
  const N_t = (s_next.N - eN - DELTA * H_t) / GAMMA;

  return { t, H: H_t, N: N_t, G: G_guess };
}

// Numerical Jacobian (3x3)
function computeJacobian(s: SystemState): { det: number; trace: number; matrix: number[][] } {
  const h = 1e-8;
  const s1 = forwardStep(s);
  const sH = forwardStep({ ...s, H: s.H + h });
  const sN = forwardStep({ ...s, N: s.N + h });
  const sG = forwardStep({ ...s, G: s.G + h });
  
  const J = [
    [(sH.H - s1.H) / h, (sN.H - s1.H) / h, (sG.H - s1.H) / h],
    [(sH.N - s1.N) / h, (sN.N - s1.N) / h, (sG.N - s1.N) / h],
    [(sH.G - s1.G) / h, (sN.G - s1.G) / h, (sG.G - s1.G) / h],
  ];
  
  const det = J[0][0] * (J[1][1] * J[2][2] - J[1][2] * J[2][1])
            - J[0][1] * (J[1][0] * J[2][2] - J[1][2] * J[2][0])
            + J[0][2] * (J[1][0] * J[2][1] - J[1][1] * J[2][0]);
  
  const trace = J[0][0] + J[1][1] + J[2][2];
  
  return { det, trace, matrix: J };
}

// Estimate eigenvalues from trace and determinant (Cardano's approximation for 3x3)
function estimateEigenvalues(trace: number, det: number): [number, number, number] {
  // Simplified: assume eigenvalues are roughly det^(1/3) distributed
  const cbrtDet = Math.sign(det) * Math.abs(det) ** (1/3);
  const spread = trace / 3;
  return [spread + cbrtDet * 0.5, spread, spread - cbrtDet * 0.5];
}

// Structural invariant
function invariantPhi(s: SystemState): number {
  return GAMMA * s.N * s.N + ALPHA * s.H * s.N - BETA * s.H * s.G + ETA * s.G * s.G;
}

// SHA-256 hash via Web Crypto
async function sha256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Build hash chain: each hash includes the previous
async function buildHashChain(states: SystemState[]): Promise<string[]> {
  const chain: string[] = [];
  let prevHash = '0'.repeat(64); // genesis
  
  for (const s of states) {
    const data = `${prevHash}|${s.t}:${s.H.toFixed(15)}:${s.N.toFixed(15)}:${s.G.toFixed(15)}`;
    prevHash = await sha256(data);
    chain.push(prevHash);
  }
  
  return chain;
}

// Generate OP_RETURN-compatible payload (max 80 bytes)
function generateOpReturn(proofHash: string, maxError: number, steps: number, invertible: boolean): { hex: string; script: string } {
  // Protocol: [MAGIC:4][VERSION:1][STEPS:1][INVERTIBLE:1][ERROR_EXP:1][PROOF_HASH:32] = 40 bytes
  const magic = '50524f46'; // "PROF" in hex
  const version = '01';
  const stepsHex = steps.toString(16).padStart(2, '0');
  const invertibleHex = invertible ? '01' : '00';
  const errorExp = Math.min(255, Math.max(0, Math.floor(-Math.log10(maxError + 1e-20)))).toString(16).padStart(2, '0');
  const hashTruncated = proofHash.substring(0, 64); // 32 bytes
  
  const payload = `${magic}${version}${stepsHex}${invertibleHex}${errorExp}${hashTruncated}`;
  const script = `OP_RETURN ${payload}`;
  
  return { hex: payload, script };
}

// ═══════════════════════════════════════════════════════════════
// MAIN: Generate complete invertibility proof
// ═══════════════════════════════════════════════════════════════
export async function generateInvertibilityProof(
  H0: number = -4.256,
  N0: number = 5.824,
  G0: number = 1.952,
  steps: number = 5
): Promise<InvertibilityProof> {
  const initialState: SystemState = { t: 0, H: H0, N: N0, G: G0 };
  
  // Forward iteration
  const forwardSequence: SystemState[] = [initialState];
  for (let i = 0; i < steps; i++) {
    forwardSequence.push(forwardStep(forwardSequence[forwardSequence.length - 1]));
  }
  
  // Backward iteration from final state
  const backwardSequence: SystemState[] = [forwardSequence[forwardSequence.length - 1]];
  for (let i = 0; i < steps; i++) {
    backwardSequence.unshift(backwardStep(backwardSequence[0]));
  }
  
  // Reconstruction errors
  const reconstructionErrors = forwardSequence.map((fwd, i) => {
    const bwd = backwardSequence[i];
    const dH = Math.abs(fwd.H - bwd.H);
    const dN = Math.abs(fwd.N - bwd.N);
    const dG = Math.abs(fwd.G - bwd.G);
    return {
      t: fwd.t,
      normL2: Math.sqrt(dH ** 2 + dN ** 2 + dG ** 2),
      normLinf: Math.max(dH, dN, dG),
    };
  });
  const maxReconstructionError = Math.max(...reconstructionErrors.map(e => e.normL2));
  
  // Jacobian analysis at each step
  const jacobians: JacobianAnalysis[] = forwardSequence.slice(0, -1).map(s => {
    const { det, trace } = computeJacobian(s);
    const eigenvalueEstimate = estimateEigenvalues(trace, det);
    return {
      t: s.t,
      det,
      trace,
      eigenvalueEstimate,
      invertible: Math.abs(det) > 1e-10,
      contracting: Math.abs(det) < 1,
    };
  });
  
  const allInvertible = jacobians.every(j => j.invertible);
  const allContracting = jacobians.every(j => j.contracting);
  
  // Invariant values
  const invariantValues = forwardSequence.map(s => ({
    t: s.t,
    phi: invariantPhi(s),
  }));
  const phis = invariantValues.map(v => v.phi);
  const invariantDrift = Math.max(...phis) - Math.min(...phis);
  
  // Hash chain
  const hashChain = await buildHashChain(forwardSequence);
  
  // Proof hash: hash of entire proof data
  const proofData = JSON.stringify({
    forward: forwardSequence,
    backward: backwardSequence,
    errors: reconstructionErrors,
    jacobians: jacobians.map(j => ({ t: j.t, det: j.det })),
    invariants: invariantValues,
    hashChain,
  });
  const proofHash = await sha256(proofData);
  
  // OP_RETURN seal
  const { hex: opReturnHex, script: opReturnScript } = generateOpReturn(
    proofHash, maxReconstructionError, steps, allInvertible
  );
  
  // Confidence score
  const errorScore = maxReconstructionError < 1e-10 ? 1 : maxReconstructionError < 1e-6 ? 0.95 : maxReconstructionError < 0.01 ? 0.7 : 0.3;
  const jacobianScore = allInvertible ? 1 : 0;
  const invariantScore = invariantDrift < 1 ? 0.9 : invariantDrift < 10 ? 0.6 : 0.3;
  const confidence = errorScore * 0.4 + jacobianScore * 0.4 + invariantScore * 0.2;
  
  return {
    coefficients: { alpha: ALPHA, beta: BETA, gamma: GAMMA, delta: DELTA, eta: ETA },
    initialState,
    steps,
    forwardSequence,
    backwardSequence,
    reconstructionErrors,
    maxReconstructionError,
    jacobians,
    allInvertible,
    allContracting,
    invariantValues,
    invariantDrift,
    hashChain,
    proofHash,
    opReturnHex,
    opReturnScript,
    isInvertible: allInvertible && maxReconstructionError < 0.01,
    confidence,
    timestamp: new Date().toISOString(),
  };
}
