import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Database, Search, AlertTriangle, Shield, 
  Calendar, Key, Skull, Check, Info
} from "lucide-react";
import { WEAK_KEY_PATTERNS, checkWeakKey, type WeakKeyPattern } from "@/lib/crypto-advanced";

interface WeakKeyDatabaseProps {
  onLog?: (msg: string) => void;
}

const WeakKeyDatabase = ({ onLog }: WeakKeyDatabaseProps) => {
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState<WeakKeyPattern | null | undefined>(undefined);
  const [selectedPattern, setSelectedPattern] = useState<WeakKeyPattern | null>(null);
  
  const log = useCallback((msg: string) => {
    onLog?.(`[WEAK-KEY] ${msg}`);
  }, [onLog]);
  
  const searchForWeakness = useCallback(() => {
    if (!searchKey) return;
    
    log(`Suche nach bekannten Schwachstellen für: ${searchKey.substring(0, 16)}...`);
    
    const result = checkWeakKey(searchKey);
    setSearchResult(result);
    
    if (result) {
      log(`WARNUNG: Schlüssel matcht Muster "${result.name}"!`);
    } else {
      log("Keine bekannte Schwachstelle gefunden (vollständige Prüfung erfordert DB-Lookup)");
    }
  }, [searchKey, log]);
  
  const getSeverityColor = (entropy: number) => {
    if (entropy < 32) return 'text-destructive';
    if (entropy < 64) return 'text-orange-500';
    if (entropy < 128) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getSeverityBadge = (entropy: number) => {
    if (entropy < 32) return 'destructive';
    if (entropy < 64) return 'outline';
    return 'secondary';
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Weak Key Pattern Database
          </h3>
          <p className="text-xs text-muted-foreground">
            Bekannte schwache Schlüsselmuster und deren Erkennung
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          {WEAK_KEY_PATTERNS.length} Patterns
        </Badge>
      </div>
      
      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Input
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="flex-1 font-mono text-xs"
            placeholder="Private Key (hex) eingeben..."
          />
          <Button size="sm" onClick={searchForWeakness}>
            <Search className="w-4 h-4 mr-1" />
            Check
          </Button>
        </div>
        
        {searchResult !== undefined && (
          <div className={`mt-3 p-3 rounded ${
            searchResult 
              ? 'bg-destructive/10 border border-destructive/30' 
              : 'bg-green-500/10 border border-green-500/30'
          }`}>
            {searchResult ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">{searchResult.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{searchResult.description}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-green-400">Keine bekannte Schwachstelle erkannt</span>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Pattern List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Patterns */}
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Skull className="w-4 h-4 text-destructive" />
            Bekannte Schwachstellen
          </h4>
          
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {WEAK_KEY_PATTERNS.map((pattern) => (
                <div 
                  key={pattern.id}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedPattern?.id === pattern.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted/20 border-muted hover:bg-muted/40'
                  }`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{pattern.name}</span>
                    <Badge variant={getSeverityBadge(pattern.entropy) as any} className="font-mono text-xs">
                      {pattern.entropy} bits
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{pattern.year}</span>
                    <span className="text-muted">•</span>
                    <span className={getSeverityColor(pattern.entropy)}>
                      {pattern.affectedKeys} affected
                    </span>
                  </div>
                  
                  {/* Entropy bar */}
                  <div className="mt-2">
                    <Progress 
                      value={(pattern.entropy / 256) * 100} 
                      className={`h-1 ${pattern.entropy < 64 ? '[&>div]:bg-destructive' : ''}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Pattern Details */}
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Pattern Details
          </h4>
          
          {selectedPattern ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-lg">{selectedPattern.name}</h5>
                  <Badge variant="outline">{selectedPattern.year}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPattern.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Effektive Entropie</div>
                  <div className={`text-2xl font-bold ${getSeverityColor(selectedPattern.entropy)}`}>
                    {selectedPattern.entropy} bits
                  </div>
                  <Progress 
                    value={(selectedPattern.entropy / 256) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
                
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Betroffene Keys</div>
                  <div className="text-2xl font-bold text-primary">
                    {selectedPattern.affectedKeys}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded">
                <div className="text-xs text-muted-foreground mb-2">Erkennung</div>
                <div className="text-sm font-mono">
                  {selectedPattern.detection}
                </div>
              </div>
              
              {selectedPattern.example && (
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-xs text-muted-foreground mb-2">Beispiel</div>
                  <div className="text-xs font-mono text-primary">
                    {selectedPattern.example}
                  </div>
                </div>
              )}
              
              {/* Attack complexity */}
              <div className="p-3 border border-destructive/30 rounded bg-destructive/5">
                <div className="text-xs font-semibold text-destructive mb-2">Angriffs-Komplexität</div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Brute Force: </span>
                  <span className="font-mono">
                    2^{selectedPattern.entropy} = {
                      selectedPattern.entropy < 64 
                        ? `~${(2 ** selectedPattern.entropy).toLocaleString()}` 
                        : '> 10^18'
                    } Operationen
                  </span>
                </div>
                {selectedPattern.entropy < 50 && (
                  <div className="text-xs text-destructive mt-2">
                    ⚠️ Mit moderner Hardware in Sekunden bis Stunden knackbar!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-muted-foreground text-sm">
              Wähle ein Pattern aus der Liste
            </div>
          )}
        </Card>
      </div>
      
      {/* Statistics */}
      <Card className="p-4">
        <h4 className="text-sm font-mono font-semibold mb-3">Statistiken</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {WEAK_KEY_PATTERNS.filter(p => p.entropy < 32).length}
            </div>
            <div className="text-xs text-muted-foreground">Kritisch ({'<'}32 bits)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {WEAK_KEY_PATTERNS.filter(p => p.entropy >= 32 && p.entropy < 64).length}
            </div>
            <div className="text-xs text-muted-foreground">Hoch (32-64 bits)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {WEAK_KEY_PATTERNS.filter(p => p.entropy >= 64 && p.entropy < 128).length}
            </div>
            <div className="text-xs text-muted-foreground">Mittel (64-128 bits)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {WEAK_KEY_PATTERNS.reduce((sum, p) => sum + parseInt(p.affectedKeys.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString()}+
            </div>
            <div className="text-xs text-muted-foreground">Total betroffen</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeakKeyDatabase;
