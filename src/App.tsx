import React, { useState, useEffect } from 'react';
import { 
  LandingPage 
} from './components/LandingPage';
import { 
  Header 
} from './components/Header';
import { 
  ModuleCard 
} from './components/ModuleCard';
import { 
  BadgesBar 
} from './components/BadgesBar';
import { 
  InductionPlanBanner 
} from './components/InductionPlanBanner';
import { 
  ModuleModal 
} from './components/ModuleModal';
import { 
  NormaClassifierGame 
} from './components/MiniGames/NormaClassifierGame';
import { 
  FinalExamModal 
} from './components/FinalExamModal';
import { 
  CertificateModal 
} from './components/CertificateModal';
import { 
  ProfileEditModal 
} from './components/ProfileEditModal';
import { 
  RegulationSearchModal 
} from './components/RegulationSearchModal';
import { 
  InstructorDashboard 
} from './components/InstructorDashboard';
import { 
  GoogleSheetsSyncModal 
} from './components/GoogleSheetsSyncModal';
import { 
  InstructorAuthModal 
} from './components/InstructorAuthModal';
import { 
  ShareApprenticeLinkModal 
} from './components/ShareApprenticeLinkModal';
import { 
  VideoModal 
} from './components/VideoModal';
import { getAvatarImage } from './data/avatarsData';
import { SpreadsheetInfo } from './services/googleSheetsService';
import { 
  autoSyncApprenticeRecord, 
  flushSyncQueue 
} from './services/autoSyncService';
import { SenaLogo } from './components/SenaLogo';
import { ToastProvider, useToast } from './context/ToastContext';
import { GamificationToastContainer } from './components/GamificationToast';

import { 
  INITIAL_APPRENTICE, 
  INDUCTION_MODULES, 
  CLASSIFIER_CARDS, 
  BADGES, 
  FINAL_EXAM_QUESTIONS, 
  MOCK_COHORT_STUDENTS 
} from './data/senaRegulationsData';

import { 
  ApprenticeProfile, 
  InductionModule, 
  CohortStudent 
} from './types/induction';

import { 
  Zap, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Eye,
  UserCheck,
  Share2,
  Play
} from 'lucide-react';

import { playSound } from './utils/audio';

function AppContent() {
  const { notifyModuleCompleted, notifyBadgeUnlocked, notifyExamPassed, notifySuccess } = useToast();

  const [profile, setProfile] = useState<ApprenticeProfile>(INITIAL_APPRENTICE);
  const [cohort, setCohort] = useState<CohortStudent[]>(MOCK_COHORT_STUDENTS);

  // Instructor Authentication State (Default to true for Instructor Olga)
  const [isInstructorAuthenticated, setIsInstructorAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sena_instructor_auth');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  // URL query param role detection (?role=aprendiz vs ?role=instructor)
  const [urlRole] = useState<'apprentice' | 'instructor' | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('role') || params.get('rol');
      if (r === 'aprendiz' || r === 'apprentice') return 'apprentice';
      if (r === 'instructor') return 'instructor';
    }
    return null;
  });

  // Current view state: Start on landing page by default to choose role cleanly
  const [currentView, setCurrentView] = useState<'landing' | 'apprentice' | 'instructor'>('landing');

  // Modals state
  const [activeModule, setActiveModule] = useState<InductionModule | null>(null);
  const [showClassifierGame, setShowClassifierGame] = useState(false);
  const [showFinalExam, setShowFinalExam] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGoogleSyncModal, setShowGoogleSyncModal] = useState(false);
  const [showInstructorAuthModal, setShowInstructorAuthModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [googleSyncMode, setGoogleSyncMode] = useState<'single' | 'cohort' | 'share'>('cohort');
  const [connectedSpreadsheet, setConnectedSpreadsheet] = useState<SpreadsheetInfo | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sena_linked_sheet');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Dark mode state with screen blur transition
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sena_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isBlurTransitioning, setIsBlurTransitioning] = useState(false);

  // Sync html element class on mount and change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    playSound('click');
    setIsBlurTransitioning(true);
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sena_dark_mode', String(next));
      }
      return next;
    });

    // Screen blur transition timer
    setTimeout(() => {
      setIsBlurTransitioning(false);
    }, 600);
  };

  const handleOpenGoogleSync = (mode: 'single' | 'cohort' | 'share' = 'cohort') => {
    playSound('click');
    setGoogleSyncMode(mode);
    setShowGoogleSyncModal(true);
  };

  // Switch to Instructor view immediately with full privileges
  const handleRequestInstructorView = () => {
    playSound('click');
    setShowInstructorAuthModal(true);
  };

  const handleInstructorAuthenticated = () => {
    setIsInstructorAuthenticated(true);
    setCurrentView('instructor');
    notifySuccess(
      '¡Bienvenida, Instructora Olga!',
      'Has ingresado al Panel de Control, Sincronización y Seguimiento de Cohorte.'
    );
  };

  const handleLogoutInstructor = () => {
    playSound('click');
    setCurrentView('apprentice');
    notifySuccess('Modo Aprendiz', 'Has cambiado a la visualización de aprendiz.');
  };

  // Background auto-sync queue flush on startup and connectivity restoration
  useEffect(() => {
    flushSyncQueue().then((res) => {
      if (res.succeeded > 0) {
        notifySuccess(
          'Sincronización en la Nube',
          `Se enviaron automáticamente ${res.succeeded} registro(s) pendientes a la hoja central.`
        );
      }
    });

    const handleOnline = () => {
      flushSyncQueue().then((res) => {
        if (res.succeeded > 0) {
          notifySuccess(
            'Conexión Restablecida',
            `Se sincronizaron automáticamente ${res.succeeded} registro(s) pendientes en la hoja de cálculo.`
          );
        }
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [notifySuccess]);

  // Complete module handler with gamification toast feedback
  const handleCompleteModule = (moduleId: string, earnedXp: number) => {
    const isAlreadyCompleted = profile.completedModuleIds.includes(moduleId);
    const updatedCount = isAlreadyCompleted
      ? profile.completedModuleIds.length
      : profile.completedModuleIds.length + 1;

    // Match badge for this module
    const badgeIdMap: Record<string, string> = {
      'mod-1': 'badge-1',
      'mod-2': 'badge-2',
      'mod-3': 'badge-3',
      'mod-4': 'badge-4',
      'mod-5': 'badge-5',
      'mod-6': 'badge-6',
    };

    const newBadgeId = badgeIdMap[moduleId];
    const isNewBadge = newBadgeId && !profile.unlockedBadgeIds.includes(newBadgeId);

    // Fire celebratory toast for module
    const targetModule = INDUCTION_MODULES.find((m) => m.id === moduleId);
    if (targetModule) {
      notifyModuleCompleted(targetModule, earnedXp, {
        current: updatedCount,
        total: INDUCTION_MODULES.length,
      });
    }

    // Fire celebratory toast for newly unlocked badge
    if (isNewBadge) {
      const targetBadge = BADGES.find((b) => b.id === newBadgeId);
      if (targetBadge) {
        setTimeout(() => {
          notifyBadgeUnlocked(targetBadge);
        }, 1200);
      }
    }

    setProfile((prev) => {
      const updatedModuleIds = isAlreadyCompleted
        ? prev.completedModuleIds
        : [...prev.completedModuleIds, moduleId];

      const updatedBadges =
        isNewBadge
          ? [...prev.unlockedBadgeIds, newBadgeId]
          : prev.unlockedBadgeIds;

      const newXp = isAlreadyCompleted ? prev.xp : prev.xp + earnedXp;

      return {
        ...prev,
        xp: newXp,
        completedModuleIds: updatedModuleIds,
        unlockedBadgeIds: updatedBadges,
      };
    });

    // Update student in cohort table
    setCohort((prev) =>
      prev.map((s) => {
        if (s.id === profile.id || s.document.includes(profile.documentNumber)) {
          const progressPercent = Math.min(100, Math.round((updatedCount / INDUCTION_MODULES.length) * 100));
          return {
            ...s,
            progressPercent,
            status: progressPercent === 100 && profile.certificateCode ? 'Completado' : 'En Progreso',
          };
        }
        return s;
      })
    );
  };

  // Minigame XP handler with toast feedback
  const handleEarnGameXp = (xpEarned: number) => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
    }));
    notifySuccess('¡Desafío Superado!', `+${xpEarned} XP sumados a tu perfil de formación.`);
  };

  // Pass Final Exam handler with official certification toast
  const handlePassFinalExam = (score: number, certificateCode: string) => {
    const today = new Date().toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const certifiedBadge = BADGES.find((b) => b.id === 'badge-certified');

    // Fire celebratory exam toast
    notifyExamPassed(score, certificateCode, () => setShowCertificate(true));

    if (certifiedBadge && !profile.unlockedBadgeIds.includes('badge-certified')) {
      setTimeout(() => {
        notifyBadgeUnlocked(certifiedBadge);
      }, 1500);
    }

    setProfile((prev) => {
      const updatedBadges = prev.unlockedBadgeIds.includes('badge-certified')
        ? prev.unlockedBadgeIds
        : [...prev.unlockedBadgeIds, 'badge-certified'];

      return {
        ...prev,
        xp: prev.xp + 500,
        finalExamScore: score,
        certificateCode,
        certifiedAt: today,
        unlockedBadgeIds: updatedBadges,
      };
    });

    // Background zero-popup auto-sync to Google Sheets (Option 2)
    const updatedProfile: ApprenticeProfile = {
      ...profile,
      xp: profile.xp + 500,
      finalExamScore: score,
      certificateCode,
      certifiedAt: today,
      unlockedBadgeIds: profile.unlockedBadgeIds.includes('badge-certified')
        ? profile.unlockedBadgeIds
        : [...profile.unlockedBadgeIds, 'badge-certified'],
    };

    autoSyncApprenticeRecord(updatedProfile, 'final_exam_passed')
      .then((syncRes) => {
        setTimeout(() => {
          if (syncRes.destination === 'webhook') {
            notifySuccess(
              '¡Sincronización Automática Exitosa!',
              `Certificado ${certificateCode} transmitido y registrado en la hoja de cálculo.`,
              'Ver Certificado',
              () => setShowCertificate(true)
            );
          } else {
            notifySuccess(
              'Registro Oficial Guardado',
              `Certificado ${certificateCode} respaldado y enlazado a la Ficha ${profile.fichaNumber}.`,
              'Ver Certificado',
              () => setShowCertificate(true)
            );
          }
        }, 2200);
      })
      .catch((err) => {
        console.warn('Auto-sync execution note:', err);
      });

    // Update in cohort
    setCohort((prev) =>
      prev.map((s) => {
        if (s.id === profile.id || s.document.includes(profile.documentNumber)) {
          return {
            ...s,
            progressPercent: 100,
            quizAverage: score,
            status: 'Completado',
            certificateId: certificateCode,
            completedAt: today,
          };
        }
        return s;
      })
    );
  };

  // Select apprentice from Instructor view to test / simulate
  const handleSelectApprenticeFromCohort = (student: CohortStudent) => {
    setProfile((prev) => ({
      ...prev,
      id: student.id,
      fullName: student.fullName,
      documentNumber: student.document.replace(/\D/g, '') || prev.documentNumber,
      programName: student.program === 'ADSO' ? 'Tecnología en Análisis y Desarrollo de Software (ADSO)' : prev.programName,
      fichaNumber: student.ficha,
      certificateCode: student.certificateId,
      finalExamScore: student.quizAverage,
      certifiedAt: student.completedAt,
    }));
    setCurrentView('apprentice');
    notifySuccess('Perfil Seleccionado', `Visualizando vista de aprendiz para ${student.fullName}`);
  };

  const completedModulesCount = profile.completedModuleIds.length;
  const isCertified = Boolean(profile.certificateCode);

  // 1. Landing Page (Role Selection with password Sena1234 or characterization)
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <GamificationToastContainer />
        {isBlurTransitioning && (
          <div
            className="fixed inset-0 z-[100] pointer-events-none theme-blur-active bg-slate-900/20 dark:bg-black/40 backdrop-blur-md"
            aria-hidden="true"
          />
        )}
        <LandingPage
          initialRoleTab={urlRole}
          currentProfile={profile}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onSelectInstructor={() => {
            setIsInstructorAuthenticated(true);
            setCurrentView('instructor');
            notifySuccess(
              '¡Bienvenida, Instructora Olga!',
              'Clave Sena1234 validada. Acceso concedido al Panel de Sincronización y Supervisión.'
            );
          }}
          onSelectApprentice={(customProfile) => {
            setProfile(customProfile);
            setCurrentView('apprentice');
            notifySuccess(
              '¡Bienvenido a tu Inducción!',
              `Datos de ${customProfile.fullName} registrados para la certificación oficial.`
            );
          }}
          onOpenVideoModal={() => setShowVideoModal(true)}
        />

        {/* Video Tutorial Modal (Accessible directly from landing page) */}
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl="https://docs.google.com/videos/d/1tOtNxcS44TKjW5mn0gy_vyeQnClCEVZ6nnfVa_Vt5Og/edit?usp=drive_link"
          title="Tutorial: Cómo realizar la inducción"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative">
      {/* Toast Notification Container for Gamification */}
      <GamificationToastContainer />

      {/* Fullscreen Blur Transition Overlay when toggling mode */}
      {isBlurTransitioning && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none theme-blur-active bg-slate-900/20 dark:bg-black/40 backdrop-blur-md"
          aria-hidden="true"
        />
      )}

      {/* Atmospheric ambient glow in dark mode */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-700">
        <div className="absolute top-1/6 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Header */}
      <Header
        profile={profile}
        currentView={currentView}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onViewChange={(view) => {
          if (view === 'instructor') {
            handleRequestInstructorView();
          } else {
            setCurrentView('apprentice');
          }
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenExam={() => setShowFinalExam(true)}
        onOpenCertificate={() => setShowCertificate(true)}
        onOpenGoogleSync={() => handleOpenGoogleSync(currentView === 'instructor' ? 'cohort' : 'single')}
        totalModules={INDUCTION_MODULES.length}
        isInstructorAuthenticated={isInstructorAuthenticated}
        onOpenInstructorAuth={() => setShowInstructorAuthModal(true)}
        onLogoutInstructor={handleLogoutInstructor}
        onOpenShareLink={() => setShowShareLinkModal(true)}
        hideInstructorSwitchForApprentices={urlRole === 'apprentice'}
        onExitToLanding={() => {
          playSound('click');
          setCurrentView('landing');
        }}
      />

      {/* Sticky Instructor Preview Notice when Olga is previewing the apprentice experience */}
      {isInstructorAuthenticated && currentView === 'apprentice' && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md z-30 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-950 shrink-0" />
              <span>
                <strong>Modo Previsualización:</strong> Estás viendo la inducción exactamente como la ve el aprendiz.
                Los aprendices no tienen acceso a Google Drive ni al panel administrativo.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowShareLinkModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/40 hover:bg-white/60 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir Enlace</span>
              </button>
              <button
                onClick={() => setCurrentView('instructor')}
                className="px-3.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Volver a Panel Instructora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6 relative z-10">
        {currentView === 'instructor' ? (
          /* Instructor Mode (Olga's portal) */
          isInstructorAuthenticated ? (
            <InstructorDashboard
              cohort={cohort}
              activeProfile={profile}
              onSelectApprentice={handleSelectApprenticeFromCohort}
              onOpenGoogleSync={handleOpenGoogleSync}
              onOpenShareLinkModal={() => setShowShareLinkModal(true)}
              onPreviewApprenticeMode={() => setCurrentView('apprentice')}
              spreadsheetUrl={connectedSpreadsheet?.webViewLink || null}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900">
              <h2 className="text-4xl font-black text-rose-600 dark:text-rose-400 mb-2">403</h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 font-bold">No tienes acceso a esta página</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Por favor, inicia sesión como instructor.</p>
              <button
                onClick={() => setShowInstructorAuthModal(true)}
                className="mt-6 px-6 py-2.5 rounded-xl bg-[#39A900] text-white font-bold text-sm hover:bg-[#329400] transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          )
        ) : (
          /* Apprentice Mode */
          <>
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#00324D] via-[#014063] to-[#00324D] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-slate-700/50 dark:border-slate-800 transition-colors">
              {/* Background Watermark shape */}
              <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 flex items-center justify-end pointer-events-none pr-8">
                <SenaLogo className="w-80 h-80 fill-current" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#39A900] text-white font-bold text-xs uppercase tracking-wider shadow-xs">
                    Inducción SENA 2026
                  </span>
                  <span className="text-xs text-emerald-300 font-medium">
                    Acuerdo 002 de 2026
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight">
                  ¡Bienvenido, {profile.fullName.split(' ')[0]}!
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-300 mt-2 leading-relaxed">
                  Estás a punto de iniciar tu formación en <strong>{profile.programName}</strong>.
                  Domina tus <strong>Derechos</strong>, cumple tus <strong>Deberes</strong>, evita las <strong>Prohibiciones</strong> y obtén tu <strong>Certificado Oficial de Inducción</strong> superando las dinámicas gamificadas.
                </p>

                {/* Primary Quick CTA buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      playSound('click');
                      setShowClassifierGame(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current text-slate-950" />
                    <span>Jugar Clasificador Veloz (+XP)</span>
                  </button>

                  {isCertified ? (
                    <button
                      onClick={() => {
                        playSound('complete');
                        setShowCertificate(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Ver Certificado Oficial (Aprobado)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playSound('click');
                        setShowFinalExam(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Evaluación Final de Inducción</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playSound('click');
                      setShowSearchModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/15 text-slate-200 text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Consultar Reglamento</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('click');
                      setShowVideoModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm transition-colors cursor-pointer"
                    title="Ver video tutorial explicativo de la inducción"
                  >
                    <Play className="w-4 h-4 fill-current text-emerald-300" />
                    <span>Tutorial en Video</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Apprentice Data Check Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border-2 border-[#39A900] bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getAvatarImage(profile.avatarId)}
                    alt="Avatar 3D del Aprendiz"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-xs">
                  <div className="text-slate-500 dark:text-slate-400">
                    Datos del Aprendiz para el Certificado Oficial:
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {profile.fullName} • <span className="font-mono text-xs">{profile.documentType} {profile.documentNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ficha: <strong>{profile.fichaNumber}</strong> • {profile.regional}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setShowProfileModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Personalizar Mi Nombre y Cédula</span>
              </button>
            </div>

            {/* Structured Induction Plan Accordion Banner */}
            <InductionPlanBanner />

            {/* Badges Bar */}
            <BadgesBar
              badges={BADGES}
              unlockedBadgeIds={profile.unlockedBadgeIds}
            />

            {/* Induction Modules Section Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                    Módulos Formativos del Reglamento
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estudia cada capítulo del Acuerdo 002 de 2026, analiza los casos cotidianos y completa los desafíos.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {completedModulesCount} de {INDUCTION_MODULES.length} módulos superados
                  </span>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {INDUCTION_MODULES.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    isCompleted={profile.completedModuleIds.includes(mod.id)}
                    onOpen={() => setActiveModule(mod)}
                  />
                ))}
              </div>
            </div>

            {/* Final Exam Callout Footer */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-950 dark:to-teal-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-5 border border-emerald-700/40 dark:border-emerald-800/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-8 h-8 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-heading">
                    {isCertified
                      ? '¡Felicitaciones! Has completado tu Inducción SENA'
                      : '¿Listo para obtener tu Certificado Oficial de Inducción?'}
                  </h4>
                  <p className="text-xs text-emerald-100 dark:text-emerald-200 max-w-xl mt-0.5">
                    {isCertified
                      ? `Tu certificado oficial (Código ${profile.certificateCode}) ya está expedido y listo para imprimir o anexar a tu hoja de vida.`
                      : 'Presenta la evaluación integral de 10 preguntas. Con el 80% de aciertos generarás de inmediato tu diploma oficial con código de verificación institucional.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isCertified ? (
                  <button
                    onClick={() => {
                      playSound('complete');
                      setShowCertificate(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Award className="w-5 h-5" />
                    <span>Ver Mi Certificado Oficial</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      playSound('click');
                      setShowFinalExam(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Iniciar Examen Final</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-slate-500 dark:text-slate-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#39A900] flex items-center justify-center text-white p-1 shadow-xs">
              <SenaLogo className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Servicio Nacional de Aprendizaje SENA</span>
              <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                Dirección de Formación Profesional Integral • Colombia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setShowSearchModal(true)}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Glosario del Reglamento
            </button>
            <span>•</span>
            <button
              onClick={() => setShowClassifierGame(true)}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Minijuego Flash
            </button>
            <span>•</span>
            <button
              onClick={() => {
                playSound('click');
                if (currentView === 'instructor') {
                  setCurrentView('apprentice');
                } else {
                  handleRequestInstructorView();
                }
              }}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium cursor-pointer"
            >
              {currentView === 'apprentice' ? 'Acceso Instructores' : 'Volver a Modo Aprendiz'}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Module Learning Modal */}
      {activeModule && (
        <ModuleModal
          module={activeModule}
          isCompleted={profile.completedModuleIds.includes(activeModule.id)}
          onCompleteModule={handleCompleteModule}
          onClose={() => setActiveModule(null)}
        />
      )}

      {/* 2. Fast Classifier Minigame */}
      {showClassifierGame && (
        <NormaClassifierGame
          cards={CLASSIFIER_CARDS}
          onEarnXp={handleEarnGameXp}
          onClose={() => setShowClassifierGame(false)}
        />
      )}

      {/* 3. Final Exam Modal */}
      {showFinalExam && (
        <FinalExamModal
          questions={FINAL_EXAM_QUESTIONS}
          profile={profile}
          onPassExam={handlePassFinalExam}
          onOpenCertificate={() => setShowCertificate(true)}
          onClose={() => setShowFinalExam(false)}
        />
      )}

      {/* 4. Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          profile={profile}
          onClose={() => setShowCertificate(false)}
          onOpenGoogleSync={() => handleOpenGoogleSync('single')}
        />
      )}

      {/* 5. Profile Edit Modal */}
      {showProfileModal && (
        <ProfileEditModal
          profile={profile}
          onSave={(updated) => {
            setProfile(updated);
            notifySuccess('Datos Actualizados', `Certificado vinculado a ${updated.fullName}`);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* 6. Regulation Search / Glossary Modal */}
      {showSearchModal && (
        <RegulationSearchModal
          modules={INDUCTION_MODULES}
          onClose={() => setShowSearchModal(false)}
          onOpenModule={(modId) => {
            const found = INDUCTION_MODULES.find((m) => m.id === modId);
            if (found) setActiveModule(found);
          }}
        />
      )}

      {/* 7. Google Drive & Google Sheets Sync Modal (Instructor exclusive) */}
      <GoogleSheetsSyncModal
        isOpen={showGoogleSyncModal}
        onClose={() => setShowGoogleSyncModal(false)}
        activeProfile={profile}
        cohort={cohort}
        initialMode={googleSyncMode}
        onSyncComplete={(sheetInfo) => {
          setConnectedSpreadsheet(sheetInfo);
          notifySuccess(
            '¡Hoja Vinculada en Drive!',
            `Sincronización configurada con ${sheetInfo.name}`,
            'Abrir en Drive',
            () => window.open(sheetInfo.webViewLink, '_blank')
          );
        }}
      />

      {/* 8. Instructor Access Authentication Modal */}
      <InstructorAuthModal
        isOpen={showInstructorAuthModal}
        onClose={() => setShowInstructorAuthModal(false)}
        onAuthenticated={handleInstructorAuthenticated}
      />

      {/* 9. Share Apprentice Link Modal (WhatsApp, QR, Email) */}
      <ShareApprenticeLinkModal
        isOpen={showShareLinkModal}
        onClose={() => setShowShareLinkModal(false)}
        fichaNumber={profile.fichaNumber}
      />

      {/* 10. Video Tutorial Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl="https://docs.google.com/videos/d/1tOtNxcS44TKjW5mn0gy_vyeQnClCEVZ6nnfVa_Vt5Og/edit?usp=drive_link"
        title="Tutorial: Cómo realizar la inducción"
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
