import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import craterTexSrc from '../assets/s6s6s6jj.png'

/*
  Componente Crater
  Props:
    localPosition: THREE.Vector3 (posición en coordenadas locales del mesh de la Tierra) -- recomendado
    position: THREE.Vector3 (posición en world space)
    radius: número (radio visual del cráter, en unidades de escena)
    depth: número (no se usa para geometría aún, reservado para mejoras)
    planetRadius: número (radio de la Tierra en unidades de escena)
    planetOffsetY: número (offset Y del mesh de la Tierra en unidades de escena)
*/
export default function Crater({ localPosition, position, radius, depth=0.05, planetRadius=2, planetOffsetY=-0.4, data }) {
  const useLocal = !!localPosition
  const loc = useLocal ? localPosition.clone() : null
  if (!useLocal && !position) return null

  // Si tenemos coords locales, trabajamos en espacio local del mesh (recomendado)
  const adjusted = useLocal ? loc.clone() : position.clone().sub(new THREE.Vector3(0, planetOffsetY, 0))
  const normal = adjusted.clone().normalize()
  const quat = new THREE.Quaternion()
  quat.setFromUnitVectors(new THREE.Vector3(0,0,1), normal)
  const euler = new THREE.Euler().setFromQuaternion(quat)

  // Escala base: radius representa el radio visual. La textura es cuadrada; hacemos un plano diámetro x diámetro
  const diameter = radius * 2

  // Evitar z-fighting: colocar el cráter ligeramente por encima de la superficie, luego hundir un poco el plano
  const outwardOffset = Math.max(radius * 0.025, planetRadius * 0.0007)
  const localSurfacePos = normal.clone().multiplyScalar(planetRadius + outwardOffset)

  // Cargar textura del cráter (PNG con alpha)
  const craterTexture = useLoader(TextureLoader, craterTexSrc)
  craterTexture.anisotropy = 8
  craterTexture.wrapS = craterTexture.wrapT = THREE.ClampToEdgeWrapping

  const logged = useRef(false)
  useEffect(() => {
    if (!logged.current) {
      try {
        const craterData = data?.craterData;
        const physicalDiameterKm = craterData ? (craterData.D_final/1000).toFixed(2) : undefined;
        console.log('[Crater] mount', {
          radius,
          useLocal,
          hasLocal: !!localPosition,
            adjustedLen: adjusted.length().toFixed(4),
          planetRadius,
          outwardOffset,
          physicalDiameterKm,
          energyTJ: craterData ? (craterData.energyJ/1e12).toFixed(3) : undefined,
          exaggeration: craterData?.exaggeration,
        })
      } catch (e) {}
      logged.current = true
    }
  }, [radius, useLocal, localPosition, adjusted, planetRadius])

  if (radius <= 0) return null

  return (
    <group position={localSurfacePos} rotation={euler}>
      {/* Plano texturizado del cráter: colocamos el plano ligeramente hacia afuera */}
      <mesh renderOrder={999} position={[0,0,Math.max(0.0015, outwardOffset * 0.06)]} frustumCulled={false}> 
        <planeGeometry args={[diameter, diameter]} />
        <meshStandardMaterial
          map={craterTexture}
          transparent
          alphaTest={0.08}
          depthWrite={true}
          roughness={0.85}
          metalness={0.05}
          side={THREE.DoubleSide}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={1}
        />
      </mesh>
      {/* Halo simple opcional (mantiene algo del look anterior, escalado ligero) */}
      <mesh renderOrder={998} position={[0,0,Math.max(0.0025, outwardOffset * 0.08)]} scale={[1,1,1]}> 
        <ringGeometry args={[radius * 1.05, radius * 1.38, 48]} />
        <meshBasicMaterial side={THREE.DoubleSide} color="#ffffff" opacity={0.28} transparent />
      </mesh>
    </group>
  )
}
