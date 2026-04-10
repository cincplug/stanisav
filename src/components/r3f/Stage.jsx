import SceneReadyGate from "./SceneReadyGate";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { interpolateColorsByTime } from "../../utils/colorUtils";
import { useSpring } from "@react-spring/three";
import { useControls } from "../../contexts/ControlsContext";
import { useAppState } from "../../contexts/AppStateContext";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import {
  calculateLanguageFilterStatus,
  getStageLightConfig,
} from "../../utils/sceneUtils";
import { getFeatureScore } from "../../utils/linguisticUtils";
import { getSortingData, sortLanguages } from "../../utils/sortingUtils";
import { groupLanguages } from "../../utils/languageGroupingUtils";
import { LayoutEngine } from "../../modules/layoutEngine";
import lineages from "../../config/lineages.json";
import StageLight from "./StageLight";
import Labels from "./Labels";
import Mesha from "./Mesha";
import Camera from "./Camera";

const Stage = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  languageColors,
}) => {
  const { controls, updateControl } = useControls();
  const { skipLabelEntrance } = useAppState();
  const { locale, isLocaleReady } = useI18n();
  const { filteringUtils, selectedLanguage } = useLanguageSelection();
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
    sphereRadius,
    sortBy,
    labelContent,
    isReverse,
    isSegmented,
    stageLightDistance,
    stageLightDecay,
    irrationality,
  } = controls;

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const { bgColor, bgColorNoon } = controls;
    const newBg = interpolateColorsByTime({ bgColor, bgColorNoon, hour });
    updateControl("bgColor", newBg);
  }, []);

  const languageData = data?.languageData || {};
  const { languageCodes, languageLineages, speakerData, typologicalFeatures } =
    useMemo(() => getSortingData(languageData), [languageData]);

  const sortedLanguageCodes = useMemo(
    () =>
      sortLanguages({
        allLanguages: [...languageCodes],
        languageData,
        languageLineages,
        speakerData,
        typologicalFeatures,
        sortBy,
        labelContent,
        isReverse,
      }),
    [
      languageCodes,
      languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      labelContent,
      isReverse,
      locale,
      isLocaleReady,
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

  const layoutEngine = useMemo(() => new LayoutEngine(), []);
  const { positions: formattedPositions } = useMemo(
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
    return [0, sphereRadius, 0];
  }, [selectedLanguage, formattedPositions]);

  const hasSelectedFilters = Object.keys(filteringUtils).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const showEmptyMessage = hasSelectedFilters && visibleLanguages.length === 0;

  const { stageLightMultiplier } = useSpring({
    stageLightMultiplier: selectedLanguage ? 0 : 1,
    config: { tension, friction },
  });

  const stageLightIntensity = stageLightMultiplier.to(
    (m) => controls.stageLightIntensity * m,
  );

  const stageLightConfig = useMemo(
    () =>
      getStageLightConfig({
        isSegmented,
        stageLightDistance,
      }),
    [isSegmented, stageLightDistance],
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
      aria-hidden="true"
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
      />

      <StageLight
        stageLightIntensity={stageLightIntensity}
        stageLightDecay={stageLightDecay}
        stageLightDistance={stageLightConfig.stageLightDistance}
        cameraZ={cameraZ}
        skipEntrance={skipLabelEntrance}
      />

      <Camera
        languageNodes={formattedPositions}
        data={data}
        controls={controls}
        selectedLanguage={selectedLanguage}
      />

      <group>
        {!showEmptyMessage && (
          <Labels
            groups={groups}
            formattedPositions={formattedPositions}
            languageFilterStatus={languageFilterStatus}
            languageColors={languageColors}
            languageData={languageData}
            selectedLanguage={selectedLanguage}
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
