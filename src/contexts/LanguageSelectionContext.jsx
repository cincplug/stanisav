import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { filterLanguagesByFeatures } from "../utils/filteringUtils";
import {
  getFeatureName,
  getPropertyBalloonText,
} from "../utils/linguisticUtils";
import { useAppStateContext } from "./AppStateContext";

const LanguageSelectionContext = createContext();

export const LanguageSelectionProvider = ({ children }) => {
  const { data } = useAppStateContext();

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [balloonText, setBalloonText] = useState("");
  const [filters, setFilters] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);

  const linguisticProperties = useMemo(
    () => data?.languages?.[selectedLanguage] ?? null,
    [data, selectedLanguage],
  );

  const selectProperty = useCallback(
    (propertyKey) => {
      setSelectedProperty(propertyKey);
      if (!propertyKey) {
        setBalloonText("");
        return;
      }
      const rawValue = linguisticProperties?.[propertyKey];
      setBalloonText(
        rawValue !== undefined
          ? getPropertyBalloonText(propertyKey, rawValue)
          : getFeatureName(propertyKey),
      );
    },
    [linguisticProperties],
  );

  const clearPropertyBalloon = useCallback(() => {
    setBalloonText("");
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

  // Immediate reset with no transition — used when returning to the globe view
  const viewAllLanguages = useCallback(() => {
    setSelectedLanguage(null);
    setFilters({});
    setFilteredLanguages(new Set());
    setCameraFocusRequest({ type: "fitAll", timestamp: Date.now() });
  }, []);

  const contextValue = {
    selectedLanguage,
    // Exposed for PlaylistContext which manages the transition timing (isAnimating)
    // and needs to commit the new language as part of that sequence.
    // UI components must use startFromLanguage from PlaylistContext instead.
    setSelectedLanguage,
    selectedProperty,
    balloonText,
    setBalloonText,
    linguisticProperties,
    selectProperty,
    clearPropertyBalloon,
    setSelectedProperty,
    filters,
    filteredLanguages,
    viewAllLanguages,
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
