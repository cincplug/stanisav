import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAppControls } from "../../contexts/AppControlsContext";
import { useVisualization } from "../../contexts/VisualizationContext";
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
  const { controls } = useAppControls();
  const { colorsControls } = useVisualization();
  const cameraControls = controls.Camera || {};
  const CameraUpdaterNode = () => {
    useCameraUpdater({ cameraControls });
    return null;
  };
  return (
    <Canvas
      className={`r3f-canvas ${
        isMenuCollapsed ? "menu-collapsed" : "menu-expanded"
      }`}
      camera={{
        position: [
          cameraControls.positionX,
          cameraControls.positionY,
          cameraControls.positionZ
        ],
        fov: cameraControls.fov,
        near: cameraControls.near,
        far: cameraControls.far
      }}
      gl={{ antialias: true, clearColor: colorsControls.backgroundColor }}
    >
      <color attach="background" args={[colorsControls.backgroundColor]} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 0, 2]} intensity={1.2} />

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        makeDefault={true}
      />

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
