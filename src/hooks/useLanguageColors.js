import { useMemo } from "react";
import { calculateLanguageColors } from "../utils/colorUtils";

export const useLanguageColors = (languageData, languageLineages, controls) => {
  return useMemo(() => {
    if (!languageData || !languageLineages) return {};

    return calculateLanguageColors(languageData, languageLineages, controls);
  }, [languageData, languageLineages, controls]);
};
