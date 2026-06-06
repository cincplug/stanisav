import { createContext, useContext, useEffect, useState } from "react";
import controlsConfig from "../config/controls.json";
import {
  advancedConfigEntries,
  applyAdvancedOverrides,
} from "../modules/configStore";
import { isLowEnd } from "../utils/deviceUtils";

const getDefaultValues = () => {
  const defaults = {};
  Object.values(controlsConfig).forEach((group) => {
    Object.entries(group).forEach(([controlId, config]) => {
      defaults[controlId] =
        isLowEnd && "defaultIfLowEnd" in config
          ? config.defaultIfLowEnd
          : config.defaultValue;
    });
  });
  return defaults;
};

// Builds the initial advanced controls state from all numeric config entries.
// Each value starts at the static default.
const getDefaultAdvancedValues = () =>
  Object.fromEntries(advancedConfigEntries.map(([key, value]) => [key, value]));

const ControlsContext = createContext(null);

export const ControlsProvider = ({ children }) => {
  const [controls, setControls] = useState(getDefaultValues);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedControls, setAdvancedControls] = useState(
    getDefaultAdvancedValues,
  );

  // Whenever any advanced value changes, sync it into the shared config object.
  useEffect(() => {
    applyAdvancedOverrides(advancedControls);
  }, [advancedControls]);

  const updateControl = (key, value) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const updateAdvancedControl = (dotKey, value) => {
    setAdvancedControls((prev) => ({ ...prev, [dotKey]: value }));
  };

  const toggleAdvanced = () => setIsAdvancedOpen((prev) => !prev);

  return (
    <ControlsContext.Provider
      value={{
        controls,
        updateControl,
        advancedControls,
        updateAdvancedControl,
        isAdvancedOpen,
        toggleAdvanced,
      }}
    >
      {children}
    </ControlsContext.Provider>
  );
};

export const useControlsContext = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error("useControls must be used within an ControlsProvider");
  }
  return context;
};
