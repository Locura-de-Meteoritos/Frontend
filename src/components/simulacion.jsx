import { Canvas } from "@react-three/fiber";
import Earth from "./Earth";
import Background from "./Background";
import Header from "./Header";
import Footer from "./Footer";

const Simulacion = () => {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Background />
      </div>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }}>
        <Header />
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <Canvas camera={{ position: [0, 0.8, 6], fov: 60 }}>
          <Earth />
        </Canvas>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)' }}>
        <Footer />
      </div>
    </div>
  );
};

export default Simulacion;