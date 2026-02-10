import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useCameraUpdater } from "../../hooks/useCameraUpdater";
import StageLight from "./StageLight";
import Languages from "./Languages";

const Stage = ({
  isMenuCollapsed,
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
}) => {
  const { controls } = useControls();
  const {
    positionX,
    positionY,
    positionZ,
    fov,
    near,
    far,
    backgroundColor,
    ambientLightIntensity,
  } = controls;
  const { selectedLanguage } = useLanguageSelection();

  const ambientLightModifier = selectedLanguage ? 0.7 : 1.2;

  const CameraUpdaterNode = () => {
    useCameraUpdater({ controls });
    return null;
  };

  return (
    <Canvas
      className={`${isMenuCollapsed ? "menu-collapsed" : "menu-expanded"}`}
      camera={{
        position: [positionX, positionY, positionZ],
        fov,
        near,
        far,
      }}
      gl={{ antialias: true, clearColor: backgroundColor }}
    >
      <color attach="background" args={[backgroundColor]} />

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        makeDefault={true}
        enableZoom={false}
      />

      {!selectedLanguage && <StageLight />}

      <ambientLight intensity={ambientLightIntensity * ambientLightModifier} />

      <CameraUpdaterNode />

      <Languages
        onDataLoaded={onDataLoaded}
        onSceneReady={onSceneReady}
        onLoadingChange={onLoadingChange}
        onNodesReady={onNodesReady}
        onEmptyFilterChange={onEmptyFilterChange}
      />
    </Canvas>
  );
};

export default Stage;
