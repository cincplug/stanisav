import { useCallback } from "react";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import Mesha from "./Mesha.jsx";
import Label from "./Label.jsx";

const Node = ({
  languageCode,
  language,
  position,
  onLanguageClick,
  isSelected = false,
  color,
  linguisticProperties = null,
  speakerCount
}) => {
  const { controls } = useControls();
  const { filteredLanguages, filteringUtils, isPlayingAudio } =
    useLanguageSelection();
  const { labelContent, labelSize, backgroundColor } = controls;

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

      if (onLanguageClick) {
        onLanguageClick(languageCode);
      }
    },
    [onLanguageClick, languageCode]
  );

  const fontSize = normalizeRange(labelSize * speakerCount);

  return (
    <group position={position} onClick={handleClick}>
      {isSelected && isPlayingAudio && (
        <Mesha
          color={color}
          labelSize={fontSize * 2}
          linguisticProperties={linguisticProperties}
          isSelected={isSelected}
          languageCode={languageCode}
        />
      )}

      <Label
        fontSize={fontSize}
        isSelected={isSelected}
        labelColor={backgroundColor}
        backgroundColor={color}
      >
        {getLabelText(language, languageCode, labelContent)}
      </Label>
    </group>
  );
};

export default Node;

function normalizeRange(
  value,
  min = 1 / 1000,
  max = 1000,
  outMin = 1,
  outMax = 3
) {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logValue = Math.log(value);

  return outMin + ((logValue - logMin) / (logMax - logMin)) * (outMax - outMin);
}
