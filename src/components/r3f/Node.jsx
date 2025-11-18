import { useCallback } from "react";
import { useAppControls } from "../../contexts/AppControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import visualConstants from "../../config/visualConstants.json";
import Mesha from "./Mesha.jsx";
import Label from "./Label.jsx";

const Node = ({
  languageCode,
  language,
  position,
  onLanguageClick,
  isSelected = false,
  color,
  linguisticProperties = null
}) => {
  const { controls } = useAppControls();
  const { filteredLanguages, filteringUtils, isPlayingAudio } =
    useLanguageSelection();
  const { Scene } = controls;
  const { labelContent, labelSize } = Scene ?? {};

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

  return (
    <group position={position} onClick={handleClick}>
      {isSelected && isPlayingAudio && (
        <Mesha
          color={color}
          labelSize={labelSize * 2}
          linguisticProperties={linguisticProperties}
          isSelected={isSelected}
          languageCode={languageCode}
        />
      )}

      <Label
        position={[0, 0, 0]}
        fontSize={
          visualConstants.languageNode.labelFontSizeMultiplier * labelSize
        }
        isSelected={isSelected}
        backgroundColor={color}
      >
        {getLabelText(language, languageCode, labelContent)}
      </Label>
    </group>
  );
};

export default Node;
