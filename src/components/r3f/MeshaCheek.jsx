import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Color } from "three";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import linguisticConfig from "../../config/linguisticConfig.json";

extend({ ParametricGeometry });

const MeshaCheek = forwardRef(
  ({ color, linguisticProperties, audioReactiveSurface, segments }, ref) => {
    const mesh1Ref = useRef();
    const mesh2Ref = useRef();

    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    const colorObj = useMemo(() => new Color(color), [color]);
    const secondaryColor = useMemo(
      () => new Color("#ddddff").sub(colorObj),
      [colorObj]
    );

    const getTonalityTexture = (tonality) => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = `#${colorObj.getHexString()}`;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = `#${secondaryColor.getHexString()}`;
      ctx.lineWidth = 2;

      const tonalityScore = linguisticConfig.tonality.values[tonality]?.score;

      if (tonalityScore === 1) {
        for (let i = size / 4; i <= (size * 3) / 4; i += size / 4) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(size, i);
          ctx.stroke();
        }
      } else {
        const numWaves = Math.floor(tonalityScore);
        ctx.beginPath();
        for (let x = 0; x <= size; x++) {
          let y = size / 2;
          for (let w = 0; w < numWaves; w++) {
            const frequency = (w + 1) * tonalityScore;
            const amplitude = (size * 0.375) / (w + 1);
            y += Math.sin((x * Math.PI * frequency) / (size / 4)) * amplitude;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      return canvas;
    };

    const getMorphologyTexture = (morphology) => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = `#${secondaryColor.getHexString()}`;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = `#${colorObj.getHexString()}`;

      const score = linguisticConfig.morphology.values[morphology]?.score || 1;
      const numBlocks = Math.ceil(score * 1.5);
      const blockWidth = size / numBlocks;
      const overlap = (score - 1) / 3;
      const blockHeight = size / 4;
      const blockY = size * 0.375;

      for (let i = 0; i < numBlocks; i++) {
        const x = i * blockWidth * (1 - overlap * 0.3);
        const width = blockWidth * (1 + overlap * 0.2);

        if (overlap > 0.5) {
          ctx.globalAlpha = 0.5;
          ctx.fillRect(
            x + width * 0.2,
            blockY - 4,
            width * 0.8,
            blockHeight + 8
          );
          ctx.globalAlpha = 1.0;
        }

        ctx.fillRect(x, blockY, width * 0.9, blockHeight);
      }

      return canvas;
    };

    const tonalityTexture = useMemo(() => {
      if (!linguisticProperties?.tonality) return null;
      return getTonalityTexture(linguisticProperties.tonality);
    }, [linguisticProperties?.tonality, colorObj, secondaryColor]);

    const morphologyTexture = useMemo(() => {
      if (!linguisticProperties?.morphology) return null;
      return getMorphologyTexture(linguisticProperties.morphology);
    }, [linguisticProperties?.morphology, colorObj, secondaryColor]);

    const createTexture = (canvas) => {
      if (!canvas) return null;
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    return (
      <>
        <mesh
          ref={mesh2Ref}
          position={[-1, 1, 0]}
          scale={[-1 / 2, 3 / 4, 3]}
          rotation={[0, -1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial
            side={2}
            map={createTexture(morphologyTexture)}
          />
        </mesh>

        <mesh
          ref={mesh1Ref}
          position={[1, 1, 0]}
          scale={[1 / 2, 2 / 3, 3]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial side={2} map={createTexture(tonalityTexture)} />
        </mesh>
      </>
    );
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
