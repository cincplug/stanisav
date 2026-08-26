import { createContext, useContext, useState } from "react";

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [, setNodes] = useState(null);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);

  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  const value = {
    isLoading,
    data,
    cameraFocusRequest,
    setData,
    setIsLoading,
    setNodes,
    handleCameraFocus,
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
