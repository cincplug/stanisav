import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";
import linguisticConfig from "../../config/linguisticConfig.json";
import Mesha from "../../components/r3f/Mesha";
import { getFeatureScore } from "../../utils/linguisticUtils";
import "./PropertyShowcase.css";

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

  const meshas = useMemo(
    () =>
      variants.map(([variantKey], index) => {
        const linguisticProperties = {
          ...baseLinguisticProperties,
          [propertyKey]: variantKey,
        };
        return {
          key: `${propertyKey}-${variantKey}`,
          label: variantKey,
          color: "#ffcc99",
          linguisticProperties,
          tonalityType:
            getFeatureScore("tonality", linguisticProperties?.tonality) - 1,
        };
      }),
    [variants, propertyKey],
  );

  return (
    <div className="property-showcase" style={{ background: backgroundColor }}>
      <div className="property-showcase-title">{property.name}</div>
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
                  position={[0, -5, 100]}
                  audioSource={null}
                  animateFromAudio={false}
                  tonalityType={mesha.tonalityType}
                />
              </Canvas>
            </div>
            <div className="property-showcase-label">{mesha.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyShowcase;
