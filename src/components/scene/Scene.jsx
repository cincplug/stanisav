import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { useAppStateContext } from "../../contexts/AppStateContext";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { useLayout } from "../../hooks/useLayout";
import {
  calculateLanguageFilterStatus,
  calculateStanisavPosition,
  calculateWideShotScale,
} from "../../utils/sceneUtils";
import Camera from "./Camera";
import Labels from "./Labels";
import Light from "./Light";
import Stanisav from "./stanisav/Stanisav";
import OrbitModifier from "./OrbitModifier";
import SceneReadyGate from "./SceneReadyGate";

const Scene = () => {
  const { filters, selectedLanguage } = useLanguageSelectionContext();
  const { languageColors } = useLanguageColorsContext();
  const {
    isStanisavSequenceDone,
    skipSequence,
    isEntranceComplete,
    isLabelsSequenceDone,
    setIsLabelsSequenceDone,
    isBalloonSequenceDone,
    mentionedLanguage,
  } = useEntranceContext();
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const {
    cameraX,
    cameraY,
    cameraZ,
    bgColor,
    isMotionReduced,
    isMyStanisav,
    spiralAxis,
    labelOffset,
    isBlackboard,
    labelSize,
    sphereSpin,
    stanisavSpin,
    sphereRadius,
    zoomDistance,
    fov,
  } = config;

  const orbitControlsRef = useRef();
  const orbitAngleRef = useRef(0);

  const languages = data?.languages;
  const { languagePositions, sortedLanguageCodes, groups } = useLayout();

  const languageFilterStatus = useMemo(
    () =>
      calculateLanguageFilterStatus(
        sortedLanguageCodes,
        data?.languages,
        filters,
      ),
    [sortedLanguageCodes, data?.languages, filters],
  );

  useEffect(() => {
    if (selectedLanguage && !isEntranceComplete) {
      skipSequence();
    }
  }, [selectedLanguage, isBlackboard]);

  const stanisavLanguageCode = useMemo(
    () => selectedLanguage || mentionedLanguage || sortedLanguageCodes[0],
    [selectedLanguage, mentionedLanguage, sortedLanguageCodes],
  );

  const selectedLanguagePosition = selectedLanguage
    ? languagePositions[selectedLanguage]
    : null;

  const stanisavPosition = useMemo(() => {
    // With nothing selected, Stanisav sits at his fixed home position
    // instead of being attached to any particular language node.
    if (!selectedLanguage) {
      return [0, 0, 0];
    }

    return calculateStanisavPosition(selectedLanguagePosition, {
      isBlackboard,
      labelOffset,
      labelSize,
    });
  }, [
    selectedLanguage,
    selectedLanguagePosition,
    isBlackboard,
    labelOffset,
    labelSize,
  ]);

  const stanisavWideScale = useMemo(
    () => calculateWideShotScale(sphereRadius, zoomDistance, fov),
    [sphereRadius, zoomDistance, fov],
  );

  const hasSelectedFilters = Object.keys(filters).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const shouldShowEmptyMessage =
    hasSelectedFilters && visibleLanguages.length === 0;

  const stanisavColor = languageColors[stanisavLanguageCode];
  const hasDrawableScene =
    Boolean(stanisavColor) &&
    Object.keys(languagePositions).length > 0 &&
    (shouldShowEmptyMessage || visibleLanguages.length > 0);

  if (!data || sortedLanguageCodes.length === 0) {
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
        speed={selectedLanguage ? 0 : sphereSpin}
        isEnabled={!isBlackboard && isStanisavSequenceDone}
        orbitAngleRef={orbitAngleRef}
      />

      <Light selectedLanguage={selectedLanguage} />

      <Camera languagePositions={languagePositions} />

      {!shouldShowEmptyMessage &&
        isStanisavSequenceDone &&
        isBalloonSequenceDone && (
          <Labels
            groups={groups}
            languagePositions={languagePositions}
            languageFilterStatus={languageFilterStatus}
            languageColors={languageColors}
            languages={languages}
            selectedLanguage={selectedLanguage}
            isLabelsSequenceDone={isLabelsSequenceDone}
            setIsLabelsSequenceDone={setIsLabelsSequenceDone}
          />
        )}

      <Stanisav
        languageCode={stanisavLanguageCode}
        position={stanisavPosition}
        isMyStanisav={isMyStanisav}
        spin={stanisavSpin}
        isMotionReduced={isMotionReduced}
        orbitAngleRef={orbitAngleRef}
        renderOrder={languages.length}
        wideScale={stanisavWideScale}
      />
    </Canvas>
  );
};

export default Scene;
