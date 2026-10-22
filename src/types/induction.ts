export type DocumentType = 'CC' | 'TI' | 'CE' | 'PEP' | 'PPT';

export interface ApprenticeProfile {
  id: string;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  programName: string;
  fichaNumber: string;
  regional: string;
  trainingCenter: string;
  headquarters: string;
  modality: 'Presencial' | 'Virtual' | 'Distancia';
  avatarId: string;
  xp: number;
  level: number;
  completedModuleIds: string[];
  unlockedBadgeIds: string[];
  finalExamScore?: number;
  certificateCode?: string;
  certifiedAt?: string;
}

export type NormaType = 'derecho' | 'deber' | 'prohibicion' | 'medida_formativa' | 'sancion';

export interface RegulationArticle {
  number: string;
  title: string;
  chapter: string;
  summary: string;
  fullText: string;
  category: NormaType;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  context?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  normativeReference: string;
  points: number;
}

export interface DilemmaCase {
  id: string;
  title: string;
  situation: string;
  avatarIcon: string;
  options: {
    id: string;
    action: string;
    feedback: string;
    isRecommended: boolean;
    points: number;
    regulationOutcome: string;
  }[];
  lesson: string;
}

export interface InductionModule {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  bgGradient: string;
  iconName: string;
  acuerdoRef: string;
  keyConcepts: {
    title: string;
    description: string;
    icon: string;
    tipAlert?: string;
  }[];
  articles: RegulationArticle[];
  dilemmas: DilemmaCase[];
  quiz: QuizQuestion[];
  xpReward: number;
}

export interface ClassifierCard {
  id: string;
  statement: string;
  category: 'derecho' | 'deber' | 'prohibicion';
  explanation: string;
  articleRef: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiredXp?: number;
  condition: string;
}

export interface CohortStudent {
  id: string;
  fullName: string;
  document: string;
  program: string;
  ficha: string;
  progressPercent: number;
  quizAverage: number;
  status: 'Completado' | 'En Progreso' | 'No Iniciado';
  completedAt?: string;
  certificateId?: string;
  flaggedTopic?: string;
  avatarId?: string;
}
