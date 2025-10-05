// ============================================================================
// EJEMPLOS DE USO - Earth3D Component
// ============================================================================

import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Earth3D from './components/Earth3D';

// ============================================================================
// EJEMPLO 1: Uso Básico con Modo Procedimental
// ============================================================================
export function BasicExample() {
  const earthRef = useRef();
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 300], fov: 45 }}>
        <Earth3D 
          earthRef={earthRef}
          planetRadius={100}
        />
      </Canvas>
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: Modo NASA con Texturas Reales
// ============================================================================
export function NASATexturesExample() {
  const earthRef = useRef();
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 300], fov: 45 }}>
        <Earth3D 
          earthRef={earthRef}
          planetRadius={100}
          useRealTextures={true} // ⭐ Activar texturas NASA
          showAtmosphere={true}
          showClouds={true}
        />
      </Canvas>
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Simulador de Impactos de Asteroides
// ============================================================================
export function AsteroidSimulatorExample() {
  const earthRef = useRef();
  const [impactPoint, setImpactPoint] = useState(null);
  const [craters, setCraters] = useState([]);
  
  const handleEarthClick = (event) => {
    if (!earthRef.current) return;
    
    // Obtener coordenadas geográficas del click
    const coords = earthRef.current.getLatLngFromEvent(event);
    
    if (coords) {
      console.log(`💥 Impacto en: ${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`);
      setImpactPoint(coords);
      
      // Agregar cráter
      setCraters(prev => [...prev, {
        lat: coords.lat,
        lng: coords.lng,
        size: Math.random() * 2 + 1,
        timestamp: Date.now()
      }]);
    }
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 300], fov: 45 }}>
        <Earth3D 
          earthRef={earthRef}
          planetRadius={100}
          onPointerDown={handleEarthClick}
          craters={craters}
        />
      </Canvas>
      
      {/* UI Overlay */}
      {impactPoint && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h3>Último Impacto</h3>
          <p>Latitud: {impactPoint.lat.toFixed(2)}°</p>
          <p>Longitud: {impactPoint.lng.toFixed(2)}°</p>
          <p>Total de cráteres: {craters.length}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Control de Visualización con UI
// ============================================================================
export function InteractiveControlsExample() {
  const earthRef = useRef();
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showClouds, setShowClouds] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [useNASA, setUseNASA] = useState(false);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 300], fov: 45 }}>
        <Earth3D 
          earthRef={earthRef}
          planetRadius={100}
          showAtmosphere={showAtmosphere}
          showClouds={showClouds}
          paused={isPaused}
          rotationSpeed={rotationSpeed}
          useRealTextures={useNASA}
        />
      </Canvas>
      
      {/* Panel de Control */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '250px'
      }}>
        <h3 style={{ marginTop: 0 }}>🌍 Controles</h3>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input 
            type="checkbox" 
            checked={showAtmosphere}
            onChange={(e) => setShowAtmosphere(e.target.checked)}
          />
          {' '}Mostrar Atmósfera
        </label>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input 
            type="checkbox" 
            checked={showClouds}
            onChange={(e) => setShowClouds(e.target.checked)}
          />
          {' '}Mostrar Nubes
        </label>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input 
            type="checkbox" 
            checked={isPaused}
            onChange={(e) => setIsPaused(e.target.checked)}
          />
          {' '}Pausar Rotación
        </label>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input 
            type="checkbox" 
            checked={useNASA}
            onChange={(e) => setUseNASA(e.target.checked)}
          />
          {' '}Texturas NASA
        </label>
        
        <hr style={{ margin: '15px 0' }} />
        
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Velocidad de Rotación:
        </label>
        <input 
          type="range" 
          min="0" 
          max="0.05" 
          step="0.001"
          value={rotationSpeed}
          onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <span style={{ fontSize: '12px', opacity: 0.7 }}>
          {rotationSpeed.toFixed(3)} rad/s
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Demo Educativa con Auto-Rotación
// ============================================================================
export function EducationalDemo() {
  const earthRef = useRef();
  const [info, setInfo] = useState({
    rotation: 0,
    time: 0
  });
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 400], fov: 45 }}>
        <Earth3D 
          earthRef={earthRef}
          planetRadius={150}
          rotationSpeed={0.02}
          enableAutoRotate={true}
          useRealTextures={true}
        />
      </Canvas>
      
      {/* Información Educativa */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>🌍 Planeta Tierra</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Radio:</strong> 6,371 km
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Inclinación Axial:</strong> 23.5°
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Período de Rotación:</strong> 24 horas
        </p>
        <p style={{ margin: '15px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
          Texturas cortesía de NASA Earth Observatory
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Comparación Lado a Lado (NASA vs Procedimental)
// ============================================================================
export function ComparisonExample() {
  const earthRefNASA = useRef();
  const earthRefProc = useRef();
  
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Lado Izquierdo: NASA */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 200], fov: 45 }}>
          <Earth3D 
            earthRef={earthRefNASA}
            planetRadius={80}
            useRealTextures={true}
          />
        </Canvas>
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: 0 }}>Modo NASA</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Texturas reales</p>
        </div>
      </div>
      
      {/* Lado Derecho: Procedimental */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 200], fov: 45 }}>
          <Earth3D 
            earthRef={earthRefProc}
            planetRadius={80}
            useRealTextures={false}
          />
        </Canvas>
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: 0 }}>Modo Procedimental</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Generado por código</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Integración con Estado Global
// ============================================================================
export function StateManagementExample() {
  const earthRef = useRef();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations] = useState([
    { name: 'Nueva York', lat: 40.7128, lng: -74.0060 },
    { name: 'Tokio', lat: 35.6762, lng: 139.6503 },
    { name: 'París', lat: 48.8566, lng: 2.3522 },
    { name: 'Sídney', lat: -33.8688, lng: 151.2093 },
    { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 }
  ]);
  
  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    console.log(`Navegando a: ${location.name} (${location.lat}, ${location.lng})`);
    // Aquí podrías animar la cámara hacia la ubicación
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 300], fov: 45 }}>
        <Earth3D 
          earthRef={earthRef}
          planetRadius={100}
        />
      </Canvas>
      
      {/* Lista de Ubicaciones */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '200px'
      }}>
        <h3 style={{ marginTop: 0 }}>📍 Ubicaciones</h3>
        {locations.map((loc, idx) => (
          <button
            key={idx}
            onClick={() => handleLocationClick(loc)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              marginBottom: '8px',
              background: selectedLocation?.name === loc.name 
                ? 'rgba(100,150,255,0.5)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {loc.name}
          </button>
        ))}
      </div>
      
      {/* Información de Ubicación Seleccionada */}
      {selectedLocation && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>{selectedLocation.name}</h4>
          <p style={{ margin: '3px 0' }}>Lat: {selectedLocation.lat}°</p>
          <p style={{ margin: '3px 0' }}>Lng: {selectedLocation.lng}°</p>
        </div>
      )}
    </div>
  );
}
