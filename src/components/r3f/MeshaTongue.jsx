import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";
import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";

extend({ ParametricGeometry });

const MeshaTongue = ({ tongueMaterial, segments, onClick, isSelected }) => {
  const lastAudioDataRef = useRef(defaultAudioData);
  const { controls } = useControls();
  const { audioData: rawAudioData } = useAudioAnimation();
  const { meshaSize } = controls;

  const audioData = rawAudioData.isSelected
    ? rawAudioData
    : lastAudioDataRef.current;

  if (rawAudioData.isSelected) {
    lastAudioDataRef.current = rawAudioData;
  }

  const audioSurface = useMemo(
    () =>
      createAudioSurface({
        audioBand: audioData.harmonicsData,
        size: meshaSize,
        bend: 0,
        radius: meshaSize,
      }),
    [audioData.harmonicsData, meshaSize],
  );

  return (
    <mesh
      position={[0, meshaSize, meshaSize]}
      scale={[meshaSize / 3, -meshaSize / 6, -meshaSize]}
      rotation={[0, Math.PI, 0]}
      onClick={onClick}
      linguisticProperty="tonality"
    >
      <parametricGeometry args={[audioSurface, segments, segments]} />
      <shaderMaterial args={[tongueMaterial]} />
      {isSelected && (
        <MeshaHighlight
          geometry="parametricGeometry"
          geometryArgs={[audioSurface, segments, segments]}
        />
      )}
    </mesh>
  );
};
export default MeshaTongue;
