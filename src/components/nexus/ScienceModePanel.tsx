import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  FlaskConical,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Microscope,
  Database,
  Download,
  Cpu,
  Fingerprint,
} from "lucide-react";
import {
  useScienceMode,
  PUBLIC_LIMITS,
  SCIENCE_LIMITS,
} from "@/contexts/ScienceModeContext";

interface Props {
  onLog?: (message: string) => void;
}

function fmt(n: number): string {
  return n.toLocaleString("de-DE");
}

export default function ScienceModePanel({ onLog }: Props) {
  const { toast } = useToast();
  const {
    isScientist,
    application,
    testUnlock,
    setTestUnlock,
    submitApplication,
    revokeAccess,
  } = useScienceMode();

  const [fullName, setFullName] = useState(application?.fullName ?? "");
  const [institution, setInstitution] = useState(application?.institution ?? "");
  const [credentialId, setCredentialId] = useState(application?.credentialId ?? "");
  const [credentialUrl, setCredentialUrl] = useState(application?.credentialUrl ?? "");
  const [researchPurpose, setResearchPurpose] = useState(application?.researchPurpose ?? "");
  const [identityDisclosed, setIdentityDisclosed] = useState(false);
  const [ethicsAccepted, setEthicsAccepted] = useState(false);

  const canSubmit =
    fullName.trim().length > 1 &&
    institution.trim().length > 1 &&
    credentialId.trim().length > 1 &&
    credentialUrl.trim().length > 3 &&
    researchPurpose.trim().length > 20 &&
    identityDisclosed &&
    ethicsAccepted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    submitApplication({
      fullName: fullName.trim(),
      institution: institution.trim(),
      credentialId: credentialId.trim(),
      credentialUrl: credentialUrl.trim(),
      researchPurpose: researchPurpose.trim(),
      identityDisclosed,
      ethicsAccepted,
    });
    onLog?.(`[WISSENSCHAFT] Antrag verifiziert: ${fullName.trim()} (${institution.trim()})`);
    toast({
      title: "Wissenschaftsmodus aktiviert",
      description: "Erhöhte Rechenlimits, Live-Daten und voller Export freigeschaltet.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Status-Header */}
      <Card className={isScientist ? "border-secondary/40 bg-card/80" : "border-primary/30 bg-card/80"}>
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <FlaskConical className={`w-4 h-4 ${isScientist ? "text-secondary" : "text-primary"}`} />
            <span className="text-primary">[</span>WISSENSCHAFTSMODUS<span className="text-primary">]</span>
            <Badge
              variant="outline"
              className={`ml-auto text-[10px] ${
                isScientist
                  ? "bg-secondary/10 text-secondary border-secondary/40"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isScientist ? (
                <><Unlock className="w-3 h-3 mr-1" /> AKTIV · Wissenschaftler</>
              ) : (
                <><Lock className="w-3 h-3 mr-1" /> Öffentlich · Demo-Limits</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
            Verifizierte Forscher:innen erhalten erhöhte Rechenlimits, Live-Lesedaten und
            ungekürzten Rohdaten-Export, um echte Berechnungen statt nur Demo-Werte
            durchzuführen. Alle anderen nutzen sichere Demo-Limits.
          </p>

          {/* Limits-Vergleich */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <LimitRow icon={Cpu} label="Solver-Iterationen" pub={fmt(PUBLIC_LIMITS.maxIterations)} sci={fmt(SCIENCE_LIMITS.maxIterations)} active={isScientist} />
            <LimitRow icon={Microscope} label="ECDLP Bit-Breite" pub={`${PUBLIC_LIMITS.maxBits} bit`} sci={`${SCIENCE_LIMITS.maxBits} bit`} active={isScientist} />
            <LimitRow icon={Database} label="Live-Blockchain-Daten" pub={PUBLIC_LIMITS.liveData ? "ja" : "nein"} sci={SCIENCE_LIMITS.liveData ? "ja" : "nein"} active={isScientist} />
            <LimitRow icon={Download} label="Voller Rohdaten-Export" pub={PUBLIC_LIMITS.fullExport ? "ja" : "nein"} sci={SCIENCE_LIMITS.fullExport ? "ja" : "nein"} active={isScientist} />
          </div>
        </CardContent>
      </Card>

      {/* Ethik-Grenze */}
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="pt-4">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
              <span className="text-destructive font-semibold">Feste ethische Grenze:</span> Der
              Wissenschaftsmodus hebt ausschließlich Rechen-, Daten- und Exportlimits an. Er aktiviert
              <span className="text-destructive"> niemals</span> die automatisierte Kompromittierung
              echter, gefüllter Wallets oder unautorisierte Schlüsselwiederherstellung — unabhängig von
              der Verifizierung. Nur Bildungs- und Forschungszwecke.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test-Schalter (vor echtem Backend-Login) */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-foreground flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5 text-amber-400" /> Test-Freischaltung (lokal)
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">
                Nur zum Testen vor Veröffentlichung — schaltet ohne Anmeldung frei. Wird beim echten
                Login durch verifizierte Anträge ersetzt.
              </p>
            </div>
            <Switch checked={testUnlock} onCheckedChange={setTestUnlock} aria-label="Test-Freischaltung" />
          </div>
        </CardContent>
      </Card>

      {/* Antrag oder aktiver Zugang */}
      {isScientist && application ? (
        <Card className="border-secondary/40 bg-card/80">
          <CardHeader>
            <CardTitle className="text-xs font-mono flex items-center gap-2 text-secondary">
              <ShieldCheck className="w-4 h-4" /> Verifizierter Zugang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-[11px] font-mono">
            <p><span className="text-muted-foreground">Name:</span> {application.fullName}</p>
            <p><span className="text-muted-foreground">Institution:</span> {application.institution}</p>
            <p><span className="text-muted-foreground">Nachweis:</span> {application.credentialId}</p>
            <p className="truncate"><span className="text-muted-foreground">Profil:</span> {application.credentialUrl}</p>
            <p className="text-muted-foreground/70 text-[10px] pt-1">
              Freigeschaltet: {new Date(application.submittedAt).toLocaleString("de-DE")}
            </p>
            <Button variant="outline" size="sm" className="mt-2 text-[10px]" onClick={() => { revokeAccess(); onLog?.("[WISSENSCHAFT] Zugang widerrufen"); }}>
              Zugang widerrufen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/30 bg-card/80">
          <CardHeader>
            <CardTitle className="text-xs font-mono flex items-center gap-2 text-primary">
              <Fingerprint className="w-4 h-4" /> Antrag mit Identitäts-Nachweis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Vollständiger Name" value={fullName} onChange={setFullName} placeholder="Dr. Erika Mustermann" />
            <Field label="Institution / Organisation" value={institution} onChange={setInstitution} placeholder="TU München, Lehrstuhl Kryptographie" />
            <Field label="Nachweis-ID (ORCID / Ausweis-Nr.)" value={credentialId} onChange={setCredentialId} placeholder="0000-0002-1825-0097" />
            <Field label="Verifizierbares Profil (URL)" value={credentialUrl} onChange={setCredentialUrl} placeholder="https://orcid.org/0000-0002-1825-0097" />
            <div className="space-y-1">
              <Label className="text-[11px] font-mono text-muted-foreground">Forschungszweck (min. 20 Zeichen)</Label>
              <Textarea
                value={researchPurpose}
                onChange={(e) => setResearchPurpose(e.target.value)}
                placeholder="Beschreibe konkret, woran du arbeitest und warum du erhöhte Limits benötigst."
                className="font-mono text-xs min-h-[80px]"
              />
            </div>

            <label className="flex items-start gap-2 text-[10px] font-mono text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={identityDisclosed} onChange={(e) => setIdentityDisclosed(e.target.checked)} className="mt-0.5" />
              Ich lege meine Identität offen und bestätige, dass die Angaben verifizierbar und wahr sind.
            </label>
            <label className="flex items-start gap-2 text-[10px] font-mono text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={ethicsAccepted} onChange={(e) => setEthicsAccepted(e.target.checked)} className="mt-0.5" />
              Ich nutze die Werkzeuge ausschließlich für legitime Forschung/Bildung und nicht zum Schaden Dritter.
            </label>

            <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full font-mono text-xs">
              <ShieldCheck className="w-4 h-4 mr-1" /> Antrag einreichen & verifizieren
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-mono text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="font-mono text-xs" />
    </div>
  );
}

function LimitRow({ icon: Icon, label, pub, sci, active }: { icon: typeof Cpu; label: string; pub: string; sci: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5 rounded border border-border/40 bg-background/40 px-2 py-1.5">
      <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground truncate">{label}</p>
        <p className={active ? "text-secondary" : "text-foreground"}>
          {active ? sci : pub}
        </p>
      </div>
    </div>
  );
}
