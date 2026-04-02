import SceneReadyGate from "./SceneReadyGate";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { interpolateColorsByTime } from "../../utils/colorUtils";
import { useSpring } from "@react-spring/three";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { calculateLanguageFilterStatus } from "../../utils/sceneUtils";
import { getFeatureScore } from "../../utils/linguisticUtils";
import { getSortingData, sortLanguages } from "../../utils/sortingUtils";
import { groupLanguages } from "../../utils/languageGroupingUtils";
import { getFamilyLabel } from "../../utils/configI18nUtils";
import { LayoutEngine } from "../../modules/layoutEngine";
import lineages from "../../config/lineages.json";
import StageLight from "./StageLight";
import LabelsCluster, { useClusterOpacities } from "./LabelsCluster";
import Label from "./Label";
import Mesha from "./Mesha";
import Camera from "./Camera";

// Stage clusters use single-membership grouping so each language belongs to
// exactly one cluster, matching layoutEngine's getClusterKey:
// - family: leaf lineage key with getFamilyLabel title
// - everything else: delegates to groupLanguages
const getStageClusterGroups = ({
  sortedLanguageCodes,
  sortBy,
  languageData,
  languageLineages,
  labelContent,
  isReverse,
}) => {
  if (sortBy === "family") {
    const groups = {};
    sortedLanguageCodes.forEach((code) => {
      const leafKey = languageLineages[code] ?? "isolate";
      if (!groups[leafKey]) {
        groups[leafKey] = { title: getFamilyLabel(leafKey), languages: [] };
      }
      groups[leafKey].languages.push(code);
    });
    return Object.values(groups);
  }

  return groupLanguages({
    sortedLanguageCodes,
    sortBy,
    languageData,
    languageLineages,
    labelContent,
    lineages,
    isReverse,
  });
};

// Renders all labels as a flat list with stable keys so springs persist
// across sortBy changes, plus per-cluster titles.
const LabelsLayer = ({
  groups,
  formattedPositions,
  languageFilterStatus,
  languageColors,
  languageData,
  selectedLanguage,
  segmentation,
}) => {
  const { camera } = useThree();
  const opacities = useClusterOpacities(
    camera,
    formattedPositions,
    selectedLanguage,
  );

  return (
    <>
      {/* Flat label list — stable keys ensure springs animate between layouts */}
      {Object.keys(formattedPositions).map((langCode) => {
        const position = formattedPositions[langCode];
        const filterStatus = languageFilterStatus[langCode];

        if (!position || !filterStatus?.isVisible) return null;

        const opacity = opacities[langCode] ?? 1;
        if (opacity === 0) return null;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            language={languageData[langCode]}
            position={[position.x, position.y, position.z]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
            opacity={opacity}
          />
        );
      })}

      {/* One title per cluster */}
      {groups.map((group) => (
        <LabelsCluster
          key={group.title ?? "all"}
          title={group.title}
          languageCodes={group.languages}
          formattedPositions={formattedPositions}
          selectedLanguage={selectedLanguage}
          segmentation={segmentation}
        />
      ))}
    </>
  );
};

const Stage = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
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
    segmentation,
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

  const groups = useMemo(
    () =>
      getStageClusterGroups({
        sortedLanguageCodes,
        sortBy,
        languageData,
        languageLineages,
        labelContent,
        isReverse,
      }),
    [
      sortedLanguageCodes,
      sortBy,
      languageData,
      languageLineages,
      labelContent,
      isReverse,
    ],
  );

  const layoutEngine = useMemo(() => new LayoutEngine(), []);
  const { positions: formattedPositions } = layoutEngine.calculateLayout(
    {
      languageData,
      languageLineages,
      lineageTree: lineages,
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
  const stripesType =
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
        enableZoom={!selectedLanguage}
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
        {!showEmptyMessage && (
          <LabelsLayer
            groups={groups}
            formattedPositions={formattedPositions}
            languageFilterStatus={languageFilterStatus}
            languageColors={languageColors}
            languageData={languageData}
            selectedLanguage={selectedLanguage}
            segmentation={segmentation}
          />
        )}

        <Mesha
          languageCode={meshaLanguageCode}
          linguisticProperties={meshaLinguisticProperties}
          color={meshaColor}
          position={meshaPosition}
          isMyMesha={isMyMesha}
          stripesType={stripesType}
          looksAround={true}
        />
      </group>
    </Canvas>
  );
};

export default Stage;
