import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Play, AlertCircle, RefreshCw, Copy, Check, Video, ShieldCheck } from 'lucide-react';
import { playSound } from '../utils/audio';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

function extractGoogleFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  const [embedMode, setEmbedMode] = useState<'drive' | 'vids'>('drive');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playSound('click');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fileId = extractGoogleFileId(videoUrl) || '1tOtNxcS44TKjW5mn0gy_vyeQnClCEVZ6nnfVa_Vt5Og';

  // Construct embed URLs
  const driveEmbedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const vidsEmbedUrl = `https://docs.google.com/videos/d/${fileId}/preview`;
  
  // Direct link for opening in a new tab
  const directLink = videoUrl.includes('docs.google.com') || videoUrl.includes('drive.google.com')
    ? videoUrl
    : `https://docs.google.com/videos/d/${fileId}/edit?usp=drive_link`;

  const activeEmbedUrl = embedMode === 'drive' ? driveEmbedUrl : vidsEmbedUrl;

  const handleCopyLink = () => {
    playSound('click');
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => {
        playSound('click');
        onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00324D] dark:bg-slate-950 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#39A900]/25 border border-[#39A900]/50 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-[#39A900]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white leading-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Inducción SENA 2026
                </span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Paso a paso para realizar tu inducción y expedir tu certificado oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Abrir video directamente en Google Drive / Google Vids"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Google Drive</span>
            </a>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar ventana (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame with Fallback Action */}
        <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          <iframe
            key={activeEmbedUrl}
            className="w-full h-full border-0 absolute inset-0 z-0"
            src={activeEmbedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Informative Guidance & Quick Actions Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/90 p-4 border-t border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2 text-slate-600 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-[11px] sm:text-xs">
              <strong>¿No se reproduce en el visor?</strong> Google Drive puede restringir reproductores integrados. Usa el botón verde para abrirlo en Google Drive sin bloqueos.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setEmbedMode(embedMode === 'drive' ? 'vids' : 'drive');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Alternar entre modo Google Drive y Google Vids"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Formato: {embedMode === 'drive' ? 'Drive' : 'Vids'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Copiar enlace directo del tutorial"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00324D] hover:bg-[#014063] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ver en Pestaña Nueva</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
