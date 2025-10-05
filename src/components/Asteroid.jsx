import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// GENERADOR DE GEOMETRÍA IRREGULAR PARA ASTEROIDES
// Crea formas rocosas aleatorias usando deformación de esfera base
// ============================================================================
function createAsteroidGeometry(seed = Math.random()) {
  const geometry = new THREE.SphereGeometry(1, 64, 64); // Más segmentos para suavidad
  const positions = geometry.attributes.position;
  
  // Usar seed para generar números pseudo-aleatorios consistentes
  const random = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };
  
  // Deformar cada vértice de manera irregular pero suave
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Calcular distancia desde el centro
    const length = Math.sqrt(x * x + y * y + z * z);
    
    // Frecuencias muy bajas para deformaciones amplias y suaves (asteroides realistas)
    const noise1 = Math.sin(x * 1.2 + seed) * Math.cos(y * 1.4 + seed) * 0.05;
    const noise2 = Math.sin(y * 1.5 + seed) * Math.cos(z * 1.3 + seed) * 0.04;
    const noise3 = Math.sin(z * 1.1 + seed) * Math.cos(x * 1.6 + seed) * 0.04;
    
    // Capa adicional de ruido de muy baja frecuencia para forma general irregular
    const lowFreqNoise = Math.sin(x * 0.7 + seed) * Math.cos(y * 0.8 + seed) * Math.sin(z * 0.6 + seed) * 0.10;
    
    // Cráteres muy sutiles (casi imperceptibles)
    const craterNoise = Math.pow(Math.abs(Math.sin(x * 3.0 + y * 2.8 + z * 3.2 + seed)), 3.0) * random(-0.03, 0.01);
    
    // Factor de deformación combinado (muy suave, sin picos)
    const deformation = 1 + noise1 + noise2 + noise3 + lowFreqNoise + craterNoise;
    
    // Aplicar deformación manteniendo la dirección original
    positions.setXYZ(
      i,
      (x / length) * deformation,
      (y / length) * deformation,
      (z / length) * deformation
    );
  }
  
  // Recalcular normales para iluminación correcta
  geometry.computeVertexNormals();
  
  return geometry;
}

export default function Asteroid({ start, target, speed = 0.5, onHit, debug = false, tipo='Roca', masa=1000, densidad=3000, angulo=45, color }) {
  const mesh = useRef()
  const dir = useRef(new THREE.Vector3())
  const distance = useRef(0)
  const traveled = useRef(0)
  
  // Generar geometría irregular única para este asteroide (basada en coordenadas de inicio)
  const asteroidGeometry = useMemo(() => {
    const seed = start ? (start.x * 1000 + start.y * 100 + start.z * 10) : Math.random() * 10000;
    return createAsteroidGeometry(seed);
  }, [start])

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
        {/* Geometría irregular generada proceduralmente */}
        <primitive object={asteroidGeometry} attach="geometry" />
        <meshStandardMaterial 
          color={tipoColor} 
          emissive={emissiveColor} 
          emissiveIntensity={0.9} 
          metalness={metalness} 
          roughness={roughness}
          flatShading={false} // Shading suave para mejor apariencia
        />
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
