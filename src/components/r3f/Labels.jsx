import { useEffect, useRef } from "react";
import { useLanguageColors } from "../../contexts/LanguageColorsContext";
import Label from "./Label";
import LabelsCluster from "./LabelsCluster";

const Labels = ({
  groups,
  formattedPositions,
  languageFilterStatus,
  languageData,
  selectedLanguage,
  isEntranceComplete,
  setIsEntranceComplete,
}) => {
  const { languageColors } = useLanguageColors();
  const visibleLabelCodes = Object.keys(formattedPositions).filter(
    (langCode) => {
      const position = formattedPositions[langCode];
      const filterStatus = languageFilterStatus[langCode];
      return Boolean(position) && Boolean(filterStatus?.isVisible);
    },
  );

  const totalVisibleLabels = visibleLabelCodes.length;

  const prevVisibleCountRef = useRef(totalVisibleLabels);
  useEffect(() => {
    if (
      !isEntranceComplete &&
      prevVisibleCountRef.current !== totalVisibleLabels
    ) {
      setIsEntranceComplete(true);
    }
    prevVisibleCountRef.current = totalVisibleLabels;
  }, [totalVisibleLabels, isEntranceComplete]);

  return (
    <>
      {visibleLabelCodes.map((langCode, index) => {
        const position = formattedPositions[langCode];
        const revealOrder = totalVisibleLabels - 1 - index;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            language={languageData[langCode]}
            position={[position.x, position.y, position.z]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
            revealOrder={revealOrder}
            totalVisibleLabels={totalVisibleLabels}
          />
        );
      })}

      {groups.map((group) => (
        <LabelsCluster
          key={group.title ?? "all"}
          title={group.title}
          languageCodes={group.languages}
          formattedPositions={formattedPositions}
          selectedLanguage={selectedLanguage}
        />
      ))}
    </>
  );
};

export default Labels;
