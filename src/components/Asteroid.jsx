import React, { useRef, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import asteroidImg from '../assets/asteroide.jpg'

export default function Asteroid({ start, target, speed = 20, onHit, debug = false }) {
  const mesh = useRef()
  const dir = useRef(new THREE.Vector3())
  const distance = useRef(0)
  const traveled = useRef(0)
  // useLoader integrates with react-three-fiber's cache and suspense
  const texture = useLoader(TextureLoader, asteroidImg)

  useEffect(() => {
    if (!start || !target) return
    dir.current.subVectors(target, start).normalize()
    distance.current = start.distanceTo(target)
    traveled.current = 0
    if (mesh.current) mesh.current.position.copy(start)
    if (debug) console.log('[Asteroid] spawned', { start: start.toArray(), target: target.toArray(), speed })
  }, [start, target, speed, debug])

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
  return (
    <group>
      <mesh ref={mesh} position={start?.toArray ? start.toArray() : [0,0,0]} frustumCulled={false}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial map={texture} metalness={0.1} roughness={0.7} />
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
