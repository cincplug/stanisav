import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useSpring } from "@react-spring/three";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { calculateLanguageFilterStatus } from "../../utils/sceneUtils";
import { getFeatureScore } from "../../utils/linguisticUtils";
import StageLight from "./StageLight";
import Label from "./Label";
import Mesha from "./Mesha";
import Camera from "./Camera";

const SceneReadyGate = ({ hasDrawableScene, onSceneReady }) => {
  const visualReadyRef = useRef(false);

  useEffect(() => {
    if (!hasDrawableScene) {
      visualReadyRef.current = false;
      onSceneReady(false);
    }
  }, [hasDrawableScene, onSceneReady]);

  useFrame(() => {
    if (hasDrawableScene && !visualReadyRef.current) {
      visualReadyRef.current = true;
      onSceneReady(true);
    }
  });

  return null;
};

const Stage = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
  languageColors,
}) => {
  const { controls } = useControls();
  const {
    cameraX,
    cameraY,
    cameraZ,
    fov,
    near,
    far,
    backgroundColor,
    isMyMesha,
    tension,
    friction,
  } = controls;

  const { filteringUtils, selectedLanguage } = useLanguageSelection();

  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions, sortedLanguageCodes } = useLayoutManager(
    data,
    controls,
    onNodesReady,
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
  const meshaAudioSource = data?.languageData?.[meshaLanguageCode]?.sampleUrl;
  const tonalityType =
    getFeatureScore("tonality", meshaLinguisticProperties?.tonality) - 1;

  const meshaPosition = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      return [pos.x, pos.y, pos.z];
    }
    return [0, 0, 0];
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

  const { stageLightMultiplier, meshaLightMultiplier } = useSpring({
    stageLightMultiplier: selectedLanguage ? 0 : 1,
    meshaLightMultiplier: 1,
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
      gl={{ antialias: true, clearColor: backgroundColor }}
    >
      <SceneReadyGate
        hasDrawableScene={hasDrawableScene}
        onSceneReady={onSceneReady}
      />

      <color attach="background" args={[backgroundColor]} />

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
          audioSource={meshaAudioSource}
          animateFromAudio={isMyMesha}
          tonalityType={tonalityType}
          looksAround={true}
          lightIntensityMultiplier={meshaLightMultiplier}
        />

        {!showEmptyMessage &&
          sortedLanguageCodes.map((langCode, index) => {
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
                labelPrefix={`${index + 1} `}
              />
            );
          })}
      </group>
    </Canvas>
  );
};

export default Stage;
