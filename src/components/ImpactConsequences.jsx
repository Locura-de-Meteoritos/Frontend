import React from 'react';

/**
 * Componente que muestra las consecuencias detalladas de un impacto de asteroide
 * Basado en el sistema IMPACTUS de NASA
 */
export default function ImpactConsequences({ impact, show = true }) {
  if (!show || !impact || !impact.consequences) return null;

  const { consequences, historical, summary, impactType, energy } = impact;

  return (
    <div className="glass" style={{
      position: 'absolute',
      right: 20,
      top: 110,
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
          color: summary.severity === 'CATASTRÓFICO' ? '#ff6b6b' :
                 summary.severity === 'SEVERO' ? '#ffa500' :
                 summary.severity === 'MODERADO' ? '#feca57' : '#51cf66'
        }}>
          ⚠️ {summary.severity}
        </h3>
        <div style={{ fontSize: '0.9em', color: '#a0a0a0' }}>
          Amenaza Principal: <strong style={{ color: '#fff' }}>{summary.primaryThreat}</strong>
        </div>
        <div style={{ fontSize: '0.85em', color: '#a0a0a0', marginTop: 4 }}>
          Tipo de Impacto: <strong style={{ color: impactType === 'OCÉANO' ? '#4fc3f7' : '#8d6e63' }}>
            {impactType === 'OCÉANO' ? '🌊 ' : '🏔️ '}{impactType}
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
          📊 COMPARACIÓN HISTÓRICA
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
          <div style={{ fontSize: '0.75em', color: '#a0a0a0', marginBottom: 4 }}>Energía</div>
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
          <div style={{ fontSize: '0.75em', color: '#a0a0a0', marginBottom: 4 }}>Equivalente</div>
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
          🚨 CONSECUENCIAS ESTIMADAS
        </h4>

        {/* Tsunami */}
        <ConsequenceItem
          icon="🌊"
          label="Riesgo de Tsunami"
          value={consequences.tsunami.risk}
          severity={consequences.tsunami.risk}
          details={consequences.tsunami.description}
        />

        {/* Actividad Sísmica */}
        <ConsequenceItem
          icon="🌋"
          label="Actividad Sísmica"
          value={`Magnitud ${consequences.seismic.magnitude}`}
          severity={parseFloat(consequences.seismic.magnitude) > 7 ? 'ALTO' : 
                   parseFloat(consequences.seismic.magnitude) > 5 ? 'MODERADO' : 'BAJO'}
          details={consequences.seismic.description}
        />

        {/* Cambio Atmosférico */}
        <ConsequenceItem
          icon="☁️"
          label="Cambio Atmosférico"
          value={consequences.atmospheric.risk}
          severity={consequences.atmospheric.risk}
          details={consequences.atmospheric.description}
        />

        {/* Población en Riesgo */}
        <ConsequenceItem
          icon="🏙️"
          label="Población en Riesgo"
          value={formatPopulation(consequences.population.total)}
          severity={consequences.population.total > 1000000 ? 'MUY ALTO' : 
                   consequences.population.total > 100000 ? 'ALTO' : 'MODERADO'}
          details={`Evacuación requerida: ${consequences.population.evacuationRadius.toFixed(1)} km`}
        />

        {/* Incendios */}
        <ConsequenceItem
          icon="🔥"
          label="Incendios Masivos"
          value={consequences.fire.risk}
          severity={consequences.fire.risk}
          details={consequences.fire.description}
        />

        {/* Efectos sísmicos extendidos */}
        {parseFloat(consequences.seismic.magnitude) > 4 && (
          <ConsequenceItem
            icon="📡"
            label="Alcance Sísmico"
            value={consequences.seismic.felt}
            severity="MODERADO"
            details="Ondas sísmicas detectables"
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
          📏 RADIOS DE DAÑO
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85em' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ff6b6b' }}>● Destrucción Total</span>
            <strong>{impact.radii.total.toFixed(2)} km</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ff9800' }}>● Daño Severo</span>
            <strong>{impact.radii.severe.toFixed(2)} km</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ffc107' }}>● Daño Moderado</span>
            <strong>{impact.radii.moderate.toFixed(2)} km</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4caf50' }}>● Daño Leve</span>
            <strong>{impact.radii.light.toFixed(2)} km</strong>
          </div>
        </div>
      </div>

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
            ❄️ EFECTOS CLIMÁTICOS DE LARGO PLAZO
          </div>
          <div style={{ fontSize: '0.8em' }}>
            <div>• Enfriamiento global: <strong>{consequences.atmospheric.coolingYears} años</strong></div>
            <div>• Polvo atmosférico: <strong>{consequences.atmospheric.dustTons.toLocaleString()} toneladas</strong></div>
            {consequences.atmospheric.ozoneDepletion && (
              <div style={{ color: '#ff6b6b' }}>• ⚠️ Reducción capa de ozono</div>
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
        <div>📡 Basado en datos de NASA NEO, CNEOS JPL</div>
        <div>⚠️ Estimaciones con fines educativos</div>
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
