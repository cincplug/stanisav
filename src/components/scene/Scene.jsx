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
  calculateRadialOffset,
} from "../../utils/sceneUtils";
import Camera from "./Camera";
import Labels from "./Labels";
import Light from "./Light";
import Mesha from "./mesha/Mesha";
import OrbitModifier from "./OrbitModifier";
import SceneReadyGate from "./SceneReadyGate";

const Scene = () => {
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
  const { data } = useAppStateContext();
  const { config } = useConfigContext();
  const {
    cameraX,
    cameraY,
    cameraZ,
    bgColor,
    isMotionReduced,
    isMyMesha,
    spiralAxis,
    labelOffset,
    isBlackboard,
    labelSize,
    sphereSpin,
    meshaSpin,
  } = config;

  const orbitControlsRef = useRef();
  const orbitAngleRef = useRef(0);

  const languages = data?.languages;
  const { positions, sortedLanguageCodes, groups } = useLayout();

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

  const meshaLanguageCode = useMemo(
    () => selectedLanguage || mentionedLanguage || sortedLanguageCodes[0],
    [selectedLanguage, mentionedLanguage, sortedLanguageCodes],
  );

  const meshaPositionLanguageCode = useMemo(
    () => selectedLanguage || sortedLanguageCodes[0],
    [selectedLanguage, sortedLanguageCodes],
  );

  const meshaPosition = useMemo(() => {
    const meshaPositionData = meshaPositionLanguageCode
      ? positions[meshaPositionLanguageCode]
      : null;

    if (meshaPositionData) {
      const base = [
        meshaPositionData.x,
        meshaPositionData.y,
        meshaPositionData.z,
      ];
      const radial = calculateRadialOffset(base);

      if (isBlackboard) {
        return [
          base[0],
          base[1] + radial[1] + labelSize,
          base[2] + radial[2] + labelOffset,
        ];
      }

      return [
        base[0] + radial[0] * labelOffset,
        base[1] + radial[1] * labelOffset + labelSize,
        base[2] + radial[2] * labelOffset,
      ];
    }

    return [0, 0, 0];
  }, [meshaPositionLanguageCode, positions]);

  const hasSelectedFilters = Object.keys(filters).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const shouldShowEmptyMessage =
    hasSelectedFilters && visibleLanguages.length === 0;

  const meshaColor = languageColors[meshaLanguageCode];
  const hasDrawableScene =
    Boolean(meshaColor) &&
    Object.keys(positions).length > 0 &&
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
        isEnabled={!isBlackboard && isMeshaSequenceDone}
        orbitAngleRef={orbitAngleRef}
      />

      <Light selectedLanguage={selectedLanguage} />

      <Camera languageNodes={positions} />

      {!shouldShowEmptyMessage && isMeshaSequenceDone && (
        <Labels
          groups={groups}
          positions={positions}
          languageFilterStatus={languageFilterStatus}
          languageColors={languageColors}
          languages={languages}
          selectedLanguage={selectedLanguage}
          isLabelsSequenceDone={isLabelsSequenceDone}
          setIsLabelsSequenceDone={setIsLabelsSequenceDone}
        />
      )}

      <Mesha
        languageCode={meshaLanguageCode}
        position={meshaPosition}
        isMyMesha={isMyMesha}
        spin={selectedLanguage ? meshaSpin : 0}
        isMotionReduced={isMotionReduced}
        orbitAngleRef={orbitAngleRef}
        renderOrder={languages.length}
      />
    </Canvas>
  );
};

export default Scene;
