import { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import earthTexture from '../assets/earth.jpg';
import Crater from './Crater';

// craters: array de { id, position: THREE.Vector3, radius, depth }
export default function Earth({ earthRef, onPointerDown, paused=false, craters=[], planetRadius=2, planetOffsetY=-0.4 }) {
  const mesh = earthRef || useRef();

  useFrame((_, delta) => {
    if (paused) return;
    if (mesh.current) mesh.current.rotation.y += 0.08 * delta;
  });

  return (
    <>
  {/* Luz ambiental más fuerte para aclarar la escena */}
  <ambientLight intensity={0.9} />
  {/* Luz hemisférica para simular cielo/terreno (suaviza sombras) */}
  <hemisphereLight skyColor={0x88cfff} groundColor={0x553322} intensity={0.25} />
  {/* Luz direccional tipo 'sol' para modelado de la iluminación */}
  <directionalLight position={[5, 3, 5]} intensity={0.9} />
  {/* Luz puntual suave para acentuar iluminación lateral */}
  <pointLight position={[10, 10, 10]} intensity={0.6} />
      <mesh ref={mesh} position={[0, planetOffsetY, 0]} rotation={[0, 0, 0]} onPointerDown={onPointerDown}>
        <sphereGeometry args={[planetRadius, 64, 64]} />
        <meshStandardMaterial
          map={useLoader(TextureLoader, earthTexture)}
          metalness={0.03}
          roughness={0.82}
        />
        {/* Cráteres incrustados: se posicionan como decals simples (anillos y discos) */}
        {craters.map(c => {
          // Convertir la posición del cráter (world) a coordenadas locales del mesh
          let localPos = c.position;
          try {
            if (mesh && mesh.current && mesh.current.worldToLocal) {
              localPos = mesh.current.worldToLocal(c.position.clone());
            }
          } catch (err) {
            // si falla, mantener la posición tal cual (fallback)
            // console.warn('[Earth] worldToLocal failed', err)
          }
          return <Crater key={c.id} localPosition={localPos} radius={c.radius} depth={c.depth} colorScheme={c.colorScheme || 'rojo'} planetRadius={planetRadius} planetOffsetY={planetOffsetY} />
        })}
      </mesh>
      <OrbitControls enableZoom={true} />
      <Stars />
    </>
  );
}