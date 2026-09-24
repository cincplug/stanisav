import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useAppStateContext } from "../contexts/AppStateContext.jsx";
import { saveCanvasAsPng } from "../utils/miniStanisavCapture.js";
import Stanisav from "./scene/stanisav/Stanisav.jsx";
import { SelfieIcon } from "./Icons.jsx";

const MiniStanisav = ({
  languageCode,
  position = [0, 0, 100],
  customSpinSpeed,
  className = "mini-stanisav",
  hasSelfieButton,
  // Forces a preserved, high-DPR framebuffer regardless of the user's
  // canMakeSelfies setting, so scripts/capture-selfies.js always gets a
  // readable, high-quality capture via canvas.toDataURL().
  forcesHighQualityCapture = false,
}) => {
  const { config } = useConfigContext();
  const { registerMiniStanisav } = useAppStateContext();
  const {
    cameraX,
    cameraY,
    cameraZ,
    fov,
    near,
    far,
    bgColor,
    stanisavSpinSpeed,
    canMakeSelfies,
  } = config;
  const hasHighQualityBuffer = canMakeSelfies || forcesHighQualityCapture;
  const wrapperRef = useRef(null);

  useEffect(() => {
    registerMiniStanisav(true);
    return () => registerMiniStanisav(false);
  }, [registerMiniStanisav]);

  const handleSelfieClick = () => {
    const canvas = wrapperRef.current?.querySelector("canvas");
    saveCanvasAsPng(canvas, { prefix: "stanisav" });
  };

  return (
    <div ref={wrapperRef} className={className}>
      <Canvas
        dpr={hasHighQualityBuffer ? [1, 2] : [1, 1]}
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov,
          near,
          far,
        }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: hasHighQualityBuffer,
          clearColor: bgColor,
          alpha: true,
        }}
      >
        <Stanisav
          languageCode={languageCode}
          position={position}
          isMyStanisav={false}
          spinSpeed={customSpinSpeed || stanisavSpinSpeed}
          isMini
        />
      </Canvas>
      {canMakeSelfies && hasSelfieButton && (
        <button className="selfie-button" onClick={handleSelfieClick}>
          <SelfieIcon />
        </button>
      )}
    </div>
  );
};

export default MiniStanisav;
