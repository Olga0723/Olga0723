import avatarFemale1 from '../assets/images/avatar_female_3d_1792615037250.jpg';
import avatarMale1 from '../assets/images/avatar_male_3d_1792615037584.jpg';
import avatarFemale2 from '../assets/images/avatar_female_3d_2_1792676427575.jpg';
import avatarMale2 from '../assets/images/avatar_male_3d_2_1792676427817.jpg';
import avatarFemale3 from '../assets/images/avatar_female_3d_3_1792676443522.jpg';
import avatarMale3 from '../assets/images/avatar_male_3d_3_1792676443237.jpg';

export interface AvatarOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  label: string;
  role: string;
  image: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'male-1',
    name: 'Carlos',
    gender: 'male',
    label: 'Aprendiz Carlos',
    role: 'Desarrollo de Software',
    image: avatarMale1,
  },
  {
    id: 'female-1',
    name: 'Valentina',
    gender: 'female',
    label: 'Aprendiz Valentina',
    role: 'Sistemas & Redes',
    image: avatarFemale1,
  },
  {
    id: 'male-2',
    name: 'Mateo',
    gender: 'male',
    label: 'Aprendiz Mateo',
    role: 'Gestión Tecnológica',
    image: avatarMale2,
  },
  {
    id: 'female-2',
    name: 'Isabella',
    gender: 'female',
    label: 'Aprendiz Isabella',
    role: 'Contabilidad & Finanzas',
    image: avatarFemale2,
  },
  {
    id: 'male-3',
    name: 'Andrés',
    gender: 'male',
    label: 'Aprendiz Andrés',
    role: 'Automatización & IoT',
    image: avatarMale3,
  },
  {
    id: 'female-3',
    name: 'Camila',
    gender: 'female',
    label: 'Aprendiz Camila',
    role: 'Gestión Empresarial',
    image: avatarFemale3,
  },
];

export const DEFAULT_AVATAR_ID = 'male-1';

export function getAvatarImage(avatarId?: string): string {
  if (!avatarId) return avatarMale1;
  // Backward compatibility with previous icon ids
  if (avatarId === 'user' || avatarId === 'carlos' || avatarId === 'male-1') return avatarMale1;
  if (avatarId === 'female-1' || avatarId === 'heart') return avatarFemale1;
  if (avatarId === 'male-2' || avatarId === 'cpu') return avatarMale2;
  if (avatarId === 'female-2' || avatarId === 'star') return avatarFemale2;
  if (avatarId === 'male-3' || avatarId === 'zap') return avatarMale3;
  if (avatarId === 'female-3' || avatarId === 'shield') return avatarFemale3;
  
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found ? found.image : avatarMale1;
}

export function getAvatarInfo(avatarId?: string): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found || AVATAR_OPTIONS[0];
}
