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

  const currentNativeName = languages[locale]?.nativeName || locale;

  // All locales including current, for the listbox
  const allLocales = locales.map((code) => ({
    code,
    nativeName: languages[code]?.nativeName || code,
    slug: toUrlSlug(code),
  }));

  const focusOption = (index) => {
    const options = listRef.current?.querySelectorAll("[role='option']");
    if (options?.[index]) options[index].focus();
  };

  const handleListKeyDown = (e, index) => {
    const options = listRef.current?.querySelectorAll("[role='option']");
    const count = options?.length ?? 0;

    if (e.key === "Tab") {
      const isLast = index === count - 1;
      const isFirst = index === 0;
      if ((!e.shiftKey && isLast) || (e.shiftKey && isFirst)) {
        setOpen(false);
        // let Tab move focus naturally, don't preventDefault
      } else {
        // mid-list Tab: move focus manually and prevent default
        e.preventDefault();
        focusOption(e.shiftKey ? index - 1 : index + 1);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusOption((index + 1) % count);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusOption((index - 1 + count) % count);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusOption(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusOption(count - 1);
    } else if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

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
      <button
        ref={buttonRef}
        className="locale-dropdown-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="locale-dropdown-list"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setTimeout(() => focusOption(0), 0);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setTimeout(() => focusOption(allLocales.length - 1), 0);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
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
          aria-activedescendant={`locale-option-${locale}`}
        >
          {allLocales.map(({ code, nativeName, slug }, index) => (
            <li key={code} role="none">
              <a
                id={`locale-option-${code}`}
                href={`/${slug}`}
                className="locale-dropdown-option"
                tabIndex={0}
                role="option"
                aria-selected={code === locale}
                onClick={() => setOpen(false)}
                onKeyDown={(e) => handleListKeyDown(e, index)}
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
