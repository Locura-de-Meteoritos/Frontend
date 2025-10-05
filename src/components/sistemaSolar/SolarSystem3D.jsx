import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Planets from './Planets';
import Asteroids, { AsteroidBelt } from './Asteroids';
import AsteroidInfo from './AsteroidInfo';
import { getWeekAsteroids, processAsteroidsForRender } from '../../services/nasaAPI';
import solMap from '../../assets/sol.jpg';

function Sun() {
  const sunTex = useLoader(THREE.TextureLoader, solMap);
  return (
    <group name="SolGroup">
      <mesh name="Sol">
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial 
          map={sunTex} 
          emissive={new THREE.Color(0xffb347)} 
          emissiveIntensity={1.5} 
          metalness={0} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Brillo exterior del sol */}
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial 
          color={'#ffaa33'} 
          transparent 
          opacity={0.2} 
        />
      </mesh>
    </group>
  );
}

const SolarSystemScene = ({ asteroids }) => {
  const earthRef = useRef();

  return (
    <Canvas camera={{ position: [0, 15, 25], fov: 65 }}>
      {/* Luz ambiente más intensa para iluminar todo el sistema */}
      <ambientLight intensity={0.8} />
      
      {/* Luz del Sol desde el centro */}
      <pointLight color={'#ffdba3'} intensity={2.5} position={[0, 0, 0]} />
      
      {/* Luces adicionales para iluminar mejor los planetas */}
      <pointLight color={'#ffffff'} intensity={0.6} position={[30, 30, 30]} />
      <pointLight color={'#ffffff'} intensity={0.4} position={[-30, -30, -30]} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

      <group name="SistemaSolar">
        <Sun />
        <Planets earthRef={earthRef} />
        
        {/* Cinturón de asteroides decorativo (entre Marte y Júpiter) */}
        <AsteroidBelt count={150} innerRadius={8.5} outerRadius={10.5} />
        
        {/* Asteroides reales de NASA */}
        {asteroids.length > 0 && <Asteroids asteroids={asteroids} />}
      </group>

      <OrbitControls enablePan={false} enableZoom={true} />
    </Canvas>
  );
};

const SolarSystem3D = ({ className = 'w-full h-[600px]' }) => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchAsteroids = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener asteroides de la última semana
        const data = await getWeekAsteroids();
        const processedAsteroids = processAsteroidsForRender(data);
        
        // Detectar si estamos usando datos de ejemplo
        const isMock = processedAsteroids.some(a => a.id.startsWith('mock_'));
        setUsingMockData(isMock);
        
        console.log(`✅ Cargados ${processedAsteroids.length} asteroides ${isMock ? '(datos de ejemplo)' : 'de NASA'}`);
        setAsteroids(processedAsteroids);
      } catch (err) {
        console.error('Error cargando asteroides:', err);
        setError(err.message);
        // Continuar sin asteroides si falla
        setAsteroids([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroids();
  }, []);

  return (
    <div className={`${className} relative`}>
      {loading && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm z-10">
          🛰️ Cargando asteroides...
        </div>
      )}
      
      {error && !asteroids.length && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-200 px-3 py-2 rounded-lg text-sm backdrop-blur-sm z-10">
          ⚠️ Usando datos de ejemplo
        </div>
      )}
      
      {!loading && asteroids.length > 0 && (
        <>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`absolute top-4 right-4 px-4 py-2 rounded-lg text-sm backdrop-blur-sm z-10 transition-all border ${
              usingMockData 
                ? 'bg-yellow-500/30 hover:bg-yellow-500/50 text-white border-yellow-400/30'
                : 'bg-blue-500/30 hover:bg-blue-500/50 text-white border-blue-400/30'
            }`}
          >
            {showInfo ? '✕ Cerrar' : `${usingMockData ? '⚡' : '🌠'} ${asteroids.length} Asteroides`}
          </button>
          
          {showInfo && (
            <AsteroidInfo 
              asteroids={asteroids} 
              onClose={() => setShowInfo(false)}
              isMockData={usingMockData}
            />
          )}
        </>
      )}
      
      <SolarSystemScene asteroids={asteroids} />
    </div>
  );
};

export default SolarSystem3D;
