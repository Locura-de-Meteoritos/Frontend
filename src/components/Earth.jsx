import { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import earthTexture from '../assets/earth.jpg';

export default function Earth() {
  const texture = useLoader(TextureLoader, earthTexture);
  const mesh = useRef();

  // rotación suave automática
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += 0.08 * delta;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <mesh ref={mesh} rotation={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <OrbitControls enableZoom={true} />
      <Stars />
    </>
  );
}