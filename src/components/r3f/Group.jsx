import { useMemo, useRef } from "react";
import Node from "./Node";
import Blanket from "./Blanket";
import { useVisualization } from "../../contexts/VisualizationContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import {
  calculateLanguageFilterStatus,
  calculateGroupBounds
} from "../../utils/languageScene";

const Group = ({
  groupKey,
  groupInfo,
  languages,
  languageData,
  typologicalFeatures,
  speakerData,
  positions
}) => {
  const groupRef = useRef();
  const { selectedLanguage, onLanguageClick } = useVisualization();
  const { filteringUtils, groupColors } = useLanguageSelection();

  const languageFilterStatus = useMemo(
    () =>
      calculateLanguageFilterStatus(
        languages,
        typologicalFeatures,
        filteringUtils
      ),
    [languages, typologicalFeatures, filteringUtils]
  );

  const groupBounds = useMemo(
    () => calculateGroupBounds(positions, languages),
    [positions, languages]
  );

  const groupDefaultColor = groupColors?.[groupKey] || groupInfo?.color;

  return (
    <group ref={groupRef} userData={{ groupKey, groupInfo }}>
      <Blanket
        positions={positions}
        languages={languages}
        groupInfo={groupInfo}
        color={groupDefaultColor}
      />
      {languages
        .map((langCode) => {
          const position = positions[langCode];
          const filterStatus = languageFilterStatus[langCode];
          if (!position || !filterStatus?.isVisible) return null;

          return (
            <Node
              key={langCode}
              languageCode={langCode}
              language={languageData[langCode]}
              position={[position.x, position.y, position.z]}
              speakerCount={speakerData[langCode] || 1}
              onLanguageClick={onLanguageClick}
              isSelected={selectedLanguage === langCode}
              isFiltered={filterStatus.isFiltered}
              color={groupDefaultColor}
              linguisticProperties={
                typologicalFeatures ? typologicalFeatures[langCode] : null
              }
            />
          );
        })
        .filter(Boolean)}
      {groupInfo.name && (
        <mesh
          position={[
            groupBounds.center[0],
            groupBounds.center[1],
            groupBounds.center[2]
          ]}
        ></mesh>
      )}
    </group>
  );
};

export default Group;
