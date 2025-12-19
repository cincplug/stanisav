import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "../../contexts/ControlsContext";
import { useCameraUpdater } from "../../hooks/useCameraUpdater";
import Languages from "./Languages";

const Stage = ({
  isMenuCollapsed,
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady
}) => {
  const { controls } = useControls();
  const CameraUpdaterNode = () => {
    useCameraUpdater({ controls });
    return null;
  };

  return (
    <Canvas
      className={`r3f-canvas ${
        isMenuCollapsed ? "menu-collapsed" : "menu-expanded"
      }`}
      camera={{
        position: [controls.positionX, controls.positionY, controls.positionZ],
        fov: controls.fov,
        near: controls.near,
        far: controls.far
      }}
      gl={{ antialias: true, clearColor: controls.backgroundColor }}
    >
      <color attach="background" args={[controls.backgroundColor]} />

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
      />
    </Canvas>
  );
};

export default Stage;
