// ═══════════════════════════════════════════════════════════════════════════════
// BRAIN-WALLET GENERATOR & VULNERABILITY DEMONSTRATOR
// ═══════════════════════════════════════════════════════════════════════════════
// WISSENSCHAFTLICH / EDUKATIV: Demonstriert, warum 1–3-Wort-Passphrasen ("Brain
// Wallets") katastrophal unsicher sind. Der private Schlüssel ergibt sich direkt
// aus SHA-256(passphrase). Daraus wird die echte Bitcoin-Adresse (P2PKH) abgeleitet.
// Alle so erzeugten Adressen sind seit Jahren von automatisierten Bots leergeräumt.
// KEINE Wiederherstellung fremder Schlüssel — nur Erzeugung + Anzeige der Vulnerabilität.
// ═══════════════════════════════════════════════════════════════════════════════

import { SECP256K1, scalarMult, type ECPoint } from './crypto-advanced';

// Echte secp256k1-Kurve für scalarMult (kompatibel mit pointAdd/scalarMult-Signatur)
const SECP_CURVE = {
  p: SECP256K1.P,
  a: SECP256K1.A,
  b: SECP256K1.B,
  n: SECP256K1.N,
  Gx: SECP256K1.Gx,
  Gy: SECP256K1.Gy,
};

const G: ECPoint = { x: SECP256K1.Gx, y: SECP256K1.Gy };

// ── SHA-256 via Web Crypto (Mandat des Projekts) ───────────────────────────────
async function sha256Bytes(data: Uint8Array): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest('SHA-256', data as unknown as ArrayBuffer);
  return new Uint8Array(buf);
}

// ── RIPEMD-160 (reine JS-Implementierung) ──────────────────────────────────────
function ripemd160(message: Uint8Array): Uint8Array {
  const rotl = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;

  const zl = [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
    7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,
    3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,
    1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,
    4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13,
  ];
  const zr = [
    5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,
    6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,
    15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,
    8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,
    12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11,
  ];
  const sl = [
    11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,
    7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,
    11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,
    11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,
    9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6,
  ];
  const sr = [
    8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,
    9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,
    9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,
    15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,
    8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11,
  ];
  const hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
  const hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

  const f = (j: number, x: number, y: number, z: number): number => {
    if (j < 16) return (x ^ y ^ z) >>> 0;
    if (j < 32) return ((x & y) | (~x & z)) >>> 0;
    if (j < 48) return ((x | ~y) ^ z) >>> 0;
    if (j < 64) return ((x & z) | (y & ~z)) >>> 0;
    return (x ^ (y | ~z)) >>> 0;
  };

  // Padding
  const len = message.length;
  const padLen = ((len + 8) >>> 6) + 1;
  const buf = new Uint8Array(padLen * 64);
  buf.set(message);
  buf[len] = 0x80;
  const bitLen = len * 8;
  const dv = new DataView(buf.buffer);
  dv.setUint32(buf.length - 8, bitLen >>> 0, true);
  dv.setUint32(buf.length - 4, Math.floor(bitLen / 0x100000000), true);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;

  const X = new Int32Array(16);
  for (let i = 0; i < buf.length; i += 64) {
    for (let j = 0; j < 16; j++) X[j] = dv.getInt32(i + j * 4, true);

    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;

    for (let j = 0; j < 80; j++) {
      const r = (j / 16) | 0;
      let t = (al + f(j, bl, cl, dl) + X[zl[j]] + hl[r]) >>> 0;
      t = (rotl(t, sl[j]) + el) >>> 0;
      al = el; el = dl; dl = rotl(cl, 10); cl = bl; bl = t;

      t = (ar + f(79 - j, br, cr, dr) + X[zr[j]] + hr[r]) >>> 0;
      t = (rotl(t, sr[j]) + er) >>> 0;
      ar = er; er = dr; dr = rotl(cr, 10); cr = br; br = t;
    }

    const t = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + er) >>> 0;
    h2 = (h3 + el + ar) >>> 0;
    h3 = (h4 + al + br) >>> 0;
    h4 = (h0 + bl + cr) >>> 0;
    h0 = t;
  }

  const out = new Uint8Array(20);
  const odv = new DataView(out.buffer);
  odv.setInt32(0, h0, true);
  odv.setInt32(4, h1, true);
  odv.setInt32(8, h2, true);
  odv.setInt32(12, h3, true);
  odv.setInt32(16, h4, true);
  return out;
}

// ── Base58Check ────────────────────────────────────────────────────────────────
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let out = '';
  while (num > 0n) {
    const rem = Number(num % 58n);
    num = num / 58n;
    out = B58[rem] + out;
  }
  for (const b of bytes) {
    if (b === 0) out = '1' + out;
    else break;
  }
  return out;
}

async function base58Check(payload: Uint8Array): Promise<string> {
  const h1 = await sha256Bytes(payload);
  const h2 = await sha256Bytes(h1);
  const full = new Uint8Array(payload.length + 4);
  full.set(payload);
  full.set(h2.subarray(0, 4), payload.length);
  return base58Encode(full);
}

// ── Adress-Ableitung ────────────────────────────────────────────────────────────
function bigIntTo32Bytes(n: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let v = n;
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

async function pubkeyToAddress(pubkey: Uint8Array): Promise<string> {
  const sha = await sha256Bytes(pubkey);
  const h160 = ripemd160(sha);
  const versioned = new Uint8Array(21);
  versioned[0] = 0x00; // P2PKH mainnet
  versioned.set(h160, 1);
  return base58Check(versioned);
}

export interface BrainWalletKey {
  passphrase: string;
  privateKeyHex: string;
  compressedAddress: string;
  uncompressedAddress: string;
  compressedWif: string;
}

async function privKeyToWif(priv: bigint, compressed: boolean): Promise<string> {
  const body = compressed ? new Uint8Array(34) : new Uint8Array(33);
  body[0] = 0x80;
  body.set(bigIntTo32Bytes(priv), 1);
  if (compressed) body[33] = 0x01;
  return base58Check(body);
}

/**
 * Leitet aus einer Passphrase deterministisch einen Brain-Wallet-Schlüssel + Adressen ab.
 * privkey = SHA-256(passphrase) (klassische Brain-Wallet-Konstruktion).
 */
export async function deriveBrainWallet(passphrase: string): Promise<BrainWalletKey> {
  const enc = new TextEncoder().encode(passphrase);
  const hash = await sha256Bytes(enc);
  let priv = 0n;
  for (const b of hash) priv = (priv << 8n) | BigInt(b);
  priv = priv % SECP256K1.N;
  if (priv === 0n) priv = 1n;

  const point = scalarMult(priv, G, SECP_CURVE);
  const xBytes = bigIntTo32Bytes(point.x);

  // Komprimierter Public Key
  const compressed = new Uint8Array(33);
  compressed[0] = point.y % 2n === 0n ? 0x02 : 0x03;
  compressed.set(xBytes, 1);

  // Unkomprimierter Public Key (klassisches Brain-Wallet-Format)
  const uncompressed = new Uint8Array(65);
  uncompressed[0] = 0x04;
  uncompressed.set(xBytes, 1);
  uncompressed.set(bigIntTo32Bytes(point.y), 33);

  const [compressedAddress, uncompressedAddress, compressedWif] = await Promise.all([
    pubkeyToAddress(compressed),
    pubkeyToAddress(uncompressed),
    privKeyToWif(priv, true),
  ]);

  return {
    passphrase,
    privateKeyHex: priv.toString(16).padStart(64, '0'),
    compressedAddress,
    uncompressedAddress,
    compressedWif,
  };
}

// ── Wortliste für Zufalls-Passphrasen (häufige englische Wörter) ────────────────
export const COMMON_WORDS: readonly string[] = [
  'password', 'bitcoin', 'satoshi', 'love', 'money', 'secret', 'hello', 'world',
  'dragon', 'master', 'shadow', 'monkey', 'sunshine', 'freedom', 'whatever',
  'trustno1', 'letmein', 'welcome', 'admin', 'crypto', 'wallet', 'blockchain',
  'private', 'public', 'genesis', 'mining', 'hodl', 'moon', 'lambo', 'diamond',
  'hands', 'apple', 'orange', 'banana', 'tiger', 'eagle', 'ocean', 'mountain',
  'river', 'forest', 'thunder', 'storm', 'winter', 'summer', 'spring', 'autumn',
  'silver', 'golden', 'iron', 'steel', 'fire', 'water', 'earth', 'wind',
  'star', 'planet', 'galaxy', 'cosmos', 'quantum', 'matrix', 'cipher', 'enigma',
  'phoenix', 'titan', 'atlas', 'orion', 'nexus', 'vortex', 'cipher', 'oracle',
  'guardian', 'sentinel', 'warrior', 'hunter', 'ranger', 'knight', 'wizard',
  'legend', 'hero', 'champion', 'victory', 'glory', 'honor', 'destiny', 'fortune',
];

// Web-Crypto-RNG (Mandat: niemals Math.random)
function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

export function generateRandomPhrase(wordCount: 1 | 2 | 3): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(COMMON_WORDS[secureRandomInt(COMMON_WORDS.length)]);
  }
  return words.join(' ');
}
