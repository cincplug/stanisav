import { Canvas } from "@react-three/fiber";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import Stanisav from "./scene/stanisav/Stanisav.jsx";

const MiniStanisav = ({ languageCode }) => {
  const { config } = useConfigContext();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = config;
  const spin = 1;

  return (
    <div className="mini-stanisav">
      <Canvas
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov,
          near,
          far,
        }}
        gl={{ antialias: true, clearColor: bgColor, alpha: true }}
      >
        <Stanisav
          languageCode={languageCode}
          position={[0, 0, 100]}
          isMyStanisav={false}
          spin={spin}
        />
      </Canvas>
    </div>
  );
};

export default MiniStanisav;
