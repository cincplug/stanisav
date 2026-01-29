import { useMemo } from "react";
import { LayoutEngine } from "../modules/layoutEngine";

const layoutEngine = new LayoutEngine();

export function useLayoutManager(data, controls, onNodesReady) {
  return useMemo(() => {
    if (!data) return { formattedPositions: {}, sortedLanguageCodes: [] };
    const { positions, sortedLanguages } = layoutEngine.calculateLayout(
      data,
      controls,
    );
    if (onNodesReady) onNodesReady();
    return {
      formattedPositions: positions,
      sortedLanguageCodes: sortedLanguages,
    };
  }, [data, controls, onNodesReady]);
}
