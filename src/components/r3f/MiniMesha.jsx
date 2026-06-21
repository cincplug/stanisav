import { Canvas } from "@react-three/fiber";
import { config } from "../../modules/configStore";
import Mesha from "../r3f/Mesha.jsx";

const MiniMesha = ({ languageCode }) => {
  const { cameraX, cameraY, cameraZ, fov, near, far } = config.camera;
  const { bgColor } = config.colors;

  return (
    <div className="mini-mesha">
      <Canvas
        camera={{ position: [cameraX, cameraY, cameraZ - 2], fov, near, far }}
        gl={{ antialias: true, clearColor: bgColor, alpha: true }}
      >
        <Mesha
          languageCode={languageCode}
          position={[0, -3, 100]}
          isMyMesha={false}
          looksAround
          rotateSpeed={1}
          renderOrder={1}
        />
      </Canvas>
    </div>
  );
};

export default MiniMesha;
