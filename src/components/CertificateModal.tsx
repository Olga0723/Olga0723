import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Calendar, 
  Copy, 
  ExternalLink,
  FileSpreadsheet,
  Cloud
} from 'lucide-react';
import { ApprenticeProfile } from '../types/induction';
import { playSound } from '../utils/audio';
import { SenaLogo } from './SenaLogo';
import { getAvatarImage } from '../data/avatarsData';

interface CertificateModalProps {
  profile: ApprenticeProfile;
  onClose: () => void;
  onOpenGoogleSync?: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  profile,
  onClose,
  onOpenGoogleSync,
}) => {
  const [copied, setCopied] = React.useState(false);

  const verificationCode = profile.certificateCode || `SENA-IND-2026-${profile.fichaNumber.slice(-4)}${profile.documentNumber.slice(-3)}`;
  const issueDate = profile.certifiedAt || new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    playSound('click');
    window.print();
  };

  const handleCopyCode = () => {
    playSound('click');
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Actions bar (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Certificado Oficial de Inducción SENA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center">
          <div
            id="sena-certificate-print-area"
            className="w-full max-w-[850px] bg-white border-8 border-double border-[#00324D] rounded-xl p-8 sm:p-12 relative shadow-lg text-slate-900 overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#39A900 0.4px, transparent 0.4px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-[#39A900]"></div>
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-[#39A900]"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-[#39A900]"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-[#39A900]"></div>

            {/* Inner frame */}
            <div className="border border-slate-300 p-6 sm:p-8 rounded-lg text-center relative z-10 bg-white/95">
              {/* Header Titles */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#39A900] flex items-center justify-center text-white shadow-md p-2">
                    {/* Official SENA symbol shape */}
                    <SenaLogo className="w-12 h-12 fill-current" />
                  </div>
                </div>

                <h4 className="text-xs font-black tracking-widest text-[#00324D] uppercase">
                  República de Colombia • Ministerio del Trabajo
                </h4>
                <h3 className="text-sm font-extrabold tracking-wider text-slate-800 uppercase mt-0.5">
                  Servicio Nacional de Aprendizaje • SENA
                </h3>
                <div className="h-0.5 w-24 bg-[#39A900] my-2"></div>
                <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  {profile.regional} • {profile.trainingCenter}
                </h5>
              </div>

              {/* Certificate Statement */}
              <div className="my-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#39A900] shadow-sm mb-2 bg-slate-100 flex items-center justify-center">
                  <img
                    src={getAvatarImage(profile.avatarId)}
                    alt={profile.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                  Hace constar que el aprendiz
                </p>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00324D] font-heading mt-2 mb-1 tracking-tight">
                  {profile.fullName}
                </h1>

                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Identificado(a) con <strong>{profile.documentType} No. {profile.documentNumber}</strong>
                </p>
              </div>

              {/* Achievement Body */}
              <div className="max-w-2xl mx-auto my-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                Ha cursado, completado y aprobado satisfactoriamente el ciclo integral de:
                <div className="text-base sm:text-lg font-bold text-[#39A900] my-2 font-heading">
                  INDUCCIÓN INSTITUCIONAL & REGLAMENTO DEL APRENDIZ SENA
                </div>
                <span className="text-xs text-slate-600 block">
                  Conforme a los lineamientos del <strong>Acuerdo 002 de 2026</strong> del Consejo Directivo Nacional del SENA,
                  apropiando sus Derechos, Deberes, Prohibiciones, Faltas y Procedimiento Disciplinario.
                </span>
                <div className="mt-3 inline-block bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-800">
                  Programa: <strong>{profile.programName}</strong> | Ficha: <strong>{profile.fichaNumber}</strong>
                </div>
              </div>

              {/* Intensity & Rating */}
              <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto my-4 py-2 border-y border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Intensidad</span>
                  <span className="font-bold text-slate-900">20 Horas</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Evaluación</span>
                  <span className="font-bold text-emerald-700">
                    {profile.finalExamScore ? `${profile.finalExamScore}% (Aprobado)` : '100% (Meritorio)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha de Emisión</span>
                  <span className="font-bold text-slate-900">{issueDate}</span>
                </div>
              </div>

              {/* Signatures & QR Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 pt-6 mt-4">
                {/* Instructor Signature */}
                <div className="flex flex-col items-center">
                  <div className="font-serif italic text-lg sm:text-xl text-slate-700 font-bold mb-1 border-b border-slate-400 w-44 pb-1">
                    Olga P. Méndez
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">Olga Patricia Méndez</div>
                  <div className="text-[10px] text-slate-500">Instructora Líder de Inducción</div>
                </div>

                {/* Verification Seal & QR */}
                <div className="flex flex-col items-center order-first sm:order-none">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center p-1 text-amber-700 shadow-sm relative mb-1">
                    <ShieldCheck className="w-8 h-8 text-[#39A900]" />
                    <div className="absolute -bottom-1 bg-amber-500 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full uppercase">
                      OFICIAL
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-600 mt-1 font-bold">
                    Cód: {verificationCode}
                  </div>
                </div>

                {/* Subdirector Signature */}
                <div className="flex flex-col items-center">
                  <div className="font-serif italic text-lg sm:text-xl text-slate-700 font-bold mb-1 border-b border-slate-400 w-44 pb-1">
                    Dr. H. Moreno V.
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">Dr. Hernando Moreno</div>
                  <div className="text-[10px] text-slate-500">Subdirector de Centro</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Footer (Screen only) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Código de Verificación:</span>
            <code className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">
              {verificationCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Copiar código"
            >
              {copied ? (
                <span className="text-emerald-600 font-bold text-[11px]">¡Copiado!</span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-300 dark:border-emerald-700/60 shadow-2xs">
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sincronizado Automáticamente (Ficha {profile.fichaNumber})</span>
            </div>
            {onOpenGoogleSync && (
              <button
                onClick={() => {
                  playSound('click');
                  onOpenGoogleSync();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                title="Ver detalles de sincronización con Google Drive y hojas de cálculo"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gestión de Hoja</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
