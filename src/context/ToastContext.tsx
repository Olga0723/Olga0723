import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Badge, InductionModule } from '../types/induction';
import { playSound } from '../utils/audio';

export type ToastType = 'module_completed' | 'badge_unlocked' | 'exam_passed' | 'level_up' | 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  xpEarned?: number;
  badge?: Badge;
  module?: InductionModule;
  progressInfo?: { current: number; total: number };
  duration?: number; // ms
  actionLabel?: string;
  onAction?: () => void;
  timestamp: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  notifyModuleCompleted: (module: InductionModule, earnedXp: number, currentProgress: { current: number; total: number }) => void;
  notifyBadgeUnlocked: (badge: Badge) => void;
  notifyExamPassed: (score: number, certificateCode: string, onOpenCertificate?: () => void) => void;
  notifySuccess: (title: string, message: string, actionLabel?: string, onAction?: () => void) => void;
  notifyError: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      timestamp: Date.now(),
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 4)); // Keep up to 4 toasts
    return id;
  }, []);

  const notifyModuleCompleted = useCallback(
    (module: InductionModule, earnedXp: number, currentProgress: { current: number; total: number }) => {
      playSound('complete');
      addToast({
        type: 'module_completed',
        title: `¡Módulo ${module.number} Superado!`,
        message: module.title,
        xpEarned: earnedXp,
        module,
        progressInfo: currentProgress,
        duration: 5500,
      });
    },
    [addToast]
  );

  const notifyBadgeUnlocked = useCallback(
    (badge: Badge) => {
      playSound('levelup');
      addToast({
        type: 'badge_unlocked',
        title: '¡Nueva Insignia Desbloqueada!',
        message: badge.name,
        badge,
        duration: 6000,
      });
    },
    [addToast]
  );

  const notifyExamPassed = useCallback(
    (score: number, certificateCode: string, onOpenCertificate?: () => void) => {
      playSound('complete');
      addToast({
        type: 'exam_passed',
        title: '¡Certificación Oficial Obtenida!',
        message: `Aprobaste el examen integral con ${score}%. Código oficial: ${certificateCode}`,
        actionLabel: 'Ver Certificado',
        onAction: onOpenCertificate,
        duration: 7000,
      });
    },
    [addToast]
  );

  const notifySuccess = useCallback(
    (title: string, message: string, actionLabel?: string, onAction?: () => void) => {
      playSound('correct');
      addToast({
        type: 'success',
        title,
        message,
        actionLabel,
        onAction,
        duration: 4500,
      });
    },
    [addToast]
  );

  const notifyError = useCallback(
    (title: string, message: string) => {
      playSound('wrong');
      addToast({
        type: 'error',
        title,
        message,
        duration: 6000,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        notifyModuleCompleted,
        notifyBadgeUnlocked,
        notifyExamPassed,
        notifySuccess,
        notifyError,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
