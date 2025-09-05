# Conteo de Imágenes por Propiedad

## Total de imágenes disponibles en el bucket 'imagenes'

| Código | Cantidad de Imágenes |
|--------|---------------------|
| CA-001 | 18 |
| CA-002 | 14 |
| CA-003 | 15 |
| CA-004 | 13 |
| CA-005 | 14 |
| CA-006 | 14 |
| CA-007 | 10 |
| CA-008 | 15 |
| CA-009 | 13 |
| CA-010 | 11 |
| CA-011 | 14 |
| CA-012 | 11 |
| CA-013 | 13 |
| CA-014 | 10 |
| CA-015 | 10 |
| CA-016 | 13 |
| CA-017 | 14 |
| CA-018 | 12 |
| CA-019 | 18 |
| CA-020 | 16 |

**Total de imágenes**: 274

## Estructura en Supabase Storage

```
imagenes/
└── imagenes/
    ├── CA-001/ (18 imágenes)
    │   ├── CA-001-(1).jpeg
    │   ├── CA-001-(2).jpeg
    │   └── ... hasta CA-001-(18).jpeg
    ├── CA-002/ (14 imágenes)
    │   ├── CA-002-(1).jpeg
    │   └── ... hasta CA-002-(14).jpeg
    └── ... (continúa para todas las propiedades)
```

## Nueva Estructura Propuesta (property-images)

```
property-images/
├── CA-001/ (18 imágenes)
│   ├── CA-001-(1).jpeg
│   ├── CA-001-(2).jpeg
│   └── ... hasta CA-001-(18).jpeg
├── CA-002/ (14 imágenes)
│   ├── CA-002-(1).jpeg
│   └── ... hasta CA-002-(14).jpeg
└── ... (continúa para todas las propiedades)
```

## Notas
- Todas las imágenes están en formato JPEG
- Nomenclatura consistente: `CA-XXX-(N).jpeg`
- Algunas propiedades tienen más imágenes que otras
- CA-001 y CA-019 tienen la mayor cantidad (18 imágenes cada una)
- CA-007, CA-014 y CA-015 tienen la menor cantidad (10 imágenes cada una)
