import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  FileText,
  Moon,
  Sun,
  FileSpreadsheet,
  Share2,
  LogOut,
  Eye,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { ApprenticeProfile } from '../types/induction';
import { isSoundEnabled, setSoundEnabled, playSound } from '../utils/audio';
import { SenaLogo } from './SenaLogo';
import { getAvatarImage } from '../data/avatarsData';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  profile: ApprenticeProfile;
  currentView: 'apprentice' | 'instructor';
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onViewChange: (view: 'apprentice' | 'instructor') => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenExam: () => void;
  onOpenCertificate: () => void;
  onOpenGoogleSync?: () => void;
  totalModules: number;
  isInstructorAuthenticated?: boolean;
  onOpenInstructorAuth?: () => void;
  onLogoutInstructor?: () => void;
  onOpenShareLink?: () => void;
  hideInstructorSwitchForApprentices?: boolean;
  onExitToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentView,
  darkMode,
  onToggleDarkMode,
  onViewChange,
  onOpenProfile,
  onOpenSearch,
  onOpenExam,
  onOpenCertificate,
  onOpenGoogleSync,
  totalModules,
  onOpenShareLink,
  hideInstructorSwitchForApprentices = false,
  onExitToLanding,
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const completedCount = profile.completedModuleIds.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);
  const isCertified = !!profile.certificateCode;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      {/* Institutional Top Bar */}
      <div className={`text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b transition-colors ${
        currentView === 'instructor'
          ? 'bg-gradient-to-r from-[#002538] via-[#013854] to-[#002538] dark:from-slate-950 dark:to-slate-900 border-amber-500/40'
          : 'bg-[#00324D] dark:bg-slate-950 border-[#002538] dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          {currentView === 'instructor' ? (
            <>
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold tracking-wide text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('instructorLeaderTitle')}
              </span>
              <span className="hidden md:inline text-slate-400">|</span>
              <span className="hidden md:inline text-slate-200">
                Olga Patricia Méndez (olgainstructora0723@gmail.com)
              </span>
            </>
          ) : (
            <>
              <span className="flex h-2 w-2 rounded-full bg-[#39A900] animate-pulse"></span>
              <span className="font-medium tracking-wide">
                {t('senaBrand')}
              </span>
              <span className="hidden md:inline text-slate-300 dark:text-slate-400">|</span>
              <span className="hidden md:inline text-slate-300 dark:text-slate-400">
                {t('regulationsSubtitle')} • Ficha {profile.fichaNumber}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Main Role Switcher: Switch between Apprentice and Instructor */}
          {!hideInstructorSwitchForApprentices && (
            <div className="flex items-center bg-white/15 dark:bg-slate-800/90 rounded-lg p-0.5 border border-white/20 dark:border-slate-700 shadow-xs">
              <button
                onClick={() => {
                  playSound('click');
                  onViewChange('apprentice');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'apprentice'
                    ? 'bg-[#39A900] text-white shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
                title={language === 'es' ? 'Cambiar a Modo Aprendiz' : 'Switch to Apprentice Mode'}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{t('apprenticeMode')}</span>
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  onViewChange('instructor');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'instructor'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-white/10'
                }`}
                title={language === 'es' ? 'Cambiar a Panel Instructora' : 'Switch to Instructor Panel'}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('instructorMode')}</span>
              </button>
            </div>
          )}

          {/* Salir de un Perfil a otro / Volver a la Portada de Selección */}
          {onExitToLanding && (
            <button
              onClick={() => {
                playSound('click');
                onExitToLanding();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-all border border-rose-400/30 cursor-pointer shadow-xs active:scale-95"
              title={language === 'es' ? 'Salir del perfil actual y elegir otro perfil/rol' : 'Exit current profile to select another role'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('switchProfile')}</span>
            </button>
          )}

          {/* Language Toggle Button: English to Spanish and vice versa */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 shadow-xs cursor-pointer border border-emerald-400/40"
            title={language === 'es' ? 'Cambiar idioma a Inglés (Switch to English)' : 'Cambiar idioma a Español (Switch to Spanish)'}
            aria-label="Cambiar idioma / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-200" />
            <span className="font-extrabold tracking-wider">{language.toUpperCase()}</span>
            <span className="text-[10px] text-emerald-100 font-normal">
              {language === 'es' ? 'EN' : 'ES'}
            </span>
          </button>

          {/* Instructor Mode Quick Action: Share Link with Apprentices */}
          {currentView === 'instructor' && onOpenShareLink && (
            <button
              onClick={() => {
                playSound('click');
                onOpenShareLink();
              }}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#39A900] hover:bg-[#329400] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Share2 className="w-3 h-3" />
              <span>{t('shareWithApprentices')}</span>
            </button>
          )}

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            aria-label={soundOn ? t('soundOn') : t('soundMuted')}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={soundOn ? t('soundOn') : t('soundMuted')}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Dedicated Dark Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? t('lightMode') : t('darkMode')}
            title={darkMode ? t('lightMode') : t('darkMode')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 dark:bg-slate-800 dark:hover:bg-slate-700 border border-white/25 dark:border-slate-700 text-white font-medium text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline text-amber-200 font-bold">{t('lightMode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-200" />
                <span className="hidden sm:inline text-slate-200">{t('darkMode')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#39A900] to-[#287900] text-white shadow-lg shadow-[#39A900]/25 p-2 transition-transform hover:scale-105 shrink-0">
            <SenaLogo className="w-10 h-10 sm:w-12 sm:h-12 fill-current" />
          </div>

            <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
                {t('inductionTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                Acuerdo 002 de 2026
              </span>
              {currentView === 'instructor' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700">
                  {t('instructorPanel')}
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                  {t('apprenticePortal')}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentView === 'instructor'
                ? t('instructorConsoleSubtitle')
                : t('apprenticeConsoleSubtitle')}
            </p>
          </div>
        </div>

        {/* Center & Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Mode Switcher Button in Main Navbar for Quick Access */}
          {currentView === 'apprentice' ? (
            <button
              onClick={() => {
                playSound('click');
                onViewChange('instructor');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400/50 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              title={language === 'es' ? 'Ir al Panel de la Instructora Olga' : 'Go to Instructor Olga Panel'}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{t('instructorPanel')}</span>
              <span className="sm:hidden">{t('instructorOlga')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playSound('click');
                onViewChange('apprentice');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              title={language === 'es' ? 'Previsualizar como Aprendiz' : 'Preview as Apprentice'}
            >
              <GraduationCap className="w-4 h-4 text-[#39A900]" />
              <span className="hidden sm:inline">{t('viewAsApprentice')}</span>
              <span className="sm:hidden">{t('apprenticeMode')}</span>
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenSearch();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <span className="hidden md:inline">{t('searchPlaceholder')}</span>
            <span className="md:hidden">{t('search')}</span>
          </button>

          {/* Certificate / Exam Quick Badge (Shown in apprentice view) */}
          {currentView === 'apprentice' && (
            isCertified ? (
              <button
                onClick={() => {
                  playSound('complete');
                  onOpenCertificate();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">{t('viewCertificate')}</span>
                <span className="sm:hidden">Cert.</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  playSound('click');
                  onOpenExam();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#39A900] hover:bg-[#329400] text-white font-semibold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{t('finalExam')}</span>
                <span className="sm:hidden">Exam</span>
              </button>
            )
          )}

          {/* INSTRUCTOR ONLY: Google Drive & Google Sheets Sync button */}
          {currentView === 'instructor' && (
            <button
              onClick={() => {
                playSound('click');
                onOpenGoogleSync?.();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Almacenar datos de aprendices en Google Drive (Google Sheets)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
              <span className="hidden md:inline">Google Drive</span>
            </button>
          )}

          {/* INSTRUCTOR ONLY: Quick Share Link Button */}
          {currentView === 'instructor' && onOpenShareLink && (
            <button
              onClick={() => {
                playSound('click');
                onOpenShareLink();
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('apprenticeLink')}</span>
            </button>
          )}

          {/* User Profile Pill */}
          {currentView === 'apprentice' ? (
            <button
              onClick={() => {
                playSound('click');
                onOpenProfile();
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
              title={language === 'es' ? 'Haz clic para personalizar tu nombre y documento para el certificado oficial' : 'Click to customize your name and document for official certificate'}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={getAvatarImage(profile.avatarId)}
                  alt={profile.fullName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight max-w-[120px] truncate">
                  {profile.fullName.split(' ')[0]} {profile.fullName.split(' ')[1] || ''}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                  {t('myApprenticeProfile')}
                </div>
              </div>
            </button>
          ) : (
            /* Instructor Profile Badge */
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                O
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {t('instructorOlga')}
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
                  {t('administrator')}
                </div>
              </div>
            </div>
          )}

          {/* Quick Salir de Perfil Button directly in navbar */}
          {onExitToLanding && (
            <button
              onClick={() => {
                playSound('click');
                onExitToLanding();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              title={language === 'es' ? 'Salir del perfil actual y regresar a la pantalla de roles' : 'Exit current profile and return to role selection'}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden xl:inline">{t('switchProfile')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & XP subbar (Only shown in Apprentice view) */}
      {currentView === 'apprentice' && (
        <div className="bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-4 py-1.5 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <span className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                {t('progressTitle')}: <strong className="text-emerald-700 dark:text-emerald-400">{progressPercent}%</strong> ({completedCount}/{totalModules} {t('modulesCompleted')})
              </span>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#39A900] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{profile.xp} XP</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="truncate max-w-[200px]">{profile.programName}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
