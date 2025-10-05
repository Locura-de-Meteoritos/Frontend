import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import mercurioMap from '../../assets/mercurio.jpg';
import venusMap from '../../assets/venus.jpg';
import tierraMap from '../../assets/8081_earthmap4k.jpg';
import lunaMap from '../../assets/luna.jpg';
import marteMap from '../../assets/marte.jpg';
import jupiterMap from '../../assets/jupiter.jpg';
import saturnoMap from '../../assets/saturno.jpg';
import uranoMap from '../../assets/urano.jpg';
import neptunoMap from '../../assets/neptuno.jpg';

// Componente individual de planeta
function PlanetMesh({ textureMap, size, distance, speed, inclination = 0, name, eccentricity = 0 }) {
  const meshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, textureMap);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      
      // Órbita elíptica: r = a(1 - e²) / (1 + e*cos(θ))
      const a = distance; // Semi-eje mayor
      const e = eccentricity; // Excentricidad
      const theta = t;
      const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
      
      meshRef.current.position.x = Math.cos(theta) * r;
      meshRef.current.position.z = Math.sin(theta) * r * Math.cos(inclination);
      meshRef.current.rotation.y += 0.01 + speed * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} name={name}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        map={texture} 
        metalness={0.2} 
        roughness={0.6}
        emissive={'#333333'}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

// Tierra con ref exportado para la Luna
export function Earth({ forwardedRef }) {
  const texture = useLoader(THREE.TextureLoader, tierraMap);

  useFrame(({ clock }) => {
    if (forwardedRef.current) {
      const t = clock.getElapsedTime() * 1.0;
      
      // Órbita elíptica de la Tierra (excentricidad real: 0.0167)
      const a = 9.5; // Distancia aumentada
      const e = 0.017; // Excentricidad muy leve (casi circular)
      const theta = t;
      const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
      
      forwardedRef.current.position.x = Math.cos(theta) * r;
      forwardedRef.current.position.z = Math.sin(theta) * r;
      forwardedRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={forwardedRef} name="Tierra">
      <sphereGeometry args={[0.45, 32, 32]} />
      <meshStandardMaterial 
        map={texture} 
        metalness={0.2} 
        roughness={0.6}
        emissive={'#1a4d7a'}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

// Luna que orbita la Tierra
export function Moon({ earthRef }) {
  const meshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, lunaMap);

  useFrame(({ clock }) => {
    if (earthRef.current && meshRef.current) {
      const t = clock.getElapsedTime() * 1.2;
      const distance = 0.7;
      meshRef.current.position.x = earthRef.current.position.x + Math.cos(t) * distance;
      meshRef.current.position.z = earthRef.current.position.z + Math.sin(t) * distance;
      meshRef.current.position.y = Math.sin(t) * 0.05;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} name="Luna">
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial 
        map={texture}
        metalness={0.1} 
        roughness={0.7}
        emissive={'#888888'}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Componente principal que renderiza todos los planetas
export default function Planets({ earthRef }) {
  return (
    <group name="Planetas">
      {/* Mercurio - el más pequeño y cercano al Sol */}
      <PlanetMesh 
        name="Mercurio"
        textureMap={mercurioMap} 
        size={0.18} 
        distance={5.0}  // Más alejado del Sol
        speed={1.6} 
        eccentricity={0.206}  // Órbita muy elíptica
      />
      
      {/* Venus - órbita casi circular */}
      <PlanetMesh 
        name="Venus"
        textureMap={venusMap} 
        size={0.44} 
        distance={7.2}  // Más separado
        speed={1.2} 
        eccentricity={0.007}  // Casi circular
      />
      
      {/* Tierra - referencia base */}
      <Earth forwardedRef={earthRef} />
      
      {/* Marte - planeta rojo */}
      <PlanetMesh 
        name="Marte"
        textureMap={marteMap} 
        size={0.25} 
        distance={11.5}  // Más alejado
        speed={0.8} 
        eccentricity={0.093}  // Órbita moderadamente elíptica
      />
      
      {/* Júpiter - el gigante gaseoso más grande */}
      <PlanetMesh 
        name="Júpiter"
        textureMap={jupiterMap} 
        size={1.8} 
        distance={18.0}  // Mucho más alejado
        speed={0.4} 
        eccentricity={0.048}  // Ligeramente elíptica
      />
      
      {/* Saturno - segundo más grande con anillos */}
      <PlanetMesh 
        name="Saturno"
        textureMap={saturnoMap} 
        size={1.5} 
        distance={24.0}  // Muy alejado
        speed={0.32} 
        eccentricity={0.056}  // Órbita elíptica
      />
      
      {/* Urano - gigante de hielo inclinado */}
      <PlanetMesh 
        name="Urano"
        textureMap={uranoMap} 
        size={0.9} 
        distance={30.0}  // Extremadamente alejado
        speed={0.22} 
        eccentricity={0.047}  // Ligeramente elíptica
        inclination={0.013}  // Pequeña inclinación
      />
      
      {/* Neptuno - el más lejano */}
      <PlanetMesh 
        name="Neptuno"
        textureMap={neptunoMap} 
        size={0.88} 
        distance={36.0}  // El más lejano
        speed={0.18} 
        eccentricity={0.009}  // Casi circular
        inclination={0.031}  // Inclinación orbital
      />
      
      {/* Luna orbitando la Tierra */}
      <Moon earthRef={earthRef} />
    </group>
  );
}
