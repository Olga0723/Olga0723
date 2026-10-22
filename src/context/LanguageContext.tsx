import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSound } from '../utils/audio';

export type Language = 'es' | 'en';

const TRANSLATIONS = {
  es: {
    // Header & Institutional
    senaBrand: 'SERVICIO NACIONAL DE APRENDIZAJE • SENA',
    senaDirectorate: 'Dirección de Formación Profesional Integral • Colombia',
    inductionTitle: 'Inducción SENA CGTS',
    regulationsSubtitle: 'Reglamento del Aprendiz (Acuerdo 002 de 2026)',
    apprenticePortal: 'Portal Aprendiz',
    instructorPanel: 'Panel Instructora',
    apprenticeMode: 'Modo Aprendiz',
    instructorMode: 'Panel Instructora (Olga)',
    viewAsApprentice: 'Ver como Aprendiz',
    switchProfile: 'Salir de Perfil',
    switchRole: 'Cambiar Rol',
    exitToLanding: 'Salir a Portada',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    soundOn: 'Sonido activado',
    soundMuted: 'Sonido silenciado',
    searchPlaceholder: 'Buscar en el Reglamento...',
    search: 'Buscar',
    finalExam: 'Examen Final',
    viewCertificate: 'Ver Certificado',
    officialCertificate: 'Certificado Oficial',
    shareWithApprentices: 'Compartir con Aprendices',
    apprenticeLink: 'Enlace Aprendices',
    myApprenticeProfile: 'Mi Perfil de Aprendiz',
    instructorOlga: 'Instructora Olga',
    administrator: 'Administradora',
    progressTitle: 'Progreso Inducción',
    modulesCompleted: 'módulos superados',

    // Landing Page
    roleSelectionBadge: 'Selección de Rol Institucional',
    howToEnter: '¿Cómo deseas ingresar al prototipo?',
    roleDescription: 'Para garantizar que las pantallas y privilegios no se confundan, selecciona si eres el Instructor (con clave administrativa) o el Aprendiz (llenando tus datos de caracterización).',
    watchVideoTutorial: 'Ver Video Tutorial de la Inducción',
    instructorCardTitle: 'Soy Instructor(a) SENA',
    instructorCardSubtitle: 'Olga Patricia Méndez • Supervisión & Hojas de Cálculo',
    apprenticeCardTitle: 'Soy Aprendiz SENA',
    apprenticeCardSubtitle: 'Caracterízate y elige tu avatar 3D para tu inducción',
    requiresPassword: 'Requiere Clave',
    noPasswordOpen: 'Sin Clave • Abierto',
    cohortBadge: 'Ficha 2824190',
    enterAsInstructor: 'Ingresar como Instructor (Pedir Clave)',
    enterAsApprentice: 'Llenar Datos de Caracterización (Sin Clave)',
    instructorPasswordLabel: 'Contraseña del Instructor',
    passwordPlaceholder: 'Ingresa tu contraseña',
    passwordIncorrect: 'Contraseña incorrecta. Por favor verifica tus credenciales.',
    validatePasswordBtn: 'Validar Clave & Entrar al Panel',
    cancel: 'Cancelar',
    fullNameLabel: 'Nombre Completo del Aprendiz *',
    namePlaceholder: 'Ej: Carlos Andrés Rodríguez Patiño',
    docTypeLabel: 'Tipo Doc.',
    docNumberLabel: 'Número de Documento *',
    docPlaceholder: 'Ej: 1024567890',
    fichaLabel: 'Número de Ficha',
    emailLabel: 'Correo Electrónico',
    programLabel: 'Programa de Formación',
    programPlaceholder: 'Ej: Tecnología en Análisis y Desarrollo de Software',
    enterInductionBtn: 'Ingresar a la Inducción SENA',
    chooseAvatar3D: 'Selecciona tu Avatar 3D de Aprendiz',
    chooseAvatarSubtitle: 'Elige el personaje femenino o masculino que te representará en la inducción.',
    allAvatars: 'Todos',
    femaleAvatars: 'Femeninos',
    maleAvatars: 'Masculinos',

    // Features & alerts
    instructorFeature1: 'Sincronización automática a Google Sheets y Google Drive.',
    instructorFeature2: 'Monitoreo del avance de los aprendices y notas del examen.',
    instructorFeature3: 'Centro de convocatoria con enlace y código QR para aprendices.',
    instructorFeature4: 'Descarga de reportes completos en CSV y TSV.',
    apprenticeFeature1: 'Estudio de los 6 módulos normativos del Acuerdo 002 de 2026.',
    apprenticeFeature2: 'Minijuego clasificador de normas y acumulación de puntos XP.',
    apprenticeFeature3: 'Examen final y emisión de Certificado Oficial con código único.',
    apprenticeFeature4: 'Sin clave: Solo diligencias tus datos para personalizar tu diploma.',
    characterizationAlert: 'Datos de Caracterización: Estos datos figurarán en tu Certificado Oficial de Inducción expedido por el SENA.',
    securityBannerTitle: 'Separación Total de Roles:',
    securityBannerDesc: 'Los aprendices realizan su inducción sin acceso a la configuración de hojas de cálculo ni datos de otros estudiantes.',
    senaDfpBadge: 'SENA DFP • 2026',

    // Video Modal & Moments
    videoModalTitle: 'Tutorial: Cómo realizar la inducción',
    videoModalSubtitle: 'Paso a paso para realizar tu inducción y expedir tu certificado oficial',
    exitVideo: 'Salir del Video',
    closeVideo: 'Cerrar Video',
    openInDrive: 'Abrir en Google Drive',
    openInNewTab: 'Ver en Pestaña Nueva',
    copyLink: 'Copiar Enlace',
    copiedLink: '¡Copiado!',
    formatToggle: 'Formato',
    videoTroubleshoot: '¿No se reproduce en el visor? Google Drive puede restringir reproductores integrados. Usa el botón verde para abrirlo en Google Drive sin bloqueos.',
    videoMomentsGuide: 'Momentos del Video Tutorial',
    videoMoment1: 'Momento 1: Presentación y Bienvenida a la Inducción',
    videoMoment2: 'Momento 2: Normas, Derechos, Deberes y Clasificador',
    videoMoment3: 'Momento 3: Evaluación Final y Certificación Oficial',

    // Additional UI & Profile switching
    languageLabel: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    switchToEnglish: 'Cambiar a Inglés',
    switchToSpanish: 'Cambiar a Español',
    exitCurrentProfile: 'Salir de este Perfil',
    switchProfilePrompt: 'Salir del perfil actual y regresar a la selección de roles',
    switchToInstructor: 'Cambiar a Instructora',
    switchToApprentice: 'Cambiar a Aprendiz',
    instructorConsoleSubtitle: 'Consola de Administración, Sincronización de Hojas y Seguimiento de Cohorte',
    apprenticeConsoleSubtitle: 'Reglamento del Aprendiz, Derechos, Deberes & Certificación Oficial',
    instructorLeaderTitle: 'PANEL DEL INSTRUCTOR LÍDER • SENA',
    fichaConvocatoria: 'Ficha 2824190 • Convocatoria Oficial',
    backToInstructor: 'Volver a Panel Instructora',
    shareLink: 'Compartir Enlace',
    previewNotice: 'Modo Previsualización: Estás viendo la inducción exactamente como la ve el aprendiz.',
    previewWarning: 'Los aprendices no tienen acceso a Google Drive ni al panel administrativo.',

    // Apprentice Dashboard
    welcomeApprentice: '¡Bienvenido',
    induction2026: 'Inducción SENA 2026',
    heroDescription: 'Estás a punto de iniciar tu formación en',
    playClassifier: 'Jugar Clasificador Veloz (+XP)',
    videoTutorialBtn: 'Tutorial en Video',
    consultRegulations: 'Consultar Reglamento',
    apprenticeDataTitle: 'Datos del Aprendiz para el Certificado Oficial:',
    customizeProfileBtn: 'Personalizar Mi Nombre y Cédula',
    modulesSectionTitle: 'Módulos Formativos del Reglamento',
    modulesSectionSubtitle: 'Estudia cada capítulo del Acuerdo 002 de 2026, analiza los casos cotidianos y completa los desafíos.',
    saveChanges: 'Guardar Cambios',
    apprenticeDataModalTitle: 'Datos del Aprendiz',
    apprenticeDataModalSubtitle: 'Esta información figurará en el Certificado Oficial de Inducción',
    regionalLabel: 'Regional',
    trainingCenterLabel: 'Centro de Formación',
    avatar3D: 'Avatar 3D',
    selectOrWriteProgram: 'Selecciona o escribe el programa',
  },
  en: {
    // Header & Institutional
    senaBrand: 'NATIONAL LEARNING SERVICE • SENA',
    senaDirectorate: 'Comprehensive Vocational Training Directorate • Colombia',
    inductionTitle: 'SENA CGTS Induction',
    regulationsSubtitle: 'Apprentice Regulations (Agreement 002 of 2026)',
    apprenticePortal: 'Apprentice Portal',
    instructorPanel: 'Instructor Dashboard',
    apprenticeMode: 'Apprentice Mode',
    instructorMode: 'Instructor Panel (Olga)',
    viewAsApprentice: 'View as Apprentice',
    switchProfile: 'Exit Profile',
    switchRole: 'Switch Role',
    exitToLanding: 'Exit to Home',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    soundOn: 'Sound enabled',
    soundMuted: 'Sound muted',
    searchPlaceholder: 'Search Regulations...',
    search: 'Search',
    finalExam: 'Final Exam',
    viewCertificate: 'View Certificate',
    officialCertificate: 'Official Certificate',
    shareWithApprentices: 'Share with Apprentices',
    apprenticeLink: 'Apprentice Link',
    myApprenticeProfile: 'My Apprentice Profile',
    instructorOlga: 'Instructor Olga',
    administrator: 'Administrator',
    progressTitle: 'Induction Progress',
    modulesCompleted: 'modules completed',

    // Landing Page
    roleSelectionBadge: 'Institutional Role Selection',
    howToEnter: 'How do you wish to enter the prototype?',
    roleDescription: 'To ensure profiles and privileges remain separate, select whether you are the Instructor (password protected) or Apprentice (fill in registration data).',
    watchVideoTutorial: 'Watch Induction Video Tutorial',
    instructorCardTitle: 'I am SENA Instructor',
    instructorCardSubtitle: 'Olga Patricia Méndez • Supervision & Spreadsheets',
    apprenticeCardTitle: 'I am SENA Apprentice',
    apprenticeCardSubtitle: 'Register and pick your 3D avatar for your induction',
    requiresPassword: 'Password Required',
    noPasswordOpen: 'No Password • Open',
    cohortBadge: 'Cohort 2824190',
    enterAsInstructor: 'Sign In as Instructor (Password)',
    enterAsApprentice: 'Fill Registration Data (Open)',
    instructorPasswordLabel: 'Instructor Password',
    passwordPlaceholder: 'Enter your password',
    passwordIncorrect: 'Incorrect password. Please verify your credentials.',
    validatePasswordBtn: 'Validate Password & Enter Dashboard',
    cancel: 'Cancel',
    fullNameLabel: 'Apprentice Full Name *',
    namePlaceholder: 'E.g.: Carlos Andrés Rodríguez Patiño',
    docTypeLabel: 'Doc. Type',
    docNumberLabel: 'Document Number *',
    docPlaceholder: 'E.g.: 1024567890',
    fichaLabel: 'Cohort / Ficha Number',
    emailLabel: 'Email Address',
    programLabel: 'Training Program',
    programPlaceholder: 'E.g.: Software Analysis and Development Technology',
    enterInductionBtn: 'Enter SENA Induction',
    chooseAvatar3D: 'Choose your 3D Apprentice Avatar',
    chooseAvatarSubtitle: 'Pick the female or male character that will represent you during induction.',
    allAvatars: 'All',
    femaleAvatars: 'Female',
    maleAvatars: 'Male',

    // Features & alerts
    instructorFeature1: 'Automatic synchronization to Google Sheets and Google Drive.',
    instructorFeature2: 'Real-time apprentice progress monitoring and exam scores.',
    instructorFeature3: 'Enrollment hub with shareable links and QR codes for apprentices.',
    instructorFeature4: 'Full cohort report downloads in CSV and TSV formats.',
    apprenticeFeature1: 'Study the 6 regulatory modules of Agreement 002 of 2026.',
    apprenticeFeature2: 'Fast classifier mini-game and XP point accumulation.',
    apprenticeFeature3: 'Final exam and issuance of Official Certificate with unique code.',
    apprenticeFeature4: 'No password needed: Simply fill in your details to customize your diploma.',
    characterizationAlert: 'Apprentice Registration: These details will appear on your Official Induction Certificate issued by SENA.',
    securityBannerTitle: 'Complete Role Separation:',
    securityBannerDesc: 'Apprentices complete their induction without access to spreadsheet configuration or other students\' personal data.',
    senaDfpBadge: 'SENA DFP • 2026',

    // Video Modal & Moments
    videoModalTitle: 'Tutorial: How to complete induction',
    videoModalSubtitle: 'Step by step to complete induction and earn your official certificate',
    exitVideo: 'Exit Video',
    closeVideo: 'Close Video',
    openInDrive: 'Open in Google Drive',
    openInNewTab: 'Open in New Tab',
    copyLink: 'Copy Link',
    copiedLink: 'Copied!',
    formatToggle: 'Format',
    videoTroubleshoot: 'Video not playing inside frame? Google Drive can restrict embedded players. Use the green button to open directly in Google Drive without restrictions.',
    videoMomentsGuide: 'Video Tutorial Moments',
    videoMoment1: 'Moment 1: Presentation & Welcome to Induction',
    videoMoment2: 'Moment 2: Regulations, Rights, Duties & Classifier',
    videoMoment3: 'Moment 3: Final Assessment & Official Certification',

    // Additional UI & Profile switching
    languageLabel: 'Language',
    english: 'English',
    spanish: 'Spanish',
    switchToEnglish: 'Switch to English',
    switchToSpanish: 'Switch to Spanish',
    exitCurrentProfile: 'Exit Current Profile',
    switchProfilePrompt: 'Exit current profile and return to role selection',
    switchToInstructor: 'Switch to Instructor',
    switchToApprentice: 'Switch to Apprentice',
    instructorConsoleSubtitle: 'Management Console, Spreadsheet Sync & Cohort Tracking',
    apprenticeConsoleSubtitle: 'Apprentice Regulations, Rights, Duties & Official Certification',
    instructorLeaderTitle: 'LEAD INSTRUCTOR DASHBOARD • SENA',
    fichaConvocatoria: 'Cohort 2824190 • Official Induction',
    backToInstructor: 'Back to Instructor Panel',
    shareLink: 'Share Link',
    previewNotice: 'Preview Mode: You are viewing induction exactly as the apprentice sees it.',
    previewWarning: 'Apprentices do not have access to Google Drive or the administrative panel.',

    // Apprentice Dashboard
    welcomeApprentice: 'Welcome',
    induction2026: 'SENA Induction 2026',
    heroDescription: 'You are about to start your training in',
    playClassifier: 'Play Fast Classifier (+XP)',
    videoTutorialBtn: 'Video Tutorial',
    consultRegulations: 'Consult Regulations',
    apprenticeDataTitle: 'Apprentice Data for Official Certificate:',
    customizeProfileBtn: 'Customize Name & ID',
    modulesSectionTitle: 'Regulatory Training Modules',
    modulesSectionSubtitle: 'Study each chapter of Agreement 002 of 2026, analyze everyday cases and overcome challenges.',
    saveChanges: 'Save Changes',
    apprenticeDataModalTitle: 'Apprentice Data',
    apprenticeDataModalSubtitle: 'This information will appear on the Official Induction Certificate',
    regionalLabel: 'Regional',
    trainingCenterLabel: 'Training Center',
    avatar3D: '3D Avatar',
    selectOrWriteProgram: 'Select or enter the program',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS['es'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sena_language');
      if (saved === 'en' || saved === 'es') return saved;
    }
    return 'es';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sena_language', language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    playSound('click');
    setLanguageState((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: TranslationKey): string => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.es;
    return currentDict[key] || TRANSLATIONS.es[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
