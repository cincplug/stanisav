import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const useCameraUpdater = ({ controls }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (camera) {
      camera.fov = controls.fov;
      camera.near = controls.near;
      camera.far = controls.far;
      camera.updateProjectionMatrix();
    }
  }, [camera, controls.fov, controls.near, controls.far]);
};
