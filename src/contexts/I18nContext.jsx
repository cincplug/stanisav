import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setActiveLocale, translate } from "../i18n/runtime";

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState("eng");

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: translate,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18nContext must be used within an I18nProvider");
  }
  return context;
};
