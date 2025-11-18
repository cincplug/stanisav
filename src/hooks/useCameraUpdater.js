import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const useCameraUpdater = ({ cameraControls }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (camera) {
      camera.fov = cameraControls.fov;
      camera.near = cameraControls.near;
      camera.far = cameraControls.far;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraControls.fov, cameraControls.near, cameraControls.far]);
};
