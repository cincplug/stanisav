import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";
import linguisticConfig from "../../config/linguisticConfig.json";
import Mesha from "../../components/r3f/Mesha";
import { getFeatureScore } from "../../utils/linguisticUtils";
import "./PropertyShowcase.css";
import { useI18n } from "../../hooks/useI18n";

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
  const { t, locale } = useI18n();
  const {
    cameraX,
    cameraY,
    cameraZ,
    fov,
    near,
    far,
    backgroundColor,
    meshaSize,
  } = controls;

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
      tonalityType:
        getFeatureScore("tonality", linguisticProperties?.tonality) - 1,
    };
  });

  return (
    <div className="property-showcase" style={{ background: backgroundColor }}>
      <div className="property-showcase-title">
        {t(`linguistic.${propertyKey}.name`) || property.name}
      </div>
      <div className="property-showcase-flex">
        {meshas.map((mesha) => (
          <div className="property-showcase-item" key={mesha.key}>
            <div className="property-showcase-canvas">
              <Canvas
                camera={{
                  position: [cameraX, cameraY, cameraZ],
                  fov,
                  near,
                  far,
                }}
                gl={{ antialias: true, clearColor: backgroundColor }}
              >
                <color attach="background" args={[backgroundColor]} />
                <Mesha
                  linguisticProperties={mesha.linguisticProperties}
                  color={mesha.color}
                  position={[0, -5, 80]}
                  audioSource={null}
                  animateFromAudio={false}
                  looksAround
                  tonalityType={mesha.tonalityType}
                />
              </Canvas>
            </div>
            <div className="property-showcase-label">{mesha.label}</div>
            {mesha.description && (
              <div className="property-showcase-description">
                {mesha.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyShowcase;
