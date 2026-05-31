import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import lineages from "../../config/lineages.json";
import { useControls } from "../../contexts/ControlsContext";
import { useEntrance } from "../../contexts/EntranceContext";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageColors } from "../../contexts/LanguageColorsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
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
  const { controls } = useControls();
  const { locale, isLocaleReady } = useI18n();
  const { filters, selectedLanguage } = useLanguageSelection();
  const { languageColors } = useLanguageColors();
  const {
    isMeshaSequenceDone,
    skipSequence,
    isEntranceComplete,
    isLabelsSequenceDone,
    setIsLabelsSequenceDone,
    mentionedLanguage,
  } = useEntrance();
  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { cameraX, cameraY, cameraZ, fov, near, far } = config.camera;
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
  } = controls;

  const orbitControlsRef = useRef();

  const { rotateSpeedFactor } = config;
  const { radialOffsetModifier, sphereRadius } = config.layout;

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
        base[1] + radial[1] * radialOffsetModifier,
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
        enableRotate={!isSegmented}
        autoRotate={false}
      />

      <OrbitModifier
        orbitControlsRef={orbitControlsRef}
        axis={axis}
        speed={
          selectedLanguage
            ? rotateSpeed * rotateSpeedFactor.scene.zoomed
            : rotateSpeed * rotateSpeedFactor.scene.initial
        }
        isEnabled={!isSegmented}
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

      <group>
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
          looksAround={true}
          renderOrder={languageCodes.length}
          rotateSpeed={
            selectedLanguage
              ? rotateSpeed * rotateSpeedFactor.mesha.zoomed
              : rotateSpeed * rotateSpeedFactor.mesha.initial
          }
          isMotionReduced={isMotionReduced}
        />
      </group>
    </Canvas>
  );
};

export default Stage;
