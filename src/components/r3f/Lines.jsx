import { easings, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

// Draws one line per label from the label's animated position toward the sphere center.
// Uses LineSegments2 + LineMaterial for configurable screen-space line width.
// Each line uses its label's outlineColor unless a color override prop is provided.
// Lines appear alongside their label: hidden lines are pushed off-screen until reveal > 0.
// During entrance, centerPullRatio springs from its positive config value to its negative.
// labelRefs: array of { current: Three.js mesh | null }
// revealRefs: array of { current: number } — reveal scalar in [0, 1]
const Lines = ({
  visibleLabelCodes,
  labelRefs,
  revealRefs,
  languageColors,
  color,
}) => {
  const { size } = useThree();

  const { config } = useConfigContext();
  const { opacity, lineWidth, centerPullRatio } = config.lines;
  const { labelsEntranceDuration } = config.entrance;
  const { currentColor, bgColor } = config.colors;
  const { switchDuration } = config.camera;
  const { isEntranceComplete } = useEntranceContext();

  const countLines = visibleLabelCodes.length;

  const geometryRef = useRef(null);
  const materialRef = useRef(null);
  const meshRef = useRef(null);

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
    meshRef.current = new LineSegments2(geo, mat);
  };

  // Rebuild mesh whenever the set of visible codes changes
  useEffect(() => {
    if (countLines > 0) buildScene(countLines);
  }, [visibleLabelCodes.join(",")]);

  // Keep LineMaterial resolution in sync with canvas size so line width stays correct
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
  const centerColor = new Color(bgColor);

  const hiddenX = 0;
  const hiddenY = 0;
  const hiddenZ = -99999;

  useThrottledFrame(({ scene }) => {
    if (countLines < 1 || !meshRef.current || !geometryRef.current) return;

    if (!meshRef.current.parent) scene.add(meshRef.current);

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

      // Label end — live animated position
      posArray[vertexStart] = labelMesh.position.x;
      posArray[vertexStart + 1] = labelMesh.position.y;
      posArray[vertexStart + 2] = labelMesh.position.z;

      // Center-pull end — lerped toward or away from origin
      posArray[vertexStart + 3] = labelMesh.position.x * (1 - currentRatio);
      posArray[vertexStart + 4] = labelMesh.position.y * (1 - currentRatio);
      posArray[vertexStart + 5] = labelMesh.position.z * (1 - currentRatio);

      const lineColor = color
        ? fallbackColor
        : new Color(languageColors[visibleLabelCodes[i]] ?? currentColor);

      // Label end — language color
      colArray[vertexStart] = lineColor.r;
      colArray[vertexStart + 1] = lineColor.g;
      colArray[vertexStart + 2] = lineColor.b;
      // Center-pull end — background color, making the line dissolve into the scene
      colArray[vertexStart + 3] = centerColor.r;
      colArray[vertexStart + 4] = centerColor.g;
      colArray[vertexStart + 5] = centerColor.b;
    }

    geometryRef.current.setPositions(posArray);
    geometryRef.current.setColors(colArray);
  });

  useEffect(() => {
    return () => {
      meshRef.current?.parent?.remove(meshRef.current);
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, []);

  return null;
};

export default Lines;
