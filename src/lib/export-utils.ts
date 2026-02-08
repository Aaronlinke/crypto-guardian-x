// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT UTILITIES - Download & Export Funktionen
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExportOptions {
  filename: string;
  format?: 'json' | 'csv' | 'txt' | 'md';
  timestamp?: boolean;
}

/**
 * Generiert einen Timestamp-String für Dateinamen
 */
export function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Erstellt einen Download-Blob und triggert den Browser-Download
 */
export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exportiert Daten als JSON
 */
export function exportAsJSON<T>(data: T, options: ExportOptions): void {
  const filename = options.timestamp 
    ? `${options.filename}-${getTimestamp()}.json` 
    : `${options.filename}.json`;
  
  const jsonContent = JSON.stringify(data, null, 2);
  downloadBlob(jsonContent, filename, 'application/json');
}

/**
 * Exportiert Daten als CSV
 */
export function exportAsCSV(data: Record<string, unknown>[], options: ExportOptions): void {
  if (data.length === 0) return;
  
  const filename = options.timestamp 
    ? `${options.filename}-${getTimestamp()}.csv` 
    : `${options.filename}.csv`;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = String(value ?? '');
        // Escape quotes and wrap in quotes if contains comma
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  
  downloadBlob(csvRows.join('\n'), filename, 'text/csv');
}

/**
 * Exportiert als Markdown
 */
export function exportAsMarkdown(content: string, options: ExportOptions): void {
  const filename = options.timestamp 
    ? `${options.filename}-${getTimestamp()}.md` 
    : `${options.filename}.md`;
  
  downloadBlob(content, filename, 'text/markdown');
}

/**
 * Exportiert als Plain Text
 */
export function exportAsText(content: string, options: ExportOptions): void {
  const filename = options.timestamp 
    ? `${options.filename}-${getTimestamp()}.txt` 
    : `${options.filename}.txt`;
  
  downloadBlob(content, filename, 'text/plain');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEZIFISCHE EXPORT-FUNKTIONEN FÜR NEXUS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Exportiert historische Angriffs-Datenbank
 */
export function exportHistoricalAttacks(attacks: HistoricalAttackExport[]): void {
  const exportData = {
    _meta: {
      source: 'NEXUS v3.0 - Cryptographic Intelligence Console',
      exportDate: new Date().toISOString(),
      disclaimer: 'NUR FÜR BILDUNGSZWECKE - Jeder ist für sein eigenes Handeln selbst verantwortlich',
      totalAttacks: attacks.length,
    },
    attacks: attacks.map(a => ({
      ...a,
      exportedAt: new Date().toISOString()
    }))
  };
  
  exportAsJSON(exportData, { filename: 'nexus-historical-attacks', timestamp: true });
}

/**
 * Exportiert Signatur-Scan Ergebnisse
 */
export function exportScanResults(results: ScanResultExport[], signatures: SignatureExport[]): void {
  const exportData = {
    _meta: {
      source: 'NEXUS v3.0 - Signature Scanner',
      exportDate: new Date().toISOString(),
      disclaimer: 'NUR FÜR BILDUNGSZWECKE',
      totalSignatures: signatures.length,
      totalVulnerabilities: results.length,
    },
    signatures,
    vulnerabilities: results
  };
  
  exportAsJSON(exportData, { filename: 'nexus-scan-results', timestamp: true });
}

/**
 * Exportiert Entropie-Analyse
 */
export function exportEntropyAnalysis(
  input: string, 
  score: number | null, 
  breakdown: EntropyBreakdownExport[]
): void {
  const exportData = {
    _meta: {
      source: 'NEXUS v3.0 - Entropy Analyzer',
      exportDate: new Date().toISOString(),
    },
    analysis: {
      inputHex: input,
      inputLength: input.replace(/\s/g, '').length / 2,
      effectiveBits: score,
      quality: score === null ? 'not analyzed' : 
        score > 200 ? 'cryptographically secure' :
        score > 100 ? 'limited security' : 'INSECURE',
      breakdown
    }
  };
  
  exportAsJSON(exportData, { filename: 'nexus-entropy-analysis', timestamp: true });
}

/**
 * Exportiert Attack Graph Simulation
 */
export function exportAttackSimulation(
  path: string[],
  systemEntropy: number,
  compromiseLevel: number,
  logs: string[]
): void {
  const exportData = {
    _meta: {
      source: 'NEXUS v3.0 - Attack Surface Simulation',
      exportDate: new Date().toISOString(),
    },
    simulation: {
      attackPath: path,
      finalSystemEntropy: systemEntropy,
      compromiseLevel: `${compromiseLevel}%`,
      logs: logs.slice(-100) // Letzte 100 Log-Einträge
    }
  };
  
  exportAsJSON(exportData, { filename: 'nexus-attack-simulation', timestamp: true });
}

/**
 * Generiert Markdown Report für historische Angriffe
 */
export function exportHistoricalAttacksMarkdown(attacks: HistoricalAttackExport[]): void {
  const lines = [
    '# NEXUS v3.0 - Historische Kryptographische Angriffe',
    '',
    `> Exportiert: ${new Date().toLocaleString('de-DE')}`,
    '',
    '## ⚠️ WARNUNG',
    '',
    'Diese Dokumentation dient ausschließlich der wissenschaftlichen Forschung und Bildung.',
    'Jeder ist für sein eigenes Handeln selbst verantwortlich. Missbrauch ist strafbar.',
    '',
    '---',
    '',
    `## Übersicht (${attacks.length} Angriffe)`,
    '',
  ];
  
  // Gruppiere nach Typ
  const byType = attacks.reduce((acc, attack) => {
    if (!acc[attack.type]) acc[attack.type] = [];
    acc[attack.type].push(attack);
    return acc;
  }, {} as Record<string, HistoricalAttackExport[]>);
  
  for (const [type, typeAttacks] of Object.entries(byType)) {
    lines.push(`### ${type} (${typeAttacks.length})`);
    lines.push('');
    
    for (const attack of typeAttacks) {
      lines.push(`#### ${attack.name} (${attack.year})`);
      lines.push('');
      lines.push(`**Kategorie:** ${attack.category} | **Komplexität:** ${attack.exploitComplexity}`);
      if (attack.cve) lines.push(`**CVE:** ${attack.cve}`);
      lines.push('');
      lines.push(attack.description);
      lines.push('');
      lines.push('**Technische Details:**');
      lines.push(`> ${attack.technicalDetails}`);
      lines.push('');
      lines.push('**Formel:**');
      lines.push('```');
      lines.push(attack.formula);
      lines.push('```');
      lines.push('');
      lines.push(`**Betroffen:** ${attack.affected}`);
      lines.push(`**Entropie-Verlust:** -${attack.entropy_loss} bits`);
      if (attack.financialImpact) lines.push(`**Finanzieller Schaden:** ${attack.financialImpact}`);
      lines.push('');
      lines.push(`**Lektion:** ${attack.lesson}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }
  
  lines.push('');
  lines.push('---');
  lines.push(`*NEXUS v3.0 - Cryptographic Intelligence Console*`);
  
  exportAsMarkdown(lines.join('\n'), { filename: 'nexus-historical-attacks-report', timestamp: true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS FÜR NEXUS
// ═══════════════════════════════════════════════════════════════════════════════

export interface HistoricalAttackExport {
  id: string;
  name: string;
  year: number;
  type: string;
  category: string;
  description: string;
  technicalDetails: string;
  formula: string;
  entropy_loss: number;
  affected: string;
  financialImpact?: string;
  cve?: string;
  lesson: string;
  references: string[];
  exploitComplexity: string;
  patchStatus: string;
}

export interface ScanResultExport {
  type: string;
  severity: string;
  message: string;
  formula?: string;
  recoveredKey?: string;
}

export interface SignatureExport {
  id: string;
  r: string;
  s: string;
  z: string;
  timestamp: number;
}

export interface EntropyBreakdownExport {
  name: string;
  bits: number;
  quality: string;
  source: string;
}
