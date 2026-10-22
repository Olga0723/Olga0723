import React, { useEffect, useState } from 'react';
import { useToast, ToastItem } from '../context/ToastContext';
import { 
  Award, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  X, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  Flag,
  ShieldCheck,
  Briefcase,
  Scale,
  AlertTriangle
} from 'lucide-react';

const BadgeIconMap: Record<string, React.FC<{ className?: string }>> = {
  Flag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Briefcase,
  Award,
};

const SingleToast: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration, onDismiss]);

  // Determine styling and icon based on toast type
  let iconElement = <Sparkles className="w-6 h-6 text-emerald-400" />;
  let borderClass = 'border-emerald-500/40';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
  let gradientBg = 'from-slate-900 via-slate-900 to-slate-950';

  if (toast.type === 'badge_unlocked') {
    const IconComponent = (toast.badge?.icon && BadgeIconMap[toast.badge.icon]) || Award;
    iconElement = (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0 animate-bounce">
        <IconComponent className="w-6 h-6" />
      </div>
    );
    borderClass = 'border-amber-400/60 ring-2 ring-amber-400/20 shadow-amber-500/20';
    badgeColor = 'bg-amber-400/20 text-amber-300 border border-amber-400/40';
    gradientBg = 'from-slate-900 via-amber-950/30 to-slate-950';
  } else if (toast.type === 'module_completed') {
    iconElement = (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#39A900] flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
        <CheckCircle2 className="w-6 h-6" />
      </div>
    );
    borderClass = 'border-emerald-500/50 ring-2 ring-emerald-500/20';
    badgeColor = 'bg-[#39A900]/25 text-emerald-300 border border-emerald-500/40';
    gradientBg = 'from-slate-900 via-emerald-950/40 to-slate-950';
  } else if (toast.type === 'exam_passed') {
    iconElement = (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-yellow-500/40 shrink-0">
        <GraduationCap className="w-6 h-6" />
      </div>
    );
    borderClass = 'border-yellow-400/70 ring-2 ring-yellow-400/30';
    badgeColor = 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40';
    gradientBg = 'from-slate-900 via-yellow-950/40 to-slate-950';
  } else if (toast.type === 'error') {
    iconElement = (
      <div className="w-10 h-10 rounded-2xl bg-rose-600/30 flex items-center justify-center text-rose-400 shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>
    );
    borderClass = 'border-rose-500/50';
    badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    gradientBg = 'from-slate-900 via-rose-950/30 to-slate-950';
  } else {
    iconElement = (
      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-[#39A900] dark:text-emerald-400 shrink-0">
        <CheckCircle2 className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative w-84 sm:w-96 rounded-2xl p-4 bg-gradient-to-br ${gradientBg} text-white border ${borderClass} shadow-2xl backdrop-blur-md overflow-hidden transition-all transform animate-in slide-in-from-top-4 sm:slide-in-from-right-4 duration-300 hover:scale-[1.01]`}
    >
      {/* Glow overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 relative z-10">
        {iconElement}

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
              {toast.type === 'badge_unlocked'
                ? 'Nuevo Logro'
                : toast.type === 'module_completed'
                ? 'Módulo Superado'
                : toast.type === 'exam_passed'
                ? 'Certificación SENA'
                : 'Notificación'}
            </span>

            {toast.xpEarned && (
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <Zap className="w-3 h-3 fill-current text-amber-400" />
                <span>+{toast.xpEarned} XP</span>
              </span>
            )}
          </div>

          <h5 className="font-bold text-sm text-white font-heading leading-tight truncate">
            {toast.title}
          </h5>

          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
            {toast.message}
          </p>

          {/* Progress / condition details */}
          {toast.badge && (
            <div className="text-[11px] text-amber-200/90 font-medium mt-1">
              {toast.badge.description}
            </div>
          )}

          {toast.progressInfo && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
              <span className="text-emerald-400 font-semibold">
                Progreso: {toast.progressInfo.current} de {toast.progressInfo.total} módulos
              </span>
              <span className="font-bold">
                {Math.round((toast.progressInfo.current / toast.progressInfo.total) * 100)}%
              </span>
            </div>
          )}

          {/* Action button if present */}
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>{toast.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className={`h-full transition-all linear duration-75 ${
            toast.type === 'badge_unlocked'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
              : toast.type === 'error'
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-[#39A900] to-emerald-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const GamificationToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-[120] flex flex-col gap-3 pointer-events-auto max-w-full"
    >
      {toasts.map((toast) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
