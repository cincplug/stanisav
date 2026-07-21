import { useEffect, useMemo, useState } from "react";
import { useAppStateContext } from "../contexts/AppStateContext";
import { useConfigContext } from "../contexts/ConfigContext";
import { groupLanguages } from "../utils/groupingUtils";
import { calculatePositions } from "../utils/layoutUtils";
import { useSortedLanguages } from "./useSortedLanguages";

// Must match --panel-width and the mobile breakpoint in App.css / index.css
const PANEL_WIDTH_PX = 375;
const PANEL_BREAKPOINT_PX = 640;

export function useLayout() {
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const { sortBy, labelContent, isReverse, isMenuExpanded, cameraZ, fov } =
    config;

  const sortedLanguageCodes = useSortedLanguages();

  const languages = data?.languages || {};

  // Derive lineages from data (needed by calculatePositions and groupLanguages)
  const lineages = data?.lineages || {};

  // Track viewport size so boardWidth recomputes on window resize
  const [windowSize, setWindowSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Board width in 3D units = the full horizontal span of the camera view,
  // accounting for the menu panel eating into the canvas on wide screens.
  const boardWidth = useMemo(() => {
    const isWide = windowSize.width > PANEL_BREAKPOINT_PX;
    const canvasW =
      windowSize.width - (isMenuExpanded && isWide ? PANEL_WIDTH_PX : 0);
    const canvasH =
      windowSize.height - (isMenuExpanded && !isWide ? PANEL_WIDTH_PX : 0);
    const aspect = canvasW / Math.max(canvasH, 1);
    const fovRad = (fov * Math.PI) / 180;
    return 2 * cameraZ * Math.tan(fovRad / 2) * aspect;
  }, [windowSize, isMenuExpanded, cameraZ, fov]);

  const positions = useMemo(() => {
    if (sortedLanguageCodes.length === 0) return {};
    return calculatePositions({
      sortedLanguageCodes,
      languages,
      lineages,
      config: { ...config, boardWidth },
    });
  }, [sortedLanguageCodes, languages, lineages, config, boardWidth]);

  const groups = useMemo(() => {
    return groupLanguages({
      sortedLanguageCodes,
      sortBy,
      languages,
      lineages,
      labelContent,
      isReverse,
    });
  }, [
    sortedLanguageCodes,
    sortBy,
    languages,
    lineages,
    labelContent,
    isReverse,
  ]);

  return { positions, sortedLanguageCodes, groups };
}
