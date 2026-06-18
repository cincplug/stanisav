import { useEffect, useRef } from "react";
import { useControlsContext } from "../../contexts/ControlsContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { config } from "../../modules/configStore";
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
  const { controls } = useControlsContext();
  const { hasLines, isSegmented } = controls;
  const { currentColor } = config.colors;

  const visibleLabelCodes = Object.keys(formattedPositions).filter(
    (langCode) => {
      const position = formattedPositions[langCode];
      const filterStatus = languageFilterStatus[langCode];
      return Boolean(position) && Boolean(filterStatus?.isVisible);
    },
  );

  const totalVisibleLabels = visibleLabelCodes.length;

  // Stable arrays of refs, one entry per visible label, resized when count changes.
  // labelRefs: each entry holds the label's live Three.js mesh.
  // revealRefs: each entry holds the label's current reveal scalar [0, 1].
  const labelRefsRef = useRef([]);
  const revealRefsRef = useRef([]);
  if (labelRefsRef.current.length !== totalVisibleLabels) {
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
          color={currentColor}
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
