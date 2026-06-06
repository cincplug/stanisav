import { createContext, useContext, useMemo } from "react";
import { calculateLanguageColors } from "../utils/colorUtils";
import { useAppStateContext } from "./AppStateContext";
import { useControlsContext } from "./ControlsContext";

const ColorsContext = createContext(null);

export const LanguageColorsProvider = ({ children }) => {
  const { data } = useAppStateContext();
  const { controls } = useControlsContext();

  const languageColors = useMemo(() => {
    if (!data?.languageData || !data?.languageLineages) return {};
    return calculateLanguageColors(
      data.languageData,
      data.languageLineages,
      controls,
    );
  }, [data?.languageData, data?.languageLineages, controls]);

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
