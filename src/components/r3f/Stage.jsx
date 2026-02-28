import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { calculateLanguageFilterStatus } from "../../utils/sceneUtils";
import { calculateLanguageColors } from "../../utils/colorUtils";
import { getTonalityType } from "../../utils/linguisticUtils";
import StageLight from "./StageLight";
import Node from "./Node";
import Mesha from "./Mesha";
import Camera from "./Camera";

const Stage = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
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
  } = controls;
  const { filteringUtils, selectedLanguage, groupColors } =
    useLanguageSelection();

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
        data?.languageGroups,
      ),
    [
      sortedLanguageCodes,
      data?.typologicalFeatures,
      filteringUtils,
      data?.languageGroups,
    ],
  );

  const languageColors = useMemo(
    () =>
      calculateLanguageColors(
        data?.languageData,
        data?.languageGroups,
        groupColors,
      ),
    [data?.languageData, data?.languageGroups, groupColors],
  );

  const meshaLanguageCode = selectedLanguage || sortedLanguageCodes[0];
  const meshaLinguisticProperties =
    data?.typologicalFeatures?.[meshaLanguageCode];
  const meshaColor = languageColors[meshaLanguageCode];
  const meshaAudioSource = data?.languageData?.[meshaLanguageCode]?.sampleUrl;
  const tonalityType = getTonalityType(meshaLinguisticProperties);

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
    if (isInitialized && data && Object.keys(formattedPositions).length > 0) {
      onSceneReady(true);
    }
  }, [isInitialized, data, formattedPositions, onSceneReady]);

  useEffect(() => {
    if (onEmptyFilterChange) {
      onEmptyFilterChange(showEmptyMessage);
    }
  }, [showEmptyMessage, onEmptyFilterChange]);

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
      <color attach="background" args={[backgroundColor]} />

      <OrbitControls
        enableDamping={true}
        makeDefault={true}
        enableZoom={false}
        enableRotate={!selectedLanguage}
      />

      {!selectedLanguage && <StageLight />}

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
        />
        {!showEmptyMessage &&
          sortedLanguageCodes.map((langCode, index) => {
            const position = formattedPositions[langCode];
            const filterStatus = languageFilterStatus[langCode];
            if (!position || !filterStatus?.isVisible) return null;

            const color = languageColors[langCode];

            return (
              <Node
                key={langCode}
                languageCode={langCode}
                language={data.languageData[langCode]}
                position={[position.x, position.y, position.z]}
                speakerCount={data.speakerData[langCode] || 1}
                isSelected={selectedLanguage === langCode}
                isFiltered={filterStatus.isFiltered}
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
