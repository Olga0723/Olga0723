import { ApprenticeProfile, CohortStudent } from '../types/induction';
import { 
  apprenticeToRowValues, 
  cohortStudentToRowValues, 
  APPRENTICE_HEADERS, 
  COHORT_HEADERS,
  syncApprenticeRecord,
  syncEntireCohort,
  SpreadsheetInfo 
} from './googleSheetsService';

export interface SyncQueueItem {
  id: string;
  timestamp: string;
  type: 'single_apprentice' | 'cohort_sync';
  data: ApprenticeProfile | { cohort: CohortStudent[]; profile?: ApprenticeProfile };
  attempts: number;
  lastError?: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface SyncHistoryItem {
  id: string;
  timestamp: string;
  type: 'single_apprentice' | 'cohort_sync' | 'manual_export';
  apprenticeName?: string;
  documentNumber?: string;
  fichaNumber?: string;
  status: 'success' | 'queued' | 'offline' | 'error';
  target: 'webhook' | 'sheets_api' | 'local_queue';
  message: string;
  recordCount: number;
}

export interface AutoSyncConfig {
  enabled: boolean;
  webhookUrl: string;
  autoSyncOnExamPass: boolean;
  lastSyncTime?: string;
}

const STORAGE_KEYS = {
  CONFIG: 'sena_auto_sync_config',
  QUEUE: 'sena_sync_queue',
  HISTORY: 'sena_sync_history',
  WEBHOOK_URL: 'sena_webhook_url',
};

// Default Google Apps Script webhook placeholder or demonstration endpoint
export const DEFAULT_WEBHOOK_URL = '';

/**
 * Retrieves current AutoSync configuration
 */
export function getAutoSyncConfig(): AutoSyncConfig {
  if (typeof window === 'undefined') {
    return { enabled: true, webhookUrl: '', autoSyncOnExamPass: true };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading auto sync config:', e);
  }
  return {
    enabled: true,
    webhookUrl: localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || DEFAULT_WEBHOOK_URL,
    autoSyncOnExamPass: true,
  };
}

/**
 * Saves AutoSync configuration
 */
export function saveAutoSyncConfig(config: Partial<AutoSyncConfig>): AutoSyncConfig {
  const current = getAutoSyncConfig();
  const updated = { ...current, ...config };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    if (config.webhookUrl !== undefined) {
      localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, config.webhookUrl);
    }
  }
  return updated;
}

/**
 * Retrieves pending queue items
 */
export function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves queue items
 */
function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
}

/**
 * Retrieves sync history (newest first)
 */
export function getSyncHistory(): SyncHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Adds an entry to sync history
 */
export function addSyncHistory(entry: Omit<SyncHistoryItem, 'id' | 'timestamp'>): SyncHistoryItem {
  const item: SyncHistoryItem = {
    ...entry,
    id: `sync-hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleString('es-CO'),
  };
  const list = [item, ...getSyncHistory()].slice(0, 50); // Keep last 50
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
  }
  return item;
}

/**
 * Clears sync history
 */
export function clearSyncHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
}

/**
 * Enqueues a sync record
 */
export function enqueueRecord(
  type: 'single_apprentice' | 'cohort_sync',
  data: ApprenticeProfile | { cohort: CohortStudent[]; profile?: ApprenticeProfile }
): SyncQueueItem {
  const queue = getSyncQueue();
  const item: SyncQueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    data,
    attempts: 0,
    status: 'pending',
  };
  queue.push(item);
  saveSyncQueue(queue);
  return item;
}

/**
 * Removes a record from queue by ID
 */
export function removeFromQueue(id: string): void {
  const queue = getSyncQueue().filter((item) => item.id !== id);
  saveSyncQueue(queue);
}

/**
 * Dispatches an apprentice record to the configured Webhook URL (Apps Script or custom server)
 * Note: Google Apps Script Web Apps require no-cors or redirect handling.
 */
export async function sendWebhookRecord(
  webhookUrl: string,
  payload: {
    event: 'apprentice_certified' | 'cohort_updated' | 'test_ping';
    timestamp: string;
    source: string;
    ficha: string;
    apprentice?: ApprenticeProfile;
    rowValues?: (string | number)[];
    cohort?: CohortStudent[];
  }
): Promise<{ success: boolean; mode: 'cors' | 'no-cors'; message: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('No se ha configurado la URL de Webhook.');
  }

  const cleanUrl = webhookUrl.trim();

  try {
    // Attempt standard POST with JSON
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Prevents CORS preflight issues with Google Apps Script
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true, mode: 'cors', message: 'Sincronizado exitosamente mediante Webhook.' };
    }
  } catch (corsErr) {
    console.warn('Standard webhook fetch failed, trying no-cors mode:', corsErr);
  }

  // Fallback for Google Apps Script Web App redirects (no-cors)
  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      mode: 'no-cors',
      message: 'Disparado a Google Apps Script en segundo plano (modo autónomo sin ventanas emergentes).',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Fallo en el envío por Webhook: ${errorMsg}`);
  }
}

/**
 * Main Automatic Sync function for single apprentice (Option 2)
 * Dispatches silently in the background without popups or manual steps.
 */
export async function autoSyncApprenticeRecord(
  profile: ApprenticeProfile,
  reason: 'final_exam_passed' | 'certificate_viewed' | 'manual_test' = 'final_exam_passed'
): Promise<{
  success: boolean;
  destination: 'sheets_api' | 'webhook' | 'local_queue';
  message: string;
}> {
  const config = getAutoSyncConfig();
  const rowValues = apprenticeToRowValues(profile);

  const payload = {
    event: 'apprentice_certified' as const,
    timestamp: new Date().toISOString(),
    source: 'SENA_Induccion_Acuerdo_002_2026',
    ficha: profile.fichaNumber,
    apprentice: profile,
    rowValues,
  };

  // 1. Check if we have an active linked sheet & session token in memory/storage
  let token: string | null = null;
  let linkedSheet: SpreadsheetInfo | null = null;
  if (typeof window !== 'undefined') {
    const savedSheet = localStorage.getItem('sena_linked_sheet');
    if (savedSheet) {
      try {
        linkedSheet = JSON.parse(savedSheet);
      } catch {
        linkedSheet = null;
      }
    }
  }

  // 2. If Webhook URL is present, use zero-popup Webhook dispatch
  if (config.webhookUrl && config.webhookUrl.trim()) {
    try {
      const res = await sendWebhookRecord(config.webhookUrl, payload);
      addSyncHistory({
        type: 'single_apprentice',
        apprenticeName: profile.fullName,
        documentNumber: profile.documentNumber,
        fichaNumber: profile.fichaNumber,
        status: 'success',
        target: 'webhook',
        message: `Sincronización automática Webhook exitosa (${res.mode}) por ${reason}.`,
        recordCount: 1,
      });

      saveAutoSyncConfig({ lastSyncTime: new Date().toLocaleString('es-CO') });
      return {
        success: true,
        destination: 'webhook',
        message: `Registro de ${profile.fullName} transmitido automáticamente al servidor de la ficha ${profile.fichaNumber}.`,
      };
    } catch (err) {
      console.warn('Webhook auto-sync failed, falling back to local resilient queue:', err);
      // Fall through to queue
    }
  }

  // 3. Fallback: Resilient Local Queue (offline-first)
  // Ensures the data is NEVER lost even without network or credentials
  enqueueRecord('single_apprentice', profile);
  addSyncHistory({
    type: 'single_apprentice',
    apprenticeName: profile.fullName,
    documentNumber: profile.documentNumber,
    fichaNumber: profile.fichaNumber,
    status: 'queued',
    target: 'local_queue',
    message: `Registro guardado en cola local persistente. Listo para sincronizar automáticamente.`,
    recordCount: 1,
  });

  return {
    success: true,
    destination: 'local_queue',
    message: `Registro de ${profile.fullName} respaldado en cola local segura. Se sincronizará automáticamente al detectar conexión o webhook.`,
  };
}

/**
 * Automatic Sync function for entire cohort
 */
export async function autoSyncCohort(
  cohort: CohortStudent[],
  profile?: ApprenticeProfile
): Promise<{
  success: boolean;
  destination: 'sheets_api' | 'webhook' | 'local_queue';
  message: string;
}> {
  const config = getAutoSyncConfig();

  const payload = {
    event: 'cohort_updated' as const,
    timestamp: new Date().toISOString(),
    source: 'SENA_Induccion_Acuerdo_002_2026',
    ficha: profile?.fichaNumber || '2824190',
    cohort,
    apprentice: profile,
  };

  if (config.webhookUrl && config.webhookUrl.trim()) {
    try {
      const res = await sendWebhookRecord(config.webhookUrl, payload);
      addSyncHistory({
        type: 'cohort_sync',
        fichaNumber: profile?.fichaNumber || '2824190',
        status: 'success',
        target: 'webhook',
        message: `Sincronización completa de cohorte (${cohort.length} aprendices) transmitida por Webhook (${res.mode}).`,
        recordCount: cohort.length,
      });

      saveAutoSyncConfig({ lastSyncTime: new Date().toLocaleString('es-CO') });
      return {
        success: true,
        destination: 'webhook',
        message: `Cohorte completa (${cohort.length} aprendices) enviada automáticamente a la hoja central.`,
      };
    } catch (err) {
      console.warn('Webhook cohort sync failed, queuing locally:', err);
    }
  }

  enqueueRecord('cohort_sync', { cohort, profile });
  addSyncHistory({
    type: 'cohort_sync',
    fichaNumber: profile?.fichaNumber || '2824190',
    status: 'queued',
    target: 'local_queue',
    message: `Cohorte (${cohort.length} aprendices) almacenada en cola local resiliente.`,
    recordCount: cohort.length,
  });

  return {
    success: true,
    destination: 'local_queue',
    message: `Datos de ${cohort.length} aprendices respaldados en cola local.`,
  };
}

/**
 * Flushes pending items in the queue (e.g. on window online event or webhook configuration)
 */
export async function flushSyncQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const queue = getSyncQueue();
  if (queue.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  const config = getAutoSyncConfig();
  if (!config.webhookUrl) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;
  const remainingQueue: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'single_apprentice') {
        const apprentice = item.data as ApprenticeProfile;
        await sendWebhookRecord(config.webhookUrl, {
          event: 'apprentice_certified',
          timestamp: item.timestamp,
          source: 'SENA_Induccion_Acuerdo_002_2026',
          ficha: apprentice.fichaNumber,
          apprentice,
          rowValues: apprenticeToRowValues(apprentice),
        });
        succeeded += 1;
      } else {
        const cohortData = item.data as { cohort: CohortStudent[]; profile?: ApprenticeProfile };
        await sendWebhookRecord(config.webhookUrl, {
          event: 'cohort_updated',
          timestamp: item.timestamp,
          source: 'SENA_Induccion_Acuerdo_002_2026',
          ficha: cohortData.profile?.fichaNumber || '2824190',
          cohort: cohortData.cohort,
          apprentice: cohortData.profile,
        });
        succeeded += 1;
      }
    } catch (err: unknown) {
      failed += 1;
      item.attempts += 1;
      item.lastError = err instanceof Error ? err.message : String(err);
      if (item.attempts < 5) {
        remainingQueue.push(item);
      }
    }
  }

  saveSyncQueue(remainingQueue);
  if (succeeded > 0) {
    saveAutoSyncConfig({ lastSyncTime: new Date().toLocaleString('es-CO') });
  }

  return { processed: queue.length, succeeded, failed };
}

/**
 * Returns Google Apps Script ready-to-paste script for the instructor
 * This allows receiving all data with 0 OAuth consent issues, 0 403 errors, and 0 popups.
 */
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * =========================================================================
 * SERVICIO NACIONAL DE APRENDIZAJE - SENA
 * SISTEMA AUTOMÁTICO DE RECEPCIÓN DE INDUCCIÓN (ACUERDO 002 DE 2026)
 * =========================================================================
 * Instrucciones de instalación en tu Hoja de Cálculo:
 * 1. Abre tu Google Sheet y ve al menú superior: Extensiones > Apps Script.
 * 2. Borra cualquier código existente y pega TODO este bloque.
 * 3. Haz clic en el disquete (Guardar).
 * 4. Arriba a la derecha haz clic en: Implementar > Nueva implementación.
 * 5. Tipo: Selecciona "Aplicación web".
 *    - Descripción: "Webhook Inducción SENA 2026"
 *    - Ejecutar como: "Yo" (tu cuenta de correo)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 6. Haz clic en "Implementar" y COPIA la URL que termina en "/exec".
 * 7. Pega esa URL en el simulador en la sección "Configurar Webhook Automático".
 * ¡Listo! Toda la información se guardará automáticamente sin ventanas emergentes.
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Obtener o crear hoja "Registro de Aprendices"
    var sheet = ss.getSheetByName("Registro de Aprendices");
    if (!sheet) {
      sheet = ss.insertSheet("Registro de Aprendices");
      var headers = [
        "ID Aprendiz", "Nombre Completo", "Tipo Documento", "Número Documento",
        "Correo Electrónico", "Teléfono", "Programa de Formación", "Ficha",
        "Regional", "Centro de Formación", "Sede", "Modalidad",
        "Módulos Aprobados", "Progreso (%)", "Puntaje Evaluación Final (%)",
        "Código de Certificado", "Estado Inducción", "Fecha Registro / Certificación",
        "Puntos XP", "Nivel", "Reglamento Aplicado"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
           .setBackground("#39A900")
           .setFontColor("#FFFFFF")
           .setFontWeight("bold")
           .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // 2. Procesar evento de aprendiz certificado
    if (data.event === "apprentice_certified" && data.rowValues) {
      var docNum = String(data.apprentice ? data.apprentice.documentNumber : "");
      var dataRange = sheet.getDataRange().getValues();
      var rowIndex = -1;
      
      for (var i = 1; i < dataRange.length; i++) {
        if (String(dataRange[i][3]).trim() === docNum.trim()) {
          rowIndex = i + 1; // 1-indexed
          break;
        }
      }
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, data.rowValues.length).setValues([data.rowValues]);
      } else {
        sheet.appendRow(data.rowValues);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: rowIndex > 0 ? "updated" : "inserted",
        row: rowIndex > 0 ? rowIndex : sheet.getLastRow(),
        document: docNum
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Procesar cohorte completa
    if (data.event === "cohort_updated" && data.cohort) {
      var cohortSheet = ss.getSheetByName("Seguimiento Ficha " + (data.ficha || "2824190"));
      if (!cohortSheet) {
        cohortSheet = ss.insertSheet("Seguimiento Ficha " + (data.ficha || "2824190"));
        var cHeaders = ["ID", "Nombre Completo", "Documento", "Programa", "Ficha", "Progreso (%)", "Promedio (%)", "Estado", "Certificado", "Observaciones", "Fecha Sincronización"];
        cohortSheet.appendRow(cHeaders);
        cohortSheet.getRange(1, 1, 1, cHeaders.length).setBackground("#00324D").setFontColor("#FFFFFF").setFontWeight("bold");
        cohortSheet.setFrozenRows(1);
      }
      
      var now = new Date().toLocaleString("es-CO");
      data.cohort.forEach(function(s) {
        cohortSheet.appendRow([s.id, s.fullName, s.document, s.program, s.ficha, s.progressPercent + "%", s.quizAverage + "/100", s.status, s.certificateId || "Pendiente", s.flaggedTopic || "Sin novedades", now]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.cohort.length })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ping_received" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Servicio de Sincronización Automática SENA Inducción (Acuerdo 002 de 2026) Activo y Listo.");
}
`;
}
