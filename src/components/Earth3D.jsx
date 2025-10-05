import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Versión react-three-fiber procedimental sin texturas externas
export default function Earth3D({ earthRef, planetRadius = 2, planetOffsetY = -0.4, paused=false, onPointerDown, craters=[] }) {
  const groupRef = useRef();
  const cloudsRef = useRef();

  // Construir geometrías y materiales una sola vez
  const planetGroup = useRef();
  useEffect(() => {
    const group = new THREE.Group();
    
    // Función de ruido procedimental mejorada
    const noise3D = (x, y, z, seed = 0) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      const u = x * x * (3 - 2 * x);
      const v = y * y * (3 - 2 * y);
      const w = z * z * (3 - 2 * z);
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

    // FBM (Fractal Brownian Motion) para terreno realista
    const fbm = (x, y, z, octaves = 6) => {
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxValue = 0;
      for (let i = 0; i < octaves; i++) {
        value += noise3D(x * frequency, y * frequency, z * frequency, i) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      return value / maxValue;
    };

    // Océano base (esfera lisa y brillante)
    const oceanGeo = new THREE.SphereGeometry(planetRadius, 128, 128);
    const oceanMat = new THREE.MeshStandardMaterial({ 
      color: 0x0077be, // Azul océano más vibrante
      metalness: 0.3, 
      roughness: 0.2,
      emissive: 0x001a33,
      emissiveIntensity: 0.1
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(0, planetOffsetY, 0);
    group.add(oceanMesh);

    // Continentes con relieve detallado y colores variados
    const landGeo = new THREE.SphereGeometry(planetRadius, 256, 256);
    const pos = landGeo.attributes.position;
    const colors = [];
    const v = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const vNorm = v.clone().normalize();
      
      // Generar mapa de elevación usando FBM
      const elevation = fbm(vNorm.x * 2.5, vNorm.y * 2.5, vNorm.z * 2.5, 6);
      
      // Definir umbrales para tierra y agua
      const isLand = elevation > 0.45;
      
      if (isLand) {
        // Calcular altura del terreno (relieve)
        const terrainHeight = (elevation - 0.45) * 0.08; // Relieve más pronunciado
        const heightFactor = 1 + terrainHeight;
        
        // Aplicar desplazamiento
        pos.setXYZ(i, v.x * heightFactor, v.y * heightFactor, v.z * heightFactor);
        
        // Colores variados para el terreno (verde, marrón, beige)
        const heightVariation = elevation - 0.45;
        let r, g, b;
        
        if (heightVariation < 0.1) {
          // Costa / tierras bajas - verde
          r = 0.3 + heightVariation * 2;
          g = 0.5 + heightVariation;
          b = 0.2;
        } else if (heightVariation < 0.25) {
          // Tierras medias - verde/marrón
          r = 0.45 + heightVariation;
          g = 0.5 + heightVariation * 0.5;
          b = 0.25;
        } else {
          // Montañas - gris/marrón
          r = 0.6 + heightVariation * 0.4;
          g = 0.55 + heightVariation * 0.3;
          b = 0.5 + heightVariation * 0.2;
        }
        
        colors.push(r, g, b);
      } else {
        // Mantener en la superficie del océano (sin relieve)
        pos.setXYZ(i, v.x, v.y, v.z);
        // Color azul oceánico (será transparente)
        colors.push(0, 0.3, 0.6);
      }
    }
    
    landGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    landGeo.computeVertexNormals();
    
    const landMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true,
      metalness: 0.05, 
      roughness: 0.85,
      transparent: true,
      opacity: 1,
      alphaTest: 0.1
    });
    
    const landMesh = new THREE.Mesh(landGeo, landMat);
    landMesh.position.set(0, planetOffsetY, 0);
    group.add(landMesh);

    // Nubes procedurales realistas con shader mejorado
    const cloudsGeo = new THREE.SphereGeometry(planetRadius * 1.02, 128, 128);
    const cloudsMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.7 }
      },
      vertexShader: `
        varying vec3 vPos;
        varying vec3 vNormal;
        void main() {
          vPos = normalize(position);
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        varying vec3 vNormal;
        uniform float uTime;
        uniform float uOpacity;
        
        // Hash function para ruido
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(17.1, 113.5, 41.3))) * 43758.5453);
        }
        
        // Ruido 3D
        float noise3D(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float n = mix(
            mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
            f.z
          );
          return n;
        }
        
        // FBM para nubes realistas
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for(int i = 0; i < 5; i++) {
            value += amplitude * noise3D(p * frequency);
            frequency *= 2.1;
            amplitude *= 0.45;
          }
          return value;
        }
        
        void main() {
          // Coordenadas con movimiento lento
          vec3 p = vPos * 3.5;
          p.xy += uTime * 0.05; // Movimiento más lento y realista
          
          // Generar patrón de nubes
          float clouds = fbm(p);
          
          // Patrón secundario para más detalle
          float detail = fbm(p * 2.3 + vec3(uTime * 0.03));
          clouds = clouds * 0.7 + detail * 0.3;
          
          // Suavizar bordes y crear variación
          clouds = smoothstep(0.35, 0.75, clouds);
          
          // Efecto de borde difuso (más transparente en los bordes)
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);
          float edgeFade = 1.0 - fresnel * 0.3;
          
          // Descartar fragmentos muy transparentes
          if (clouds < 0.05) discard;
          
          // Color blanco brillante para las nubes
          vec3 cloudColor = vec3(1.0, 1.0, 1.0);
          
          // Aplicar opacidad con variación
          float alpha = clouds * uOpacity * edgeFade;
          
          gl_FragColor = vec4(cloudColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    cloudsMesh.name = 'EarthClouds';
    cloudsMesh.position.set(0, planetOffsetY, 0);
    cloudsMesh.renderOrder = 999;
    cloudsRef.current = cloudsMesh;
    group.add(cloudsMesh);

    planetGroup.current = group;
    if (earthRef) {
      earthRef.current = group;
      earthRef.current.getLatLng = (worldPoint) => {
        try {
          const center = new THREE.Vector3(0, planetOffsetY, 0);
          const norm = worldPoint.clone().sub(center).normalize();
          const lat = (Math.asin(THREE.MathUtils.clamp(norm.y, -1,1))*180.0)/Math.PI;
          const lng = (Math.atan2(norm.x, norm.z)*180.0)/Math.PI;
          return { lat, lng };
        } catch(e){ return null; }
      };
      earthRef.current.getLatLngFromEvent = (event) => {
        if (!event) return null; const p = event.point ? event.point.clone() : null; return p ? earthRef.current.getLatLng(p) : null;
      };
    }

    return () => {
      // dispose
      [oceanGeo, landGeo, cloudsGeo].forEach(g=>{ try{ g.dispose(); }catch(e){} });
      [oceanMat, landMat, cloudsMat].forEach(m=>{ try{ m.dispose(); }catch(e){} });
    };
  }, [earthRef, planetRadius, planetOffsetY]);

  useFrame((_, delta) => {
    if (paused) return;
    if (planetGroup.current) planetGroup.current.rotation.y += 0.05 * delta; // Rotación más lenta
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.08 * delta; // Nubes rotan un poco más rápido
      const mat = cloudsRef.current.material;
      if (mat.uniforms && mat.uniforms.uTime) mat.uniforms.uTime.value += delta;
    }
  });

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      {planetGroup.current && <primitive object={planetGroup.current} />}
      <ambientLight intensity={0.4} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} castShadow />
      <pointLight position={[-10, 5, -5]} intensity={0.3} color={0xffffff} />
      <OrbitControls enableZoom />
      <Stars radius={300} depth={60} count={8000} factor={6} saturation={0} fade speed={1} />
    </group>
  );
}