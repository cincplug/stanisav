import { useEffect, useMemo } from "react";
import Group from "./Group";
import { useCameraController } from "../../hooks/useCameraController";
import { useVisualization } from "../../contexts/VisualizationContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useAppControls } from "../../contexts/AppControlsContext";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { getGroupedLanguages } from "../../utils/groupingUtils";

const Languages = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  cameraFocusRequest
}) => {
  const { sceneControls } = useVisualization();
  const { controls } = useAppControls();
  const { Camera: cameraControls = {} } = controls;

  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions } = useLayoutManager(
    data,
    sceneControls,
    onNodesReady
  );
  const groupedLanguages = useMemo(() => getGroupedLanguages(data), [data]);

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
      cameraControls,
      sceneControls,
      selectedLanguage
    });
    return null;
  };

  return (
    <group>
      <CameraControllerNode />

      {Object.entries(groupedLanguages).map(
        ([groupKey, { info, languages }]) => (
          <Group
            key={groupKey}
            groupKey={groupKey}
            groupInfo={info}
            languages={languages}
            languageData={data.languageData}
            typologicalFeatures={data.typologicalFeatures}
            speakerData={data.speakerData}
            positions={formattedPositions}
          />
        )
      )}
    </group>
  );
};

export default Languages;
