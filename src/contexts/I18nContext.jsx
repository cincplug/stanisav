import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setActiveLocale, translate } from "../i18n/runtime";

const I18nContext = createContext(null);


// List of RTL ISO 639-3 codes supported by the app
const RTL_LOCALES = new Set(["ara", "heb", "fas", "urd"]); // Arabic, Hebrew, Persian, Urdu

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState("eng");
  const [isLocaleReady, setIsLocaleReady] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLocaleReady(false);
    setActiveLocale(locale).then(() => {
      if (!cancelled) {
        const lang = new Intl.Locale(locale).language;
        document.documentElement.lang = lang;
        const isRtl = RTL_LOCALES.has(locale);
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.classList.toggle("rtl", isRtl);
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
