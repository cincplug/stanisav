import { useCallback, useMemo, useRef } from "react";
import { useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { MeshStandardMaterial } from "three";
import layoutConfig from "../../config/layoutConfig.json";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import { useAppState } from "../../contexts/AppStateContext.jsx";
import {
  calculateSizeMultiplier,
  calculateRadialOffset,
} from "../../utils/sceneUtils.js";
import { getLanguageLabel } from "../../utils/languageDisplayUtils.js";

const Label = ({ languageCode, position, isSelected = false, color }) => {
  const groupRef = useRef();
  const labelRef = useRef();
  const { controls } = useControls();
  const { data } = useAppState();
  const { filteredLanguages, filteringUtils, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { labelContent, labelSize, bgColor, sortBy, tension, friction } =
    controls;

  if (
    Object.keys(filteringUtils).length > 0 &&
    !filteredLanguages.has(languageCode)
  ) {
    return null;
  }

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();
      selectLanguage(languageCode);
      startFromLanguage(languageCode);
    },
    [selectLanguage, startFromLanguage, languageCode],
  );

  const sizeMultiplier = useMemo(
    () => calculateSizeMultiplier(sortBy, data, languageCode, layoutConfig),
    [sortBy, data, languageCode],
  );
  const fontSize = labelSize * sizeMultiplier;

  const labelText = getLanguageLabel(
    languageCode,
    data.languageData,
    labelContent,
  );

  const radialOffset = useMemo(
    () => calculateRadialOffset(position),
    [position],
  );

  const spring = useSpring({
    offset: isSelected ? 4 : 0,
    config: { tension, friction },
  });

  useFrame(({ camera }) => {
    if (groupRef.current) {
      const offset = spring.offset.get();
      groupRef.current.position.set(
        position[0] + radialOffset[0] * offset,
        position[1] + radialOffset[1] * offset,
        position[2] + radialOffset[2] * offset,
      );
    }
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
  });

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: bgColor,
      }),
    [bgColor],
  );

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      <Text
        position={[0, 0, 0]}
        ref={labelRef}
        fontSize={fontSize}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
        outlineWidth={fontSize / 2}
        outlineColor={color}
        color={bgColor}
        material={textMaterial}
      >
        {labelText}
      </Text>
    </group>
  );
};

export default Label;
