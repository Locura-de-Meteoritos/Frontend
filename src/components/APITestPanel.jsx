import { useState } from 'react';
import { 
  checkHealth, 
  getNearEarthAsteroids, 
  simulateImpact 
} from '../services/impactAPI';

/**
 * ============================================================================
 * COMPONENTE DE PRUEBA - API BACKEND
 * ============================================================================
 * 
 * Este componente permite probar manualmente los endpoints del backend.
 * Útil para debugging y verificar que la integración funciona correctamente.
 * 
 * Para usar:
 * 1. Importar en simulacion.jsx o cualquier otra página
 * 2. Renderizar: <APITestPanel />
 * 3. Hacer clic en los botones para probar cada endpoint
 */
export default function APITestPanel() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const runTest = async (testName, testFn) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    setError(null);
    
    try {
      const result = await testFn();
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: true, 
          data: result,
          timestamp: new Date().toISOString()
        } 
      }));
    } catch (err) {
      setError(`${testName}: ${err.message}`);
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: err.message,
          timestamp: new Date().toISOString()
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      id: 'health',
      name: '🏥 Health Check',
      description: 'Verificar estado del backend',
      fn: () => checkHealth()
    },
    {
      id: 'neos',
      name: '🌑 Near-Earth Objects',
      description: 'Obtener asteroides cercanos (NASA)',
      fn: () => getNearEarthAsteroids()
    },
    {
      id: 'impact',
      name: '💥 Simular Impacto',
      description: 'Simular impacto en São Paulo',
      fn: () => simulateImpact({
        diameter_m: 507,
        velocity_km_s: 18.29,
        impact_location: { lat: -23.5505, lon: -46.6333 },
        target_type: 'land'
      })
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 360,
      width: 400,
      maxHeight: '60vh',
      overflowY: 'auto',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      padding: 16,
      zIndex: 1000,
      color: '#fff',
      fontSize: '0.85rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
        🔧 API Test Panel
      </h3>

      {error && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.2)',
          border: '1px solid #ff6b6b',
          padding: 8,
          borderRadius: 6,
          marginBottom: 12,
          fontSize: '0.75rem'
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tests.map(test => (
          <div key={test.id}>
            <button
              onClick={() => runTest(test.id, test.fn)}
              disabled={loading[test.id]}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: loading[test.id] 
                  ? 'rgba(100, 100, 100, 0.3)' 
                  : 'rgba(103, 126, 234, 0.2)',
                border: '1px solid rgba(103, 126, 234, 0.5)',
                borderRadius: 8,
                color: '#fff',
                cursor: loading[test.id] ? 'wait' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {test.name}
                {loading[test.id] && ' ⏳'}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                {test.description}
              </div>
            </button>

            {results[test.id] && (
              <div style={{
                marginTop: 4,
                padding: 8,
                background: results[test.id].success 
                  ? 'rgba(76, 175, 80, 0.1)' 
                  : 'rgba(255, 107, 107, 0.1)',
                borderRadius: 6,
                fontSize: '0.7rem',
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {results[test.id].success ? '✅ Success' : '❌ Error'}
                </div>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-all',
                  fontSize: '0.65rem'
                }}>
                  {JSON.stringify(
                    results[test.id].success 
                      ? results[test.id].data 
                      : results[test.id].error, 
                    null, 
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 12,
        padding: 8,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 6,
        fontSize: '0.7rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          📡 Backend URL:
        </div>
        <code style={{ fontSize: '0.65rem' }}>
          {import.meta.env.VITE_BACKEND_URL || 'https://backend-ns-t0p7.onrender.com'}
        </code>
      </div>
    </div>
  );
}
