import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Asteroid({ start, target, speed = 0.5, onHit, debug = false, tipo='Roca', masa=1000, densidad=3000, angulo=45 }) {
  const mesh = useRef()
  const dir = useRef(new THREE.Vector3())
  const distance = useRef(0)
  const traveled = useRef(0)
  // We'll render a simple yellow sphere (no texture)

  useEffect(() => {
    if (!start || !target) return
    dir.current.subVectors(target, start).normalize()
    distance.current = start.distanceTo(target)
    traveled.current = 0
    if (mesh.current) mesh.current.position.copy(start)
    if (debug) console.log('[Asteroid] spawned', { start: start.toArray(), target: target.toArray(), speed })
  }, [start, target, speed, debug, tipo, masa, densidad, angulo])

  useFrame((_, delta) => {
    if (!mesh.current) return
    const move = speed * delta
    traveled.current += move
    if (traveled.current >= distance.current) {
      if (debug) console.log('[Asteroid] impact at', target.toArray())
      if (onHit) onHit(target)
      mesh.current.visible = false
      return
    }
    mesh.current.position.addScaledVector(dir.current, move)
  mesh.current.rotation.x += 1.2 * delta
  mesh.current.rotation.y += 0.7 * delta
    if (debug && Math.round(traveled.current * 100) % 100 === 0) {
      console.log('[Asteroid] pos', mesh.current.position.toArray())
    }
  })

  // Render as a textured sphere. Use start.toArray() so react-three accepts position reliably.
  // Apariencia dinámica basada en parámetros
  const tipoColor = {
    'Roca': '#8b6d4b',
    'Hierro': '#b6bcc7',
    'Mixto': '#a8865a'
  }[tipo] || '#8b6d4b'
  // Tamaño relativo (raíz cúbica de la masa en relación a 1000)
  const baseRadius = 0.28
  const sizeFactor = Math.cbrt(Math.max(masa,1)) / Math.cbrt(1000)
  const radius = THREE.MathUtils.clamp(baseRadius * sizeFactor, 0.12, 1.2)
  // Metalness según tipo + densidad
  let metalness = tipo === 'Hierro' ? 0.85 : (tipo === 'Mixto' ? 0.45 : 0.2)
  metalness += (densidad - 3000) / 12000
  metalness = THREE.MathUtils.clamp(metalness, 0, 1)
  const roughness = 1 - metalness * 0.55
  const ang = Number(angulo) || 45
  const emissiveIntensity = ang < 25 || ang > 70 ? 0.65 : 0.35
  const emissiveColor = new THREE.Color(tipoColor).multiplyScalar(emissiveIntensity * 0.6)

  return (
    <group>
      {/* small point light to help the asteroid stand out */}
      <pointLight position={[0,0,0]} intensity={0.6} distance={2} />
      <mesh ref={mesh} position={start?.toArray ? start.toArray() : [0,0,0]} frustumCulled={false}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={tipoColor} emissive={emissiveColor} emissiveIntensity={0.9} metalness={metalness} roughness={roughness} />
      </mesh>

      {debug && (
        <>
          {/* Start helper (small green sphere) */}
          <mesh position={start?.toArray ? start.toArray() : [0,0,0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="lime" />
          </mesh>
          {/* Target helper (small red sphere) */}
          <mesh position={target?.toArray ? target.toArray() : [0,0,0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </>
      )}
    </group>
  )
}
