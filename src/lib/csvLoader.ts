import type {
  RegulatoryPenalty,
  AuditAccountability,
  OperationalRiskEvent,
  RCSADefectDetail,
} from '../types';

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    rows.push(row);
  }

  return rows;
}

export async function loadCSV(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const text = await res.text();
  return parseCSV(text);
}

export function toRegulatoryPenalties(rows: Record<string, string>[]): RegulatoryPenalty[] {
  return rows.map(r => ({
    documentNo: r.documentNo,
    noticeDate: r.noticeDate,
    issuer: r.issuer,
    target: r.target,
    reason: r.reason,
    amount: Number(r.amount) || 0,
  }));
}

export function toAuditAccountabilities(rows: Record<string, string>[]): AuditAccountability[] {
  return rows.map(r => ({
    eventCode: r.eventCode,
    eventName: r.eventName,
    description: r.description,
    eventDate: r.eventDate,
    lossAmount: Number(r.lossAmount) || 0,
    warningLevel: r.warningLevel,
    accountablePerson: r.accountablePerson,
  }));
}

export function toOperationalRiskEvents(rows: Record<string, string>[]): OperationalRiskEvent[] {
  return rows.map(r => ({
    eventCode: r.eventCode,
    eventName: r.eventName,
    description: r.description,
    eventDate: r.eventDate,
    lossAmount: Number(r.lossAmount) || 0,
    recoveryAmount: Number(r.recoveryAmount) || 0,
    finalLossAmount: Number(r.finalLossAmount) || 0,
    eventLevel: r.eventLevel,
    department: r.department,
  }));
}

export function toRCSADefects(rows: Record<string, string>[]): RCSADefectDetail[] {
  return rows.map(r => ({
    defectCode: r.defectCode,
    defectName: r.defectName,
    description: r.description,
    defectLevel: r.defectLevel,
    defectType: r.defectType,
    isRectified: r.isRectified === 'true',
    rectificationPlan: r.rectificationPlan,
    rectificationStatus: r.rectificationStatus,
  }));
}
