import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Filter
} from 'lucide-react';
import { InductionModule, RegulationArticle, NormaType } from '../types/induction';
import { playSound } from '../utils/audio';

interface RegulationSearchModalProps {
  modules: InductionModule[];
  onClose: () => void;
  onOpenModule: (moduleId: string) => void;
}

export const RegulationSearchModal: React.FC<RegulationSearchModalProps> = ({
  modules,
  onClose,
  onOpenModule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | NormaType>('all');

  // Flatten all articles from modules
  const allArticles = useMemo(() => {
    const list: { article: RegulationArticle; moduleId: string; moduleTitle: string }[] = [];
    modules.forEach((mod) => {
      mod.articles.forEach((art) => {
        list.push({
          article: art,
          moduleId: mod.id,
          moduleTitle: mod.title,
        });
      });
    });
    return list;
  }, [modules]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter(({ article }) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = selectedFilter === 'all' || article.category === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [allArticles, searchTerm, selectedFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="bg-[#00324D] dark:bg-slate-950 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">Buscador Oficial del Reglamento</h3>
              <p className="text-xs text-slate-300">
                Consulta rápida de normas, derechos, deberes y prohibiciones (Acuerdo 002 de 2026)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input & Filter Pills */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por artículo, palabra clave (ej: inasistencia, plagio, carné, comités, contrato)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#39A900] text-slate-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Todos ({allArticles.length})
            </button>
            <button
              onClick={() => setSelectedFilter('derecho')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'derecho'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
            >
              Derechos
            </button>
            <button
              onClick={() => setSelectedFilter('deber')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'deber'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
              }`}
            >
              Deberes
            </button>
            <button
              onClick={() => setSelectedFilter('prohibicion')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'prohibicion'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700'
              }`}
            >
              Prohibiciones
            </button>
            <button
              onClick={() => setSelectedFilter('medida_formativa')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'medida_formativa'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700'
              }`}
            >
              Medidas Formativas
            </button>
            <button
              onClick={() => setSelectedFilter('sancion')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'sancion'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700'
              }`}
            >
              Sanciones
            </button>
          </div>
        </div>

        {/* Results list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No se encontraron artículos con ese criterio.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Intenta con términos como "debido proceso", "asistencia", "sanciones" o "etapa productiva".</p>
            </div>
          ) : (
            filteredArticles.map(({ article, moduleId, moduleTitle }, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {article.number}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{article.title}</h4>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {article.category}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {article.chapter} • Pertenece a: <strong>{moduleTitle}</strong>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {article.fullText}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag, t) => (
                      <span key={t} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenModule(moduleId);
                    }}
                    className="text-xs text-[#39A900] dark:text-emerald-400 hover:text-[#2d8500] dark:hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    Estudiar este Módulo →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span>{filteredArticles.length} resultados disponibles</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
