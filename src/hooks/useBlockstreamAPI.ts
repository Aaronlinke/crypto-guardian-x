import { useState, useCallback } from 'react';

const BLOCKSTREAM_API = 'https://blockstream.info/api';

export interface AddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_address: string;
      value: number;
    } | null;
    sequence: number;
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_address: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface UTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
}

export interface BlockstreamData {
  addressInfo: AddressInfo | null;
  transactions: Transaction[];
  utxos: UTXO[];
}

export interface UseBlockstreamAPIReturn {
  data: BlockstreamData;
  loading: boolean;
  error: string | null;
  fetchAddressData: (address: string) => Promise<void>;
  reset: () => void;
}

export function useBlockstreamAPI(): UseBlockstreamAPIReturn {
  const [data, setData] = useState<BlockstreamData>({
    addressInfo: null,
    transactions: [],
    utxos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressData = useCallback(async (address: string) => {
    const trimmedAddress = address.trim();
    
    setLoading(true);
    setError(null);
    setData({ addressInfo: null, transactions: [], utxos: [] });

    try {
      // Fetch all data in parallel
      const [addressRes, txRes, utxoRes] = await Promise.all([
        fetch(`${BLOCKSTREAM_API}/address/${trimmedAddress}`),
        fetch(`${BLOCKSTREAM_API}/address/${trimmedAddress}/txs`),
        fetch(`${BLOCKSTREAM_API}/address/${trimmedAddress}/utxo`),
      ]);

      if (!addressRes.ok) {
        if (addressRes.status === 400) {
          throw new Error('Ungültige Bitcoin-Adresse');
        }
        throw new Error(`API-Fehler: ${addressRes.status}`);
      }

      const [addressInfo, transactions, utxos] = await Promise.all([
        addressRes.json() as Promise<AddressInfo>,
        txRes.ok ? (txRes.json() as Promise<Transaction[]>) : Promise.resolve([]),
        utxoRes.ok ? (utxoRes.json() as Promise<UTXO[]>) : Promise.resolve([]),
      ]);

      setData({
        addressInfo,
        transactions: transactions.slice(0, 10), // Limit to 10 most recent
        utxos,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData({ addressInfo: null, transactions: [], utxos: [] });
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, fetchAddressData, reset };
}
