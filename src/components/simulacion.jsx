import { Canvas, useThree } from "@react-three/fiber";
import Earth from "./Earth";
import Background from "./Background";
import Header from "./Header";
import Footer from "./Footer";
import { useState, useRef, useCallback, useEffect } from "react";
import Asteroid from "./Asteroid";
import * as THREE from 'three';

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
  const [asteroids, setAsteroids] = useState([]);
  const [awaitingTarget, setAwaitingTarget] = useState(false);
  const earthRef = useRef();
  const idRef = useRef(0);
  const [neos, setNeos] = useState([]);
  const [neosLoading, setNeosLoading] = useState(false);
  const [neosError, setNeosError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

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

  const handleEarthPointerDown = useCallback((event) => {
    if (!awaitingTarget) return;
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
    // Guardamos la posición en coordenadas del mundo
    setLastImpact({ position: target.clone(), data });
  // Crear cráter: estimación basada en energía cinética y escala física
  const masa = data?.masa || 1000; // kg
  const speedScene = data?.speed || 1; // velocidad en unidades de escena (0.2..2.0 aprox)
  // Mapear speedScene a una velocidad realista en km/s (ej. 11..70 km/s)
  const minKmS = 11;
  const maxKmS = 70;
  const km_s = minKmS + ((speedScene - 0.2) / 1.8) * (maxKmS - minKmS);
  const clamped_km_s = Math.max(minKmS, Math.min(maxKmS, km_s));
  const v_m_s = clamped_km_s * 1000; // m/s
  // Energía cinética (J)
  const energyJ = 0.5 * masa * Math.pow(v_m_s, 2);
  // Estimación empírica del diámetro del cráter (transient) en metros
  // usamos una ley de potencia: D_t (m) ~= C * E^(1/3.4). C elegido para producir diámetros razonables.
  const craterCoeff = 0.032;
  const D_t_m = craterCoeff * Math.pow(energyJ, 1 / 3.4);
  const finalDiameter_m = D_t_m * 1.3; // factor para pasar a diámetro final aproximado
  // Convertir diámetro (m) a unidades de escena (1 unidad = KM_PER_UNIT km)
  const diameter_km = finalDiameter_m / 1000.0;
  const radiusUnits = (diameter_km / KM_PER_UNIT) / 2.0;
  // Ajustes visuales: aumentar el mínimo visible y aplicar un factor para cráteres pequeños
  // Escalado visual ajustado: los cráteres físicamente correctos (metros) se vuelven invisibles
  // a la escala planeta (~6.371 u). Exageramos para fines educativos.
  const visualScaleFactor = 10.0; // antes 1.6 -> multiplicamos para hacerlos claramente visibles
  const minRadiusUnits = Math.max(planetRadius * 0.005, 0.03); // antes 0.0004*R -> ahora ~0.5% del radio o 0.03 u (~30 km)
  const maxRadiusUnits = planetRadius * 0.28; // permitir cráteres grandes (antes 0.18)
  const radiusRaw = Math.max(minRadiusUnits, Math.min(maxRadiusUnits, radiusUnits));
  const radius = radiusRaw * visualScaleFactor;
  console.log('[simulacion] crater sizing', {
    masa, v_m_s, energyJ: Math.round(energyJ), D_t_m: Math.round(D_t_m), finalDiameter_m: Math.round(finalDiameter_m),
    diameter_km: diameter_km.toFixed(2), radiusUnitsRaw: radiusUnits.toExponential(3),
    radiusClamped: radiusRaw.toFixed(5), radiusVisual: radius.toFixed(5)
  });
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
  const crater = { id: Date.now(), position: finalPos, radius, depth: radius * 0.25, colorScheme };
    setCraters(c => [...c, crater]);
    setAsteroids([]);
    setFreezeRotation(true); // detener rotación de la Tierra
    // Debug helper: si está activo, añadir un marcador temporal en la escena para ver el punto de impacto
    if (showHelpers) {
      const markerId = `m-${Date.now()}`;
      const marker = { id: markerId, position: finalPos.clone(), ttl: Date.now() + 3000 };
      // guardamos como un cráter temporal usando radius muy pequeño pero distinto color
      setCraters(c => [...c, { id: markerId, position: finalPos.clone(), radius: Math.max(radius*0.3, 0.01), depth: 0, colorScheme: 'amarillo', _temporary: true }]);
      // limpiamos el marcador después de 3s
      setTimeout(() => {
        setCraters(c => c.filter(x => x.id !== markerId));
      }, 3000);
    }
    // Calcular energía y radios (para HUD informativo)
  // Reusar energyJ de arriba (calculado con masa y velocidad reales)
  // Si por alguna razón no existe, recálculamos
  const masaForCalc = data?.masa || 1000; // kg
  const velocidadForCalc = clamped_km_s * 1000; // m/s usado arriba
  const energyJ_forHUD = typeof energyJ !== 'undefined' ? energyJ : 0.5 * masaForCalc * Math.pow(velocidadForCalc, 2);
  const kilotons = energyJ_forHUD / (4.184 * Math.pow(10, 12));
    // radios simplificados (km)
    const total = Math.pow(kilotons, 0.33) * 0.5;
    const moderate = Math.pow(kilotons, 0.33) * 1.5;
    const light = Math.pow(kilotons, 0.33) * 3;
    setLastImpact({ position: target.clone(), data, stats: { kilotons, total, moderate, light } });
    // TODO futuro: animación de explosión temporal
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Background />
      </div>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }}>
        <Header />
      </div>

      {/* Panel lateral */}
      <aside style={{ position: 'absolute', left: 16, top: 96, width: 320, zIndex: 40, background: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.25)', maxHeight: '70vh', overflowY: 'auto' }}>
        <h3 className="text-lg font-semibold mb-4">Configurar Asteroide</h3>

        {/* --- NEO Catalog --- */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>Catálogo NEO (NASA)</div>
          {neosLoading && <div style={{ fontSize: '0.85rem', color: '#666' }}>Cargando NEOs...</div>}
          {neosError && <div style={{ fontSize: '0.85rem', color: 'crimson' }}>Error: {neosError}</div>}
          {!neosLoading && !neosError && neos && neos.length > 0 && (
            <div style={{ maxHeight: 140, overflowY: 'auto', padding: 6, borderRadius: 6, background: 'rgba(0,0,0,0.03)' }}>
              {neos.slice(0,8).map((n, i) => {
                const estDia = n.estimated_diameter?.meters?.estimated_diameter_max || n.estimated_diameter?.meters?.estimated_diameter_min || 50;
                const velo = n.close_approach_data && n.close_approach_data[0] ? Number(n.close_approach_data[0].relative_velocity.kilometers_per_hour) / 1000 : 20;
                return (
                  <div key={n.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700 }}>{n.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{(estDia).toFixed(0)} m • {velo.toFixed(1)} km/s</div>
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
                        const velocidadSlider = Math.min(100, Math.max(1, Math.round((kmps / 25) * 100)));
                        setParams(p => ({ ...p, masa: masaEst, velocidad: velocidadSlider, densidad: asumDens, tipo: 'Mixto' }));
                      }} style={{ padding: '6px 8px', borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}>Usar</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
          <Earth earthRef={earthRef} onPointerDown={handleEarthPointerDown} paused={freezeRotation} craters={craters} planetRadius={planetRadius} planetOffsetY={planetOffsetY} />

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
    </div>
  );
};

export default Simulacion;