import React, { useState } from 'react';
import { Check, Sparkles, UserCheck } from 'lucide-react';
import { AVATAR_OPTIONS, AvatarOption } from '../data/avatarsData';
import { playSound } from '../utils/audio';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarId: string) => void;
  showTitle?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  selectedAvatar, 
  onSelect,
  showTitle = true 
}) => {
  const [filter, setFilter] = useState<'all' | 'female' | 'male'>('all');

  const filtered = AVATAR_OPTIONS.filter((a) => {
    if (filter === 'all') return true;
    return a.gender === filter;
  });

  return (
    <div className="space-y-3.5">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Selecciona tu Avatar 3D de Aprendiz</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Elige el personaje femenino o masculino que te representará en la inducción.
            </p>
          </div>

          {/* Gender Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setFilter('all');
              }}
              className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Todos (6)
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setFilter('female');
              }}
              className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                filter === 'female'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Femeninos (3)
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setFilter('male');
              }}
              className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                filter === 'male'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Masculinos (3)
            </button>
          </div>
        </div>
      )}

      {/* Grid of 3D Avatars */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {filtered.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id || 
            (selectedAvatar === 'user' && avatar.id === 'male-1') ||
            (selectedAvatar === 'carlos' && avatar.id === 'male-1');

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => {
                playSound('click');
                onSelect(avatar.id);
              }}
              className={`group relative flex flex-col items-center p-1.5 rounded-2xl transition-all duration-200 cursor-pointer text-left border ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md scale-[1.03]'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:scale-[1.02]'
              }`}
              title={`${avatar.name} (${avatar.gender === 'female' ? 'Femenino' : 'Masculino'}) - ${avatar.role}`}
            >
              {/* Selected check badge */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-[#39A900] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Avatar Image 3D */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner mb-1.5">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  avatar.gender === 'female'
                    ? 'bg-rose-500/80 text-white'
                    : 'bg-sky-600/80 text-white'
                } backdrop-blur-xs`}>
                  {avatar.gender === 'female' ? 'Fem' : 'Masc'}
                </span>
              </div>

              {/* Name & Role */}
              <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate w-full text-center">
                {avatar.name}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
                {avatar.gender === 'female' ? 'Aprendiz' : 'Aprendiz'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
