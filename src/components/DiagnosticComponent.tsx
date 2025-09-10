import React from 'react';

// Componente de diagnóstico simple
export function DiagnosticComponent() {
  console.log('🔍 DiagnosticComponent se está renderizando correctamente');
  
  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
      <h2 className="text-lg font-bold text-green-800">✅ Diagnóstico</h2>
      <p className="text-green-700">Si ves este mensaje, React está funcionando correctamente.</p>
      <p className="text-sm text-green-600 mt-2">
        Timestamp: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}

export default DiagnosticComponent;
