import { useCallback, useMemo, useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import Label from "./Label";
import BlackboardAccessories from "./BlackboardAccessories";
import Rays from "./Rays";

const Labels = ({
  groups,
  languagePositions,
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
      Object.keys(languagePositions).filter((langCode) => {
        const languagePosition = languagePositions[langCode];
        const filterStatus = languageFilterStatus[langCode];
        const isFilteredOut =
          hasActiveFilters && !filteredLanguages.has(langCode);
        return (
          Boolean(languagePosition) &&
          Boolean(filterStatus?.isVisible) &&
          !isFilteredOut
        );
      }),
    [
      languagePositions,
      languageFilterStatus,
      hasActiveFilters,
      filteredLanguages,
    ],
  );

  const totalVisibleLabels = visibleLabelCodes.length;

  const visibleCodesKey = visibleLabelCodes.join(",");

  const labelRefsRef = useRef([]);
  const revealRefsRef = useRef([]);
  const revealedLanguageCodesRef = useRef(new Set());
  const prevCodesKeyRef = useRef("");
  if (prevCodesKeyRef.current !== visibleCodesKey) {
    prevCodesKeyRef.current = visibleCodesKey;
    labelRefsRef.current = Array.from({ length: totalVisibleLabels }, () => ({
      current: null,
    }));
    revealRefsRef.current = Array.from({ length: totalVisibleLabels }, () => ({
      current: 0,
    }));
    // New set of labels is about to animate in, so past completions no
    // longer apply
    revealedLanguageCodesRef.current = new Set();
  }
  const labelRefs = labelRefsRef.current;
  const revealRefs = revealRefsRef.current;

  const handleLabelRevealComplete = useCallback(
    (languageCode) => {
      revealedLanguageCodesRef.current.add(languageCode);
      if (
        !isLabelsSequenceDone &&
        revealedLanguageCodesRef.current.size >= totalVisibleLabels
      ) {
        setIsLabelsSequenceDone(true);
      }
    },
    [isLabelsSequenceDone, setIsLabelsSequenceDone, totalVisibleLabels],
  );

  return (
    <>
      {hasRays && isLabelsSequenceDone && (
        <Rays
          visibleLabelCodes={visibleLabelCodes}
          labelRefs={labelRefs}
          revealRefs={revealRefs}
          languageColors={languageColors}
        />
      )}

      {visibleLabelCodes.map((langCode, index) => {
        const languagePosition = languagePositions[langCode];
        const revealOrder = totalVisibleLabels - 1 - index;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            position={[
              languagePosition.x,
              languagePosition.y,
              languagePosition.z,
            ]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
            revealOrder={revealOrder}
            totalVisibleLabels={totalVisibleLabels}
            meshRef={labelRefs[index]}
            revealRef={revealRefs[index]}
            onRevealComplete={handleLabelRevealComplete}
          />
        );
      })}

      {isBlackboard && (
        <BlackboardAccessories
          groups={groups}
          languagePositions={languagePositions}
          visibleLabelCodes={visibleLabelCodes}
        />
      )}
    </>
  );
};

export default Labels;
