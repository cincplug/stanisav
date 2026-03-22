import { useState, useCallback } from "react";

// Returns tooltip data for a given part and context
// (internal, not exported)
import { getFeatureLabel } from "../utils/linguisticUtils";

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
    phonemeCount,
    linguisticProperties,
  } = context;
  // Tooltip position: always relative to whole mesha (center)
  const tooltipPosition = [2, 2, 3];
  switch (part) {
    case "ear": {
      const value = linguisticProperties?.morphology;
      return {
        label: "Morphology",
        value: value ? getFeatureLabel("morphology", value) : "",
        position: tooltipPosition,
        key: "morphology",
      };
    }
    case "eye": {
      const value = linguisticProperties?.evidentiality;
      return {
        label: "Evidentiality",
        value: value ? getFeatureLabel("evidentiality", value) : "",
        position: tooltipPosition,
        key: "evidentiality",
      };
    }
    case "nose": {
      const value = linguisticProperties?.wordOrderFlexibility;
      return {
        label: "Word Order Flexibility",
        value: value ? getFeatureLabel("wordOrderFlexibility", value) : "",
        position: tooltipPosition,
        key: "wordOrderFlexibility",
      };
    }
    case "caseMoustache":
      return {
        label: "Case Count",
        value: caseCount,
        position: tooltipPosition,
        key: "caseCount",
      };
    case "nounClassMoustache":
      return {
        label: "Noun Class Count",
        value: nounClassCount,
        position: tooltipPosition,
        key: "nounClassCount",
      };
    case "teeth":
      return {
        label: "Phoneme Count",
        value: phonemeCount,
        position: tooltipPosition,
        key: "phonemeCount",
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
