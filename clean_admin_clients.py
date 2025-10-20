#!/usr/bin/env python3
"""
Script para limpiar AdminClients.tsx eliminando modales antiguos
y dejando solo los componentes nuevos basados en el wizard.
"""

import re

def clean_admin_clients():
    file_path = r"src\pages\AdminClients.tsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("📝 Archivo original: {} líneas".format(len(content.splitlines())))
    
    # 1. Eliminar showCreateModal state (pero mantener showWizard)
    content = re.sub(
        r'  const \[showCreateModal, setShowCreateModal\] = useState\(false\);\n',
        '',
        content
    )
    print("✅ Eliminado: showCreateModal state")
    
    # 2. Eliminar createForm state completo
    content = re.sub(
        r'  const \[createForm, setCreateForm\] = useState\(\{[^}]+\}\);\n',
        '',
        content,
        flags=re.DOTALL
    )
    print("✅ Eliminado: createForm state")
    
    # 3. Eliminar createSelectedPropertyIds relacionado con el modal antiguo
    # (mantener solo el del wizard si existe)
    content = re.sub(
        r'  const \[createSelectedPropertyIds, setCreateSelectedPropertyIds\] = useState<string\[\]>\(\[\]\);\n',
        '',
        content
    )
    print("✅ Eliminado: createSelectedPropertyIds state")
    
    # 4. Eliminar función resetCreateForm completa
    pattern_reset = r'  const resetCreateForm = \(\) => \{[^}]+setCreateSelectedPropertyIds\(\[\]\);\n  \};\n\n'
    content = re.sub(pattern_reset, '', content, flags=re.DOTALL)
    print("✅ Eliminado: resetCreateForm function")
    
    # 5. Eliminar función handleCreateClient completa
    # Buscar desde "const handleCreateClient" hasta el cierre antes de "handleWizardSubmit"
    pattern_handle = r'  const handleCreateClient = async \(\) => \{.*?  \};\n\n  // Handler para el wizard'
    content = re.sub(pattern_handle, '  // Handler para el wizard', content, flags=re.DOTALL)
    print("✅ Eliminado: handleCreateClient function")
    
    # 6. Eliminar modal HTML de crear cliente
    # Buscar desde "Modal Crear Cliente" hasta antes de "Modal de Detalles de Propiedad"
    pattern_modal_create = r'      \{/\* Modal Crear Cliente \*/\}.*?\{/\* Modal de Detalles de Propiedad \*/\}'
    content = re.sub(pattern_modal_create, '      {/* Modal de Detalles de Propiedad */}', content, flags=re.DOTALL)
    print("✅ Eliminado: Modal Crear Cliente (HTML)")
    
    # 7. Eliminar modal HTML viejo de ver detalles
    # Buscar desde "Modal Ver Cliente" hasta antes del siguiente modal
    pattern_modal_view = r'      \{/\* Modal Ver Cliente \*/\}.*?      \{/\* Modal Asignar Propiedades \*/\}'
    content = re.sub(pattern_modal_view, '      {/* Modal Asignar Propiedades */}', content, flags=re.DOTALL)
    print("✅ Eliminado: Modal Ver Cliente antiguo (HTML)")
    
    # 8. Eliminar imports no usados (Download, Tag)
    content = re.sub(r'  Download,\n', '', content)
    content = re.sub(r'  Tag\n', '', content)
    print("✅ Eliminado: imports no usados (Download, Tag)")
    
    # Guardar archivo limpio
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n📝 Archivo limpio: {} líneas".format(len(content.splitlines())))
    print("\n✅ Limpieza completada exitosamente!")
    print("\n📋 Componentes mantenidos:")
    print("   - ClientWizard (crear clientes)")
    print("   - ClientDetailsEnhanced (ver detalles)")
    print("   - ClientEditForm (editar clientes)")

if __name__ == "__main__":
    try:
        clean_admin_clients()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
