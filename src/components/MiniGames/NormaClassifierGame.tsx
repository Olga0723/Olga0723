import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Award,
  ArrowRight,
  Flame
} from 'lucide-react';
import { ClassifierCard } from '../../types/induction';
import { playSound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface NormaClassifierGameProps {
  cards: ClassifierCard[];
  onEarnXp: (amount: number) => void;
  onClose: () => void;
}

export const NormaClassifierGame: React.FC<NormaClassifierGameProps> = ({
  cards,
  onEarnXp,
  onClose,
}) => {
  const [shuffledCards, setShuffledCards] = useState<ClassifierCard[]>(() =>
    [...cards].sort(() => Math.random() - 0.5)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'derecho' | 'deber' | 'prohibicion' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentCard = shuffledCards[currentIndex];

  const handleSelect = (category: 'derecho' | 'deber' | 'prohibicion') => {
    if (isAnswered || gameOver) return;

    setSelectedCategory(category);
    setIsAnswered(true);

    const isCorrect = category === currentCard.category;

    if (isCorrect) {
      playSound('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const points = 20 * multiplier;
      setScore((prev) => prev + points);

      if (newStreak % 4 === 0) {
        playSound('streak');
      }
    } else {
      playSound('wrong');
      setStreak(0);
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex + 1 < shuffledCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedCategory(null);
      setIsAnswered(false);
    } else {
      // Completed all cards!
      setGameOver(true);
      playSound('complete');
      onEarnXp(score);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#39A900', '#00324D', '#F59E0B', '#3B82F6'],
      });
    }
  };

  const handleRestart = () => {
    playSound('click');
    setShuffledCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedCategory(null);
    setIsAnswered(false);
    setGameOver(false);
  };

  const categoryConfigs = [
    {
      id: 'derecho' as const,
      label: 'Es un DERECHO',
      sub: 'Garantía o libertad',
      icon: ShieldCheck,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'border-blue-500',
      badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'deber' as const,
      label: 'Es un DEBER',
      sub: 'Obligación o compromiso',
      icon: CheckCircle2,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'border-emerald-500',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'prohibicion' as const,
      label: 'Es una PROHIBICIÓN',
      sub: 'Conducta vetada o falta',
      icon: AlertTriangle,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      border: 'border-amber-500',
      badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00324D] to-[#014d75] dark:from-slate-950 dark:to-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Clasificador Veloz de Normas</h3>
                <span className="text-xs bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Minijuego SENA
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Clasifica la situación: ¿Es Derecho, Deber o Prohibición?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <div className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Racha x{streak}</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-slate-300">Puntaje</div>
              <div className="text-base font-extrabold text-yellow-400 font-heading">
                {score} XP
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {!gameOver ? (
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>
                Tarjeta <strong>{currentIndex + 1}</strong> de {shuffledCards.length}
              </span>
              <span>
                Racha máxima: <strong className="text-emerald-700 dark:text-emerald-400">{maxStreak}</strong>
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-[#39A900] h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
              />
            </div>

            {/* Current card statement */}
            <div className="min-h-[140px] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-center shadow-inner mb-6">
              <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                "{currentCard.statement}"
              </p>
            </div>

            {/* Selection Buttons */}
            {!isAnswered ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categoryConfigs.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelect(cat.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center group cursor-pointer shadow-xs active:scale-95 ${cat.color}`}
                    >
                      <Icon className="w-7 h-7 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm tracking-wide">{cat.label}</span>
                      <span className="text-[11px] opacity-80">{cat.sub}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Answer Feedback block */
              <div className="space-y-4 animate-fadeIn">
                <div
                  className={`p-4 rounded-xl border-2 flex items-start gap-3.5 ${
                    selectedCategory === currentCard.category
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  {selectedCategory === currentCard.category ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                      {selectedCategory === currentCard.category
                        ? '¡Respuesta Correcta!'
                        : '¡Respuesta Incorrecta!'}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 border dark:border-slate-700">
                        {currentCard.articleRef}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1 opacity-90 leading-relaxed">
                      {currentCard.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Siguiente Tarjeta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Game Over screen */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 shadow-md">
              <Award className="w-10 h-10" />
            </div>

            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              ¡Ronda Completada!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mt-1 mb-6">
              Has demostrado gran agilidad clasificando los derechos, deberes y prohibiciones del Reglamento SENA.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Puntos Ganados</div>
                <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300">+{score} XP</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/60 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="text-xs text-orange-700 dark:text-orange-400 font-medium">Mayor Racha</div>
                <div className="text-2xl font-black text-orange-800 dark:text-orange-300">{maxStreak} seguidos</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar de Nuevo</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Continuar Inducción</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Acuerdo 009 de 2024 • Reglamento del Aprendiz SENA</span>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium underline cursor-pointer"
          >
            Cerrar Minijuego
          </button>
        </div>
      </div>
    </div>
  );
};
