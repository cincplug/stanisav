import { createContext, useCallback, useContext, useState } from "react";
import staticConfig from "../config/config.json";

const isSelectOptions = (arr) =>
  arr.length > 0 &&
  arr.every(
    (item) => typeof item === typeof arr[0] && typeof item !== "object",
  );

const resolveInitialValues = (obj) => {
  if (Array.isArray(obj)) return isSelectOptions(obj) ? obj[0] : obj;
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, resolveInitialValues(v)]),
    );
  }
  return obj;
};

// Recursively flattens a nested config object into a single-level object.
// Select option arrays are collapsed to their first element; non-select arrays are kept as-is.
const flattenConfig = (obj) => {
  const result = {};
  const traverse = (node) => {
    for (const [key, value] of Object.entries(node)) {
      if (Array.isArray(value)) {
        result[key] = isSelectOptions(value) ? value[0] : value;
      } else if (typeof value === "object" && value !== null) {
        traverse(value);
      } else {
        result[key] = value;
      }
    }
  };
  traverse(obj);
  return result;
};

const readStaticDotKey = (dotKey) =>
  dotKey.split(".").reduce((obj, k) => obj?.[k], staticConfig);

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

const setDotKey = (obj, dotKey, value) => {
  const [head, ...rest] = dotKey.split(".");
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setDotKey(obj[head] ?? {}, rest.join("."), value) };
};

const readDotKey = (dotKey, obj) =>
  dotKey.split(".").reduce((node, k) => node?.[k], obj);

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [groupedConfig, setGroupedConfig] = useState(() =>
    resolveInitialValues(staticConfig),
  );

  const updateConfigValue = useCallback((dotKey, value) => {
    setGroupedConfig((prev) => setDotKey(prev, dotKey, value));
  }, []);

  const resetConfigValue = useCallback((dotKey) => {
    const staticValue = readStaticDotKey(dotKey);
    const resolvedValue =
      Array.isArray(staticValue) && isSelectOptions(staticValue)
        ? staticValue[0]
        : staticValue;
    setGroupedConfig((prev) => setDotKey(prev, dotKey, resolvedValue));
  }, []);

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
          value: readDotKey(dotKey, groupedConfig),
        };
      });
    },
    [groupedConfig],
  );

  // Flat config is derived from groupedConfig so it always stays in sync.
  // Consumers can destructure any key directly: const { meshaSize, cameraX } = config
  const config = flattenConfig(groupedConfig);

  return (
    <ConfigContext.Provider
      value={{
        config,
        groupedConfig,
        updateConfigValue,
        resetConfigValue,
        getConfigGroup,
      }}
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
