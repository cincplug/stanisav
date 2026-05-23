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
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import sceneConfig from "../../config/sceneConfig.json";

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
  const { data, isEntranceComplete } = useAppState();
  const { filteredLanguages, filteringUtils, selectedLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const {
    labelContent,
    labelSize,
    bgColor,
    tension,
    friction,
    d4,
    isSegmented,
    isMotionReduced,
  } = controls;
  const { radialOffsetModifier } = sceneConfig;

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

  const { positionSpring, revealSpring, isEntered } = useEntranceAnimation(
    position,
    isEntranceComplete,
    isMotionReduced,
    tension,
    friction,
    revealOrder,
    totalVisibleLabels,
  );

  // Selection offset spring (radial push when selected)
  const selectionSpring = useSpring({
    offset: isSelected ? radialOffsetModifier : 0,
    config: { tension, friction },
  });

  const animatedD4 = useRef(0);

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: bgColor,
        depthTest: !!selectedLanguage,
        depthWrite: !!selectedLanguage,
      }),
    [bgColor, selectedLanguage],
  );

  useThrottledFrame(({ camera }, delta) => {
    if (!labelRef.current) return;

    const [x, y, z] = positionSpring.position.get();
    const offset = selectionSpring.offset.get();

    if (isSegmented) {
      labelRef.current.position.set(x, y, z + offset * radialOffsetModifier);
    } else {
      labelRef.current.position.set(
        x + radialOffset[0] * offset,
        y + radialOffset[1] * offset,
        z + radialOffset[2] * offset,
      );
    }

    if (!isEntered) {
      const reveal = revealSpring.reveal.get();
      labelRef.current.scale.setScalar(Math.max(reveal, 0.0001));
    } else {
      labelRef.current.scale.setScalar(1);
    }

    labelRef.current.quaternion.copy(camera.quaternion);

    if (isSelected) {
      labelRef.current.renderOrder = totalVisibleLabels;
    } else if (!selectedLanguage && d4) {
      animatedD4.current += delta;
      if (animatedD4.current >= totalVisibleLabels) animatedD4.current = 0;

      labelRef.current.renderOrder =
        revealOrder >= animatedD4.current ? revealOrder : 0;
    } else {
      labelRef.current.renderOrder = 0;
    }
  });

  return (
    <Text
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
