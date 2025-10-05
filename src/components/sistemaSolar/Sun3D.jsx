import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import solMap from '../../assets/sol.jpg';

function SunMesh() {
  const group = useRef();
  const texture = useLoader(THREE.TextureLoader, solMap);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += 0.1 * delta;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial map={texture} emissive={new THREE.Color(0xffb347)} emissiveIntensity={0.9} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* subtle outer glow */}
      <mesh>
        <sphereGeometry args={[1.85, 64, 64]} />
        <meshBasicMaterial color={'#ffbb66'} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

const Sun3D = ({ className = 'w-full h-96' }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.45} />
        <pointLight color={'#ffdba3'} intensity={1.5} position={[5, 5, 5]} />
        <SunMesh />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default Sun3D;
