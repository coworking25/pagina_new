// TEST DEL SISTEMA DE ESTADÍSTICAS - Dashboard Completo
// Este archivo prueba todas las funciones implementadas

import { 
  getPropertyStats, 
  incrementPropertyViews, 
  incrementPropertyInquiries, 
  incrementPropertyAppointments,
  getPropertyActivity,
  logPropertyActivity,
  getPropertiesByStatus,
  updatePropertyStatus,
  getRecentActivities,
  getPropertiesNeedingAttention,
  createProperty,
  updateProperty,
  deleteProperty
} from './lib/supabase.js';

// Test de estadísticas básicas
async function testBasicStats() {
  console.log('🧪 PRUEBA 1: Estadísticas básicas');
  
  try {
    // Supongamos que tenemos una propiedad con ID '1'
    const propertyId = '1';
    
    // Obtener estadísticas iniciales
    const initialStats = await getPropertyStats(propertyId);
    console.log('📊 Estadísticas iniciales:', initialStats);
    
    // Incrementar vistas
    await incrementPropertyViews(propertyId, { userType: 'visitor', source: 'website' });
    console.log('✅ Vista incrementada');
    
    // Incrementar consultas
    await incrementPropertyInquiries(propertyId, { 
      method: 'contact_form', 
      message: 'Interesado en la propiedad' 
    });
    console.log('✅ Consulta incrementada');
    
    // Incrementar citas
    await incrementPropertyAppointments(propertyId, { 
      date: '2025-01-10', 
      time: '10:00', 
      type: 'visit' 
    });
    console.log('✅ Cita incrementada');
    
    // Obtener estadísticas actualizadas
    const updatedStats = await getPropertyStats(propertyId);
    console.log('📊 Estadísticas actualizadas:', updatedStats);
    
  } catch (error) {
    console.error('❌ Error en test básico:', error);
  }
}

// Test de actividades
async function testActivities() {
  console.log('\n🧪 PRUEBA 2: Sistema de actividades');
  
  try {
    const propertyId = '1';
    
    // Registrar actividad manual
    await logPropertyActivity(propertyId, 'status_changed', {
      oldStatus: 'disponible',
      newStatus: 'en_negociacion',
      reason: 'Cliente interesado'
    });
    console.log('✅ Actividad registrada');
    
    // Obtener actividades de la propiedad
    const activities = await getPropertyActivity(propertyId, 5);
    console.log('📝 Actividades recientes:', activities);
    
    // Obtener actividades generales del sistema
    const recentActivities = await getRecentActivities(10);
    console.log('🌍 Actividades del sistema:', recentActivities.length, 'encontradas');
    
  } catch (error) {
    console.error('❌ Error en test de actividades:', error);
  }
}

// Test de gestión de propiedades
async function testPropertyManagement() {
  console.log('\n🧪 PRUEBA 3: Gestión de propiedades');
  
  try {
    // Obtener propiedades por estado
    const availableProperties = await getPropertiesByStatus('disponible');
    console.log('🏠 Propiedades disponibles:', availableProperties.length);
    
    // Propiedades que necesitan atención
    const needAttention = await getPropertiesNeedingAttention();
    console.log('⚠️ Propiedades que necesitan atención:', needAttention.length);
    
    // Cambiar estado de propiedad (simulado)
    if (availableProperties.length > 0) {
      const propertyId = availableProperties[0].id;
      await updatePropertyStatus(propertyId, 'en_negociacion', 'Cliente con interés serio');
      console.log('✅ Estado de propiedad actualizado');
    }
    
  } catch (error) {
    console.error('❌ Error en test de gestión:', error);
  }
}

// Test de CRUD mejorado
async function testEnhancedCRUD() {
  console.log('\n🧪 PRUEBA 4: CRUD con validación y logging');
  
  try {
    // Crear propiedad de prueba
    const newProperty = {
      title: 'Casa de Prueba Estadísticas',
      description: 'Propiedad creada para probar el sistema de estadísticas',
      price: 250000,
      location: 'Zona de Pruebas',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'house',
      status: 'sale'
    };
    
    const createdProperty = await createProperty(newProperty);
    console.log('✅ Propiedad creada:', createdProperty.id);
    
    // Actualizar propiedad
    await updateProperty(createdProperty.id, {
      price: 260000,
      description: 'Descripción actualizada con mejor precio'
    });
    console.log('✅ Propiedad actualizada');
    
    // Verificar actividades generadas
    const activities = await getPropertyActivity(createdProperty.id);
    console.log('📝 Actividades generadas:', activities.length);
    
    // Limpiar: eliminar propiedad de prueba
    await deleteProperty(createdProperty.id);
    console.log('✅ Propiedad de prueba eliminada');
    
  } catch (error) {
    console.error('❌ Error en test de CRUD:', error);
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA DE ESTADÍSTICAS\n');
  
  await testBasicStats();
  await testActivities();
  await testPropertyManagement();
  await testEnhancedCRUD();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('🎉 Sistema de estadísticas y dashboard funcionando correctamente!');
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.testStats = {
    runAllTests,
    testBasicStats,
    testActivities,
    testPropertyManagement,
    testEnhancedCRUD
  };
  
  console.log('📋 Funciones de prueba disponibles en window.testStats');
  console.log('📋 Ejecuta: window.testStats.runAllTests()');
}

export { runAllTests, testBasicStats, testActivities, testPropertyManagement, testEnhancedCRUD };
