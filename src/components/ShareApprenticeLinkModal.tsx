import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  QrCode, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Mail,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface ShareApprenticeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichaNumber: string;
}

export const ShareApprenticeLinkModal: React.FC<ShareApprenticeLinkModalProps> = ({
  isOpen,
  onClose,
  fichaNumber,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'templates'>('link');

  if (!isOpen) return null;

  // Construct apprentice-specific link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const apprenticeUrl = `${origin}${pathname}?role=aprendiz`;

  const whatsAppMessage = `🟢 *INDUCCIÓN SENA 2026 - REGLAMENTO DEL APRENDIZ (FICHA ${fichaNumber})*\n\nEstimado(a) aprendiz, te comparto el enlace institucional para realizar tu proceso de inducción interactivo al Reglamento del Aprendiz (Acuerdo 002 de 2026):\n\n👉 *Ingresa aquí:* ${apprenticeUrl}\n\n*Instrucciones:*\n1. Ingresa al enlace y personaliza tu nombre completo y documento.\n2. Completa los 6 módulos de derechos, deberes y prohibiciones.\n3. Presenta el examen final y genera tu *Certificado Oficial de Inducción*.\n\n_Instructora: Olga Patricia Méndez_`;

  const emailTemplate = `ASUNTO: Inducción Oficial al Reglamento del Aprendiz SENA - Ficha ${fichaNumber}

Estimados aprendices:

Les doy una cordial bienvenida a su proceso de formación profesional integral en el SENA. 

Para dar cumplimiento a la fase de inducción y apropiación del Reglamento del Aprendiz (Acuerdo 002 de 2026), deben ingresar a la plataforma interactiva a través del siguiente enlace exclusivo para aprendices:

🔗 Enlace de Inducción: ${apprenticeUrl}

Pasos para la certificación:
1. Ingresen al enlace y verifiquen sus datos personales (nombre y cédula).
2. Exploren los módulos de Derechos, Deberes, Faltas y Medidas Formativas.
3. Realicen el minijuego de clasificación de normas.
4. Aprueben la evaluación final con mínimo el 80% para descargar su Certificado Oficial de Inducción.

Los resultados y certificaciones se registrarán automáticamente en el sistema central de seguimiento.

Atentamente,
Olga Patricia Méndez
Instructora SENA - Ficha ${fichaNumber}`;

  const handleCopyLink = () => {
    playSound('click');
    navigator.clipboard.writeText(apprenticeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsApp = () => {
    playSound('click');
    navigator.clipboard.writeText(whatsAppMessage);
    setCopiedWhatsAppText(true);
    setTimeout(() => setCopiedWhatsAppText(false), 2500);
  };

  const handleOpenWhatsAppDirect = () => {
    playSound('click');
    const encoded = encodeURIComponent(whatsAppMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyEmail = () => {
    playSound('click');
    navigator.clipboard.writeText(emailTemplate);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2500);
  };

  // QR Code URL via high-reliability API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(apprenticeUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00324D] to-[#014d75] dark:from-slate-950 dark:to-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39A900]/20 border border-[#39A900]/40 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Compartir Enlace con Aprendices
                <span className="text-[10px] bg-[#39A900] text-white font-bold px-1.5 py-0.5 rounded-sm uppercase">
                  Ficha {fichaNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Enlace blindado exclusivo para inducción y certificación
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 pt-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'link'
                ? 'border-[#39A900] text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enlace Directo</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'qr'
                ? 'border-[#39A900] text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Código QR para Proyectar</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'templates'
                ? 'border-[#39A900] text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mensajes Listos (WhatsApp / Correo)</span>
          </button>
        </div>

        {/* Tab 1: Direct Link */}
        {activeTab === 'link' && (
          <div className="p-6 space-y-5 text-xs sm:text-sm">
            {/* Security Guarantee Box */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#39A900] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Perfil de Aprendiz Aislado y Protegido:</strong>
                Los aprendices que ingresen por este enlace sólo verán sus módulos, gamificación y examen.
                <strong> No tendrán acceso a Google Sheets, sincronizaciones, ni a los datos de otros aprendices.</strong>
              </div>
            </div>

            {/* URL Display and Copy Bar */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Enlace Oficial para los Aprendices:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apprenticeUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs select-all focus:outline-hidden"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#39A900] hover:bg-[#329400] text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Instant Sharing Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleOpenWhatsAppDirect}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>
              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{copiedEmailText ? '¡Plantilla Copiada!' : 'Copiar Plantilla de Correo'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: QR Code */}
        {activeTab === 'qr' && (
          <div className="p-6 text-center space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Proyecta este código en el salón de clases o en una sesión de Teams/Meet. Los aprendices podrán escanearlo con la cámara de su celular para abrir directamente la inducción.
            </p>

            <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-slate-200">
              <img
                src={qrCodeUrl}
                alt="Código QR Inducción SENA Aprendices"
                className="w-56 h-56 mx-auto object-contain"
              />
              <div className="mt-2 text-slate-900 font-bold text-xs">
                Ficha {fichaNumber} • Inducción Aprendices
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <a
                href={qrCodeUrl}
                download={`QR_Induccion_SENA_Ficha_${fichaNumber}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Descargar Imagen QR</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Templates */}
        {activeTab === 'templates' && (
          <div className="p-6 space-y-5 text-xs">
            {/* WhatsApp Template */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#25D366]" />
                  Mensaje para Grupos de WhatsApp
                </span>
                <button
                  onClick={handleCopyWhatsApp}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {copiedWhatsAppText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWhatsAppText ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] max-h-36 overflow-y-auto">
                {whatsAppMessage}
              </pre>
            </div>

            {/* Email / SofiaPlus Template */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-500" />
                  Plantilla para Correo Electrónico o Anuncio SofiaPlus / Zajuna
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {copiedEmailText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmailText ? '¡Copiado!' : 'Copiar Plantilla'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] max-h-36 overflow-y-auto">
                {emailTemplate}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
