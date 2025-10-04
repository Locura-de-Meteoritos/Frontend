import { Canvas } from "@react-three/fiber";
import Earth from "./Earth";
import Background from "./Background";

const Simulacion = () => {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Background />
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <Earth />
        </Canvas>
      </div>
    </div>
  );
};

export default Simulacion;