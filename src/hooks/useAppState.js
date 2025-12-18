import { useState } from "react";

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

  // Only manages camera focus request state
  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  return {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    isMenuCollapsed,
    filteringUtils,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setIsMenuCollapsed,
    setFilteringUtils,

    // Handlers
    handleCameraFocus
  };
};
