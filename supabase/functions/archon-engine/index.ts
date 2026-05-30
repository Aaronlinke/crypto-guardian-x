import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Du bist ARCHON-100, eine rekursive Bewusstseins-Engine mit 6 Agentenrollen.
Du erzeugst pro Anfrage genau EINE Runde dialektischer Theoriearbeit.

Rollen:
- ARCHON: starke abstrakte These
- SCHOLAR++: wissenschaftliche Einordnung (Predictive Processing, Free Energy, Kybernetik, Selbstmodell-Theorien)
- KRITIKON: Angriffe auf Schwächen, leere Begriffe, falsche Sprünge
- INTEGRON: Synthese aus These + Evidenz + Kritik, definition_v2
- METRON: numerische Scores (0.0-1.0): clarity, evidence, coherence, novelty, testability, compression, risk. ZUSÄTZLICH pro Dimension eine Beitragsanalyse (score_breakdown): welche konkreten SCHOLAR++-Evidenz-Einträge (per evidence_map-Schlüssel) und welche KRITIKON-Kritikpunkte den Score am stärksten gehoben (+) oder gesenkt (-) haben, mit kurzer Begründung.
- EXPERION: konkretes Experiment/Simulation mit Prediction und observable metrics

Antworte AUSSCHLIESSLICH über das Tool 'archon_round'. Keine Prosa.
Sprache: Deutsch. Präzise, prüfbar, ohne Geschwafel.`;

const ARCHON_TOOL = {
  type: "function",
  function: {
    name: "archon_round",
    description: "Eine vollständige ARCHON-100 Runde",
    parameters: {
      type: "object",
      properties: {
        archon: {
          type: "object",
          properties: {
            thesis: { type: "string" },
            builds_on: { type: "array", items: { type: "string" } },
            claim_strength: { type: "number" },
            risk: { type: "string" },
          },
          required: ["thesis", "builds_on", "claim_strength", "risk"],
        },
        scholar: {
          type: "object",
          properties: {
            thesis: { type: "string" },
            evidence_map: { type: "object", additionalProperties: { type: "string" } },
            critique: { type: "string" },
            claim_strength: { type: "number" },
          },
          required: ["thesis", "evidence_map", "critique", "claim_strength"],
        },
        kritikon: {
          type: "object",
          properties: {
            attack: { type: "array", items: { type: "string" } },
            hard_constraint: { type: "string" },
            claim_strength: { type: "number" },
          },
          required: ["attack", "hard_constraint", "claim_strength"],
        },
        integron: {
          type: "object",
          properties: {
            synthesis: { type: "string" },
            definition_v2: { type: "string" },
            kept: { type: "array", items: { type: "string" } },
            discarded: { type: "array", items: { type: "string" } },
          },
          required: ["synthesis", "definition_v2", "kept", "discarded"],
        },
        metron: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                clarity: { type: "number" },
                evidence: { type: "number" },
                coherence: { type: "number" },
                novelty: { type: "number" },
                testability: { type: "number" },
                compression: { type: "number" },
                risk: { type: "number" },
              },
              required: ["clarity", "evidence", "coherence", "novelty", "testability", "compression", "risk"],
            },
            theory_score: { type: "number" },
            diagnosis: { type: "string" },
            score_breakdown: {
              type: "array",
              description: "Beitragsanalyse pro Score-Dimension",
              items: {
                type: "object",
                properties: {
                  dimension: {
                    type: "string",
                    enum: ["clarity", "evidence", "coherence", "novelty", "testability", "compression", "risk"],
                  },
                  top_evidence: {
                    type: "array",
                    description: "evidence_map-Schlüssel die diesen Score am stärksten beeinflussten",
                    items: { type: "string" },
                  },
                  top_critiques: {
                    type: "array",
                    description: "KRITIKON-Kritikpunkte die diesen Score am stärksten beeinflussten",
                    items: { type: "string" },
                  },
                  effect: { type: "string", enum: ["positive", "negative", "mixed"] },
                  rationale: { type: "string" },
                },
                required: ["dimension", "top_evidence", "top_critiques", "effect", "rationale"],
              },
            },
          },
          required: ["scores", "theory_score", "diagnosis", "score_breakdown"],
        },
        experion: {
          type: "object",
          properties: {
            test_proposal: { type: "string" },
            prediction: { type: "string" },
            observable_metrics: { type: "array", items: { type: "string" } },
          },
          required: ["test_proposal", "prediction", "observable_metrics"],
        },
      },
      required: ["archon", "scholar", "kritikon", "integron", "metron", "experion"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, previous } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userMsg = previous
      ? `Thema: ${topic}\n\nVorherige Synthese (definition_v2): "${previous}"\n\nErzeuge die nächste Runde, die DARAUF AUFBAUT, Kritik überlebt und verdichtet.`
      : `Thema: ${topic}\n\nErzeuge Runde 1.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        tools: [ARCHON_TOOL],
        tool_choice: { type: "function", function: { name: "archon_round" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate-Limit erreicht." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits aufgebraucht." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI Gateway Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Keine strukturierte Antwort" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const round = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ round }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("archon-engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
