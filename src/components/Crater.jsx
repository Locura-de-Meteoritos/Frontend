import * as THREE from 'three'
import React from 'react'

/*
  Componente Crater
  Props:
    position: THREE.Vector3 (dirección desde el centro de la Tierra al impacto)
    radius: número (radio visual del cráter)
    depth: número (no se usa para geometría aún, reservado para mejoras)
    colorScheme: 'rojo' | 'amarillo'
*/
export default function Crater({ localPosition, position, radius, depth=0.05, colorScheme='rojo', planetRadius=2 }) {
  // Soportamos dos modos:
  // - si `localPosition` está presente, asumimos que es la posición del cráter en coordenadas locales del mesh de la Tierra (recomendado)
  // - si solo `position` (world) está presente, calculamos como antes
  const useLocal = !!localPosition
  const loc = useLocal ? localPosition.clone() : null
  if (!useLocal && !position) return null

  // Centro del planeta en espacio local del mesh = (0,0,0)
  // Si tenemos `localPosition`, trabajamos en espacio local: la normal es localPosition.normalized()
  const adjusted = useLocal ? loc.clone() : position.clone().sub(new THREE.Vector3(0, -0.4, 0))
  // Normal desde el centro del planeta hacia el punto de impacto (en el mismo espacio)
  const normal = adjusted.clone().normalize()
  const quat = new THREE.Quaternion()
  // Alineamos el eje Z local del grupo con la normal de la superficie
  quat.setFromUnitVectors(new THREE.Vector3(0,0,1), normal)
  const euler = new THREE.Euler().setFromQuaternion(quat)
  const palette = colorScheme === 'amarillo' ? {
    rim: '#eab308',       // amarillo dorado
    inner: '#facc15',     // interior más claro
    halo: '#fde047',      // halo suave
    emissive: '#f59e0b'
  } : {
    rim: '#b91c1c',       // rojo oscuro
    inner: '#dc2626',     // rojo medio
    halo: '#f87171',      // halo rojizo
    emissive: '#ef4444'
  }

  const ringScale = radius * 1.6

  // Si estamos en espacio local, la posición local en la superficie es normal * planetRadius
  const localSurfacePos = normal.clone().multiplyScalar(planetRadius)

  return (
    // Cuando el cráter se renderice como hijo del mesh de la Tierra, usamos coords locales
    <group position={localSurfacePos} rotation={euler}>
      {/* Borde del cráter */}
      <mesh>
        <ringGeometry args={[radius * 0.9, radius * 1.2, 40]} />
        <meshStandardMaterial color={palette.rim} emissive={palette.emissive} emissiveIntensity={0.45} roughness={0.75} metalness={0.08} side={THREE.DoubleSide} />
      </mesh>
      {/* Interior */}
      <mesh position={[0,0,-0.012]}> 
        <circleGeometry args={[radius*0.9, 40]} />
        <meshStandardMaterial color={palette.inner} roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Halo de eyección semitransparente */}
      <mesh scale={[ringScale, ringScale, ringScale]} position={[0,0,0.007]}> 
        <ringGeometry args={[radius * 1.25, radius * 1.55, 64]} />
        <meshBasicMaterial color={palette.halo} opacity={0.35} transparent />
      </mesh>
    </group>
  )
}
