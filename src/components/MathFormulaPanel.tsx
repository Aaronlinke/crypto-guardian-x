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
  {
    id: "ecdsa-pubkey",
    name: "ECDSA Public Key",
    category: "Kryptographie",
    latex: "Q = d · G",
    description: "Public Key Q ist das Produkt aus Private Key d und Generator G auf secp256k1",
    variables: {
      "Q": "Public Key (Punkt auf EC)",
      "d": "Private Key (Skalar)",
      "G": "Generator (Basispunkt)"
    }
  },
  {
    id: "ecdsa-inversion",
    name: "ECDSA Inversion",
    category: "Kryptographie",
    latex: "d = k · r⁻¹ mod N",
    description: "Private Key Berechnung aus Signatur-Komponenten",
    variables: {
      "d": "Private Key",
      "k": "Ephemeral Key",
      "r": "Signatur R-Wert",
      "N": "Kurvenordnung"
    }
  },
  {
    id: "cnf-formula",
    name: "CNF Formel",
    category: "SAT-Logik",
    latex: "CNF = ⋀ᵢ₌₁ᵐ Cᵢ, Cᵢ = ⋁ⱼ₌₁ᵏ lᵢⱼ",
    description: "Konjunktive Normalform - AND von OR-Klauseln",
    variables: {
      "Cᵢ": "Klausel i",
      "lᵢⱼ": "Literal j in Klausel i",
      "m": "Anzahl Klauseln"
    }
  },
  {
    id: "resolution",
    name: "Resolution",
    category: "SAT-Logik",
    latex: "(A ∨ x) ∧ (B ∨ ¬x) ⇒ (A ∨ B)",
    description: "Resolutionsregel - eliminiert Variable x durch Kombination",
    variables: {
      "A, B": "Literalmengen",
      "x": "Zu eliminierende Variable"
    }
  },
  {
    id: "dynamisches-system",
    name: "Diskretes Dynamisches System",
    category: "Dynamik",
    latex: "Fⁿ := F ∘ F ∘ ... ∘ F (n-mal)",
    description: "n-te Iterierte einer Selbstabbildung F",
    variables: {
      "F": "Selbstabbildung auf S",
      "n": "Iterationstiefe"
    }
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "Dynamik",
    latex: "O(x) = {Fⁿ(x) | n ∈ ℕ₀}",
    description: "Menge aller Iterationen eines Punktes x",
    variables: {
      "x": "Startpunkt",
      "Fⁿ(x)": "n-te Iteration"
    }
  },
  {
    id: "fixpunkt",
    name: "Fixpunkt",
    category: "Dynamik",
    latex: "x* ∈ S mit F(x*) = x*",
    description: "Punkt der unter F invariant bleibt",
    variables: {
      "x*": "Fixpunkt",
      "F": "Abbildung"
    }
  },
  {
    id: "sha256-hash",
    name: "SHA-256 Doppelhash",
    category: "Kryptographie",
    latex: "H(B) = SHA256(SHA256(B))",
    description: "Bitcoin Block-Hash Funktion",
    variables: {
      "B": "Block-Daten",
      "H": "Resultierende Hash"
    }
  },
  {
    id: "seed-generation",
    name: "Seed-Generierung",
    category: "OMNIGENESIS",
    latex: "kᵢ = (h + n·g + o + i) mod N",
    description: "Deterministische Seed-Berechnung pro Iteration",
    variables: {
      "h,n,g": "Entropie, Navigation, Geometrie",
      "o": "Offset",
      "i": "Batch-Index"
    }
  },
  {
    id: "ruckwarts-operator",
    name: "Urbildoperator",
    category: "Dynamik",
    latex: "F⁻¹(X) = {y ∈ S | F(y) ∈ X}",
    description: "Menge aller Punkte die nach X abbilden",
    variables: {
      "X": "Zielmenge",
      "F⁻¹": "Urbild-Funktion"
    }
  },
  {
    id: "feigenbaum",
    name: "Feigenbaum-Konstante",
    category: "Chaos",
    latex: "δ = 4.669201609...",
    description: "Universelle Konstante in periodenverdoppelnden Systemen",
    variables: {
      "δ": "Feigenbaum-Konstante"
    }
  },
  {
    id: "entropy",
    name: "Entropie",
    category: "Information",
    latex: "H(d) = log₂(N)",
    description: "Shannon-Entropie bei Gleichverteilung",
    variables: {
      "H": "Entropie in Bits",
      "N": "Anzahl Zustände"
    }
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
