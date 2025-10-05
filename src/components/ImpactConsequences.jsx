import React from 'react';

/**
 * Componente que muestra las consecuencias detalladas de un impacto de asteroide
 * Basado en el sistema IMPACTUS de NASA
 * Compatible con API Backend y cálculos locales
 */
export default function ImpactConsequences({ impact, show = true }) {
  if (!show || !impact) return null;

  // ============================================================================
  // ADAPTADOR: Normalizar estructura de datos (Backend vs Local)
  // ============================================================================
  // El backend puede devolver estructuras diferentes a los cálculos locales
  // Este adaptador convierte ambos formatos a una estructura unificada
  
  const isBackend = impact._source === 'backend';
  const hasConsequences = impact.consequences || false;
  
  // Si no hay datos de consecuencias, no mostrar nada
  if (!hasConsequences && !impact.energy && !impact.radii) return null;
  
  // Normalizar estructura de datos
  let normalizedImpact = {};
  
  if (hasConsequences) {
    // Formato LOCAL (con consequences)
    normalizedImpact = impact;
  } else {
    // Formato BACKEND o simplificado (sin consequences)
    // Construir estructura de consequences a partir de datos disponibles
    normalizedImpact = {
      consequences: {
        tsunami: {
          risk: 'LOW',
          description: 'Tsunami analysis not available'
        },
        seismic: {
          magnitude: '0.0',
          description: 'Seismic data not available',
          felt: 'Not available'
        },
        atmospheric: {
          risk: 'LOW',
          description: 'Atmospheric analysis not available',
          coolingYears: 0,
          dustTons: 0,
          ozoneDepletion: false
        },
        population: {
          total: 0,
          evacuationRadius: impact.radii?.total || 0
        },
        fire: {
          risk: 'LOW',
          description: 'Fire analysis not available'
        }
      },
      historical: {
        comparison: 'Historical comparison not available',
        event: {
          name: 'N/A',
          energy: 0,
          casualties: 'Data not available'
        }
      },
      summary: {
        severity: determineSeverity(impact.energy),
        primaryThreat: 'Shockwave and heat'
      },
      impactType: 'TERRESTRIAL',
      energy: impact.energy || { kilotons: 0, megatons: 0, hiroshimasEquivalent: 0 },
      radii: impact.radii || { total: 0, severe: 0, moderate: 0, light: 0 }
    };
  }
  
  const { consequences, historical, summary, impactType, energy, radii } = normalizedImpact;

  return (
    <div className="glass" style={{
      position: 'absolute',
      right: 20,
      top: 140,
      width: 380,
      maxHeight: 'calc(100vh - 140px)',
      overflowY: 'auto',
      zIndex: 60,
      borderRadius: 12,
      border: '2px solid rgba(255, 107, 107, 0.4)',
      color: '#fff',
      padding: 20,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      
      {/* Header con severidad */}
      <div style={{
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{
          margin: 0,
          marginBottom: 8,
          fontSize: '1.4em',
          color: summary.severity === 'CATASTROPHIC' ? '#ff6b6b' :
                 summary.severity === 'SEVERE' ? '#ffa500' :
                 summary.severity === 'MODERATE' ? '#feca57' : '#51cf66'
        }}>
          ⚠️ {summary.severity}
        </h3>
        <div style={{ fontSize: '0.9em', color: '#a0a0a0' }}>
          Primary Threat: <strong style={{ color: '#fff' }}>{summary.primaryThreat}</strong>
        </div>
        <div style={{ fontSize: '0.85em', color: '#a0a0a0', marginTop: 4 }}>
          Impact Type: <strong style={{ color: impactType === 'OCEAN' ? '#4fc3f7' : '#8d6e63' }}>
            {impactType === 'OCEAN' ? '🌊 ' : '🏔️ '}{impactType}
          </strong>
        </div>
      </div>

      {/* Comparación histórica */}
      <div style={{
        background: 'rgba(254, 202, 87, 0.15)',
        border: '2px solid #feca57',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
      }}>
        <div style={{ fontSize: '0.85em', fontWeight: 700, color: '#feca57', marginBottom: 6 }}>
          📊 HISTORICAL COMPARISON
        </div>
        <div style={{ fontSize: '0.9em', marginBottom: 6 }}>
          {historical.comparison}
        </div>
        <div style={{ fontSize: '0.8em', color: '#a0a0a0' }}>
          {historical.event.name}: {historical.event.energy.toLocaleString()} kt
          <br/>
          {historical.event.casualties}
        </div>
      </div>

      {/* Estadísticas de energía */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 16
      }}>
        <div style={{
          background: 'rgba(102, 126, 234, 0.2)',
          padding: 10,
          borderRadius: 6,
          border: '1px solid rgba(102, 126, 234, 0.4)'
        }}>
          <div style={{ fontSize: '0.75em', color: '#a0a0a0', marginBottom: 4 }}>Energy</div>
          <div style={{ fontSize: '1.3em', fontWeight: 700, color: '#feca57' }}>
            {energy.kilotons >= 1000 
              ? `${energy.megatons.toFixed(1)} Mt`
              : `${energy.kilotons.toFixed(0)} kt`
            }
          </div>
        </div>
        <div style={{
          background: 'rgba(102, 126, 234, 0.2)',
          padding: 10,
          borderRadius: 6,
          border: '1px solid rgba(102, 126, 234, 0.4)'
        }}>
          <div style={{ fontSize: '0.75em', color: '#a0a0a0', marginBottom: 4 }}>Equivalent</div>
          <div style={{ fontSize: '1.3em', fontWeight: 700, color: '#feca57' }}>
            {energy.hiroshimasEquivalent >= 1 
              ? `${energy.hiroshimasEquivalent.toFixed(0)}× Hiroshima`
              : `${(energy.hiroshimasEquivalent * 100).toFixed(0)}% Hiroshima`
            }
          </div>
        </div>
      </div>

      {/* Consecuencias detalladas */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{
          margin: 0,
          marginBottom: 12,
          fontSize: '1.1em',
          color: '#ff6b6b'
        }}>
          🚨 ESTIMATED CONSEQUENCES
        </h4>

        {/* Tsunami */}
        <ConsequenceItem
          icon="🌊"
          label="Tsunami Risk"
          value={consequences.tsunami.risk}
          severity={consequences.tsunami.risk}
          details={consequences.tsunami.description}
        />

        {/* Actividad Sísmica */}
        <ConsequenceItem
          icon="🌋"
          label="Seismic Activity"
          value={`Magnitude ${consequences.seismic.magnitude}`}
          severity={parseFloat(consequences.seismic.magnitude) > 7 ? 'HIGH' : 
                   parseFloat(consequences.seismic.magnitude) > 5 ? 'MODERATE' : 'LOW'}
          details={consequences.seismic.description}
        />

        {/* Cambio Atmosférico */}
        <ConsequenceItem
          icon="☁️"
          label="Atmospheric Change"
          value={consequences.atmospheric.risk}
          severity={consequences.atmospheric.risk}
          details={consequences.atmospheric.description}
        />

        {/* Población en Riesgo */}
        <ConsequenceItem
          icon="🏙️"
          label="Population at Risk"
          value={formatPopulation(consequences.population.total)}
          severity={consequences.population.total > 1000000 ? 'VERY HIGH' : 
                   consequences.population.total > 100000 ? 'HIGH' : 'MODERATE'}
          details={`Evacuation required: ${consequences.population.evacuationRadius.toFixed(1)} km`}
        />

        {/* Incendios */}
        <ConsequenceItem
          icon="🔥"
          label="Massive Fires"
          value={consequences.fire.risk}
          severity={consequences.fire.risk}
          details={consequences.fire.description}
        />

        {/* Efectos sísmicos extendidos */}
        {parseFloat(consequences.seismic.magnitude) > 4 && (
          <ConsequenceItem
            icon="📡"
            label="Seismic Range"
            value={consequences.seismic.felt}
            severity="MODERATE"
            details="Detectable seismic waves"
          />
        )}
      </div>

      {/* Radios de daño */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
      }}>
        <div style={{ fontSize: '0.9em', fontWeight: 700, marginBottom: 8, color: '#feca57' }}>
          📏 DAMAGE RADII
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85em' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ff6b6b' }}>● Total Destruction</span>
            <strong>{radii.total.toFixed(2)} km</strong>
          </div>
          {radii.severe !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff9800' }}>● Severe Damage</span>
              <strong>{radii.severe.toFixed(2)} km</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ffc107' }}>● Moderate Damage</span>
            <strong>{radii.moderate.toFixed(2)} km</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4caf50' }}>● Light Damage</span>
            <strong>{radii.light.toFixed(2)} km</strong>
          </div>
        </div>
      </div>

      {/* Indicador de fuente de datos */}
      {isBackend && (
        <div style={{
          background: 'rgba(102, 126, 234, 0.2)',
          border: '1px solid rgba(102, 126, 234, 0.5)',
          borderRadius: 6,
          padding: 8,
          marginBottom: 12,
          fontSize: '0.75em',
          color: '#4fc3f7',
          textAlign: 'center'
        }}>
          🛰️ Data calculated by Backend (NASA Models)
        </div>
      )}

      {/* Efectos climáticos de larga duración */}
      {consequences.atmospheric.coolingYears > 0 && (
        <div style={{
          background: 'rgba(156, 39, 176, 0.15)',
          border: '2px solid rgba(156, 39, 176, 0.5)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12
        }}>
          <div style={{ fontSize: '0.85em', fontWeight: 700, color: '#ce93d8', marginBottom: 6 }}>
            ❄️ LONG-TERM CLIMATE EFFECTS
          </div>
          <div style={{ fontSize: '0.8em' }}>
            <div>• Global cooling: <strong>{consequences.atmospheric.coolingYears} years</strong></div>
            <div>• Atmospheric dust: <strong>{consequences.atmospheric.dustTons.toLocaleString()} tons</strong></div>
            {consequences.atmospheric.ozoneDepletion && (
              <div style={{ color: '#ff6b6b' }}>• ⚠️ Ozone layer depletion</div>
            )}
          </div>
        </div>
      )}

      {/* Footer con fuentes */}
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.7em',
        color: '#666'
      }}>
        <div>📡 Based on NASA NEO, CNEOS JPL data</div>
        <div>⚠️ Estimates for educational purposes</div>
      </div>
    </div>
  );
}

/**
 * Componente helper para mostrar un item de consecuencia
 */
function ConsequenceItem({ icon, label, value, severity, details }) {
  const getSeverityColor = (sev) => {
    if (!sev) return '#4caf50';
    const s = typeof sev === 'string' ? sev.toUpperCase() : sev;
    if (s.includes('CATASTRÓFICO') || s.includes('EXTINCIÓN')) return '#d32f2f';
    if (s.includes('MUY ALTO') || s.includes('ALTO')) return '#ff6b6b';
    if (s.includes('MODERADO') || s.includes('MEDIO')) return '#ffa500';
    if (s.includes('BAJO') || s.includes('LEVE') || s.includes('MÍNIMO')) return '#4caf50';
    return '#feca57';
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: 10,
      marginBottom: 8,
      borderRadius: 6,
      borderLeft: `4px solid ${getSeverityColor(severity)}`
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: details ? 4 : 0
      }}>
        <span style={{ fontSize: '0.85em' }}>
          {icon} {label}
        </span>
        <span style={{
          fontSize: '0.85em',
          fontWeight: 700,
          color: getSeverityColor(severity)
        }}>
          {value}
        </span>
      </div>
      {details && (
        <div style={{
          fontSize: '0.75em',
          color: '#a0a0a0',
          marginTop: 4
        }}>
          {details}
        </div>
      )}
    </div>
  );
}

/**
 * Formatea números de población
 */
function formatPopulation(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

/**
 * Determina la severidad del impacto basado en la energía
 * @param {object} energy - Objeto con kilotons, megatons, etc.
 * @returns {string} - Nivel de severidad
 */
function determineSeverity(energy) {
  if (!energy || !energy.kilotons) return 'UNKNOWN';
  
  const kt = energy.kilotons;
  
  if (kt >= 100000) return 'MASS EXTINCTION';
  if (kt >= 10000) return 'CATASTROPHIC';
  if (kt >= 1000) return 'SEVERE';
  if (kt >= 100) return 'MODERATE';
  if (kt >= 10) return 'LOW';
  return 'MINIMAL';
}
