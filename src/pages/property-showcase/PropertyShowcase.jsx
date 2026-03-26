import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";
import linguisticConfig from "../../config/linguisticConfig.json";
import Mesha from "../../components/r3f/Mesha";
import { getFeatureScore } from "../../utils/linguisticUtils";
import "./PropertyShowcase.css";
import { useI18n } from "../../contexts/I18nContext";

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

const PropertyShowcase = ({ propertyKey }) => {
  const { controls } = useControls();
  const { t } = useI18n();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = controls;

  const property = linguisticConfig[propertyKey];
  const variants = useMemo(() => Object.entries(property.values), [property]);

  // Remove useMemo for meshas, compute directly in render
  const meshas = variants.map(([variantKey], index) => {
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
    };
  });

  return (
    <div className="property-showcase">
      <h2 className="property-showcase-title">
        {t(`linguistic.${propertyKey}.name`) || property.name}
      </h2>
      <div className="property-showcase-items">
        {meshas.map((mesha) => (
          <div className="property-showcase-item" key={mesha.key}>
            <h3 className="property-showcase-label">{mesha.label}</h3>
            <div className="property-showcase-mesha">
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
                />
              </Canvas>
            </div>

            <div className="property-showcase-description">
              {mesha.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyShowcase;
