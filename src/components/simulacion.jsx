import { Canvas, useThree } from "@react-three/fiber";
import Earth from "./Earth";
import Background from "./Background";
import Header from "./Header";
import Footer from "./Footer";
import { useState, useRef, useCallback } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

  const handleSimulate = () => {
    // Enter "awaiting click" mode: user must click on the planet to choose impact point
    setAwaitingTarget(true);
    // Optionally show a brief instruction (overlay handled below)
  };

  const handleEarthPointerDown = useCallback((event) => {
    if (!awaitingTarget) return;
    // event.point es el punto exacto en la superficie donde se hace click
    const point = event.point.clone();
    const { camera } = event;
    // Dirección desde cámara hacia el punto
    const dirCamToPoint = new THREE.Vector3().subVectors(point, camera.position).normalize();
    // Posición inicial: un poco detrás de la cámara en la misma línea (para que se vea venir)
    const start = camera.position.clone().add(dirCamToPoint.clone().multiplyScalar(2.5));
    // Aseguramos que el start esté fuera de la esfera terrestre (radio=2) con un mínimo
    if (start.length() < 2.2) {
      start.copy(dirCamToPoint.clone().multiplyScalar(6));
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
    // Crear cráter: escalado simple basado en masa y velocidad
    const masa = data?.masa || 1000;
    const vel = data?.speed || 1;
    // Radio base: masa^(1/6) * factor velocidad
    const radius = Math.min(0.9, Math.max(0.12, Math.cbrt(Math.sqrt(masa)) * 0.02 * (0.6 + vel)));
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
    const planetRadius = 2;
    const planetOffsetY = -0.4;
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

        <button onClick={handleSimulate} style={{ width: '100%', padding: '10px 12px', background: '#111', color: '#fff', borderRadius: 8 }}>
          Simular impacto
        </button>
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
          <Earth earthRef={earthRef} onPointerDown={handleEarthPointerDown} paused={freezeRotation} craters={craters} />

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
    </div>
  );
};

export default Simulacion;