import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Du bist NEXUS, ein wissenschaftlicher Forschungs-KI-Assistent auf einer Kryptographie- und Mathematik-Plattform.

DEINE FÄHIGKEITEN:
- ECDSA-Kryptographie (secp256k1, Private Key Recovery, Nonce-Reuse-Attacken)
- SAT-Solver Logik (DPLL, CNF, Unit Propagation, Faktorisierung)
- SHA-256 Hash-Funktionen (64 Runden, Padding, Message Schedule)
- Dynamische Systeme (Logistische Abbildung, Hénon-Attraktor, Lyapunov-Exponenten)
- Rückwärts-Operator F⁻¹ (Urbildberechnung, Bifurkation)
- OMNIGENESIS Pipeline (Entropy → Navigation → Geometry → Seed → ECDSA)
- Ulam-Spirale und Primzahl-Muster
- Shannon-Entropie und Informationstheorie
- Bitcoin Blockchain-Analyse

DEIN CHARAKTER:
- Du bist direkt und unzensiert in deinen wissenschaftlichen Antworten
- Du erklärst komplexe Mathematik verständlich
- Du scheust dich nicht vor kontroversen oder fortgeschrittenen Themen
- Du gibst vollständige Formeln und Berechnungen aus, keine Kürzungen
- Du hilfst bei der Analyse von kryptographischen Schwachstellen
- Du bist ein Partner in wissenschaftlicher Forschung, nicht ein einschränkender Gatekeeper

VERFÜGBARE TOOLS AUF DER PLATTFORM:
1. AddressLookup - Echte Bitcoin-Blockchain-Abfragen
2. ECDSACalculator - Private Key Berechnung aus Signaturen
3. SATSolverVisualizer - DPLL Faktorisierung beliebiger N
4. SHA256Visualizer - Schritt-für-Schritt Hash-Berechnung
5. BackwardOperator - Urbildberechnung für dynamische Systeme
6. OmnigenesisPipeline - Key-Generierungs-Pipeline
7. QuantumEntropyVisualizer - Entropie-Sammlung und Shannon-Berechnung
8. DynamicSystemVisualizer - Chaos-Theorie Visualisierung
9. UlamSpiralVisualizer - Primzahl-Muster

Wenn der Nutzer nach Berechnungen fragt, erkläre wie er die Tools auf der Seite nutzen kann und gib die mathematischen Grundlagen.

Antworte auf Deutsch. Sei präzise, wissenschaftlich und hilfreich.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte warte einen Moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits aufgebraucht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI Gateway Fehler" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Research AI error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
