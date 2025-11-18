import { createContext, useContext } from "react";
import { useAppControls } from "./AppControlsContext";
import { useLanguageSelection } from "./LanguageSelectionContext";

const VisualizationContext = createContext(null);

export const VisualizationProvider = ({ children }) => {
  const { controls } = useAppControls();
  const { selectedLanguage, selectedGroup, selectLanguage } =
    useLanguageSelection();

  const value = {
    // Visual settings
    sceneControls: controls.Scene || {},
    colorsControls: controls.Colors || {},

    // Selection state
    selectedLanguage,
    selectedGroup,

    // Actions
    onLanguageClick: (code) => selectLanguage(code, true, true)
  };

  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
};

export const useVisualization = () => {
  const context = useContext(VisualizationContext);
  if (!context) {
    throw new Error(
      "useVisualization must be used within VisualizationProvider"
    );
  }
  return context;
};
