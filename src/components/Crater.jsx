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
export default function Crater({ position, radius, depth=0.05, colorScheme='rojo' }) {
  if (!position) return null
  const normal = position.clone().normalize()
  const quat = new THREE.Quaternion()
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

  return (
    <group position={normal.multiplyScalar(2)} rotation={euler}>
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
