# Instrucciones para Activar Logs de Auditoría (Req 50)

## Descripción
Se ha implementado el sistema de Logs de Auditoría (Req 50) que permite registrar y visualizar todos los cambios críticos en el sistema (creación, edición y eliminación de registros).

## Pasos para Activar

### 1. Ejecutar Script de Activación
Para que el sistema comience a registrar los cambios, debes ejecutar el script SQL que activa los "triggers" en la base de datos.

1.  Abre el Editor SQL de Supabase.
2.  Copia y pega el contenido del archivo `ACTIVATE_AUDIT_LOGS.sql`.
3.  Ejecuta el script.

**Nota:** Si ya habías ejecutado `CREATE_AUDIT_LOGS_TABLE.sql`, este nuevo script se encargará de activar los triggers que estaban comentados.

### 2. Verificar Funcionalidad
1.  Ve al **Dashboard de Administración**.
2.  Busca el nuevo botón **"Logs de Auditoría"** (solo visible para administradores).
3.  Haz clic para abrir el visor.
4.  Realiza alguna acción en el sistema (ej: editar una propiedad o crear una amenidad).
5.  Vuelve al visor y recarga para ver el registro de tu acción.

## Características del Visor
*   **Filtrado:** Puedes filtrar por tabla (Propiedades, Clientes, etc.) y por tipo de acción (Crear, Editar, Eliminar).
*   **Búsqueda:** Busca por ID de registro o email de usuario.
*   **Detalles:** Haz clic en "Ver detalles" para ver exactamente qué datos cambiaron (valor anterior vs valor nuevo).
*   **Seguridad:** Solo los usuarios con rol de administrador pueden ver estos logs.

## Tablas Auditadas
Actualmente el sistema registra cambios en:
*   `properties` (Propiedades)
*   `appointments` (Citas)
*   `clients` (Clientes)
*   `amenities` (Amenidades)
*   `advisors` (Asesores)
*   `settings` (Configuraciones)
