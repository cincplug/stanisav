import { useCallback, useMemo } from "react";
import layoutConfig from "../../config/layoutConfig.json";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import { useAppState } from "../../contexts/AppStateContext.jsx";
import { calculateLabelSizeConfig } from "../../utils/sceneUtils.js";
import Label from "./Label.jsx";
import NodeLights from "./NodeLights.jsx";

const Node = ({
  languageCode,
  language,
  position,
  isSelected = false,
  color,
  speakerCount,
}) => {
  const { controls } = useControls();
  const { data } = useAppState();
  const { filteredLanguages, filteringUtils, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { labelContent, labelSize, backgroundColor, sortLanguagesBy } =
    controls;

  // Calculate dynamic min/max for the current numeric category
  const rangeConfig = useMemo(
    () => calculateLabelSizeConfig(sortLanguagesBy, data, layoutConfig),
    [sortLanguagesBy, data],
  );

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

  // Determine which value to use for label size
  const getSizeValue = () => {
    // If sorting by numeric typological features, use that value
    if (["phonemeCount", "caseCount"].includes(sortLanguagesBy)) {
      return data?.typologicalFeatures?.[languageCode]?.[sortLanguagesBy] || 1;
    }
    // Default to speaker count
    return speakerCount;
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

  const sizeValue = getSizeValue();

  // Linear scaling based on rank of unique values
  const rank = rangeConfig.uniqueValues.indexOf(sizeValue);
  const totalRanks = rangeConfig.uniqueValues.length - 1;
  const normalizedRank = totalRanks > 0 ? rank / totalRanks : 0;
  const sizeMultiplier =
    rangeConfig.outMin +
    normalizedRank * (rangeConfig.outMax - rangeConfig.outMin);
  const fontSize = labelSize * sizeMultiplier;

  const labelText = getLabelText(language, languageCode, labelContent);

  return (
    <group position={position} onClick={handleClick}>
      {isSelected && <NodeLights labelTextLength={labelText.length} />}
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
