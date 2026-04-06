import { useThree } from "@react-three/fiber";
import { useClusterOpacities } from "../../hooks/useClusterOpacities";
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

  const visibleLabelCodes = Object.keys(formattedPositions).filter(
    (langCode) => {
      const position = formattedPositions[langCode];
      const filterStatus = languageFilterStatus[langCode];
      const opacity = opacities[langCode] ?? 1;
      return (
        Boolean(position) && Boolean(filterStatus?.isVisible) && opacity > 0
      );
    },
  );

  const totalVisibleLabels = visibleLabelCodes.length;

  return (
    <>
      {/* Flat list with stable keys so position springs persist across layout changes */}
      {visibleLabelCodes.map((langCode, index) => {
        const position = formattedPositions[langCode];
        const opacity = opacities[langCode] ?? 1;
        const revealOrder = totalVisibleLabels - 1 - index;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            language={languageData[langCode]}
            position={[position.x, position.y, position.z]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
            opacity={opacity}
            revealOrder={revealOrder}
            totalVisibleLabels={totalVisibleLabels}
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
