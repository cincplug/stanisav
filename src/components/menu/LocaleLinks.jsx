import languages from "../../config/languages.json";
import { useI18n } from "../../contexts/I18nContext";
import { getSupportedLocales, toUrlSlug } from "../../i18n/runtime";
import Select from "./ux/Select";

export default function LocaleLinks({ isCompact = false }) {
  const { locale, t } = useI18n();
  const currentSlug = toUrlSlug(locale);

  const options = getSupportedLocales()
    .sort()
    .map((code) => ({
      value: toUrlSlug(code),
      label: isCompact ? toUrlSlug(code) : languages[code]?.nativeName,
      code,
    }));

  const handleChange = (slug) => window.location.assign(`/${slug}`);

  return (
    <Select
      key={locale}
      options={options}
      value={currentSlug}
      onChange={handleChange}
      label={t("menu.languageSelector")}
    />
  );
}
