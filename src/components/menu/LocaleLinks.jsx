import { Link } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext";
import { getSupportedLocales, toUrlSlug } from "../../i18n/runtime";
import languages from "../../config/languages.json";
import Select from "./ux/Select";

export default function LocaleLinks() {
  const { locale, t } = useI18n();
  const currentSlug = toUrlSlug(locale);

  const options = getSupportedLocales()
    .sort()
    .map((code) => ({
      value: toUrlSlug(code),
      label: languages[code]?.nativeName || code,
      code,
    }));

  const handleChange = (slug) => window.location.assign(`/${slug}`);

  const renderLocaleItem = ({ option, isSelected, onSelect, onKeyDown }) => (
    <Link
      to={`/${option.value}`}
      className="select-option"
      onClick={(e) => {
        e.preventDefault();
        onSelect(option.value);
        window.location.assign(`/${option.value}`);
      }}
      aria-current={isSelected ? "true" : undefined}
      onKeyDown={onKeyDown}
    >
      {option.label}
    </Link>
  );

  return (
    // key={locale} resets the open state whenever the locale changes
    <Select
      key={locale}
      options={options}
      value={currentSlug}
      onChange={handleChange}
      label={t("menu.languageSelector")}
      renderItem={renderLocaleItem}
    />
  );
}
