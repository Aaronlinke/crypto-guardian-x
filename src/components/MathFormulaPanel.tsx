import { useState } from "react";
import { Calculator, ChevronRight, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Formula {
  id: string;
  name: string;
  category: string;
  latex: string;
  description: string;
  variables: Record<string, string>;
}

const formulas: Formula[] = [
  // === KRYPTOGRAPHIE ===
  {
    id: "ecdsa-pubkey",
    name: "ECDSA Public Key",
    category: "Kryptographie",
    latex: "Q = d · G",
    description: "Public Key Q ist das Produkt aus Private Key d und Generator G auf secp256k1",
    variables: { "Q": "Public Key", "d": "Private Key", "G": "Generator" }
  },
  {
    id: "ecdsa-inversion",
    name: "ECDSA Inversion",
    category: "Kryptographie",
    latex: "d = k · r⁻¹ mod N",
    description: "Private Key Berechnung aus Signatur-Komponenten (Nonce Reuse)",
    variables: { "d": "Private Key", "k": "Ephemeral Key", "r": "Signatur R", "N": "Kurvenordnung" }
  },
  {
    id: "ecdsa-signature",
    name: "ECDSA Signatur",
    category: "Kryptographie",
    latex: "s = k⁻¹ · (z + r·d) mod N",
    description: "Berechnung des S-Werts einer ECDSA-Signatur",
    variables: { "s": "Signatur S", "k": "Nonce", "z": "Message Hash", "r": "Signatur R", "d": "Private Key" }
  },
  {
    id: "sha256-hash",
    name: "SHA-256 Doppelhash",
    category: "Kryptographie",
    latex: "H(B) = SHA256(SHA256(B))",
    description: "Bitcoin Block-Hash Funktion",
    variables: { "B": "Block-Daten", "H": "Hash" }
  },
  {
    id: "modular-inverse",
    name: "Modulare Inverse",
    category: "Kryptographie",
    latex: "a⁻¹ mod N mit a·a⁻¹ ≡ 1 (mod N)",
    description: "Extended Euclidean Algorithm für modulare Inverse",
    variables: { "a": "Eingabe", "N": "Modulus" }
  },
  
  // === SAT-LOGIK ===
  {
    id: "cnf-formula",
    name: "CNF Formel",
    category: "SAT-Logik",
    latex: "CNF = ⋀ᵢ₌₁ᵐ Cᵢ, Cᵢ = ⋁ⱼ₌₁ᵏ lᵢⱼ",
    description: "Konjunktive Normalform - AND von OR-Klauseln",
    variables: { "Cᵢ": "Klausel i", "lᵢⱼ": "Literal j", "m": "Klauselanzahl" }
  },
  {
    id: "resolution",
    name: "Resolution",
    category: "SAT-Logik",
    latex: "(A ∨ x) ∧ (B ∨ ¬x) ⇒ (A ∨ B)",
    description: "Resolutionsregel - eliminiert Variable x",
    variables: { "A, B": "Literalmengen", "x": "Variable" }
  },
  {
    id: "unit-propagation",
    name: "Unit Propagation",
    category: "SAT-Logik",
    latex: "C = {l} ⇒ l := true",
    description: "Wenn Klausel nur ein Literal hat, muss es wahr sein",
    variables: { "C": "Unit-Klausel", "l": "Literal" }
  },
  {
    id: "dpll",
    name: "DPLL Algorithmus",
    category: "SAT-Logik",
    latex: "DPLL(φ) = UP(φ) ∧ (DPLL(φ[x]) ∨ DPLL(φ[¬x]))",
    description: "Davis-Putnam-Logemann-Loveland mit Backtracking",
    variables: { "φ": "CNF-Formel", "UP": "Unit Propagation", "x": "Splitting-Variable" }
  },
  
  // === DYNAMIK ===
  {
    id: "dynamisches-system",
    name: "Diskretes Dynamisches System",
    category: "Dynamik",
    latex: "Fⁿ := F ∘ F ∘ ... ∘ F (n-mal)",
    description: "n-te Iterierte einer Selbstabbildung F",
    variables: { "F": "Abbildung", "n": "Iterationstiefe" }
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "Dynamik",
    latex: "O(x) = {Fⁿ(x) | n ∈ ℕ₀}",
    description: "Menge aller Iterationen eines Punktes x",
    variables: { "x": "Startpunkt", "Fⁿ(x)": "n-te Iteration" }
  },
  {
    id: "fixpunkt",
    name: "Fixpunkt",
    category: "Dynamik",
    latex: "x* ∈ S mit F(x*) = x*",
    description: "Punkt der unter F invariant bleibt",
    variables: { "x*": "Fixpunkt", "F": "Abbildung" }
  },
  {
    id: "ruckwarts-operator",
    name: "Urbildoperator F⁻¹",
    category: "Dynamik",
    latex: "F⁻¹(X) = {y ∈ S | F(y) ∈ X}",
    description: "Menge aller Punkte die nach X abbilden (Rückwärts-Iteration)",
    variables: { "X": "Zielmenge", "F⁻¹": "Urbild-Funktion" }
  },
  {
    id: "logistic-map",
    name: "Logistische Abbildung",
    category: "Dynamik",
    latex: "xₙ₊₁ = r · xₙ · (1 - xₙ)",
    description: "Standardbeispiel für deterministisches Chaos",
    variables: { "r": "Parameter (1-4)", "x": "Zustand [0,1]" }
  },
  {
    id: "henon",
    name: "Hénon-Abbildung",
    category: "Dynamik",
    latex: "xₙ₊₁ = 1 - a·xₙ² + yₙ, yₙ₊₁ = b·xₙ",
    description: "2D chaotischer Attraktor",
    variables: { "a": "1.4", "b": "0.3", "x,y": "Zustand" }
  },
  
  // === CHAOS ===
  {
    id: "lyapunov",
    name: "Lyapunov-Exponent",
    category: "Chaos",
    latex: "λ = lim(n→∞) (1/n) · Σ log|F'(xᵢ)|",
    description: "Maß für exponentielle Divergenz (λ>0 = Chaos)",
    variables: { "λ": "Lyapunov-Exponent", "F'": "Ableitung" }
  },
  {
    id: "feigenbaum",
    name: "Feigenbaum-Konstante",
    category: "Chaos",
    latex: "δ = 4.669201609...",
    description: "Universelle Konstante in periodenverdoppelnden Systemen",
    variables: { "δ": "Feigenbaum-Konstante" }
  },
  {
    id: "sensitive-dependence",
    name: "Sensitive Abhängigkeit",
    category: "Chaos",
    latex: "|Fⁿ(x) - Fⁿ(y)| ≈ |x-y| · eⁿλ",
    description: "Schmetterlingseffekt - kleine Änderungen wachsen exponentiell",
    variables: { "λ": "Lyapunov", "n": "Zeit" }
  },
  
  // === OMNIGENESIS ===
  {
    id: "seed-generation",
    name: "OMNIGENESIS Seed",
    category: "OMNIGENESIS",
    latex: "kᵢ = (h + n·g + o + i) mod N",
    description: "Deterministische Seed-Berechnung pro Iteration",
    variables: { "h": "Entropie", "n": "Navigation", "g": "Geometrie", "o": "Offset", "i": "Index" }
  },
  {
    id: "omnigenesis-pipeline",
    name: "OMNIGENESIS Pipeline",
    category: "OMNIGENESIS",
    latex: "Entropy → Navigation → Geometry → Seed → ECDSA → Output",
    description: "Vollständige Key-Generierungs-Pipeline",
    variables: { "h,n,g": "Parameter", "k": "Seed", "Q": "Public Key" }
  },
  {
    id: "ulam-spiral",
    name: "Ulam-Spirale",
    category: "OMNIGENESIS",
    latex: "spiral(n) → (x,y) mit Primzahl-Diagonalen",
    description: "Geometrische Anordnung zeigt Primzahl-Muster",
    variables: { "n": "Zahl", "x,y": "Spiralkoordinaten" }
  },
  
  // === INFORMATION ===
  {
    id: "entropy-shannon",
    name: "Shannon-Entropie",
    category: "Information",
    latex: "H(X) = -Σ p(x) · log₂(p(x))",
    description: "Informationsgehalt einer Quelle",
    variables: { "H": "Entropie", "p(x)": "Wahrscheinlichkeit" }
  },
  {
    id: "entropy-bits",
    name: "Private Key Entropie",
    category: "Information",
    latex: "H(d) = log₂(N) ≈ 256 bits",
    description: "Entropie eines secp256k1 Private Keys",
    variables: { "H": "Bits", "N": "Kurvenordnung" }
  },
  {
    id: "kolmogorov",
    name: "Kolmogorov-Komplexität",
    category: "Information",
    latex: "K(x) = min{|p| : U(p) = x}",
    description: "Kürzestes Programm das x erzeugt",
    variables: { "K": "Komplexität", "p": "Programm", "U": "Universelle TM" }
  },
  
  // === STRING-THEORIE ===
  {
    id: "holographic",
    name: "Holographisches Prinzip",
    category: "String-Theorie",
    latex: "S ≤ A / (4·ℓₚ²)",
    description: "Information einer Region begrenzt durch Oberfläche",
    variables: { "S": "Entropie", "A": "Fläche", "ℓₚ": "Planck-Länge" }
  },
  {
    id: "ads-cft",
    name: "AdS/CFT Korrespondenz",
    category: "String-Theorie",
    latex: "Z_gravity[φ₀] = ⟨exp(∫φ₀O)⟩_CFT",
    description: "Dualität zwischen Gravitation und Feldtheorie",
    variables: { "Z": "Zustandssumme", "φ₀": "Randwert", "O": "CFT-Operator" }
  },
  
  // === KOSMOLOGIE ===
  {
    id: "de-sitter",
    name: "De-Sitter Metrik",
    category: "Kosmologie",
    latex: "ds² = -dt² + e^(2Ht)(dx² + dy² + dz²)",
    description: "Metrik eines expandierenden Universums",
    variables: { "H": "Hubble-Konstante", "t": "Zeit" }
  },
  {
    id: "friedmann",
    name: "Friedmann-Gleichung",
    category: "Kosmologie",
    latex: "H² = (8πG/3)ρ - k/a² + Λ/3",
    description: "Expansion des Universums",
    variables: { "H": "Hubble", "ρ": "Dichte", "Λ": "Kosmologische Konstante" }
  }
];

const categories = [...new Set(formulas.map(f => f.category))];

export function MathFormulaPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredFormulas = selectedCategory 
    ? formulas.filter(f => f.category === selectedCategory)
    : formulas;

  const copyFormula = (formula: Formula) => {
    navigator.clipboard.writeText(formula.latex);
    setCopiedId(formula.id);
    toast({ title: "Kopiert", description: formula.name });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-primary">[</span>
          MATHEMATISCHE FORMELN
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {formulas.length} Formeln
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Category Filter */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 text-[10px] rounded border transition-colors ${
              selectedCategory === null 
                ? "bg-primary text-primary-foreground border-primary" 
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            Alle
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                selectedCategory === cat 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Formula List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-2">
            {filteredFormulas.map((formula) => (
              <div
                key={formula.id}
                className="p-3 rounded-md bg-background/50 border border-border/30 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{formula.name}</span>
                      <Badge variant="outline" className="text-[9px]">{formula.category}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formula.description}</p>
                  </div>
                  <button
                    onClick={() => copyFormula(formula)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  >
                    {copiedId === formula.id ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {/* Formula Display */}
                <div className="p-2 rounded bg-background/80 border border-border/20 font-mono text-sm text-primary glow-green">
                  {formula.latex}
                </div>

                {/* Variables */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(formula.variables).map(([key, desc]) => (
                    <span key={key} className="text-[9px] text-muted-foreground">
                      <span className="text-secondary">{key}</span>: {desc}
                      {Object.keys(formula.variables).indexOf(key) < Object.keys(formula.variables).length - 1 && " | "}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
