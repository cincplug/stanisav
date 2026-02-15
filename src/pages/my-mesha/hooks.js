/**
 * Custom hooks for MyMesha - overrides for main app hooks
 * These are provided through MyMeshaProvider context
 */

import { useMemo } from "react";

/**
 * Override for useLayoutManager - returns single language at origin
 * This ensures Mesha is visible in the center of the screen
 */
export function useLayoutManager(data, controls, onNodesReady) {
  const { formattedPositions, sortedLanguageCodes } = useMemo(() => {
    if (!data || !data.languageData) {
      return { formattedPositions: {}, sortedLanguageCodes: [] };
    }

    const languageCodes = Object.keys(data.languageData);
    const positions = {};

    // Position single language at origin for visibility
    if (languageCodes.length > 0) {
      positions[languageCodes[0]] = { x: 0, y: 0, z: 0 };
    }

    return {
      formattedPositions: positions,
      sortedLanguageCodes: languageCodes,
    };
  }, [data]);

  // No need for onNodesReady callback in MyMesha
  return {
    formattedPositions,
    sortedLanguageCodes,
  };
}
