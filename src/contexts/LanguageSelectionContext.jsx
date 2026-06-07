import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { filterLanguagesByFeatures } from "../utils/filteringUtils";
import {
  buildPropertyBalloonText,
  getFeatureName,
} from "../utils/linguisticUtils";
import { useAppStateContext } from "./AppStateContext";

const LanguageSelectionContext = createContext();

export const LanguageSelectionProvider = ({ children }) => {
  const { data } = useAppStateContext();

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyBalloonText, setPropertyBalloonText] = useState("");
  const [filters, setFilters] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);

  // Linguistic properties for the currently selected language —
  // the single source of truth for property values across drag, click, and balloon text
  const linguisticProperties = useMemo(
    () => data?.typologicalFeatures?.[selectedLanguage] ?? null,
    [data, selectedLanguage],
  );

  const selectLanguage = useCallback((languageCode) => {
    setSelectedLanguage(languageCode);
    setCameraFocusRequest({ type: "language", target: languageCode });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLanguage(null);
  }, []);

  const selectProperty = useCallback(
    (propertyKey) => {
      setSelectedProperty(propertyKey);
      if (!propertyKey) {
        setPropertyBalloonText("");
        return;
      }
      const rawValue = linguisticProperties?.[propertyKey];
      setPropertyBalloonText(
        rawValue !== undefined
          ? buildPropertyBalloonText(propertyKey, rawValue)
          : getFeatureName(propertyKey),
      );
    },
    [linguisticProperties],
  );

  const clearPropertyBalloon = useCallback(() => {
    setPropertyBalloonText("");
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
    propertyBalloonText,
    linguisticProperties,
    selectProperty,
    clearPropertyBalloon,
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

export const useLanguageSelectionContext = () => {
  const context = useContext(LanguageSelectionContext);
  if (!context) {
    throw new Error(
      "useLanguageSelection must be used within a LanguageSelectionProvider",
    );
  }
  return context;
};

export default LanguageSelectionContext;
