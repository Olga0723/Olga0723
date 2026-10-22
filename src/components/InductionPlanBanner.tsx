import React, { useState } from 'react';
import { 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Sparkles, 
  FileCheck2,
  ListOrdered
} from 'lucide-react';
import { playSound } from '../utils/audio';

export const InductionPlanBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    playSound('click');
    setIsOpen(!isOpen);
  };

  const phases = [
    {
      num: '1',
      title: 'Contextualización e Identidad SENA',
      desc: 'Misión institucional, símbolos, valores del Código de Integralidad y alcance del Acuerdo 002 de 2026.',
      deliverable: 'Módulo 1 & Insignia de Identidad',
      status: 'Completado',
    },
    {
      num: '2',
      title: 'Apropiación de Derechos y Bienestar',
      desc: 'Garantías académicas, acceso a ambientes tecnológicos, biblioteca, apoyos de sostenimiento FIC y segundo evaluador.',
      deliverable: 'Módulo 2 & Casos Prácticos',
      status: 'Activo',
    },
    {
      num: '3',
      title: 'Compromisos, SST y Deberes Formativos',
      desc: 'Puntualidad, justificación de inasistencias en 3 días hábiles, porte obligatorio de carné y uso de EPP.',
      deliverable: 'Módulo 3 & Insignia del Deber',
      status: 'Pendiente',
    },
    {
      num: '4',
      title: 'Prevención, Prohibiciones y Régimen Disciplinario',
      desc: 'Tolerancia cero al plagio y sustancias, diferencias clave entre Medidas Formativas (pedagógicas) y Sanciones (hoja de vida).',
      deliverable: 'Módulos 4 y 5 + Simulador',
      status: 'Pendiente',
    },
    {
      num: '5',
      title: 'Etapa Productiva y Evaluación Gamificada',
      desc: 'Las 6 alternativas de práctica, minijuego clasificatorio, examen final integral (80%) y generación del Certificado Oficial.',
      deliverable: 'Certificado Oficial con QR',
      status: 'Meta Final',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
      <button
        onClick={toggleOpen}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#39A900] dark:text-emerald-400 flex items-center justify-center font-bold">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Plan Estructurado de Inducción SENA (Acuerdo 002 de 2026)
              </h3>
              <span className="text-[11px] font-bold bg-[#39A900]/10 dark:bg-emerald-500/20 text-[#39A900] dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Estrategia Pedagógica
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5 fases formativas diseñadas para una apropiación integral, ética y gamificada del reglamento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="hidden sm:inline">
            {isOpen ? 'Ocultar Plan' : 'Ver Plan Estructurado'}
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {phases.map((phase) => (
              <div
                key={phase.num}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#00324D] dark:bg-emerald-900 text-white dark:text-emerald-200 flex items-center justify-center text-xs font-bold">
                      {phase.num}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        phase.status === 'Completado'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : phase.status === 'Activo'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          : phase.status === 'Meta Final'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                    {phase.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {phase.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{phase.deliverable}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Objetivo del Prototipo:</strong> Transformar la tradicional lectura pasiva del reglamento en una experiencia activa con dilemas reales, minijuego de clasificación veloz, evaluación rigurosa y certificación verificable.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
