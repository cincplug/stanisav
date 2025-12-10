import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAppControls } from "../../contexts/AppControlsContext";
import Languages from "./Languages";
import { useCameraUpdater } from "../../hooks/useCameraUpdater";

const Stage = ({
  isMenuCollapsed,
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  cameraFocusRequest
}) => {
  const { appControls } = useAppControls();
  const CameraUpdaterNode = () => {
    useCameraUpdater({ appControls });
    return null;
  };
  return (
    <Canvas
      className={`r3f-canvas ${
        isMenuCollapsed ? "menu-collapsed" : "menu-expanded"
      }`}
      camera={{
        position: [
          appControls.positionX,
          appControls.positionY,
          appControls.positionZ
        ],
        fov: appControls.fov,
        near: appControls.near,
        far: appControls.far
      }}
      gl={{ antialias: true, clearColor: appControls.backgroundColor }}
    >
      <color attach="background" args={[appControls.backgroundColor]} />

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        makeDefault={true}
      />

      <ambientLight intensity={2.2} />

      <CameraUpdaterNode />

      <Languages
        onDataLoaded={onDataLoaded}
        onSceneReady={onSceneReady}
        onLoadingChange={onLoadingChange}
        onNodesReady={onNodesReady}
        cameraFocusRequest={cameraFocusRequest}
      />
    </Canvas>
  );
};

export default Stage;
