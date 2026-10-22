import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Printer, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { QuizQuestion, ApprenticeProfile } from '../types/induction';
import { playSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FinalExamModalProps {
  questions: QuizQuestion[];
  profile: ApprenticeProfile;
  onPassExam: (score: number, certificateCode: string) => void;
  onOpenCertificate: () => void;
  onClose: () => void;
}

export const FinalExamModal: React.FC<FinalExamModalProps> = ({
  questions,
  profile,
  onPassExam,
  onOpenCertificate,
  onClose,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = answers[currentQuestion.id];

  const handleSelectOption = (optionId: string) => {
    playSound('click');
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    playSound('click');
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishExam();
    }
  };

  const handlePrevious = () => {
    playSound('click');
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const finishExam = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selectedId = answers[q.id];
      const selectedOpt = q.options.find((opt) => opt.id === selectedId);
      if (selectedOpt && selectedOpt.isCorrect) {
        correct += 1;
      }
    });

    const percent = Math.round((correct / questions.length) * 100);
    setCorrectCount(correct);
    setScorePercentage(percent);
    setIsCompleted(true);

    if (percent >= 80) {
      // Passed!
      const randomCode = `SENA-IND-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      playSound('levelup');
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#39A900', '#00324D', '#F59E0B', '#10B981'],
      });
      onPassExam(percent, randomCode);
    } else {
      playSound('wrong');
    }
  };

  const handleRestart = () => {
    playSound('click');
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setScorePercentage(0);
  };

  const passed = scorePercentage >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00324D] to-[#014d75] dark:from-slate-950 dark:to-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Evaluación Integral de Inducción</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Acuerdo 002 de 2026
                </span>
              </div>
              <p className="text-xs text-slate-300">
                10 preguntas integrales • Exigencia mínima para aprobar: 80% (8/10)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isCompleted ? (
          <div className="p-6 overflow-y-auto flex-1">
            {/* Progress indicators */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span>
                Pregunta <strong>{currentQuestionIndex + 1}</strong> de {questions.length}
              </span>
              <span>
                Respondidas: <strong>{Object.keys(answers).length}</strong> / {questions.length}
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-[#39A900] h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                Ref. Normativa: {currentQuestion.normativeReference}
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer text-xs sm:text-sm ${
                    selectedOptionId === opt.id
                      ? 'border-[#39A900] dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-medium shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedOptionId === opt.id
                        ? 'border-[#39A900] bg-[#39A900] text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {selectedOptionId === opt.id && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold mr-1.5 uppercase text-slate-500 dark:text-slate-400">
                      {opt.id}.
                    </span>
                    <span>{opt.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevious}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ← Anterior
              </button>

              <button
                disabled={!selectedOptionId}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>
                  {currentQuestionIndex + 1 === questions.length ? 'Finalizar Evaluación' : 'Siguiente'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                passed
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-[#39A900] dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
              }`}
            >
              {passed ? (
                <ShieldCheck className="w-12 h-12" />
              ) : (
                <AlertTriangle className="w-12 h-12" />
              )}
            </div>

            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              {passed ? '¡Felicitaciones! Has Aprobado la Inducción' : 'No alcanzaste el puntaje requerido'}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mt-1 mb-6">
              {passed
                ? 'Has asimilado con éxito los Derechos, Deberes, Prohibiciones y Régimen Disciplinario del Acuerdo 002 de 2026. Tu certificado oficial ya está disponible.'
                : 'Para obtener la certificación oficial de inducción debes alcanzar al menos el 80% (8 respuestas correctas). Puedes repasar los módulos y reintentar.'}
            </p>

            {/* Score Stats */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
              <div
                className={`p-4 rounded-xl border ${
                  passed
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Puntaje Final</div>
                <div
                  className={`text-2xl font-black ${
                    passed ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {scorePercentage}%
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Aciertos</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
                  {correctCount} / {questions.length}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {passed ? (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCertificate();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Award className="w-5 h-5 text-slate-950" />
                    <span>Ver e Imprimir Certificado Oficial</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
                  >
                    Cerrar y Volver
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00324D] dark:bg-slate-800 hover:bg-[#002235] dark:hover:bg-slate-700 text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Intentar Nuevamente</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Repasar Módulos Primero
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
