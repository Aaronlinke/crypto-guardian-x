import { useState } from "react";
import { Search, Copy, ExternalLink, Loader2, CheckCircle, XCircle, ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlockstreamAPI } from "@/hooks/useBlockstreamAPI";
import { 
  validateBitcoinAddress, 
  getAddressType, 
  satoshiToBTC, 
  shortenTxHash, 
  formatTimestamp,
  type AddressType 
} from "@/lib/bitcoin-utils";
import { useToast } from "@/hooks/use-toast";

const addressTypeLabels: Record<AddressType, { label: string; color: string }> = {
  legacy: { label: "Legacy (P2PKH)", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  p2sh: { label: "P2SH", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  bech32: { label: "SegWit (Bech32)", color: "bg-primary/20 text-primary border-primary/30" },
  testnet: { label: "Testnet", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  unknown: { label: "Unbekannt", color: "bg-muted text-muted-foreground border-border" },
};

export function AddressLookup() {
  const [address, setAddress] = useState("");
  const { data, loading, error, fetchAddressData, reset } = useBlockstreamAPI();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    if (!validateBitcoinAddress(address)) {
      toast({
        title: "Ungültige Adresse",
        description: "Bitte geben Sie eine gültige Bitcoin-Adresse ein",
        variant: "destructive",
      });
      return;
    }
    
    fetchAddressData(address);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: `${label} wurde kopiert`,
    });
  };

  const addressType = address ? getAddressType(address) : 'unknown';
  const { addressInfo, transactions, utxos } = data;

  // Calculate balance
  const confirmedBalance = addressInfo 
    ? addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum 
    : 0;
  const unconfirmedBalance = addressInfo
    ? addressInfo.mempool_stats.funded_txo_sum - addressInfo.mempool_stats.spent_txo_sum
    : 0;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-primary">[</span>
          BLOCKCHAIN LOOKUP
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
            LIVE API
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Bitcoin-Adresse eingeben..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono text-xs bg-background/50 border-border/50 pr-20"
            />
            {address && addressType !== 'unknown' && (
              <Badge 
                variant="outline" 
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] ${addressTypeLabels[addressType].color}`}
              >
                {addressTypeLabels[addressType].label}
              </Badge>
            )}
          </div>
          <Button 
            type="submit" 
            size="sm" 
            disabled={loading || !address.trim()}
            className="gap-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Abfragen
          </Button>
        </form>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {addressInfo && (
          <div className="space-y-4">
            {/* Balance Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-background/50 border border-border/30">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Confirmed Balance
                </div>
                <div className="font-mono text-lg text-primary font-bold">
                  {satoshiToBTC(confirmedBalance)} <span className="text-xs text-muted-foreground">BTC</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {confirmedBalance.toLocaleString()} sat
                </div>
              </div>
              <div className="p-3 rounded-md bg-background/50 border border-border/30">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Unconfirmed
                </div>
                <div className={`font-mono text-lg font-bold ${unconfirmedBalance !== 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {unconfirmedBalance !== 0 ? (unconfirmedBalance > 0 ? '+' : '') : ''}{satoshiToBTC(unconfirmedBalance)} <span className="text-xs">BTC</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {unconfirmedBalance.toLocaleString()} sat
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-4 p-3 rounded-md bg-background/30 border border-border/20">
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground">Transaktionen</div>
                <div className="font-mono text-sm">{addressInfo.chain_stats.tx_count}</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground">Eingegangen</div>
                <div className="font-mono text-sm text-green-400">
                  {satoshiToBTC(addressInfo.chain_stats.funded_txo_sum)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground">Ausgegeben</div>
                <div className="font-mono text-sm text-red-400">
                  {satoshiToBTC(addressInfo.chain_stats.spent_txo_sum)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground">UTXOs</div>
                <div className="font-mono text-sm">{utxos.length}</div>
              </div>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Letzte Transaktionen
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {transactions.map((tx) => {
                      // Calculate if this is incoming or outgoing for this address
                      const isIncoming = tx.vout.some(
                        (out) => out.scriptpubkey_address === addressInfo.address
                      );
                      const isOutgoing = tx.vin.some(
                        (inp) => inp.prevout?.scriptpubkey_address === addressInfo.address
                      );

                      // Calculate amount for this address
                      let amount = 0;
                      tx.vout.forEach((out) => {
                        if (out.scriptpubkey_address === addressInfo.address) {
                          amount += out.value;
                        }
                      });
                      tx.vin.forEach((inp) => {
                        if (inp.prevout?.scriptpubkey_address === addressInfo.address) {
                          amount -= inp.prevout.value;
                        }
                      });

                      return (
                        <div
                          key={tx.txid}
                          className="p-2 rounded-md bg-background/30 border border-border/20 hover:border-border/40 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {amount >= 0 ? (
                                <ArrowDownLeft className="w-3 h-3 text-green-400" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 text-red-400" />
                              )}
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {shortenTxHash(tx.txid)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(tx.txid, "TX Hash")}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <a
                                href={`https://blockstream.info/tx/${tx.txid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-50 hover:opacity-100 transition-opacity"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className={`font-mono text-xs font-medium ${amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {amount >= 0 ? '+' : ''}{satoshiToBTC(amount)} BTC
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              {tx.status.confirmed ? (
                                <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/30 gap-1">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  Confirmed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                                  Pending
                                </Badge>
                              )}
                              {tx.status.block_height && (
                                <span className="text-[10px] text-muted-foreground">
                                  Block #{tx.status.block_height.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {tx.status.block_time && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimestamp(tx.status.block_time)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* UTXOs */}
            {utxos.length > 0 && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Coins className="w-3 h-3" />
                  Unspent Outputs (UTXOs)
                </div>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-1">
                    {utxos.map((utxo) => (
                      <div
                        key={`${utxo.txid}:${utxo.vout}`}
                        className="flex items-center justify-between p-2 rounded-md bg-background/20 border border-border/10 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">
                            {shortenTxHash(utxo.txid, 6)}:{utxo.vout}
                          </span>
                          {utxo.status.confirmed ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                          )}
                        </div>
                        <span className="font-mono text-primary font-medium">
                          {satoshiToBTC(utxo.value)} BTC
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !addressInfo && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Bitcoin-Adresse eingeben um echte Blockchain-Daten abzufragen</p>
            <p className="text-[10px] mt-1 opacity-50">Unterstützt: Legacy (1...), P2SH (3...), SegWit (bc1...)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
