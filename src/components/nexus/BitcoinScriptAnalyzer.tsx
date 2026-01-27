import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Code, Play, RotateCcw, Layers, Lock, Clock,
  AlertTriangle, Check, ChevronRight
} from "lucide-react";
import { parseScript, type ScriptOp } from "@/lib/crypto-advanced";

interface BitcoinScriptAnalyzerProps {
  onLog?: (msg: string) => void;
}

// Example scripts
const EXAMPLE_SCRIPTS = {
  p2pkh: {
    name: "P2PKH (Pay-to-Public-Key-Hash)",
    script: "76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac",
    description: "Standard Bitcoin address script"
  },
  p2sh_multisig: {
    name: "P2SH 2-of-3 Multisig (redeem)",
    script: "522103...03...03...53ae",
    description: "Multisignature 2-of-3"
  },
  op_return: {
    name: "OP_RETURN (Data Embedding)",
    script: "6a0f48656c6c6f2c20426974636f696e21",
    description: "Unspendable data output"
  },
  timelock: {
    name: "CLTV Timelock",
    script: "04deadbeefb17576a914...88ac",
    description: "Time-locked transaction"
  }
};

// Stack item type
interface StackItem {
  value: string;
  type: 'data' | 'number' | 'bool';
}

const BitcoinScriptAnalyzer = ({ onLog }: BitcoinScriptAnalyzerProps) => {
  const [scriptHex, setScriptHex] = useState(EXAMPLE_SCRIPTS.p2pkh.script);
  const [parsedOps, setParsedOps] = useState<ScriptOp[]>([]);
  const [stack, setStack] = useState<StackItem[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [scriptType, setScriptType] = useState<string>("");
  
  const log = useCallback((msg: string) => {
    onLog?.(`[SCRIPT] ${msg}`);
  }, [onLog]);
  
  const analyzeScript = useCallback(() => {
    log(`Analysiere Script: ${scriptHex.substring(0, 40)}...`);
    
    const ops = parseScript(scriptHex);
    setParsedOps(ops);
    setStack([]);
    setCurrentStep(-1);
    
    // Detect script type
    if (ops.some(o => o.name === 'OP_CHECKMULTISIG')) {
      setScriptType("Multisig");
      log("Script-Typ: Multisig");
    } else if (ops[0]?.name === 'OP_RETURN') {
      setScriptType("OP_RETURN (Data)");
      log("Script-Typ: OP_RETURN Data Embedding");
    } else if (ops.some(o => o.name === 'OP_CHECKLOCKTIMEVERIFY')) {
      setScriptType("Timelock (CLTV)");
      log("Script-Typ: Absolute Timelock");
    } else if (ops.some(o => o.name === 'OP_CHECKSEQUENCEVERIFY')) {
      setScriptType("Timelock (CSV)");
      log("Script-Typ: Relative Timelock");
    } else if (ops.some(o => o.name === 'OP_DUP') && ops.some(o => o.name === 'OP_HASH160')) {
      setScriptType("P2PKH");
      log("Script-Typ: Pay-to-Public-Key-Hash");
    } else {
      setScriptType("Custom");
      log("Script-Typ: Custom Script");
    }
    
    log(`${ops.length} Opcodes geparst`);
  }, [scriptHex, log]);
  
  const stepExecution = useCallback(() => {
    if (currentStep >= parsedOps.length - 1) return;
    
    const nextStep = currentStep + 1;
    const op = parsedOps[nextStep];
    
    setCurrentStep(nextStep);
    
    // Simulate stack operations
    const newStack = [...stack];
    
    if (op.name.startsWith('PUSH_') && op.data) {
      newStack.push({ value: op.data, type: 'data' });
    } else if (op.name === 'OP_DUP') {
      if (newStack.length > 0) {
        newStack.push({ ...newStack[newStack.length - 1] });
      }
    } else if (op.name === 'OP_DROP') {
      newStack.pop();
    } else if (op.name === 'OP_HASH160') {
      if (newStack.length > 0) {
        newStack[newStack.length - 1] = { 
          value: 'HASH160(' + newStack[newStack.length - 1].value.substring(0, 8) + '...)', 
          type: 'data' 
        };
      }
    } else if (op.name === 'OP_EQUAL' || op.name === 'OP_EQUALVERIFY') {
      if (newStack.length >= 2) {
        const a = newStack.pop();
        const b = newStack.pop();
        if (op.name === 'OP_EQUAL') {
          newStack.push({ value: a?.value === b?.value ? 'TRUE' : 'FALSE', type: 'bool' });
        }
      }
    } else if (op.name === 'OP_CHECKSIG') {
      // Simulate signature verification
      if (newStack.length >= 2) {
        newStack.pop();
        newStack.pop();
        newStack.push({ value: 'TRUE', type: 'bool' });
      }
    }
    
    setStack(newStack);
    log(`Executing: ${op.name}`);
  }, [currentStep, parsedOps, stack, log]);
  
  const reset = useCallback(() => {
    setParsedOps([]);
    setStack([]);
    setCurrentStep(-1);
    setScriptType("");
    log("Reset");
  }, [log]);
  
  const loadExample = (key: keyof typeof EXAMPLE_SCRIPTS) => {
    setScriptHex(EXAMPLE_SCRIPTS[key].script);
    reset();
    log(`Beispiel geladen: ${EXAMPLE_SCRIPTS[key].name}`);
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Bitcoin Script Analyzer
          </h3>
          <p className="text-xs text-muted-foreground">
            Dekompilierung und Stack-basierte Ausführung von Bitcoin Scripts
          </p>
        </div>
        {scriptType && (
          <Badge variant="outline" className="font-mono">
            {scriptType}
          </Badge>
        )}
      </div>
      
      {/* Script Input */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Script (hex):</span>
          <Input
            value={scriptHex}
            onChange={(e) => setScriptHex(e.target.value)}
            className="flex-1 font-mono text-xs"
            placeholder="76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={analyzeScript}>
            <Code className="w-4 h-4 mr-1" />
            Analyze
          </Button>
          
          <Button 
            size="sm" 
            variant="secondary"
            disabled={parsedOps.length === 0 || currentStep >= parsedOps.length - 1}
            onClick={stepExecution}
          >
            <ChevronRight className="w-4 h-4 mr-1" />
            Step
          </Button>
          
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex gap-1">
            {Object.entries(EXAMPLE_SCRIPTS).map(([key, val]) => (
              <Button 
                key={key}
                size="sm" 
                variant="ghost" 
                className="text-xs px-2"
                onClick={() => loadExample(key as keyof typeof EXAMPLE_SCRIPTS)}
              >
                {val.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parsed Opcodes */}
        <Card className="lg:col-span-2 p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Parsed Opcodes
          </h4>
          
          <ScrollArea className="h-64">
            {parsedOps.length > 0 ? (
              <div className="space-y-1">
                {parsedOps.map((op, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded font-mono text-xs ${
                      i === currentStep 
                        ? 'bg-primary/20 border border-primary' 
                        : i < currentStep 
                          ? 'bg-muted/30 text-muted-foreground' 
                          : 'hover:bg-muted/20'
                    }`}
                  >
                    <span className="w-6 text-muted-foreground">#{i}</span>
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-xs ${
                        op.name.includes('VERIFY') || op.name.includes('CHECK') 
                          ? 'text-orange-400 border-orange-400' 
                          : op.name.includes('PUSH')
                            ? 'text-green-400 border-green-400'
                            : ''
                      }`}
                    >
                      {op.name}
                    </Badge>
                    {op.data && (
                      <span className="text-primary truncate flex-1">
                        {op.data.length > 32 ? op.data.substring(0, 32) + '...' : op.data}
                      </span>
                    )}
                    <span className="text-muted-foreground text-[10px] truncate max-w-32">
                      {op.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Gib ein Script ein und klicke Analyze
              </div>
            )}
          </ScrollArea>
        </Card>
        
        {/* Stack */}
        <Card className="p-4">
          <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-green-500" />
            Stack
          </h4>
          
          <div className="space-y-2">
            {stack.length > 0 ? (
              [...stack].reverse().map((item, i) => (
                <div 
                  key={i}
                  className={`p-2 rounded font-mono text-xs border ${
                    item.type === 'bool' 
                      ? item.value === 'TRUE' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">#{stack.length - 1 - i}</span>
                    <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                  </div>
                  <div className="mt-1 truncate">
                    {item.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                Stack leer
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Script Templates */}
      <Card className="p-4">
        <h4 className="text-sm font-mono font-semibold mb-3">Bekannte Script-Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-muted/30 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">P2PKH</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              DUP HASH160 {'<pubKeyHash>'} EQUALVERIFY CHECKSIG
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">P2SH</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              HASH160 {'<scriptHash>'} EQUAL
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">CLTV</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {'<locktime>'} CHECKLOCKTIMEVERIFY DROP ...
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold">OP_RETURN</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              OP_RETURN {'<data>'} (unspendable)
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BitcoinScriptAnalyzer;
