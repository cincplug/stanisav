import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { useConfigContext } from "../../contexts/ConfigContext";
import LabelsClusterTitle from "./LabelsClusterTitle";

const LabelsCluster = ({ title, languageCodes, formattedPositions }) => {
  const { config } = useConfigContext();
  const { isBlackboard, clusterBorder, white } = config;

  if (!isBlackboard) return null;

  const languagePositions = {};
  languageCodes.forEach((code) => {
    if (formattedPositions[code]) {
      languagePositions[code] = formattedPositions[code];
    }
  });

  let rectanglePoints = null;
  const positionsArray = Object.values(languagePositions);

  if (clusterBorder && positionsArray.length > 0) {
    const xs = positionsArray.map((p) => p.x);
    const ys = positionsArray.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const z = positionsArray[0].z;

    rectanglePoints = [
      new Vector3(minX, minY, z),
      new Vector3(maxX, minY, z),
      new Vector3(maxX, maxY, z),
      new Vector3(minX, maxY, z),
      new Vector3(minX, minY, z),
    ];
  }

  return (
    <>
      {clusterBorder && rectanglePoints && (
        <Line
          points={rectanglePoints}
          color={white}
          lineWidth={clusterBorder}
        />
      )}
      <LabelsClusterTitle languagePositions={languagePositions} title={title} />
    </>
  );
};

export default LabelsCluster;
