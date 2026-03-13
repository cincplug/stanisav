import { useI18n } from "../../hooks/useI18n";
import {
  getSupportedLocales,
  toUrlSlug,
  getLocalizedLanguageName,
} from "../../i18n/runtime";

export default function LocaleLinks() {
  const { locale } = useI18n();
  const locales = getSupportedLocales().sort();
  return (
    <nav>
      {locales
        .map((code, i) => (
          <a
            key={code}
            href={"/" + toUrlSlug(code)}
            aria-current={code === locale ? "page" : undefined}
          >
            {getLocalizedLanguageName(code)}
          </a>
        ))
        .reduce((prev, curr) => [prev, " ", curr])}
    </nav>
  );
}
