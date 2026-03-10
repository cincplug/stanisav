import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setActiveLocale, translate } from "../i18n/runtime";

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState("eng");
  const [isLocaleReady, setIsLocaleReady] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLocaleReady(false);
    setActiveLocale(locale).then(() => {
      if (!cancelled) {
        document.documentElement.lang = new Intl.Locale(locale).language;
        setIsLocaleReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: translate,
      isLocaleReady,
    }),
    [locale, isLocaleReady],
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
