import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useAppStateContext } from "../contexts/AppStateContext.jsx";
import { saveCanvasAsPng } from "../utils/miniStanisavCapture.js";
import Stanisav from "./scene/stanisav/Stanisav.jsx";

// Toggle this to enable the local PNG export hotkey for the miniature Stanisav.
const IS_CAPTURE_ENABLED = true;
const CAPTURE_EVENT = "keydown";

const MiniStanisav = ({
  languageCode,
  position = [0, 0, 100],
  captureEnabled = IS_CAPTURE_ENABLED,
}) => {
  const { config } = useConfigContext();
  const { registerMiniStanisav } = useAppStateContext();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor, stanisavSpin } =
    config;
  const wrapperRef = useRef(null);
  const shouldUseCaptureRender = Boolean(captureEnabled);

  useEffect(() => {
    registerMiniStanisav(true);
    return () => registerMiniStanisav(false);
  }, [registerMiniStanisav]);

  useEffect(() => {
    if (!captureEnabled) return undefined;

    const handleEvent = (event) => {
      if (event.key !== "/") return;
      event.preventDefault();
      const canvas = wrapperRef.current?.querySelector("canvas");
      saveCanvasAsPng(canvas, { prefix: "stanisav" });
    };

    window.addEventListener(CAPTURE_EVENT, handleEvent);
    return () => window.removeEventListener(CAPTURE_EVENT, handleEvent);
  }, [captureEnabled]);

  return (
    <div ref={wrapperRef} className="mini-stanisav">
      <Canvas
        dpr={shouldUseCaptureRender ? [1, 2] : [1, 1]}
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov,
          near,
          far,
        }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: shouldUseCaptureRender,
          clearColor: bgColor,
          alpha: true,
        }}
      >
        <Stanisav
          languageCode={languageCode}
          position={position}
          isMyStanisav={false}
          spin={stanisavSpin}
        />
      </Canvas>
    </div>
  );
};

export default MiniStanisav;
