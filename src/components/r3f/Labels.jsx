import { useEffect, useRef } from "react";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import Label from "./Label";
import LabelsCluster from "./LabelsCluster";

const Labels = ({
  groups,
  formattedPositions,
  languageFilterStatus,
  selectedLanguage,
  isLabelsSequenceDone,
  setIsLabelsSequenceDone,
}) => {
  const { languageColors } = useLanguageColorsContext();
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
      !isLabelsSequenceDone &&
      prevVisibleCountRef.current !== totalVisibleLabels
    ) {
      setIsLabelsSequenceDone(true);
    }
    prevVisibleCountRef.current = totalVisibleLabels;
  }, [totalVisibleLabels, isLabelsSequenceDone]);

  return (
    <>
      {visibleLabelCodes.map((langCode, index) => {
        const position = formattedPositions[langCode];
        const revealOrder = totalVisibleLabels - 1 - index;

        return (
          <Label
            languageCode={langCode}
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
