import { useNavigate } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext";
import { getSupportedLocales, toUrlSlug } from "../../i18n/runtime";
import languages from "../../config/languages.json";
import "./LocaleLinks.css";

export default function LocaleLinks() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const locales = getSupportedLocales().sort();

  const currentSlug = toUrlSlug(locale);

  const allLocales = locales.map((code) => ({
    code,
    nativeName: languages[code]?.nativeName || code,
    slug: toUrlSlug(code),
  }));

  const handleLanguageChange = (slug) => {
    navigate(`/${slug}`);
  };

  return (
    <nav aria-label="Language selector" className="locale-dropdown-nav">
      <select
        value={currentSlug}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="locale-select"
        aria-label="Select language"
      >
        {allLocales.map(({ code, nativeName, slug }) => (
          <option key={code} value={slug}>
            {nativeName}
          </option>
        ))}
      </select>
    </nav>
  );
}
