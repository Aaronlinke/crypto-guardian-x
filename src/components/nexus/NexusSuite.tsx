import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Layers, Zap, Table, Grid3X3, Shuffle, Clock, Code,
  GitBranch, Database, Shield, Brain, KeyRound,
} from "lucide-react";

import PollardsRhoVisualizer from "@/components/nexus/PollardsRhoVisualizer";
import BSGSVisualizer from "@/components/nexus/BSGSVisualizer";
import MersenneTwisterAnalyzer from "@/components/nexus/MersenneTwisterAnalyzer";
import TimingAttackSimulator from "@/components/nexus/TimingAttackSimulator";
import BitcoinScriptAnalyzer from "@/components/nexus/BitcoinScriptAnalyzer";
import WeakKeyDatabase from "@/components/nexus/WeakKeyDatabase";
import HNPLatticeAttack from "@/components/nexus/HNPLatticeAttack";
import TransactionGraphExplorer from "@/components/nexus/TransactionGraphExplorer";
import NonHarvestabilityDemo from "@/components/nexus/NonHarvestabilityDemo";
import ArchonEngine from "@/components/nexus/ArchonEngine";

interface Props {
  onLog?: (message: string) => void;
}

const MODULES = [
  { id: "pollard", title: "Pollard's Rho", icon: Zap, Comp: PollardsRhoVisualizer, desc: "ECDLP-Solver" },
  { id: "bsgs", title: "Baby-step Giant-step", icon: Table, Comp: BSGSVisualizer, desc: "ECDLP-Visualizer" },
  { id: "hnp", title: "HNP Lattice Attack", icon: Grid3X3, Comp: HNPLatticeAttack, desc: "Lattice / LLL" },
  { id: "mt", title: "MT19937 State Recovery", icon: Shuffle, Comp: MersenneTwisterAnalyzer, desc: "Mersenne Twister" },
  { id: "timing", title: "Timing-Attack", icon: Clock, Comp: TimingAttackSimulator, desc: "Side-Channel" },
  { id: "script", title: "Bitcoin Script Analyzer", icon: Code, Comp: BitcoinScriptAnalyzer, desc: "P2SH / P2WSH" },
  { id: "txgraph", title: "Transaction Graph", icon: GitBranch, Comp: TransactionGraphExplorer, desc: "Fund-Flow" },
  { id: "weakkeys", title: "Weak Key Database", icon: Database, Comp: WeakKeyDatabase, desc: "Vulnerable Keys" },
  { id: "nonharvest", title: "Non-Harvestability", icon: Shield, Comp: NonHarvestabilityDemo, desc: "Demonstration" },
  { id: "archon", title: "ARCHON-100", icon: Brain, Comp: ArchonEngine, desc: "Bewusstseins-Engine" },
] as const;

export default function NexusSuite({ onLog }: Props) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace('#', '');
      if (raw.startsWith('suite-')) {
        const moduleId = raw.replace('suite-', '');
        if (MODULES.some((m) => m.id === moduleId)) {
          setOpenItems((prev) =>
            prev.includes(moduleId) ? prev : [...prev, moduleId]
          );
        }
      }
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-primary">[</span>NEXUS SUITE · ALLE MODULE VEREINT<span className="text-primary">]</span>
            <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
              {MODULES.length} Module
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-muted-foreground font-mono">
            Alle Werkzeuge in einem Modul — aufklappbar, kombinierbar, zentral. Nur für Bildungs- und Forschungszwecke.
          </p>
        </CardContent>
      </Card>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-2"
      >
        {MODULES.map(({ id, title, icon: Icon, Comp, desc }) => (
          <AccordionItem
            key={id}
            value={id}
            className="border border-border/50 rounded-md bg-card/60 px-3"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Icon className="w-4 h-4 text-primary" />
                <span>{title}</span>
                <span className="text-[10px] text-muted-foreground">· {desc}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <Comp onLog={onLog} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
