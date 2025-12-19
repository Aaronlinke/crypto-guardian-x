import { Terminal, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const logMessages = [
  { type: "info", message: "[NEUROGENESIS] Pattern analysis complete - 847 new signatures" },
  { type: "success", message: "[SCANNER] Block #824,157 processed - 2,341 transactions" },
  { type: "warning", message: "[THREAT] Suspicious activity detected: 1DEP8...4aGv" },
  { type: "info", message: "[CROSS-CHAIN] Ethereum bridge sync: 99.97% complete" },
  { type: "success", message: "[RESCUE] Wallet migration initiated for 3 addresses" },
  { type: "info", message: "[QUANTUM] Post-quantum key generation: Kyber-1024" },
  { type: "warning", message: "[PREDICT] Emerging threat pattern: mobile_entropy_v2" },
  { type: "success", message: "[NETWORK] 12 guardian nodes online in EU-CENTRAL" },
  { type: "info", message: "[DEFENSE] Adaptive shield activated - Level 2" },
  { type: "success", message: "[VERIFY] ZK-proof validation successful" },
];

export const SystemConsole = () => {
  const [logs, setLogs] = useState<typeof logMessages>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial logs
    setLogs(logMessages.slice(0, 3));

    const interval = setInterval(() => {
      const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
      const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
      
      setLogs(prev => [...prev, { ...randomLog, message: `${timestamp} ${randomLog.message}` }].slice(-8));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case "success": return "text-primary";
      case "warning": return "text-warning";
      case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="terminal-card">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">
          SYSTEM CONSOLE
        </h2>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <div className="w-2 h-2 rounded-full bg-warning" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      <div 
        ref={consoleRef}
        className="h-48 bg-background/80 border border-border rounded p-2 overflow-y-auto scrollbar-terminal"
      >
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-1 text-xs font-mono py-0.5 ${getLogColor(log.type)}`}
          >
            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="break-all">{log.message}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 text-xs text-primary">
          <ChevronRight className="w-3 h-3" />
          <span className="animate-blink">_</span>
        </div>
      </div>
    </div>
  );
};
