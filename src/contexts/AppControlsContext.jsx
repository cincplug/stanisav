import { createContext, useContext, useState } from "react";
import guiConfig from "../config/guiConfig.json";

// Initialize default values from guiConfig, grouped by 'group'
const getDefaultValues = () => {
  const groupedDefaults = {};
  Object.entries(guiConfig).forEach(([controlId, config]) => {
    const { group, defaultValue } = config;
    if (!groupedDefaults[group]) {
      groupedDefaults[group] = {};
    }
    groupedDefaults[group][controlId] = defaultValue;
  });
  return groupedDefaults;
};

const AppControlsContext = createContext(null);

export const AppControlsProvider = ({ children }) => {
  const [controls, setControls] = useState(getDefaultValues);

  const updateControl = (key, value) => {
    setControls((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <AppControlsContext.Provider value={{ controls, updateControl }}>
      {children}
    </AppControlsContext.Provider>
  );
};

export const useAppControls = () => {
  const context = useContext(AppControlsContext);
  if (!context) {
    throw new Error(
      "useAppControls must be used within an AppControlsProvider"
    );
  }
  return context;
};
