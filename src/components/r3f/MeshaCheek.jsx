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

    // For morphology cheek (left)
    const morphBgColor = secondaryColor;
    const morphFgColor = colorObj;

    // For word order cheek (right), swap colors
    const wordOrderBgColor = colorObj;
    const wordOrderFgColor = secondaryColor;

    const getMorphologyTexture = (morphology) => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = `#${morphBgColor.getHexString()}`;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = `#${morphFgColor.getHexString()}`;

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

    // New: Word order text texture, repeated
    const getWordOrderTextTexture = (wordOrder) => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = `#${wordOrderBgColor.getHexString()}`;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = `#${wordOrderFgColor.getHexString()}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const text = wordOrder.toLowerCase();
      const step = size / 4;
      for (let y = 0; y < size; y += step) {
        for (let x = step; x < size; x += step) {
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(-1, 1);
          ctx.rotate(-Math.PI / 2); // 90 degrees
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }

      return canvas;
    };

    const morphologyTexture = useMemo(() => {
      if (!linguisticProperties?.morphology) return null;
      return getMorphologyTexture(linguisticProperties.morphology);
    }, [linguisticProperties?.morphology, morphBgColor, morphFgColor]);

    const wordOrderTexture = useMemo(() => {
      if (!linguisticProperties?.wordOrder) return null;
      return getWordOrderTextTexture(linguisticProperties.wordOrder);
    }, [linguisticProperties?.wordOrder, wordOrderBgColor, wordOrderFgColor]);

    const createTexture = (canvas) => {
      if (!canvas) return null;
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    return (
      <>
        {/* Left cheek (morphology) */}
        <mesh
          ref={mesh2Ref}
          position={[-1, 1, 1]}
          scale={[-1 / 2, 3 / 4, 1]}
          rotation={[0, -1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial
            side={2}
            map={createTexture(morphologyTexture)}
            color="#ffffff"
          />
        </mesh>

        {/* Right cheek (word order, uses swapped colors and text) */}
        <mesh
          ref={mesh1Ref}
          position={[1, 1, 1]}
          scale={[1 / 2, 3 / 4, 1]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial
            side={2}
            map={createTexture(wordOrderTexture)}
            color="#ffffff"
          />
        </mesh>
      </>
    );
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
