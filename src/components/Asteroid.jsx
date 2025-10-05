import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Asteroid({ start, target, speed = 0.5, onHit, debug = false, tipo='Roca', masa=1000, densidad=3000, angulo=45, color }) {
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
      // Usar la posición real del mesh en el momento del impacto para mayor precisión
      const impactPos = mesh.current.position.clone()
      if (onHit) onHit(impactPos, { masa, tipo, densidad, angulo, speed })
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
  const tipoColor = color || {
    'Roca': '#8b6d4b',
    'Hierro': '#b6bcc7',
    'Mixto': '#a8865a'
  }[tipo] || '#8b6d4b'
  // Tamaño relativo (raíz cúbica de la masa en relación a 1000)
  // -----------------------------------------------------------
  // OPCIÓN: tamaño fijo global (en unidades de escena).
  // Si quieres forzar todos los asteroides a un tamaño fijo, edita el valor de
  // FIXED_ASTEROID_RADIUS_UNITS abajo. Por ejemplo, 0.12 -> radio visual ~120 km
  // (recordar: 1 unidad = 1000 km en esta escena).
  const FIXED_ASTEROID_RADIUS_UNITS = 0.5; // <-- Cambia este valor para ajustar el tamaño global
  const FORCE_FIXED_SIZE = true; // <-- Si true, siempre usaremos FIXED_ASTEROID_RADIUS_UNITS

  // ---------------------------
  // Cálculo físico del radio del asteroide
  // Entrada: masa en kg, densidad en kg/m^3
  // Volumen esfera = masa / densidad -> V = 4/3 * pi * r^3  => r = ((3/4) * V / pi)^(1/3)
  // El radio resultante está en metros. Convertimos a unidades de escena:
  // 1 unidad = 1000 km = 1e6 m
  // Luego aplicamos una exageración visual y límites para que sean visibles en la escena.
  // Si forzamos tamaño fijo, usar la constante; si no, calcular desde masa/densidad
  let radius = FIXED_ASTEROID_RADIUS_UNITS;
  if (!FORCE_FIXED_SIZE) {
    try {
      const masaKg = Math.max(Number(masa) || 1, 1);
      const dens = Math.max(Number(densidad) || 3000, 50);
      const volumen_m3 = masaKg / dens; // m^3
      let radio_m = Math.pow((3 / (4 * Math.PI)) * volumen_m3, 1/3); // metros
      // Convertir metros -> unidades de escena (1 u = 1e6 m)
      const METERS_PER_UNIT = 1000 * 1000; // 1 unidad = 1000 km = 1e6 m
      let radiusUnits = radio_m / METERS_PER_UNIT;

      // Visual scaling: aumentar un poco para que no sean microscópicos en la escena.
      // Este factor solo afecta la representación, no los cálculos físicos.
      // Ajustado para evitar tamaños enormes cuando la entrada es kilómetros/más grandes.
      const VISUAL_SCALE = 12; // reducir para mantener tamaños razonables
      radiusUnits = radiusUnits * VISUAL_SCALE;

      // Clamp visual radius to reasonable bounds (evitar tamaños lunares)
      const MIN_VISUAL = 0.005; // ~5 km visual radio
      const MAX_VISUAL = 1.2; // evita bolas enormes
      radius = THREE.MathUtils.clamp(radiusUnits, MIN_VISUAL, MAX_VISUAL);
    } catch (err) {
      // fallback al comportamiento previo si algo va mal
      const baseRadius = 0.28
      const sizeFactor = Math.cbrt(Math.max(masa,1)) / Math.cbrt(1000)
      radius = THREE.MathUtils.clamp(baseRadius * sizeFactor, 0.12, 1.2)
    }
  }
  // Asegurar que el mesh use la escala fija (override absoluto)
  useEffect(() => {
    try {
      if (mesh.current) {
        mesh.current.scale.set(radius, radius, radius);
      }
    } catch (e) {}
  }, [radius]);
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
        {/* Usamos una esfera base unit (radio=1) y controlamos el tamaño por scale para forzar el tamaño fijo */}
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={tipoColor} emissive={emissiveColor} emissiveIntensity={0.9} metalness={metalness} roughness={roughness} />
      </mesh>

      {debug && (
        <>
          {/* Start helper (small green sphere) */}
          <mesh position={start?.toArray ? start.toArray() : [0,0,0]}>
            <sphereGeometry args={[Math.min(0.06, radius*0.6), 8, 8]} />
            <meshBasicMaterial color="lime" />
          </mesh>
          {/* Target helper (small red sphere) */}
          <mesh position={target?.toArray ? target.toArray() : [0,0,0]}>
            <sphereGeometry args={[Math.min(0.08, radius*0.8), 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </>
      )}
    </group>
  )
}
