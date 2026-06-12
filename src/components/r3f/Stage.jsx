import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import lineages from "../../config/lineages.json";
import { useControlsContext } from "../../contexts/ControlsContext";
import { useDragContext } from "../../contexts/DragContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useI18nContext } from "../../contexts/I18nContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { config } from "../../modules/configStore";
import { LayoutEngine } from "../../modules/layoutEngine";
import { groupLanguages } from "../../utils/groupingUtils";
import {
  calculateLanguageFilterStatus,
  calculateRadialOffset,
} from "../../utils/sceneUtils";
import { getSortingData } from "../../utils/sortingUtils";
import Camera from "./Camera";
import Labels from "./Labels";
import Mesha from "./Mesha";
import OrbitModifier from "./OrbitModifier";
import SceneReadyGate from "./SceneReadyGate";
import StageLight from "./StageLight";

const Stage = ({ onDataLoaded, onLoadingChange }) => {
  const { controls } = useControlsContext();
  const { locale, isLocaleReady } = useI18nContext();
  const { filters, selectedLanguage } = useLanguageSelectionContext();
  const { languageColors } = useLanguageColorsContext();
  const {
    isMeshaSequenceDone,
    skipSequence,
    isEntranceComplete,
    isLabelsSequenceDone,
    setIsLabelsSequenceDone,
    mentionedLanguage,
  } = useEntranceContext();
  const { isDragging } = useDragContext();
  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { rotateSpeedFactor } = config;
  const { cameraX, cameraY, cameraZ, fov, near, far } = config.camera;
  const { radialOffsetModifier, sphereRadius } = config.layout;
  const {
    bgColor,
    isMyMesha,
    tension,
    friction,
    sortBy,
    labelContent,
    isReverse,
    isSegmented,
    irrationality,
    axis,
    rotateSpeed,
    isMotionReduced,
    labelSize,
  } = controls;

  const orbitControlsRef = useRef();

  const languageData = data?.languageData || {};
  const { languageCodes, languageLineages, speakerData, typologicalFeatures } =
    useMemo(() => getSortingData(languageData), [languageData]);

  const layoutEngine = useMemo(() => new LayoutEngine(), []);
  const {
    positions: formattedPositions,
    sortedLanguages: sortedLanguageCodes,
  } = useMemo(
    () =>
      layoutEngine.calculateLayout(
        {
          languageData,
          languageLineages,
          lineageTree: lineages,
          speakerData,
          typologicalFeatures,
        },
        controls,
      ),
    [
      layoutEngine,
      languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      sphereRadius,
      labelContent,
      isReverse,
      isSegmented,
      locale,
      isLocaleReady,
      irrationality,
      axis,
    ],
  );

  const groups = useMemo(
    () =>
      groupLanguages({
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
      locale,
      isLocaleReady,
    ],
  );

  const languageFilterStatus = useMemo(
    () =>
      calculateLanguageFilterStatus(
        sortedLanguageCodes,
        data?.typologicalFeatures,
        filters,
        data?.languageLineages,
      ),
    [
      sortedLanguageCodes,
      data?.typologicalFeatures,
      filters,
      data?.languageLineages,
    ],
  );

  useEffect(() => {
    if ((selectedLanguage || isSegmented) && !isEntranceComplete) {
      skipSequence();
    }
  }, [selectedLanguage, isSegmented]);

  const meshaLanguageCode =
    selectedLanguage || mentionedLanguage || sortedLanguageCodes[0];

  const meshaPosition = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      const base = [pos.x, pos.y, pos.z];
      const radial = calculateRadialOffset(base);

      if (isSegmented) {
        return [
          base[0],
          base[1],
          base[2] + radial[2] + radialOffsetModifier + sphereRadius,
        ];
      }

      return [
        base[0] + radial[0] * radialOffsetModifier,
        base[1] + radial[1] * radialOffsetModifier + labelSize,
        base[2] + radial[2] * radialOffsetModifier,
      ];
    }

    return [0, sphereRadius, 0];
  }, [selectedLanguage, formattedPositions]);

  const hasSelectedFilters = Object.keys(filters).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const shouldShowEmptyMessage =
    hasSelectedFilters && visibleLanguages.length === 0;

  const meshaColor = languageColors[meshaLanguageCode];
  const hasDrawableScene =
    Boolean(meshaColor) &&
    Object.keys(formattedPositions).length > 0 &&
    (shouldShowEmptyMessage || visibleLanguages.length > 0);

  if (!data || !isInitialized || sortedLanguageCodes.length === 0) {
    return null;
  }

  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
      camera={{ position: [cameraX, cameraY, cameraZ], fov, near, far }}
      gl={{ antialias: true, clearColor: bgColor }}
    >
      <SceneReadyGate hasDrawableScene={hasDrawableScene} />

      <color attach="background" args={[bgColor]} />

      <OrbitControls
        ref={orbitControlsRef}
        enableDamping={true}
        makeDefault={true}
        enableZoom={isSegmented}
        enableRotate={!isSegmented && !isDragging}
        autoRotate={false}
      />

      <OrbitModifier
        orbitControlsRef={orbitControlsRef}
        axis={axis}
        speed={
          selectedLanguage
            ? rotateSpeed * rotateSpeedFactor.sceneZoomed
            : rotateSpeed * rotateSpeedFactor.sceneInitial
        }
        isEnabled={!isSegmented && isMeshaSequenceDone}
      />

      <StageLight
        cameraZ={cameraZ}
        isMotionReduced={isMotionReduced}
        isEntranceComplete={isEntranceComplete}
        tension={tension}
        friction={friction}
        isSegmented={isSegmented}
        selectedLanguage={selectedLanguage}
      />

      <Camera
        languageNodes={formattedPositions}
        selectedLanguage={selectedLanguage}
      />

      {!shouldShowEmptyMessage && isMeshaSequenceDone && (
        <Labels
          groups={groups}
          formattedPositions={formattedPositions}
          languageFilterStatus={languageFilterStatus}
          languageColors={languageColors}
          languageData={languageData}
          selectedLanguage={selectedLanguage}
          isLabelsSequenceDone={isLabelsSequenceDone}
          setIsLabelsSequenceDone={setIsLabelsSequenceDone}
        />
      )}

      <Mesha
        languageCode={meshaLanguageCode}
        position={meshaPosition}
        isMyMesha={isMyMesha}
        renderOrder={languageCodes.length - 1}
        looksAround={true}
        rotateSpeed={
          selectedLanguage
            ? rotateSpeed * rotateSpeedFactor.meshaZoomed
            : rotateSpeed * rotateSpeedFactor.meshaInitial
        }
        isMotionReduced={isMotionReduced}
      />
    </Canvas>
  );
};

export default Stage;
