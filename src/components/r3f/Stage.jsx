import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { calculateLanguageFilterStatus } from "../../utils/sceneUtils";
import { calculateLanguageColors } from "../../utils/colorUtils";
import StageLight from "./StageLight";
import Node from "./Node";
import Mesha from "./Mesha";
import Camera from "./Camera";

const Stage = ({
  isMenuCollapsed,
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
}) => {
  const { controls } = useControls();
  const {
    positionX,
    positionY,
    positionZ,
    fov,
    near,
    far,
    backgroundColor,
    ambientLightIntensity,
  } = controls;
  const { filteringUtils, selectedLanguage, groupColors } =
    useLanguageSelection();

  // Data and layout
  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions, sortedLanguageCodes } = useLayoutManager(
    data,
    controls,
    onNodesReady,
  );

  // Filtering
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

  // Calculate colors for all languages with hue shifts
  const languageColors = useMemo(
    () =>
      calculateLanguageColors(
        data?.languageData,
        data?.languageGroups,
        groupColors,
      ),
    [data?.languageData, data?.languageGroups, groupColors],
  );

  const hasActiveFilters = Object.keys(filteringUtils).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const showEmptyMessage = hasActiveFilters && visibleLanguages.length === 0;

  // Scene ready effect
  useEffect(() => {
    if (isInitialized && data && Object.keys(formattedPositions).length > 0) {
      onSceneReady(true);
    }
  }, [isInitialized, data, formattedPositions, onSceneReady]);

  // Empty filter effect
  useEffect(() => {
    if (onEmptyFilterChange) {
      onEmptyFilterChange(showEmptyMessage);
    }
  }, [showEmptyMessage, onEmptyFilterChange]);

  if (!data || !isInitialized || sortedLanguageCodes.length === 0) {
    return null;
  }

  const ambientLightModifier = selectedLanguage ? 0.7 : 1.2;

  return (
    <Canvas
      className={`${isMenuCollapsed ? "menu-collapsed" : "menu-expanded"}`}
      camera={{
        position: [positionX, positionY, positionZ],
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
      />

      {!selectedLanguage && <StageLight />}

      <ambientLight intensity={ambientLightIntensity * ambientLightModifier} />

      <Camera
        languageNodes={formattedPositions}
        data={data}
        controls={controls}
        selectedLanguage={selectedLanguage}
      />

      <group>
        <Mesha />
        {!showEmptyMessage &&
          sortedLanguageCodes.map((langCode, idx) => {
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
                labelPrefix={`${idx + 1} `}
              />
            );
          })}
      </group>
    </Canvas>
  );
};

export default Stage;
