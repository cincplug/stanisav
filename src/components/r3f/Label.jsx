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
  revealOrder,
  totalVisibleLabels,
}) => {
  const labelRef = useRef();
  const { controls } = useControls();
  const { data, skipLabelEntrance } = useAppState();
  const { filteredLanguages, filteringUtils, selectedLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { labelContent, labelSize, bgColor, tension, friction, d4 } = controls;

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
        depthTest: !!selectedLanguage,
        depthWrite: !!selectedLanguage,
      }),
    [bgColor, selectedLanguage],
  );

  useFrame(({ camera }) => {
    if (labelRef.current) {
      const [x, y, z] = positionSpring.position.get();
      const offset = selectionSpring.offset.get();
      const reveal = revealSpring.reveal.get();

      labelRef.current.position.set(
        x + radialOffset[0] * offset,
        y + radialOffset[1] * offset,
        z + radialOffset[2] * offset,
      );
      labelRef.current.scale.setScalar(Math.max(reveal, 0.0001));

      // Some kind of 4th dimension
      labelRef.current.renderOrder = selectedLanguage
        ? 0
        : revealOrder >= d4
          ? 0
          : totalVisibleLabels - revealOrder;
    }
    if (labelRef.current && camera) {
      // Copy camera quaternion for smooth billboarding without threshold snapping.
      labelRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <Text
      position={[0, 0, 0]}
      onClick={handleClick}
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
  );
};

export default Label;
