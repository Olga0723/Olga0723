import React, { useState } from 'react';
import { X, UserCheck, Check, Save } from 'lucide-react';
import { ApprenticeProfile, DocumentType } from '../types/induction';
import { playSound } from '../utils/audio';
import { AvatarSelector } from './AvatarSelector';
import { getAvatarImage } from '../data/avatarsData';

interface ProfileEditModalProps {
  profile: ApprenticeProfile;
  onSave: (updated: ApprenticeProfile) => void;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [documentType, setDocumentType] = useState<DocumentType>(profile.documentType);
  const [documentNumber, setDocumentNumber] = useState(profile.documentNumber);
  const [programName, setProgramName] = useState(profile.programName);
  const [fichaNumber, setFichaNumber] = useState(profile.fichaNumber);
  const [regional, setRegional] = useState(profile.regional);
  const [trainingCenter, setTrainingCenter] = useState(profile.trainingCenter);
  const [avatarId, setAvatarId] = useState(profile.avatarId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('correct');
    onSave({
      ...profile,
      fullName: fullName.trim() || profile.fullName,
      documentType,
      documentNumber: documentNumber.trim() || profile.documentNumber,
      programName: programName.trim() || profile.programName,
      fichaNumber: fichaNumber.trim() || profile.fichaNumber,
      regional: regional.trim() || profile.regional,
      trainingCenter: trainingCenter.trim() || profile.trainingCenter,
      avatarId,
    });
    onClose();
  };

  const samplePrograms = [
    'Tecnología en Análisis y Desarrollo de Software (ADSO)',
    'Tecnología en Gestión de Redes de Datos',
    'Técnico en Contabilización de Operaciones Comerciales y Financieras',
    'Tecnología en Gestión Empresarial',
    'Técnico en Sistemas e Informática',
    'Tecnología en Control y Automatización Industrial',
    'Técnico en Servicios de Barismo y Mesa',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors">
        <div className="bg-[#00324D] dark:bg-slate-950 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-white/25 overflow-hidden bg-white/10 shrink-0 shadow-xs">
              <img
                src={getAvatarImage(avatarId)}
                alt="Avatar 3D seleccionado"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Datos del Aprendiz</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#39A900] text-white">
                  Avatar 3D
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Esta información figurará en el Certificado Oficial de Inducción
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo del Aprendiz
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
              placeholder="Ej: Carlos Andrés Rodríguez Patiño"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo Doc.</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
              >
                <option value="CC">C.C.</option>
                <option value="TI">T.I.</option>
                <option value="CE">C.E.</option>
                <option value="PPT">PPT</option>
                <option value="PEP">PEP</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Número de Documento
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                placeholder="1024567890"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Programa de Formación
            </label>
            <input
              type="text"
              required
              list="programs-list"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
              placeholder="Selecciona o escribe el programa"
            />
            <datalist id="programs-list">
              {samplePrograms.map((p, i) => (
                <option key={i} value={p} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Número de Ficha
              </label>
              <input
                type="text"
                required
                value={fichaNumber}
                onChange={(e) => setFichaNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                placeholder="2901842"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Regional</label>
              <input
                type="text"
                required
                value={regional}
                onChange={(e) => setRegional(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
                placeholder="Regional Distrito Capital"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Centro de Formación
            </label>
            <input
              type="text"
              required
              value={trainingCenter}
              onChange={(e) => setTrainingCenter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#39A900]"
              placeholder="Centro de Tecnologías de la Información y las Comunicaciones"
            />
          </div>

          <AvatarSelector selectedAvatar={avatarId} onSelect={setAvatarId} />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#329400] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
