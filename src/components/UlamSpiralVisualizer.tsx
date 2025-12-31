import { useState, useEffect, useRef } from "react";
import { Grid3X3, Zap, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

// Primzahltest
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Ulam-Spirale Koordinaten berechnen
function ulamCoordinates(n: number): { x: number; y: number } {
  if (n === 1) return { x: 0, y: 0 };
  
  // Bestimme den Ring (Layer)
  const k = Math.ceil((Math.sqrt(n) - 1) / 2);
  const maxInRing = (2 * k + 1) ** 2;
  const sideLength = 2 * k;
  
  // Position im Ring
  let pos = maxInRing - n;
  
  // Bestimme Seite und Position auf der Seite
  const side = Math.floor(pos / sideLength);
  const offset = pos % sideLength;
  
  switch (side) {
    case 0: // Rechts nach oben
      return { x: k, y: k - offset };
    case 1: // Oben nach links
      return { x: k - offset, y: -k };
    case 2: // Links nach unten
      return { x: -k, y: -k + offset };
    case 3: // Unten nach rechts
      return { x: -k + offset, y: k };
    default:
      return { x: 0, y: 0 };
  }
}

export function UlamSpiralVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maxNumber, setMaxNumber] = useState(400);
  const [showDiagonals, setShowDiagonals] = useState(true);
  const [highlightedPrime, setHighlightedPrime] = useState<number | null>(null);

  // Primzahlen bis maxNumber
  const primes = Array.from({ length: maxNumber }, (_, i) => i + 1).filter(isPrime);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Berechne Skalierung basierend auf maxNumber
    const maxK = Math.ceil((Math.sqrt(maxNumber) - 1) / 2);
    const cellSize = Math.min(width, height) / (2 * maxK + 3);

    // Clear
    ctx.fillStyle = "hsl(220, 20%, 4%)";
    ctx.fillRect(0, 0, width, height);

    // Diagonale Linien (Primzahl-Muster)
    if (showDiagonals) {
      ctx.strokeStyle = "hsl(120, 100%, 20%)";
      ctx.lineWidth = 0.5;
      
      // Hauptdiagonalen
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.stroke();
      
      // Sekundäre Diagonalen
      for (let i = -maxK; i <= maxK; i += 2) {
        const offset = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(centerX + offset - width/2, 0);
        ctx.lineTo(centerX + offset + width/2, height);
        ctx.stroke();
      }
    }

    // Zeichne alle Zahlen
    for (let n = 1; n <= maxNumber; n++) {
      const { x, y } = ulamCoordinates(n);
      const screenX = centerX + x * cellSize;
      const screenY = centerY - y * cellSize;
      
      const prime = isPrime(n);
      
      if (prime) {
        // Primzahlen als grüne Punkte
        ctx.fillStyle = n === highlightedPrime 
          ? "hsl(0, 100%, 50%)" 
          : "hsl(120, 100%, 50%)";
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow für Primzahlen
        if (n === highlightedPrime) {
          ctx.shadowColor = "hsl(0, 100%, 50%)";
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(screenX, screenY, cellSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else {
        // Nicht-Primzahlen als dunkle Punkte
        ctx.fillStyle = "hsl(220, 15%, 15%)";
        ctx.beginPath();
        ctx.arc(screenX, screenY, cellSize * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Zentrum markieren (1)
    ctx.fillStyle = "hsl(180, 100%, 50%)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "hsl(220, 20%, 4%)";
    ctx.font = `${cellSize * 0.5}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("1", centerX, centerY);

  }, [maxNumber, showDiagonals, highlightedPrime]);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-primary" />
          <span className="text-primary">[</span>
          ULAM-SPIRALE · PRIMZAHL-MUSTER
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {primes.length} Primzahlen
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Canvas */}
        <div className="relative rounded overflow-hidden border border-border/30">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300}
            className="w-full aspect-square"
          />
        </div>

        {/* Info */}
        <div className="p-2 rounded bg-background/50 border border-border/30 text-[10px]">
          <div className="text-muted-foreground mb-1">Stanislaw Ulam (1963):</div>
          <div className="text-foreground">
            Primzahlen in Spirale angeordnet zeigen <span className="text-primary">diagonale Muster</span> - 
            nicht zufällig verteilt!
          </div>
        </div>

        {/* Controls */}
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Bereich</span>
            <span className="text-primary">1 - {maxNumber}</span>
          </div>
          <Slider
            value={[maxNumber]}
            onValueChange={(v) => setMaxNumber(v[0])}
            min={100}
            max={1000}
            step={50}
            className="w-full"
          />
        </div>

        {/* Diagonal Toggle */}
        <button
          onClick={() => setShowDiagonals(!showDiagonals)}
          className={`w-full p-2 rounded text-xs flex items-center justify-center gap-2 transition-colors ${
            showDiagonals 
              ? "bg-primary/20 text-primary border border-primary/30" 
              : "bg-muted/30 text-muted-foreground border border-border/30"
          }`}
        >
          <Filter className="w-3 h-3" />
          Diagonale Linien {showDiagonals ? "ausblenden" : "einblenden"}
        </button>

        {/* Prime List */}
        <div className="p-2 rounded bg-background/30 border border-border/20">
          <div className="text-[10px] text-muted-foreground mb-1">Erste Primzahlen:</div>
          <div className="flex flex-wrap gap-1">
            {primes.slice(0, 20).map(p => (
              <span 
                key={p}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  highlightedPrime === p 
                    ? "bg-destructive/20 text-destructive" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
                onMouseEnter={() => setHighlightedPrime(p)}
                onMouseLeave={() => setHighlightedPrime(null)}
              >
                {p}
              </span>
            ))}
            <span className="text-[10px] text-muted-foreground">...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
