/**
 * Zonas y municipios cubiertos por Coworking Inmobiliario
 * Valle de Aburrá y zona sur del Área Metropolitana de Medellín
 */

export const ZONES = [
  'El Poblado',
  'Laureles',
  'Belén',
  'Envigado',
  'Sabaneta',
  'Itagüí',
  'La Estrella',
  'San Antonio de Prado',
  'Caldas'
] as const;

export type Zone = typeof ZONES[number];

export const ZONE_INFO: Record<string, { description: string; popular: boolean }> = {
  'El Poblado': {
    description: 'Zona premium de Medellín, estratos 5 y 6',
    popular: true
  },
  'Laureles': {
    description: 'Sector tradicional y comercial, estratos 4, 5 y 6',
    popular: true
  },
  'Belén': {
    description: 'Zona residencial amplia, estratos 3, 4 y 5',
    popular: false
  },
  'Envigado': {
    description: 'Municipio del sur, excelente calidad de vida',
    popular: true
  },
  'Sabaneta': {
    description: 'Municipio pequeño y acogedor del sur',
    popular: true
  },
  'Itagüí': {
    description: 'Municipio industrial y residencial del sur',
    popular: false
  },
  'La Estrella': {
    description: 'Municipio del sur con fincas y proyectos nuevos',
    popular: false
  },
  'San Antonio de Prado': {
    description: 'Corregimiento de Medellín, zona campestre',
    popular: false
  },
  'Caldas': {
    description: 'Municipio del sur, clima cálido',
    popular: false
  }
};

export const POPULAR_ZONES = ZONES.filter(
  zone => ZONE_INFO[zone]?.popular
);

export const SOUTH_ZONES = [
  'Envigado',
  'Sabaneta',
  'Itagüí',
  'La Estrella',
  'San Antonio de Prado',
  'Caldas'
] as const;

export const MEDELLIN_ZONES = [
  'El Poblado',
  'Laureles',
  'Belén',
  'San Antonio de Prado'
] as const;
