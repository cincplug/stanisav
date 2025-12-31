import { useCallback } from "react";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import Mesha from "./Mesha.jsx";
import NodeLights from "./NodeLights.jsx";
import Label from "./Label.jsx";

const Node = ({
  languageCode,
  language,
  position,
  isSelected = false,
  color,
  speakerCount
}) => {
  const { controls } = useControls();
  const { filteredLanguages, filteringUtils, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage, isPlaying, isAnimating, getCurrentLanguage } =
    usePlaylist();
  const { labelContent, labelSize, backgroundColor, meshaSize } = controls;

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
    [selectLanguage, startFromLanguage, languageCode]
  );

  const fontSize = normalizeRange(labelSize * speakerCount);
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

function normalizeRange(
  value,
  min = 1 / 1000,
  max = 1000,
  outMin = 2 / 3,
  outMax = 3
) {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logValue = Math.log(value);

  return outMin + ((logValue - logMin) / (logMax - logMin)) * (outMax - outMin);
}
