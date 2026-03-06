import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import {
  defaultLocale,
  isSupportedLocale,
  normalizeLocale,
} from "../../i18n/runtime";

const getPathWithoutLocale = (pathname) => pathname.replace(/^\/[^/]+/, "");

function LocaleLayout() {
  const { locale } = useParams();
  const location = useLocation();
  const { setLocale } = useI18n();

  const normalizedLocale = normalizeLocale(locale);

  useEffect(() => {
    if (isSupportedLocale(normalizedLocale)) {
      setLocale(normalizedLocale);
    }
  }, [normalizedLocale, setLocale]);

  if (!isSupportedLocale(normalizedLocale)) {
    const restPath = getPathWithoutLocale(location.pathname);
    return (
      <Navigate
        to={`/${defaultLocale}${restPath}${location.search}${location.hash}`}
        replace
      />
    );
  }

  if (locale !== normalizedLocale) {
    const restPath = getPathWithoutLocale(location.pathname);
    return (
      <Navigate
        to={`/${normalizedLocale}${restPath}${location.search}${location.hash}`}
        replace
      />
    );
  }

  return <Outlet />;
}

export default LocaleLayout;
