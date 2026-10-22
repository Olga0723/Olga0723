import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Download, 
  Plus, 
  FileSpreadsheet, 
  TrendingUp,
  GraduationCap,
  Sparkles,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  CloudUpload,
  Send,
  Mail,
  Share2,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Settings,
  Code,
  Zap,
  X,
  History,
  CheckCircle,
  QrCode,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import { CohortStudent, ApprenticeProfile } from '../types/induction';
import { playSound } from '../utils/audio';
import { 
  autoSyncCohort, 
  getAutoSyncConfig, 
  saveAutoSyncConfig, 
  getSyncQueue, 
  flushSyncQueue, 
  getSyncHistory, 
  sendWebhookRecord, 
  getGoogleAppsScriptTemplate,
  clearSyncHistory
} from '../services/autoSyncService';
import { downloadInductionCsvFile, generateTabDelimitedData } from '../services/googleSheetsService';
import { getAvatarImage } from '../data/avatarsData';

interface InstructorDashboardProps {
  cohort: CohortStudent[];
  activeProfile: ApprenticeProfile;
  onSelectApprentice: (student: CohortStudent) => void;
  onOpenCertificateForStudent?: (student: CohortStudent) => void;
  onOpenGoogleSync?: (mode?: 'single' | 'cohort' | 'share') => void;
  onOpenShareLinkModal?: () => void;
  onPreviewApprenticeMode?: () => void;
  spreadsheetUrl?: string | null;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  cohort,
  activeProfile,
  onSelectApprentice,
  onOpenGoogleSync,
  onOpenShareLinkModal,
  onPreviewApprenticeMode,
  spreadsheetUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completado' | 'En Progreso' | 'No Iniciado'>('all');
  const [cohortList, setCohortList] = useState<CohortStudent[]>(cohort);

  const filteredStudents = cohortList.filter((s) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ficha.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalStudents = cohortList.length;
  const completedStudents = cohortList.filter((s) => s.status === 'Completado').length;
  const inProgressStudents = cohortList.filter((s) => s.status === 'En Progreso').length;
  const notStartedStudents = cohortList.filter((s) => s.status === 'No Iniciado').length;
  const completionRate = Math.round((completedStudents / totalStudents) * 100);
  const avgScore = Math.round(
    cohortList.reduce((acc, s) => acc + s.quizAverage, 0) / (cohortList.filter(s => s.quizAverage > 0).length || 1)
  );

  const [autoSyncConfig, setAutoSyncConfigState] = useState(getAutoSyncConfig());
  const [syncQueue, setSyncQueueState] = useState(getSyncQueue());
  const [syncHistory, setSyncHistoryState] = useState(getSyncHistory());
  const [isSyncingCohort, setIsSyncingCohort] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [showWebhookConfigModal, setShowWebhookConfigModal] = useState(false);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [webhookInput, setWebhookInput] = useState(autoSyncConfig.webhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const getApprenticeUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?role=aprendiz`;
  };

  const handleCopyDirectApprenticeUrl = () => {
    playSound('click');
    const url = getApprenticeUrl();
    navigator.clipboard.writeText(url);
    setCopiedDirectLink(true);
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const handleAutoSyncCohort = async () => {
    playSound('click');
    setIsSyncingCohort(true);
    setSyncNotice(null);
    try {
      const res = await autoSyncCohort(cohortList, activeProfile);
      setSyncQueueState(getSyncQueue());
      setSyncHistoryState(getSyncHistory());
      setAutoSyncConfigState(getAutoSyncConfig());
      playSound('complete');
      setSyncNotice({
        type: 'success',
        text: res.message,
      });
    } catch (e: unknown) {
      playSound('wrong');
      const err = e instanceof Error ? e.message : String(e);
      setSyncNotice({
        type: 'error',
        text: `Error al sincronizar cohorte: ${err}`,
      });
    } finally {
      setIsSyncingCohort(false);
    }
  };

  const handleTestWebhook = async () => {
    playSound('click');
    if (!webhookInput.trim()) {
      setSyncNotice({ type: 'error', text: 'Por favor ingresa primero la URL del Webhook.' });
      return;
    }
    setIsTestingWebhook(true);
    setSyncNotice(null);
    try {
      const res = await sendWebhookRecord(webhookInput.trim(), {
        event: 'test_ping',
        timestamp: new Date().toISOString(),
        source: 'SENA_Induccion_Acuerdo_002_2026',
        ficha: activeProfile.fichaNumber,
      });
      const updated = saveAutoSyncConfig({ webhookUrl: webhookInput.trim() });
      setAutoSyncConfigState(updated);
      playSound('complete');
      setSyncNotice({
        type: 'success',
        text: `¡Conexión exitosa (${res.mode})! El Webhook responde y quedó guardado como predeterminado.`,
      });
    } catch (e: unknown) {
      playSound('wrong');
      const err = e instanceof Error ? e.message : String(e);
      setSyncNotice({
        type: 'error',
        text: `No se pudo conectar con el Webhook: ${err}`,
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSaveWebhook = () => {
    playSound('click');
    const updated = saveAutoSyncConfig({ webhookUrl: webhookInput.trim() });
    setAutoSyncConfigState(updated);
    setShowWebhookConfigModal(false);
    setSyncNotice({
      type: 'success',
      text: webhookInput.trim()
        ? 'URL de Webhook actualizada. Las notas y certificados se transmitirán automáticamente en segundo plano.'
        : 'Webhook desactivado. Se conservará la cola local persistente.',
    });
    if (webhookInput.trim()) {
      flushSyncQueue().then(() => {
        setSyncQueueState(getSyncQueue());
        setSyncHistoryState(getSyncHistory());
      });
    }
  };

  const handleCopyAppsScript = () => {
    playSound('click');
    navigator.clipboard.writeText(getGoogleAppsScriptTemplate());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyTsv = () => {
    playSound('click');
    const tsv = generateTabDelimitedData(cohortList, activeProfile);
    navigator.clipboard.writeText(tsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
  };

  const handleDownloadFullCsv = () => {
    playSound('click');
    downloadInductionCsvFile(cohortList, activeProfile, `SENA_Induccion_Ficha_${activeProfile.fichaNumber}_Completo.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Instructor Olga */}
      <div className="bg-gradient-to-r from-[#00324D] via-[#014d75] to-[#00324D] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 flex items-center justify-end pointer-events-none pr-8">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                Panel del Instructor Líder • SENA
              </span>
              <span className="text-xs text-slate-300">
                Ficha: <strong>{activeProfile.fichaNumber}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading">
              Bienvenida, Instructora Olga Patricia Méndez
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Supervisión en tiempo real de la inducción al <strong>Reglamento del Aprendiz (Acuerdo 002 de 2026)</strong>.
              Monitorea el progreso, verifica certificaciones y detecta temas que requieran refuerzo presencial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenShareLinkModal && (
              <button
                onClick={() => {
                  playSound('click');
                  onOpenShareLinkModal();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#39A900] hover:from-emerald-600 hover:to-[#2f8a00] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-300/40"
                title="Generar enlace de inducción para enviar a los aprendices"
              >
                <Share2 className="w-4 h-4 text-emerald-100" />
                <span>Compartir con Aprendices</span>
              </button>
            )}
            {onPreviewApprenticeMode && (
              <button
                onClick={() => {
                  playSound('click');
                  onPreviewApprenticeMode();
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Ver la plataforma exactamente como la verá el aprendiz"
              >
                <Eye className="w-4 h-4 text-emerald-300" />
                <span>Previsualizar como Aprendiz</span>
              </button>
            )}
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4 text-emerald-300" />
                <span>Abrir Hoja en Drive</span>
              </a>
            )}
            <button
              onClick={() => {
                playSound('click');
                if (onOpenGoogleSync) onOpenGoogleSync('share');
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-sky-400/40"
              title="Compartir hoja de cálculo y enviar notificación a olmopez71@gmail.com"
            >
              <Send className="w-4 h-4 text-sky-200" />
              <span>Enviar a olmopez71@gmail.com</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                if (onOpenGoogleSync) onOpenGoogleSync('cohort');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Almacenar en Google Drive</span>
            </button>
            <button
              onClick={handleDownloadFullCsv}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Descargar archivo CSV completo oficial"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Descargar CSV Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Centro de Convocatoria y Enlace Exclusivo para Aprendices */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-[#39A900]">
                <Share2 className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Centro de Convocatoria y Enlace para Aprendices (Ficha {activeProfile.fichaNumber})
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
                Modo Aprendiz Blindado
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Comparte este enlace a tus aprendices por WhatsApp, correo o Teams. Al ingresar por esta ruta,
              <strong> sólo verán sus módulos, evaluación y certificado</strong>, sin acceso a Google Drive, sincronizaciones ni notas de sus compañeros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 max-w-xs sm:max-w-sm truncate text-xs font-mono text-slate-700 dark:text-slate-300">
              <span className="truncate">{getApprenticeUrl()}</span>
            </div>

            <button
              onClick={handleCopyDirectApprenticeUrl}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs ${
                copiedDirectLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#39A900] hover:bg-[#329400] text-white'
              }`}
            >
              {copiedDirectLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDirectLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
            </button>

            {onOpenShareLinkModal && (
              <button
                onClick={() => {
                  playSound('click');
                  onOpenShareLinkModal();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ver QR & Mensajes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync Notification Banner if any */}
      {syncNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 border shadow-xs transition-all ${
            syncNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : syncNotice.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            {syncNotice.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            {syncNotice.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            {syncNotice.type === 'info' && <Cloud className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{syncNotice.text}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Auto-Sync Command Center (Option 2: Zero Popups) */}
      <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xs rounded-2xl border border-emerald-500/30 dark:border-emerald-600/30 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#39A900] to-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Sincronización Automática en la Nube
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Opción 2 • Cero Clics
                </span>
                {autoSyncConfig.webhookUrl ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Webhook Activo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    Cola Local Resiliente
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Los aprendices transmiten sus certificados automáticamente al aprobar el examen, sin pantallas de consentimiento, sin ventanas emergentes y sin errores 403.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Última sincronización: <strong>{autoSyncConfig.lastSyncTime || 'Activa en segundo plano'}</strong></span>
          </div>
        </div>

        {/* Action controls grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <button
            onClick={handleAutoSyncCohort}
            disabled={isSyncingCohort}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Enviar de inmediato todos los aprendices a la hoja de cálculo o cola"
          >
            {isSyncingCohort ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isSyncingCohort ? 'Sincronizando...' : 'Sincronizar Toda la Cohorte'}</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setShowWebhookConfigModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Configurar URL del Webhook de Google Apps Script"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Configurar Webhook</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setShowAppsScriptModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Ver o copiar el script oficial para pegar en tu Google Sheet"
          >
            <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Código Apps Script</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setShowHistoryModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Ver bitácora de eventos y sincronizaciones"
          >
            <History className="w-4 h-4 text-blue-500" />
            <span>Bitácora de Sincronización ({syncHistory.length})</span>
          </button>
        </div>

        {/* Secondary utilities bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Cola persistente: <strong>{syncQueue.length} registros pendientes</strong></span>
            {syncQueue.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">(se despachan automáticamente al conectar)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTsv}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer transition-colors"
              title="Copiar tabla en formato para pegar directo en Excel o Google Sheets con Ctrl+V"
            >
              {copiedTsv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTsv ? '¡Tabla Copiada!' : 'Copiar TSV para Google Sheets'}</span>
            </button>
            <button
              onClick={handleDownloadFullCsv}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer transition-colors"
              title="Descargar archivo CSV completo con codificación UTF-8 oficial"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Descargar CSV Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aprendices en Ficha</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            {totalStudents}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Matriculados en inducción
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tasa de Certificación</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-heading">
            {completionRate}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <strong>{completedStudents}</strong> aprendices certificados
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Promedio de Evaluaciones</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-heading">
            {avgScore}/100
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rendimiento sobre el reglamento
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Seguimiento</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 font-heading">
            {inProgressStudents + notStartedStudents}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {notStartedStudents} sin iniciar inducción
          </div>
        </div>
      </div>

      {/* Critical Topics / Pedagogical Diagnostics */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Diagnóstico Pedagógico de la Ficha: Temas con Mayor Grado de Dificultad
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Recomendación para socializar en sesión sincrónica
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-rose-900 dark:text-rose-200">
                1. Plazo de 3 días para justificar inasistencias
              </span>
              <span className="font-black text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                42% error
              </span>
            </div>
            <p className="text-rose-800 dark:text-rose-300">
              Muchos aprendices creen erróneamente que tienen 15 días o que basta avisar informalmente por WhatsApp. Reforzar el Art. 9 y 21.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                2. Medida Formativa vs Sanción Disciplinaria
              </span>
              <span className="font-black text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                38% error
              </span>
            </div>
            <p className="text-amber-800 dark:text-amber-300">
              Confusión entre el llamado verbal reflexivo (pedagógico sin hoja de vida) y el llamado escrito (sanción formal del Subdirector).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-orange-900 dark:text-orange-200">
                3. Suplantación y préstamo de Carné
              </span>
              <span className="font-black text-orange-700 dark:text-orange-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                25% error
              </span>
            </div>
            <p className="text-orange-800 dark:text-orange-300">
              Importancia de clarificar que prestar el carné o firmar por otro aprendiz configura falta disciplinaria muy grave.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-blue-900 dark:text-blue-200">
                4. Alternativas de Etapa Productiva Válidas
              </span>
              <span className="font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                18% error
              </span>
            </div>
            <p className="text-blue-800 dark:text-blue-300">
              Es necesario insistir en que la práctica debe estar rigurosamente vinculada con las competencias específicas del diseño curricular.
            </p>
          </div>
        </div>
      </div>

      {/* Google Drive Integration Bar */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-blue-950/30 border border-emerald-500/20 dark:border-emerald-800/40 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#39A900] text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Base de Datos de Aprendices en Google Drive (Google Sheets)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase">
                Acuerdo 002 de 2026
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Estructura con 21 campos por aprendiz: identificación, ficha, módulos completados, notas de evaluación final, códigos de verificación y estado de certificación.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ver Hoja en Drive</span>
            </a>
          )}
          <button
            onClick={() => {
              playSound('click');
              if (onOpenGoogleSync) onOpenGoogleSync('cohort');
            }}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00324D] hover:bg-[#014d75] text-white font-bold text-xs transition-all active:scale-95 shadow-xs cursor-pointer border border-[#002538]"
          >
            <CloudUpload className="w-4 h-4 text-emerald-400" />
            <span>Sincronizar con Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aprendiz por nombre o documento..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Estado:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Todos ({cohortList.length})
            </button>
            <button
              onClick={() => setFilterStatus('Completado')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'Completado'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
              }`}
            >
              Certificados ({completedStudents})
            </button>
            <button
              onClick={() => setFilterStatus('En Progreso')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'En Progreso'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
            >
              En Progreso ({inProgressStudents})
            </button>
            <button
              onClick={() => setFilterStatus('No Iniciado')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'No Iniciado'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700'
              }`}
            >
              Sin Iniciar ({notStartedStudents})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Aprendiz</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Progreso</th>
                <th className="py-3 px-4 text-center">Evaluación</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Certificado / Novedad</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const isSelected = activeProfile.id === student.id;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400/50 bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <img
                            src={getAvatarImage(student.avatarId || (student.fullName.includes('Laura') || student.fullName.includes('Valentina') || student.fullName.includes('Ana') || student.fullName.includes('María') || student.fullName.includes('Camila') ? 'female-1' : 'male-1'))}
                            alt={student.fullName}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {student.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {student.program} • Ficha {student.ficha}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 text-xs">
                      {student.document}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 w-32">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.progressPercent === 100
                                ? 'bg-[#39A900]'
                                : student.progressPercent > 30
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {student.progressPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      {student.quizAverage > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            student.quizAverage >= 80
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {student.quizAverage}/100
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          student.status === 'Completado'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : student.status === 'En Progreso'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {student.status === 'Completado' && <CheckCircle2 className="w-3 h-3" />}
                        {student.status === 'En Progreso' && <Clock className="w-3 h-3" />}
                        {student.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {student.certificateId ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{student.certificateId}</span>
                        </div>
                      ) : student.flaggedTopic ? (
                        <span className="text-amber-800 dark:text-amber-300 font-medium">
                          ⚠️ {student.flaggedTopic}
                        </span>
                      ) : (
                        <span className="text-slate-400">En curso</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          playSound('click');
                          onSelectApprentice(student);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 font-semibold text-xs transition-colors cursor-pointer"
                        title="Cargar perfil de este aprendiz para simular o ver avances"
                      >
                        Simular Aprendiz
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: Webhook Configuration */}
      {showWebhookConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">Configuración de Webhook Automático</h4>
              </div>
              <button
                onClick={() => setShowWebhookConfigModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El Webhook permite que cada aprendiz envíe su certificado y nota directamente a tu hoja de cálculo sin que tengas que abrir popups ni iniciar sesión con Google.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  URL de la Aplicación Web (terminada en /exec)
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  ¿No tienes la URL? Haz clic en &quot;Código Apps Script&quot; en el panel para generarla en 2 minutos.
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                <strong>💡 Ventaja de la Opción 2:</strong> Al usar el Webhook, las evaluaciones aprobadas se insertan solas en tiempo real. Si no hay conexión o no tienes URL configurada, los datos quedan respaldados de forma segura en la cola local.
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook || !webhookInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingWebhook ? 'Probando...' : 'Probar Conexión'}
                </button>
                <button
                  onClick={handleSaveWebhook}
                  className="px-5 py-2 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Guardar y Activar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Apps Script Code & Instructions */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">Código Google Apps Script (Recepción Automática)</h4>
              </div>
              <button
                onClick={() => setShowAppsScriptModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Instrucciones en 3 Pasos Sencillos:
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  <li>En tu Google Sheet ve a <strong>Extensiones &gt; Apps Script</strong>.</li>
                  <li>Reemplaza el código con el bloque de abajo y haz clic en <strong>Guardar</strong>.</li>
                  <li>Haz clic en <strong>Implementar &gt; Nueva implementación</strong>, selecciona tipo <em>&quot;Aplicación web&quot;</em>, acceso: <em>&quot;Cualquier persona&quot;</em>, y pega la URL en el prototipo.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-[11px] font-mono">
                  <span>CodigoSENA.gs</span>
                  <button
                    onClick={handleCopyAppsScript}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? '¡Copiado!' : 'Copiar Todo el Código'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-b-xl overflow-x-auto text-[11px] font-mono max-h-64 border border-slate-800">
                  {getGoogleAppsScriptTemplate()}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowAppsScriptModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: History Log */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-sm">Bitácora de Sincronización Automática</h4>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {syncHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Cloud className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No hay eventos de sincronización registrados aún.</p>
                  <p className="text-[11px] mt-1">Se generarán automáticamente cuando un aprendiz apruebe la inducción.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {syncHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              h.status === 'success'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : h.status === 'queued'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {h.status === 'success' ? 'Éxito' : h.status === 'queued' ? 'En Cola' : 'Error'}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {h.apprenticeName || `Cohorte Ficha ${h.fichaNumber || '2824190'}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({h.target})</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                          {h.message}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {h.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    clearSyncHistory();
                    setSyncHistoryState([]);
                  }}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Limpiar historial
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
