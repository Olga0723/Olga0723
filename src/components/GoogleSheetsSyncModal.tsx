import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ShieldCheck, 
  CloudUpload, 
  Users, 
  UserCheck, 
  FolderOpen, 
  LogOut,
  Mail,
  Send,
  Copy,
  Check,
  UserPlus,
  Shield,
  Eye,
  Edit3,
  Download,
  Info,
  HelpCircle,
  KeyRound,
  Link2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Cloud,
  RefreshCw,
  Code,
  CheckCircle
} from 'lucide-react';
import { ApprenticeProfile, CohortStudent } from '../types/induction';
import { 
  googleSignIn, 
  logout, 
  getAccessToken, 
  getCurrentUser, 
  initAuth,
  parseAuthError,
  GOOGLE_CLOUD_CONSENT_URL,
  GOOGLE_CLOUD_PROJECT_ID,
  AuthErrorInfo
} from '../services/googleAuth';
import { 
  findExistingSpreadsheet, 
  createInductionSpreadsheet, 
  syncApprenticeRecord, 
  syncEntireCohort, 
  shareSpreadsheetWithEmail,
  getSpreadsheetPermissions,
  parseCustomSpreadsheetUrl,
  downloadInductionCsvFile,
  generateTabDelimitedData,
  SheetPermission,
  SpreadsheetInfo,
  SPREADSHEET_TITLE,
  SHEET_APPRENTICES_TAB,
  SHEET_COHORT_TAB
} from '../services/googleSheetsService';
import { 
  autoSyncApprenticeRecord,
  autoSyncCohort,
  getAutoSyncConfig,
  saveAutoSyncConfig,
  getSyncQueue,
  flushSyncQueue,
  sendWebhookRecord,
  getGoogleAppsScriptTemplate,
} from '../services/autoSyncService';
import { playSound } from '../utils/audio';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ApprenticeProfile;
  cohort: CohortStudent[];
  initialMode?: 'auto' | 'single' | 'cohort' | 'share';
  onSyncComplete?: (spreadsheetInfo: SpreadsheetInfo) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  cohort,
  initialMode = 'cohort',
  onSyncComplete,
}) => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetInfo | null>(null);
  const [, setIsSearchingSheet] = useState(false);

  // Tab: 'auto', 'share', 'sync', or 'export'
  const [activeTab, setActiveTab] = useState<'auto' | 'share' | 'sync' | 'export'>(
    initialMode === 'share' ? 'share' : 'auto'
  );

  // Auto-sync state (Option 2)
  const [autoConfig, setAutoConfig] = useState(getAutoSyncConfig());
  const [syncQueue, setSyncQueue] = useState(getSyncQueue());
  const [webhookInput, setWebhookInput] = useState(autoConfig.webhookUrl || '');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);
  const [isSyncingCohortAuto, setIsSyncingCohortAuto] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Sync mode: single apprentice or entire cohort
  const [syncScope, setSyncScope] = useState<'single' | 'cohort'>(
    initialMode === 'single' ? 'single' : 'cohort'
  );

  // Sharing state
  const [recipientEmail, setRecipientEmail] = useState('olmopez71@gmail.com');
  const [shareRole, setShareRole] = useState<'reader' | 'writer'>('writer');
  const [shareMessage, setShareMessage] = useState(
    'Cordial saludo. Te comparto la hoja oficial de Google Drive con el registro y seguimiento de inducción de los aprendices SENA (Acuerdo 002 de 2026), notas de evaluación y certificados expedidos.'
  );
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<{
    email: string;
    role: string;
    timestamp: string;
  } | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<SheetPermission[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

  // Custom link input
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [customLinkError, setCustomLinkError] = useState<string | null>(null);

  // Detailed error state for 403 and popup-closed
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [, setLastSyncResult] = useState<{
    count: number;
    sheetUrl: string;
    timestamp: string;
  } | null>(null);

  // When initialMode changes on reopen
  useEffect(() => {
    if (initialMode === 'share') {
      setActiveTab('share');
    } else if (initialMode === 'auto') {
      setActiveTab('auto');
    } else if (initialMode === 'single' || initialMode === 'cohort') {
      setSyncScope(initialMode);
      setActiveTab('auto');
    }
    setAutoConfig(getAutoSyncConfig());
    setSyncQueue(getSyncQueue());
  }, [initialMode, isOpen]);

  // Check saved custom sheet in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLink = localStorage.getItem('sena_linked_sheet');
      if (savedLink) {
        try {
          const parsed = JSON.parse(savedLink);
          if (parsed && parsed.id) {
            setSpreadsheet(parsed);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Initialize Auth listener
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, cachedToken) => {
        setCurrentUserEmail(user.email);
        setToken(cachedToken);
        setAuthError(null);
        checkSpreadsheet(cachedToken);
      },
      () => {
        const user = getCurrentUser();
        if (user) {
          setCurrentUserEmail(user.email);
        } else {
          setCurrentUserEmail(null);
          setToken(null);
        }
      }
    );

    getAccessToken().then((cachedToken) => {
      if (cachedToken) {
        setToken(cachedToken);
        const user = getCurrentUser();
        if (user) setCurrentUserEmail(user.email);
        checkSpreadsheet(cachedToken);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isOpen]);

  const checkSpreadsheet = async (accessToken: string) => {
    setIsSearchingSheet(true);
    try {
      const existing = await findExistingSpreadsheet(accessToken);
      if (existing) {
        setSpreadsheet(existing);
        loadPermissions(accessToken, existing.id);
      }
    } catch (err) {
      console.warn('Error verificando hoja existente:', err);
    } finally {
      setIsSearchingSheet(false);
    }
  };

  const loadPermissions = async (accessToken: string, fileId: string) => {
    try {
      const perms = await getSpreadsheetPermissions(accessToken, fileId);
      setExistingPermissions(perms);
    } catch (e) {
      console.warn('No se pudieron cargar permisos:', e);
    }
  };

  const handleSignIn = async () => {
    playSound('click');
    setIsAuthenticating(true);
    setStatusMessage(null);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setCurrentUserEmail(result.user.email);
        await checkSpreadsheet(result.accessToken);
        playSound('correct');
        setShowTroubleshooting(false);
      }
    } catch (err: unknown) {
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      setShowTroubleshooting(true);
      playSound('wrong');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    playSound('click');
    await logout();
    setToken(null);
    setCurrentUserEmail(null);
    setSpreadsheet(null);
    setLastSyncResult(null);
    setExistingPermissions([]);
    setShareSuccess(null);
    setAuthError(null);
    setStatusMessage({
      type: 'info',
      text: 'Sesión de Google cerrada correctamente.',
    });
  };

  // Helper to ensure spreadsheet exists (creates and syncs if needed)
  const ensureSpreadsheetReady = async (accessToken: string): Promise<SpreadsheetInfo> => {
    if (spreadsheet) return spreadsheet;
    const newSheet = await createInductionSpreadsheet(accessToken);
    setSpreadsheet(newSheet);
    await syncEntireCohort(accessToken, newSheet.id, cohort, activeProfile);
    if (onSyncComplete) onSyncComplete(newSheet);
    return newSheet;
  };

  // Synchronize execution with Google Sheets
  const handleExecuteSync = async () => {
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Debes conectar tu cuenta de Google o utilizar la pestaña "Exportar Directo / CSV" para guardar los registros sin restricciones de permisos.',
      });
      return;
    }

    playSound('click');
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      let targetSheet = spreadsheet;
      if (!targetSheet) {
        targetSheet = await createInductionSpreadsheet(token);
        setSpreadsheet(targetSheet);
      }

      let syncCount = 0;
      if (syncScope === 'single') {
        await syncApprenticeRecord(token, targetSheet.id, activeProfile);
        syncCount = 1;
      } else {
        const result = await syncEntireCohort(token, targetSheet.id, cohort, activeProfile);
        syncCount = result.totalApprentices;
      }

      playSound('correct');
      const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncResult({
        count: syncCount,
        sheetUrl: targetSheet.webViewLink,
        timestamp: now,
      });

      setStatusMessage({
        type: 'success',
        text: `¡Sincronización completada con éxito! Se registraron y actualizaron ${syncCount} registro(s) en la hoja de Google Drive.`,
      });

      if (onSyncComplete) {
        onSyncComplete(targetSheet);
      }
    } catch (err: any) {
      console.warn('Error en sincronización:', err);
      playSound('wrong');
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Ocurrió un error al escribir los datos en Google Sheets. Puedes exportar el archivo CSV directamente desde la pestaña "Exportar / CSV".',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Share execution via Google Drive Permissions API or fallback
  const handleExecuteShare = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor ingresa un correo electrónico válido para compartir.',
      });
      return;
    }

    // If no Google token, handle gracefully
    if (!token) {
      // Trigger sign in first
      try {
        setIsAuthenticating(true);
        const res = await googleSignIn();
        if (res) {
          setToken(res.accessToken);
          setCurrentUserEmail(res.user.email);
        } else {
          return;
        }
      } catch (e: unknown) {
        const parsed = parseAuthError(e);
        setAuthError(parsed);
        setShowTroubleshooting(true);
        return;
      } finally {
        setIsAuthenticating(false);
      }
    }

    const currentAccessToken = token;
    if (!currentAccessToken) return;

    playSound('click');
    setIsSharing(true);
    setStatusMessage(null);

    try {
      const targetSheet = await ensureSpreadsheetReady(currentAccessToken);

      await shareSpreadsheetWithEmail(
        currentAccessToken,
        targetSheet.id,
        recipientEmail,
        shareRole,
        shareMessage
      );

      playSound('correct');
      const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      setShareSuccess({
        email: recipientEmail,
        role: shareRole === 'writer' ? 'Editor' : 'Lector',
        timestamp: now,
      });

      setStatusMessage({
        type: 'success',
        text: `¡Hoja de cálculo enviada y compartida con éxito! Google Drive ha otorgado acceso a ${recipientEmail} como ${shareRole === 'writer' ? 'Editor' : 'Lector'} y le ha remitido un correo electrónico con el enlace directo.`,
      });

      await loadPermissions(currentAccessToken, targetSheet.id);
    } catch (err: any) {
      console.warn('Error al compartir hoja:', err);
      playSound('wrong');
      setStatusMessage({
        type: 'error',
        text: err?.message || 'No se pudo compartir la hoja. Verifica que la cuenta tenga permisos o usa el botón de correo directo.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (!spreadsheet?.webViewLink) return;
    navigator.clipboard.writeText(spreadsheet.webViewLink);
    setCopiedLink(true);
    playSound('correct');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyTableData = () => {
    const data = generateTabDelimitedData(cohort, activeProfile);
    navigator.clipboard.writeText(data);
    setCopiedData(true);
    playSound('correct');
    setStatusMessage({
      type: 'success',
      text: '¡Datos copiados al portapapeles! Abre una hoja en Google Sheets (sheets.new) y pulsa Ctrl+V para pegar todos los aprendices ordenados con encabezados.',
    });
    setTimeout(() => setCopiedData(false), 3500);
  };

  const handleDownloadCsv = () => {
    playSound('click');
    downloadInductionCsvFile(cohort, activeProfile);
    playSound('correct');
    setStatusMessage({
      type: 'success',
      text: '¡Archivo CSV descargado con éxito! Puedes subirlo a tu carpeta de Google Drive o abrirlo en Google Sheets / Excel con formato UTF-8.',
    });
  };

  const handleLinkCustomSheet = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomLinkError(null);
    const parsed = parseCustomSpreadsheetUrl(customSheetUrl);
    if (!parsed) {
      setCustomLinkError('Ingresa un enlace válido de Google Sheets (ej. https://docs.google.com/spreadsheets/d/1A2B3C.../edit)');
      playSound('wrong');
      return;
    }

    setSpreadsheet(parsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sena_linked_sheet', JSON.stringify(parsed));
    }
    if (onSyncComplete) onSyncComplete(parsed);
    playSound('correct');
    setStatusMessage({
      type: 'success',
      text: `¡Hoja de Google Sheets vinculada correctamente! ID: ${parsed.id}`,
    });
    setCustomSheetUrl('');
  };

  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent('SENA Inducción - Enlace Hoja de Seguimiento (Acuerdo 002 de 2026)')}&body=${encodeURIComponent(
    `Hola,\n\nTe comparto los datos oficiales de seguimiento de inducción de los aprendices SENA (Acuerdo 002 de 2026), Ficha ${activeProfile.fichaNumber}.\n\n${
      spreadsheet ? `Enlace directo en Google Drive:\n${spreadsheet.webViewLink}\n\n` : ''
    }${shareMessage}\n\nAtentamente,\nInstructora Olga Patricia Méndez / SENA`
  )}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-sync-title"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00324D] via-[#014d75] to-[#39A900] p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 text-white shadow-inner">
              <FileSpreadsheet className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Google Workspace • Drive & Sheets
                </span>
                <span className="text-[11px] text-slate-200">Acuerdo 002 de 2026</span>
              </div>
              <h3 id="google-sync-title" className="text-xl font-bold font-heading mt-0.5">
                Almacenamiento y Envío a Google Drive
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('auto');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'auto'
                ? 'border-[#39A900] text-[#39A900] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>⚡ Automático (Opción 2)</span>
            <span className="text-[10px] bg-[#39A900] text-white px-2 py-0.5 rounded-full font-bold">
              Recomendado
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('share');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'share'
                ? 'border-[#39A900] text-[#39A900] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Enviar a olmopez71@gmail.com</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
              Prioritario
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('sync');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-[#39A900] text-[#39A900] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>Sincronización en la Nube</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('export');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-[#39A900] text-[#39A900] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV / Vincular Link</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-100 text-sm">
          {/* Status Message Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed font-medium">
                {statusMessage.text}
              </div>
            </div>
          )}

          {/* DEDICATED DIAGNOSTIC & SOLUTION BANNER FOR ERROR 403 / POPUP CLOSED */}
          {authError && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-700/70 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    {authError.title}
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    {authError.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons to Resolve 403 */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <a
                  href={authError.cloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Agregar Usuario de Prueba en Google Cloud</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-medium hover:bg-amber-100/50 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showTroubleshooting ? 'Ocultar Paso a Paso' : 'Ver Paso a Paso de 2 Minutos'}</span>
                  {showTroubleshooting ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Solución Inmediata: Exportar CSV para Drive</span>
                </button>
              </div>

              {/* Expandable Step by step instructions */}
              {showTroubleshooting && (
                <div className="p-3.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-2 mt-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>¿Por qué sucede y cómo solucionarlo definitivamente?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
                    <li>
                      <strong>Google Cloud Security Policy:</strong> La aplicación está en proyecto <code>{GOOGLE_CLOUD_PROJECT_ID}</code> con estado <em>"En pruebas" (Testing)</em>.
                    </li>
                    <li>
                      Haz clic en el botón amarillo <strong>"Agregar Usuario de Prueba en Google Cloud"</strong> (te llevará directo a la pantalla de consentimiento del proyecto).
                    </li>
                    <li>
                      En la sección inferior <strong>"Usuarios de prueba" (Test users)</strong>, haz clic en <strong>"+ Add users" (+ Agregar usuarios)</strong>.
                    </li>
                    <li>
                      Escribe el correo <strong>olmopez71@gmail.com</strong> (y/o tu cuenta de Google actual) y presiona <strong>"Guardar" (Save)</strong>.
                    </li>
                    <li>
                      Regresa a esta ventana y presiona <strong>"Iniciar sesión con Google"</strong>. ¡El acceso quedará 100% autorizado!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Authentication Status Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cuenta de Google Conectada
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                {currentUserEmail ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{currentUserEmail}</span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 italic">No has iniciado sesión con Google</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!currentUserEmail ? (
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#39A900]" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )}
                  <span>Iniciar sesión con Google</span>
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              )}
            </div>
          </div>

          {/* Drive Spreadsheet Destination Info Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hoja de Cálculo en Google Drive
                </h4>
              </div>
              {spreadsheet ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                  {spreadsheet.isCustomLinked ? 'Hoja Externa Vinculada' : 'Archivo Vinculado'}
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  Disponible para vincular o crear
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{spreadsheet?.name || SPREADSHEET_TITLE}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Estructura oficial de dos pestañas: <strong>"{SHEET_APPRENTICES_TAB}"</strong> y <strong>"{SHEET_COHORT_TAB}"</strong>.
              </p>
            </div>

            {spreadsheet && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Enlace directo:</span>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-[11px]"
                    title="Copiar enlace al portapapeles"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>

                <a
                  href={spreadsheet.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  <span>Abrir en Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* TAB 0: AUTOMATIC BACKGROUND SYNC (OPTION 2 - RECOMMENDED) */}
          {activeTab === 'auto' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-50/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-700 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#39A900] text-white flex items-center justify-center shadow-xs">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          Sincronización Automática en Segundo Plano
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#39A900] text-white">
                          Opción 2 Aprobada
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Registra notas y certificados sin ventanas emergentes de Google, sin pantallas de consentimiento y sin bloqueos 403.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Estado del Sistema
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {autoConfig.webhookUrl ? 'Webhook Activo en Google Apps Script' : 'Cola Resiliente Local Activa'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Ficha: {activeProfile.fichaNumber} • Acuerdo 002 de 2026
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Cola de Sincronización
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {syncQueue.length} registro(s) pendientes
                      </span>
                      {syncQueue.length > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            playSound('click');
                            setIsFlushingQueue(true);
                            try {
                              const res = await flushSyncQueue();
                              setSyncQueue(getSyncQueue());
                              if (res.succeeded > 0) {
                                playSound('correct');
                                setStatusMessage({
                                  type: 'success',
                                  text: `¡Se enviaron ${res.succeeded} registros pendientes a la hoja central!`,
                                });
                              }
                            } finally {
                              setIsFlushingQueue(false);
                            }
                          }}
                          disabled={isFlushingQueue}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer disabled:opacity-50"
                        >
                          {isFlushingQueue ? 'Enviando...' : 'Despachar Ahora'}
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Último envío: {autoConfig.lastSyncTime || 'Al certificar'}
                    </span>
                  </div>
                </div>

                {/* Webhook Configuration section */}
                <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    URL de la Aplicación Web (Google Apps Script):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-[#39A900] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        playSound('click');
                        if (!webhookInput.trim()) {
                          setStatusMessage({ type: 'error', text: 'Ingresa una URL de Webhook válida.' });
                          return;
                        }
                        setIsTestingWebhook(true);
                        try {
                          const res = await sendWebhookRecord(webhookInput.trim(), {
                            event: 'test_ping',
                            timestamp: new Date().toISOString(),
                            source: 'SENA_Induccion_Acuerdo_002_2026',
                            ficha: activeProfile.fichaNumber,
                          });
                          const saved = saveAutoSyncConfig({ webhookUrl: webhookInput.trim() });
                          setAutoConfig(saved);
                          playSound('correct');
                          setStatusMessage({
                            type: 'success',
                            text: `¡Prueba exitosa (${res.mode})! Webhook conectado a tu hoja de cálculo.`,
                          });
                        } catch (err: unknown) {
                          playSound('wrong');
                          const eMsg = err instanceof Error ? err.message : String(err);
                          setStatusMessage({
                            type: 'error',
                            text: `Error al probar el Webhook: ${eMsg}`,
                          });
                        } finally {
                          setIsTestingWebhook(false);
                        }
                      }}
                      disabled={isTestingWebhook || !webhookInput.trim()}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isTestingWebhook ? 'Probando...' : 'Probar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        const saved = saveAutoSyncConfig({ webhookUrl: webhookInput.trim() });
                        setAutoConfig(saved);
                        playSound('correct');
                        setStatusMessage({
                          type: 'success',
                          text: webhookInput.trim()
                            ? 'Webhook guardado como destino de sincronización automática.'
                            : 'Webhook limpiado. Se utilizará la cola local persistente.',
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Guardar
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    ¿Quieres configurar tu propia hoja de Google? Solo pega el script de abajo en <strong>Extensiones &gt; Apps Script</strong> y despliégalo como Aplicación Web (acceso: Cualquiera).
                  </span>
                </div>

                {/* Google Apps Script Snippet */}
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-xs">
                  <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Script de Recepción Automática para Google Sheets</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        navigator.clipboard.writeText(getGoogleAppsScriptTemplate());
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2500);
                      }}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? '¡Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto">
                    {getGoogleAppsScriptTemplate()}
                  </pre>
                </div>

                {/* Instant Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      playSound('click');
                      setIsSyncingCohortAuto(true);
                      try {
                        const res = await autoSyncCohort(cohort, activeProfile);
                        setSyncQueue(getSyncQueue());
                        setAutoConfig(getAutoSyncConfig());
                        playSound('correct');
                        setStatusMessage({
                          type: 'success',
                          text: res.message,
                        });
                      } catch (err: unknown) {
                        playSound('wrong');
                        const eMsg = err instanceof Error ? err.message : String(err);
                        setStatusMessage({
                          type: 'error',
                          text: `Error al sincronizar: ${eMsg}`,
                        });
                      } finally {
                        setIsSyncingCohortAuto(false);
                      }
                    }}
                    disabled={isSyncingCohortAuto}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingCohortAuto ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    <span>{isSyncingCohortAuto ? 'Transmitiendo...' : 'Transmitir Toda la Cohorte Ahora'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        const tsv = generateTabDelimitedData(cohort, activeProfile);
                        navigator.clipboard.writeText(tsv);
                        setStatusMessage({
                          type: 'success',
                          text: '¡Datos en formato TSV copiados! Puedes pegarlos directamente en Google Sheets con Ctrl+V.',
                        });
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Copiar Tabla (TSV)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        downloadInductionCsvFile(cohort, activeProfile);
                        setStatusMessage({
                          type: 'success',
                          text: 'Archivo CSV descargado con codificación UTF-8 compatible con Google Sheets y Excel.',
                        });
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Descargar CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SEND & SHARE TO olmopez71@gmail.com */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#39A900] dark:text-emerald-400 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Enviar Notificación y Hoja a olmopez71@gmail.com
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Envía los reportes de inducción directamente a la cuenta especificada.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    Solicitado
                  </span>
                </div>

                {/* Recipient Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Correo del Destinatario:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="olmopez71@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Configurado por defecto según tu solicitud: <strong>olmopez71@gmail.com</strong></span>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Nivel de Permiso en la Hoja de Drive:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShareRole('writer')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        shareRole === 'writer'
                          ? 'border-[#39A900] bg-white dark:bg-slate-800 ring-2 ring-[#39A900]/40'
                          : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">Editor</div>
                          <div className="text-[10px] text-slate-500">Puede modificar y validar</div>
                        </div>
                      </div>
                      {shareRole === 'writer' && <Check className="w-4 h-4 text-[#39A900]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareRole('reader')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        shareRole === 'reader'
                          ? 'border-[#39A900] bg-white dark:bg-slate-800 ring-2 ring-[#39A900]/40'
                          : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">Lector</div>
                          <div className="text-[10px] text-slate-500">Solo lectura y descarga</div>
                        </div>
                      </div>
                      {shareRole === 'reader' && <Check className="w-4 h-4 text-[#39A900]" />}
                    </button>
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mensaje para la Notificación por Correo:
                  </label>
                  <textarea
                    rows={2}
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Primary Action Button to Send */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleExecuteShare}
                    disabled={isSharing || isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Enviando invitación a {recipientEmail}...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar por Google Drive a {recipientEmail}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={mailtoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
                    title="Abrir tu cliente de correo (Gmail/Outlook) con la plantilla redactada lista para enviar a olmopez71@gmail.com"
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Redactar en Gmail Directo</span>
                  </a>
                </div>

                {/* Success Card */}
                {shareSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <strong>¡Invitación confirmada!</strong> Se concedió acceso como <strong>{shareSuccess.role}</strong> a <strong>{shareSuccess.email}</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Permissions on file */}
              {existingPermissions.length > 0 && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cuentas con Acceso a este Archivo en Drive:</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {existingPermissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {perm.emailAddress || perm.displayName || 'Usuario con enlace'}
                          </span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium capitalize">
                          {perm.role === 'owner' ? 'Propietario' : perm.role === 'writer' ? 'Editor' : 'Lector'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYNC APPRENTICE DATA VIA GOOGLE API */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Sync Scope Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Selecciona qué información almacenar en la hoja:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSyncScope('cohort');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      syncScope === 'cohort'
                        ? 'border-[#39A900] bg-emerald-500/10 dark:bg-emerald-950/40 ring-2 ring-[#39A900]/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Ficha Completa</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                        {cohort.length} aprendices
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Guarda y actualiza a todos los aprendices de la ficha {activeProfile.fichaNumber}, sus notas de evaluación y porcentajes.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSyncScope('single');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      syncScope === 'single'
                        ? 'border-[#39A900] bg-emerald-500/10 dark:bg-emerald-950/40 ring-2 ring-[#39A900]/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[#00324D] dark:text-sky-400" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Aprendiz Actual</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                        1 aprendiz
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Actualiza únicamente el registro de <strong>{activeProfile.fullName}</strong> con su certificado y módulos aprobados.
                    </p>
                  </button>
                </div>
              </div>

              {/* Confirmation Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold block mb-0.5">Sincronización Segura:</span>
                  Al presionar <strong>"Confirmar y Guardar"</strong>, la plataforma actualizará las celdas de la hoja de cálculo en Google Drive con los datos normativos del <strong>Acuerdo 002 de 2026</strong>. Si la autenticación de Google se cerró o arrojó 403, puedes usar la pestaña <strong>"Exportar CSV / Vincular Link"</strong>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ZERO-BARRIER EXPORT CSV / LINK EXISTING SHEET */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Option A: Download CSV */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#39A900] dark:text-emerald-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        1. Descargar Archivo CSV Oficial Estructurado
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Genera un archivo con codificación UTF-8 compatible con Google Drive y Excel con todos los datos y encabezados del SENA.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Archivo CSV Completo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyTableData}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    {copiedData ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600">¡Copiado para Pegar!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copiar Tabla para Pegar (Ctrl+V)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option B: Link Existing Sheet */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        2. Vincular Hoja de Google Sheets Existente
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Si ya tienes una hoja creada en tu Google Drive, pega su enlace aquí para asociarla a la plataforma.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLinkCustomSheet} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customSheetUrl}
                      onChange={(e) => setCustomSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1XyZ.../edit"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#39A900]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Vincular Hoja
                    </button>
                  </div>
                  {customLinkError && (
                    <div className="text-xs text-rose-500 font-medium">
                      {customLinkError}
                    </div>
                  )}
                </form>
              </div>

              {/* Quick Link to Blank Google Sheet */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  ¿Quieres crear una hoja nueva en Google Sheets en blanco?
                </span>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#39A900] hover:underline"
                >
                  <span>Abrir sheets.new</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            disabled={isProcessing || isSharing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {spreadsheet && (
              <a
                href={spreadsheet.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Hoja en Drive</span>
              </a>
            )}

            {activeTab === 'share' ? (
              <button
                type="button"
                onClick={handleExecuteShare}
                disabled={isSharing || isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Compartiendo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar a {recipientEmail}</span>
                  </>
                )}
              </button>
            ) : activeTab === 'sync' ? (
              <button
                type="button"
                onClick={handleExecuteSync}
                disabled={isProcessing || !token}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Guardando en Google Drive...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>Confirmar y Guardar en Drive</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Descargar CSV Oficial</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
