import { createContext, useContext, useState, useCallback } from "react";
import { filterLanguagesByFeatures } from "../utils/filteringUtils";
import { useControls } from "./ControlsContext";

const LanguageSelectionContext = createContext();

export const LanguageSelectionProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const { controls } = useControls();

  const selectLanguage = useCallback((languageCode) => {
    setSelectedLanguage(languageCode);
    setCameraFocusRequest({ type: "language", target: languageCode });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLanguage(null);
  }, []);

  const updateFilteringUtils = useCallback((filters, data) => {
    setFilteringUtils(filters);
    if (Object.keys(filters).length === 0) {
      setFilteredLanguages(new Set());
      return;
    }
    const filteredResults = filterLanguagesByFeatures(data, filters);
    setFilteredLanguages(new Set(filteredResults.map((lang) => lang.code)));
  }, []);

  const viewAllLanguages = useCallback(() => {
    setSelectedLanguage(null);
    setCameraFocusRequest({ type: "fitAll" });
    setFilteringUtils({});
    setFilteredLanguages(new Set());
  }, []);

  const resetCameraView = useCallback(() => {
    setSelectedLanguage(null);
    setCameraFocusRequest({ type: "viewAll" });
  }, []);

  const contextValue = {
    selectedLanguage,
    selectedProperty,
    setSelectedProperty,
    filteringUtils,
    filteredLanguages,
    selectLanguage,
    viewAllLanguages,
    resetCameraView,
    clearSelection,
    updateFilteringUtils,
    cameraFocusRequest,
  };

  return (
    <LanguageSelectionContext.Provider value={contextValue}>
      {children}
    </LanguageSelectionContext.Provider>
  );
};

export const useLanguageSelection = () => {
  const context = useContext(LanguageSelectionContext);
  if (!context) {
    throw new Error(
      "useLanguageSelection must be used within a LanguageSelectionProvider",
    );
  }
  return context;
};

export default LanguageSelectionContext;
