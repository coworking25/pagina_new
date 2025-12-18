const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateAlertProcessing() {
  console.log('🤖 Simulando procesamiento automático de alertas...\n');

  const clientId = '11111111-1111-1111-1111-111111111111';

  // 1. Obtener cliente y configuración
  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name, email, phone')
    .eq('id', clientId)
    .single();

  const { data: settings } = await supabase
    .from('payment_alert_settings')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (!client || !settings) {
    console.error('❌ Cliente o configuración no encontrados');
    return;
  }

  console.log('📋 Cliente:', client.full_name);
  console.log('📧 Email:', settings.email_enabled ? '✅' : '❌');
  console.log('📱 WhatsApp:', settings.whatsapp_enabled ? '✅' : '❌');

  // 2. Obtener todos los pagos pendientes
  const { data: payments } = await supabase
    .from('payment_schedules')
    .select('*')
    .eq('client_id', clientId)
    .in('status', ['pending', 'partial'])
    .order('due_date', { ascending: true });

  console.log(`\n💰 Pagos pendientes/parciales: ${payments.length}\n`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let alertsToSend = [];

  // 3. Analizar cada pago
  for (const payment of payments) {
    const dueDate = new Date(payment.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(`📅 ${payment.payment_concept}`);
    console.log(`   Monto: $${payment.amount.toLocaleString()}`);
    console.log(`   Vence: ${payment.due_date}`);
    console.log(`   Días: ${daysUntilDue > 0 ? daysUntilDue + ' hasta vencimiento' : Math.abs(daysUntilDue) + ' VENCIDO'}`);

    let alertType = null;

    if (daysUntilDue < 0) {
      // Vencido
      const daysOverdue = Math.abs(daysUntilDue);
      
      if (daysOverdue >= 15) alertType = 'overdue_15_days';
      else if (daysOverdue >= 7) alertType = 'overdue_7_days';
      else if (daysOverdue >= 3) alertType = 'overdue_3_days';
      else alertType = 'overdue_1_day';

      console.log(`   ⚠️ Alerta: ${alertType}`);
      alertsToSend.push({ payment, alertType, daysOverdue });
    } else if (daysUntilDue === 0) {
      // Vence hoy
      alertType = 'due_today';
      console.log(`   ⏰ Alerta: ${alertType}`);
      alertsToSend.push({ payment, alertType, daysUntilDue });
    } else if (settings.days_before_due.includes(daysUntilDue)) {
      // Recordatorio
      if (daysUntilDue === 7) alertType = 'reminder_7_days';
      else if (daysUntilDue === 3) alertType = 'reminder_3_days';
      else if (daysUntilDue === 1) alertType = 'reminder_1_day';

      if (alertType) {
        console.log(`   🔔 Alerta: ${alertType}`);
        alertsToSend.push({ payment, alertType, daysUntilDue });
      }
    } else {
      console.log(`   ⏳ Sin alertas hoy`);
    }
    console.log('');
  }

  // 4. Enviar alertas
  console.log(`\n📤 Total de alertas a enviar: ${alertsToSend.length}\n`);

  for (const alert of alertsToSend) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📧 EMAIL - ${alert.alertType}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Obtener plantilla email
    const { data: emailTemplate } = await supabase
      .from('payment_alert_templates')
      .select('*')
      .eq('alert_type', alert.alertType)
      .eq('channel', 'email')
      .single();

    if (emailTemplate) {
      let message = emailTemplate.message_template
        .replace(/{client_name}/g, client.full_name)
        .replace(/{payment_concept}/g, alert.payment.payment_concept)
        .replace(/{amount}/g, alert.payment.amount.toLocaleString('es-CO'))
        .replace(/{due_date}/g, new Date(alert.payment.due_date).toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }))
        .replace(/{days_until_due}/g, (alert.daysUntilDue || 0).toString())
        .replace(/{days_overdue}/g, (alert.daysOverdue || 0).toString())
        .replace(/{paid_amount}/g, (alert.payment.paid_amount || 0).toLocaleString('es-CO'))
        .replace(/{remaining_amount}/g, (alert.payment.remaining_amount || alert.payment.amount).toLocaleString('es-CO'));

      console.log(`Para: ${client.email}`);
      console.log(`Asunto: ${emailTemplate.subject_template.replace(/{days_overdue}/g, alert.daysOverdue || 0)}`);
      console.log(``);
      console.log(message);
      console.log(``);

      // Registrar en base de datos
      await supabase.from('payment_alerts_sent').insert({
        payment_schedule_id: alert.payment.id,
        client_id: clientId,
        alert_type: alert.alertType,
        channel: 'email',
        status: 'sent',
        subject: emailTemplate.subject_template.replace(/{days_overdue}/g, alert.daysOverdue || 0),
        message: message,
        payment_amount: alert.payment.amount,
        paid_amount: alert.payment.paid_amount || 0,
        remaining_amount: alert.payment.remaining_amount || alert.payment.amount,
        due_date: alert.payment.due_date,
        days_overdue: alert.daysOverdue || 0,
        sent_at: new Date().toISOString()
      });
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📱 WHATSAPP - ${alert.alertType}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Obtener plantilla WhatsApp
    const { data: whatsappTemplate } = await supabase
      .from('payment_alert_templates')
      .select('*')
      .eq('channel', 'whatsapp')
      .or(`alert_type.eq.${alert.alertType},alert_type.eq.${alert.alertType.split('_')[0]}_${alert.alertType.split('_')[1]}_day${alert.alertType.includes('days') ? 's' : ''}`)
      .single();

    if (whatsappTemplate) {
      let message = whatsappTemplate.message_template
        .replace(/{client_name}/g, client.full_name)
        .replace(/{payment_concept}/g, alert.payment.payment_concept)
        .replace(/{amount}/g, alert.payment.amount.toLocaleString('es-CO'))
        .replace(/{due_date}/g, new Date(alert.payment.due_date).toLocaleDateString('es-ES'))
        .replace(/{days_until_due}/g, (alert.daysUntilDue || 0).toString())
        .replace(/{days_overdue}/g, (alert.daysOverdue || 0).toString())
        .replace(/{paid_amount}/g, (alert.payment.paid_amount || 0).toLocaleString('es-CO'))
        .replace(/{remaining_amount}/g, (alert.payment.remaining_amount || alert.payment.amount).toLocaleString('es-CO'));

      console.log(`Para: ${client.phone}`);
      console.log(``);
      console.log(message);
      console.log(``);

      // Registrar en base de datos
      await supabase.from('payment_alerts_sent').insert({
        payment_schedule_id: alert.payment.id,
        client_id: clientId,
        alert_type: alert.alertType,
        channel: 'whatsapp',
        status: 'sent',
        message: message,
        payment_amount: alert.payment.amount,
        paid_amount: alert.payment.paid_amount || 0,
        remaining_amount: alert.payment.remaining_amount || alert.payment.amount,
        due_date: alert.payment.due_date,
        days_overdue: alert.daysOverdue || 0,
        sent_at: new Date().toISOString()
      });
    }

    console.log('');
  }

  // 5. Resumen final
  console.log('═══════════════════════════════════════════');
  console.log('📊 RESUMEN DEL PROCESAMIENTO');
  console.log('═══════════════════════════════════════════');
  console.log(`Total de pagos analizados: ${payments.length}`);
  console.log(`Alertas generadas: ${alertsToSend.length}`);
  console.log(`Emails enviados: ${alertsToSend.length}`);
  console.log(`WhatsApp enviados: ${alertsToSend.length}`);
  console.log('═══════════════════════════════════════════');

  // Ver historial actualizado
  const { data: history } = await supabase
    .from('payment_alerts_sent')
    .select('alert_type, channel, status')
    .eq('client_id', clientId);

  console.log(`\n📜 Historial total: ${history.length} alertas registradas`);
  
  const byType = {};
  const byChannel = {};
  history.forEach(a => {
    byType[a.alert_type] = (byType[a.alert_type] || 0) + 1;
    byChannel[a.channel] = (byChannel[a.channel] || 0) + 1;
  });

  console.log('\nPor tipo:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  console.log('\nPor canal:');
  Object.entries(byChannel).forEach(([channel, count]) => {
    console.log(`   ${channel}: ${count}`);
  });

  console.log('\n✅ Simulación completada!');
}

simulateAlertProcessing().catch(console.error);
