import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "../../contexts/ControlsContext";
import linguisticConfig from "../../config/linguisticConfig.json";
import Mesha from "../../components/r3f/Mesha";
import StageLight from "../../components/r3f/StageLight";

const baseLinguisticProperties = {
  tonality: "non-tonal",
  morphology: "isolating",
  wordOrderFlexibility: "semi-flexible",
  wordOrder: "SVO",
  verbAspect: "binary",
  evidentiality: "simple",
  caseCount: 3,
  phonemeCount: 30,
  maxClusterSize: 2,
  nounClassCount: 2,
};

const PropertyShowcase = ({ propertyKey }) => {
  const { controls } = useControls();
  const { cameraX, cameraY, cameraZ, fov, near, far, backgroundColor } =
    controls;

  const property = linguisticConfig[propertyKey];
  const variants = useMemo(() => Object.entries(property.values), [property]);

  const positions = useMemo(() => {
    const columns = Math.ceil(Math.sqrt(variants.length));
    const rows = Math.ceil(variants.length / columns);
    const xGap = 14;
    const yGap = 10;
    const offsetX = ((columns - 1) * xGap) / 2;
    const offsetY = ((rows - 1) * yGap) / 2;

    return variants.map((_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return [col * xGap - offsetX, offsetY - row * yGap, 0];
    });
  }, [variants]);

  const meshas = useMemo(
    () =>
      variants.map(([variantKey], index) => ({
        key: `${propertyKey}-${variantKey}`,
        label: variantKey,
        color: `hsl(${(index * 360) / variants.length} 80% 55%)`,
        position: positions[index],
        linguisticProperties: {
          ...baseLinguisticProperties,
          [propertyKey]: variantKey,
        },
      })),
    [variants, positions, propertyKey],
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: backgroundColor,
        position: "relative",
      }}
    >
      <Canvas
        camera={{ position: [cameraX, cameraY, cameraZ], fov, near, far }}
        gl={{ antialias: true, clearColor: backgroundColor }}
      >
        <color attach="background" args={[backgroundColor]} />
        <OrbitControls enableDamping={true} makeDefault={true} enableZoom={true} />
        <StageLight />
        <group>
          {meshas.map((mesha) => (
            <Mesha
              key={mesha.key}
              languageCode={mesha.key}
              linguisticProperties={mesha.linguisticProperties}
              color={mesha.color}
              position={mesha.position}
              audioSource={null}
              animateFromAudio={false}
            />
          ))}
        </group>
      </Canvas>

      <div
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          color: "white",
          fontFamily: "system-ui, sans-serif",
          fontSize: 20,
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        {property.name}
      </div>

      <div
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          color: "white",
          display: "grid",
          gap: 6,
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
        }}
      >
        {meshas.map((mesha) => (
          <div key={`${mesha.key}-label`}>{mesha.label}</div>
        ))}
      </div>
    </div>
  );
};

export default PropertyShowcase;