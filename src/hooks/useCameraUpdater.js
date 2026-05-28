import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { config } from "../../modules/configStore";
import { useControls } from "../contexts/ControlsContext";

export const useCameraUpdater = () => {
  const { camera } = useThree();
  const { cameraX, cameraY, cameraZ, fov, near, far } = config.camera;

  useEffect(() => {
    if (camera) {
      camera.fov = fov;
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov, near, far]);
};
