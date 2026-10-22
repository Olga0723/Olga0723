import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Briefcase, 
  Check, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { InductionModule } from '../types/induction';
import { playSound } from '../utils/audio';

interface ModuleCardProps {
  module: InductionModule;
  isCompleted: boolean;
  onOpen: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Briefcase,
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  isCompleted,
  onOpen,
}) => {
  const IconComponent = ICON_MAP[module.iconName] || BookOpen;

  return (
    <div
      onClick={() => {
        playSound('click');
        onOpen();
      }}
      className={`group relative bg-white dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-5 sm:p-6 flex flex-col justify-between cursor-pointer overflow-hidden ${
        isCompleted
          ? 'border-emerald-300 dark:border-emerald-700/80 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 hover:border-[#39A900] dark:hover:border-emerald-500'
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${module.bgGradient}`}
      />

      <div>
        {/* Card header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${module.bgGradient} group-hover:scale-105 transition-transform`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                <Check className="w-3.5 h-3.5" /> Completado
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Módulo {module.number}
              </span>
            )}
          </div>
        </div>

        {/* Title & Reference */}
        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          {module.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
          {module.description}
        </p>

        {/* Feature Highlights Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {module.articles.length} Artículos
          </span>
          <span className="text-[11px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {module.dilemmas.length} Casos Reales
          </span>
          <span className="text-[11px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            Quiz de Módulo
          </span>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>+{module.xpReward} XP</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#39A900] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
          <span>{isCompleted ? 'Repasar Módulo' : 'Iniciar Módulo'}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
