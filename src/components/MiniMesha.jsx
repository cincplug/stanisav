import { Canvas } from "@react-three/fiber";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import Mesha from "./scene/mesha/Mesha.jsx";

const MiniMesha = ({ languageCode }) => {
  const { config } = useConfigContext();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = config;
  const spin = 1;

  return (
    <div className="mini-mesha">
      <Canvas
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov,
          near,
          far,
        }}
        gl={{ antialias: true, clearColor: bgColor, alpha: true }}
      >
        <Mesha
          languageCode={languageCode}
          position={[0, 0, 100]}
          isMyMesha={false}
          spin={spin}
        />
      </Canvas>
    </div>
  );
};

export default MiniMesha;
