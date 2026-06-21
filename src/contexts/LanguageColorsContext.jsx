import { createContext, useContext, useMemo } from "react";
import { calculateLanguageColors } from "../utils/colorUtils";
import { useAppStateContext } from "./AppStateContext";
import { useConfigContext } from "./ConfigContext";

const ColorsContext = createContext(null);

export const LanguageColorsProvider = ({ children }) => {
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const { hue, lightness, saturation, hueCircle, maxSiblingSpread } =
    config.colors;

  const languageColors = useMemo(() => {
    if (!data) return {};

    const { languageData, languageLineages } = data;

    return calculateLanguageColors(
      languageData,
      languageLineages,
      hue,
      lightness,
      saturation,
      hueCircle,
      maxSiblingSpread,
    );
  }, [data?.languageData, data?.languageLineages, config.header]);

  return (
    <ColorsContext.Provider value={{ languageColors }}>
      {children}
    </ColorsContext.Provider>
  );
};

export const useLanguageColorsContext = () => {
  const context = useContext(ColorsContext);
  if (!context)
    throw new Error(
      "useLanguageColors must be used within a LanguageColorsProvider",
    );
  return context;
};
