import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useAppStateContext } from "../contexts/AppStateContext.jsx";
import { saveCanvasAsPng } from "../utils/miniStanisavCapture.js";
import Stanisav from "./scene/stanisav/Stanisav.jsx";
import { SelfieIcon } from "./Icons.jsx";

const MiniStanisav = ({ languageCode, position = [0, 0, 97] }) => {
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
    <div ref={wrapperRef} className="mini-stanisav">
      <Canvas
        dpr={canMakeSelfies ? [1, 2] : [1, 1]}
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov,
          near,
          far,
        }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: canMakeSelfies,
          clearColor: bgColor,
          alpha: true,
        }}
      >
        <Stanisav
          languageCode={languageCode}
          position={position}
          isMyStanisav={false}
          spinSpeed={stanisavSpinSpeed}
        />
      </Canvas>
      {canMakeSelfies && (
        <button className="selfie-button" onClick={handleSelfieClick}>
          <SelfieIcon />
        </button>
      )}
    </div>
  );
};

export default MiniStanisav;
