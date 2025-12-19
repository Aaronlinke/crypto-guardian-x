import { Search, Radio, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ScanResult {
  address: string;
  balance: number;
  risk: "low" | "medium" | "high" | "critical";
  pattern: string;
  timestamp: Date;
}

const generateRandomAddress = () => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "1";
  for (let i = 0; i < 33; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

const patterns = [
  "entropy_weakness",
  "early_generation",
  "debian_bug_era",
  "brain_wallet_pattern",
  "secure_modern",
];

const riskLevels: Array<"low" | "medium" | "high" | "critical"> = ["low", "medium", "high", "critical"];

export const BlockchainScanner = () => {
  const [scannedCount, setScannedCount] = useState(142857);
  const [currentAddress, setCurrentAddress] = useState(generateRandomAddress());
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const scanInterval = setInterval(() => {
      if (!isScanning) return;

      const newAddress = generateRandomAddress();
      setCurrentAddress(newAddress);
      setScannedCount((prev) => prev + 1);

      // Occasionally find a "vulnerable" wallet
      if (Math.random() > 0.7) {
        const newResult: ScanResult = {
          address: newAddress,
          balance: Math.random() * 10,
          risk: riskLevels[Math.floor(Math.random() * 4)],
          pattern: patterns[Math.floor(Math.random() * patterns.length)],
          timestamp: new Date(),
        };
        setScanResults((prev) => [newResult, ...prev].slice(0, 5));
      }
    }, 500);

    return () => clearInterval(scanInterval);
  }, [isScanning]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "text-destructive";
      case "high": return "text-warning";
      case "medium": return "text-secondary";
      default: return "text-primary";
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case "critical": return "bg-destructive/20 border-destructive/30";
      case "high": return "bg-warning/20 border-warning/30";
      case "medium": return "bg-secondary/20 border-secondary/30";
      default: return "bg-primary/20 border-primary/30";
    }
  };

  return (
    <div className="terminal-card box-glow-cyan relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-secondary" />
          <h2 className="font-display text-sm font-semibold tracking-wider">
            🔍 BLOCKCHAIN MONITOR
          </h2>
        </div>
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`px-3 py-1 text-xs rounded border transition-all ${
            isScanning 
              ? "bg-primary/20 border-primary text-primary" 
              : "bg-muted border-border text-muted-foreground"
          }`}
        >
          {isScanning ? "SCANNING" : "PAUSED"}
        </button>
      </div>

      {/* Current Scan Display */}
      <div className="mb-4 p-3 bg-background/50 border border-border rounded">
        <div className="flex items-center gap-2 mb-2">
          <Radio className={`w-4 h-4 text-secondary ${isScanning ? "animate-pulse" : ""}`} />
          <span className="text-xs text-muted-foreground">SCANNING ADDRESS:</span>
        </div>
        <div className="font-mono text-xs text-secondary break-all glow-cyan">
          {currentAddress}
          <span className="animate-blink">_</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-muted/30 rounded text-center">
          <div className="font-display text-lg text-primary">{scannedCount.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">SCANNED</div>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <div className="font-display text-lg text-warning">{scanResults.filter(r => r.risk !== "low").length}</div>
          <div className="text-[10px] text-muted-foreground">RISKS FOUND</div>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <div className="font-display text-lg text-secondary">1,247</div>
          <div className="text-[10px] text-muted-foreground">BLOCKS/HR</div>
        </div>
      </div>

      {/* Recent Findings */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          RECENT FINDINGS
        </div>
        {scanResults.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            Scanning for vulnerabilities...
          </div>
        ) : (
          scanResults.map((result, index) => (
            <div 
              key={`${result.address}-${index}`}
              className={`p-2 rounded border text-xs ${getRiskBg(result.risk)} animate-fade-in`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-muted-foreground">
                  {result.address.slice(0, 8)}...{result.address.slice(-6)}
                </span>
                <span className={`uppercase font-bold ${getRiskColor(result.risk)}`}>
                  {result.risk}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{result.pattern.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
