import { useState, useRef, useEffect } from "react";
import { useI18n } from "../../contexts/I18nContext";
import { getSupportedLocales, toUrlSlug } from "../../i18n/runtime";
import languages from "../../config/languages.json";
import "./LocaleLinks.css";

export default function LocaleLinks() {
  const { locale } = useI18n();
  const locales = getSupportedLocales().sort();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  // Only show the current locale as the button label, using nativeName from languages.json
  const currentNativeName = languages[locale]?.nativeName || locale;

  // All other locales for dropdown, using native names
  const otherLocales = locales
    .filter((code) => code !== locale)
    .map((code) => ({
      code,
      nativeName: languages[code]?.nativeName || code,
      slug: toUrlSlug(code),
    }));

  // Handle keyboard navigation and closing
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab") {
        setOpen(false);
      }
    }
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
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <nav aria-label="Language selector" className="locale-dropdown-nav">
      <button
        ref={buttonRef}
        className="locale-dropdown-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="locale-dropdown-list"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
            setTimeout(() => {
              listRef.current?.querySelector("[role='option']")?.focus();
            }, 0);
          }
        }}
        tabIndex={0}
        aria-label={currentNativeName}
      >
        <span className="locale-dropdown-current">{currentNativeName}</span>
        <span className="locale-dropdown-arrow" aria-hidden="true">
          ▼
        </span>
      </button>
      {open && (
        <ul
          id="locale-dropdown-list"
          ref={listRef}
          className="locale-dropdown-list"
          role="listbox"
          aria-label="Available languages"
          tabIndex={-1}
        >
          {otherLocales.map(({ code, nativeName, slug }) => (
            <li key={code} role="none">
              <a
                href={`/${slug}`}
                className="locale-dropdown-option"
                tabIndex={0}
                role="option"
                aria-selected={false}
                onClick={() => setOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    buttonRef.current?.focus();
                  }
                }}
              >
                {nativeName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
