import { ApprenticeProfile, CohortStudent } from '../types/induction';

export interface SpreadsheetInfo {
  id: string;
  name: string;
  webViewLink: string;
  createdTime?: string;
  rowCount?: number;
  isCustomLinked?: boolean;
}

export const SPREADSHEET_TITLE = 'SENA - Registro y Seguimiento de Inducción (Acuerdo 002 de 2026)';
export const SHEET_APPRENTICES_TAB = 'Registro de Aprendices';
export const SHEET_COHORT_TAB = 'Seguimiento Ficha 2824190';

export const APPRENTICE_HEADERS = [
  'ID Aprendiz',
  'Nombre Completo',
  'Tipo Documento',
  'Número Documento',
  'Correo Electrónico',
  'Teléfono',
  'Programa de Formación',
  'Ficha',
  'Regional',
  'Centro de Formación',
  'Sede',
  'Modalidad',
  'Módulos Aprobados',
  'Progreso (%)',
  'Puntaje Evaluación Final (%)',
  'Código de Certificado',
  'Estado Inducción',
  'Fecha Registro / Certificación',
  'Puntos XP',
  'Nivel',
  'Reglamento Aplicado',
];

export const COHORT_HEADERS = [
  'ID',
  'Nombre Completo',
  'Documento',
  'Programa',
  'Ficha',
  'Progreso (%)',
  'Promedio Evaluaciones (%)',
  'Estado',
  'Código Certificado',
  'Observaciones / Tema a Reforzar',
  'Fecha Sincronización',
];

/**
 * Searches user's Google Drive for existing induction spreadsheet
 */
export async function findExistingSpreadsheet(accessToken: string): Promise<SpreadsheetInfo | null> {
  const query = encodeURIComponent(`name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime)&pageSize=5`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.warn('Error finding spreadsheet in Drive:', errorData);
    return null;
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    const file = data.files[0];
    return {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      createdTime: file.createdTime,
    };
  }

  return null;
}

/**
 * Creates a brand new Google Spreadsheet in the user's Drive with proper SENA structure and styling
 */
export async function createInductionSpreadsheet(accessToken: string): Promise<SpreadsheetInfo> {
  const requestBody = {
    properties: {
      title: SPREADSHEET_TITLE,
      locale: 'es_CO',
      autoRecalc: 'ON_CHANGE',
    },
    sheets: [
      {
        properties: {
          title: SHEET_APPRENTICES_TAB,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100,
            columnCount: APPRENTICE_HEADERS.length,
          },
        },
      },
      {
        properties: {
          title: SHEET_COHORT_TAB,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100,
            columnCount: COHORT_HEADERS.length,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(`Error al crear la hoja de cálculo en Drive: ${err?.error?.message || createRes.statusText}`);
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;

  // Populate headers in both sheets
  await populateSheetHeaders(accessToken, spreadsheetId);

  return {
    id: spreadsheetId,
    name: SPREADSHEET_TITLE,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Populates and formats header rows in both tabs
 */
async function populateSheetHeaders(accessToken: string, spreadsheetId: string) {
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

  const body = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: `'${SHEET_APPRENTICES_TAB}'!A1:U1`,
        values: [APPRENTICE_HEADERS],
      },
      {
        range: `'${SHEET_COHORT_TAB}'!A1:K1`,
        values: [COHORT_HEADERS],
      },
    ],
  };

  await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Apply styling (SENA colors: dark green header, white bold text)
  try {
    const formatUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    await fetch(formatUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.223, green: 0.662, blue: 0.0 }, // #39A900
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (formatErr) {
    console.warn('Optional formatting error ignored:', formatErr);
  }
}

/**
 * Transforms an ApprenticeProfile into spreadsheet row values
 */
export function apprenticeToRowValues(p: ApprenticeProfile): (string | number)[] {
  const isCertified = !!p.certificateCode;
  const completedCount = p.completedModuleIds.length;
  const progressPercent = Math.round((completedCount / 6) * 100);
  const examScore = p.finalExamScore !== undefined ? `${p.finalExamScore}%` : 'Pendiente';
  const certifiedDate = p.certifiedAt 
    ? new Date(p.certifiedAt).toLocaleString('es-CO')
    : new Date().toLocaleString('es-CO');

  return [
    p.id,
    p.fullName,
    p.documentType,
    p.documentNumber,
    p.email,
    p.phone || 'No registrado',
    p.programName,
    p.fichaNumber,
    p.regional,
    p.trainingCenter,
    p.headquarters,
    p.modality,
    `${completedCount} de 6 módulos`,
    `${progressPercent}%`,
    examScore,
    p.certificateCode || 'No generado',
    isCertified ? 'Certificado' : progressPercent === 0 ? 'No Iniciado' : 'En Progreso',
    certifiedDate,
    p.xp,
    p.level,
    'Acuerdo 002 de 2026 (SENA)',
  ];
}

/**
 * Transforms a CohortStudent into cohort spreadsheet row values
 */
export function cohortStudentToRowValues(s: CohortStudent): (string | number)[] {
  const now = new Date().toLocaleString('es-CO');
  return [
    s.id,
    s.fullName,
    s.document,
    s.program,
    s.ficha,
    `${s.progressPercent}%`,
    `${s.quizAverage}/100`,
    s.status,
    s.certificateId || 'Pendiente',
    s.flaggedTopic || 'Sin novedades normativas',
    now,
  ];
}

/**
 * Appends or updates a single apprentice profile in the 'Registro de Aprendices' sheet
 */
export async function syncApprenticeRecord(
  accessToken: string,
  spreadsheetId: string,
  apprentice: ApprenticeProfile
): Promise<{ updated: boolean; rowNumber: number }> {
  const rangeCheck = `'${SHEET_APPRENTICES_TAB}'!D2:D100`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeCheck)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let existingRow = -1;
  if (res.ok) {
    const data = await res.json();
    const rows = data.values || [];
    const index = rows.findIndex((row: string[]) => row[0] && row[0].toString().trim() === apprentice.documentNumber.trim());
    if (index !== -1) {
      existingRow = index + 2;
    }
  }

  const rowValues = apprenticeToRowValues(apprentice);

  if (existingRow > 0) {
    const updateRange = `'${SHEET_APPRENTICES_TAB}'!A${existingRow}:U${existingRow}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: updateRange,
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(`Error al actualizar fila en Google Sheets: ${err?.error?.message || updateRes.statusText}`);
    }

    return { updated: true, rowNumber: existingRow };
  } else {
    const appendRange = `'${SHEET_APPRENTICES_TAB}'!A:U`;
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(`Error al registrar en Google Sheets: ${err?.error?.message || appendRes.statusText}`);
    }

    const appendData = await appendRes.json();
    const updatedRange = appendData.updates?.updatedRange || '';
    return { updated: false, rowNumber: parseInt(updatedRange.match(/\d+$/)?.[0] || '2', 10) };
  }
}

/**
 * Synchronizes entire cohort and active apprentice profile to Google Sheets
 */
export async function syncEntireCohort(
  accessToken: string,
  spreadsheetId: string,
  cohort: CohortStudent[],
  activeProfile?: ApprenticeProfile
): Promise<{ totalApprentices: number; totalCohort: number }> {
  // 1. Ensure headers exist
  await populateSheetHeaders(accessToken, spreadsheetId);

  // 2. Prepare apprentice rows
  const apprenticeRows: (string | number)[][] = [];
  if (activeProfile) {
    apprenticeRows.push(apprenticeToRowValues(activeProfile));
  }

  cohort.forEach((s) => {
    if (activeProfile && s.document === activeProfile.documentNumber) return;
    apprenticeRows.push([
      s.id,
      s.fullName,
      'CC',
      s.document,
      `${s.fullName.toLowerCase().replace(/\s+/g, '.')}@misena.edu.co`,
      '3001234567',
      s.program,
      s.ficha,
      'Distrito Capital',
      'Centro de Tecnologías para la Construcción y la Madera',
      'Cazucá',
      'Presencial',
      `${Math.round((s.progressPercent / 100) * 6)} de 6 módulos`,
      `${s.progressPercent}%`,
      s.progressPercent === 100 ? `${s.quizAverage}%` : 'En proceso',
      s.certificateId || 'No generado',
      s.status,
      s.completedAt || new Date().toLocaleString('es-CO'),
      s.progressPercent * 25,
      s.progressPercent === 100 ? 5 : Math.max(1, Math.floor(s.progressPercent / 20)),
      'Acuerdo 002 de 2026 (SENA)',
    ]);
  });

  const apprenticesRange = `'${SHEET_APPRENTICES_TAB}'!A2:U${apprenticeRows.length + 1}`;
  const appRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(apprenticesRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: apprenticesRange,
        values: apprenticeRows,
      }),
    }
  );

  if (!appRes.ok) {
    const err = await appRes.json().catch(() => ({}));
    throw new Error(`Error al sincronizar aprendices en Google Sheets: ${err?.error?.message || appRes.statusText}`);
  }

  // 3. Write cohort summary rows
  const cohortRows = cohort.map(cohortStudentToRowValues);
  const cohortRange = `'${SHEET_COHORT_TAB}'!A2:K${cohortRows.length + 1}`;
  const cohortRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(cohortRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: cohortRange,
        values: cohortRows,
      }),
    }
  );

  if (!cohortRes.ok) {
    const err = await cohortRes.json().catch(() => ({}));
    throw new Error(`Error al sincronizar cohorte en Google Sheets: ${err?.error?.message || cohortRes.statusText}`);
  }

  return {
    totalApprentices: apprenticeRows.length,
    totalCohort: cohortRows.length,
  };
}

export interface SheetPermission {
  id: string;
  role: string;
  type: string;
  emailAddress?: string;
  displayName?: string;
}

/**
 * Shares the spreadsheet with a specific email address (e.g. olmopez71@gmail.com)
 */
export async function shareSpreadsheetWithEmail(
  accessToken: string,
  fileId: string,
  emailAddress: string,
  role: 'reader' | 'writer' = 'reader',
  customMessage?: string
): Promise<{ success: boolean; permissionId?: string }> {
  const queryParams = new URLSearchParams({
    sendNotificationEmail: 'true',
    supportsAllDrives: 'true',
  });
  if (customMessage && customMessage.trim()) {
    queryParams.append('emailMessage', customMessage.trim());
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?${queryParams.toString()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      type: 'user',
      emailAddress: emailAddress.trim(),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(`Error al otorgar acceso a ${emailAddress}: ${errorMsg}`);
  }

  const data = await res.json();
  return {
    success: true,
    permissionId: data.id,
  };
}

/**
 * Fetches existing permissions for the spreadsheet to display who has access
 */
export async function getSpreadsheetPermissions(
  accessToken: string,
  fileId: string
): Promise<SheetPermission[]> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?fields=permissions(id,displayName,emailAddress,role,type)&supportsAllDrives=true`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.permissions || [];
  } catch (e) {
    console.warn('Error fetching permissions:', e);
    return [];
  }
}

/**
 * Parses and extracts Google Sheet ID from any public or shared Google Drive URL
 */
export function parseCustomSpreadsheetUrl(url: string): SpreadsheetInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Match /spreadsheets/d/([a-zA-Z0-9-_]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const id = match[1];
    return {
      id,
      name: SPREADSHEET_TITLE,
      webViewLink: `https://docs.google.com/spreadsheets/d/${id}/edit`,
      isCustomLinked: true,
    };
  }

  // If user passed bare ID
  if (/^[a-zA-Z0-9-_]{25,60}$/.test(trimmed)) {
    return {
      id: trimmed,
      name: SPREADSHEET_TITLE,
      webViewLink: `https://docs.google.com/spreadsheets/d/${trimmed}/edit`,
      isCustomLinked: true,
    };
  }

  return null;
}

/**
 * Generates an export-ready CSV content formatted with UTF-8 BOM
 * that opens smoothly in Google Sheets and Excel with all Spanish accents.
 */
export function generateInductionCsv(
  cohort: CohortStudent[],
  activeProfile?: ApprenticeProfile
): string {
  const sanitize = (val: unknown) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines: string[] = [];

  // Tab 1: Registro de Aprendices
  lines.push(`### HOJA 1: ${SHEET_APPRENTICES_TAB.toUpperCase()} - ACUERDO 002 DE 2026`);
  lines.push(APPRENTICE_HEADERS.map(sanitize).join(','));

  if (activeProfile) {
    lines.push(apprenticeToRowValues(activeProfile).map(sanitize).join(','));
  }

  cohort.forEach((s) => {
    if (activeProfile && s.document === activeProfile.documentNumber) return;
    const row = [
      s.id,
      s.fullName,
      'CC',
      s.document,
      `${s.fullName.toLowerCase().replace(/\s+/g, '.')}@misena.edu.co`,
      '3001234567',
      s.program,
      s.ficha,
      'Distrito Capital',
      'Centro de Tecnologías para la Construcción y la Madera',
      'Cazucá',
      'Presencial',
      `${Math.round((s.progressPercent / 100) * 6)} de 6 módulos`,
      `${s.progressPercent}%`,
      s.progressPercent === 100 ? `${s.quizAverage}%` : 'En proceso',
      s.certificateId || 'No generado',
      s.status,
      s.completedAt || new Date().toLocaleString('es-CO'),
      s.progressPercent * 25,
      s.progressPercent === 100 ? 5 : Math.max(1, Math.floor(s.progressPercent / 20)),
      'Acuerdo 002 de 2026 (SENA)',
    ];
    lines.push(row.map(sanitize).join(','));
  });

  lines.push('');
  lines.push(`### HOJA 2: ${SHEET_COHORT_TAB.toUpperCase()}`);
  lines.push(COHORT_HEADERS.map(sanitize).join(','));

  cohort.forEach((s) => {
    lines.push(cohortStudentToRowValues(s).map(sanitize).join(','));
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Triggers a browser file download of the CSV
 */
export function downloadInductionCsvFile(
  cohort: CohortStudent[],
  activeProfile?: ApprenticeProfile,
  fileName = 'SENA_Induccion_Reglamento_Acuerdo_002_2026.csv'
) {
  const csvContent = generateInductionCsv(cohort, activeProfile);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates TSV (tab-separated) data ready for direct copy-paste into Google Sheets
 */
export function generateTabDelimitedData(
  cohort: CohortStudent[],
  activeProfile?: ApprenticeProfile
): string {
  const lines: string[] = [];
  lines.push(APPRENTICE_HEADERS.join('\t'));

  if (activeProfile) {
    lines.push(apprenticeToRowValues(activeProfile).join('\t'));
  }

  cohort.forEach((s) => {
    if (activeProfile && s.document === activeProfile.documentNumber) return;
    const row = [
      s.id,
      s.fullName,
      'CC',
      s.document,
      `${s.fullName.toLowerCase().replace(/\s+/g, '.')}@misena.edu.co`,
      '3001234567',
      s.program,
      s.ficha,
      'Distrito Capital',
      'Centro de Tecnologías para la Construcción y la Madera',
      'Cazucá',
      'Presencial',
      `${Math.round((s.progressPercent / 100) * 6)} de 6 módulos`,
      `${s.progressPercent}%`,
      s.progressPercent === 100 ? `${s.quizAverage}%` : 'En proceso',
      s.certificateId || 'No generado',
      s.status,
      s.completedAt || new Date().toLocaleString('es-CO'),
      s.progressPercent * 25,
      s.progressPercent === 100 ? 5 : Math.max(1, Math.floor(s.progressPercent / 20)),
      'Acuerdo 002 de 2026 (SENA)',
    ];
    lines.push(row.join('\t'));
  });

  return lines.join('\n');
}
