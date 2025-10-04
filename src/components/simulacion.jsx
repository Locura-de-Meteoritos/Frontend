
import { Canvas } from "@react-three/fiber";
import Earth from "./Earth";

const Simulacion = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Earth />
      </Canvas>
    </div>
  );
};

export default Simulacion;