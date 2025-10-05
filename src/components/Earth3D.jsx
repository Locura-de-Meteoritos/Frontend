import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Crater from './Crater';

// ============================================================================
// HOOK PERSONALIZADO: Carga de texturas de la Tierra (OPTIMIZADO)
// Usa texturas 2K en lugar de 4K para mejor rendimiento en web
// ============================================================================
function useEarthTextures() {
  const [textures, setTextures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTextures = async () => {
      try {
        const loader = new THREE.TextureLoader();
        
        console.log('🌍 Cargando texturas de la Tierra (2K optimizado)...');
        
        // OPTIMIZACIÓN: Usar texturas 2K en lugar de 4K (reduce peso ~75%)
        // 4K = ~15MB por textura → 2K = ~4MB por textura
        const [dayTexture, cloudsTexture] = await Promise.all([
          loader.loadAsync(
            'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'
          ).catch(() => null),
          // Solo cargar nubes si es necesario
          loader.loadAsync(
            'https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png'
          ).catch(() => null)
        ]);

        // OPTIMIZACIÓN: Configurar compresión y filtros eficientes
        if (dayTexture) {
          dayTexture.wrapS = dayTexture.wrapT = THREE.RepeatWrapping;
          dayTexture.minFilter = THREE.LinearFilter; // Más rápido que MipMap
          dayTexture.magFilter = THREE.LinearFilter;
          dayTexture.generateMipmaps = false; // Ahorra memoria
          
          if (cloudsTexture) {
            cloudsTexture.wrapS = cloudsTexture.wrapT = THREE.RepeatWrapping;
            cloudsTexture.minFilter = THREE.LinearFilter;
            cloudsTexture.magFilter = THREE.LinearFilter;
            cloudsTexture.generateMipmaps = false;
          }
          
          console.log('✅ Texturas optimizadas cargadas:', {
            day: !!dayTexture,
            clouds: !!cloudsTexture
          });
        } else {
          console.warn('⚠️ No se pudo cargar la textura principal de la Tierra');
        }

        setTextures({
          day: dayTexture,
          clouds: cloudsTexture
        });
        setLoading(false);
      } catch (error) {
        console.error('⚠️ Error cargando texturas:', error);
        setLoading(false);
      }
    };

    loadTextures();
  }, []);

  return { textures, loading };
}

// ============================================================================
// MODELO 3D ULTRA-REALISTA DE LA TIERRA CON TEXTURAS 4K
// Texturas de alta resolución sin problemas de CORS
// ============================================================================
export default function Earth3D({ 
  earthRef, 
  planetRadius = 100,
  planetOffsetY = -0.4, 
  paused = false, 
  onPointerDown, 
  craters = [],
  showAtmosphere = true,
  showClouds = true,
  earthTilt = 23.5,
  rotationSpeed = 0.01,
  cloudRotationSpeed = 0.008,
  enableAutoRotate = false
}) {
  const groupRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const earthMeshRef = useRef();
  
  // Cargar texturas de la NASA
  const { textures, loading } = useEarthTextures();

  // ============================================================================
  // CONSTRUCCIÓN DEL PLANETA TIERRA CON TEXTURAS NASA
  // ============================================================================
  const planetGroup = useRef();
  
  useEffect(() => {
    if (loading) return; // Esperar a que las texturas carguen
    
    const group = new THREE.Group();
    
    // Aplicar inclinación axial de la Tierra (23.5°)
    group.rotation.z = (earthTilt * Math.PI) / 180;
    
    // ========================================================================
    // TIERRA CON TEXTURAS REALES (SIN CORS)
    // ========================================================================
    console.log('🌍 Renderizando Tierra con texturas optimizadas');
    
    // OPTIMIZACIÓN: Reducir geometría de 256 a 128 segmentos (reduce ~75% polígonos)
    // 256x256 = 65,536 polígonos → 128x128 = 16,384 polígonos
    const earthGeo = new THREE.SphereGeometry(planetRadius, 128, 128);
    
    // OPTIMIZACIÓN: Material simplificado sin normal/bump maps (reduce procesamiento GPU)
    const earthMat = new THREE.MeshPhongMaterial({
      map: textures.day,
      shininess: 5,
      // Eliminamos: specularMap, normalMap, bumpMap para mejor rendimiento
    });
    
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(0, planetOffsetY, 0);
    earthMesh.name = 'EarthNASA';
    earthMesh.renderOrder = 0;
    earthMeshRef.current = earthMesh;
    group.add(earthMesh);
    
    // ========================================================================
    // NUBES (OPTIMIZADO)
    // ========================================================================
    if (showClouds && textures.clouds) {
      // OPTIMIZACIÓN: Reducir segmentos de nubes a 64 (más simple que la tierra)
      const cloudsGeo = new THREE.SphereGeometry(planetRadius * 1.01, 64, 64);
      const cloudsMat = new THREE.MeshPhongMaterial({
        map: textures.clouds,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        side: THREE.FrontSide // Solo FrontSide para mejor rendimiento
      });
      
      const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
      cloudsMesh.name = 'CloudsNASA';
      cloudsMesh.position.set(0, planetOffsetY, 0);
      cloudsMesh.renderOrder = 999;
      cloudsRef.current = cloudsMesh;
      group.add(cloudsMesh);
    }
    
    // ========================================================================
    // ATMÓSFERA SIMPLIFICADA (OPTIMIZADO)
    // ========================================================================
    if (showAtmosphere) {
      // OPTIMIZACIÓN: Reducir segmentos de atmósfera a 64
      const atmosphereGeo = new THREE.SphereGeometry(planetRadius * 1.08, 64, 64);
      const atmosphereMat = new THREE.ShaderMaterial({
        uniforms: {
          uGlowColor: { value: new THREE.Color(0x88ccff) },
          uIntensity: { value: 0.6 }, // Reducir intensidad
          viewVector: { value: new THREE.Vector3(0, 0, 0) }
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying vec3 vNormal;
          varying float intensity;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            
            // Calcular intensidad en el vertex shader (optimización)
            vec3 actualNormal = normalize(normalMatrix * normal);
            intensity = pow(0.6 - dot(actualNormal, viewVector), 2.0);
            vec3 viewDir = normalize(viewVector);
            float intensity_temp = pow(0.6 - dot(vNormal, viewDir), 3.0);
            intensity = intensity_temp;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uGlowColor;
          uniform float uIntensity;
          varying vec3 vNormal;
          varying float intensity;
          
          void main() {
            // Shader simplificado para mejor rendimiento
            vec3 color = uGlowColor * intensity * uIntensity;
            float alpha = intensity * 0.5; // Reducir opacidad
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true
      });
      
      const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
      atmosphereMesh.name = 'EarthAtmosphere';
      atmosphereMesh.position.set(0, planetOffsetY, 0);
      atmosphereMesh.renderOrder = 1000;
      atmosphereRef.current = atmosphereMesh;
      group.add(atmosphereMesh);
    }

    // ========================================================================
    // CONFIGURACIÓN DE REFERENCIAS Y MÉTODOS PÚBLICOS
    // ========================================================================
    planetGroup.current = group;
    
    if (earthRef) {
      earthRef.current = group;
      
      // Método para obtener lat/lng desde coordenadas del mundo
      earthRef.current.getLatLng = (worldPoint) => {
        try {
          const center = new THREE.Vector3(0, planetOffsetY, 0);
          const norm = worldPoint.clone().sub(center).normalize();
          const lat = (Math.asin(THREE.MathUtils.clamp(norm.y, -1, 1)) * 180.0) / Math.PI;
          const lng = (Math.atan2(norm.x, norm.z) * 180.0) / Math.PI;
          return { lat, lng };
        } catch(e) { 
          console.error('Error calculating lat/lng:', e);
          return null; 
        }
      };
      
      // Método para obtener lat/lng desde un evento de puntero
      earthRef.current.getLatLngFromEvent = (event) => {
        if (!event) return null;
        const p = event.point ? event.point.clone() : null;
        return p ? earthRef.current.getLatLng(p) : null;
      };
      
      // Método para obtener los meshes de la Tierra
      earthRef.current.getEarthMesh = () => earthMeshRef.current;
      earthRef.current.getCloudsMesh = () => cloudsRef.current;
      earthRef.current.getAtmosphereMesh = () => atmosphereRef.current;
    }

    // ========================================================================
    // CLEANUP: Liberar recursos al desmontar
    // ========================================================================
    return () => {
      try {
        // Limpiar geometrías y materiales
        group.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.map) child.material.map.dispose();
            if (child.material.normalMap) child.material.normalMap.dispose();
            if (child.material.specularMap) child.material.specularMap.dispose();
            if (child.material.bumpMap) child.material.bumpMap.dispose();
            child.material.dispose();
          }
        });
      } catch(e) {
        console.error('Error disposing Earth resources:', e);
      }
    };
  }, [earthRef, planetRadius, planetOffsetY, showAtmosphere, showClouds, earthTilt, loading, textures]);

  // ============================================================================
  // ANIMACIÓN: Rotación y actualización de shaders con viewVector dinámico
  // ============================================================================
  useFrame((state, delta) => {
    if (paused) return;
    
    // Rotación del planeta
    if (planetGroup.current) {
      planetGroup.current.rotation.y += rotationSpeed * delta;
    }
    
    // Rotación independiente de las nubes (más lenta)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += cloudRotationSpeed * delta;
    }
    
    // Actualizar viewVector de la atmósfera
    if (atmosphereRef.current && state.camera) {
      const mat = atmosphereRef.current.material;
      if (mat.uniforms && mat.uniforms.viewVector) {
        mat.uniforms.viewVector.value = new THREE.Vector3()
          .subVectors(state.camera.position, atmosphereRef.current.position)
          .normalize();
      }
    }
    
    // Auto-rotación de la cámara (opcional)
    if (enableAutoRotate && state.camera) {
      const radius = state.camera.position.length();
      const angle = state.clock.getElapsedTime() * 0.05;
      state.camera.position.x = Math.sin(angle) * radius;
      state.camera.position.z = Math.cos(angle) * radius;
      state.camera.lookAt(0, planetOffsetY, 0);
    }
  });

  // ============================================================================
  // PLACEHOLDER: Mientras cargan las texturas 4K
  // ============================================================================
  if (loading) {
    return (
      <group ref={groupRef}>
        {/* Esfera simple de carga */}
        <mesh position={[0, planetOffsetY, 0]}>
          <sphereGeometry args={[planetRadius, 64, 64]} />
          <meshStandardMaterial 
            color={0x0077be} 
            emissive={0x003366}
            emissiveIntensity={0.3}
            wireframe={false}
          />
        </mesh>
        
        <ambientLight intensity={0.5} />
        <pointLight position={[planetRadius * 2, planetRadius, planetRadius * 2]} intensity={1} />
        
        {/* OPTIMIZACIÓN: Reducir estrellas de 5000 a 2000 */}
        <Stars radius={planetRadius * 50} depth={planetRadius * 10} count={2000} factor={4} saturation={0} fade speed={1} />
      </group>
    );
  }

  // ============================================================================
  // RENDERIZADO: Escena completa con iluminación profesional
  // ============================================================================
  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      {/* Grupo principal del planeta */}
      {planetGroup.current && <primitive object={planetGroup.current} />}
      
      {/* ====== CRÁTERES 3D ====== */}
      {/* 
        🎛️ AJUSTE DE POSICIÓN DE CRÁTERES:
        Para ajustar la profundidad de TODOS los cráteres, modifica el valor por defecto abajo.
        - planetRadius actual: ~6.371 unidades (escala realista 1u = 1000km)
        - Los cráteres deben estar SOBRE la superficie sólida (no dentro ni con la atmósfera)
        - Valores recomendados: entre 0.001 y 0.02
        - Si los cráteres se mezclan con la atmósfera: aumenta el valor (0.01, 0.02, 0.03...)
        - Si los cráteres flotan mucho: reduce el valor (0.001, 0.005...)
        
        ⚠️ IMPORTANTE - SINCRONIZACIÓN CON SIMULACION.JSX:
        El planetOffsetY DEBE coincidir con el valor en simulacion.jsx.
        En simulacion.jsx: planetOffsetY = -0.2 * planetRadius
        Aquí por defecto: planetOffsetY = -0.4
        ¡Asegúrate de pasar el MISMO valor para evitar desalineación!
        
        📊 ORDEN DE RENDERIZADO (de atrás hacia adelante):
        0. Tierra (superficie sólida) - renderOrder: 0
        1. Cráteres (sobre la superficie) - renderOrder: 8-10 + depthOffset positivo
        2. Nubes (capa atmosférica baja) - renderOrder: 999
        3. Atmósfera (glow exterior) - renderOrder: 1000
        
        Los cráteres DEBEN tener renderOrder MENOR que la atmósfera (1000)
        Y depthOffset POSITIVO para elevarse sobre la superficie sólida.
      */}
      {craters && craters.length > 0 && craters.map((c, i) => (
        <Crater
          key={c.id || i}
          localPosition={c.localPosition}
          position={c.position}
          radius={c.radius}
          depth={c.depth}
          planetRadius={planetRadius}
          planetOffsetY={planetOffsetY}
          data={c.data}
          depthOffset={c.depthOffset !== undefined ? c.depthOffset : 0.01}
        />
      ))}
      
      {/* ====== SISTEMA DE ILUMINACIÓN REALISTA ====== */}
      
      {/* Sol: Luz direccional principal (simula el Sol) */}
      <directionalLight 
        position={[500, 200, 500]} 
        intensity={1.5} 
        color={0xfff8e7} // Blanco cálido ligeramente amarillento
        castShadow 
      />
      
      {/* Luz ambiente tenue (iluminación global mínima) */}
      <ambientLight intensity={0.15} color={0xffffff} />
      
      {/* Luz hemisférica (cielo vs tierra) */}
      <hemisphereLight 
        skyColor={0xffffff} // Arriba: blanco brillante
        groundColor={0x080820} // Abajo: azul muy oscuro
        intensity={0.3} 
      />
      
      {/* Luz de relleno suave (simula luz reflejada) */}
      <pointLight 
        position={[-300, 100, -200]} 
        intensity={0.2} 
        color={0x4466ff} // Azul tenue
        distance={1000}
      />
      
      {/* Luz adicional para resaltar detalles */}
      <spotLight
        position={[200, 400, 300]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.4}
        color={0xffffff}
        castShadow={false}
      />
      
      {/* ====== CONTROLES DE ÓRBITA (OPTIMIZADO) ====== */}
      <OrbitControls 
        enableZoom={true}
        minDistance={planetRadius * 1.5}
        maxDistance={planetRadius * 5}
        enableDamping={true}
        dampingFactor={0.08} // Menos suave = menos cálculos
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        autoRotate={enableAutoRotate}
        autoRotateSpeed={0.5}
        target={[0, planetOffsetY, 0]}
        enablePan={false} // Desactivar pan para simplificar
      />
      
      {/* ====== FONDO ESTELAR (OPTIMIZADO) ====== */}
      <Stars 
        radius={planetRadius * 50}
        depth={planetRadius * 10} 
        count={3000} // Reducido de 12,000 a 3,000 estrellas
        factor={4} 
        saturation={0}
        fade={true}
        speed={0.3}
      />
    </group>
  );
}