/**
 * MoshaProvider - Minimal context wrapper for Mosha page
 * Provides only the contexts needed by Mesha component
 */

import { createContext, useContext, useMemo } from "react";
import groupInfo from "../../config/groupInfo.json";

const MoshaContext = createContext(null);

export const MoshaProvider = ({ children, languageCode, data }) => {
  // Initialize group colors from groupInfo
  const groupColors = useMemo(() => {
    const colors = {};
    Object.entries(groupInfo).forEach(([key, info]) => {
      colors[key] = info.color;
    });
    return colors;
  }, []);

  // Provide single language position at origin for Mesha visibility
  const formattedPositions = useMemo(() => {
    if (!languageCode) return {};
    return {
      [languageCode]: { x: 0, y: 0, z: 0 },
    };
  }, [languageCode]);

  // Provide minimal context needed by Mesha
  const value = {
    // Language selection context
    selectedLanguage: languageCode,
    groupColors,
    filteredLanguages: new Set(), // No filtering on Mosha
    filteringUtils: {},
    selectLanguage: () => {}, // No-op
    clearSelection: () => {}, // No-op

    // App state context
    data,
    isInitialized: !!data,
    sceneReady: !!data,
    isLoading: false,

    // Layout positions - single language at origin
    formattedPositions,

    // Controls context already provided by ControlsProvider in main.jsx
  };

  return (
    <MoshaContext.Provider value={value}>{children}</MoshaContext.Provider>
  );
};

// Custom hooks that mimic the main app's context hooks
export const useLanguageSelection = () => {
  const context = useContext(MoshaContext);
  if (!context) {
    throw new Error("useLanguageSelection must be used within MoshaProvider");
  }
  return {
    selectedLanguage: context.selectedLanguage,
    groupColors: context.groupColors,
    filteredLanguages: context.filteredLanguages,
    filteringUtils: context.filteringUtils,
    selectLanguage: context.selectLanguage,
    clearSelection: context.clearSelection,
  };
};

export const useAppState = () => {
  const context = useContext(MoshaContext);
  if (!context) {
    throw new Error("useAppState must be used within MoshaProvider");
  }
  return {
    data: context.data,
    isInitialized: context.isInitialized,
    sceneReady: context.sceneReady,
    isLoading: context.isLoading,
  };
};

export default MoshaProvider;
