import { useEffect, useMemo, useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import Label from "./Label";
import BlackboardAccessories from "./BlackboardAccessories";
import Rays from "./Rays";

const Labels = ({
  groups,
  positions,
  languageFilterStatus,
  selectedLanguage,
  isLabelsSequenceDone,
  setIsLabelsSequenceDone,
}) => {
  const { languageColors } = useLanguageColorsContext();
  const { filters, filteredLanguages } = useLanguageSelectionContext();

  const { config } = useConfigContext();
  const { isBlackboard, hasRays } = config;

  const hasActiveFilters = Object.keys(filters).length > 0;

  const visibleLabelCodes = useMemo(
    () =>
      Object.keys(positions).filter((langCode) => {
        const position = positions[langCode];
        const filterStatus = languageFilterStatus[langCode];
        const isFilteredOut =
          hasActiveFilters && !filteredLanguages.has(langCode);
        return (
          Boolean(position) &&
          Boolean(filterStatus?.isVisible) &&
          !isFilteredOut
        );
      }),
    [positions, languageFilterStatus, hasActiveFilters, filteredLanguages],
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
      {hasRays &&
        !isBlackboard &&
        !selectedLanguage &&
        isLabelsSequenceDone && (
          <Rays
            visibleLabelCodes={visibleLabelCodes}
            labelRefs={labelRefs}
            revealRefs={revealRefs}
            languageColors={languageColors}
          />
        )}

      {visibleLabelCodes.map((langCode, index) => {
        const position = positions[langCode];
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

      {isBlackboard && (
        <BlackboardAccessories
          groups={groups}
          positions={positions}
          visibleLabelCodes={visibleLabelCodes}
        />
      )}
    </>
  );
};

export default Labels;
