import { Canvas } from "@react-three/fiber";
import Earth from "./Earth";
import Background from "./Background";
import Header from "./Header";
import Footer from "./Footer";
import { useState, useRef } from "react";
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

  const onCanvasClick = (event) => {
    if (!awaitingTarget) return; // only act if we're waiting for the target click

    // event is react-three-fiber pointer event
    const { clientX, clientY } = event;
    const rect = event.target.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      // Prefer the ray provided by react-three-fiber pointer events.
      // Some events don't include `camera` but do include `ray`, so use it when present.
      const earthMesh = earthRef.current;
      if (!earthMesh) return;

      let intersects = [];
      if (event.ray) {
        // event.ray has origin & direction (THREE.Ray)
        const r = event.ray;
        const raycaster = new THREE.Raycaster(r.origin, r.direction);
        intersects = raycaster.intersectObject(earthMesh, true);
      } else {
        // Fallback: compute from pointer screen coords and event.camera if available
        const { clientX, clientY } = event;
        // defensive: event.target may not be the canvas DOM element
        const dom = event.target && event.target.getBoundingClientRect ? event.target : document.querySelector('canvas');
        if (!dom) return;
        const rect = dom.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        const camera = event.camera;
        if (!camera) return; // cannot proceed without a camera
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        intersects = raycaster.intersectObject(earthMesh, true);
      }

    // start position: from direction opposite of impact point, at distance 8
    const dir = point.clone().normalize();
    const start = dir.clone().multiplyScalar(8);

    const speedM = Number(params.velocidad) || 20;

    const id = idRef.current++;
    setAsteroids((a) => [...a, { id, start, target: point, speed: speedM }]);

    // exit awaiting mode
    setAwaitingTarget(false);
  };

  const handleAsteroidHit = (target) => {
    console.log('Impact at', target);
    setAsteroids([]);
    // TODO: add visual explosion or effect
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

        <label className="block mb-2">Velocidad (km/s)</label>
        <input name="velocidad" type="number" value={params.velocidad} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />

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
        <Canvas camera={{ position: [0, 0.8, 6], fov: 60 }} onPointerDown={onCanvasClick}>
          <Earth earthRef={earthRef} />

          {asteroids.map(a => (
            <Asteroid key={a.id} start={a.start} target={a.target} speed={a.speed} onHit={handleAsteroidHit} debug={showHelpers} />
          ))}
        </Canvas>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)' }}>
        <Footer />
      </div>
    </div>
  );
};

export default Simulacion;