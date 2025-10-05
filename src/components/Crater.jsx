import * as THREE from 'three'
import React, { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// ============================================================================
// GENERADOR DE GEOMETRÍA 3D PARA CRÁTERES (OPTIMIZADO Y CIRCULAR)
// Crea cráteres con depresión central, borde elevado y eyecta
// Usa geometría circular para evitar forma cuadrada
// ============================================================================
function createCraterGeometry(radius, seed = Math.random()) {
  // GEOMETRÍA CIRCULAR: Usar CircleGeometry en lugar de PlaneGeometry
  const radialSegments = 48; // Segmentos radiales (calidad circular)
  const rings = 32; // Anillos concéntricos (detalle de profundidad)
  
  const geometry = new THREE.CircleGeometry(radius * 1.5, radialSegments, rings);
  const positions = geometry.attributes.position;
  
  // Usar seed para variaciones consistentes
  const random = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };
  
  // Modificar vértices para crear forma de cráter con MÁS VOLUMEN
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // Distancia del centro (normalizada)
    const distFromCenter = Math.sqrt(x * x + y * y) / radius;
    
    let z = 0;
    
    if (distFromCenter < 0.35) {
      // Centro: depresión MUY PROFUNDA y suave
      const centerFactor = 1 - (distFromCenter / 0.35);
      // AUMENTADO: 0.15 -> 0.28 para más profundidad
      z = -Math.pow(centerFactor, 1.3) * radius * 0.28;
      
    } else if (distFromCenter < 0.7) {
      // Zona de transición: subida gradual hacia el borde
      const transitionFactor = (distFromCenter - 0.35) / 0.35;
      const depthAtStart = -radius * 0.28;
      z = depthAtStart * (1 - Math.pow(transitionFactor, 0.7));
      
    } else if (distFromCenter < 1.0) {
      // Borde elevado (rim) - MÁS PRONUNCIADO
      const rimFactor = (distFromCenter - 0.7) / 0.3;
      // AUMENTADO: 0.08 -> 0.15 para borde más alto
      const rimHeight = Math.sin(rimFactor * Math.PI) * radius * 0.15;
      z = rimHeight;
      
    } else if (distFromCenter < 1.3) {
      // Eyecta exterior: gradualmente hacia nivel 0
      const ejectaFactor = (distFromCenter - 1.0) / 0.3;
      z = Math.cos(ejectaFactor * Math.PI * 0.5) * radius * 0.05;
    }
    
    // Ruido procedural para textura rugosa (optimizado)
    const angle = Math.atan2(y, x);
    const noise = Math.sin(distFromCenter * 20 + seed) * 
                  Math.cos(angle * 8 + seed * 1.5) * 
                  radius * 0.012;
    z += noise * random(0.6, 1.2);
    
    // Agregar rugosidad adicional en el borde
    if (distFromCenter > 0.6 && distFromCenter < 1.1) {
      const edgeNoise = Math.sin(angle * 15) * radius * 0.018;
      z += edgeNoise * random(0.5, 1.0);
    }
    
    positions.setZ(i, z);
  }
  
  // Recalcular normales para iluminación correcta
  geometry.computeVertexNormals();
  
  return geometry;
}

export default function Crater({ localPosition, position, radius, depth=0.05, planetRadius=2, planetOffsetY=-0.4, data, sizeMultiplier=3.0, depthOffset=0.01 }) {
  const meshRef = useRef();
  const fireParticlesRef = useRef();
  const smokeParticlesRef = useRef();
  const glowRef = useRef();
  
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

  // ============================================================================
  // SISTEMA DE PARTÍCULAS DE FUEGO 🔥
  // Crea partículas animadas rojas, naranjas y amarillas simulando llamas
  // ============================================================================
  const fireParticles = useMemo(() => {
    const particleCount = Math.min(Math.floor(adjustedRadius * 80), 200); // Más partículas para cráteres grandes
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Distribuir partículas dentro del cráter (zona central)
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * adjustedRadius * 0.4; // Solo en el centro
      
      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = Math.sin(angle) * distance;
      positions[i3 + 2] = Math.random() * 0.02; // Altura inicial pequeña
      
      // Colores de fuego: rojo, naranja, amarillo
      const fireColor = Math.random();
      if (fireColor < 0.3) {
        // Rojo intenso
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.1;
        colors[i3 + 2] = 0.0;
      } else if (fireColor < 0.7) {
        // Naranja
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.5;
        colors[i3 + 2] = 0.0;
      } else {
        // Amarillo brillante
        colors[i3] = 1.0;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 0.2;
      }
      
      // Tamaños variables
      sizes[i] = Math.random() * 0.015 + 0.01;
      
      // Velocidades ascendentes (efecto de llamas subiendo)
      velocities[i3] = (Math.random() - 0.5) * 0.0003;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.0003;
      velocities[i3 + 2] = Math.random() * 0.0008 + 0.0004;
    }
    
    return { positions, colors, sizes, velocities, count: particleCount };
  }, [adjustedRadius]);

  // ============================================================================
  // SISTEMA DE PARTÍCULAS DE HUMO 💨
  // Partículas grises que se desvanecen simulando humo
  // ============================================================================
  const smokeParticles = useMemo(() => {
    const particleCount = Math.min(Math.floor(adjustedRadius * 40), 100);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * adjustedRadius * 0.6;
      
      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = Math.sin(angle) * distance;
      positions[i3 + 2] = Math.random() * 0.04;
      
      // Tonos de gris/negro para humo
      const gray = Math.random() * 0.3 + 0.2;
      colors[i3] = gray;
      colors[i3 + 1] = gray;
      colors[i3 + 2] = gray;
      
      sizes[i] = Math.random() * 0.025 + 0.015;
      
      // Velocidad más lenta y dispersa
      velocities[i3] = (Math.random() - 0.5) * 0.0005;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.0005;
      velocities[i3 + 2] = Math.random() * 0.0005 + 0.0002;
    }
    
    return { positions, colors, sizes, velocities, count: particleCount };
  }, [adjustedRadius]);

  // Animación de partículas
  useFrame((state, delta) => {
    if (fireParticlesRef.current) {
      const positions = fireParticlesRef.current.geometry.attributes.position.array;
      const sizes = fireParticlesRef.current.geometry.attributes.size.array;
      
      for (let i = 0; i < fireParticles.count; i++) {
        const i3 = i * 3;
        
        // Mover partículas hacia arriba
        positions[i3] += fireParticles.velocities[i3];
        positions[i3 + 1] += fireParticles.velocities[i3 + 1];
        positions[i3 + 2] += fireParticles.velocities[i3 + 2];
        
        // Reducir tamaño gradualmente (efecto de desvanecimiento)
        sizes[i] *= 0.995;
        
        // Resetear partículas que se desvanecen
        if (sizes[i] < 0.002 || positions[i3 + 2] > 0.08) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * adjustedRadius * 0.4;
          
          positions[i3] = Math.cos(angle) * distance;
          positions[i3 + 1] = Math.sin(angle) * distance;
          positions[i3 + 2] = 0;
          
          sizes[i] = Math.random() * 0.015 + 0.01;
        }
      }
      
      fireParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      fireParticlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
    
    if (smokeParticlesRef.current) {
      const positions = smokeParticlesRef.current.geometry.attributes.position.array;
      const sizes = smokeParticlesRef.current.geometry.attributes.size.array;
      
      for (let i = 0; i < smokeParticles.count; i++) {
        const i3 = i * 3;
        
        positions[i3] += smokeParticles.velocities[i3];
        positions[i3 + 1] += smokeParticles.velocities[i3 + 1];
        positions[i3 + 2] += smokeParticles.velocities[i3 + 2];
        
        sizes[i] *= 0.998;
        
        if (sizes[i] < 0.003 || positions[i3 + 2] > 0.12) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * adjustedRadius * 0.6;
          
          positions[i3] = Math.cos(angle) * distance;
          positions[i3 + 1] = Math.sin(angle) * distance;
          positions[i3 + 2] = 0;
          
          sizes[i] = Math.random() * 0.025 + 0.015;
        }
      }
      
      smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      smokeParticlesRef.current.geometry.attributes.size.needsUpdate = true;
    }

    // Animar el brillo (pulsación)
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      glowRef.current.material.opacity = pulse * 0.4;
    }
  });

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
      {/* Cráter 3D con geometría procedural CIRCULAR (OPTIMIZADO) */}
      <mesh 
        ref={meshRef}
        renderOrder={10} 
        position={[0, 0, 0]} 
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      >
        <primitive object={craterGeometry} attach="geometry" />
        <meshStandardMaterial
          color="#4a3a2a" // Color tierra más oscura
          roughness={0.95}
          metalness={0.05}
          side={THREE.DoubleSide} // DoubleSide para ver el interior del cráter
          flatShading={false} // Smooth shading para mejor volumen
          depthTest={true}
          depthWrite={true}
          emissive="#ff4400" // Brillo rojizo del calor
          emissiveIntensity={0.25} // Un poco más intenso
        />
      </mesh>

      {/* ========== EFECTOS ESPECIALES DE FUEGO 🔥 ========== */}
      
      {/* Brillo central (núcleo caliente) */}
      <mesh ref={glowRef} renderOrder={11} position={[0, 0, 0.001]}>
        <circleGeometry args={[adjustedRadius * 0.3, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Sistema de partículas de FUEGO */}
      <points ref={fireParticlesRef} renderOrder={12}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={fireParticles.count}
            array={fireParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={fireParticles.count}
            array={fireParticles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={fireParticles.count}
            array={fireParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Sistema de partículas de HUMO */}
      <points ref={smokeParticlesRef} renderOrder={11}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={smokeParticles.count}
            array={smokeParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={smokeParticles.count}
            array={smokeParticles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={smokeParticles.count}
            array={smokeParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Luz de punto (iluminación del fuego) */}
      <pointLight
        position={[0, 0, 0.02]}
        color="#ff4400"
        intensity={adjustedRadius * 2}
        distance={adjustedRadius * 3}
        decay={2}
      />
      
      {/* Sombra interior del cráter (da profundidad visual) */}
      <mesh renderOrder={9} position={[0, 0, -0.001]}>
        <circleGeometry args={[adjustedRadius * 0.5, 32]} />
        <meshBasicMaterial 
          color="#1a1410" 
          opacity={0.6} 
          transparent 
          depthWrite={false}
        />
      </mesh>

      {/* Borde oscuro del cráter (CIRCULAR) */}
      <mesh renderOrder={9} position={[0, 0, -0.0005]}>
        <ringGeometry args={[adjustedRadius * 0.8, adjustedRadius * 1.0, 48]} />
        <meshBasicMaterial 
          side={THREE.FrontSide} 
          color="#3a2f25" 
          opacity={0.5} 
          transparent 
          depthWrite={false}
        />
      </mesh>
      
      {/* Halo de eyecta (CIRCULAR, más suave) */}
      <mesh renderOrder={8} position={[0, 0, -0.002]}>
        <ringGeometry args={[adjustedRadius * 1.0, adjustedRadius * 1.6, 36]} />
        <meshBasicMaterial 
          side={THREE.FrontSide}
          color="#6a5a45" 
          opacity={0.25} 
          transparent 
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
