import { Canvas, useThree } from "@react-three/fiber";
import Earth3D from "./Earth3D";
import Background from "./Background";
import Header from "./Header";
import Footer from "./Footer";
import { useState, useRef, useCallback, useEffect } from "react";
import Asteroid from "./Asteroid";
import ImpactConsequences from "./ImpactConsequences";
import * as THREE from 'three';
import { 
  HISTORICAL_EVENTS, 
  calculateFullImpact,
  compareWithHistory 
} from '../utils/impactCalculations';

const Simulacion = () => {
  const [params, setParams] = useState({
    tipo: "Roca",
    masa: 1000,
    velocidad: 20,
    densidad: 3000,
    angulo: 45,
  });

  const [showHelpers, setShowHelpers] = useState(false);
  const [freezeRotation, setFreezeRotation] = useState(false);
  const [craters, setCraters] = useState([]);
  const [lastImpact, setLastImpact] = useState(null);
  const [fullImpactAnalysis, setFullImpactAnalysis] = useState(null); // Análisis completo NASA
  const [asteroids, setAsteroids] = useState([]);
  const [awaitingTarget, setAwaitingTarget] = useState(false);
  const earthRef = useRef();
  const idRef = useRef(0);
  const [neos, setNeos] = useState([]);
  const [neosLoading, setNeosLoading] = useState(false);
  const [neosError, setNeosError] = useState(null);
  const [neoFilter, setNeoFilter] = useState('all'); // 'all', 'hazardous', 'historical'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

  // Predicción en vivo del cráter según parámetros actuales (para mostrar en el panel)
  // Nota: la evaluación de `previewCrater` debe ocurrir después de declarar `craterCalculator`
  // para evitar el ReferenceError (TDZ). Se define más abajo, justo después del objeto `craterCalculator`.

  const handleSimulate = () => {
    // Enter "awaiting click" mode: user must click on the planet to choose impact point
    setAwaitingTarget(true);
    // Optionally show a brief instruction (overlay handled below)
  };

  // Escala realista de la Tierra (unidades del mundo -> km)
  // Definimos 1 unidad = 1000 km para mantener números manejables en la escena.
  const REAL_EARTH_RADIUS_KM = 6371; // km
  const KM_PER_UNIT = 1000; // 1 unidad = 1000 km
  const planetRadius = REAL_EARTH_RADIUS_KM / KM_PER_UNIT; // ej. ~6.371 unidades
  const planetOffsetY = -0.2 * planetRadius; // mismo offset relativo que antes (-0.4 cuando radius=2)

    // ============================================================================
    // === OBJETO / UTILIDAD DE CÁLCULO FÍSICO DEL CRÁTER ========================
    // Este objeto centraliza las fórmulas para:
    //  - Convertir la velocidad interna (slider 1..100 -> speedScene 0.2..2.0 u/s) a km/s reales
    //  - Calcular energía cinética E = 0.5 * m * v^2
    //  - Estimar un diámetro físico de cráter (modelo muy simplificado / pedagógico)
    //  - Convertir ese diámetro a unidades de la escena (1 unidad = 1000 km)
    //  - Aplicar una exageración visual controlada para mantener visibilidad y diferencias
    // Devuelve además valores intermedios para poder mostrarlos / depurarlos.
    // NOTA: Mantiene la textura y el pipeline existente sin alterar la lógica de spawn.
    // ============================================================================
    const craterCalculator = {
      MIN_KM_S: 11,
      MAX_KM_S: 70,
      KM_PER_UNIT,
      // Mapea la velocidad interna (0.2..2.0 u/s) a km/s (rango 11..70)
      mapSceneSpeedToKmS(speedScene) {
        const span = this.MAX_KM_S - this.MIN_KM_S;
        return this.MIN_KM_S + ((speedScene - 0.2) / 1.8) * span;
      },
      // Energía cinética en Joules
      energyJ(masaKg, v_m_s) {
        return 0.5 * masaKg * Math.pow(v_m_s, 2);
      },
      // Diámetro transitorio (m) usando ley de potencia: D_t = C * E^(1/3.4)
      transientDiameterMeters(energyJ) {
        const C = 0.032; // coeficiente empírico ajustado para mostrar valores razonables
        return C * Math.pow(energyJ, 1/3.4);
      },
      // Ajuste a diámetro final (m) (simple factor)
      finalDiameterMeters(D_t_m) {
        return D_t_m * 1.3;
      },
      // Convierte diámetro físico (m) a radio en unidades de escena
      diameterMetersToRadiusUnits(finalDiameter_m) {
        const diameter_km = finalDiameter_m / 1000;
        return (diameter_km / this.KM_PER_UNIT) / 2; // radio
      },
      // Exageración visual dependiente de la energía (escala logarítmica sub-lineal)
      exaggerationFactor(energyJ) {
        const logE = Math.log10(Math.max(energyJ, 1));
        let ex = 1 + (logE - 14) * 0.25; // baseline ~1e14 J
        return THREE.MathUtils.clamp(ex, 0.7, 4.8);
      },
      // Calcula radio visual final y devuelve todos los datos intermedios
      computeCrater({ masaKg, speedScene, planetRadius }) {
        const km_s_raw = this.mapSceneSpeedToKmS(speedScene);
        const km_s = THREE.MathUtils.clamp(km_s_raw, this.MIN_KM_S, this.MAX_KM_S);
        const v_m_s = km_s * 1000;
        const E = this.energyJ(masaKg, v_m_s);
        const D_t = this.transientDiameterMeters(E);
        const D_final = this.finalDiameterMeters(D_t);
        const rUnitsPhysical = this.diameterMetersToRadiusUnits(D_final);
        const ex = this.exaggerationFactor(E);
        let rVisual = rUnitsPhysical * ex;
        // Límite de visibilidad (mínimo y máximo coherente con el planeta)
        // Elevamos el mínimo para asegurar que los cráteres sean visibles en la cámara por defecto
        // planetRadius ~6.37 -> minVisible ~0.02..0.04 (20..40 km visual radio) dependiendo del planeta
        const minVisible = Math.max(planetRadius * 0.0025, 0.02);
        const maxVisible = planetRadius * 0.12;
        rVisual = THREE.MathUtils.clamp(rVisual, minVisible, maxVisible);
        return {
          km_s, v_m_s, energyJ: E, D_t, D_final,
          radiusUnitsPhysical: rUnitsPhysical,
          exaggeration: ex,
          radiusFinal: rVisual,
          minVisible, maxVisible,
          logE: Math.log10(Math.max(E,1))
        };
      }
    };

  // Calcular predicción del cráter ahora que `craterCalculator` está inicializado
  const previewSpeedScene = ((Number(params.velocidad) || 20) / 100) * 1.8 + 0.2;
  const previewCrater = craterCalculator.computeCrater({ masaKg: Number(params.masa || 1000), speedScene: previewSpeedScene, planetRadius });

  // Cargar la API de NEO de la NASA al montar
  useEffect(() => {
    let mounted = true;
    const API_KEY = '4XTNhkIbujuES0LnRkxyO5v5HI96OqklU3ELcEDB';
    const feedUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${API_KEY}`;
    async function load() {
      setNeosLoading(true);
      setNeosError(null);
      try {
        const res = await fetch(feedUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // data.near_earth_objects es un objeto por fecha; aplastamos a array
        const neosArray = [];
        Object.values(data.near_earth_objects || {}).forEach(dayList => {
          dayList.forEach(item => neosArray.push(item));
        });
        if (mounted) setNeos(neosArray);
      } catch (err) {
        console.error('[simulacion] failed to load NEOs', err);
        if (mounted) setNeosError(err.message || String(err));
      } finally {
        if (mounted) setNeosLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  // Funciones para filtrar y cargar diferentes tipos de datos
  const loadHistoricalEvents = useCallback(() => {
    setNeoFilter('historical');
    // Convertir eventos históricos al formato NEO
    const historicalAsNeos = HISTORICAL_EVENTS.map((event, idx) => ({
      id: `hist-${idx}`,
      name: event.name,
      estimated_diameter: {
        meters: {
          estimated_diameter_max: event.diameter,
          estimated_diameter_min: event.diameter * 0.8
        }
      },
      close_approach_data: [{
        relative_velocity: {
          kilometers_per_second: event.velocity.toString(),
          kilometers_per_hour: (event.velocity * 3600).toString()
        },
        miss_distance: {
          kilometers: "0"
        },
        close_approach_date: "Histórico"
      }],
      is_potentially_hazardous_asteroid: true,
      _isHistorical: true,
      _casualties: event.casualties,
      _location: event.location
    }));
    setNeos(historicalAsNeos);
  }, []);

  const filterHazardous = useCallback(() => {
    setNeoFilter('hazardous');
    // Recargar NEOs pero filtrar solo peligrosos
    // Usar la última carga de NEOs reales
    setNeos(prev => prev.filter(n => n.is_potentially_hazardous_asteroid && !n._isHistorical));
  }, []);

  const showAllNeos = useCallback(() => {
    setNeoFilter('all');
    // Recargar datos NEO
    const API_KEY = '4XTNhkIbujuES0LnRkxyO5v5HI96OqklU3ELcEDB';
    const feedUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${API_KEY}`;
    setNeosLoading(true);
    fetch(feedUrl)
      .then(res => res.json())
      .then(data => {
        const neosArray = [];
        Object.values(data.near_earth_objects || {}).forEach(dayList => {
          dayList.forEach(item => neosArray.push(item));
        });
        setNeos(neosArray);
      })
      .catch(err => setNeosError(err.message))
      .finally(() => setNeosLoading(false));
  }, []);

  const handleEarthPointerDown = useCallback((event) => {
    if (!awaitingTarget) return; // Si no estamos esperando un clic, permitir que OrbitControls maneje el evento
    
    // Detener propagación para evitar que OrbitControls interfiera durante el spawn
    event.stopPropagation();
    
    // event.point es el punto exacto en la superficie donde se hace click
    const point = event.point.clone();
    const { camera } = event;
    // Dirección desde cámara hacia el punto
    const dirCamToPoint = new THREE.Vector3().subVectors(point, camera.position).normalize();
    // Posición inicial: un poco detrás de la cámara en la misma línea (para que se vea venir)
    const start = camera.position.clone().add(dirCamToPoint.clone().multiplyScalar(2.5));
    // Aseguramos que el start esté fuera de la esfera terrestre con un margen mínimo
    if (start.length() < planetRadius + 0.2) {
      start.copy(dirCamToPoint.clone().multiplyScalar(planetRadius * 3));
    }
  console.log('[simulacion] spawn asteroid', { start: start.toArray(), target: point.toArray() });
  // Escalado de velocidad: convertimos el valor (1-100) a una velocidad en unidades/segundo.
  // Queremos algo claramente más lento: por ejemplo máx ~2 u/s y mín ~0.2 u/s
  const raw = Number(params.velocidad) || 20; // 1..100
  const speedM = (raw / 100) * 1.8 + 0.2; // rango 0.2 .. 2.0 aprox
    const id = idRef.current++;
  // Determinar color visible del asteroide según su tipo
  let asteroidColor = '#8b6d4b';
  if (params.tipo === 'Hierro') asteroidColor = '#b6bcc7';
  else if (params.tipo === 'Mixto') asteroidColor = '#a8865a';
  setAsteroids(a => [...a, { id, start, target: point, speed: speedM, tipo: params.tipo, masa: Number(params.masa), densidad: Number(params.densidad), angulo: Number(params.angulo), color: asteroidColor }]);
    setAwaitingTarget(false);
  }, [awaitingTarget, params.velocidad]);

  const handleAsteroidHit = (target, data) => {
    console.log('Impact at', target, data);
    
    // === CÁLCULO CRÁTER USANDO craterCalculator (ver objeto documentado arriba) ===
    const masa = data?.masa || 1000; // kg
    const speedScene = data?.speed || 1; // velocidad interna (0.2..2.0 u/s)
    const craterData = craterCalculator.computeCrater({ masaKg: masa, speedScene, planetRadius });
    const { energyJ, radiusFinal: radius, v_m_s, km_s, D_t: D_t_m, D_final: finalDiameter_m, radiusUnitsPhysical: radiusUnits } = craterData;
    
    console.log('[simulacion] crater radiusFinal (units):', craterData.radiusFinal, 'min/max', craterData.minVisible, craterData.maxVisible);
    console.log('[simulacion] crater calc', {
      ...craterData,
      masa,
      diameter_km: (finalDiameter_m/1000).toFixed(2)
    });

    // === CONVERTIR POSICIÓN 3D A LAT/LON PARA ANÁLISIS NASA ===
    // La posición target está en coordenadas 3D; convertir a latitud/longitud
    const normalized = target.clone().sub(new THREE.Vector3(0, planetOffsetY, 0)).normalize();
    const lat = (Math.asin(normalized.y) * 180) / Math.PI;
    const lng = (Math.atan2(normalized.x, normalized.z) * 180) / Math.PI;
    
    console.log('[simulacion] Impact coordinates:', { lat: lat.toFixed(2), lng: lng.toFixed(2) });

    // === ANÁLISIS COMPLETO DE IMPACTO (SISTEMA NASA) ===
    const fullAnalysis = calculateFullImpact({
      diameter: finalDiameter_m, // diámetro del cráter en metros
      velocity: km_s, // velocidad en km/s
      density: data?.densidad || 2500, // densidad del asteroide
      lat,
      lng
    });
    
    console.log('[simulacion] Full Impact Analysis:', fullAnalysis);
    setFullImpactAnalysis(fullAnalysis);
    
    // Usar la posición exacta enviada por el asteroide (impacto real)
    let finalPos = target.clone();
    // Convertir la posición de mundo a coordenadas locales del mesh de la Tierra
    // para evitar desplazamientos por offset/rotación
    try {
      if (earthRef && earthRef.current && earthRef.current.worldToLocal) {
        const local = earthRef.current.worldToLocal(finalPos.clone());
        // Ahora reconstruimos la posición final a partir de las coordenadas locales
        finalPos = earthRef.current.localToWorld(local.clone());
      }
    } catch (err) {
      console.warn('[simulacion] world/local conversion failed:', err);
    }
    // Si la posición está demasiado lejos del radio esperado, proyectamos al radio para evitar errores
    // (note: planetRadius/planetOffsetY defined in parent scope)
    const rel = finalPos.clone().sub(new THREE.Vector3(0, planetOffsetY, 0));
    if (rel.length() > planetRadius + 0.02) {
      // fallback: proyectar al radio del planeta manteniendo el centro desplazado
      const centered = rel.clone().normalize().multiplyScalar(planetRadius);
      finalPos = centered.add(new THREE.Vector3(0, planetOffsetY, 0));
    } else {
      // Asegurar que finalPos esté exactamente a la distancia del radio (evita pequeñas desviaciones)
      const norm = rel.length();
      if (Math.abs(norm - planetRadius) > 1e-4) {
        finalPos = rel.clone().normalize().multiplyScalar(planetRadius).add(new THREE.Vector3(0, planetOffsetY, 0));
      }
    }
    // Elegir color del cráter según el tipo del asteroide
    let colorScheme = 'rojo';
    const t = data?.tipo || params.tipo || 'Roca';
    if (t === 'Hierro') colorScheme = 'gris';
    else if (t === 'Mixto') colorScheme = 'amarillo';
    
    // Guardamos también todos los datos físicos calculados para poder usarlos en la visualización (p.ej. tooltips)
    const crater = { 
      id: Date.now(), 
      position: finalPos, 
      radius, 
      depth: radius * 0.25, 
      colorScheme, 
      data: { craterData, masa, speedScene, fullAnalysis, lat, lng } 
    };
    setCraters(c => [...c, crater]);
    setAsteroids([]);
    setFreezeRotation(true); // detener rotación de la Tierra
    
    // Debug helper: si está activo, añadir un marcador temporal en la escena para ver el punto de impacto
    if (showHelpers) {
      const markerId = `m-${Date.now()}`;
      const marker = { id: markerId, position: finalPos.clone(), ttl: Date.now() + 3000 };
      // guardamos como un cráter temporal usando radius muy pequeño pero distinto color
      setCraters(c => [...c, { id: markerId, position: finalPos.clone(), radius: Math.max(radius*0.3, 0.01), depth: 0, colorScheme: 'amarillo', _temporary: true, data: { isMarker:true } }]);
      // limpiamos el marcador después de 3s
      setTimeout(() => {
        setCraters(c => c.filter(x => x.id !== markerId));
      }, 3000);
    }
    
    // Preparar datos legacy para el HUD (compatibilidad)
    const kilotons = fullAnalysis.energy.kilotons;
    const total = fullAnalysis.radii.total;
    const moderate = fullAnalysis.radii.moderate;
    const light = fullAnalysis.radii.light;
    
    setLastImpact({ 
      position: target.clone(), 
      data, 
      stats: { kilotons, total, moderate, light },
      fullAnalysis,
      lat,
      lng
    });
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Background />
      </div>
      <Header />

      {/* Panel lateral */}
      <aside style={{ position: 'absolute', left: 16, top: 96, width: 320, zIndex: 40, background: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.25)', maxHeight: '70vh', overflowY: 'auto' }}>
        <h3 className="text-lg font-semibold mb-4">Configurar Asteroide</h3>

        {/* --- NEO Catalog --- */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>
            🎯 Catálogo NEO (NASA)
          </div>
          
          {/* Botones de filtro */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            <button 
              onClick={showAllNeos}
              style={{ 
                fontSize: '0.7rem', 
                padding: '4px 8px', 
                borderRadius: 4, 
                background: neoFilter === 'all' ? '#667eea' : '#ddd', 
                color: neoFilter === 'all' ? '#fff' : '#333',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📡 Todos (7d)
            </button>
            <button 
              onClick={filterHazardous}
              style={{ 
                fontSize: '0.7rem', 
                padding: '4px 8px', 
                borderRadius: 4, 
                background: neoFilter === 'hazardous' ? '#ff6b6b' : '#ddd', 
                color: neoFilter === 'hazardous' ? '#fff' : '#333',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ⚠️ Peligrosos
            </button>
            <button 
              onClick={loadHistoricalEvents}
              style={{ 
                fontSize: '0.7rem', 
                padding: '4px 8px', 
                borderRadius: 4, 
                background: neoFilter === 'historical' ? '#feca57' : '#ddd', 
                color: neoFilter === 'historical' ? '#333' : '#333',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📜 Históricos
            </button>
          </div>

          {neosLoading && <div style={{ fontSize: '0.85rem', color: '#666' }}>Cargando NEOs...</div>}
          {neosError && <div style={{ fontSize: '0.85rem', color: 'crimson' }}>Error: {neosError}</div>}
          {!neosLoading && !neosError && neos && neos.length > 0 && (
            <div style={{ maxHeight: 140, overflowY: 'auto', padding: 6, borderRadius: 6, background: 'rgba(0,0,0,0.03)' }}>
              {neos.slice(0,8).map((n, i) => {
                const estDia = n.estimated_diameter?.meters?.estimated_diameter_max || n.estimated_diameter?.meters?.estimated_diameter_min || 50;
                const velo = n.close_approach_data && n.close_approach_data[0] ? Number(n.close_approach_data[0].relative_velocity.kilometers_per_second) : 20;
                const isHazardous = n.is_potentially_hazardous_asteroid;
                const isHistorical = n._isHistorical;
                
                return (
                  <div 
                    key={n.id || i} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '6px 4px', 
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      borderLeft: isHazardous ? '3px solid #ff6b6b' : '3px solid transparent',
                      background: isHistorical ? 'rgba(254, 202, 87, 0.1)' : 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', flex: 1 }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isHazardous && <span>⚠️</span>}
                        {isHistorical && <span>📜</span>}
                        <span style={{ fontSize: '0.8rem' }}>{n.name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {(estDia).toFixed(0)} m • {velo.toFixed(1)} km/s
                        {n.close_approach_data && n.close_approach_data[0] && (
                          <> • {n.close_approach_data[0].close_approach_date}</>
                        )}
                      </div>
                      {isHistorical && n._casualties && (
                        <div style={{ fontSize: '0.7rem', color: '#e67e22', marginTop: 2 }}>
                          {n._casualties}
                        </div>
                      )}
                    </div>
                    <div>
                      <button onClick={() => {
                        // Map diameter -> masa (volumen de esfera * densidad aproximada)
                        const diameter = estDia;
                        const asumDens = 3000; // kg/m3 as default
                        const volumen = (4/3) * Math.PI * Math.pow(diameter/2, 3);
                        const masaEst = Math.round(volumen * asumDens);
                        // Map velocidad km/s -> slider 1..100 (approx)
                        const kmps = velo; // we computed km/s
                        const velocidadSlider = Math.min(100, Math.max(1, Math.round((kmps / 70) * 100)));
                        setParams(p => ({ ...p, masa: masaEst, velocidad: velocidadSlider, densidad: asumDens, tipo: 'Mixto' }));
                      }} style={{ padding: '6px 8px', borderRadius: 6, background: '#222', color: '#fff', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}>Usar</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Predicción del cráter con parámetros actuales */}
        <div style={{ marginBottom: 12, padding: 8, borderRadius: 8, background: 'rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>Predicción del cráter</div>
          <div style={{ fontSize: '0.85rem', color: '#333' }}>Diámetro físico: <strong>{(previewCrater.D_final/1000).toFixed(2)}</strong> km</div>
          <div style={{ fontSize: '0.85rem', color: '#333' }}>Energía: <strong>{(previewCrater.energyJ / (4.184e12)).toFixed(2)}</strong> kt</div>
          <div style={{ fontSize: '0.85rem', color: '#333' }}>Radio visual (escena): <strong>{previewCrater.radiusFinal.toFixed(3)}</strong> u</div>
        </div>

        <label className="block mb-2">Tipo</label>
        <select name="tipo" value={params.tipo} onChange={handleChange} className="w-full mb-3 p-2 border rounded">
          <option>Roca</option>
          <option>Hierro</option>
          <option>Mixto</option>
        </select>

        <label className="block mb-2">Masa (kg)</label>
        <input name="masa" type="number" value={params.masa} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />

        <label className="block mb-1">Velocidad (relativa 1-100)</label>
        <input name="velocidad" type="range" min="1" max="100" value={params.velocidad} onChange={handleChange} className="w-full mb-1" />
        <div className="flex items-center gap-2 mb-2">
          <input name="velocidad" type="number" min="1" max="100" value={params.velocidad} onChange={handleChange} className="w-24 p-2 border rounded" />
          <span style={{fontSize:'0.75rem', color:'#555'}}>Vel. interna (u/s aprox): {(((Number(params.velocidad)||20)/100)*1.8+0.2).toFixed(2)}</span>
        </div>

        <label className="block mb-2">Densidad (kg/m³)</label>
        <input name="densidad" type="number" value={params.densidad} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />

        <label className="block mb-2">Ángulo (°)</label>
        <input name="angulo" type="number" value={params.angulo} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input id="helpers" type="checkbox" checked={showHelpers} onChange={(e) => setShowHelpers(e.target.checked)} />
          <label htmlFor="helpers">Mostrar helpers (debug)</label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSimulate} style={{ flex: 1, padding: '10px 12px', background: '#111', color: '#fff', borderRadius: 8 }}>
            Simular impacto
          </button>
          <button onClick={() => { setCraters([]); setLastImpact(null); }} style={{ padding: '10px 12px', background: '#eee', color: '#000', borderRadius: 8, border: '1px solid #ddd' }}>
            Borrar cráteres
          </button>
        </div>
      </aside>

      {/* Prompt overlay when awaiting click */}
      {awaitingTarget && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '40%', display: 'flex', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ marginBottom: 8 }}>Haz clic en cualquier punto del planeta para lanzar el asteroide</div>
            <button onClick={() => setAwaitingTarget(false)} style={{ padding: '6px 10px', borderRadius: 6, background: '#fff', color: '#000' }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <Canvas camera={{ position: [0, 1.2, 6], fov: 60 }}>
          <Earth3D earthRef={earthRef} onPointerDown={handleEarthPointerDown} paused={freezeRotation} craters={craters} planetRadius={planetRadius} planetOffsetY={planetOffsetY} />

          {asteroids.map(a => (
            <Asteroid
              key={a.id}
              start={a.start}
              target={a.target}
              speed={a.speed}
              tipo={a.tipo}
              masa={a.masa}
              densidad={a.densidad}
              angulo={a.angulo}
              onHit={handleAsteroidHit}
              debug={showHelpers}
            />
          ))}
        </Canvas>
      </div>
      {freezeRotation && (
        <div style={{ position: 'absolute', top: 110, right: 20, zIndex: 40 }}>
          <button
            onClick={() => setFreezeRotation(false)}
            style={{
              padding: '8px 14px',
              background: 'white',
              color: '#000',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Reanudar rotación
          </button>
        </div>
      )}
      {/* HUD informativo del último impacto */}
      {lastImpact && lastImpact.stats && (
        <div style={{ position: 'absolute', right: 20, bottom: 20, zIndex: 60, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: 12, borderRadius: 10, width: 260 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Último impacto: {lastImpact.data?.tipo || '—'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <div>Energía</div>
            <div style={{ fontWeight: 700 }}>{lastImpact.stats.kilotons.toFixed(2)} kt</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255,107,107,0.08)', padding: 6, borderRadius: 6 }}>
              <div style={{ fontSize: '0.75rem' }}>Destrucción</div>
              <div style={{ fontWeight: 700 }}>{lastImpact.stats.total.toFixed(2)} km</div>
            </div>
            <div style={{ background: 'rgba(255,193,7,0.06)', padding: 6, borderRadius: 6 }}>
              <div style={{ fontSize: '0.75rem' }}>Moderado</div>
              <div style={{ fontWeight: 700 }}>{lastImpact.stats.moderate.toFixed(2)} km</div>
            </div>
            <div style={{ background: 'rgba(76,175,80,0.06)', padding: 6, borderRadius: 6 }}>
              <div style={{ fontSize: '0.75rem' }}>Leve</div>
              <div style={{ fontWeight: 700 }}>{lastImpact.stats.light.toFixed(2)} km</div>
            </div>
            <div style={{ padding: 6, borderRadius: 6 }}>
              <button onClick={() => { setCraters([]); setLastImpact(null); setFreezeRotation(false); }} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: 'none', background: '#111', color: '#fff' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Consecuencias Detalladas (NASA IMPACTUS) */}
      <ImpactConsequences 
        impact={fullImpactAnalysis} 
        show={!!fullImpactAnalysis && freezeRotation}
      />
    </div>
  );
};

export default Simulacion;