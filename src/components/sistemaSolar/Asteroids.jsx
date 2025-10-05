import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Componente que renderiza un asteroide individual
 */
function AsteroidMesh({ asteroid, index }) {
  const meshRef = useRef();
  
  // Parámetros orbitales
  const { distance, speed, angle, size, isPotentiallyHazardous } = useMemo(() => {
    // Distancia mapeada a escala visual (entre la Tierra y Marte generalmente)
    const mappedDistance = 4 + (asteroid.distance * 2); // Entre 4 y ~8 AU visual
    
    // Velocidad orbital (más rápido si está más cerca)
    const orbitalSpeed = 0.3 / Math.sqrt(asteroid.distance);
    
    // Ángulo inicial aleatorio pero determinístico
    const initialAngle = (index * 137.5 * Math.PI / 180) % (Math.PI * 2);
    
    return {
      distance: mappedDistance,
      speed: orbitalSpeed,
      angle: initialAngle,
      size: asteroid.visualSize,
      isPotentiallyHazardous: asteroid.isPotentiallyHazardous
    };
  }, [asteroid, index]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed + angle;
      const inclination = asteroid.orbitalData.inclination;
      
      meshRef.current.position.x = Math.cos(t) * distance;
      meshRef.current.position.z = Math.sin(t) * distance;
      meshRef.current.position.y = Math.sin(t * 2) * inclination;
      
      // Rotación del asteroide
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} name={asteroid.name}>
        {/* Forma irregular del asteroide (icosaedro para simular irregularidad) */}
        <icosahedronGeometry args={[size * 1.5, 1]} />
        <meshStandardMaterial 
          color={isPotentiallyHazardous ? '#ff3333' : '#ffcc00'}
          emissive={isPotentiallyHazardous ? '#ff0000' : '#ffaa00'}
          emissiveIntensity={0.4}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Halo brillante para hacerlos más visibles */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial 
          color={isPotentiallyHazardous ? '#ff6600' : '#ffdd44'} 
          transparent 
          opacity={0.25} 
        />
      </mesh>
      
      {/* Indicador visual extra para asteroides peligrosos */}
      {isPotentiallyHazardous && (
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <sphereGeometry args={[size * 2.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Componente principal que renderiza todos los asteroides
 */
export default function Asteroids({ asteroids = [] }) {
  // Limitar a los primeros 50 asteroides para rendimiento
  const displayAsteroids = useMemo(() => {
    return asteroids.slice(0, 50);
  }, [asteroids]);

  if (displayAsteroids.length === 0) {
    return null;
  }

  return (
    <group name="Asteroides">
      {displayAsteroids.map((asteroid, index) => (
        <AsteroidMesh 
          key={asteroid.id} 
          asteroid={asteroid} 
          index={index}
        />
      ))}
    </group>
  );
}

/**
 * Componente de cinturón de asteroides (decorativo)
 */
export function AsteroidBelt({ count = 200, innerRadius = 8, outerRadius = 10 }) {
  const meshes = useMemo(() => {
    const temp = [];
    const colors = ['#ffcc00', '#ffaa00', '#ff9900', '#ccaa77', '#998866', '#887766'];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const size = 0.03 + Math.random() * 0.08;
      const height = (Math.random() - 0.5) * 0.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      temp.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        size,
        color,
        speed: 0.05 + Math.random() * 0.1
      });
    }
    return temp;
  }, [count, innerRadius, outerRadius]);

  return (
    <group name="CinturonAsteroides">
      {meshes.map((props, i) => (
        <mesh key={i} position={props.position}>
          <sphereGeometry args={[props.size, 8, 8]} />
          <meshStandardMaterial 
            color={props.color} 
            emissive={props.color}
            emissiveIntensity={0.2}
            roughness={0.8} 
            metalness={0.1} 
          />
        </mesh>
      ))}
    </group>
  );
}
