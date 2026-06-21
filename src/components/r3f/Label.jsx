import { useSpring } from "@react-spring/three";
import { Text } from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";
import { MeshStandardMaterial } from "three";
import { useAppStateContext } from "../../contexts/AppStateContext.jsx";
import { useConfigContext } from "../../contexts/ConfigContext.jsx";
import { useEntranceContext } from "../../contexts/EntranceContext.jsx";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylistContext } from "../../contexts/PlaylistContext.jsx";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { getLanguageLabel } from "../../utils/linguisticUtils.js";
import { calculateRadialOffset } from "../../utils/sceneUtils.js";

const Label = ({
  languageCode,
  position,
  isSelected,
  color,
  revealOrder,
  totalVisibleLabels,
  meshRef,
  revealRef,
}) => {
  const labelRef = useRef();
  const { data } = useAppStateContext();
  const { filteredLanguages, filters, selectedLanguage } =
    useLanguageSelectionContext();
  const { startFromLanguage } = usePlaylistContext();

  const { config } = useConfigContext();
  const { labelContent, labelSize, isSegmented } = config.header;
  const { d4 } = config.scene;
  const { isMotionReduced } = config.motion;
  const { radialOffsetModifier } = config.layout;
  const { labelTextColor } = config.colors;

  if (Object.keys(filters).length > 0 && !filteredLanguages.has(languageCode)) {
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

  const { getLabelSpringProps } = useEntranceContext();
  const {
    startPosition,
    finalPosition: springFinalPosition,
    delay,
    positionConfig,
    revealConfig,
  } = getLabelSpringProps(
    position,
    isSegmented,
    revealOrder,
    totalVisibleLabels,
  );

  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = startPosition;
  }

  const positionSpring = useSpring({
    from: { position: entranceStartRef.current },
    to: { position: springFinalPosition },
    config: positionConfig,
    immediate: isMotionReduced,
  });

  const revealSpring = useSpring({
    from: { reveal: 0 },
    to: { reveal: 1 },
    delay,
    config: revealConfig,
    immediate: isMotionReduced,
  });

  // Selection offset spring (radial push when selected)
  const selectionSpring = useSpring({
    offset: isSelected ? radialOffsetModifier : 0,
  });

  const animatedD4 = useRef(0);

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: labelTextColor,
        depthTest: !!selectedLanguage,
        transparent: true,
      }),
    [selectedLanguage],
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

    const reveal = revealSpring.reveal.get();
    labelRef.current.scale.setScalar(reveal);

    labelRef.current.quaternion.copy(camera.quaternion);

    // Keep external refs in sync so the Lines sibling can read live position and reveal
    if (meshRef) meshRef.current = labelRef.current;
    if (revealRef) revealRef.current = reveal;

    if (!selectedLanguage && d4) {
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
      font="/fonts/RobotoSlab-SemiBold.ttf"
      onClick={handleClick}
      ref={labelRef}
      fontSize={labelSize}
      fontWeight="bold"
      anchorX="center"
      anchorY="middle"
      outlineWidth={labelSize / 2}
      outlineColor={color}
      material={textMaterial}
    >
      {labelText}
    </Text>
  );
};

export default Label;
