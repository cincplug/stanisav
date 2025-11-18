import { useState } from "react";
import guiConfig from "../config/guiConfig.json";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

// Helper function to extract defaults by group name from flat guiConfig
const getDefaultsByGroup = (groupName) => {
  const defaults = {};
  Object.entries(guiConfig).forEach(([controlId, config]) => {
    if (config.group === groupName) {
      defaults[controlId] = config.defaultValue;
    }
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

  // Scene, Colors, and Camera controls state - extract defaults from guiConfig
  const [sceneControls, setSceneControls] = useState(() =>
    getDefaultsByGroup("Scene")
  );
  const [colorsControls, setColorsControls] = useState(() =>
    getDefaultsByGroup("Colors")
  );
  const [cameraControls, setCameraControls] = useState(() =>
    getDefaultsByGroup("Camera")
  );

  const updateSceneControl = (key, value) => {
    setSceneControls((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const updateColorsControl = (key, value) => {
    setColorsControls((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const updateCameraControl = (key, value) => {
    setCameraControls((prev) => ({
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
    sceneControls
  );

  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });

    if (type === "language") {
      const groupKey = data?.languageGroups?.[target];
      const isLuka = sceneControls?.isLuka ?? true;
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
    sceneControls,
    colorsControls,
    cameraControls,
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
    updateSceneControl,
    updateColorsControl,
    updateCameraControl,
    handleCameraFocus,
    handleLanguageClick
  };
};
