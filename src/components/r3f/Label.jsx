import { useCallback, useMemo, useRef } from "react";
import { useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { MeshStandardMaterial } from "three";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import { useAppState } from "../../contexts/AppStateContext.jsx";
import { calculateRadialOffset } from "../../utils/sceneUtils.js";
import { getLanguageLabel } from "../../utils/languageDisplayUtils.js";
import { useEntranceAnimation } from "../../hooks/useEntranceAnimation.js";

const Label = ({
  languageCode,
  position,
  isSelected,
  color,
  opacity,
  revealOrder,
  totalVisibleLabels,
}) => {
  const groupRef = useRef();
  const labelRef = useRef();
  const { controls } = useControls();
  const { data, skipLabelEntrance } = useAppState();
  const { filteredLanguages, filteringUtils } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { labelContent, labelSize, bgColor, tension, friction } = controls;

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
    [languageCode, startFromLanguage],
  );

  const labelText = getLanguageLabel(
    languageCode,
    data.languageData,
    labelContent,
  );

  const radialOffset = useMemo(
    () => calculateRadialOffset(position),
    [position],
  );

  // Entrance animation with a subtle staggered move near the final position
  const { positionSpring, revealSpring } = useEntranceAnimation(
    position,
    skipLabelEntrance,
    tension,
    friction,
    revealOrder,
    totalVisibleLabels,
  );

  // Selection offset spring (radial push when selected)
  const selectionSpring = useSpring({
    offset: isSelected ? 4 : 0,
    config: { tension, friction },
  });

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: bgColor,
        transparent: true,
        opacity,
      }),
    [bgColor, opacity],
  );

  useFrame(({ camera }) => {
    if (groupRef.current) {
      const [x, y, z] = positionSpring.position.get();
      const offset = selectionSpring.offset.get();
      const reveal = revealSpring.reveal.get();

      groupRef.current.position.set(
        x + radialOffset[0] * offset,
        y + radialOffset[1] * offset,
        z + radialOffset[2] * offset,
      );
      groupRef.current.scale.setScalar(Math.max(reveal, 0.001));
    }
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
    if (textMaterial) {
      textMaterial.opacity = opacity * revealSpring.reveal.get();
    }
  });

  return (
    <group ref={groupRef} onClick={handleClick}>
      <Text
        position={[0, 0, 0]}
        ref={labelRef}
        fontSize={labelSize}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
        outlineWidth={labelSize / 2}
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
