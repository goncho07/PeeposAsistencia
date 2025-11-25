import type { EducationalStructure } from './types';

export const SECTIONS_INICIAL = [
  'MARGARITAS_3AÑOS', 'CRISANTEMOS_3AÑOS',
  'JASMINEZ_4AÑOS', 'ROSAS_4AÑOS', 'LIRIOS_4AÑOS', 'GERANIOS_4AÑOS',
  'ORQUIDEAS_5AÑOS', 'TULIPANES_5AÑOS', 'GIRASOLES_5AÑOS', 'CLAVELES_5AÑOS'
];

export const SECTIONS_PRIMARIA = [
  '1A', '1B', '1C',
  '2A', '2B', '2C',
  '3A', '3B', '3C',
  '4A', '4B', '4C', '4D',
  '5A', '5B', '5C',
  '6A', '6B', '6C'
];

export const SECTIONS_SECUNDARIA = [
  '1A', '1B', '1C', '1D', '1E', '1F', '1G', '1H',
  '2A', '2B', '2C', '2D', '2E', '2F', '2G',
  '3A', '3B', '3C', '3D', '3E', '3F', '3G',
  '4A', '4B', '4C', '4D', '4E', '4F',
  '5A', '5B', '5C', '5D', '5E', '5F'
];

export const EDUCATIONAL_STRUCTURE: EducationalStructure = {
  'Inicial': {
    grades: ['3 Años', '4 Años', '5 Años'],
    sections: SECTIONS_INICIAL
  },
  'Primaria': {
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    sections: SECTIONS_PRIMARIA
  },
  'Secundaria': {
    grades: ['1ro', '2do', '3ro', '4to', '5to'],
    sections: SECTIONS_SECUNDARIA
  }
};
