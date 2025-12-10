import { createContext, useContext, useState } from "react";
import guiConfig from "../config/guiConfig.json";

// Initialize default values from guiConfig as a flat object
const getDefaultValues = () => {
  const defaults = {};
  Object.entries(guiConfig).forEach(([controlId, config]) => {
    defaults[controlId] = config.defaultValue;
  });
  return defaults;
};

const AppControlsContext = createContext(null);

export const AppControlsProvider = ({ children }) => {
  const [appControls, setControls] = useState(getDefaultValues);

  const updateControl = (key, value) => {
    setControls((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <AppControlsContext.Provider value={{ appControls, updateControl }}>
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
