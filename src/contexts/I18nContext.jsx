import { createContext, useContext, useMemo, useState } from "react";
import enMessages from "../i18n/messages/en.json";

const messagesByLocale = {
  en: enMessages,
};

const I18nContext = createContext(null);

const interpolate = (message, params = {}) =>
  message.replace(/\{(\w+)\}/g, (fullMatch, key) => {
    const value = params[key];
    return value === undefined || value === null ? fullMatch : String(value);
  });

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState("en");

  const value = useMemo(() => {
    const messages = messagesByLocale[locale] || messagesByLocale.en;

    const t = (key, params) => {
      const message = messages[key] || messagesByLocale.en[key];
      return message ? interpolate(message, params) : key;
    };

    return {
      locale,
      setLocale,
      t,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18nContext must be used within an I18nProvider");
  }
  return context;
};
