import { useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import linguisticConfig from "../../config/linguisticConfig.json";
import { useControls } from "../../contexts/ControlsContext";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import Mesha from "../r3f/Mesha";
import { getFeatureScore } from "../../utils/linguisticUtils";
import "./Properties.css";

const baseLinguisticProperties = {
  tonality: "non-tonal",
  morphology: "isolating",
  wordOrderFlexibility: "semi-flexible",
  wordOrder: "SVO",
  verbAspect: "simple",
  evidentiality: "none",
  caseCount: 0,
  phonemeCount: 30,
  maxClusterSize: 2,
  nounClassCount: 0,
};

const Properties = ({
  propertyKey,
  selectedLanguageValue,
  showsOnlySelectedLanguage,
}) => {
  const { controls } = useControls();
  const { t, isRtl } = useI18n();
  const { setSelectedProperty } = useLanguageSelection();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = controls;

  const property = linguisticConfig[propertyKey];
  const variants = useMemo(() => Object.entries(property.values), [property]);

  // Refs for scrolling
  const itemRefs = useRef({});

  const meshas = variants.map(([variantKey]) => {
    const linguisticProperties = {
      ...baseLinguisticProperties,
      [propertyKey]: variantKey,
    };
    const label = t(`linguistic.${propertyKey}.values.${variantKey}.label`);
    const description = t(
      `linguistic.${propertyKey}.values.${variantKey}.description`,
    );
    return {
      key: `${propertyKey}-${variantKey}`,
      label,
      description,
      color: "#ecb",
      linguisticProperties,
      stripesType:
        getFeatureScore("tonality", linguisticProperties?.tonality) - 1,
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
      <div className="properties-items">
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
              <h3 className="properties-label">{mesha.label}</h3>
              <div className="properties-mesha">
                <Canvas
                  camera={{
                    position: [cameraX, cameraY, cameraZ],
                    fov,
                    near,
                    far,
                  }}
                  gl={{ antialias: true, clearColor: bgColor }}
                >
                  <color attach="background" args={[bgColor]} />
                  <Mesha
                    linguisticProperties={mesha.linguisticProperties}
                    color={mesha.color}
                    position={[0, -5, 100]}
                    isMyMesha={false}
                    looksAround
                    stripesType={mesha.stripesType}
                    autoRotateSpeed={1}
                  />
                </Canvas>
              </div>

              <div className="properties-description">{mesha.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Properties;
