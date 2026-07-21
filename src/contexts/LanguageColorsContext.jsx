import { createContext, useContext, useMemo } from "react";
import { calculateLanguageColors } from "../utils/colorUtils";
import { useAppStateContext } from "./AppStateContext";
import { useConfigContext } from "./ConfigContext";

const ColorsContext = createContext(null);

export const LanguageColorsProvider = ({ children }) => {
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const { hue, lightness, saturation, hueCircle, maxHueSpread } = config;

  const languageColors = useMemo(() => {
    if (!data) return {};

    const { languages, lineages } = data;

    return calculateLanguageColors(
      languages,
      lineages,
      hue,
      lightness,
      saturation,
      hueCircle,
      maxHueSpread,
    );
  }, [data?.languages, data?.lineages, config]);

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
