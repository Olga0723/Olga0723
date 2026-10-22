import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Award 
} from 'lucide-react';
import { InductionModule, DilemmaCase, QuizQuestion } from '../types/induction';
import { playSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ModuleModalProps {
  module: InductionModule;
  isCompleted: boolean;
  onCompleteModule: (moduleId: string, earnedXp: number) => void;
  onClose: () => void;
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  module,
  isCompleted,
  onCompleteModule,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'articles' | 'dilemmas' | 'quiz'>('concepts');

  // Dilemma state
  const [selectedDilemmaOptions, setSelectedDilemmaOptions] = useState<Record<string, string>>({});
  const [dilemmaFeedback, setDilemmaFeedback] = useState<Record<string, boolean>>({});

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleSelectDilemma = (dilemmaId: string, optionId: string) => {
    playSound('click');
    setSelectedDilemmaOptions((prev) => ({ ...prev, [dilemmaId]: optionId }));
    setDilemmaFeedback((prev) => ({ ...prev, [dilemmaId]: true }));
  };

  const handleSelectQuizAnswer = (questionId: string, optionId: string) => {
    if (quizSubmitted) return;
    playSound('click');
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = () => {
    playSound('click');
    let correctCount = 0;
    module.quiz.forEach((q) => {
      const selectedId = quizAnswers[q.id];
      const selectedOpt = q.options.find((opt) => opt.id === selectedId);
      if (selectedOpt && selectedOpt.isCorrect) {
        correctCount += 1;
      }
    });

    const passed = correctCount === module.quiz.length || (correctCount / module.quiz.length) >= 0.5;
    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (passed) {
      playSound('complete');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#39A900', '#00324D', '#10B981'],
      });
      onCompleteModule(module.id, module.xpReward);
    } else {
      playSound('wrong');
    }
  };

  const handleResetQuiz = () => {
    playSound('click');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] transition-colors">
        {/* Header */}
        <div className={`p-6 text-white bg-gradient-to-r ${module.bgGradient} relative flex-shrink-0`}>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
              Módulo {module.number}
            </span>
            <span className="text-xs font-medium text-white/90">
              {module.acuerdoRef}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-full shadow-xs">
                <Check className="w-3.5 h-3.5" /> Completado
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            {module.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl">
            {module.description}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Recompensa al aprobar: +{module.xpReward} XP</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('concepts');
            }}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'concepts'
                ? 'border-[#39A900] text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Conceptos Clave & Tips</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('articles');
            }}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'articles'
                ? 'border-[#39A900] text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Artículos Normativos ({module.articles.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('dilemmas');
            }}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dilemmas'
                ? 'border-[#39A900] text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Casos & Dilemas Reales</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('quiz');
            }}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'quiz'
                ? 'border-[#39A900] text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Evaluación de Módulo</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/60">
          {/* TAB 1: CONCEPTS */}
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Guía pedagógica para el Aprendiz:</strong>
                  Lee con atención los conceptos esenciales. Conocer tus derechos te empodera, y cumplir tus deberes construye tu perfil profesional.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {module.keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                          {idx + 1}
                        </span>
                        {concept.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {concept.description}
                      </p>
                    </div>

                    {concept.tipAlert && (
                      <div className="mt-3.5 pt-3 border-t border-amber-100 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl text-xs text-amber-900 dark:text-amber-200 font-medium flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{concept.tipAlert}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('articles');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>Continuar a Artículos Normativos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Texto normativo adaptado del <strong>Acuerdo 009 de 2024</strong> del Consejo Directivo Nacional del SENA:
              </p>

              {module.articles.map((art, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-mono">
                        {art.number}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {art.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border dark:border-slate-700">
                        {art.category}
                      </span>
                      {art.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border dark:border-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {art.fullText}
                  </p>

                  <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                    <strong>Resumen clave:</strong> {art.summary}
                  </div>
                </div>
              ))}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('concepts');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs cursor-pointer"
                >
                  ← Volver a Conceptos
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('dilemmas');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>Ir a Casos & Dilemas Reales</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DILEMMAS */}
          {activeTab === 'dilemmas' && (
            <div className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl p-4 text-xs sm:text-sm text-purple-950 dark:text-purple-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Simulación de Casos Cotidianos:</strong>
                  Analiza la situación y selecciona la decisión correcta. Aprenderás cómo actuar éticamente ante situaciones reales en el SENA.
                </div>
              </div>

              {module.dilemmas.map((dilemma) => {
                const selectedOptId = selectedDilemmaOptions[dilemma.id];
                const isAnswered = dilemmaFeedback[dilemma.id];
                const selectedOption = dilemma.options.find((o) => o.id === selectedOptId);

                return (
                  <div
                    key={dilemma.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          {dilemma.title}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Dilema de comportamiento ético y normativo
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {dilemma.situation}
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        ¿Qué harías tú en esta situación?
                      </span>
                      {dilemma.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleSelectDilemma(dilemma.id, option.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm cursor-pointer ${
                            selectedOptId === option.id
                              ? option.isRecommended
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 font-medium'
                                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 dark:border-rose-500 text-rose-950 dark:text-rose-100 font-medium'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                                selectedOptId === option.id
                                  ? option.isRecommended
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-rose-600 bg-rose-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {selectedOptId === option.id && <Check className="w-3 h-3" />}
                            </div>
                            <span className="leading-snug">{option.action}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Feedback block */}
                    {isAnswered && selectedOption && (
                      <div
                        className={`p-4 rounded-xl border text-xs sm:text-sm ${
                          selectedOption.isRecommended
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-2 mb-1">
                          {selectedOption.isRecommended ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>¡Decisión Correcta! (+{selectedOption.points} XP)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                              <span>Atención: Riesgo Normativo</span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 leading-relaxed">{selectedOption.feedback}</p>
                        <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 text-xs font-semibold">
                          <strong>Consecuencia según reglamento:</strong> {selectedOption.regulationOutcome}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                      <strong>Lección clave:</strong> {dilemma.lesson}
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('articles');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs cursor-pointer"
                >
                  ← Volver a Artículos
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('quiz');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>Realizar Evaluación de Módulo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Evaluación del Módulo:</strong>
                  Responde las siguientes preguntas. Al aprobar, desbloquearás la insignia correspondiente y sumarás{' '}
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">+{module.xpReward} XP</span> a tu perfil.
                </div>
              </div>

              {module.quiz.map((q, qIdx) => {
                const selectedOptId = quizAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#00324D] dark:bg-emerald-900 text-white font-bold text-xs shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                          {q.question}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Ref: {q.normativeReference}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {q.options.map((opt) => {
                        let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200';

                        if (quizSubmitted) {
                          if (opt.isCorrect) {
                            btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold';
                          } else if (selectedOptId === opt.id && !opt.isCorrect) {
                            btnStyle = 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-500 text-rose-950 dark:text-rose-100 font-medium';
                          }
                        } else if (selectedOptId === opt.id) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 font-medium';
                        }

                        return (
                          <button
                            key={opt.id}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuizAnswer(q.id, opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-bold uppercase text-slate-400 text-xs w-4">
                              {opt.id}.
                            </span>
                            <div className="flex-1">
                              <span>{opt.text}</span>
                              {quizSubmitted && opt.isCorrect && (
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-normal mt-1">
                                  ✓ {opt.explanation}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Submit or Result buttons */}
              {!quizSubmitted ? (
                <div className="flex justify-end pt-2">
                  <button
                    disabled={Object.keys(quizAnswers).length < module.quiz.length}
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#39A900] hover:bg-[#329400] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Calificar Evaluación</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-base">
                      Resultado: {quizScore} de {module.quiz.length} preguntas correctas
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {quizScore === module.quiz.length
                        ? '¡Puntaje perfecto! Has dominado este módulo del reglamento.'
                        : quizScore >= 1
                        ? '¡Aprobado! Has superado el requerimiento del módulo.'
                        : 'Puedes repasar los conceptos y volver a intentarlo.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Finalizar y Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
