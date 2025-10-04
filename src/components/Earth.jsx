import { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import earthTexture from '../assets/earth.jpg';
import Crater from './Crater';

// craters: array de { id, position: THREE.Vector3, radius, depth }
export default function Earth({ earthRef, onPointerDown, paused=false, craters=[] }) {
  const mesh = earthRef || useRef();

  useFrame((_, delta) => {
    if (paused) return;
    if (mesh.current) mesh.current.rotation.y += 0.08 * delta;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <mesh ref={mesh} position={[0, -0.4, 0]} rotation={[0, 0, 0]} onPointerDown={onPointerDown}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={useLoader(TextureLoader, earthTexture)} />
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
          return <Crater key={c.id} localPosition={localPos} radius={c.radius} depth={c.depth} colorScheme={c.colorScheme || 'rojo'} planetRadius={2} />
        })}
      </mesh>
      <OrbitControls enableZoom={true} />
      <Stars />
    </>
  );
}