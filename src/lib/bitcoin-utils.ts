// Bitcoin address validation and formatting utilities

export const BITCOIN_ADDRESS_REGEX = {
  // Legacy addresses (P2PKH) - start with 1
  legacy: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  // P2SH addresses - start with 3
  p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  // Bech32 addresses (SegWit) - start with bc1
  bech32: /^bc1[a-z0-9]{39,59}$/,
  // Testnet addresses
  testnetLegacy: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  testnetP2SH: /^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  testnetBech32: /^tb1[a-z0-9]{39,59}$/,
};

export type AddressType = 'legacy' | 'p2sh' | 'bech32' | 'testnet' | 'unknown';

export function validateBitcoinAddress(address: string): boolean {
  const trimmed = address.trim();
  return (
    BITCOIN_ADDRESS_REGEX.legacy.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.p2sh.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.bech32.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.testnetLegacy.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.testnetP2SH.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.testnetBech32.test(trimmed)
  );
}

export function getAddressType(address: string): AddressType {
  const trimmed = address.trim();
  
  if (BITCOIN_ADDRESS_REGEX.legacy.test(trimmed)) return 'legacy';
  if (BITCOIN_ADDRESS_REGEX.p2sh.test(trimmed)) return 'p2sh';
  if (BITCOIN_ADDRESS_REGEX.bech32.test(trimmed)) return 'bech32';
  if (
    BITCOIN_ADDRESS_REGEX.testnetLegacy.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.testnetP2SH.test(trimmed) ||
    BITCOIN_ADDRESS_REGEX.testnetBech32.test(trimmed)
  ) {
    return 'testnet';
  }
  
  return 'unknown';
}

export function satoshiToBTC(satoshi: number): string {
  return (satoshi / 100_000_000).toFixed(8);
}

export function formatBTC(btc: string | number): string {
  const num = typeof btc === 'string' ? parseFloat(btc) : btc;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  });
}

export function shortenAddress(address: string, chars: number = 8): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function shortenTxHash(hash: string, chars: number = 10): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
