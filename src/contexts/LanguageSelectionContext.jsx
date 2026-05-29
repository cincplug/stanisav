import { createContext, useCallback, useContext, useState } from "react";
import { filterLanguagesByFeatures } from "../utils/filteringUtils";

const LanguageSelectionContext = createContext();

export const LanguageSelectionProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);

  const selectLanguage = useCallback((languageCode) => {
    setSelectedLanguage(languageCode);
    setCameraFocusRequest({ type: "language", target: languageCode });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLanguage(null);
  }, []);

  const updateFilters = useCallback((filters, data) => {
    setFilters(filters);
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
    setFilters({});
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
    filters,
    filteredLanguages,
    selectLanguage,
    viewAllLanguages,
    resetCameraView,
    clearSelection,
    updateFilters,
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
