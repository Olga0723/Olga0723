import React from 'react';
import { 
  Flag, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Briefcase, 
  Award,
  Lock,
  Sparkles
} from 'lucide-react';
import { Badge } from '../types/induction';

interface BadgesBarProps {
  badges: Badge[];
  unlockedBadgeIds: string[];
}

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Flag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Briefcase,
  Award,
};

export const BadgesBar: React.FC<BadgesBarProps> = ({
  badges,
  unlockedBadgeIds,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Insignias de Inducción Desbloqueables
          </h3>
        </div>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          {unlockedBadgeIds.length} de {badges.length} desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {badges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          const Icon = BADGE_ICONS[badge.icon] || Award;

          return (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-all group relative ${
                isUnlocked
                  ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 border-emerald-300 dark:border-emerald-700/60 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm ${
                  isUnlocked
                    ? `bg-gradient-to-br ${badge.color}`
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {isUnlocked ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                  {badge.name}
                </h5>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-tight line-clamp-1">
                  {badge.condition}
                </span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 dark:bg-slate-800 text-white text-[11px] rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 text-center border border-slate-700">
                <div className="font-bold text-amber-300">{badge.name}</div>
                <div className="text-slate-200 dark:text-slate-300 mt-0.5">{badge.description}</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                  {isUnlocked ? '✓ Obtenida' : `Bloqueada: ${badge.condition}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
