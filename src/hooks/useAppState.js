import { useState } from "react";
import guiConfig from "../config/guiConfig.json";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

// Helper function to extract all defaults from flat guiConfig
const getAllDefaults = () => {
  const defaults = {};
  Object.entries(guiConfig).forEach(([controlId, config]) => {
    defaults[controlId] = config.defaultValue;
  });
  return defaults;
};

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
  const [isInfoPanelClosed, setIsInfoPanelClosed] = useState(false);

  // Use language selection context
  const { selectedLanguage, selectedGroup, selectLanguage, selectGroup } =
    useLanguageSelection();

  // Unified app controls state - extract all defaults from guiConfig
  const [appControls, setAppControls] = useState(() => getAllDefaults());

  // Unified control update function
  const updateControl = (key, value) => {
    setAppControls((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Create a mock camera focus function for the centralized handler
  const mockCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  // Use centralized language selection handler
  const { selectLanguageWithFocus } = useLanguageSelectionHandler(
    mockCameraFocus,
    true, // sceneReady - always true in useAppState
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
    setIsInfoPanelClosed(false);
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
    appControls,
    isInfoPanelClosed,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setIsMenuCollapsed,
    setFilteringUtils,
    setIsInfoPanelClosed,

    // Handlers
    updateControl, // Single unified update function
    handleCameraFocus,
    handleLanguageClick
  };
};
