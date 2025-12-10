import { useEffect, useMemo } from "react";
import Group from "./Group";
import { useCameraController } from "../../hooks/useCameraController";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useDataManager } from "../../hooks/useDataManager";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { getGroupedLanguages } from "../../utils/groupingUtils";
import { useAppControls } from "../../contexts/AppControlsContext";

const Languages = ({
  onDataLoaded,
  onSceneReady,
  onLoadingChange,
  onNodesReady,
  cameraFocusRequest
}) => {
  const { appControls } = useAppControls();

  const { data, isInitialized } = useDataManager(onDataLoaded, onLoadingChange);
  const { formattedPositions } = useLayoutManager(
    data,
    appControls,
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
      appControls,
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
