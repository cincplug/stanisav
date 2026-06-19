import { easings, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Color } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { useControlsContext } from "../../contexts/ControlsContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";
import { config } from "../../modules/configStore";

const Lines = ({
  visibleLabelCodes,
  labelRefs,
  revealRefs,
  languageColors,
  color,
}) => {
  const { size } = useThree();

  const { opacity, lineWidth, centerPullRatio } = config.lines;
  const { labelsEntranceDuration } = config.entrance;
  const { currentColor } = config.colors;
  const { isEntranceComplete } = useEntranceContext();
  const { switchDuration } = useControlsContext().controls;
  const { startFromLanguage } = usePlaylistContext();

  const countLines = visibleLabelCodes.length;

  const geometryRef = useRef(null);
  const materialRef = useRef(null);

  const [mesh, setMesh] = useState(null);

  const positionsRef = useRef(null);
  const colorsRef = useRef(null);

  const buildScene = (count) => {
    geometryRef.current?.dispose();
    materialRef.current?.dispose();

    const positions = new Float32Array(count * 2 * 3);
    const colors = new Float32Array(count * 2 * 3);
    positionsRef.current = positions;
    colorsRef.current = colors;

    const geo = new LineSegmentsGeometry();
    geo.setPositions(positions);
    geo.setColors(colors);

    const mat = new LineMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      linewidth: lineWidth,
      depthTest: false,
      toneMapped: false,
      resolution: [size.width, size.height],
    });

    geometryRef.current = geo;
    materialRef.current = mat;
    return new LineSegments2(geo, mat);
  };

  useEffect(() => {
    if (countLines < 1) {
      setMesh(null);
      return;
    }
    setMesh(buildScene(countLines));
  }, [visibleLabelCodes.join(",")]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.resolution.set(size.width, size.height);
    }
  }, [size]);

  const centerPullSpring = useSpring({
    from: { ratio: centerPullRatio },
    to: { ratio: -centerPullRatio },
    config: {
      duration: isEntranceComplete ? switchDuration : labelsEntranceDuration,
      easing: easings.easeInOutCubic,
    },
  });

  const fallbackColor = new Color(color ?? currentColor);

  const hiddenX = 0;
  const hiddenY = 0;
  const hiddenZ = -99999;

  useThrottledFrame(() => {
    if (countLines < 1 || !mesh || !geometryRef.current) return;

    const posArray = positionsRef.current;
    const colArray = colorsRef.current;
    const currentRatio = centerPullSpring.ratio.get();

    for (let i = 0; i < countLines; i++) {
      const labelMesh = labelRefs[i]?.current;
      const reveal = revealRefs[i]?.current ?? 0;
      const vertexStart = i * 6;

      if (!labelMesh || reveal <= 0) {
        posArray[vertexStart] = hiddenX;
        posArray[vertexStart + 1] = hiddenY;
        posArray[vertexStart + 2] = hiddenZ;
        posArray[vertexStart + 3] = hiddenX;
        posArray[vertexStart + 4] = hiddenY;
        posArray[vertexStart + 5] = hiddenZ;
        continue;
      }

      posArray[vertexStart] = labelMesh.position.x;
      posArray[vertexStart + 1] = labelMesh.position.y;
      posArray[vertexStart + 2] = labelMesh.position.z;

      posArray[vertexStart + 3] = labelMesh.position.x * (1 - currentRatio);
      posArray[vertexStart + 4] = labelMesh.position.y * (1 - currentRatio);
      posArray[vertexStart + 5] = labelMesh.position.z * (1 - currentRatio);

      const lineColor = color
        ? fallbackColor
        : new Color(languageColors[visibleLabelCodes[i]] ?? currentColor);

      colArray[vertexStart] = lineColor.r;
      colArray[vertexStart + 1] = lineColor.g;
      colArray[vertexStart + 2] = lineColor.b;
      colArray[vertexStart + 3] = lineColor.r;
      colArray[vertexStart + 4] = lineColor.g;
      colArray[vertexStart + 5] = lineColor.b;
    }

    geometryRef.current.setPositions(posArray);
    geometryRef.current.setColors(colArray);
  });

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      const langCode = visibleLabelCodes[e.faceIndex];
      if (langCode) startFromLanguage(langCode);
    },
    [visibleLabelCodes, startFromLanguage],
  );

  useEffect(() => {
    return () => {
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, []);

  if (!mesh) return null;

  return <primitive object={mesh} onClick={handleClick} />;
};

export default Lines;
