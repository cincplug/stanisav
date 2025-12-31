import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useCameraUpdater } from "../../hooks/useCameraUpdater";
import Languages from "./Languages";

const Stage = ({
  isMenuCollapsed,
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
}) => {
  const { controls } = useControls();
  const { selectedLanguage } = useLanguageSelection();
  const { isPlaying } = usePlaylist();

  const CameraUpdaterNode = () => {
    useCameraUpdater({ controls });
    return null;
  };

  const CameraLight = () => {
    const { camera } = useThree();
    const lightRef = useRef();

    useFrame(() => {
      if (lightRef.current) {
        const direction = camera.position.clone().normalize();
        const fixedDistance = controls.positionZ;
        lightRef.current.position.copy(direction.multiplyScalar(fixedDistance));
      }
    });

    return (
      <>
        {!isPlaying && (
          <pointLight
            ref={lightRef}
            intensity={controls.pointLightIntensity}
            decay={controls.pointLightDecay}
            distance={controls.pointLightDistance}
          />
        )}
        <ambientLight intensity={controls.ambientLightIntensity} />
      </>
    );
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
        far: controls.far,
      }}
      gl={{ antialias: true, clearColor: controls.backgroundColor }}
    >
      <color attach="background" args={[controls.backgroundColor]} />

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        makeDefault={true}
      />

      <CameraLight />

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
