import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ═══════════════════════════════════════════════════════════════════════════
// WISSENSCHAFTSMODUS (Science Mode)
// ───────────────────────────────────────────────────────────────────────────
// Zwei Zugriffsstufen:
//   "public"  → konservative Demo-Limits, geschützt damit niemand zu Schaden
//               kommt. Standard für alle Besucher.
//   "science" → erhöhte Rechenlimits, Live-Lesedaten, voller Rohdaten-Export.
//               Nur nach verifiziertem Antrag (Identität + Forschungsnachweis).
//
// WICHTIG: Der Modus hebt NUR Rechen-/Export-/Datenlimits an. Er aktiviert
// KEINE automatisierte Kompromittierung echter, gefüllter Wallets. Diese
// ethische Grenze ist unabhängig von der Zugriffsstufe und fest verdrahtet.
// ═══════════════════════════════════════════════════════════════════════════

export type AccessTier = "public" | "science";

export interface ScienceLimits {
  /** Max. Iterationen für Solver (Pollard, BSGS, LLL ...) */
  maxIterations: number;
  /** Max. Bit-Breite für ECDLP-Solver-Demos */
  maxBits: number;
  /** Max. Batch-Größe für Brain-Wallet / Adress-Ableitung */
  maxBatch: number;
  /** Live-API-Abfragen erlaubt (Blockstream/Mempool read-only) */
  liveData: boolean;
  /** Voller Rohdaten-Export (JSON/CSV ungekürzt) */
  fullExport: boolean;
  /** Pro-Module sichtbar */
  proModules: boolean;
}

export const PUBLIC_LIMITS: ScienceLimits = {
  maxIterations: 50_000,
  maxBits: 24,
  maxBatch: 10,
  liveData: false,
  fullExport: false,
  proModules: false,
};

export const SCIENCE_LIMITS: ScienceLimits = {
  maxIterations: 50_000_000,
  maxBits: 48,
  maxBatch: 500,
  liveData: true,
  fullExport: true,
  proModules: true,
};

export interface ResearcherApplication {
  fullName: string;
  institution: string;
  /** ORCID, Hochschul-/Forschungsausweis-Nr. o.ä. */
  credentialId: string;
  /** Verifizierbares Profil/URL (ORCID, Uni-Seite, Scholar ...) */
  credentialUrl: string;
  researchPurpose: string;
  /** Identitäts-Offenlegung akzeptiert */
  identityDisclosed: boolean;
  /** Ethik-Erklärung akzeptiert */
  ethicsAccepted: boolean;
  submittedAt: string;
}

interface ScienceModeState {
  tier: AccessTier;
  application: ResearcherApplication | null;
  /** Nur lokaler Test-Schalter (vor echtem Backend-Login) */
  testUnlock: boolean;
}

interface ScienceModeContextValue extends ScienceModeState {
  limits: ScienceLimits;
  isScientist: boolean;
  submitApplication: (app: Omit<ResearcherApplication, "submittedAt">) => void;
  revokeAccess: () => void;
  setTestUnlock: (v: boolean) => void;
}

const STORAGE_KEY = "nexus-science-mode";

const ScienceModeContext = createContext<ScienceModeContextValue | null>(null);

function loadState(): ScienceModeState {
  if (typeof window === "undefined") {
    return { tier: "public", application: null, testUnlock: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tier: "public", application: null, testUnlock: false };
    const parsed = JSON.parse(raw) as Partial<ScienceModeState>;
    return {
      tier: parsed.tier === "science" ? "science" : "public",
      application: parsed.application ?? null,
      testUnlock: !!parsed.testUnlock,
    };
  } catch {
    return { tier: "public", application: null, testUnlock: false };
  }
}

export function ScienceModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScienceModeState>(loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const submitApplication = useCallback(
    (app: Omit<ResearcherApplication, "submittedAt">) => {
      setState((prev) => ({
        ...prev,
        application: { ...app, submittedAt: new Date().toISOString() },
        // Vor echtem Backend: verifizierter Antrag schaltet den Modus frei.
        tier: "science",
      }));
    },
    []
  );

  const revokeAccess = useCallback(() => {
    setState({ tier: "public", application: null, testUnlock: false });
  }, []);

  const setTestUnlock = useCallback((v: boolean) => {
    setState((prev) => ({
      ...prev,
      testUnlock: v,
      tier: v ? "science" : prev.application ? "science" : "public",
    }));
  }, []);

  const isScientist = state.tier === "science";
  const limits = isScientist ? SCIENCE_LIMITS : PUBLIC_LIMITS;

  return (
    <ScienceModeContext.Provider
      value={{
        ...state,
        limits,
        isScientist,
        submitApplication,
        revokeAccess,
        setTestUnlock,
      }}
    >
      {children}
    </ScienceModeContext.Provider>
  );
}

export function useScienceMode(): ScienceModeContextValue {
  const ctx = useContext(ScienceModeContext);
  if (!ctx) {
    throw new Error("useScienceMode must be used within a ScienceModeProvider");
  }
  return ctx;
}
