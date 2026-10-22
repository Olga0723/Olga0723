import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  Award, 
  Sparkles, 
  BookOpen, 
  Users, 
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  FileText,
  Play,
  Video,
  Globe
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import { ApprenticeProfile, DocumentType } from '../types/induction';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';
import { AvatarSelector } from './AvatarSelector';
import { getAvatarImage } from '../data/avatarsData';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  initialRoleTab?: 'instructor' | 'apprentice' | null;
  currentProfile: ApprenticeProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectInstructor: () => void;
  onSelectApprentice: (customProfile: ApprenticeProfile) => void;
  onOpenVideoModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  initialRoleTab = null,
  currentProfile,
  darkMode,
  onToggleDarkMode,
  onSelectInstructor,
  onSelectApprentice,
  onOpenVideoModal,
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'instructor' | 'apprentice' | null>(initialRoleTab);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Instructor Password State
  const [instructorPassword, setInstructorPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Apprentice Characterization Form State (No password required)
  const [fullName, setFullName] = useState(currentProfile.fullName || '');
  const [documentType, setDocumentType] = useState<DocumentType>(currentProfile.documentType || 'CC');
  const [documentNumber, setDocumentNumber] = useState(currentProfile.documentNumber || '');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [fichaNumber, setFichaNumber] = useState(currentProfile.fichaNumber || '2824190');
  const [programName, setProgramName] = useState(
    currentProfile.programName || 'Tecnología en Análisis y Desarrollo de Software (ADSO)'
  );
  const [regional, setRegional] = useState(currentProfile.regional || 'Regional Distrito Capital');
  const [trainingCenter, setTrainingCenter] = useState(
    currentProfile.trainingCenter || 'Centro de Tecnologías de la Información y las Comunicaciones (CTIC)'
  );
  const [avatarId, setAvatarId] = useState(currentProfile.avatarId || 'male-1');
  const [characError, setCharacError] = useState('');

  useEffect(() => {
    if (initialRoleTab) {
      setSelectedRole(initialRoleTab);
    }
  }, [initialRoleTab]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPwd = instructorPassword.trim();
    // Required password: Sena1234 (accepts Sena1234 or case-insensitive sena1234)
    if (cleanPwd === 'Sena1234' || cleanPwd.toLowerCase() === 'sena1234') {
      playSound('complete');
      setPasswordError('');
      if (typeof window !== 'undefined') {
        localStorage.setItem('sena_instructor_auth', 'true');
      }
      onSelectInstructor();
    } else {
      playSound('wrong');
      setPasswordError(t('passwordIncorrect'));
    }
  };

  const handleApprenticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setCharacError(language === 'es' ? 'Por favor ingresa tu nombre completo.' : 'Please enter your full name.');
      playSound('wrong');
      return;
    }
    if (!documentNumber.trim()) {
      setCharacError(language === 'es' ? 'Por favor ingresa tu número de documento.' : 'Please enter your document ID number.');
      playSound('wrong');
      return;
    }

    playSound('complete');
    setCharacError('');

    const updatedProfile: ApprenticeProfile = {
      ...currentProfile,
      fullName: fullName.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      email: email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@misena.edu.co`,
      fichaNumber: fichaNumber.trim() || '2824190',
      programName: programName.trim(),
      regional: regional.trim(),
      trainingCenter: trainingCenter.trim(),
      avatarId,
    };

    onSelectApprentice(updatedProfile);
  };

  const samplePrograms = language === 'es' ? [
    'Tecnología en Análisis y Desarrollo de Software (ADSO)',
    'Tecnología en Gestión de Redes de Datos',
    'Técnico en Contabilización de Operaciones Comerciales y Financieras',
    'Tecnología en Gestión Empresarial',
    'Técnico en Sistemas e Informática',
    'Tecnología en Control y Automatización Industrial',
    'Técnico en Servicios de Barismo y Mesa',
  ] : [
    'Technology in Software Analysis and Development (ADSO)',
    'Technology in Data Network Management',
    'Technician in Commercial and Financial Operations Accounting',
    'Technology in Business Management',
    'Technician in Systems and Computing',
    'Technology in Industrial Control and Automation',
    'Technician in Barista and Table Service',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#39A900]/10 dark:bg-[#39A900]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Institutional Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="bg-[#00324D] dark:bg-slate-950 text-white text-xs px-4 py-1.5 flex items-center justify-between gap-2 border-b border-[#002538]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#39A900] animate-pulse"></span>
            <span className="font-semibold tracking-wide">
              {t('senaBrand')}
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300">
              {t('senaDirectorate')}
            </span>
          </div>

          <div className="flex items-center gap-2">
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

            <button
              onClick={toggleSound}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={soundOn ? t('soundOn') : t('soundMuted')}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-all cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline font-bold text-amber-200">{t('lightMode')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-200" />
                  <span className="hidden sm:inline">{t('darkMode')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#39A900] to-[#287900] text-white p-2 shadow-md flex items-center justify-center">
              <SenaLogo className="w-9 h-9 fill-current" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                {t('induction2026')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('regulationsSubtitle')}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            {t('fichaConvocatoria')}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full relative z-10 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('roleSelectionBadge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
            {t('howToEnter')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('roleDescription')}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onOpenVideoModal();
              }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#00324D] hover:bg-[#014063] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-400/30 group"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3 h-3 fill-current text-emerald-300 dark:text-white" />
              </div>
              <span>{t('watchVideoTutorial')}</span>
            </button>
          </div>
        </div>

        {/* The Two Distinct Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* CARD 1: INSTRUCTOR ROLE */}
          <div 
            className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg ${
              selectedRole === 'instructor'
                ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-white dark:bg-slate-900'
                : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 bg-white/90 dark:bg-slate-900/90'
            }`}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#00324D] via-[#013f61] to-[#002538] text-white p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xs">
                  {t('requiresPassword')}
                </span>
                <span className="text-xs text-amber-200 font-semibold">
                  {t('cohortBadge')}
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading">
                    {t('instructorCardTitle')}
                  </h3>
                  <p className="text-xs text-slate-200">
                    {t('instructorCardSubtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5">
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('instructorFeature1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('instructorFeature2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('instructorFeature3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('instructorFeature4')}</span>
                </li>
              </ul>

              {/* Password Form or Activation Button */}
              {selectedRole !== 'instructor' ? (
                <button
                  onClick={() => {
                    playSound('click');
                    setSelectedRole('instructor');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t('enterAsInstructor')}</span>
                </button>
              ) : (
                <form onSubmit={handleInstructorSubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('instructorPasswordLabel')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={instructorPassword}
                        onChange={(e) => {
                          setInstructorPassword(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder={t('passwordPlaceholder')}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {passwordError && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{t('validatePasswordBtn')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* CARD 2: APPRENTICE ROLE (Caracterización sin clave) */}
          <div 
            className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg ${
              selectedRole === 'apprentice'
                ? 'border-[#39A900] ring-2 ring-[#39A900]/40 bg-white dark:bg-slate-900'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white/90 dark:bg-slate-900/90'
            }`}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#39A900] via-[#2f8a00] to-[#246b00] text-white p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs">
                  {t('noPasswordOpen')}
                </span>
                <span className="text-xs text-emerald-100 font-semibold">
                  {t('induction2026')}
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={getAvatarImage(avatarId)}
                    alt="Avatar 3D Aprendiz"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading">
                    {t('apprenticeCardTitle')}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {t('apprenticeCardSubtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5">
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Estudio de los 6 módulos normativos del <strong>Acuerdo 002 de 2026</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Minijuego clasificador de normas y acumulación de puntos <strong>XP</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Examen final y emisión de <strong>Certificado Oficial</strong> con código único.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Sin clave:</strong> Solo diligencias tus datos para personalizar tu diploma.</span>
                </li>
              </ul>

              {/* Characterization Form or Activation Button */}
              {selectedRole !== 'apprentice' ? (
                <button
                  onClick={() => {
                    playSound('click');
                    setSelectedRole('apprentice');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t('enterAsApprentice')}</span>
                </button>
              ) : (
                <form onSubmit={handleApprenticeSubmit} className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
                    <strong>Datos de Caracterización:</strong> Estos datos figurarán en tu Certificado Oficial de Inducción expedido por el SENA.
                  </div>

                  {characError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{characError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('fullNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('docTypeLabel')}
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                      >
                        <option value="CC">C.C.</option>
                        <option value="TI">T.I.</option>
                        <option value="CE">C.E.</option>
                        <option value="PPT">PPT</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('docNumberLabel')}
                      </label>
                      <input
                        type="text"
                        required
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder={t('docPlaceholder')}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#39A900] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('fichaLabel')}
                      </label>
                      <input
                        type="text"
                        value={fichaNumber}
                        onChange={(e) => setFichaNumber(e.target.value)}
                        placeholder="2824190"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#39A900] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('emailLabel')}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@misena.edu.co"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('programLabel')}
                    </label>
                    <input
                      type="text"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      list="program-options"
                      placeholder={t('programPlaceholder')}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                    />
                    <datalist id="program-options">
                      {samplePrograms.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  {/* 3D Avatar Selection Component */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <AvatarSelector selectedAvatar={avatarId} onSelect={setAvatarId} />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{t('enterInductionBtn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Informative Security Banner */}
        <div className="mt-10 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Separación Total de Roles:</strong> Los aprendices realizan su inducción sin acceso a la configuración de hojas de cálculo ni datos de otros estudiantes.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            SENA DFP • 2026
          </span>
        </div>
      </main>
    </div>
  );
};
