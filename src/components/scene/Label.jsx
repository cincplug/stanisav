import { useSpring } from "@react-spring/three";
import { Text } from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";
import { MeshStandardMaterial, Vector3 } from "three";
import { useAppStateContext } from "../../contexts/AppStateContext.jsx";
import { useConfigContext } from "../../contexts/ConfigContext.jsx";
import { useEntranceContext } from "../../contexts/EntranceContext.jsx";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylistContext } from "../../contexts/PlaylistContext.jsx";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { getLanguageLabel } from "../../utils/linguisticUtils.js";

const Label = ({
  languageCode,
  position,
  isSelected,
  color,
  revealOrder,
  totalVisibleLabels,
  meshRef,
  revealRef,
  onRevealComplete,
}) => {
  const labelRef = useRef();
  const { data } = useAppStateContext();
  const { selectedLanguage } = useLanguageSelectionContext();
  const { startFromLanguage, isAnimating, previewLanguageCode } =
    usePlaylistContext();

  // Cursor position from keyboard/tab navigation, shown only where it
  // differs from the actual selection (isSelected styling takes precedence)
  const isPreviewed = previewLanguageCode === languageCode;

  const { config } = useConfigContext();
  const {
    labelContent,
    labelSize,
    isBlackboard,
    isMinglingWhenNotZoomed,
    labelOffset,
    isMotionReduced,
    labelTextColor,
    invertsSelected,
    invertsUnselected,
  } = config;

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      startFromLanguage(languageCode);
    },
    [languageCode, startFromLanguage],
  );

  const labelText = getLanguageLabel(
    languageCode,
    data.languages,
    labelContent,
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
    isBlackboard,
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
    // Reports back to Labels the moment this label's own entrance finishes,
    // so Labels can tell when the whole staggered group has finished
    // revealing without guessing at a fixed duration
    onRest: () => {
      onRevealComplete?.(languageCode);
    },
  });

  // Selection offset spring (push toward camera when selected)
  const selectionSpring = useSpring({
    offset: isSelected ? labelOffset : 0,
    immediate: isMotionReduced,
  });

  const mingleRef = useRef(0);

  // Reused vector to avoid allocating one every frame
  const cameraFacingDirection = useMemo(() => new Vector3(), []);

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: isSelected
          ? invertsSelected
            ? color
            : labelTextColor
          : invertsUnselected
            ? color
            : labelTextColor,
        depthTest: !!selectedLanguage,
        transparent: true,
      }),
    [
      selectedLanguage,
      isSelected,
      invertsSelected,
      invertsUnselected,
      color,
      labelTextColor,
    ],
  );

  const outlineColor = useMemo(
    () =>
      isSelected
        ? invertsSelected
          ? labelTextColor
          : color
        : invertsUnselected
          ? labelTextColor
          : color,
    [isSelected, invertsSelected, invertsUnselected, color, labelTextColor],
  );

  useThrottledFrame(({ camera }, delta) => {
    if (!labelRef.current) return;

    const [x, y, z] = positionSpring.position.get();
    const offset = selectionSpring.offset.get();

    if (isBlackboard) {
      // Board is flat on z = 0 and the camera never rotates here, so the
      // push direction is always world +z — no dependency on live camera
      // state, so it can't drift while the camera moves
      labelRef.current.position.set(x, y, z + offset);
    } else {
      // Sphere camera orbits freely, so push toward wherever the camera
      // currently is, recomputed each frame
      cameraFacingDirection.set(0, 0, 1).applyQuaternion(camera.quaternion);
      labelRef.current.position.set(
        x + cameraFacingDirection.x * offset,
        y + cameraFacingDirection.y * offset,
        z + cameraFacingDirection.z * offset,
      );
    }

    const reveal = revealSpring.reveal.get();
    labelRef.current.scale.setScalar(reveal);

    labelRef.current.quaternion.copy(camera.quaternion);

    // Keep external refs in sync so the Rays sibling can read live position and reveal
    if (meshRef) meshRef.current = labelRef.current;
    if (revealRef) revealRef.current = reveal;

    if (!selectedLanguage && isMinglingWhenNotZoomed && !isAnimating) {
      mingleRef.current += delta;
      if (mingleRef.current >= totalVisibleLabels) mingleRef.current = 0;

      labelRef.current.renderOrder =
        revealOrder >= mingleRef.current ? revealOrder : 0;
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
      outlineWidth={isPreviewed && !isSelected ? labelSize : labelSize / 2}
      outlineColor={outlineColor}
      material={textMaterial}
    >
      {labelText}
    </Text>
  );
};

export default Label;
