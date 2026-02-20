import { useState, useEffect, useRef, useMemo } from "react";
import { Circle, Plus, ArrowRight, RotateCcw, Play, Pause, Info, PenTool, CheckCircle, XCircle, Key, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECP256K1, modInverse } from "@/lib/crypto-math";

interface Point {
  x: bigint;
  y: bigint;
}

// Reduzierte Kurvenparameter y² = x³ + 7 (mod p) — identische Gleichung wie secp256k1
const REDUCED_CURVE = {
  a: 0n,
  b: 7n,
  p: 97n // Kleine Primzahl für Demo
};

export function EllipticCurveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scalarK, setScalarK] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showTrace, setShowTrace] = useState(true);
  const [curveP, setCurveP] = useState(97);
  const [activeTab, setActiveTab] = useState<'curve' | 'ecdsa'>('curve');
  
  // ECDSA State
  const [privateKey, setPrivateKey] = useState(7);
  const [messageHash, setMessageHash] = useState(42);
  const [signatureK, setSignatureK] = useState(13);
  const [signature, setSignature] = useState<{ r: bigint; s: bigint } | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [inputR, setInputR] = useState('');
  const [inputS, setInputS] = useState('');

  // Generator Punkt für Demo-Kurve
  const G: Point = useMemo(() => {
    // Finde einen gültigen Punkt auf der Kurve y² = x³ + 7 (mod p)
    for (let x = 1n; x < BigInt(curveP); x++) {
      const rhs = (x * x * x + REDUCED_CURVE.b) % BigInt(curveP);
      // Prüfe ob rhs ein quadratischer Rest ist
      for (let y = 0n; y < BigInt(curveP); y++) {
        if ((y * y) % BigInt(curveP) === rhs) {
          return { x, y };
        }
      }
    }
    return { x: 1n, y: 1n };
  }, [curveP]);

  // Kurvenordnung (vereinfacht - in Realität komplexer zu berechnen)
  const curveOrder = useMemo(() => {
    // Für kleine Kurven: Zähle alle Punkte + Punkt im Unendlichen
    let count = 1n; // Punkt im Unendlichen
    const p = BigInt(curveP);
    for (let x = 0n; x < p; x++) {
      const rhs = (x * x * x + REDUCED_CURVE.b) % p;
      for (let y = 0n; y < p; y++) {
        if ((y * y) % p === rhs) count++;
      }
    }
    return count;
  }, [curveP]);

  // Punkt-Addition auf elliptischer Kurve
  const pointAdd = (P: Point | null, Q: Point | null): Point | null => {
    if (P === null) return Q;
    if (Q === null) return P;
    
    const p = BigInt(curveP);
    
    if (P.x === Q.x && P.y !== Q.y) {
      return null; // Punkt im Unendlichen
    }
    
    let lambda: bigint;
    
    if (P.x === Q.x && P.y === Q.y) {
      // Punkt-Verdopplung
      if (P.y === 0n) return null;
      const num = (3n * P.x * P.x + REDUCED_CURVE.a) % p;
      const denom = modInverse((2n * P.y) % p + p, p);
      lambda = (num * denom) % p;
    } else {
      // Normale Addition
      const num = ((Q.y - P.y) % p + p) % p;
      const denom = modInverse(((Q.x - P.x) % p + p) % p, p);
      lambda = (num * denom) % p;
    }
    
    const x3 = ((lambda * lambda - P.x - Q.x) % p + p) % p;
    const y3 = ((lambda * (P.x - x3) - P.y) % p + p) % p;
    
    return { x: x3, y: y3 };
  };

  // Skalarmultiplikation k * G
  const scalarMul = (k: number, basePoint: Point = G): { result: Point | null; steps: (Point | null)[] } => {
    const steps: (Point | null)[] = [];
    let result: Point | null = null;
    let addend: Point | null = basePoint;
    let kBits = k;
    
    while (kBits > 0) {
      if (kBits & 1) {
        result = pointAdd(result, addend);
        steps.push(result);
      }
      addend = pointAdd(addend, addend);
      kBits >>= 1;
    }
    
    return { result, steps };
  };

  // Berechne alle Punkte auf der Kurve
  const curvePoints = useMemo(() => {
    const points: Point[] = [];
    const p = BigInt(curveP);
    
    for (let x = 0n; x < p; x++) {
      const rhs = (x * x * x + REDUCED_CURVE.b) % p;
      for (let y = 0n; y < p; y++) {
        if ((y * y) % p === rhs) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, [curveP]);

  // ECDSA Signatur erstellen
  const createSignature = () => {
    const n = curveOrder;
    const d = BigInt(privateKey); // Private Key
    const z = BigInt(messageHash); // Message Hash
    const k = BigInt(signatureK); // Random k (sollte nie wiederverwendet werden!)
    
    // R = k * G
    const R = scalarMul(signatureK).result;
    if (!R) {
      setSignature(null);
      return;
    }
    
    const r = R.x % n;
    if (r === 0n) {
      setSignature(null);
      return;
    }
    
    // s = k^(-1) * (z + r * d) mod n
    const kInv = modInverse(k, n);
    const s = (kInv * (z + r * d)) % n;
    if (s === 0n) {
      setSignature(null);
      return;
    }
    
    setSignature({ r, s });
    setInputR(r.toString());
    setInputS(s.toString());
    setVerificationResult(null);
  };

  // ECDSA Signatur verifizieren
  const verifySignature = () => {
    try {
      const n = curveOrder;
      const z = BigInt(messageHash);
      const r = BigInt(inputR || signature?.r || 0n);
      const s = BigInt(inputS || signature?.s || 0n);
      
      if (r <= 0n || r >= n || s <= 0n || s >= n) {
        setVerificationResult(false);
        return;
      }
      
      // Public Key Q = d * G
      const Q = scalarMul(privateKey).result;
      if (!Q) {
        setVerificationResult(false);
        return;
      }
      
      // w = s^(-1) mod n
      const w = modInverse(s, n);
      
      // u1 = z * w mod n
      const u1 = (z * w) % n;
      
      // u2 = r * w mod n
      const u2 = (r * w) % n;
      
      // P = u1 * G + u2 * Q
      const u1G = scalarMul(Number(u1)).result;
      const u2Q = scalarMul(Number(u2), Q).result;
      const P = pointAdd(u1G, u2Q);
      
      if (!P) {
        setVerificationResult(false);
        return;
      }
      
      // Verifizieren: r === P.x mod n
      const valid = (P.x % n) === r;
      setVerificationResult(valid);
    } catch (e) {
      setVerificationResult(false);
    }
  };

  // Animation
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= scalarK) {
          setIsAnimating(false);
          return scalarK;
        }
        return prev + 1;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isAnimating, scalarK]);

  // Canvas zeichnen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const scale = (width - 2 * padding) / curveP;
    
    // Hintergrund
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= curveP; i += Math.max(1, Math.floor(curveP / 10))) {
      const x = padding + i * scale;
      const y = height - padding - i * scale;
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Achsenbeschriftung
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("x", width / 2, height - 5);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("y", 0, 0);
    ctx.restore();
    
    // Alle Punkte auf der Kurve
    curvePoints.forEach(point => {
      const x = padding + Number(point.x) * scale;
      const y = height - padding - Number(point.y) * scale;
      
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Generator Punkt G
    const gx = padding + Number(G.x) * scale;
    const gy = height - padding - Number(G.y) * scale;
    
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(gx, gy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("G", gx, gy);
    
    // ECDSA Mode: Zeige Public Key
    if (activeTab === 'ecdsa') {
      const { result: publicKey } = scalarMul(privateKey);
      if (publicKey) {
        const qx = padding + Number(publicKey.x) * scale;
        const qy = height - padding - Number(publicKey.y) * scale;
        
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.arc(qx, qy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px monospace";
        ctx.fillText("Q", qx, qy);
      }
      
      // Zeige R Punkt wenn Signatur vorhanden
      if (signature) {
        const { result: rPoint } = scalarMul(signatureK);
        if (rPoint) {
          const rx = padding + Number(rPoint.x) * scale;
          const ry = height - padding - Number(rPoint.y) * scale;
          
          ctx.fillStyle = "#a855f7";
          ctx.beginPath();
          ctx.arc(rx, ry, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px monospace";
          ctx.fillText("R", rx, ry);
        }
      }
    } else {
      // Multiplikations-Pfad visualisieren
      if (showTrace && animationStep > 0) {
        const { steps } = scalarMul(animationStep);
        
        let prevPoint = G;
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        steps.forEach((point, idx) => {
          if (point && prevPoint) {
            const x1 = padding + Number(prevPoint.x) * scale;
            const y1 = height - padding - Number(prevPoint.y) * scale;
            const x2 = padding + Number(point.x) * scale;
            const y2 = height - padding - Number(point.y) * scale;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Zwischenpunkt
            ctx.fillStyle = `rgba(34, 197, 94, ${0.3 + (idx / steps.length) * 0.7})`;
            ctx.beginPath();
            ctx.arc(x2, y2, 6, 0, Math.PI * 2);
            ctx.fill();
          }
          if (point) prevPoint = point;
        });
        
        ctx.setLineDash([]);
      }
      
      // Ergebnis k*G
      const { result } = scalarMul(animationStep || scalarK);
      if (result) {
        const rx = padding + Number(result.x) * scale;
        const ry = height - padding - Number(result.y) * scale;
        
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(rx, ry, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("P", rx, ry);
      }
    }
    
    // Legende
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Kurve: y² = x³ + ${REDUCED_CURVE.b} (mod ${curveP})`, 10, 15);
    ctx.fillText(`Punkte auf Kurve: ${curvePoints.length}`, 10, 28);
    
  }, [curvePoints, G, animationStep, scalarK, showTrace, curveP, activeTab, privateKey, signature, signatureK]);

  const { result } = scalarMul(scalarK);
  const { result: publicKey } = scalarMul(privateKey);

  const startAnimation = () => {
    setAnimationStep(0);
    setIsAnimating(true);
  };

  const reset = () => {
    setAnimationStep(0);
    setIsAnimating(false);
  };

  const generateRandomK = () => {
    const rndBuf = new Uint32Array(1);
    crypto.getRandomValues(rndBuf);
    setSignatureK((rndBuf[0] % (curvePoints.length - 1)) + 1);
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Circle className="w-4 h-4 text-secondary" />
          <span className="text-primary">[</span>
          ELLIPTIC CURVE + ECDSA
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-secondary/10 text-secondary border-secondary/30">
            Reduzierte Kurve y²=x³+7
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'curve' | 'ecdsa')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="curve" className="gap-2">
              <Circle className="w-3 h-3" />
              Kurve
            </TabsTrigger>
            <TabsTrigger value="ecdsa" className="gap-2">
              <PenTool className="w-3 h-3" />
              ECDSA Signatur
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="curve" className="space-y-4 mt-4">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full rounded border border-border/30"
            />
            
            {/* Kurvenparameter */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Primzahl p (Kurvenordnung)</label>
                <Input
                  type="number"
                  value={curveP}
                  onChange={(e) => setCurveP(Math.max(17, Math.min(997, parseInt(e.target.value) || 97)))}
                  className="h-7 text-xs font-mono"
                  min={17}
                  max={997}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Skalar k (Multiplikator)</label>
                <Input
                  type="number"
                  value={scalarK}
                  onChange={(e) => setScalarK(Math.max(1, Math.min(curvePoints.length, parseInt(e.target.value) || 1)))}
                  className="h-7 text-xs font-mono"
                  min={1}
                  max={curvePoints.length}
                />
              </div>
            </div>
            
            {/* Slider für k */}
            <div>
              <label className="text-[10px] text-muted-foreground">k = {scalarK}</label>
              <Slider
                value={[scalarK]}
                onValueChange={([v]) => setScalarK(v)}
                min={1}
                max={Math.min(curvePoints.length, 100)}
                step={1}
                className="mt-1"
              />
            </div>
            
            {/* Ergebnis */}
            <div className="p-3 rounded bg-background/50 border border-border/30 space-y-2">
              <div className="text-[10px] text-muted-foreground">Skalarmultiplikation:</div>
              <div className="font-mono text-sm text-primary">
                P = k × G = {scalarK} × G
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[9px] text-amber-400">Generator G:</div>
                  <div className="text-xs font-mono text-amber-300">
                    ({G.x.toString()}, {G.y.toString()})
                  </div>
                </div>
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-[9px] text-red-400">Ergebnis P:</div>
                  <div className="text-xs font-mono text-red-300">
                    {result ? `(${result.x.toString()}, ${result.y.toString()})` : "∞"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mathematische Erklärung */}
            <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-1">
              <div className="text-[10px] text-muted-foreground">Punkt-Addition (P ≠ Q):</div>
              <div className="font-mono text-[10px] text-primary">
                λ = (y₂ - y₁) / (x₂ - x₁) mod p
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Punkt-Verdopplung (P = Q):</div>
              <div className="font-mono text-[10px] text-primary">
                λ = (3x₁² + a) / 2y₁ mod p
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Neue Koordinaten:</div>
              <div className="font-mono text-[10px] text-secondary">
                x₃ = λ² - x₁ - x₂   |   y₃ = λ(x₁ - x₃) - y₁
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-2" onClick={startAnimation} disabled={isAnimating}>
                <Play className="w-3 h-3" />
                Animation
              </Button>
              <Button size="sm" variant="outline" onClick={reset}>
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant={showTrace ? "default" : "outline"} 
                onClick={() => setShowTrace(!showTrace)}
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="ecdsa" className="space-y-4 mt-4">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full rounded border border-border/30"
            />
            
            {/* Key Pair */}
            <div className="p-3 rounded bg-background/50 border border-border/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Key className="w-4 h-4 text-amber-400" />
                Schlüsselpaar
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private Key (d)
                  </label>
                  <Input
                    type="number"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(Math.max(1, Math.min(Number(curveOrder) - 1, parseInt(e.target.value) || 1)))}
                    className="h-7 text-xs font-mono"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    Public Key (Q = d×G)
                  </label>
                  <div className="h-7 text-xs font-mono bg-blue-500/10 border border-blue-500/20 rounded px-2 flex items-center text-blue-300">
                    {publicKey ? `(${publicKey.x}, ${publicKey.y})` : "∞"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message & Signature Parameters */}
            <div className="p-3 rounded bg-background/50 border border-border/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <PenTool className="w-4 h-4 text-purple-400" />
                Signatur erstellen
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Message Hash (z)</label>
                  <Input
                    type="number"
                    value={messageHash}
                    onChange={(e) => setMessageHash(parseInt(e.target.value) || 1)}
                    className="h-7 text-xs font-mono"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Random k (geheim!)</label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={signatureK}
                      onChange={(e) => setSignatureK(Math.max(1, Math.min(Number(curveOrder) - 1, parseInt(e.target.value) || 1)))}
                      className="h-7 text-xs font-mono"
                      min={1}
                    />
                    <Button size="sm" variant="outline" className="h-7 px-2" onClick={generateRandomK}>
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button onClick={createSignature} className="w-full gap-2" size="sm">
                <PenTool className="w-3 h-3" />
                Signatur erstellen
              </Button>
              
              {signature && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                    <div className="text-[9px] text-purple-400">r = R.x mod n:</div>
                    <div className="text-xs font-mono text-purple-300">{signature.r.toString()}</div>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                    <div className="text-[9px] text-purple-400">s = k⁻¹(z + rd) mod n:</div>
                    <div className="text-xs font-mono text-purple-300">{signature.s.toString()}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Verification */}
            <div className="p-3 rounded bg-background/50 border border-border/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Signatur verifizieren
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">r Wert</label>
                  <Input
                    value={inputR}
                    onChange={(e) => setInputR(e.target.value)}
                    className="h-7 text-xs font-mono"
                    placeholder="r"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">s Wert</label>
                  <Input
                    value={inputS}
                    onChange={(e) => setInputS(e.target.value)}
                    className="h-7 text-xs font-mono"
                    placeholder="s"
                  />
                </div>
              </div>
              
              <Button onClick={verifySignature} variant="secondary" className="w-full gap-2" size="sm">
                <CheckCircle className="w-3 h-3" />
                Verifizieren
              </Button>
              
              {verificationResult !== null && (
                <div className={`p-2 rounded flex items-center gap-2 ${verificationResult ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  {verificationResult ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Signatur ist GÜLTIG ✓</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400">Signatur ist UNGÜLTIG ✗</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* ECDSA Math */}
            <div className="p-2 rounded bg-muted/20 border border-border/20 space-y-1">
              <div className="text-[10px] font-medium text-muted-foreground">ECDSA Algorithmus:</div>
              <div className="space-y-0.5 font-mono text-[9px]">
                <div className="text-amber-400">Signieren:</div>
                <div className="text-muted-foreground pl-2">R = k × G</div>
                <div className="text-muted-foreground pl-2">r = R.x mod n</div>
                <div className="text-muted-foreground pl-2">s = k⁻¹ × (z + r × d) mod n</div>
                <div className="text-green-400 mt-1">Verifizieren:</div>
                <div className="text-muted-foreground pl-2">w = s⁻¹ mod n</div>
                <div className="text-muted-foreground pl-2">u₁ = z × w mod n</div>
                <div className="text-muted-foreground pl-2">u₂ = r × w mod n</div>
                <div className="text-muted-foreground pl-2">P = u₁×G + u₂×Q</div>
                <div className="text-muted-foreground pl-2">Gültig wenn: r ≡ P.x (mod n)</div>
              </div>
            </div>
            
            {/* Warning */}
            <div className="p-2 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-red-300/80">
                <strong>Warnung:</strong> k darf NIEMALS wiederverwendet werden! 
                Sonst kann der Private Key berechnet werden (siehe PlayStation 3 Hack 2010).
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Info */}
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-blue-300/80">
            <strong>Bitcoin secp256k1:</strong> p = 2²⁵⁶ - 2³² - 977, 
            n ≈ 1.158 × 10⁷⁷ Punkte. Reduzierte Kurve mit p = {curveP} ({curvePoints.length} Punkte) — identische Mathematik, berechenbare Ordnung.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}