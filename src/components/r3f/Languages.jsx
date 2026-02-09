import { useEffect, useMemo } from "react";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useControls } from "../../contexts/ControlsContext";
import { useCameraController } from "../../hooks/useCameraController";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { calculateLanguageFilterStatus } from "../../utils/sceneUtils";
import Node from "./Node";
import Mesha from "./Mesha";

const Languages = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
}) => {
  const { controls } = useControls();
  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions, sortedLanguageCodes } = useLayoutManager(
    data,
    controls,
    onNodesReady,
  );
  const { filteringUtils, selectedLanguage, groupColors } =
    useLanguageSelection();

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

  const hasActiveFilters = Object.keys(filteringUtils).length > 0;
  const visibleLanguages = sortedLanguageCodes.filter(
    (code) => languageFilterStatus[code]?.isVisible,
  );
  const showEmptyMessage = hasActiveFilters && visibleLanguages.length === 0;

  useCameraController({
    languageNodes: formattedPositions,
    data,
    controls,
    selectedLanguage,
  });

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

  const meshaLanguageCode = selectedLanguage || sortedLanguageCodes[0];
  const meshaPosition = selectedLanguage
    ? formattedPositions[selectedLanguage]
    : {
        x: -controls.sphereRadius - controls.meshaSize,
        y: 0,
        z: controls.sphereRadius,
      };

  const meshaGroupKey =
    data.languageData[meshaLanguageCode]?.group ||
    data.languageGroups?.[meshaLanguageCode];
  const meshaColor = groupColors?.[meshaGroupKey];

  return (
    <group>
      <Mesha
        languageCode={meshaLanguageCode}
        position={[meshaPosition.x, meshaPosition.y, meshaPosition.z]}
        color={meshaColor}
      />
      {!showEmptyMessage &&
        sortedLanguageCodes.map((langCode, idx) => {
          const position = formattedPositions[langCode];
          const filterStatus = languageFilterStatus[langCode];
          if (!position || !filterStatus?.isVisible) return null;
          const groupKey =
            data.languageData[langCode]?.group ||
            data.languageGroups?.[langCode];
          const color = groupColors?.[groupKey];
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
  );
};

export default Languages;
