import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Grid3X3, Play, RotateCcw, AlertTriangle, 
  Zap, Lock, Unlock, Info
} from "lucide-react";
import { constructHNPLattice, SECP256K1, type HNPSignature, type HNPLattice } from "@/lib/crypto-advanced";

interface HNPLatticeAttackProps {
  onLog?: (msg: string) => void;
}

const HNPLatticeAttack = ({ onLog }: HNPLatticeAttackProps) => {
  const [leakedBits, setLeakedBits] = useState([4]);
  const [numSignatures, setNumSignatures] = useState([5]);
  const [lattice, setLattice] = useState<HNPLattice | null>(null);
  const [attackSuccess, setAttackSuccess] = useState<boolean | null>(null);
  
  const log = useCallback((msg: string) => {
    onLog?.(`[HNP] ${msg}`);
  }, [onLog]);
  
  const generateSignatures = useCallback((): HNPSignature[] => {
    const sigs: HNPSignature[] = [];
    const bits = leakedBits[0];
    const n = numSignatures[0];
    
    for (let i = 0; i < n; i++) {
      // Generate random signature with known MSBs of nonce using CSPRNG
      const rngBytes = new Uint8Array(80);
      crypto.getRandomValues(rngBytes);
      
      const kBytes = rngBytes.slice(0, 16);
      const k = BigInt('0x' + Array.from(kBytes, b => b.toString(16).padStart(2, '0')).join('')) % (SECP256K1.N / 1000n);
      const knownValue = k >> BigInt(256 - bits);
      
      const makeBigInt = (bytes: Uint8Array) => BigInt('0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''));
      
      sigs.push({
        r: makeBigInt(rngBytes.slice(16, 48)),
        s: makeBigInt(rngBytes.slice(48, 64)),
        z: makeBigInt(rngBytes.slice(64, 80)),
        knownBits: bits,
        knownValue
      });
    }
    
    return sigs;
  }, [leakedBits, numSignatures]);
  
  const runAttack = useCallback(() => {
    const bits = leakedBits[0];
    const n = numSignatures[0];
    
    log(`Starte HNP Lattice Attack mit ${n} Signaturen und ${bits} bekannten Bits...`);
    
    const sigs = generateSignatures();
    const latticeResult = constructHNPLattice(sigs);
    setLattice(latticeResult);
    
    // Simplified success calculation based on Minerva paper
    // Approximately n * bits > 256 needed for success
    const estimatedSuccess = n * bits > 200;
    setAttackSuccess(estimatedSuccess);
    
    log(`Lattice-Dimension: ${latticeResult.dimension}`);
    log(`Geschätzte Erfolgswahrscheinlichkeit: ${estimatedSuccess ? 'HOCH' : 'NIEDRIG'}`);
    
    if (estimatedSuccess) {
      log(`WARNUNG: Bei ${bits} Bits Leak und ${n} Signaturen ist Key Recovery möglich!`);
    }
  }, [leakedBits, numSignatures, generateSignatures, log]);
  
  const reset = useCallback(() => {
    setLattice(null);
    setAttackSuccess(null);
    log("Reset");
  }, [log]);
  
  // Calculate required signatures for attack
  const requiredSigs = Math.ceil(256 / leakedBits[0]);
  const isAttackFeasible = numSignatures[0] >= requiredSigs * 0.8;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Hidden Number Problem (HNP) Lattice Attack
          </h3>
          <p className="text-xs text-muted-foreground">
            Key Recovery durch partielle Nonce-Leaks via LLL-Reduktion
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          Minerva / TPM-FAIL Style
        </Badge>
      </div>
      
      {/* Warning */}
      <Card className="p-4 bg-orange-500/10 border-orange-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-orange-400">Partielle Nonce Leaks sind fatal!</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Schon wenige bekannte Bits pro Nonce ermöglichen bei genügend Signaturen 
              die vollständige Rekonstruktion des privaten Schlüssels via Lattice-Reduktion.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono">Bekannte Bits pro Nonce:</span>
              <Badge variant="secondary" className="font-mono">{leakedBits[0]} bits</Badge>
            </div>
            <Slider
              value={leakedBits}
              onValueChange={setLeakedBits}
              min={1}
              max={16}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typisch: 2-4 bits bei Timing-Angriffen
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono">Anzahl Signaturen:</span>
              <Badge variant="secondary" className="font-mono">{numSignatures[0]}</Badge>
            </div>
            <Slider
              value={numSignatures}
              onValueChange={setNumSignatures}
              min={2}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Benötigt: ~{requiredSigs} für {leakedBits[0]}-bit Leak
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <Button size="sm" onClick={runAttack}>
            <Zap className="w-4 h-4 mr-1" />
            Simulate Attack
          </Button>
          
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <div className="flex-1" />
          
          <Badge 
            variant={isAttackFeasible ? "destructive" : "secondary"}
            className="font-mono"
          >
            {isAttackFeasible ? (
              <><Unlock className="w-3 h-3 mr-1" /> Angriff möglich</>
            ) : (
              <><Lock className="w-3 h-3 mr-1" /> Mehr Signaturen nötig</>
            )}
          </Badge>
        </div>
      </Card>
      
      {/* Lattice Visualization */}
      {lattice && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-primary" />
              Lattice Basis Matrix
            </h4>
            
            <ScrollArea className="h-64">
              <div className="text-[8px] font-mono">
                <table className="border-collapse">
                  <tbody>
                    {lattice.matrix.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {row.slice(0, 8).map((val, j) => (
                          <td 
                            key={j}
                            className={`border border-muted p-1 text-center ${
                              val === SECP256K1.N ? 'bg-primary/20 text-primary' :
                              val === 0n ? 'text-muted-foreground' :
                              'text-foreground'
                            }`}
                          >
                            {val === 0n ? '0' : 
                             val === SECP256K1.N ? 'n' : 
                             val.toString().substring(0, 6) + '..'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {lattice.matrix.length > 10 && (
                  <div className="text-center text-muted-foreground py-2">
                    ... Matrix {lattice.dimension}×{lattice.dimension}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
          
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Attack Result
            </h4>
            
            <div className="space-y-4">
              <div className={`p-4 rounded text-center ${
                attackSuccess 
                  ? 'bg-destructive/10 border border-destructive/30' 
                  : 'bg-muted/30'
              }`}>
                {attackSuccess ? (
                  <div>
                    <Unlock className="w-12 h-12 mx-auto text-destructive mb-2" />
                    <div className="text-lg font-bold text-destructive">KEY RECOVERY MÖGLICH!</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      LLL-Reduktion findet kurzen Vektor mit Private Key
                    </div>
                  </div>
                ) : (
                  <div>
                    <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <div className="text-lg font-bold">Angriff nicht praktikabel</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Mehr Signaturen oder mehr Bit-Leaks benötigt
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-2xl font-bold text-primary">{numSignatures[0]}</div>
                  <div className="text-xs text-muted-foreground">Signaturen</div>
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-400">{leakedBits[0] * numSignatures[0]}</div>
                  <div className="text-xs text-muted-foreground">Total Bits geleakt</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <strong>Formel:</strong> Benötigt n×b {'>'} 256 Bits für zuverlässigen Angriff
                <br/>
                Aktuell: {numSignatures[0]}×{leakedBits[0]} = {numSignatures[0] * leakedBits[0]} bits
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Mathematical Background */}
      <Card className="p-4">
        <h4 className="text-sm font-mono font-semibold mb-3">HNP Lattice Konstruktion</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-primary mb-2">ECDSA Signatur-Gleichung:</div>
            <div className="text-muted-foreground">
              s = k⁻¹(z + rd) mod n<br/>
              → d = r⁻¹(sk - z) mod n
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-orange-400 mb-2">Mit partiellem k-Leak:</div>
            <div className="text-muted-foreground">
              k = k_known × 2^(256-b) + k_unknown<br/>
              Finde k_unknown via Lattice CVP
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <strong>Real-World Attacks:</strong>
          <span className="text-destructive"> Minerva (2019)</span> - TPM Timing,
          <span className="text-orange-400"> TPM-FAIL (2019)</span> - Intel fTPM,
          <span className="text-yellow-400"> LadderLeak (2020)</span> - Montgomery Timing
        </div>
      </Card>
    </div>
  );
};

export default HNPLatticeAttack;
