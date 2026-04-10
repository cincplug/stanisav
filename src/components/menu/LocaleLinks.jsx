import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext";
import { getSupportedLocales, toUrlSlug } from "../../i18n/runtime";
import languages from "../../config/languages.json";
import "./LocaleLinks.css";

export default function LocaleLinks() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const locales = getSupportedLocales().sort();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const currentSlug = toUrlSlug(locale);

  const allLocales = locales.map((code) => ({
    code,
    nativeName: languages[code]?.nativeName || code,
    slug: toUrlSlug(code),
  }));

  const handleLanguageChange = (slug) => {
    navigate(`/${slug}`);
  };

  const currentNativeName =
    allLocales.find(({ slug }) => slug === currentSlug)?.nativeName ||
    languages[locale]?.nativeName ||
    locale;

  const focusItem = (index) => {
    const items = listRef.current?.querySelectorAll(".locale-dropdown-option");
    if (items?.[index]) {
      items[index].focus();
    }
  };

  const handleListKeyDown = (e, index) => {
    const items = listRef.current?.querySelectorAll(".locale-dropdown-option");
    const count = items?.length ?? 0;

    if (count === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem((index + 1) % count);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem((index - 1 + count) % count);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(count - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [locale]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        listRef.current &&
        !listRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <nav aria-label="Language selector" className="locale-dropdown-nav">
      <select
        value={currentSlug}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="locale-native-select screenreader-only"
        aria-label="Select language"
      >
        {allLocales.map(({ code, nativeName, slug }) => (
          <option key={code} value={slug}>
            {nativeName}
          </option>
        ))}
      </select>

      <button
        ref={buttonRef}
        type="button"
        className="locale-dropdown-toggle"
        aria-hidden="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem(0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem(allLocales.length - 1));
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span className="locale-dropdown-current">{currentNativeName}</span>
        <span className="locale-dropdown-arrow">▼</span>
      </button>

      {open && (
        <ul ref={listRef} className="locale-dropdown-list" aria-hidden="true">
          {allLocales.map(({ code, nativeName, slug }, index) => (
            <li key={code}>
              <Link
                to={`/${slug}`}
                className="locale-dropdown-option"
                onClick={() => setOpen(false)}
                aria-current={code === locale ? "true" : undefined}
                onKeyDown={(e) => handleListKeyDown(e, index)}
              >
                {nativeName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
