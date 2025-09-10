import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

// Función para normalizar precio (remover caracteres especiales)
const normalizePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseInt(priceStr.toString().replace(/[\$\'\.\,\s]/g, '')) || 0;
};

// Función para extraer números de texto
const extractNumber = (text, defaultValue = 0) => {
  if (!text) return defaultValue;
  const match = text.toString().match(/\d+/);
  return match ? parseInt(match[0]) : defaultValue;
};

// Función para generar URLs de imágenes basadas en el código
const generateImageUrls = (code) => {
  const baseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images';
  return [
    `${baseUrl}/${code}/${code}-(1).jpeg`,
    `${baseUrl}/${code}/${code}-(2).jpeg`,
    `${baseUrl}/${code}/${code}-(3).jpeg`,
    `${baseUrl}/${code}/${code}-(4).jpeg`,
    `${baseUrl}/${code}/${code}-(5).jpeg`
  ];
};

// Datos estructurados de tu inventario
const propertiesData = [
  {
    code: 'CA-001',
    title: 'Casa para arriendo en Poblado - Los Balsos',
    description: 'LA COLINA 136 - Casa con 2 salas, comedor, cocina integral nueva, zona de ropas, 3 alcobas + servicio, closets, vestier, estudio, 4 niveles, garaje para 2 carros, unidad cerrada con zonas verdes.',
    type: 'house',
    status: 'rent',
    price: normalizePrice('10.300.000'),
    location: 'Poblado, Los Balsos - Transversal intermedia',
    bedrooms: 3,
    bathrooms: 4,
    area: 246,
    amenities: ['Unidad cerrada', 'Zonas verdes', 'Garaje para 2', 'Cocina integral nueva', 'Zona de ropas', 'Estudio', 'Vestier'],
    featured: true,
    advisor_id: null // Andrés Metrio
  },
  {
    code: 'CA-002',
    title: 'Apartamento en Tesoro - Clínica del Rosario',
    description: 'Twins - Apartamento estrato 6 en urbanización cerrada con sala comedor, cocina integral, zona de ropas, balcón de 20m2, dos parqueaderos sencillos.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('6.500.000'),
    location: 'Tesoro, Clínica del Rosario',
    bedrooms: 2,
    bathrooms: 2,
    area: 117,
    amenities: ['Piscina', 'Gimnasio', 'Turco', 'Salón social', 'Zona infantil', 'Zona mascotas', 'Urbanización cerrada', 'Balcón 20m2'],
    featured: true,
    advisor_id: null
  },
  {
    code: 'CA-003',
    title: 'Apartamento en Envigado - Loma del Escobero',
    description: 'Apartamento con 3 alcobas, 2 baños, vestier, closets, sala comedor, estudio, cocina integral, zona de ropas, balcón, parqueadero privado, cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('5.600.000'),
    location: 'Envigado, Loma del Escobero',
    bedrooms: 3,
    bathrooms: 2,
    area: 90,
    amenities: ['Piscina', 'Jacuzzi', '2 canchas fútbol sintético', 'Sauna', 'Turco', 'Mini golf', 'Zona infantil', 'Zonas verdes', 'Parqueadero privado'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-004',
    title: 'Apartamento en Sabaneta - Asdesillas',
    description: 'Apartamento con 3 alcobas, 2 baños, cocina integral, zona de ropas, piso porcelanato, 3 closets, balcón amplio con vista, parqueadero y cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('3.200.000'),
    location: 'Sabaneta, Asdesillas',
    bedrooms: 3,
    bathrooms: 2,
    area: 80,
    amenities: ['Cocina integral', 'Zona de ropas', 'Piso porcelanato', '3 closets', 'Balcón amplio', 'Parqueadero', 'Cuarto útil', 'Zona social completa'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-005',
    title: 'Apartamento en Envigado - Camino Verde',
    description: 'Apartamento con 3 alcobas, 2 baños, sala comedor, cocina integral, estudio, balcón, zona de ropas, red de gas, parqueadero privado.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('2.600.000'),
    location: 'Envigado, Camino Verde',
    bedrooms: 3,
    bathrooms: 2,
    area: 70,
    amenities: ['Piscina', 'Sauna', 'Salón social', 'Zona mascotas', 'Cocina integral', 'Estudio', 'Red de gas', 'Parqueadero privado'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-006',
    title: 'Apartamento en Envigado - El Escobero',
    description: 'Apartamento estrato 5 en urbanización cerrada con sala comedor, cocina integral, zona de ropas, 3 habitaciones, 2 baños, balcón, 2 parqueaderos.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('5.600.000'),
    location: 'Envigado, El Escobero',
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    amenities: ['Piscina', 'Jacuzzi', 'Zonas verdes', 'Juegos infantiles', 'Sauna', 'Salón social', 'Salón de juegos', 'Portería 24/7', 'Urbanización cerrada'],
    featured: true,
    advisor_id: null
  },
  {
    code: 'CA-007',
    title: 'Apartamento en Sabaneta - Las Vegas',
    description: 'Apartamento estrato 4 con 2 alcobas, 2 closets, estudio, sala comedor, 2 baños cabinados, cocina integral, red gas, calentador, zona de ropas, piso porcelanato.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('2.300.000'),
    location: 'Sabaneta, Las Vegas',
    bedrooms: 2,
    bathrooms: 2,
    area: 65,
    amenities: ['Estudio', 'Cocina integral', 'Red gas', 'Calentador', 'Zona de ropas', 'Piso porcelanato', 'Parqueadero', 'Cuarto útil'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-008',
    title: 'Apartamento Dúplex en Envigado - Intermedia',
    description: 'Apartamento dúplex estrato 5 en urbanización cerrada con sala comedor, cocina integral, zona de ropas, 3 habitaciones, 3 baños, balcón, 2 parqueaderos, cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('5.500.000'),
    location: 'Envigado, Intermedia',
    bedrooms: 3,
    bathrooms: 3,
    area: 120,
    amenities: ['Parqueadero visitantes', 'Zona verde', 'Salón común', 'Urbanización cerrada', 'Dúplex', 'Cuarto útil'],
    featured: true,
    advisor_id: null
  },
  {
    code: 'CA-009',
    title: 'Apartamento en Poblado - Ciudad del Río',
    description: 'Apartamento estrato 4 en urbanización cerrada con sala comedor, estudio, cocina integral, zona de ropas, 3 habitaciones, 2 baños, balcón, 1 parqueadero sencillo.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('3.600.000'),
    location: 'Poblado, Ciudad del Río',
    bedrooms: 3,
    bathrooms: 2,
    area: 87,
    amenities: ['Urbanización cerrada', 'Estudio', 'Cocina integral', 'Zona de ropas', 'Balcón'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-010',
    title: 'Apartamento en Poblado - Bosque del Río',
    description: 'Apartamento con 1 alcoba, 2 baños, sala, balcón amplio, cocina integral, zona de ropas, parqueadero, cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('4.000.000'),
    location: 'Poblado, Ciudad del Río - Bosque del Río',
    bedrooms: 1,
    bathrooms: 2,
    area: 65,
    amenities: ['Balcón amplio', 'Cocina integral', 'Zona de ropas', 'Parqueadero', 'Cuarto útil'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-011',
    title: 'Apartamento en Sabaneta - Las Lomitas',
    description: 'Apartamento piso 9 con sala comedor, cocina integral, zona de ropas, 2 balcones, 1 baño social, 2 baños privados, 3 alcobas, 2 closets, 1 vestier, estudio opcional, 2 parqueaderos independientes, cuarto útil amplio.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('3.800.000'),
    location: 'Sabaneta, Las Lomitas',
    bedrooms: 3,
    bathrooms: 3,
    area: 114,
    amenities: ['Salón social', 'Jacuzzi', 'Gimnasio', 'Juegos infantiles', 'Unidad cerrada', 'Vestier', 'Estudio opcional', '2 parqueaderos independientes'],
    featured: true,
    advisor_id: null // Andrés Metrio
  },
  {
    code: 'CA-012',
    title: 'Apartamento en Sabaneta - Loma de San José',
    description: 'Apartamento cerca a universidad Ceipa, éxito de Sabaneta, D1, ísimo, mall ZONA SUR, parque de Sabaneta y hospital de Sabaneta. Con 2 baños, sala comedor, 3 alcobas, amplia cocina con alacena, área de ropas y balcón muy amplio.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('3.400.000'),
    location: 'Sabaneta, Loma de San José',
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    amenities: ['Gimnasio', 'Piscina', 'Turco', 'Sauna', 'Parque infantil', 'Parque mascotas', 'Salón social amplio', 'Portería 24h', 'Cocina con alacena', 'Balcón amplio'],
    featured: true,
    advisor_id: null
  },
  {
    code: 'CA-013',
    title: 'Apartamento en Oviedo',
    description: 'Apartamento estrato 6 en urbanización cerrada con sala comedor, cocina integral, zona de ropas, 2 habitaciones más servicio, baños, balcón, parqueadero.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('5.000.000'),
    location: 'Oviedo',
    bedrooms: 2,
    bathrooms: 2,
    area: 105,
    amenities: ['Piscina', 'Gimnasio', 'Urbanización cerrada', 'Cocina integral', 'Zona de ropas'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-014',
    title: 'Apartamento en Sabaneta - San José',
    description: 'Apartamento estrato 4 con 3 alcobas, 2 closets, 1 vestier, sala comedor, balcón, cocina integral, red gas, zona de ropas, calentador gas, 2 baños cabinados, piso porcelanato, parqueadero cubierto y cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('2.800.000'),
    location: 'Sabaneta, San José',
    bedrooms: 3,
    bathrooms: 2,
    area: 75,
    amenities: ['Vestier', 'Cocina integral', 'Red gas', 'Calentador gas', 'Piso porcelanato', 'Parqueadero cubierto', 'Cuarto útil', 'Zonas comunes en construcción'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-015',
    title: 'Apartamento en La Estrella - Tablaza',
    description: 'Apartamento con 2 alcobas, 2 baños, sala comedor, cocina integral, zona de ropas, balcón, parqueadero común.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('1.500.000'),
    location: 'La Estrella, Tablaza',
    bedrooms: 2,
    bathrooms: 2,
    area: 55,
    amenities: ['Piscina', 'Zonas verdes', 'Juegos infantiles', 'BBQ', 'Cocina integral', 'Zona de ropas', 'Parqueadero común'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-016',
    title: 'Apartamento en Sabaneta - San Remo',
    description: 'Apartamento estrato 5 piso 22 en urbanización cerrada con sala comedor, cocina integral, zona de ropas, 3 habitaciones, 2 baños, balcón, 1 parqueadero, cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('3.300.000'),
    location: 'Sabaneta, San Remo',
    bedrooms: 3,
    bathrooms: 2,
    area: 90,
    amenities: ['Urbanización cerrada', 'Piso 22', 'Cocina integral', 'Zona de ropas', 'Cuarto útil'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-017',
    title: 'Apartamento en Envigado - La Abadía',
    description: 'Apartamento estrato 5 piso 1 en urbanización cerrada con sala comedor balcón, cocina integral, zona de ropas independiente, 3 alcobas, 2 baños, 1 vestier, 2 clósets, balcón amplio, 1 parqueadero, cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('3.800.000'),
    location: 'Envigado, La Abadía',
    bedrooms: 3,
    bathrooms: 2,
    area: 80,
    amenities: ['Urbanización cerrada', 'Vestier', '2 clósets', 'Balcón amplio', 'Zona de ropas independiente', 'Cuarto útil'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-018',
    title: 'Apartamento en Envigado - La Abadía Premium',
    description: 'Apartamento estrato 6 en urbanización cerrada con sala comedor, cocina integral, zona de ropas, 3 habitaciones, 2 baños, balcón, parqueadero.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('4.500.000'),
    location: 'Envigado, La Abadía',
    bedrooms: 3,
    bathrooms: 2,
    area: 118,
    amenities: ['Urbanización cerrada', 'Estrato 6', 'Cocina integral', 'Zona de ropas'],
    featured: true,
    advisor_id: null
  },
  {
    code: 'CA-019',
    title: 'Apartamento en El Poblado',
    description: 'Apartamento con 3 alcobas (alcoba principal con closet y baño, 2 alcobas con closet), 1 baño social, piso porcelanato, balcón, cocina integral con barra, zona de ropas, red de gas, calentador, 1 parqueadero cubierto.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('2.700.000'),
    location: 'El Poblado',
    bedrooms: 3,
    bathrooms: 2,
    area: 70,
    amenities: ['Portería 24h', 'Ascensor', 'Piscina', 'Salón social', 'Shut basuras', 'Turco/Sauna', 'Zona BBQ', 'Zonas verdes', 'Cocina con barra', 'Red de gas'],
    featured: false,
    advisor_id: null
  },
  {
    code: 'CA-020',
    title: 'Apartamento en Loma del Chocho',
    description: 'Apartamento estrato 5 con sala comedor, hall de alcobas, cocina integral, zona de ropas, balcón, ascensor, calentador, 3 alcobas, 2 baños, 1 parqueadero, cuarto útil.',
    type: 'apartment',
    status: 'rent',
    price: normalizePrice('4.100.000'),
    location: 'Loma del Chocho',
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    amenities: ['Salón social', 'Piscina adultos y niños', 'Gimnasio', 'Juegos infantiles', 'Turco', 'Sauna', 'Portería 24h', 'Ascensor', 'Hall de alcobas'],
    featured: true,
    advisor_id: null
  }
];

// Función para importar todas las propiedades
export const importPropertiesToSupabase = async () => {
  console.log('🚀 Iniciando importación de propiedades...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const property of propertiesData) {
    try {
      // Generar URLs de imágenes basadas en el código
      const propertyWithImages = {
        ...property,
        images: generateImageUrls(property.code),
        lat: null, // Coordenadas se pueden agregar después
        lng: null
      };
      
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyWithImages])
        .select();
      
      if (error) {
        console.error(`❌ Error insertando ${property.code}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Propiedad ${property.code} insertada exitosamente - ${property.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error general con ${property.code}:`, err);
      errorCount++;
    }
    
    // Pequeña pausa para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`🎉 Importación completada: ${successCount} exitosas, ${errorCount} errores`);
  return { successCount, errorCount };
};

// Ejecutar importación
importPropertiesToSupabase();
