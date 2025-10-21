// NUEVA VERSIÓN MEJORADA DEL handleWizardSubmit
// Copiar y pegar esto en AdminClients.tsx línea 991

// Handler para el wizard de cliente
const handleWizardSubmit = async (wizardData: any) => {
  console.log('\n==============================================');
  console.log('🧙‍♂️ INICIANDO CREACIÓN DE CLIENTE DESDE WIZARD');
  console.log('==============================================');
  console.log('📋 DATOS COMPLETOS RECIBIDOS:', JSON.stringify(wizardData, null, 2));
  
  // Objeto para rastrear qué se guardó exitosamente
  const saveResults = {
    client: { saved: false, id: null as number | null, error: null as any },
    credentials: { saved: false, email: null as string | null, error: null as any },
    documents: { saved: 0, total: 0, errors: [] as string[] },
    payment: { saved: false, error: null as any },
    references: { saved: false, personal: 0, commercial: 0, error: null as any },
    contract: { saved: false, error: null as any },
    properties: { saved: 0, total: 0, error: null as any }
  };

  try {
    // 1. Crear cliente base
    console.log('\n📝 PASO 1: Creando cliente base...');
    const clientData: ClientFormData = {
      full_name: wizardData.full_name,
      document_type: wizardData.document_type,
      document_number: wizardData.document_number,
      phone: wizardData.phone,
      email: wizardData.email || undefined,
      address: wizardData.address || undefined,
      city: wizardData.city || undefined,
      emergency_contact_name: wizardData.emergency_contact_name || undefined,
      emergency_contact_phone: wizardData.emergency_contact_phone || undefined,
      client_type: wizardData.client_type,
      status: wizardData.client_status || 'active',
      monthly_income: sanitizeNumericValue(wizardData.monthly_income),
      occupation: wizardData.occupation || undefined,
      company_name: wizardData.company_name || undefined,
      notes: wizardData.notes || undefined
    };

    console.log('   → Datos a guardar:', clientData);
    const newClient = await createClient(clientData);
    saveResults.client.saved = true;
    saveResults.client.id = newClient.id;
    console.log('   ✅ Cliente creado exitosamente ID:', newClient.id);

    // 2. Crear credenciales del portal
    console.log('\n🔑 PASO 2: Verificando credenciales del portal...');
    const email = wizardData.email || wizardData.portal_email;
    const password = wizardData.password;
    
    console.log('   → Email:', email);
    console.log('   → Password:', password ? '****** (existe)' : '❌ NO PROPORCIONADA');
    console.log('   → Send welcome email:', wizardData.send_welcome_email);
    console.log('   → Portal access enabled:', wizardData.portal_access_enabled);

    if (password && email) {
      try {
        await createPortalCredentials(
          newClient.id,
          email,
          password,
          wizardData.send_welcome_email || false,
          wizardData.portal_access_enabled !== false
        );
        saveResults.credentials.saved = true;
        saveResults.credentials.email = email;
        console.log('   ✅ Credenciales del portal creadas');
      } catch (credError: any) {
        saveResults.credentials.error = credError.message;
        console.error('   ❌ Error creando credenciales:', credError);
      }
    } else {
      console.warn('   ⚠️ CREDENCIALES NO CREADAS - Falta email o password');
      if (!email) console.warn('      → Email faltante');
      if (!password) console.warn('      → Password faltante');
    }

    // 3. Subir documentos
    console.log('\n📄 PASO 3: Verificando documentos...');
    const documents = wizardData.documents || [];
    saveResults.documents.total = documents.length;
    console.log('   → Total documentos a subir:', documents.length);

    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        console.log(`   → Documento ${i + 1}/${documents.length}:`, doc.type);
        try {
          await uploadClientDocument(
            newClient.id,
            doc.type,
            doc.file
          );
          saveResults.documents.saved++;
          console.log(`      ✅ Documento ${doc.type} subido exitosamente`);
        } catch (docError: any) {
          saveResults.documents.errors.push(`${doc.type}: ${docError.message}`);
          console.error(`      ❌ Error subiendo documento ${doc.type}:`, docError);
        }
      }
    } else {
      console.log('   ⚠️ No hay documentos para subir');
    }

    // 4. Guardar configuración de pagos
    console.log('\n💰 PASO 4: Verificando configuración de pagos...');
    console.log('   → Payment concepts:', wizardData.payment_concepts);
    console.log('   → Preferred payment method:', wizardData.preferred_payment_method);
    console.log('   → Billing day:', wizardData.billing_day);

    if (wizardData.payment_concepts || wizardData.preferred_payment_method) {
      try {
        await savePaymentConfig(newClient.id, {
          preferred_payment_method: wizardData.preferred_payment_method,
          billing_day: sanitizeNumericValue(wizardData.billing_day) || 1,
          payment_concepts: sanitizePaymentConcepts(wizardData.payment_concepts)
        });
        saveResults.payment.saved = true;
        console.log('   ✅ Configuración de pagos guardada');
      } catch (paymentError: any) {
        saveResults.payment.error = paymentError.message;
        console.error('   ❌ Error guardando configuración de pagos:', paymentError);
      }
    } else {
      console.log('   ⚠️ Configuración de pagos NO guardada - No hay datos');
    }

    // 5. Guardar referencias
    console.log('\n👥 PASO 5: Verificando referencias...');
    const personalRefs = wizardData.personal_references || [];
    const commercialRefs = wizardData.commercial_references || [];
    console.log('   → Referencias personales:', personalRefs.length);
    console.log('   → Referencias comerciales:', commercialRefs.length);

    if (personalRefs.length > 0 || commercialRefs.length > 0) {
      try {
        await saveClientReferences(newClient.id, {
          personal: personalRefs,
          commercial: commercialRefs
        });
        saveResults.references.saved = true;
        saveResults.references.personal = personalRefs.length;
        saveResults.references.commercial = commercialRefs.length;
        const totalRefs = personalRefs.length + commercialRefs.length;
        console.log(`   ✅ Referencias guardadas (${totalRefs} total)`);
      } catch (refError: any) {
        saveResults.references.error = refError.message;
        console.error('   ❌ Error guardando referencias:', refError);
      }
    } else {
      console.log('   ⚠️ Referencias NO guardadas - No hay datos');
    }

    // 6. Guardar información del contrato
    console.log('\n📑 PASO 6: Verificando información del contrato...');
    console.log('   → Contract type:', wizardData.contract_type);
    console.log('   → Start date:', wizardData.contract_start_date);
    console.log('   → End date:', wizardData.contract_end_date);
    console.log('   → Deposit amount:', wizardData.deposit_amount);
    console.log('   → Guarantor:', wizardData.has_guarantor ? 'Sí' : 'No');

    if (wizardData.contract_start_date || wizardData.deposit_amount) {
      try {
        await saveContractInfo(newClient.id, {
          contract_type: wizardData.contract_type,
          start_date: wizardData.contract_start_date,
          end_date: wizardData.contract_end_date,
          duration_months: sanitizeNumericValue(wizardData.contract_duration_months),
          deposit_amount: sanitizeNumericValue(wizardData.deposit_amount),
          deposit_paid: wizardData.deposit_paid || false,
          guarantor_required: wizardData.has_guarantor || false,
          guarantor_name: wizardData.guarantor_name || undefined,
          guarantor_document: wizardData.guarantor_document || undefined,
          guarantor_phone: wizardData.guarantor_phone || undefined
        });
        saveResults.contract.saved = true;
        console.log('   ✅ Información del contrato guardada');
      } catch (contractError: any) {
        saveResults.contract.error = contractError.message;
        console.error('   ❌ Error guardando información del contrato:', contractError);
      }
    } else {
      console.log('   ⚠️ Información del contrato NO guardada - No hay datos');
    }

    // 7. Asignar propiedades
    console.log('\n🏠 PASO 7: Verificando propiedades asignadas...');
    const propertyIds = wizardData.assigned_property_ids || [];
    saveResults.properties.total = propertyIds.length;
    console.log('   → Propiedades a asignar:', propertyIds.length);

    if (propertyIds.length > 0) {
      try {
        const relations = propertyIds.map((propertyId: string) => ({
          client_id: newClient.id,
          property_id: propertyId,
          relation_type: 'tenant' as const,
          status: 'active' as const
        }));
        
        await createClientPropertyRelations(relations);
        saveResults.properties.saved = propertyIds.length;
        console.log(`   ✅ ${propertyIds.length} propiedades asignadas`);
      } catch (propError: any) {
        saveResults.properties.error = propError.message;
        console.error('   ❌ Error asignando propiedades:', propError);
      }
    } else {
      console.log('   ⚠️ Propiedades NO asignadas - No hay datos');
    }

    // RESUMEN FINAL
    console.log('\n==============================================');
    console.log('📊 RESUMEN DE GUARDADO');
    console.log('==============================================');
    console.log('Cliente:      ', saveResults.client.saved ? `✅ ID: ${saveResults.client.id}` : '❌');
    console.log('Credenciales: ', saveResults.credentials.saved ? `✅ Email: ${saveResults.credentials.email}` : `⚠️ ${saveResults.credentials.error || 'No configuradas'}`);
    console.log('Documentos:   ', saveResults.documents.saved > 0 ? `✅ ${saveResults.documents.saved}/${saveResults.documents.total}` : `⚠️ 0/${saveResults.documents.total}`);
    console.log('Pagos:        ', saveResults.payment.saved ? '✅' : `⚠️ ${saveResults.payment.error || 'No configurados'}`);
    console.log('Referencias:  ', saveResults.references.saved ? `✅ P:${saveResults.references.personal} C:${saveResults.references.commercial}` : `⚠️ ${saveResults.references.error || 'No agregadas'}`);
    console.log('Contrato:     ', saveResults.contract.saved ? '✅' : `⚠️ ${saveResults.contract.error || 'No configurado'}`);
    console.log('Propiedades:  ', saveResults.properties.saved > 0 ? `✅ ${saveResults.properties.saved}` : `⚠️ ${saveResults.properties.error || 'No asignadas'}`);
    console.log('==============================================\n');

    // Construir mensaje de resumen para el usuario
    const successCount = [
      saveResults.client.saved,
      saveResults.credentials.saved,
      saveResults.documents.saved > 0,
      saveResults.payment.saved,
      saveResults.references.saved,
      saveResults.contract.saved,
      saveResults.properties.saved > 0
    ].filter(Boolean).length;

    const warningMessages = [];
    if (!saveResults.credentials.saved) warningMessages.push('- Credenciales del portal no configuradas');
    if (saveResults.documents.saved === 0 && saveResults.documents.total > 0) warningMessages.push(`- Documentos no subidos (${saveResults.documents.errors.length} errores)`);
    if (!saveResults.payment.saved) warningMessages.push('- Configuración de pagos no guardada');
    if (!saveResults.references.saved) warningMessages.push('- Referencias no agregadas');
    if (!saveResults.contract.saved) warningMessages.push('- Información del contrato no guardada');
    if (saveResults.properties.saved === 0 && saveResults.properties.total > 0) warningMessages.push('- Propiedades no asignadas');

    // Recargar lista de clientes
    await loadClients();

    // Cerrar wizard
    setShowWizard(false);

    // Mostrar mensaje al usuario
    if (warningMessages.length === 0) {
      alert(`✅ Cliente creado exitosamente con TODOS los datos!

📊 Resumen:
- Cliente: ✅ Creado
- Credenciales: ✅ Configuradas
- Documentos: ✅ ${saveResults.documents.saved} subidos
- Pagos: ✅ Configurados
- Referencias: ✅ ${saveResults.references.personal + saveResults.references.commercial} agregadas
- Contrato: ✅ Configurado
- Propiedades: ✅ ${saveResults.properties.saved} asignadas`);
    } else {
      alert(`⚠️ Cliente creado con algunas advertencias

✅ Guardado exitosamente (${successCount}/7 secciones)

⚠️ Secciones con advertencias:
${warningMessages.join('\n')}

Revisa la consola del navegador (F12) para más detalles.`);
    }

  } catch (error: any) {
    console.error('\n❌❌❌ ERROR CRÍTICO EN CREACIÓN DE CLIENTE ❌❌❌');
    console.error('Error:', error);
    console.error('Stack trace:', error.stack);
    console.error('==============================================\n');
    
    alert(`❌ Error crítico al crear el cliente:

${error.message}

Por favor, revisa la consola del navegador (F12) para más detalles.`);
  }
};
