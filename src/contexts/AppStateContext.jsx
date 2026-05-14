import { createContext, useContext, useState } from "react";

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [, setNodes] = useState(null);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [skipLabelEntrance, setSkipLabelEntrance] = useState(false);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);

  // Only manages camera focus request state
  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  const value = {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    filteringUtils,
    skipLabelEntrance,
    isEntranceComplete,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setFilteringUtils,
    setSkipLabelEntrance,
    setIsEntranceComplete,

    // Handlers
    handleCameraFocus,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
