import { createContext, useContext, useState } from "react";
import controlsConfig from "../config/controls.json";

// Initialize default values from controlsConfig as a flat object
const getDefaultValues = () => {
  const defaults = {};
  Object.entries(controlsConfig).forEach(([controlId, config]) => {
    defaults[controlId] = config.defaultValue;
  });
  return defaults;
};

const ControlsContext = createContext(null);

export const ControlsProvider = ({ children }) => {
  const [controls, setControls] = useState(getDefaultValues);

  const updateControl = (key, value) => {
    setControls((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <ControlsContext.Provider value={{ controls, updateControl }}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error("useControls must be used within an ControlsProvider");
  }
  return context;
};
