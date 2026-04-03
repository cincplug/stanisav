import { useControls } from "../../contexts/ControlsContext";
import LabelsClusterTitle from "./LabelsClusterTitle";

const LabelsCluster = ({
  title,
  languageCodes,
  formattedPositions,
  selectedLanguage,
}) => {
  const { controls } = useControls();
  const { isSegmented } = controls;

  const clusterPositions = {};
  languageCodes.forEach((code) => {
    if (formattedPositions[code]) {
      clusterPositions[code] = formattedPositions[code];
    }
  });

  if (!isSegmented || selectedLanguage) return null;

  return <LabelsClusterTitle positions={clusterPositions} title={title} />;
};

export default LabelsCluster;
