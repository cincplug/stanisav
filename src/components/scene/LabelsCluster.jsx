import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { useConfigContext } from "../../contexts/ConfigContext";
import { getClusterTopCenter } from "../../utils/sceneUtils";
import LabelsClusterTitle from "./LabelsClusterTitle";

const LabelsCluster = ({ title, languageCodes, formattedPositions }) => {
  const { config } = useConfigContext();
  const { isBlackboard, clusterBorder, white, boardTitleGap, labelSize } =
    config;

  if (!isBlackboard) return null;

  const languagePositions = {};
  languageCodes.forEach((code) => {
    if (formattedPositions[code]) {
      languagePositions[code] = formattedPositions[code];
    }
  });

  const topCenter = getClusterTopCenter(languagePositions);
  if (!topCenter) return null;

  const titlePosition = new Vector3(
    topCenter.x,
    topCenter.y + boardTitleGap,
    topCenter.z,
  );

  // Traces a single path from the title through every member, in the same
  // order the members were provided. This replaces the old bounding-box
  // rectangle, which used raw member extents and so never lined up with
  // where the title actually rendered.
  const memberPoints = languageCodes
    .map((code) => languagePositions[code])
    .filter(Boolean)
    .map(
      (position) => new Vector3(position.x, position.y - labelSize, position.z),
    );

  const tracePoints =
    clusterBorder && memberPoints.length > 0
      ? [titlePosition, ...memberPoints]
      : null;

  return (
    <>
      {tracePoints && (
        <Line points={tracePoints} color={white} lineWidth={clusterBorder} />
      )}
      <LabelsClusterTitle position={titlePosition} title={title} />
    </>
  );
};

export default LabelsCluster;
