import { useMemo, useEffect } from "react";
import { LayoutEngine } from "../modules/layoutEngine";

const layoutEngine = new LayoutEngine();

export function useLayoutManager(data, controls, onNodesReady) {
  const { positions, sortedLanguages } = useMemo(() => {
    if (!data) return { positions: {}, sortedLanguages: [] };
    return layoutEngine.calculateLayout(data, controls);
  }, [data, controls]);

  useEffect(() => {
    if (onNodesReady) onNodesReady();
  }, [positions, sortedLanguages, onNodesReady]);

  return {
    formattedPositions: positions,
    sortedLanguageCodes: sortedLanguages,
  };
}
