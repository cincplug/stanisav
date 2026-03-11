import { useCallback, useMemo, useRef } from "react";
import { a, useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
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
import Label from "./Label.jsx";

const Node = ({
  languageCode,
  language,
  position,
  isSelected = false,
  color,
}) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { data } = useAppState();
  const { filteredLanguages, filteringUtils, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const {
    labelContent,
    labelSize,
    backgroundColor,
    sortBy,
    tension,
    friction,
  } = controls;

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

  useFrame(() => {
    if (groupRef.current) {
      const offset = spring.offset.get();
      groupRef.current.position.set(
        position[0] + radialOffset[0] * offset,
        position[1] + radialOffset[1] * offset,
        position[2] + radialOffset[2] * offset,
      );
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      <Label
        fontSize={fontSize}
        isSelected={isSelected}
        labelColor={backgroundColor}
        backgroundColor={color}
      >
        {labelText}
      </Label>
    </group>
  );
};

export default Node;
