import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const useCameraUpdater = ({ appControls }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (camera) {
      camera.fov = appControls.fov;
      camera.near = appControls.near;
      camera.far = appControls.far;
      camera.updateProjectionMatrix();
    }
  }, [camera, appControls.fov, appControls.near, appControls.far]);
};
