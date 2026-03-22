import { useState, useCallback } from "react";

// Returns a function to get tooltip data for a given part
export function getTooltipData({
  part,
  scores,
  earPosition,
  eyeX,
  eyeY,
  mainZ,
  meshaSize,
  caseCount,
  nounClassCount,
}) {
  switch (part) {
    case "ear":
      return {
        label: "Morphology",
        value: scores.morphology,
        position: [-earPosition.x, earPosition.y, earPosition.z],
        key: "morphology",
      };
    case "leftEye":
      return {
        label: "Evidentiality",
        value: scores.evidentiality,
        position: [-eyeX, eyeY, mainZ],
        key: "evidentiality",
      };
    case "rightEye":
      return {
        label: "Evidentiality",
        value: scores.evidentiality,
        position: [eyeX, eyeY, mainZ],
        key: "evidentiality",
      };
    case "nose":
      return {
        label: "Word Order Flexibility",
        value: scores.wordOrderFlexibility,
        position: [0, eyeY - eyeX / 2, 0],
        key: "wordOrderFlexibility",
      };
    case "caseMoustache":
      return {
        label: "Case Count",
        value: caseCount,
        position: [0, meshaSize * 0.7, 0.5],
        key: "caseCount",
      };
    case "nounClassMoustache":
      return {
        label: "Noun Class Count",
        value: nounClassCount,
        position: [0, meshaSize * 1.4, 0],
        key: "nounClassCount",
      };
    default:
      return null;
  }
}

// Tooltip shape: { label, value, position, key }
export function useTooltips() {
  const [tooltip, setTooltip] = useState(null);

  // Centralized handler: expects tooltipData from subcomponents
  const showTooltip = useCallback((e, tooltipData) => {
    e?.stopPropagation();
    setTooltip(tooltipData);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return { tooltip, showTooltip, hideTooltip };
}
