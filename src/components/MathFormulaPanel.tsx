import { useState } from "react";
import { Calculator, ChevronRight, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formulas, categories, type Formula } from "@/lib/formula-data";

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
