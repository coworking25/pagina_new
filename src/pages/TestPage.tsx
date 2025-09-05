import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🏠 Test Simple</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          Si puedes ver esta página, React está funcionando correctamente.
        </p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>✅ Estado de la Aplicación</h3>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>✅ React está cargado</li>
            <li>✅ React Router funciona</li>
            <li>✅ TypeScript compila</li>
            <li>✅ Servidor de desarrollo activo</li>
          </ul>
        </div>
        
        <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>
          Para volver a la aplicación principal, navega a: 
          <br />
          <a href="/" style={{ color: '#fbbf24' }}>http://localhost:5173/</a>
        </p>
      </div>
    </div>
  );
};

export default TestPage;
