import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import lineages from "../../config/lineages.json";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useI18nContext } from "../../contexts/I18nContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { LayoutEngine } from "../../modules/layoutEngine";
import { groupLanguages } from "../../utils/groupingUtils";
import {
  calculateLanguageFilterStatus,
  calculateRadialOffset,
} from "../../utils/sceneUtils";
import { getSortingData } from "../../utils/sortingUtils";
import Camera from "./Camera";
import Labels from "./Labels";
import Light from "./Light";
import Mesha from "./mesha/Mesha";
import OrbitModifier from "./OrbitModifier";
import SceneReadyGate from "./SceneReadyGate";

const Scene = ({ onDataLoaded, onLoadingChange }) => {
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
  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { config } = useConfigContext();
  const {
    cameraX,
    cameraY,
    cameraZ,
    bgColor,
    isMotionReduced,
    isMyMesha,
    spiralRatio,
    spiralAxis,
    labelOffset,
    sphereRadius,
    sortBy,
    labelContent,
    isReverse,
    isBlackboard,
    labelSize,
    spinSphereInitial,
    spinSphereZoomed,
    spinMeshaInitial,
    spinMeshaZoomed,
  } = config;

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
        config,
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
      isBlackboard,
      locale,
      isLocaleReady,
      spiralRatio,
      spiralAxis,
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
    if ((selectedLanguage || isBlackboard) && !isEntranceComplete) {
      skipSequence();
    }
  }, [selectedLanguage, isBlackboard]);

  const meshaLanguageCode =
    selectedLanguage || mentionedLanguage || sortedLanguageCodes[0];

  const meshaPosition = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      const base = [pos.x, pos.y, pos.z];
      const radial = calculateRadialOffset(base);

      if (isBlackboard) {
        return [
          base[0],
          base[1] + labelOffset / 2,
          base[2] + radial[2] + labelOffset + sphereRadius,
        ];
      }

      return [
        base[0] + radial[0] * labelOffset,
        base[1] + radial[1] * labelOffset + labelSize,
        base[2] + radial[2] * labelOffset,
      ];
    }

    return [0, 0, sphereRadius / 2];
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
      camera={{ position: [cameraX, cameraY, cameraZ] }}
      gl={{ antialias: true, clearColor: bgColor }}
    >
      <SceneReadyGate hasDrawableScene={hasDrawableScene} />

      <color attach="background" args={[bgColor]} />

      <OrbitControls
        ref={orbitControlsRef}
        enableDamping={true}
        makeDefault={true}
        enableZoom={isBlackboard}
        enableRotate={!isBlackboard}
        autoRotate={false}
      />

      <OrbitModifier
        orbitControlsRef={orbitControlsRef}
        spiralAxis={spiralAxis}
        speed={selectedLanguage ? spinSphereZoomed : spinSphereInitial}
        isEnabled={!isBlackboard && isMeshaSequenceDone}
      />

      <Light selectedLanguage={selectedLanguage} />

      <Camera languageNodes={formattedPositions} />

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
        spin={selectedLanguage ? spinMeshaZoomed : spinMeshaInitial}
        isMotionReduced={isMotionReduced}
      />
    </Canvas>
  );
};

export default Scene;
