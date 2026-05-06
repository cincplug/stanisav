import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";
import Mesha from "../r3f/Mesha.jsx";
import { getFeatureScore } from "../../utils/linguisticUtils.js";
import sceneConfig from "../../config/sceneConfig.json";

const MiniMesha = ({ languageCode, linguisticProperties, color }) => {
  const { controls } = useControls();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = controls;

  const stripesType =
    getFeatureScore("tonality", linguisticProperties?.tonality) - 1;

  if (!linguisticProperties || !color) return null;

  return createPortal(
    <div className="mini-mesha">
      <Canvas
        camera={{ position: [cameraX, cameraY, cameraZ], fov, near, far }}
        gl={{ antialias: true, clearColor: bgColor, alpha: true }}
      >
        <Mesha
          linguisticProperties={linguisticProperties}
          color={color}
          position={[0, -3, 100]}
          isMyMesha={false}
          looksAround
          stripesType={stripesType}
          autoRotateSpeed={1}
          renderOrder={1}
        />
      </Canvas>
    </div>,
    document.body,
  );
};

export default MiniMesha;
