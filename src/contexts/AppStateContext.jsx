import { createContext, useContext, useState } from "react";
import settingsService from "../services/settingsService";

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [, setNodes] = useState(null);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [selectedMood, setSelectedMood] = useState(() =>
    settingsService.getMood(),
  );

  // Only manages camera focus request state
  const handleCameraFocus = (type, target) => {
    setCameraFocusRequest({ type, target, timestamp: Date.now() });
  };

  // Handle mood selection with optional persistence
  const handleMoodSelect = (moodId, remember = false) => {
    setSelectedMood(moodId);
    settingsService.saveMood(moodId, remember);
  };

  const value = {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    filteringUtils,
    selectedMood,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setFilteringUtils,

    // Handlers
    handleCameraFocus,
    handleMoodSelect,
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
