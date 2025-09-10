// Código para ejecutar en la consola del navegador
// Elimina propiedades duplicadas manteniendo solo las que tienen código

async function cleanDuplicates() {
    try {
        console.log('🧹 Iniciando limpieza de duplicados...');
        
        // Obtener todas las propiedades
        const { data: allProperties, error: fetchError } = await window.supabase
            .from('properties')
            .select('id, code, title, created_at')
            .order('created_at', { ascending: true });
        
        if (fetchError) {
            console.error('❌ Error:', fetchError);
            return;
        }
        
        console.log(`📊 Total propiedades: ${allProperties.length}`);
        
        // Identificar propiedades sin código (las viejas que hay que eliminar)
        const propertiesWithoutCode = allProperties.filter(prop => !prop.code);
        console.log(`❌ Sin código (eliminar): ${propertiesWithoutCode.length}`);
        
        // Identificar propiedades con código duplicado
        const propertyGroups = {};
        allProperties.filter(prop => prop.code).forEach(prop => {
            if (!propertyGroups[prop.code]) {
                propertyGroups[prop.code] = [];
            }
            propertyGroups[prop.code].push(prop);
        });
        
        const duplicateGroups = Object.entries(propertyGroups).filter(([code, props]) => props.length > 1);
        console.log(`🔄 Grupos duplicados: ${duplicateGroups.length}`);
        
        let toDelete = [];
        
        // Agregar propiedades sin código
        toDelete = toDelete.concat(propertiesWithoutCode.map(p => p.id));
        
        // Para duplicados con código, mantener solo el más reciente
        duplicateGroups.forEach(([code, props]) => {
            const sortedProps = props.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const toDeleteFromGroup = sortedProps.slice(1); // Eliminar todos excepto el primero (más reciente)
            toDelete = toDelete.concat(toDeleteFromGroup.map(p => p.id));
            console.log(`${code}: mantener 1, eliminar ${toDeleteFromGroup.length}`);
        });
        
        if (toDelete.length === 0) {
            console.log('✅ No hay duplicados que eliminar');
            return;
        }
        
        console.log(`🗑️ Eliminando ${toDelete.length} propiedades...`);
        
        // Eliminar de a 5 para evitar problemas
        for (let i = 0; i < toDelete.length; i += 5) {
            const batch = toDelete.slice(i, i + 5);
            const { error } = await window.supabase
                .from('properties')
                .delete()
                .in('id', batch);
            
            if (error) {
                console.error(`❌ Error en lote ${i/5 + 1}:`, error);
            } else {
                console.log(`✅ Lote ${i/5 + 1} eliminado (${batch.length} propiedades)`);
            }
        }
        
        // Verificar resultado
        const { data: finalCount } = await window.supabase
            .from('properties')
            .select('id', { count: 'exact', head: true });
        
        console.log(`🎉 Limpieza completada. Total final: ${finalCount?.length || 'verificando...'} propiedades`);
        
        // Recargar la página para ver los cambios
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar la limpieza
cleanDuplicates();
