import { createContext, useContext, useState, useCallback } from "react";

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [, setNodes] = useState(null);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [balloonText, setBalloonText] = useState("");

  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  const value = {
    isLoading,
    data,
    isSceneReady,
    cameraFocusRequest,
    filteringUtils,
    balloonText,
    setData,
    setIsSceneReady,
    setIsLoading,
    setNodes,
    setFilteringUtils,
    setBalloonText,
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
