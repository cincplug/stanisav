import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useControls } from "../contexts/ControlsContext";
import linguisticConfig from "../config/linguisticConfig.json";
import Mesha from "./r3f/Mesha";
import { getFeatureScore } from "../utils/linguisticUtils";
import "./Properties.css";
import { useI18n } from "../contexts/I18nContext";

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

const Properties = ({ propertyKey }) => {
  const { controls } = useControls();
  const { t } = useI18n();
  const { cameraX, cameraY, cameraZ, fov, near, far, bgColor } = controls;

  const property = linguisticConfig[propertyKey];
  const variants = useMemo(() => Object.entries(property.values), [property]);

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
    };
  });

  return (
    <div className="properties">
      <h2 className="properties-title">
        {t(`linguistic.${propertyKey}.name`) || property.name}
      </h2>
      <div className="properties-items">
        {meshas.map((mesha) => (
          <div className="properties-item" key={mesha.key}>
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
                />
              </Canvas>
            </div>

            <div className="properties-description">{mesha.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;
