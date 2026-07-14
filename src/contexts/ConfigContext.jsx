import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import staticConfig from "../config/config.json";
import {
  configStorageKey,
  presetDownloadFileName,
} from "../config/storageConfig.json";
import {
  downloadJsonFile,
  readStoredConfig,
  writeStoredConfig,
} from "../utils/storageUtils.js";
import {
  areConfigValuesEqual,
  diffFromDefaults,
  flattenConfig,
  flattenGroupEntries,
  ignoredGroupNames,
  mergeStoredConfig,
  readDotKey,
  resolveDefaultValue,
  resolveInitialValues,
  setDotKey,
} from "../utils/configUtils.js";

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [groupedConfig, setGroupedConfig] = useState(() => {
    const defaultValues = resolveInitialValues(staticConfig);
    const storedConfig = readStoredConfig(configStorageKey);
    return storedConfig
      ? mergeStoredConfig(defaultValues, storedConfig)
      : defaultValues;
  });

  // Persists the current config to sessionStorage whenever it changes,
  // so values survive a page refresh.
  useEffect(() => {
    writeStoredConfig(configStorageKey, groupedConfig);
  }, [groupedConfig]);

  const updateConfigValue = useCallback((dotKey, value) => {
    setGroupedConfig((prev) => setDotKey(prev, dotKey, value));
  }, []);

  const resetConfigValue = useCallback((dotKey) => {
    const resolvedValue = resolveDefaultValue(dotKey);
    setGroupedConfig((prev) => setDotKey(prev, dotKey, resolvedValue));
  }, []);

  // Restores every config value to its static default, except ignored groups
  // (session/user state, e.g. sort order, menu-expanded), which are left as they are.
  const resetAllConfigValues = useCallback(() => {
    setGroupedConfig((prev) => {
      const baseValues = resolveInitialValues(staticConfig);
      for (const groupName of ignoredGroupNames) {
        baseValues[groupName] = prev[groupName];
      }
      return baseValues;
    });
  }, []);

  // Applies an arbitrary preset object (from a loaded file or fetched preset) on top of
  // the default shape, so a partial preset (only changed keys) still resolves cleanly.
  // Ignored groups (session/user state, e.g. sort order, menu-expanded) are left as they
  // currently are - a preset should never reset or contain those.
  const applyConfigPreset = useCallback((presetObject) => {
    setGroupedConfig((prev) => {
      const baseValues = resolveInitialValues(staticConfig);
      for (const groupName of ignoredGroupNames) {
        baseValues[groupName] = prev[groupName];
      }
      return mergeStoredConfig(baseValues, presetObject);
    });
  }, []);

  // Downloads only the design-relevant values that differ from default: ignored
  // groups (session/user state) are excluded, and unchanged values are omitted.
  const downloadConfigPreset = useCallback(() => {
    const defaultValues = resolveInitialValues(staticConfig);
    const changedValues = {};
    for (const [groupName, groupDefaults] of Object.entries(defaultValues)) {
      if (ignoredGroupNames.includes(groupName)) continue;
      const groupDiff = diffFromDefaults(
        groupDefaults,
        groupedConfig[groupName],
      );
      if (groupDiff !== undefined) changedValues[groupName] = groupDiff;
    }
    downloadJsonFile(changedValues, presetDownloadFileName);
  }, [groupedConfig]);

  // Reads a JSON file picked by the user and applies it as the current config.
  const loadConfigFromFile = useCallback(
    async (file) => {
      const fileText = await file.text();
      applyConfigPreset(JSON.parse(fileText));
    },
    [applyConfigPreset],
  );

  // Fetches a named preset from /presets/<name>.json and applies it.
  const loadConfigPresetByName = useCallback(
    async (presetName) => {
      const response = await fetch(`/presets/${presetName}.json`);
      const presetObject = await response.json();
      applyConfigPreset(presetObject);
    },
    [applyConfigPreset],
  );

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
        downloadConfigPreset,
        loadConfigFromFile,
        loadConfigPresetByName,
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
