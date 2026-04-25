import { useEffect, useRef, useState } from "react";
import { ExpandIcon } from "../../menu/MenuIcons";
import "./Select.css";

/**
 * Generic custom-select-on-top-of-native-select dropdown.
 *
 * Props:
 *   options    – [{ value: string, label: string, ...rest }]
 *                `value` is the option identifier passed to onChange.
 *                `label` is the display text. Extra fields are forwarded to renderItem.
 *   value      – currently selected value
 *   onChange   – (value: string) => void  (called for both native and custom paths)
 *   renderItem – optional ({ option, index, isSelected, onSelect, onKeyDown }) => ReactNode
 *                Must render an element with className="select-option" for keyboard focus.
 *                Defaults to a plain <button>.
 *   label      – accessible name used for both the <nav> landmark and the hidden <select>;
 *                pass a translated string, one key covers both.
 */
export default function Select({
  options,
  value,
  onChange,
  renderItem,
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const nativeRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  const focusItem = (index) => {
    const items = listRef.current?.querySelectorAll(".select-option");
    items?.[index]?.focus();
  };

  const handleListKeyDown = (e, index) => {
    const items = listRef.current?.querySelectorAll(".select-option");
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
      setIsOpen(false);
      nativeRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (
        listRef.current &&
        !listRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNativeChange = (e) => onChange(e.target.value);

  const handleNativeKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setIsOpen(true);
      requestAnimationFrame(() => focusItem(0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      requestAnimationFrame(() => focusItem(options.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleToggleClick = () => setIsOpen((v) => !v);

  const handleNavBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  const makeItemOnSelect = (val) => () => {
    onChange(val);
    setIsOpen(false);
  };

  const makeItemKeyDown = (index) => (e) => handleListKeyDown(e, index);

  return (
    <div className="select-nav" onBlur={handleNavBlur}>
      <select
        ref={nativeRef}
        value={value}
        onChange={handleNativeChange}
        className="select-native screenreader-only"
        aria-label={label}
        onKeyDown={handleNativeKeyDown}
      >
        {options.map(({ value: val, label }) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      <button
        ref={buttonRef}
        type="button"
        className="select-toggle"
        aria-hidden="true"
        tabIndex={-1}
        onClick={handleToggleClick}
      >
        <span className="select-current">{currentLabel}</span>
        <span className="select-arrow">
          <ExpandIcon />
        </span>
      </button>
      {isOpen && (
        <ul ref={listRef} className="select-list" aria-hidden="true">
          {options.map((option, index) => (
            <li key={option.value}>
              {renderItem ? (
                renderItem({
                  option,
                  index,
                  isSelected: option.value === value,
                  onSelect: makeItemOnSelect(option.value),
                  onKeyDown: makeItemKeyDown(index),
                })
              ) : (
                <button
                  type="button"
                  className="select-option"
                  aria-current={option.value === value ? "true" : undefined}
                  onClick={makeItemOnSelect(option.value)}
                  onKeyDown={makeItemKeyDown(index)}
                >
                  {option.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
