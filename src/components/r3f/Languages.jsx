import { useEffect, useMemo } from "react";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useControls } from "../../contexts/ControlsContext";
import { useCameraController } from "../../hooks/useCameraController";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { getGroupedLanguages } from "../../utils/groupingUtils";
import { calculateLanguageFilterStatus } from "../../utils/languageScene";
import Node from "./Node";

const Languages = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  onEmptyFilterChange,
}) => {
  const { controls } = useControls();

  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions } = useLayoutManager(data, controls, onNodesReady);
  const groupedLanguages = useMemo(() => getGroupedLanguages(data), [data]);

  const { filteringUtils, selectedLanguage, groupColors } =
    useLanguageSelection();

  const allLanguageCodes = useMemo(
    () => Object.values(groupedLanguages).flatMap((g) => g.languages),
    [groupedLanguages]
  );

  const languageFilterStatus = useMemo(
    () =>
      calculateLanguageFilterStatus(
        allLanguageCodes,
        data?.typologicalFeatures,
        filteringUtils,
        data?.languageGroups
      ),
    [
      allLanguageCodes,
      data?.typologicalFeatures,
      filteringUtils,
      data?.languageGroups,
    ]
  );

  // Check if filters are active and result in no languages
  const hasActiveFilters = Object.keys(filteringUtils).length > 0;
  const visibleLanguages = Object.values(languageFilterStatus).filter(
    (status) => status?.isVisible
  );
  const showEmptyMessage = hasActiveFilters && visibleLanguages.length === 0;

  // Call camera controller hook at top level
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

  if (!data || !isInitialized || Object.keys(formattedPositions).length === 0) {
    return null;
  }

  return (
    <group>
      {!showEmptyMessage &&
        Object.entries(groupedLanguages).map(
          ([groupKey, { info, languages }]) =>
            languages
              .map((langCode) => {
                const position = formattedPositions[langCode];
                const filterStatus = languageFilterStatus[langCode];
                if (!position || !filterStatus?.isVisible) return null;

                const color = groupColors?.[groupKey] || info?.color;

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
                    linguisticProperties={
                      data.typologicalFeatures
                        ? data.typologicalFeatures[langCode]
                        : null
                    }
                  />
                );
              })
              .filter(Boolean)
        )}
    </group>
  );
};

export default Languages;
