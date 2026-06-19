import { useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { useControlsContext } from "../../contexts/ControlsContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";
import { config } from "../../modules/configStore";

// Draws one line per label from the label's animated position toward the sphere center.
// Uses Line2 (LineSegments2 + LineMaterial) for configurable screen-space line width,
// which is not possible with standard lineBasicMaterial + WebGLRenderer.
// Each line uses its label's outlineColor unless a color override prop is provided.
// Lines appear alongside their label: hidden lines are pushed off-screen until reveal > 0.
// During entrance, centerPullRatio springs from its positive config value to its negative,
// transitioning lines from inward-pointing to outward-radiating.
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

  const { opacity, lineWidth, centerPullRatio } = config.lines;
  const { labelsEntranceDuration } = config.entrance;
  const { currentColor } = config.colors;
  const { isEntranceComplete } = useEntranceContext();
  const { controls } = useControlsContext();
  const { switchDuration } = controls;

  const countLines = visibleLabelCodes.length;

  const meshRef = useRef(null);
  const geometryRef = useRef(null);
  const materialRef = useRef(null);

  // LineSegmentsGeometry holds a flat Float32Array: [x0,y0,z0, x1,y1,z1, x0,y0,z0, x1,y1,z1, ...]
  // each consecutive pair is one independent segment — no connections between segments
  const positionsRef = useRef(null);
  const colorsRef = useRef(null);

  const buildScene = (count) => {
    geometryRef.current?.dispose();
    materialRef.current?.dispose();
    meshRef.current = null;

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

  // Build synchronously at render time so the mesh exists before the first frame tick
  if (countLines > 0 && positionsRef.current?.length !== countLines * 2 * 3) {
    buildScene(countLines);
  }

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
    },
  });

  const fallbackColor = new Color(color ?? currentColor);

  // A point guaranteed to be outside any visible frustum — used to hide unrevealed lines
  const hiddenPoint = [0, 0, -99999];

  useThrottledFrame(({ scene }) => {
    if (countLines < 1 || !meshRef.current || !geometryRef.current) return;

    // Attach mesh to scene on first frame (can't do this in JSX since it's an imperative object)
    if (!meshRef.current.parent) scene.add(meshRef.current);

    const posArray = positionsRef.current;
    const colArray = colorsRef.current;
    const currentRatio = centerPullSpring.ratio.get();

    for (let i = 0; i < countLines; i++) {
      const mesh = labelRefs[i]?.current;
      const reveal = revealRefs[i]?.current ?? 0;
      const vertexStart = i * 6;

      if (!mesh || reveal <= 0) {
        // Push off-screen rather than zeroing — degenerate zero-length segments
        // can cause LineSegments2 to render artifacts at the origin
        posArray[vertexStart] = hiddenPoint[0];
        posArray[vertexStart + 1] = hiddenPoint[1];
        posArray[vertexStart + 2] = hiddenPoint[2];
        posArray[vertexStart + 3] = hiddenPoint[0];
        posArray[vertexStart + 4] = hiddenPoint[1];
        posArray[vertexStart + 5] = hiddenPoint[2];
        continue;
      }

      // Label end — live animated position
      posArray[vertexStart] = mesh.position.x;
      posArray[vertexStart + 1] = mesh.position.y;
      posArray[vertexStart + 2] = mesh.position.z;

      // Center-pull end — lerped toward or away from origin
      posArray[vertexStart + 3] = mesh.position.x * (1 - currentRatio);
      posArray[vertexStart + 4] = mesh.position.y * (1 - currentRatio);
      posArray[vertexStart + 5] = mesh.position.z * (1 - currentRatio);

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

  // Cleanup on unmount
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
