import { createContext, useCallback, useContext, useState } from "react";

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [, setNodes] = useState(null);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [miniStanisavCount, setMiniStanisavCount] = useState(0);

  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  const registerMiniStanisav = useCallback((isActive) => {
    setMiniStanisavCount((count) => {
      if (isActive) return count + 1;
      return Math.max(0, count - 1);
    });
  }, []);

  const value = {
    isLoading,
    data,
    isSceneReady,
    isMiniStanisav: miniStanisavCount > 0,
    cameraFocusRequest,
    setData,
    setIsSceneReady,
    setIsLoading,
    setNodes,
    handleCameraFocus,
    registerMiniStanisav,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (!context)
    throw new Error("useAppState must be used within an AppStateProvider");
  return context;
};
