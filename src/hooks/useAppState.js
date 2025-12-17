import { useState } from "react";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";
import { useAppControls } from "../contexts/AppControlsContext";

/**
 * Custom hook to manage all App-level state and handlers
 */
export const useAppState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [, setNodes] = useState(null);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [filteringUtils, setFilteringUtils] = useState({});

  // Use language selection context
  const { selectedLanguage, selectedGroup, selectLanguage, selectGroup } =
    useLanguageSelection();

  // Use appControls from context
  const { appControls } = useAppControls();

  // Create a mock camera focus function for the centralized handler
  const mockCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  // Use centralized language selection handler
  const { selectLanguageWithFocus } = useLanguageSelectionHandler(
    mockCameraFocus,
    true,
    data,
    appControls
  );

  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });

    if (type === "language") {
      const groupKey = data?.languageGroups?.[target];
      const isLuka = appControls?.isLuka ?? true;
      selectLanguage(target, false, groupKey, isLuka);
    } else if (type === "group") {
      selectGroup(target);
    }
  };

  const handleLanguageClick = (languageCode) => {
    // Use centralized handler for direct clicks (with audio and camera focus)
    selectLanguageWithFocus(languageCode, true, true);
    // Reset info panel closed state when selecting a new language
  };

  return {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    isMenuCollapsed,
    filteringUtils,
    selectedLanguage,
    selectedGroup,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setIsMenuCollapsed,
    setFilteringUtils,

    // Handlers
    handleCameraFocus,
    handleLanguageClick
  };
};
