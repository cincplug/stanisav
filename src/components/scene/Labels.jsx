import { useEffect, useMemo, useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { getSortByLabel } from "../../utils/i18nUtils";
import Label from "./Label";
import LabelsCluster from "./LabelsCluster";
import Lines from "./Lines";
import SceneTitle from "./SceneTitle";

const Labels = ({
  groups,
  formattedPositions,
  languageFilterStatus,
  selectedLanguage,
  isLabelsSequenceDone,
  setIsLabelsSequenceDone,
}) => {
  const { languageColors } = useLanguageColorsContext();
  const { filters, filteredLanguages } = useLanguageSelectionContext();

  const { config } = useConfigContext();
  const { isBlackboard, hasLines, sortBy } = config;

  const sortByLabel = getSortByLabel(sortBy);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const visibleLabelCodes = useMemo(
    () =>
      Object.keys(formattedPositions).filter((langCode) => {
        const position = formattedPositions[langCode];
        const filterStatus = languageFilterStatus[langCode];
        const isFilteredOut =
          hasActiveFilters && !filteredLanguages.has(langCode);
        return (
          Boolean(position) &&
          Boolean(filterStatus?.isVisible) &&
          !isFilteredOut
        );
      }),
    [
      formattedPositions,
      languageFilterStatus,
      hasActiveFilters,
      filteredLanguages,
    ],
  );

  const totalVisibleLabels = visibleLabelCodes.length;

  const visibleCodesKey = visibleLabelCodes.join(",");

  const labelRefsRef = useRef([]);
  const revealRefsRef = useRef([]);
  const prevCodesKeyRef = useRef("");
  if (prevCodesKeyRef.current !== visibleCodesKey) {
    prevCodesKeyRef.current = visibleCodesKey;
    labelRefsRef.current = Array.from({ length: totalVisibleLabels }, () => ({
      current: null,
    }));
    revealRefsRef.current = Array.from({ length: totalVisibleLabels }, () => ({
      current: 0,
    }));
  }
  const labelRefs = labelRefsRef.current;
  const revealRefs = revealRefsRef.current;

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
      {hasLines &&
        !isBlackboard &&
        !selectedLanguage &&
        isLabelsSequenceDone && (
          <Lines
            visibleLabelCodes={visibleLabelCodes}
            labelRefs={labelRefs}
            revealRefs={revealRefs}
            languageColors={languageColors}
          />
        )}

      {isBlackboard && (
        <SceneTitle
          text={sortByLabel}
          formattedPositions={formattedPositions}
        />
      )}

      {visibleLabelCodes.map((langCode, index) => {
        const position = formattedPositions[langCode];
        const revealOrder = totalVisibleLabels - 1 - index;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            position={[position.x, position.y, position.z]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
            revealOrder={revealOrder}
            totalVisibleLabels={totalVisibleLabels}
            meshRef={labelRefs[index]}
            revealRef={revealRefs[index]}
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
