import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// HOOK PERSONALIZADO: Carga de texturas reales de la NASA (opcional)
// ============================================================================
function useEarthTextures(useRealTextures = false) {
  const [textures, setTextures] = useState({});
  const [loading, setLoading] = useState(useRealTextures);

  useEffect(() => {
    if (!useRealTextures) {
      setLoading(false);
      return;
    }

    const loadTextures = async () => {
      try {
        const loader = new THREE.TextureLoader();
        
        console.log('🌍 Cargando texturas de la NASA...');
        
        // Texturas de alta calidad de la NASA
        const [dayTexture, nightTexture, normalTexture, cloudsTexture] = await Promise.all([
          loader.loadAsync(
            'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg'
          ).catch(() => null),
          loader.loadAsync(
            'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg'
          ).catch(() => null),
          loader.loadAsync(
            'https://assets.cesium.com/29873/20200426T025716/1_World_Normal_20200426.jpg'
          ).catch(() => null),
          loader.loadAsync(
            'https://assets.cesium.com/29873/20200426T025716/1_World_Clouds_20200426.jpg'
          ).catch(() => null)
        ]);

        if (dayTexture) {
          dayTexture.wrapS = dayTexture.wrapT = THREE.RepeatWrapping;
          nightTexture && (nightTexture.wrapS = nightTexture.wrapT = THREE.RepeatWrapping);
          normalTexture && (normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping);
          cloudsTexture && (cloudsTexture.wrapS = cloudsTexture.wrapT = THREE.RepeatWrapping);
          
          console.log('✅ Texturas cargadas exitosamente');
        }

        setTextures({
          day: dayTexture,
          night: nightTexture,
          normal: normalTexture,
          clouds: cloudsTexture
        });
        setLoading(false);
      } catch (error) {
        console.error('⚠️ Error cargando texturas, usando modo procedimental:', error);
        setLoading(false);
      }
    };

    loadTextures();
  }, [useRealTextures]);

  return { textures, loading };
}

// ============================================================================
// MODELO 3D ULTRA-REALISTA DE LA TIERRA
// ============================================================================
// Sistema híbrido: Texturas NASA + Generación procedimental
// Iluminación realista, múltiples capas, rotación auténtica
// ============================================================================

export default function Earth3D({ 
  earthRef, 
  planetRadius = 100, // Radio en unidades Three.js (100 = escala realista)
  planetOffsetY = -0.4, 
  paused = false, 
  onPointerDown, 
  craters = [],
  // Configuración avanzada
  useRealTextures = false, // NUEVO: Usar texturas reales de la NASA
  showAtmosphere = true,
  showClouds = true,
  earthTilt = 23.5, // Inclinación axial real de la Tierra
  rotationSpeed = 0.01, // Velocidad de rotación (ajustable)
  cloudRotationSpeed = 0.008, // Nubes rotan más lento
  enableAutoRotate = false
}) {
  const groupRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const earthMeshRef = useRef();
  
  // Cargar texturas reales (opcional)
  const { textures, loading } = useEarthTextures(useRealTextures);

  // ============================================================================
  // CONSTRUCCIÓN DEL PLANETA TIERRA - SISTEMA HÍBRIDO
  // ============================================================================
  const planetGroup = useRef();
  
  useEffect(() => {
    if (loading) return; // Esperar a que las texturas carguen
    
    const group = new THREE.Group();
    
    // Aplicar inclinación axial de la Tierra (23.5°)
    group.rotation.z = (earthTilt * Math.PI) / 180;
    
    // ========================================================================
    // MODO 1: TEXTURAS REALES DE LA NASA
    // ========================================================================
    if (useRealTextures && textures.day) {
      console.log('🌍 Renderizando con texturas NASA');
      
      // Geometría de alta calidad
      const earthGeo = new THREE.SphereGeometry(planetRadius, 256, 256);
      
      // Material con todas las texturas NASA
      const earthMat = new THREE.MeshPhongMaterial({
        map: textures.day, // Color diurno
        specularMap: textures.night, // Luces nocturnas como specular
        specular: new THREE.Color(0x333333),
        shininess: 10,
        normalMap: textures.normal, // Normal map para relieve
        normalScale: new THREE.Vector2(0.85, 0.85), // Intensidad del relieve
        bumpMap: textures.normal, // Usar también como bump map
        bumpScale: 0.02
      });
      
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      earthMesh.position.set(0, planetOffsetY, 0);
      earthMesh.name = 'EarthNASA';
      earthMeshRef.current = earthMesh;
      group.add(earthMesh);
      
      // Nubes con textura real
      if (showClouds && textures.clouds) {
        const cloudsGeo = new THREE.SphereGeometry(planetRadius * 1.01, 128, 128);
        const cloudsMat = new THREE.MeshPhongMaterial({
          map: textures.clouds,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        
        const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        cloudsMesh.name = 'CloudsNASA';
        cloudsMesh.position.set(0, planetOffsetY, 0);
        cloudsMesh.renderOrder = 999;
        cloudsRef.current = cloudsMesh;
        group.add(cloudsMesh);
      }
    } 
    // ========================================================================
    // MODO 2: GENERACIÓN PROCEDIMENTAL (fallback o predeterminado)
    // ========================================================================
    else {
      console.log('🎨 Renderizando con generación procedimental');
      
      // ====================================================================
      // FUNCIONES DE RUIDO PROCEDIMENTAL MEJORADAS
      // ====================================================================
    
      // Ruido 3D de alta calidad (Perlin-like)
      const noise3D = (x, y, z, seed = 0) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      
      // Smoothstep para interpolación suave
      const u = x * x * x * (x * (x * 6 - 15) + 10);
      const v = y * y * y * (y * (y * 6 - 15) + 10);
      const w = z * z * z * (z * (z * 6 - 15) + 10);
      
      const hash = (i, j, k) => {
        return Math.abs(Math.sin((i * 127.1 + j * 311.7 + k * 74.7 + seed) * 43758.5453) % 1);
      };
      
      const a = hash(X, Y, Z);
      const b = hash(X + 1, Y, Z);
      const c = hash(X, Y + 1, Z);
      const d = hash(X + 1, Y + 1, Z);
      const e = hash(X, Y, Z + 1);
      const f = hash(X + 1, Y, Z + 1);
      const g = hash(X, Y + 1, Z + 1);
      const h = hash(X + 1, Y + 1, Z + 1);
      
      const k0 = a + u * (b - a);
      const k1 = c + u * (d - c);
      const k2 = e + u * (f - e);
      const k3 = g + u * (h - g);
      const k4 = k0 + v * (k1 - k0);
      const k5 = k2 + v * (k3 - k2);
      
      return k4 + w * (k5 - k4);
    };

    // FBM (Fractal Brownian Motion) de 8 octavas para máximo detalle
    const fbm = (x, y, z, octaves = 8) => {
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxValue = 0;
      
      for (let i = 0; i < octaves; i++) {
        value += noise3D(x * frequency, y * frequency, z * frequency, i) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.1; // Lacunaridad ligeramente mayor para más detalle
      }
      
      return value / maxValue;
    };
    
    // ========================================================================
    // CAPA 1: OCÉANOS (Base azul brillante)
    // ========================================================================
    const oceanGeo = new THREE.SphereGeometry(planetRadius, 256, 256);
    const oceanMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a4d8c, // Azul océano profundo
      metalness: 0.4, // Agua tiene cierta reflectividad
      roughness: 0.1, // Océanos son muy suaves
      emissive: 0x001a33,
      emissiveIntensity: 0.05
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(0, planetOffsetY, 0);
    oceanMesh.name = 'EarthOcean';
    group.add(oceanMesh);

    // ========================================================================
    // CAPA 2: CONTINENTES con Bump Mapping y Color Mapping
    // ========================================================================
    const landGeo = new THREE.SphereGeometry(planetRadius, 512, 512); // Alta resolución
    const pos = landGeo.attributes.position;
    const colors = [];
    const v = new THREE.Vector3();
    
    // Arrays para simular bump/normal maps
    const bumpData = [];
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const vNorm = v.clone().normalize();
      
      // Latitud y longitud para variación geográfica realista
      const lat = Math.asin(vNorm.y);
      const lng = Math.atan2(vNorm.x, vNorm.z);
      
      // Múltiples capas de ruido para terreno complejo
      const continentalScale = fbm(vNorm.x * 1.2, vNorm.y * 1.2, vNorm.z * 1.2, 4);
      const mountainScale = fbm(vNorm.x * 8, vNorm.y * 8, vNorm.z * 8, 6);
      const detailScale = fbm(vNorm.x * 20, vNorm.y * 20, vNorm.z * 20, 8);
      
      // Combinar escalas para elevación final
      const elevation = continentalScale * 0.6 + mountainScale * 0.3 + detailScale * 0.1;
      
      // Umbral tierra/agua más realista
      const isLand = elevation > 0.48;
      
      if (isLand) {
        // ====================================================================
        // SISTEMA DE COLORIZACIÓN GEOGRÁFICA REALISTA
        // ====================================================================
        const terrainHeight = elevation - 0.48;
        const heightFactor = 1 + terrainHeight * 0.015; // Bump sutil pero visible
        
        // Aplicar bump map (relieve)
        pos.setXYZ(i, v.x * heightFactor, v.y * heightFactor, v.z * heightFactor);
        bumpData.push(terrainHeight);
        
        // Variación por latitud (zonas climáticas)
        const absLat = Math.abs(lat);
        const isPolar = absLat > 1.3; // >75° Norte/Sur
        const isTemperate = absLat > 0.7 && absLat <= 1.3; // 40-75°
        const isTropical = absLat <= 0.7; // 0-40°
        
        let r, g, b;
        
        if (isPolar) {
          // ====== REGIONES POLARES: Hielo y tundra ======
          r = 0.85 + terrainHeight * 0.15;
          g = 0.90 + terrainHeight * 0.1;
          b = 0.95;
        } else if (terrainHeight > 0.3) {
          // ====== MONTAÑAS ALTAS: Rocas y nieve ======
          const snowLine = terrainHeight > 0.4 ? 1 : 0;
          r = 0.5 + snowLine * 0.4 + detailScale * 0.1;
          g = 0.45 + snowLine * 0.45 + detailScale * 0.1;
          b = 0.4 + snowLine * 0.55;
        } else if (isTemperate) {
          // ====== ZONAS TEMPLADAS: Bosques, praderas ======
          const forestDensity = detailScale;
          r = 0.25 + forestDensity * 0.3 + terrainHeight * 0.2;
          g = 0.45 + forestDensity * 0.2 + terrainHeight * 0.1;
          b = 0.15 + forestDensity * 0.1;
        } else if (isTropical) {
          // ====== ZONAS TROPICALES: Selvas, desiertos, sabanas ======
          const humidity = noise3D(vNorm.x * 15, vNorm.y * 15, vNorm.z * 15, 99);
          
          if (humidity > 0.6) {
            // Selva tropical (verde intenso)
            r = 0.1 + detailScale * 0.15;
            g = 0.4 + detailScale * 0.2;
            b = 0.1;
          } else if (humidity < 0.35) {
            // Desierto (arena, beige)
            r = 0.76 + detailScale * 0.1;
            g = 0.7 + detailScale * 0.05;
            b = 0.5 + detailScale * 0.1;
          } else {
            // Sabana (verde-amarillento)
            r = 0.55 + detailScale * 0.2;
            g = 0.6 + detailScale * 0.15;
            b = 0.3;
          }
        } else {
          // ====== TIERRAS BAJAS COSTERAS ======
          r = 0.35 + terrainHeight + detailScale * 0.1;
          g = 0.5 + terrainHeight * 0.5;
          b = 0.25;
        }
        
        // Variación por detalle fino
        r += (detailScale - 0.5) * 0.05;
        g += (detailScale - 0.5) * 0.05;
        b += (detailScale - 0.5) * 0.05;
        
        // Clamp valores
        r = Math.max(0, Math.min(1, r));
        g = Math.max(0, Math.min(1, g));
        b = Math.max(0, Math.min(1, b));
        
        colors.push(r, g, b);
      } else {
        // ====== OCÉANOS: Mantener superficie base ======
        pos.setXYZ(i, v.x, v.y, v.z);
        bumpData.push(0);
        
        // Variación de color oceánico (profundidad simulada)
        const depth = 0.48 - elevation;
        const oceanBlue = 0.3 + depth * 0.4;
        colors.push(0, oceanBlue * 0.8, oceanBlue);
      }
    }
    
    landGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    landGeo.computeVertexNormals(); // Normal map automático
    
    const landMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true,
      metalness: 0.02, // Tierra es muy mate
      roughness: 0.9, // Alta rugosidad para continentes
      flatShading: false,
      transparent: false
    });
    
    const landMesh = new THREE.Mesh(landGeo, landMat);
    landMesh.position.set(0, planetOffsetY, 0);
    landMesh.name = 'EarthLand';
    group.add(landMesh);

    // ========================================================================
    // CAPA 3: NUBES con Alpha Mapping y rotación independiente
    // ========================================================================
    if (showClouds) {
      const cloudsGeo = new THREE.SphereGeometry(planetRadius * 1.012, 256, 256);
      const cloudsMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.65 }
        },
        vertexShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          varying vec2 vUv;
          
          void main() {
            vPos = normalize(position);
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          varying vec2 vUv;
          uniform float uTime;
          uniform float uOpacity;
          
          // ============ FUNCIONES DE RUIDO PARA NUBES ============
          
          float hash(vec3 p) {
            return fract(sin(dot(p, vec3(17.1, 113.5, 41.3))) * 43758.5453);
          }
          
          float noise3D(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            
            // Quintic interpolation
            f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
            
            float n = mix(
              mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                  mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                  mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
              f.z
            );
            return n;
          }
          
          // FBM de 6 octavas para nubes detalladas
          float fbm(vec3 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            
            for(int i = 0; i < 6; i++) {
              value += amplitude * noise3D(p * frequency);
              frequency *= 2.3;
              amplitude *= 0.4;
            }
            return value;
          }
          
          // Patrón de nubes tipo cúmulo
          float cloudPattern(vec3 p) {
            float clouds = fbm(p * 2.5);
            float detail = fbm(p * 8.0);
            
            // Combinar escalas
            clouds = clouds * 0.7 + detail * 0.3;
            
            // Turbulencia adicional
            float turb = fbm(p * 15.0 + vec3(uTime * 0.1));
            clouds += turb * 0.1;
            
            return clouds;
          }
          
          void main() {
            // Coordenadas esféricas con deriva lenta
            vec3 p = vPos * 3.0;
            p.x += uTime * 0.03; // Deriva este-oeste
            p.y += sin(uTime * 0.02) * 0.1; // Ligera oscilación
            
            // Generar patrón de nubes
            float clouds = cloudPattern(p);
            
            // Suavizar bordes (más nubes en ecuador, menos en polos)
            float latitudeFactor = 1.0 - abs(vPos.y) * 0.3;
            clouds *= latitudeFactor;
            
            // Threshold y suavizado
            clouds = smoothstep(0.4, 0.7, clouds);
            
            // Efecto fresnel (nubes más visibles en los bordes)
            vec3 viewDir = normalize(cameraPosition - vPos);
            float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 1.5);
            float edgeFade = mix(1.0, 0.6, fresnel);
            
            // Descartar fragmentos muy transparentes
            if (clouds < 0.08) discard;
            
            // Color blanco puro para nubes
            vec3 cloudColor = vec3(1.0);
            
            // Sombras sutiles en nubes densas
            float shadow = smoothstep(0.5, 0.8, clouds) * 0.15;
            cloudColor -= vec3(shadow);
            
            // Opacidad final con variación
            float alpha = clouds * uOpacity * edgeFade;
            
            gl_FragColor = vec4(cloudColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
      });
      
      const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
      cloudsMesh.name = 'EarthClouds';
      cloudsMesh.position.set(0, planetOffsetY, 0);
      cloudsMesh.renderOrder = 999;
      cloudsRef.current = cloudsMesh;
      group.add(cloudsMesh);
      }
    } // FIN del bloque else (generación procedimental)
    
    // ========================================================================
    // CAPA 4: ATMÓSFERA (Rayleigh Scattering - Glow azul mejorado)
    // Con viewVector dinámico inspirado en el código NASA
    // ========================================================================
    if (showAtmosphere) {
      const atmosphereGeo = new THREE.SphereGeometry(planetRadius * 1.08, 128, 128);
      const atmosphereMat = new THREE.ShaderMaterial({
        uniforms: {
          uGlowColor: { value: new THREE.Color(0x88ccff) },
          uIntensity: { value: 0.7 },
          viewVector: { value: new THREE.Vector3(0, 0, 0) } // NUEVO: viewVector dinámico
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float intensity;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            
            // Calcular intensidad en el vertex shader (optimización)
            vec3 actualNormal = normalize(normalMatrix * normal);
            intensity = pow(0.6 - dot(actualNormal, viewVector), 2.0);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uGlowColor;
          uniform float uIntensity;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float intensity;
          
          void main() {
            // Efecto fresnel combinado con viewVector
            vec3 viewDir = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 4.0);
            
            // Combinar ambas intensidades
            float finalIntensity = mix(intensity, fresnel, 0.5) * uIntensity;
            
            // Color azul atmosférico con gradiente
            vec3 color = uGlowColor * finalIntensity;
            
            // Opacidad gradiente mejorada
            float alpha = finalIntensity * 0.65;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
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
      
      // Método para obtener el mesh de la Tierra
      earthRef.current.getEarthMesh = () => landMesh;
      earthRef.current.getOceanMesh = () => oceanMesh;
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
  }, [earthRef, planetRadius, planetOffsetY, showAtmosphere, showClouds, earthTilt, loading, useRealTextures, textures]);

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
      
      // Actualizar uniform de tiempo para animación de nubes (solo modo procedimental)
      const mat = cloudsRef.current.material;
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value += delta;
      }
    }
    
    // Actualizar viewVector de la atmósfera (inspirado en código NASA)
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
  // PLACEHOLDER: Mientras cargan las texturas de la NASA
  // ============================================================================
  if (loading && useRealTextures) {
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
        
        {/* Texto de carga (opcional, usando sprite) */}
        <ambientLight intensity={0.5} />
        <pointLight position={[planetRadius * 2, planetRadius, planetRadius * 2]} intensity={1} />
        
        <Stars radius={planetRadius * 50} depth={planetRadius * 10} count={5000} factor={4} saturation={0} fade speed={1} />
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
      
      {/* ====== CONTROLES DE ÓRBITA ====== */}
      <OrbitControls 
        enableZoom={true}
        minDistance={planetRadius * 1.5} // Zoom mínimo: 150 unidades
        maxDistance={planetRadius * 5} // Zoom máximo: 500 unidades
        enableDamping={true} // Smooth damping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        autoRotate={enableAutoRotate}
        autoRotateSpeed={0.5}
        target={[0, planetOffsetY, 0]}
      />
      
      {/* ====== FONDO ESTELAR ====== */}
      <Stars 
        radius={planetRadius * 50} // Campo estelar muy amplio
        depth={planetRadius * 10} 
        count={12000} // 12,000 estrellas
        factor={5} 
        saturation={0} // Estrellas blancas
        fade={true}
        speed={0.3}
      />
    </group>
  );
}