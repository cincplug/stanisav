import { useCallback, useMemo } from "react";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import { useAppState } from "../../contexts/AppStateContext.jsx";
import Mesha from "./Mesha.jsx";
import NodeLights from "./NodeLights.jsx";
import Label from "./Label.jsx";
import layoutConfig from "../../config/layoutConfig.json";

const Node = ({
  languageCode,
  language,
  position,
  isSelected = false,
  color,
  speakerCount,
  linguisticProperties,
}) => {
  const { controls } = useControls();
  const { data } = useAppState();
  const { filteredLanguages, filteringUtils, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage, isPlaying, isAnimating, getCurrentLanguage } =
    usePlaylist();
  const {
    labelContent,
    labelSize,
    backgroundColor,
    meshaSize,
    sortLanguagesBy,
  } = controls;

  // Calculate dynamic min/max for the current numeric category
  const rangeConfig = useMemo(() => {
    const { outMin, outMax, speakersReference } =
      layoutConfig.labelSizeNormalization;

    // For speakers, use the reference values
    if (sortLanguagesBy !== "phonemeCount" && sortLanguagesBy !== "caseCount") {
      return {
        min: speakersReference.min,
        max: speakersReference.max,
        outMin,
        outMax,
      };
    }

    // For other numeric features, calculate from actual data
    const values = [];
    if (data?.typologicalFeatures) {
      Object.values(data.typologicalFeatures).forEach((features) => {
        const val = features[sortLanguagesBy];
        if (val !== undefined && val !== null) {
          values.push(val);
        }
      });
    }

    if (values.length === 0) {
      return { min: 1, max: 100, outMin, outMax };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    // Add small padding to avoid edge cases
    const padding = (max - min) * 0.1 || 1;

    return {
      min: Math.max(0.001, min - padding),
      max: max + padding,
      outMin,
      outMax,
    };
  }, [sortLanguagesBy, data]);

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
      return linguisticProperties?.[sortLanguagesBy] || 1;
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
    [selectLanguage, startFromLanguage, languageCode]
  );

  const sizeValue = getSizeValue();

  const fontSize = normalizeRange(
    labelSize * sizeValue,
    rangeConfig.min,
    rangeConfig.max,
    rangeConfig.outMin,
    rangeConfig.outMax
  );
  const currentPlaylistLanguage = getCurrentLanguage();
  const isPlayingThis = isPlaying && currentPlaylistLanguage === languageCode;
  const shouldShowMesha = isPlayingThis && !isAnimating;
  const labelText = getLabelText(language, languageCode, labelContent);

  return (
    <group position={position} onClick={handleClick}>
      {isSelected && <NodeLights labelText={labelText} />}

      {isSelected && shouldShowMesha && (
        <Mesha
          color={color}
          labelSize={meshaSize}
          isSelected={isSelected}
          languageCode={languageCode}
          labelText={labelText}
        />
      )}

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

function normalizeRange(value, min, max, outMin, outMax) {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logValue = Math.log(value);

  return outMin + ((logValue - logMin) / (logMax - logMin)) * (outMax - outMin);
}
