import { createContext, useContext, useState } from "react";
import controlsConfig from "../config/controls.json";

const getDefaultValues = () => {
  const defaults = {};
  Object.values(controlsConfig).forEach((group) => {
    Object.entries(group).forEach(([controlId, config]) => {
      defaults[controlId] = config.defaultValue;
    });
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
