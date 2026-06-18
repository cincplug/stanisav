import { useRef } from "react";
import { BufferAttribute, BufferGeometry, Color } from "three";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";
import { config } from "../../modules/configStore";

// Draws one line per label from the label's animated position toward the sphere center.
// Lines appear alongside their label: position is zeroed out until reveal > 0,
// then written with real coordinates. lineBasicMaterial doesn't support per-vertex alpha,
// so visibility is encoded in position rather than color.
// labelRefs: array of { current: Three.js mesh | null }
// revealRefs: array of { current: number } — reveal scalar in [0, 1]
const Lines = ({ visibleLabelCodes, labelRefs, revealRefs, color }) => {
  const linesRef = useRef();

  const { opacity, lineWidth, centerPullRatio } = config.lines;

  const countLines = visibleLabelCodes.length;

  const geometryRef = useRef(null);
  const positionAttrRef = useRef(null);

  const buildGeometry = (count) => {
    geometryRef.current?.dispose();

    const geo = new BufferGeometry();
    // 2 vertices per line, 3 floats each — all zeroed initially (invisible)
    const positions = new Float32Array(count * 2 * 3);

    const posAttr = new BufferAttribute(positions, 3);
    posAttr.setUsage(35048); // THREE.DynamicDrawUsage
    geo.setAttribute("position", posAttr);

    geometryRef.current = geo;
    positionAttrRef.current = posAttr;

    return geo;
  };

  // Build synchronously at render time so <lineSegments> has geometry on mount
  if (
    countLines > 0 &&
    positionAttrRef.current?.array.length !== countLines * 2 * 3
  ) {
    buildGeometry(countLines);
  }

  const lineColor = new Color(color);

  useThrottledFrame(() => {
    if (countLines < 1 || !linesRef.current || !geometryRef.current) return;

    const posArray = positionAttrRef.current.array;

    for (let i = 0; i < countLines; i++) {
      const mesh = labelRefs[i]?.current;
      const reveal = revealRefs[i]?.current ?? 0;
      const vertexStart = i * 6;

      if (!mesh || reveal <= 0) {
        // Zero-length segment at origin — WebGL draws nothing
        posArray[vertexStart] = 0;
        posArray[vertexStart + 1] = 0;
        posArray[vertexStart + 2] = 0;
        posArray[vertexStart + 3] = 0;
        posArray[vertexStart + 4] = 0;
        posArray[vertexStart + 5] = 0;
        continue;
      }

      // Label end — live animated position
      posArray[vertexStart] = mesh.position.x;
      posArray[vertexStart + 1] = mesh.position.y;
      posArray[vertexStart + 2] = mesh.position.z;

      // Center-pull end — lerped toward origin
      posArray[vertexStart + 3] = mesh.position.x * (1 - centerPullRatio);
      posArray[vertexStart + 4] = mesh.position.y * (1 - centerPullRatio);
      posArray[vertexStart + 5] = mesh.position.z * (1 - centerPullRatio);
    }

    positionAttrRef.current.needsUpdate = true;
    geometryRef.current.computeBoundingSphere();
  });

  if (countLines < 1) return null;

  return (
    <lineSegments ref={linesRef} geometry={geometryRef.current}>
      <lineBasicMaterial
        color={lineColor}
        transparent={true}
        opacity={opacity}
        linewidth={lineWidth}
        depthTest={false}
      />
    </lineSegments>
  );
};

export default Lines;
