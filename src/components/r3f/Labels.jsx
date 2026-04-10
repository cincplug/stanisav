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
  const visibleLabelCodes = Object.keys(formattedPositions).filter(
    (langCode) => {
      const position = formattedPositions[langCode];
      const filterStatus = languageFilterStatus[langCode];
      return Boolean(position) && Boolean(filterStatus?.isVisible);
    },
  );

  const totalVisibleLabels = visibleLabelCodes.length;

  return (
    <>
      {/* Flat list with stable keys so position springs persist across layout changes */}
      {visibleLabelCodes.map((langCode, index) => {
        const position = formattedPositions[langCode];
        const revealOrder = totalVisibleLabels - 1 - index;

        return (
          <Label
            key={langCode}
            languageCode={langCode}
            language={languageData[langCode]}
            position={[position.x, position.y, position.z]}
            isSelected={selectedLanguage === langCode}
            color={languageColors[langCode]}
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
