import { useControls } from "../../contexts/ControlsContext";
import LabelsClusterTitle from "./LabelsClusterTitle";
import { Vector3 } from "three";
import { Line } from "@react-three/drei";

const LabelsCluster = ({
  title,
  languageCodes,
  formattedPositions,
  selectedLanguage,
}) => {
  const { controls } = useControls();
  const { isSegmented } = controls;

  if (!isSegmented) return null;

  const clusterPositions = {};
  languageCodes.forEach((code) => {
    if (formattedPositions[code]) {
      clusterPositions[code] = formattedPositions[code];
    }
  });

  let rectanglePoints = null;
  const positionsArray = Object.values(clusterPositions);

  if (positionsArray.length > 0) {
    const xs = positionsArray.map((p) => p.x);
    const ys = positionsArray.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const z = positionsArray[0].z;

    rectanglePoints = [
      new Vector3(minX, minY + 0.1, z),
      new Vector3(maxX - 0.2, minY, z),
      new Vector3(maxX, maxY + 0.3, z),
      new Vector3(minX - 0.2, maxY, z),
      new Vector3(minX, minY + 0.1, z),
    ];
  }

  return (
    <>
      {rectanglePoints && (
        <Line points={rectanglePoints} color="#373b3f" lineWidth={2} />
      )}
      <LabelsClusterTitle positions={clusterPositions} title={title} />
    </>
  );
};

export default LabelsCluster;
