import { useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "../../contexts/ControlsContext";
import { useAppState } from "../../contexts/AppStateContext";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useEntrance } from "../../contexts/EntranceContext";
import { useDataManager } from "../../hooks/useDataManager";
import {
  calculateLanguageFilterStatus,
  calculateRadialOffset,
} from "../../utils/sceneUtils";
import { getFeatureScore } from "../../utils/linguisticUtils";
import { getSortingData } from "../../utils/sortingUtils";
import { groupLanguages } from "../../utils/languageGroupingUtils";
import { LayoutEngine } from "../../modules/layoutEngine";
import lineages from "../../config/lineages.json";
import config from "../../config/config.json";
import StageLight from "./StageLight";
import Labels from "./Labels";
import Mesha from "./Mesha";
import Camera from "./Camera";
import OrbitModifier from "./OrbitModifier";
import SceneReadyGate from "./SceneReadyGate";

const Stage = ({ onDataLoaded, onLoadingChange, languageColors }) => {
  const { controls } = useControls();
  const { isSceneReady } = useAppState();
  const { locale, isLocaleReady, isRtl } = useI18n();
  const { filteringUtils, selectedLanguage } = useLanguageSelection();
  const {
    isMeshaSequenceDone,
    skipSequence,
    isEntranceComplete,
    setIsEntranceComplete,
  } = useEntrance();
  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
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
    sortBy,
    labelContent,
    isReverse,
    isSegmented,
    irrationality,
    axis,
    zoomDistance,
    rotateSpeed,
    isMotionReduced,
    meshaSize,
  } = controls;

  const orbitControlsRef = useRef();

  const {
    sphereRadius,
    rotateSpeedFactor,
    radialOffsetModifier,
    entranceDuration,
    revealDuration,
  } = config;

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

  useEffect(() => {
    if ((selectedLanguage || isSegmented) && !isEntranceComplete) {
      skipSequence();
      setIsEntranceComplete(true);
    }
  }, [selectedLanguage, isSegmented]);

  const meshaLanguageCode = selectedLanguage || sortedLanguageCodes[0];
  const meshaLinguisticProperties =
    data?.typologicalFeatures?.[meshaLanguageCode];
  const meshaColor = languageColors[meshaLanguageCode];
  const stripesType =
    getFeatureScore("tonality", meshaLinguisticProperties?.tonality) - 1;

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

  const hasSelectedFilters = Object.keys(filteringUtils).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const shouldShowEmptyMessage =
    hasSelectedFilters && visibleLanguages.length === 0;

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
          !!selectedLanguage
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
        data={data}
        controls={controls}
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
            isEntranceComplete={isEntranceComplete}
            setIsEntranceComplete={setIsEntranceComplete}
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
          renderOrder={languageCodes.length}
          rotateSpeed={
            !!selectedLanguage
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
