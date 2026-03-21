import SceneReadyGate from "./SceneReadyGate";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { interpolateColorsByTime } from "../../utils/colorUtils";
import { useSpring } from "@react-spring/three";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { calculateLanguageFilterStatus } from "../../utils/sceneUtils";
import { getFeatureScore } from "../../utils/linguisticUtils";
import { getSortingData, sortLanguages } from "../../utils/sortingUtils";
import { LayoutEngine } from "../../modules/layoutEngine";
import lineageTree from "../../config/lineages.json";
import StageLight from "./StageLight";
import Label from "./Label";
import Mesha from "./Mesha";
import Camera from "./Camera";

const Stage = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
  languageColors,
}) => {
  const { controls, updateControl } = useControls();

  const {
    cameraX,
    cameraY,
    cameraZ,
    fov,
    near,
    far,
    bgColor,
    isMyMesha,
    tension,
    friction,
    sphereRadius,
  } = controls;

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const { bgColor, bgColorNoon } = controls;
    const newBg = interpolateColorsByTime({ bgColor, bgColorNoon, hour });
    updateControl("bgColor", newBg);
  }, []);

  const { filteringUtils, selectedLanguage } = useLanguageSelection();

  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);

  const { sortBy, labelContent, isReverse } = controls;
  const languageData = data?.languageData || {};
  const { languageCodes, languageLineages, speakerData, typologicalFeatures } =
    getSortingData(languageData);
  const sortedLanguageCodes = sortLanguages({
    allLanguages: [...languageCodes],
    languageData,
    languageLineages,
    speakerData,
    typologicalFeatures,
    sortBy,
    labelContent,
    isReverse,
  });

  const layoutEngine = useMemo(() => new LayoutEngine(), []);
  const { positions: formattedPositions } = layoutEngine.calculateLayout(
    {
      languageData,
      languageLineages,
      lineageTree,
      speakerData,
      typologicalFeatures,
    },
    controls,
  );

  const languageFilterStatus = useMemo(
    () =>
      calculateLanguageFilterStatus(
        sortedLanguageCodes,
        data?.typologicalFeatures,
        filteringUtils,
        data?.languageLineages,
      ),
    [
      sortedLanguageCodes,
      data?.typologicalFeatures,
      filteringUtils,
      data?.languageLineages,
    ],
  );

  const meshaLanguageCode = selectedLanguage || sortedLanguageCodes[0];
  const meshaLinguisticProperties =
    data?.typologicalFeatures?.[meshaLanguageCode];
  const meshaColor = languageColors[meshaLanguageCode];
  const tonalityType =
    getFeatureScore("tonality", meshaLinguisticProperties?.tonality) - 1;

  const meshaPosition = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      return [pos.x, pos.y, pos.z];
    }
    return [0, 0, sphereRadius];
  }, [selectedLanguage, formattedPositions]);

  const hasActiveFilters = Object.keys(filteringUtils).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const showEmptyMessage = hasActiveFilters && visibleLanguages.length === 0;

  useEffect(() => {
    if (onEmptyFilterChange) {
      onEmptyFilterChange(showEmptyMessage);
    }
  }, [showEmptyMessage, onEmptyFilterChange]);

  const { stageLightMultiplier } = useSpring({
    stageLightMultiplier: selectedLanguage ? 0 : 1,
    config: { tension, friction },
  });

  const stageLightIntensity = stageLightMultiplier.to(
    (m) => controls.stageLightIntensity * m,
  );

  const hasDrawableScene =
    Boolean(meshaColor) &&
    Object.keys(formattedPositions).length > 0 &&
    (showEmptyMessage || visibleLanguages.length > 0);

  if (!data || !isInitialized || sortedLanguageCodes.length === 0) {
    return null;
  }

  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{
        position: [cameraX, cameraY, cameraZ],
        fov,
        near,
        far,
      }}
      gl={{ antialias: true, clearColor: bgColor }}
    >
      <SceneReadyGate
        hasDrawableScene={hasDrawableScene}
        onSceneReady={onSceneReady}
      />

      <color attach="background" args={[bgColor]} />

      <OrbitControls
        enableDamping={true}
        makeDefault={true}
        enableZoom={false}
        enableRotate={!selectedLanguage}
      />

      <StageLight intensity={stageLightIntensity} />

      <Camera
        languageNodes={formattedPositions}
        data={data}
        controls={controls}
        selectedLanguage={selectedLanguage}
      />

      <group>
        <Mesha
          languageCode={meshaLanguageCode}
          linguisticProperties={meshaLinguisticProperties}
          color={meshaColor}
          position={meshaPosition}
          isMyMesha={isMyMesha}
          tonalityType={tonalityType}
          looksAround={true}
        />

        {!showEmptyMessage &&
          sortedLanguageCodes.map((langCode) => {
            const position = formattedPositions[langCode];
            const filterStatus = languageFilterStatus[langCode];
            if (!position || !filterStatus?.isVisible) return null;

            const color = languageColors[langCode];

            return (
              <Label
                key={langCode}
                languageCode={langCode}
                language={data.languageData[langCode]}
                position={[position.x, position.y, position.z]}
                isSelected={selectedLanguage === langCode}
                color={color}
              />
            );
          })}
      </group>
    </Canvas>
  );
};

export default Stage;
