import { createContext, useCallback, useContext, useState } from "react";
import staticConfig from "../config/config.json";

// Arrays whose every item is a primitive of the same type are select option lists;
// the default value is the first item. All other arrays (object arrays, mixed) are
// data values and must be left as-is.
const isSelectOptions = (arr) =>
  arr.length > 0 &&
  arr.every(
    (item) => typeof item === typeof arr[0] && typeof item !== "object",
  );

// Recursively resolves the initial runtime state from staticConfig.
// Select option arrays are collapsed to their first element; everything else is kept.
const resolveInitialValues = (obj) => {
  if (Array.isArray(obj)) return isSelectOptions(obj) ? obj[0] : obj;
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, resolveInitialValues(v)]),
    );
  }
  return obj;
};

// Reads the original value for a key from staticConfig by dot-notation.
const readStaticDotKey = (dotKey) =>
  dotKey.split(".").reduce((obj, k) => obj?.[k], staticConfig);

// Recursively flattens a group object into [relKey, value] pairs for the controls panel.
// Non-select arrays (object arrays etc.) are skipped — they are not user-editable controls.
const flattenGroupEntries = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) => {
    const relKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      return isSelectOptions(value) ? [[relKey, value]] : [];
    }
    if (typeof value === "object" && value !== null)
      return flattenGroupEntries(value, relKey);
    return [[relKey, value]];
  });

// Writes a value into a nested object by dot-notation key, immutably
const setDotKey = (obj, dotKey, value) => {
  const [head, ...rest] = dotKey.split(".");
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setDotKey(obj[head] ?? {}, rest.join("."), value) };
};

// Reads a value from a nested object by dot-notation key
const readDotKey = (dotKey, obj) =>
  dotKey.split(".").reduce((node, k) => node?.[k], obj);

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  // config mirrors config.json's nested shape with select arrays resolved to their
  // first element, so consumers destructure naturally:
  // const { sortBy } = config.header;  → "alphabetically"
  // const { meshaRevealSequence } = config.entrance;  → original array, untouched
  const [config, setConfig] = useState(() =>
    resolveInitialValues(staticConfig),
  );

  const updateConfigValue = useCallback((dotKey, value) => {
    setConfig((prev) => setDotKey(prev, dotKey, value));
  }, []);

  const resetConfigValue = useCallback((dotKey) => {
    const staticValue = readStaticDotKey(dotKey);
    const resolvedValue =
      Array.isArray(staticValue) && isSelectOptions(staticValue)
        ? staticValue[0]
        : staticValue;
    setConfig((prev) => setDotKey(prev, dotKey, resolvedValue));
  }, []);

  // Returns flat entries for one top-level group, used by the controls panel.
  // For select controls, options come from staticConfig; current value from live config.
  // Entry shape: { dotKey, groupRelativeKey, options, value }
  const getConfigGroup = useCallback(
    (groupName) => {
      const staticGroup = staticConfig[groupName];
      if (!staticGroup || typeof staticGroup !== "object") return [];
      return flattenGroupEntries(staticGroup).map(([relKey, staticValue]) => {
        const dotKey = `${groupName}.${relKey}`;
        return {
          dotKey,
          groupRelativeKey: relKey,
          options: Array.isArray(staticValue) ? staticValue : null,
          value: readDotKey(dotKey, config),
        };
      });
    },
    [config],
  );

  return (
    <ConfigContext.Provider
      value={{ config, updateConfigValue, resetConfigValue, getConfigGroup }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
};
