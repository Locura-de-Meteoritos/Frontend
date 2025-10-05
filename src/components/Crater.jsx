import * as THREE from 'three'
import React, { useEffect, useRef, useMemo } from 'react'

// ============================================================================
// GENERADOR DE GEOMETRÍA 3D PARA CRÁTERES
// Crea cráteres con depresión central, borde elevado y eyecta
// ============================================================================
function createCraterGeometry(radius, seed = Math.random()) {
  const segments = 64; // Resolución del cráter
  const geometry = new THREE.PlaneGeometry(radius * 2.5, radius * 2.5, segments, segments);
  const positions = geometry.attributes.position;
  
  // Usar seed para variaciones consistentes
  const random = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };
  
  // Modificar vértices para crear forma de cráter
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // Distancia del centro (normalizada)
    const distFromCenter = Math.sqrt(x * x + y * y) / radius;
    
    let z = 0;
    
    if (distFromCenter < 0.3) {
      // Centro: depresión profunda y suave
      const centerFactor = 1 - (distFromCenter / 0.3);
      z = -Math.pow(centerFactor, 1.5) * radius * 0.15; // Más profundo y suave
      
    } else if (distFromCenter < 0.65) {
      // Zona de transición: subida gradual hacia el borde
      const transitionFactor = (distFromCenter - 0.3) / 0.35;
      const depthAtStart = -radius * 0.15;
      z = depthAtStart * (1 - Math.pow(transitionFactor, 0.8));
      
    } else if (distFromCenter < 0.9) {
      // Borde elevado (rim) - más pronunciado
      const rimFactor = (distFromCenter - 0.65) / 0.25;
      const rimHeight = Math.sin(rimFactor * Math.PI) * radius * 0.08;
      z = rimHeight;
      
    } else if (distFromCenter < 1.2) {
      // Eyecta exterior: gradualmente hacia nivel 0
      const ejectaFactor = (distFromCenter - 0.9) / 0.3;
      const rimHeight = radius * 0.08;
      z = rimHeight * (1 - ejectaFactor * ejectaFactor);
    }
    
    // Añadir rugosidad/irregularidad más sutil
    const noise = Math.sin(x * 15 + seed) * Math.cos(y * 15 + seed * 1.3) * radius * 0.008;
    z += noise * random(0.3, 1.2);
    
    positions.setZ(i, z);
  }
  
  // Recalcular normales para iluminación correcta
  geometry.computeVertexNormals();
  
  return geometry;
}

export default function Crater({ localPosition, position, radius, depth=0.05, planetRadius=2, planetOffsetY=-0.4, data, sizeMultiplier=3.0, depthOffset=0.01 }) {
  const meshRef = useRef();
  const useLocal = !!localPosition
  const loc = useLocal ? localPosition.clone() : null
  if (!useLocal && !position) return null

  // ⚙️ VARIABLE DE AJUSTE MANUAL: depthOffset
  // Controla la elevación del cráter sobre la superficie
  // IMPORTANTE: Este valor debe ser POSITIVO y PROPORCIONAL al planetRadius
  // Para planetRadius ~6.371 (escala realista):
  //   - Valores positivos pequeños (0.001 a 0.02): cráter ligeramente SOBRE la superficie (recomendado)
  //   - Esto evita z-fighting y mezcla con la atmósfera
  //   - El valor por defecto 0.01 (~10 km de elevación) funciona bien visualmente
  // ⚠️ NO uses valores negativos o el cráter quedará dentro del planeta
  // ⚠️ NO uses valores mayores a 0.05 o flotará demasiado

  // Aplicar multiplicador de tamaño al radio del cráter
  const adjustedRadius = radius * sizeMultiplier;

  // Si tenemos coords locales, trabajamos en espacio local del mesh (recomendado)
  // IMPORTANTE: localPosition ya está en coordenadas relativas al centro del planeta
  // NO necesitamos restar planetOffsetY porque el cráter se renderiza en el mismo
  // sistema de coordenadas que la Tierra (que ya tiene planetOffsetY aplicado)
  const adjusted = useLocal ? loc.clone() : position.clone().sub(new THREE.Vector3(0, planetOffsetY, 0))
  const normal = adjusted.clone().normalize()
  const quat = new THREE.Quaternion()
  quat.setFromUnitVectors(new THREE.Vector3(0,0,1), normal)
  const euler = new THREE.Euler().setFromQuaternion(quat)

  // Colocar el cráter en la superficie con ajuste manual
  // CLAVE: Aplicamos planetOffsetY para que el cráter se alinee con la Tierra
  // que está desplazada en Y. Luego proyectamos al radio + depthOffset
  const localSurfacePos = normal.clone().multiplyScalar(planetRadius + depthOffset)
  
  // Aplicar el offset Y para alinear con la Tierra desplazada
  localSurfacePos.y += planetOffsetY

  // Generar geometría 3D única del cráter
  const craterGeometry = useMemo(() => {
    const seed = (localSurfacePos.x * 1000 + localSurfacePos.y * 500 + localSurfacePos.z * 250);
    return createCraterGeometry(adjustedRadius, seed);
  }, [adjustedRadius, localSurfacePos.x, localSurfacePos.y, localSurfacePos.z])

  const logged = useRef(false)
  useEffect(() => {
    if (!logged.current) {
      try {
        const craterData = data?.craterData;
        const physicalDiameterKm = craterData ? (craterData.D_final/1000).toFixed(2) : undefined;
        console.log('[Crater 3D] mount', {
          radius,
          adjustedRadius,
          sizeMultiplier,
          depthOffset,
          planetOffsetY,
          useLocal,
          hasLocal: !!localPosition,
          normalLen: normal.length().toFixed(4),
          adjustedLen: adjusted.length().toFixed(4),
          planetRadius,
          targetRadius: (planetRadius + depthOffset).toFixed(4),
          surfaceDistance: localSurfacePos.length().toFixed(4),
          surfacePosY: localSurfacePos.y.toFixed(4),
          expectedPosY: (normal.y * (planetRadius + depthOffset) + planetOffsetY).toFixed(4),
          physicalDiameterKm,
          energyTJ: craterData ? (craterData.energyJ/1e12).toFixed(3) : undefined,
          exaggeration: craterData?.exaggeration,
        })
      } catch (e) {}
      logged.current = true
    }
    // Dependencias simplificadas: solo valores primitivos y evitar objetos que cambien en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, adjustedRadius, sizeMultiplier, depthOffset, planetOffsetY, planetRadius])

  if (adjustedRadius <= 0) return null

  return (
    <group position={localSurfacePos} rotation={euler}>
      {/* Cráter 3D con geometría procedural */}
      {/* renderOrder bajo para que se dibuje ANTES de la atmósfera */}
      <mesh 
        ref={meshRef}
        renderOrder={10} 
        position={[0, 0, 0]} 
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <primitive object={craterGeometry} attach="geometry" />
        <meshStandardMaterial
          color="#5a4a3a"
          roughness={0.98}
          metalness={0.02}
          side={THREE.DoubleSide}
          flatShading={false}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>
      
      {/* Borde oscuro del cráter para mejor definición */}
      <mesh renderOrder={9} position={[0, 0, -0.001]}>
        <ringGeometry args={[adjustedRadius * 0.75, adjustedRadius * 0.85, 64]} />
        <meshBasicMaterial 
          side={THREE.DoubleSide} 
          color="#3a2f25" 
          opacity={0.7} 
          transparent 
          depthWrite={false}
        />
      </mesh>
      
      {/* Halo de eyecta (material expulsado) */}
      <mesh renderOrder={8} position={[0, 0, -0.002]}>
        <ringGeometry args={[adjustedRadius * 0.9, adjustedRadius * 1.4, 48]} />
        <meshBasicMaterial 
          side={THREE.DoubleSide} 
          color="#7a6a55" 
          opacity={0.3} 
          transparent 
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
