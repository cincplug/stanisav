import { useMemo } from "react";
import { useAppStateContext } from "../contexts/AppStateContext";
import { useConfigContext } from "../contexts/ConfigContext";
import { groupLanguages } from "../utils/groupingUtils";
import { calculatePositions } from "../utils/layoutUtils";
import { useSortedLanguages } from "./useSortedLanguages";

export function useLayout() {
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const { sortBy, labelContent, isReverse } = config;

  const sortedLanguageCodes = useSortedLanguages();

  const languageData = data?.languageData || {};

  // Derive languageLineages from languageData (needed by calculatePositions and groupLanguages)
  const languageLineages = useMemo(() => {
    const result = {};
    Object.keys(languageData).forEach((code) => {
      result[code] = languageData[code].lineageKey;
    });
    return result;
  }, [languageData]);

  const positions = useMemo(() => {
    if (sortedLanguageCodes.length === 0) return {};
    return calculatePositions({
      sortedLanguageCodes,
      languageData,
      languageLineages,
      config,
    });
  }, [sortedLanguageCodes, languageData, languageLineages, config]);

  const groups = useMemo(() => {
    return groupLanguages({
      sortedLanguageCodes,
      sortBy,
      languageData,
      languageLineages,
      labelContent,
      isReverse,
    });
  }, [
    sortedLanguageCodes,
    sortBy,
    languageData,
    languageLineages,
    labelContent,
    isReverse,
  ]);

  return { positions, sortedLanguageCodes, groups };
}
