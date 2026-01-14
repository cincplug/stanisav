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

    const getWordOrderTexture = (wordOrder) => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Use the secondary color for background
      ctx.fillStyle = `#${secondaryColor.getHexString()}`;
      ctx.fillRect(0, 0, size, size);

      // Use darker/contrasting color for shapes - invert the secondary color
      const shapeColor = new Color(1, 1, 1).sub(secondaryColor);
      ctx.fillStyle = `#${shapeColor.getHexString()}`;

      // Define shapes for S, V, O
      const shapes = {
        S: (x, y, shapeSize) => {
          // Square for Subject
          ctx.fillRect(
            x - shapeSize / 2,
            y - shapeSize / 2,
            shapeSize,
            shapeSize
          );
        },
        V: (x, y, shapeSize) => {
          // Triangle for Verb
          ctx.beginPath();
          ctx.moveTo(x, y - shapeSize / 2);
          ctx.lineTo(x + shapeSize / 2, y + shapeSize / 2);
          ctx.lineTo(x - shapeSize / 2, y + shapeSize / 2);
          ctx.closePath();
          ctx.fill();
        },
        O: (x, y, shapeSize) => {
          // Circle for Object
          ctx.beginPath();
          ctx.arc(x, y, shapeSize / 2, 0, Math.PI * 2);
          ctx.fill();
        },
      };

      const order = wordOrder.split("");
      const spacing = size / (order.length + 1);
      const shapeSize = size / (order.length + 2);

      order.forEach((char, i) => {
        const x = spacing * (i + 1);
        const y = size / 2;
        if (shapes[char]) {
          shapes[char](x, y, shapeSize);
        }
      });

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

    const wordOrderTexture = useMemo(() => {
      if (!linguisticProperties?.wordOrder) return null;
      return getWordOrderTexture(linguisticProperties.wordOrder);
    }, [linguisticProperties?.wordOrder, colorObj, secondaryColor]);

    const morphologyTexture = useMemo(() => {
      if (!linguisticProperties?.morphology) return null;
      return getMorphologyTexture(linguisticProperties.morphology);
    }, [linguisticProperties?.morphology, colorObj, secondaryColor]);

    const createTexture = (canvas) => {
      if (!canvas) return null;
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    return (
      <>
        {/* Left cheek (morphology) */}
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
            color="#ffffff"
          />
        </mesh>

        {/* Right cheek (word order) */}
        <mesh
          ref={mesh1Ref}
          position={[1, 1, 0]}
          scale={[1 / 2, 3 / 4, 3]}
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
