#!/usr/bin/env python3
"""
Script para migrar imágenes del bucket 'imagenes' al bucket 'property-images'
Este script ayuda a organizar las rutas correctamente.
"""

import os
import json

def generate_migration_plan():
    """
    Genera un plan de migración basado en la estructura conocida
    """
    properties = []
    
    # Códigos de propiedades conocidos y sus cantidades de imágenes (datos reales)
    property_data = {
        'CA-001': 18, 'CA-002': 14, 'CA-003': 15, 'CA-004': 13, 'CA-005': 14,
        'CA-006': 14, 'CA-007': 10, 'CA-008': 15, 'CA-009': 13, 'CA-010': 11,
        'CA-011': 14, 'CA-012': 11, 'CA-013': 13, 'CA-014': 10, 'CA-015': 10,
        'CA-016': 13, 'CA-017': 14, 'CA-018': 12, 'CA-019': 18, 'CA-020': 16
    }
    
    migration_plan = {
        "source_bucket": "imagenes",
        "destination_bucket": "property-images",
        "migrations": []
    }
    
    for code, count in property_data.items():
        property_migration = {
            "property_code": code,
            "files": []
        }
        
        for i in range(1, count + 1):
            source_path = f"imagenes/{code}/{code}-({i}).jpeg"
            destination_path = f"{code}/{code}-({i}).jpeg"
            
            property_migration["files"].append({
                "source": source_path,
                "destination": destination_path,
                "source_full_path": f"imagenes/imagenes/{code}/{code}-({i}).jpeg",
                "destination_full_path": f"property-images/{code}/{code}-({i}).jpeg"
            })
        
        migration_plan["migrations"].append(property_migration)
    
    return migration_plan

def main():
    plan = generate_migration_plan()
    
    # Guardar el plan en un archivo JSON
    with open('migration_plan.json', 'w', encoding='utf-8') as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)
    
    print("Plan de migración generado en 'migration_plan.json'")
    print(f"Total de propiedades: {len(plan['migrations'])}")
    
    total_files = sum(len(prop['files']) for prop in plan['migrations'])
    print(f"Total de archivos a migrar: {total_files}")
    
    # Mostrar algunos ejemplos
    print("\nEjemplos de migración:")
    for i, prop in enumerate(plan['migrations'][:3]):
        print(f"\n{prop['property_code']}:")
        for j, file_info in enumerate(prop['files'][:2]):
            print(f"  {file_info['source_full_path']} → {file_info['destination_full_path']}")
        if len(prop['files']) > 2:
            print(f"  ... y {len(prop['files']) - 2} archivos más")

if __name__ == "__main__":
    main()
