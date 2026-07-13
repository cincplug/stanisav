import { useMemo } from "react";
import { getSortingData, sortLanguages } from "../utils/sortingUtils";
import { useAppStateContext } from "../contexts/AppStateContext";
import { useConfigContext } from "../contexts/ConfigContext";
import { useI18nContext } from "../contexts/I18nContext";

/**
 * Centralized hook for getting sorted language codes.
 * Accounts for current locale and all sorting criteria.
 * Re-sorts whenever any dependency changes, including locale.
 *
 * Note: This hook sorts ALL languages. Filtering should be done by the caller
 * if needed (e.g., in PlaylistContext via filteredLanguages Set).
 *
 * @returns {string[]} Array of sorted language codes (all languages, unfiltered)
 */
export function useSortedLanguages() {
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const { locale, isLocaleReady } = useI18nContext();
  const { sortBy, labelContent, isReverse } = config;

  const sortedLanguageCodes = useMemo(() => {
    // Wait until locale data is fully loaded before sorting.
    // locale changes before the data loads (async); isLocaleReady turns true
    // only once setSelectedLocale() resolves and getLocalizedLanguageName() is safe to use.
    if (!data?.languageData || !isLocaleReady) return [];

    const {
      languageCodes,
      languageLineages,
      speakerData,
      typologicalFeatures,
    } = getSortingData(data.languageData);

    return sortLanguages({
      allLanguages: [...languageCodes],
      languageData: data.languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      labelContent,
      isReverse,
    });
  }, [
    data,
    sortBy,
    labelContent,
    isReverse,
    locale,
    isLocaleReady, // Re-sort once locale data is actually loaded
  ]);

  return sortedLanguageCodes;
}
