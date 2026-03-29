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

const Label = ({
  languageCode,
  position,
  isSelected = false,
  color,
  opacity = 1,
}) => {
  const groupRef = useRef();
  const labelRef = useRef();
  const { controls } = useControls();
  const { data } = useAppState();
  const { filteredLanguages, filteringUtils } = useLanguageSelection();
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
    (e) => {
      e.stopPropagation();
      startFromLanguage(languageCode);
    },
    [languageCode],
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

  // Spring for selection offset (radial push when selected)
  const selectionSpring = useSpring({
    offset: isSelected ? 4 : 0,
    config: { tension, friction },
  });

  // Spring for position transitions between layouts
  const positionSpring = useSpring({
    position,
    config: { tension, friction },
  });

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: bgColor,
        transparent: true,
        opacity,
      }),
    [bgColor],
  );

  useFrame(({ camera }) => {
    if (groupRef.current) {
      const [x, y, z] = positionSpring.position.get();
      const offset = selectionSpring.offset.get();
      const radial = calculateRadialOffset([x, y, z]);
      groupRef.current.position.set(
        x + radial[0] * offset,
        y + radial[1] * offset,
        z + radial[2] * offset,
      );
    }
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
    if (textMaterial) {
      textMaterial.opacity = opacity;
    }
  });

  return (
    <group ref={groupRef} onClick={handleClick}>
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
