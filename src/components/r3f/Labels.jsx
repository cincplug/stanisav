import { useThree } from "@react-three/fiber";
import { useClusterOpacities } from "./LabelsCluster";
import LabelsCluster from "./LabelsCluster";
import Label from "./Label";

const Labels = ({
  groups,
  formattedPositions,
  languageFilterStatus,
  languageColors,
  languageData,
  selectedLanguage,
}) => {
  const { camera } = useThree();
  const opacities = useClusterOpacities(
    camera,
    formattedPositions,
    selectedLanguage,
  );

  return (
    <>
      {/* Flat list with stable keys so position springs persist across layout changes */}
      {Object.keys(formattedPositions).map((langCode) => {
        const position = formattedPositions[langCode];
        const filterStatus = languageFilterStatus[langCode];

        if (!position || !filterStatus?.isVisible) return null;

        const opacity = opacities[langCode] ?? 1;
        if (opacity === 0) return null;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            language={languageData[langCode]}
            position={[position.x, position.y, position.z]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
            opacity={opacity}
          />
        );
      })}

      {/* One cluster title per group */}
      {groups.map((group) => (
        <LabelsCluster
          key={group.title ?? "all"}
          title={group.title}
          languageCodes={group.languages}
          formattedPositions={formattedPositions}
          selectedLanguage={selectedLanguage}
        />
      ))}
    </>
  );
};

export default Labels;
