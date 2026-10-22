import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface InstructorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const InstructorAuthModal: React.FC<InstructorAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  // Valid credentials: Ficha number, PIN, email or common instructor password
  const VALID_KEYS = [
    '2824190',
    '0723',
    'olga2026',
    'sena2026',
    'olgainstructora0723@gmail.com',
    'olmopez71@gmail.com',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();

    if (VALID_KEYS.includes(cleanPin)) {
      playSound('complete');
      if (rememberMe) {
        localStorage.setItem('sena_instructor_auth', 'true');
      }
      setErrorMsg('');
      onAuthenticated();
      onClose();
    } else {
      playSound('wrong');
      setErrorMsg('PIN o credencial no reconocida. Utiliza el número de Ficha 2824190 o tu correo institucional.');
    }
  };

  const handleQuickUnlock = (code: string) => {
    setPin(code);
    playSound('click');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00324D] to-[#014d75] dark:from-slate-950 dark:to-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Acceso del Instructor
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-sm uppercase">
                  Privado
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Instructora: Olga Patricia Méndez
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            <strong className="block font-semibold mb-0.5">Control de Privacidad y Roles:</strong>
            Los aprendices no tienen acceso a este panel para proteger la configuración de hojas de cálculo, webhooks y registros de otros alumnos.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                PIN de Acceso o Correo del Instructor
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900] font-mono"
                  placeholder="Ej: 2824190 o olga2026"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Quick Helper for Olga */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Clave predeterminada:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickUnlock('2824190')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Ficha 2824190
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickUnlock('olga2026')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  olga2026
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#39A900] rounded-sm focus:ring-[#39A900] border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Mantener mi sesión activa de instructora en este navegador
              </span>
            </label>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Ingresar al Panel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
