import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// GENERADOR DE GEOMETRÍA IRREGULAR PARA ASTEROIDES (OPTIMIZADO)
// Crea formas rocosas aleatorias usando deformación de esfera base
// ============================================================================
function createAsteroidGeometry(seed = Math.random()) {
  // BASE GEOMETRÍA: Mantener 32x32 para balance rendimiento/forma
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const positions = geometry.attributes.position;
  const vertexCount = positions.count;

  // Atributo de color por vértice para variación visual
  const colors = new Float32Array(vertexCount * 3);

  // PRNG simple basado en seed
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Parámetros de deformación (ajustables)
  const highFreqAmp = 0.06; // detalles pequeños
  const midFreqAmp = 0.12;  // rugosidad general
  const lowFreqAmp = 0.18;  // deformación global

  // Crear una lista de cráteres procedurales (pos angulares + radio)
  const craterCount = Math.floor(3 + rand() * 6); // entre 3 y 8 cráteres por asteroide
  const craters = [];
  for (let c = 0; c < craterCount; c++) {
    craters.push({
      angle: rand() * Math.PI * 2,
      radius: 0.05 + rand() * 0.25, // tamaño relativo al radio base
      depth: 0.03 + rand() * 0.12,
      xOff: (rand() - 0.5) * 0.6,
      yOff: (rand() - 0.5) * 0.6
    });
  }

  // Recorrer vértices y aplicar deformaciones
  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    const length = Math.sqrt(x * x + y * y + z * z) || 1;
    // Coordenadas esféricas aproximadas
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;

    // Coordenada polar para ruido coherente
    const theta = Math.atan2(ny, nx);
    const phi = Math.acos(nz);

    // Capas de ruido: baja frecuencia (grande), media, alta (detalle)
    const low = Math.sin(phi * 1.2 + seed * 0.5) * lowFreqAmp * (0.8 + rand() * 0.4);
    const mid = Math.sin(theta * 3.5 + seed * 1.7) * midFreqAmp * (0.8 + rand() * 0.6);
    const high = (Math.sin(nx * 12 + ny * 9 + seed * 7) + Math.cos(nz * 14 + seed * 3)) * 0.5 * highFreqAmp;

    let deformation = 1 + low + mid + high;

    // Aplicar cráteres: si el vértice está cerca del centro del cráter, hundirlo
    for (let c = 0; c < craters.length; c++) {
      const crater = craters[c];
      // Proyectar coordenada bidimensional aproximada en esfera para testar distancia
      const cx = Math.cos(crater.angle) * crater.xOff;
      const cy = Math.sin(crater.angle) * crater.yOff;
      const dx = nx - cx;
      const dy = ny - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < crater.radius) {
        // perfil de cráter: suave depresión
        const t = 1 - (d / crater.radius);
        const craterEffect = -Math.pow(t, 1.2) * crater.depth;
        deformation += craterEffect;
      }
    }

    // Limitar deformación para evitar artefactos
    deformation = Math.max(0.55, Math.min(1.6, deformation));

    positions.setXYZ(i, (x / length) * deformation, (y / length) * deformation, (z / length) * deformation);

    // Color por vértice: mezcla entre tonos rocosos y metálicos según rand y normal
    const v = 0.5 + 0.5 * rand();
    const r = THREE.MathUtils.lerp(0.45, 0.9, v); // rojo/marrón
    const g = THREE.MathUtils.lerp(0.35, 0.9, v * 0.8);
    const b = THREE.MathUtils.lerp(0.25, 0.6, v * 0.5);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  // Añadir atributo de color a la geometría
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Recalcular normales y actualizar bounding
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

export default function Asteroid({ start, target, speed = 0.5, onHit, debug = false, tipo='Roca', masa=1000, densidad=3000, angulo=45, color, radiusUnits: propRadiusUnits, diameterMeters }) {
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
  // Tamaño fijo (solo si quieres forzar un tamaño visual)
  // 1 unidad = 1000 km. FIXED_ASTEROID_RADIUS_UNITS = 0.02 => 20 km radio visual
  const FIXED_ASTEROID_RADIUS_UNITS = 0.02; // valor mínimo visible razonable
  // Por defecto usar cálculo físico a partir de masa/densidad para evitar asteroides gigantes
  const FORCE_FIXED_SIZE = false; // Si true, fuerza FIXED_ASTEROID_RADIUS_UNITS

  // ---------------------------
  // Cálculo físico del radio del asteroide
  // Entrada: masa en kg, densidad en kg/m^3
  // Volumen esfera = masa / densidad -> V = 4/3 * pi * r^3  => r = ((3/4) * V / pi)^(1/3)
  // El radio resultante está en metros. Convertimos a unidades de escena:
  // 1 unidad = 1000 km = 1e6 m
  // Luego aplicamos una exageración visual y límites para que sean visibles en la escena.
  // Si forzamos tamaño fijo, usar la constante; si no, calcular desde masa/densidad
  let radius = FIXED_ASTEROID_RADIUS_UNITS;

  // Si el caller pasó un radiusUnits explícito, usarlo (permite control desde la UI)
  if (typeof propRadiusUnits === 'number' && !isNaN(propRadiusUnits)) {
    radius = propRadiusUnits;
  } else if (typeof diameterMeters === 'number' && !isNaN(diameterMeters)) {
    // Si se pasa diameter en metros (por ejemplo desde NASA), convertir a unidades de escena
    const METERS_PER_UNIT = 1000 * 1000; // 1 unidad = 1000 km = 1e6 m
    const radiusMeters = Math.max(0, diameterMeters / 2);
    radius = (radiusMeters / METERS_PER_UNIT) * 1; // VISUAL_SCALE = 1
  } else if (!FORCE_FIXED_SIZE) {
    try {
      const masaKg = Math.max(Number(masa) || 1, 1);
      const dens = Math.max(Number(densidad) || 3000, 50);
      const volumen_m3 = masaKg / dens; // m^3
      let radio_m = Math.pow((3 / (4 * Math.PI)) * volumen_m3, 1/3); // metros
      // Convertir metros -> unidades de escena (1 u = 1e6 m)
      const METERS_PER_UNIT = 1000 * 1000; // 1 unidad = 1000 km = 1e6 m
      let radiusUnits = radio_m / METERS_PER_UNIT;

      // Visual scaling: usar 1 para mantener proporciones reales
      const VISUAL_SCALE = 1;
      radiusUnits = radiusUnits * VISUAL_SCALE;

      // Clamp visual radius a límites razonables
      const MIN_VISUAL = 0.001; // ~1 km visual radio
      const MAX_VISUAL = 2.0; // evita bolas enormes
      radius = THREE.MathUtils.clamp(radiusUnits, MIN_VISUAL, MAX_VISUAL);
    } catch (err) {
      // fallback al comportamiento previo si algo va mal
      const baseRadius = 0.28
      const sizeFactor = Math.cbrt(Math.max(masa,1)) / Math.cbrt(1000)
      radius = THREE.MathUtils.clamp(baseRadius * sizeFactor, 0.12, 1.2)
    }
  }
  
  // Asegurar visibilidad mínima: si el cálculo físico produjo algo muy pequeño, usar el fixed mínimo
  if (radius < FIXED_ASTEROID_RADIUS_UNITS) radius = FIXED_ASTEROID_RADIUS_UNITS;
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
          // Usar colores por vértice si existen
          vertexColors={true}
          color={tipoColor} 
          emissive={emissiveColor} 
          emissiveIntensity={0.55} 
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
