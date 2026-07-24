import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { useConfigContext } from "../../contexts/ConfigContext";
import { getSortByLabel } from "../../utils/i18nUtils";
import { getClusterTopCenter } from "../../utils/sceneUtils";
import Title from "./Title";

const BlackboardAccessories = ({ groups, positions, visibleLabelCodes }) => {
  const { config } = useConfigContext();
  const { connectorWidth, white, boardTitleGap, labelSize, sortBy } = config;

  const sortByLabel = getSortByLabel(sortBy);

  // The scene title must be centered on the labels actually on screen, not
  // on every language in the dataset - otherwise it drifts off-center as
  // soon as any filter hides part of the sphere/board.
  const visiblePositions = Object.fromEntries(
    visibleLabelCodes
      .filter((code) => positions[code])
      .map((code) => [code, positions[code]]),
  );

  const sceneTopCenter = getClusterTopCenter(visiblePositions);
  const sceneTitlePosition = sceneTopCenter
    ? new Vector3(
        0,
        sceneTopCenter.y + boardTitleGap + labelSize * 2,
        sceneTopCenter.z,
      )
    : null;

  return (
    <>
      {sceneTitlePosition && (
        <Title
          position={sceneTitlePosition}
          text={sortByLabel}
          fontSize={labelSize * 2}
          color={white}
        />
      )}

      {groups.map((group) => {
        const languageCodes = group.languages;

        const groupedPositions = Object.fromEntries(
          languageCodes
            .filter((code) => positions[code])
            .map((code) => [code, positions[code]]),
        );

        const topCenter = getClusterTopCenter(groupedPositions);
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
          .map((code) => groupedPositions[code])
          .filter(Boolean)
          .map(
            (position) => new Vector3(position.x, position.y - labelSize, 0),
          );

        const tracePoints =
          connectorWidth > 0 && memberPoints.length > 0
            ? [titlePosition, ...memberPoints]
            : null;

        return (
          <group key={group.title ?? "all"}>
            {tracePoints && (
              <Line
                points={tracePoints}
                color={white}
                lineWidth={connectorWidth}
              />
            )}
            <Title
              position={titlePosition}
              text={group.title}
              fontSize={labelSize}
              color={white}
            />
          </group>
        );
      })}
    </>
  );
};

export default BlackboardAccessories;
