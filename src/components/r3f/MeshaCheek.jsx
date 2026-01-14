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

    // Expose refs to parent component
    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    const c1 = new Color(color);
    const c2 = new Color("#ddddff").sub(c1);

    // Generate simple geometric textures based on typology
    const getTonalityTexture = (tonality, color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = `#${c1.getHexString()}`;
      ctx.lineWidth = 2;

      const tonalityScore = linguisticConfig.tonality.values[tonality]?.score;

      if (tonalityScore === 1) {
        // Non-tonal: straight horizontal lines
        for (let i = 16; i <= 48; i += 16) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(64, i);
          ctx.stroke();
        }
      } else {
        // Tonal: generate waves based on score
        const numWaves = Math.floor(tonalityScore);
        ctx.beginPath();
        for (let x = 0; x <= 64; x++) {
          let y = 32;
          for (let w = 0; w < numWaves; w++) {
            const frequency = (w + 1) * tonalityScore;
            const amplitude = 24 / (w + 1);
            y += Math.sin((x * Math.PI * frequency) / 16) * amplitude;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      return canvas;
    };

    const getMorphologyTexture = (morphology, color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = `#${c2.getHexString()}`;

      const score = linguisticConfig.morphology.values[morphology]?.score || 1;
      const numBlocks = Math.ceil(score * 1.5);
      const blockWidth = 64 / numBlocks;
      const overlap = (score - 1) / 3;

      for (let i = 0; i < numBlocks; i++) {
        const x = i * blockWidth * (1 - overlap * 0.3);
        const width = blockWidth * (1 + overlap * 0.2);
        const height = 16;
        const y = 24;

        if (overlap > 0.5) {
          ctx.globalAlpha = 0.5;
          ctx.fillRect(x + width * 0.2, y - 4, width * 0.8, height + 8);
          ctx.globalAlpha = 1.0;
        }

        ctx.fillRect(x, y, width * 0.9, height);
      }

      return canvas;
    };

    const tonalityTexture = useMemo(() => {
      if (!linguisticProperties?.tonality) return null;
      return getTonalityTexture(
        linguisticProperties.tonality,
        `#${c2.getHexString()}`
      );
    }, [linguisticProperties?.tonality, c2]);

    const morphologyTexture = useMemo(() => {
      if (!linguisticProperties?.morphology) return null;
      return getMorphologyTexture(
        linguisticProperties.morphology,
        `#${c1.getHexString()}`
      );
    }, [linguisticProperties?.morphology, c1]);

    const thickness = 0;

    return (
      <>
        {/* morphology */}
        <mesh
          ref={mesh2Ref}
          position={[-1, 1, thickness]}
          scale={[-1 / 2, 3 / 4, 3]}
          rotation={[0, -1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial
            side={2}
            map={
              morphologyTexture
                ? (() => {
                    const texture = new THREE.CanvasTexture(morphologyTexture);
                    texture.needsUpdate = true;
                    return texture;
                  })()
                : null
            }
          />
        </mesh>

        {/* tonality */}
        <mesh
          ref={mesh1Ref}
          position={[1, 1, thickness]}
          scale={[1 / 2, 2 / 3, 3]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial
            side={2}
            map={
              tonalityTexture
                ? (() => {
                    const texture = new THREE.CanvasTexture(tonalityTexture);
                    texture.needsUpdate = true;
                    return texture;
                  })()
                : null
            }
          />
        </mesh>
      </>
    );
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
