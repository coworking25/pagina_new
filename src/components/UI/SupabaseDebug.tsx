import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SupabaseDebugProps {
  isOpen: boolean;
}

const SupabaseDebug: React.FC<SupabaseDebugProps> = ({ isOpen }) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    const logs: string[] = [];
    
    try {
      // 1. Verificar variables de entorno
      logs.push('🔧 Verificando variables de entorno...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      logs.push(`VITE_SUPABASE_URL: ${supabaseUrl || '[NO DEFINIDA]'}`);
      logs.push(`VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '[CONFIGURADA]' : '[NO DEFINIDA]'}`);
      
      // 2. Verificar si el cliente está inicializado
      logs.push('🔧 Verificando cliente Supabase...');
      if (supabase) {
        logs.push('✅ Cliente Supabase inicializado');
      } else {
        logs.push('❌ Cliente Supabase NO inicializado');
        setDebugInfo(logs);
        return;
      }
      
      // 3. Probar conectividad básica
      logs.push('🔗 Probando conectividad...');
      const { data, error } = await supabase
        .from('property_appointments')
        .select('count')
        .limit(1);
      
      if (error) {
        logs.push(`❌ Error de conectividad: ${error.message}`);
        logs.push(`❌ Código de error: ${error.code}`);
        logs.push(`❌ Detalles: ${JSON.stringify(error.details || {})}`);
      } else {
        logs.push('✅ Conectividad exitosa con la tabla property_appointments');
        logs.push(`📊 Resultado: ${JSON.stringify(data)}`);
      }
      
    } catch (error) {
      logs.push(`❌ Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
    
    setDebugInfo(logs);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔧 Debug Supabase</h4>
      <div>
        {debugInfo.map((log, index) => (
          <div key={index} style={{ 
            marginBottom: '5px',
            color: log.includes('❌') ? 'red' : log.includes('✅') ? 'green' : 'black'
          }}>
            {log}
          </div>
        ))}
      </div>
      <button 
        onClick={runDiagnostics}
        style={{ marginTop: '10px', padding: '5px 10px' }}
      >
        🔄 Re-ejecutar
      </button>
    </div>
  );
};

export default SupabaseDebug;
