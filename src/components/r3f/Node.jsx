import { useCallback, useMemo } from "react";
import layoutConfig from "../../config/layoutConfig.json";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import { useAppState } from "../../contexts/AppStateContext.jsx";
import { calculateSizeMultiplier } from "../../utils/sceneUtils.js";
import Label from "./Label.jsx";

const Node = ({
  languageCode,
  language,
  position,
  isSelected = false,
  color,
}) => {
  const { controls } = useControls();
  const { data } = useAppState();
  const { filteredLanguages, filteringUtils, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { labelContent, labelSize, backgroundColor, sortBy } = controls;

  const getLabelText = (language, languageCode, labelContent) => {
    switch (labelContent) {
      case "name":
        return language.name;
      case "nativeName":
        return language.nativeName;
      case "isoCode":
        return languageCode;
      default:
        return language.name;
    }
  };

  // Don't render if filters are active and this language is not in filtered set
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

  const labelText = getLabelText(language, languageCode, labelContent);

  return (
    <group position={position} onClick={handleClick}>
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
