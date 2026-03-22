import { useState, useCallback } from "react";

// Returns tooltip data for a given part and context
// (internal, not exported)
function getTooltipDataFromEvent(part, context) {
  const {
    scores,
    earPosition,
    eyeX,
    eyeY,
    mainZ,
    meshaSize,
    caseCount,
    nounClassCount,
  } = context;
  switch (part) {
    case "ear":
      return {
        label: "Morphology",
        value: scores.morphology,
        position: [-earPosition.x, earPosition.y, earPosition.z],
        key: "morphology",
      };
    case "eye":
      return {
        label: "Evidentiality",
        value: scores.evidentiality,
        position: [-eyeX, eyeY, mainZ],
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

  // Centralized handler: expects event and context
  const showTooltip = useCallback((e, context) => {
    e?.stopPropagation();
    const part = e?.object?.meshaPart;
    if (!part) return;
    const tooltipData = getTooltipDataFromEvent(part, context);
    setTooltip(tooltipData);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return { tooltip, showTooltip, hideTooltip };
}
