import { useEffect, useMemo, useRef } from "react";
import linguisticConfig from "../../config/linguisticConfig.json";
import { useI18n } from "../../contexts/I18nContext";
import "./Properties.css";

const Properties = ({ propertyKey, selectedLanguageValue }) => {
  const { t } = useI18n();

  const property = linguisticConfig[propertyKey];
  const variants = useMemo(() => Object.entries(property.values), [property]);

  // Refs for scrolling
  const itemRefs = useRef({});

  const meshas = variants.map(([variantKey]) => {
    const label = t(`linguistic.${propertyKey}.values.${variantKey}.label`);
    const description = t(
      `linguistic.${propertyKey}.values.${variantKey}.description`,
    );
    return {
      key: `${propertyKey}-${variantKey}`,
      label,
      description,
      variantKey,
    };
  });

  // Scroll selected variant into view
  useEffect(() => {
    if (selectedLanguageValue !== undefined) {
      const ref = itemRefs.current[selectedLanguageValue];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.focus?.();
      }
    }
  }, [selectedLanguageValue]);

  return (
    <div className="properties">
      <h2 className="properties-title">
        {t(`linguistic.${propertyKey}.name`) || property.name}
      </h2>
      <dl className="properties-items">
        {meshas.map((mesha) => {
          const isCurrent =
            selectedLanguageValue !== undefined &&
            mesha.variantKey === selectedLanguageValue;
          return (
            <div
              className="properties-item"
              key={mesha.key}
              aria-current={isCurrent ? "true" : undefined}
              ref={(el) => {
                if (isCurrent) itemRefs.current[mesha.variantKey] = el;
              }}
              tabIndex={isCurrent ? -1 : undefined}
            >
              <dt className="properties-label">{mesha.label}</dt>
              <dd className="properties-description">{mesha.description}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
};

export default Properties;
