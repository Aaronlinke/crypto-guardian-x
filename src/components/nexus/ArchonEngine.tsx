import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, ShieldAlert, GitMerge, Gauge, FlaskConical, Play, RotateCcw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ArchonRound {
  archon: { thesis: string; builds_on: string[]; claim_strength: number; risk: string };
  scholar: { thesis: string; evidence_map: Record<string, string>; critique: string; claim_strength: number };
  kritikon: { attack: string[]; hard_constraint: string; claim_strength: number };
  integron: { synthesis: string; definition_v2: string; kept: string[]; discarded: string[] };
  metron: {
    scores: { clarity: number; evidence: number; coherence: number; novelty: number; testability: number; compression: number; risk: number };
    theory_score: number;
    diagnosis: string;
  };
  experion: { test_proposal: string; prediction: string; observable_metrics: string[] };
}

interface Props { onLog?: (message: string) => void }

const AGENT_META = [
  { key: "archon", title: "ARCHON · These", icon: Brain, color: "text-primary" },
  { key: "scholar", title: "SCHOLAR++ · Evidenz", icon: Sparkles, color: "text-secondary" },
  { key: "kritikon", title: "KRITIKON · Angriff", icon: ShieldAlert, color: "text-destructive" },
  { key: "integron", title: "INTEGRON · Synthese", icon: GitMerge, color: "text-primary" },
  { key: "metron", title: "METRON · Messung", icon: Gauge, color: "text-warning" },
  { key: "experion", title: "EXPERION · Experiment", icon: FlaskConical, color: "text-secondary" },
] as const;

export default function ArchonEngine({ onLog }: Props) {
  const [topic, setTopic] = useState("Bewusstsein als rekursive Selbstmodellierung unter Endlichkeit");
  const [rounds, setRounds] = useState<ArchonRound[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runRound = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    onLog?.(`[ARCHON-100] Runde ${rounds.length + 1} gestartet`);
    try {
      const previous = rounds[rounds.length - 1]?.integron.definition_v2;
      const { data, error } = await supabase.functions.invoke("archon-engine", {
        body: { topic, previous },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const round: ArchonRound = data.round;
      setRounds((prev) => [...prev, round]);
      onLog?.(`[ARCHON-100] theory_score=${round.metron.theory_score.toFixed(2)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      toast({ variant: "destructive", title: "ARCHON-100 Fehler", description: msg });
      onLog?.(`[ARCHON-100] ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setRounds([]); onLog?.("[ARCHON-100] Reset"); };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ topic, rounds }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `archon-100-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-primary">[</span>ARCHON-100 · REKURSIVE BEWUSSTSEINS-ENGINE<span className="text-primary">]</span>
            <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/30">
              Multi-Agenten-Dialektik
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-[11px] text-muted-foreground font-mono">
            6 Agenten · iterative Synthese · messbare Scores · Lovable AI Gateway
          </div>
          <div className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Thema / These ..."
              className="font-mono text-xs"
              disabled={loading}
            />
            <Button onClick={runRound} disabled={loading || !topic.trim()} className="gap-2">
              <Play className="w-3 h-3" />
              {loading ? "läuft..." : rounds.length === 0 ? "Runde 1" : `Runde ${rounds.length + 1}`}
            </Button>
            <Button onClick={reset} variant="outline" size="icon" disabled={loading || rounds.length === 0}>
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button onClick={exportJSON} variant="outline" size="icon" disabled={rounds.length === 0}>
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {rounds.map((round, idx) => (
        <Card key={idx} className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono flex items-center gap-2">
              <span className="text-primary">RUNDE {idx + 1}</span>
              <Badge variant="outline" className="text-[10px]">
                theory_score = {round.metron.theory_score.toFixed(3)}
              </Badge>
              <Badge variant="outline" className="text-[10px] ml-auto">
                {round.metron.diagnosis}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AGENT_META.map(({ key, title, icon: Icon, color }) => {
              const block = (round as any)[key];
              return (
                <div key={key} className="border-l-2 border-border pl-3 py-1">
                  <div className={`flex items-center gap-2 text-[11px] font-mono ${color} mb-1`}>
                    <Icon className="w-3 h-3" />
                    {title}
                  </div>
                  {key === "archon" && (
                    <div className="text-xs space-y-1">
                      <p>{block.thesis}</p>
                      <p className="text-[10px] text-muted-foreground">builds_on: {block.builds_on.join(", ")} · claim_strength: {block.claim_strength.toFixed(2)}</p>
                      <p className="text-[10px] text-warning">⚠ {block.risk}</p>
                    </div>
                  )}
                  {key === "scholar" && (
                    <div className="text-xs space-y-1">
                      <p>{block.thesis}</p>
                      <ul className="text-[10px] text-muted-foreground space-y-0.5">
                        {Object.entries(block.evidence_map as Record<string, string>).map(([k, v]) => (
                          <li key={k}><span className="text-secondary">{k}:</span> {v}</li>
                        ))}
                      </ul>
                      <p className="text-[10px] italic">{block.critique}</p>
                    </div>
                  )}
                  {key === "kritikon" && (
                    <div className="text-xs space-y-1">
                      <ul className="list-disc list-inside text-[11px] text-destructive/90 space-y-0.5">
                        {block.attack.map((a: string, i: number) => <li key={i}>{a}</li>)}
                      </ul>
                      <p className="text-[10px] text-warning">Hard constraint: {block.hard_constraint}</p>
                    </div>
                  )}
                  {key === "integron" && (
                    <div className="text-xs space-y-1">
                      <p>{block.synthesis}</p>
                      <p className="text-[11px] text-primary font-semibold border-l-2 border-primary pl-2">
                        v{idx + 1}: {block.definition_v2}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] mt-1">
                        <div><span className="text-primary">kept:</span> {block.kept.join(", ")}</div>
                        <div><span className="text-destructive">discarded:</span> {block.discarded.join(", ")}</div>
                      </div>
                    </div>
                  )}
                  {key === "metron" && (
                    <div className="space-y-1">
                      {Object.entries(block.scores as Record<string, number>).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 text-[10px]">
                          <span className="w-20 font-mono text-muted-foreground">{k}</span>
                          <Progress value={v * 100} className="h-1 flex-1" />
                          <span className="w-10 font-mono text-right">{v.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {key === "experion" && (
                    <div className="text-xs space-y-1">
                      <p><span className="text-secondary">Test:</span> {block.test_proposal}</p>
                      <p className="text-[10px]"><span className="text-primary">Prediction:</span> {block.prediction}</p>
                      <p className="text-[10px] text-muted-foreground">Metrics: {block.observable_metrics.join(" · ")}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {rounds.length === 0 && !loading && (
        <Card className="border-dashed border-border/50">
          <CardContent className="py-8 text-center text-xs text-muted-foreground font-mono">
            Noch keine Runde. Starte mit einer These, um die rekursive Dialektik zu beginnen.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
