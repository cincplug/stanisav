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
  cameraFocusRequest
}) => {
  const { controls } = useControls();

  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions } = useLayoutManager(data, controls, onNodesReady);
  const groupedLanguages = useMemo(() => getGroupedLanguages(data), [data]);

  const { filteringUtils, selectedLanguage, groupColors, onLanguageClick } =
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
        filteringUtils
      ),
    [allLanguageCodes, data?.typologicalFeatures, filteringUtils]
  );

  useEffect(() => {
    if (isInitialized && data && Object.keys(formattedPositions).length > 0) {
      onSceneReady(true);
    }
  }, [isInitialized, data, formattedPositions, onSceneReady]);

  if (!data || !isInitialized || Object.keys(formattedPositions).length === 0) {
    return null;
  }

  const CameraControllerNode = () => {
    const { selectedLanguage } = useLanguageSelection();
    useCameraController({
      cameraFocusRequest,
      languageNodes: formattedPositions,
      data,
      controls,
      selectedLanguage
    });
    return null;
  };

  return (
    <group>
      <CameraControllerNode />

      {Object.entries(groupedLanguages).map(([groupKey, { info, languages }]) =>
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
                onLanguageClick={onLanguageClick}
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
