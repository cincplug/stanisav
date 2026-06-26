import { useEffect, useMemo, useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import Label from "./Label";
import LabelsCluster from "./LabelsCluster";
import Lines from "./Lines";

const Labels = ({
  groups,
  formattedPositions,
  languageFilterStatus,
  selectedLanguage,
  isLabelsSequenceDone,
  setIsLabelsSequenceDone,
}) => {
  const { languageColors } = useLanguageColorsContext();

  const { config } = useConfigContext();
  const { isSegmented, hasLines } = config;

  const visibleLabelCodes = useMemo(
    () =>
      Object.keys(formattedPositions).filter((langCode) => {
        const position = formattedPositions[langCode];
        const filterStatus = languageFilterStatus[langCode];
        return Boolean(position) && Boolean(filterStatus?.isVisible);
      }),
    [formattedPositions, languageFilterStatus],
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
      {hasLines && !isSegmented && !selectedLanguage && (
        <Lines
          visibleLabelCodes={visibleLabelCodes}
          labelRefs={labelRefs}
          revealRefs={revealRefs}
          languageColors={languageColors}
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
