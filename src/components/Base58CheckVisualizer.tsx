import { useState } from "react";
import { Hash, ArrowRight, ArrowLeft, CheckCircle, XCircle, Copy, Shuffle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// SHA-256 implementiert mit Web Crypto API
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const buffer = new Uint8Array(data).buffer as ArrayBuffer;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hashBuffer);
}

// Doppeltes SHA-256 für Checksum
async function doubleSha256(data: Uint8Array): Promise<Uint8Array> {
  const first = await sha256(data);
  return await sha256(first);
}

// Hex zu Bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Bytes zu Hex
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Base58 Encode
function base58Encode(bytes: Uint8Array): string {
  let num = BigInt('0x' + bytesToHex(bytes));
  
  let encoded = '';
  while (num > 0n) {
    const remainder = Number(num % 58n);
    encoded = BASE58_ALPHABET[remainder] + encoded;
    num = num / 58n;
  }
  
  for (const byte of bytes) {
    if (byte === 0) {
      encoded = '1' + encoded;
    } else {
      break;
    }
  }
  
  return encoded;
}

// Base58 Decode
function base58Decode(str: string): Uint8Array | null {
  try {
    let num = 0n;
    for (const char of str) {
      const idx = BASE58_ALPHABET.indexOf(char);
      if (idx === -1) return null;
      num = num * 58n + BigInt(idx);
    }
    
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    
    let leadingZeros = 0;
    for (const char of str) {
      if (char === '1') leadingZeros++;
      else break;
    }
    
    const bytes = hexToBytes(hex);
    const result = new Uint8Array(leadingZeros + bytes.length);
    result.set(bytes, leadingZeros);
    
    return result;
  } catch {
    return null;
  }
}

interface EncodingStep {
  name: string;
  description: string;
  input: string;
  output: string;
  color: string;
}

export function Base58CheckVisualizer() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputHex, setInputHex] = useState('f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');
  const [inputBase58, setInputBase58] = useState('1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs');
  const [encodingSteps, setEncodingSteps] = useState<EncodingStep[]>([]);
  const [decodingSteps, setDecodingSteps] = useState<EncodingStep[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [versionByte, setVersionByte] = useState('00');
  
  const encodeToAddress = async () => {
    try {
      const cleanHex = inputHex.replace(/\s/g, '').toLowerCase();
      if (!/^[0-9a-f]+$/.test(cleanHex)) {
        toast.error("Ungültiges Hex-Format");
        return;
      }
      
      const steps: EncodingStep[] = [];
      
      const payloadBytes = hexToBytes(cleanHex);
      const versionBytes = hexToBytes(versionByte);
      const versionedPayload = new Uint8Array(versionBytes.length + payloadBytes.length);
      versionedPayload.set(versionBytes);
      versionedPayload.set(payloadBytes, versionBytes.length);
      
      steps.push({
        name: "1. Version Byte",
        description: `Präfix ${versionByte} für Netzwerk (00 = Mainnet P2PKH)`,
        input: cleanHex,
        output: bytesToHex(versionedPayload),
        color: "text-amber-400"
      });
      
      const hash1 = await sha256(versionedPayload);
      steps.push({
        name: "2. SHA-256 #1",
        description: "Erstes SHA-256 Hashing",
        input: bytesToHex(versionedPayload),
        output: bytesToHex(hash1),
        color: "text-blue-400"
      });
      
      const hash2 = await sha256(hash1);
      steps.push({
        name: "3. SHA-256 #2",
        description: "Zweites SHA-256 (Double-Hash)",
        input: bytesToHex(hash1),
        output: bytesToHex(hash2),
        color: "text-purple-400"
      });
      
      const checksum = hash2.slice(0, 4);
      steps.push({
        name: "4. Checksum",
        description: "Erste 4 Bytes als Prüfsumme",
        input: bytesToHex(hash2),
        output: bytesToHex(checksum),
        color: "text-green-400"
      });
      
      const fullPayload = new Uint8Array(versionedPayload.length + checksum.length);
      fullPayload.set(versionedPayload);
      fullPayload.set(checksum, versionedPayload.length);
      steps.push({
        name: "5. Zusammenführung",
        description: "Version + Payload + Checksum",
        input: `${bytesToHex(versionedPayload)} + ${bytesToHex(checksum)}`,
        output: bytesToHex(fullPayload),
        color: "text-orange-400"
      });
      
      const address = base58Encode(fullPayload);
      steps.push({
        name: "6. Base58 Encode",
        description: "Konvertierung zu Base58 (ohne 0, O, I, l)",
        input: bytesToHex(fullPayload),
        output: address,
        color: "text-primary"
      });
      
      setEncodingSteps(steps);
      setIsValid(true);
    } catch {
      toast.error("Fehler beim Encodieren");
      setIsValid(false);
    }
  };
  
  const decodeAddress = async () => {
    try {
      const steps: EncodingStep[] = [];
      
      const decoded = base58Decode(inputBase58);
      if (!decoded) {
        toast.error("Ungültige Base58-Adresse");
        setIsValid(false);
        return;
      }
      
      steps.push({
        name: "1. Base58 Decode",
        description: "Konvertierung von Base58 zu Bytes",
        input: inputBase58,
        output: bytesToHex(decoded),
        color: "text-primary"
      });
      
      const version = decoded.slice(0, 1);
      const payload = decoded.slice(1, -4);
      const checksum = decoded.slice(-4);
      
      steps.push({
        name: "2. Komponenten",
        description: "Aufteilen in Version, Payload, Checksum",
        input: bytesToHex(decoded),
        output: `Ver: ${bytesToHex(version)} | Pay: ${bytesToHex(payload)} | Chk: ${bytesToHex(checksum)}`,
        color: "text-amber-400"
      });
      
      const versionedPayload = decoded.slice(0, -4);
      const calculatedChecksum = (await doubleSha256(versionedPayload)).slice(0, 4);
      const isChecksumValid = bytesToHex(checksum) === bytesToHex(calculatedChecksum);
      
      steps.push({
        name: "3. Checksum Verify",
        description: isChecksumValid ? "✓ Checksum stimmt" : "✗ Checksum ungültig!",
        input: `Erwartet: ${bytesToHex(calculatedChecksum)}`,
        output: `Gefunden: ${bytesToHex(checksum)}`,
        color: isChecksumValid ? "text-green-400" : "text-red-400"
      });
      
      steps.push({
        name: "4. Hash160",
        description: "Public Key Hash (RIPEMD-160)",
        input: bytesToHex(versionedPayload),
        output: bytesToHex(payload),
        color: "text-blue-400"
      });
      
      const networkType = version[0] === 0 ? "Mainnet P2PKH" : 
                          version[0] === 5 ? "Mainnet P2SH" :
                          version[0] === 111 ? "Testnet P2PKH" : `Unbekannt (${version[0]})`;
      steps.push({
        name: "5. Netzwerk",
        description: `Version Byte identifiziert Netzwerk`,
        input: `0x${bytesToHex(version)}`,
        output: networkType,
        color: "text-purple-400"
      });
      
      setDecodingSteps(steps);
      setIsValid(isChecksumValid);
    } catch {
      toast.error("Fehler beim Decodieren");
      setIsValid(false);
    }
  };
  
  const generateRandomHash160 = () => {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    setInputHex(bytesToHex(bytes));
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          <span className="text-primary">[</span>
          BASE58CHECK ENCODER/DECODER
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
            Bitcoin Adressen
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'encode' | 'decode')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode" className="gap-2">
              <ArrowRight className="w-3 h-3" />
              Encode
            </TabsTrigger>
            <TabsTrigger value="decode" className="gap-2">
              <ArrowLeft className="w-3 h-3" />
              Decode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="encode" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground">Version Byte</label>
                <select 
                  value={versionByte}
                  onChange={(e) => setVersionByte(e.target.value)}
                  className="w-full h-8 text-xs font-mono bg-background border border-border rounded px-2"
                >
                  <option value="00">00 - Mainnet P2PKH (1...)</option>
                  <option value="05">05 - Mainnet P2SH (3...)</option>
                  <option value="6f">6f - Testnet P2PKH (m/n...)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] text-muted-foreground">Hash160 (20 Bytes Hex)</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={inputHex}
                  onChange={(e) => setInputHex(e.target.value)}
                  placeholder="z.B. f54a5851e9372b87810a8e60cdd2e7cfd80b6e31"
                  className="font-mono text-xs"
                />
                <Button size="sm" variant="outline" onClick={generateRandomHash160}>
                  <Shuffle className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <Button onClick={encodeToAddress} className="w-full gap-2">
              <ArrowRight className="w-4 h-4" />
              Zu Bitcoin-Adresse Encodieren
            </Button>
            
            {encodingSteps.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Encoding-Schritte:</div>
                {encodingSteps.map((step, idx) => (
                  <div key={idx} className="p-2 rounded bg-background/50 border border-border/30 space-y-1">
                    <div className={`text-[10px] font-medium ${step.color}`}>{step.name}</div>
                    <div className="text-[9px] text-muted-foreground">{step.description}</div>
                    <div className="flex items-center gap-2">
                      <code className={`text-[9px] font-mono break-all ${step.color}`}>{step.output}</code>
                      {idx === encodingSteps.length - 1 && (
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 ml-auto" onClick={() => copyToClipboard(step.output)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="decode" className="space-y-4 mt-4">
            <div>
              <label className="text-[10px] text-muted-foreground">Bitcoin-Adresse (Base58Check)</label>
              <Input
                value={inputBase58}
                onChange={(e) => setInputBase58(e.target.value)}
                placeholder="z.B. 1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs"
                className="font-mono text-xs mt-1"
              />
            </div>
            
            <Button onClick={decodeAddress} className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Adresse Decodieren
            </Button>
            
            {decodingSteps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  Decoding-Schritte:
                  {isValid !== null && (
                    isValid ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Gültig
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        Ungültig
                      </Badge>
                    )
                  )}
                </div>
                {decodingSteps.map((step, idx) => (
                  <div key={idx} className="p-2 rounded bg-background/50 border border-border/30 space-y-1">
                    <div className={`text-[10px] font-medium ${step.color}`}>{step.name}</div>
                    <div className="text-[9px] text-muted-foreground">{step.description}</div>
                    <code className={`text-[9px] font-mono break-all ${step.color}`}>{step.output}</code>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 space-y-1">
          <div className="text-[10px] font-medium text-blue-400">Base58Check Struktur:</div>
          <div className="font-mono text-[9px] text-blue-300/80">
            <span className="text-amber-400">[Version]</span> + <span className="text-blue-400">[Hash160]</span> + <span className="text-green-400">[Checksum]</span>
          </div>
        </div>
        
        <div className="p-2 rounded bg-muted/20 border border-border/20">
          <div className="text-[10px] text-muted-foreground">
            <strong>Base58 Alphabet:</strong> Ohne 0, O, I, l
          </div>
          <div className="font-mono text-[8px] text-primary mt-1 break-all">
            {BASE58_ALPHABET}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
