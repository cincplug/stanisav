import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useI18nContext } from "../../contexts/I18nContext";
import {
  defaultUrlSlug,
  resolveUrlLocale,
  toUrlSlug,
} from "../../i18n/runtime";

const getPathWithoutLocale = (pathname) => pathname.replace(/^\/[^/]+/, "");

function LocaleLayout() {
  const { locale } = useParams();
  const location = useLocation();
  const { setLocale } = useI18nContext();

  const iso3 = resolveUrlLocale(locale);
  const canonicalSlug = iso3 ? toUrlSlug(iso3) : null;

  useEffect(() => {
    if (iso3) {
      setLocale(iso3);
    }
  }, [iso3, setLocale]);

  if (!iso3) {
    const restPath = getPathWithoutLocale(location.pathname);
    return (
      <Navigate
        to={`/${defaultUrlSlug}${restPath}${location.search}${location.hash}`}
        replace
      />
    );
  }

  if (locale !== canonicalSlug) {
    const restPath = getPathWithoutLocale(location.pathname);
    return (
      <Navigate
        to={`/${canonicalSlug}${restPath}${location.search}${location.hash}`}
        replace
      />
    );
  }

  return <Outlet />;
}

export default LocaleLayout;
