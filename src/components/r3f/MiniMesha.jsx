import { Canvas } from "@react-three/fiber";
import { useControlsContext } from "../../contexts/ControlsContext.jsx";
import { config } from "../../modules/configStore";
import Mesha from "../r3f/Mesha.jsx";

const MiniMesha = ({ languageCode }) => {
  const { controls } = useControlsContext();
  const { cameraX, cameraY, cameraZ, fov, near, far } = config.camera;
  const { bgColor } = controls;

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
