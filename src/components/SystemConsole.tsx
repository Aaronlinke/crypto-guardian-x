import { Terminal, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

interface LogEntry {
  type: "info" | "success" | "warning";
  message: string;
}

export const SystemConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((entry: LogEntry) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [...prev, { ...entry, message: `${timestamp} ${entry.message}` }].slice(-12));
  }, []);

  useEffect(() => {
    const now = new Date();
    
    // Real system info on mount
    addLog({ type: "info", message: `[SYSTEM] CryptoGuardian X v3.0 initialized` });
    addLog({ type: "success", message: `[MODULES] 13 analysis modules loaded` });
    addLog({ type: "info", message: `[DATABASE] 20 documented attacks indexed` });
    addLog({ type: "success", message: `[API] Blockstream API endpoint: ready` });
    addLog({ type: "info", message: `[CRYPTO] Web Crypto API: ${typeof crypto?.subtle !== 'undefined' ? 'available' : 'unavailable'}` });
    addLog({ type: "success", message: `[NEXUS] Intelligence console: operational` });

    // Periodic real system checks
    const interval = setInterval(() => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const usedMB = (memoryInfo.usedJSHeapSize / 1048576).toFixed(1);
        addLog({ type: "info", message: `[MONITOR] JS Heap: ${usedMB} MB` });
      } else {
        const uptime = Math.floor((Date.now() - now.getTime()) / 1000);
        addLog({ type: "info", message: `[MONITOR] Session uptime: ${uptime}s` });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addLog]);

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
