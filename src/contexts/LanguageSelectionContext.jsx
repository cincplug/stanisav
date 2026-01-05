import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { filterLanguagesByFeatures } from "../utils/filteringUtils";
import groupInfo from "../config/groupInfo.json";

const LanguageSelectionContext = createContext();

export const LanguageSelectionProvider = ({ children }) => {
  const getInitialGroupColors = () => {
    const colors = {};
    Object.entries(groupInfo).forEach(([key, info]) => {
      colors[key] = info.color;
    });
    return colors;
  };

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [filteringUtils, setFilteringUtils] = useState({});
  const [filteredLanguages, setFilteredLanguages] = useState(new Set());
  const [groupColors, setGroupColors] = useState(getInitialGroupColors);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);

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
    setSelectedLanguage(null); // Clear selected language
    setCameraFocusRequest({ type: "viewAll" });
    setFilteringUtils({}); // <-- clear filters
    setFilteredLanguages(new Set());
  }, []);

  const setGroupColor = useCallback((groupKey, color) => {
    setGroupColors((prev) => ({ ...prev, [groupKey]: color }));
  }, []);

  useEffect(() => {
    const updatedScheme = {};
    Object.entries(groupInfo).forEach(([key, info]) => {
      updatedScheme[key] = {
        ...info,
        color: groupColors[key] || info.color,
      };
    });
  }, [groupColors]);

  const contextValue = {
    selectedLanguage,
    filteringUtils,
    filteredLanguages,
    selectLanguage,
    viewAllLanguages,
    clearSelection,
    updateFilteringUtils,
    groupColors,
    setGroupColor,
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
      "useLanguageSelection must be used within a LanguageSelectionProvider"
    );
  }
  return context;
};

export default LanguageSelectionContext;
