import { AlertTriangle, ExternalLink, ShieldAlert, Clock, Bitcoin } from "lucide-react";
import { Button } from "./ui/button";

interface VulnerableWallet {
  address: string;
  balance: number;
  risk: "critical" | "high" | "medium";
  pattern: string;
  discovered: string;
  rescueStatus: "pending" | "in_progress" | "contacted";
}

const vulnerableWallets: VulnerableWallet[] = [
  {
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    balance: 50.0,
    risk: "critical",
    pattern: "Genesis Era - Historical Pattern",
    discovered: "2 hours ago",
    rescueStatus: "contacted",
  },
  {
    address: "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD",
    balance: 12.5,
    risk: "critical",
    pattern: "Debian OpenSSL Bug (CVE-2008-0166)",
    discovered: "4 hours ago",
    rescueStatus: "in_progress",
  },
  {
    address: "1GY2Vb8BZskcgNKy1L1v8jK3uZ3s3JQQQQ",
    balance: 7.3,
    risk: "high",
    pattern: "Low Entropy Generation",
    discovered: "6 hours ago",
    rescueStatus: "pending",
  },
  {
    address: "1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF",
    balance: 4.8,
    risk: "high",
    pattern: "Brain Wallet Pattern Detected",
    discovered: "8 hours ago",
    rescueStatus: "contacted",
  },
  {
    address: "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",
    balance: 2.1,
    risk: "medium",
    pattern: "Early Mobile Wallet Generation",
    discovered: "12 hours ago",
    rescueStatus: "pending",
  },
];

export const VulnerableWalletsList = () => {
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "critical":
        return {
          bg: "bg-destructive/10 border-destructive/30",
          badge: "bg-destructive/20 text-destructive",
          icon: "text-destructive",
        };
      case "high":
        return {
          bg: "bg-warning/10 border-warning/30",
          badge: "bg-warning/20 text-warning",
          icon: "text-warning",
        };
      default:
        return {
          bg: "bg-secondary/10 border-secondary/30",
          badge: "bg-secondary/20 text-secondary",
          icon: "text-secondary",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "contacted":
        return <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded">CONTACTED</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 text-[10px] bg-warning/20 text-warning rounded animate-pulse">IN PROGRESS</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] bg-muted text-muted-foreground rounded">PENDING</span>;
    }
  };

  const totalAtRisk = vulnerableWallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="terminal-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          <h2 className="font-display text-sm font-semibold tracking-wider">
            ⚠️ VULNERABLE WALLETS DETECTED
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Bitcoin className="w-4 h-4 text-warning" />
          <span className="text-warning font-bold">{totalAtRisk.toFixed(2)} BTC</span>
          <span className="text-muted-foreground">at risk</span>
        </div>
      </div>

      {/* Wallet List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-terminal">
        {vulnerableWallets.map((wallet) => {
          const styles = getRiskStyles(wallet.risk);
          
          return (
            <div 
              key={wallet.address}
              className={`p-3 rounded border ${styles.bg} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${styles.icon}`} />
                  <span className={`text-xs font-bold uppercase ${styles.badge} px-2 py-0.5 rounded`}>
                    {wallet.risk}
                  </span>
                </div>
                {getStatusBadge(wallet.rescueStatus)}
              </div>

              <div className="font-mono text-xs mb-2 text-muted-foreground break-all">
                {wallet.address}
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">{wallet.pattern}</span>
                <div className="flex items-center gap-1 text-warning">
                  <Bitcoin className="w-3 h-3" />
                  {wallet.balance.toFixed(4)} BTC
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Discovered {wallet.discovered}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-secondary hover:text-secondary hover:bg-secondary/10"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Showing {vulnerableWallets.length} high-priority targets
        </span>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-primary/30 text-primary hover:bg-primary/10"
        >
          View All Findings
        </Button>
      </div>
    </div>
  );
};
