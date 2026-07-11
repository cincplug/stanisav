import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import staticConfig from "../config/config.json";
import { configStorageKey } from "../config/storageConfig.json";

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

// Resolves the static default for a dot key, collapsing select-option arrays to their first element.
const resolveDefaultValue = (dotKey) => {
  const staticValue = readStaticDotKey(dotKey);
  return Array.isArray(staticValue) && isSelectOptions(staticValue)
    ? staticValue[0]
    : staticValue;
};

// Arrays/objects are compared by content, everything else by reference/primitive equality.
const areConfigValuesEqual = (valueA, valueB) => {
  if (Array.isArray(valueA) || Array.isArray(valueB)) {
    return JSON.stringify(valueA) === JSON.stringify(valueB);
  }
  return valueA === valueB;
};

// Deep-merges a stored config into the default shape, so newly added config
// keys (not present in an older stored payload) still fall back to their default.
const mergeStoredConfig = (defaultNode, storedNode) => {
  if (storedNode === undefined) return defaultNode;
  if (Array.isArray(defaultNode)) {
    return Array.isArray(storedNode) ? storedNode : defaultNode;
  }
  if (typeof defaultNode === "object" && defaultNode !== null) {
    if (typeof storedNode !== "object" || storedNode === null)
      return defaultNode;
    const result = {};
    for (const [key, value] of Object.entries(defaultNode)) {
      result[key] = mergeStoredConfig(value, storedNode[key]);
    }
    return result;
  }
  return storedNode;
};

const readStoredConfig = () => {
  if (typeof window === "undefined") return null;
  try {
    const rawStoredConfig = window.localStorage.getItem(configStorageKey);
    return rawStoredConfig ? JSON.parse(rawStoredConfig) : null;
  } catch {
    return null;
  }
};

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [groupedConfig, setGroupedConfig] = useState(() => {
    const defaultValues = resolveInitialValues(staticConfig);
    const storedConfig = readStoredConfig();
    return storedConfig
      ? mergeStoredConfig(defaultValues, storedConfig)
      : defaultValues;
  });

  // Persists the current config to localStorage whenever it changes,
  // so values survive a page refresh.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        configStorageKey,
        JSON.stringify(groupedConfig),
      );
    } catch {
      // localStorage may be unavailable (e.g. private browsing quota) - fail silently
    }
  }, [groupedConfig]);

  const updateConfigValue = useCallback((dotKey, value) => {
    setGroupedConfig((prev) => setDotKey(prev, dotKey, value));
  }, []);

  const resetConfigValue = useCallback((dotKey) => {
    const resolvedValue = resolveDefaultValue(dotKey);
    setGroupedConfig((prev) => setDotKey(prev, dotKey, resolvedValue));
  }, []);

  // Restores every config value to its static default in one go.
  const resetAllConfigValues = useCallback(() => {
    setGroupedConfig(resolveInitialValues(staticConfig));
  }, []);

  const getConfigGroup = useCallback(
    (groupName) => {
      const staticGroup = staticConfig[groupName];
      if (!staticGroup || typeof staticGroup !== "object") return [];
      return flattenGroupEntries(staticGroup).map(([relKey, staticValue]) => {
        const dotKey = `${groupName}.${relKey}`;
        const value = readDotKey(dotKey, groupedConfig);
        const defaultValue = resolveDefaultValue(dotKey);
        return {
          dotKey,
          groupRelativeKey: relKey,
          options: Array.isArray(staticValue) ? staticValue : null,
          value,
          defaultValue,
          isChanged: !areConfigValuesEqual(value, defaultValue),
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
        resetAllConfigValues,
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
